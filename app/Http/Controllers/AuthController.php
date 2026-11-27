<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Partner;
use App\Models\PartnerApplication;
use App\Models\PartnerApplicationStatusHistory;
use App\Models\PartnerAuditLog;
use App\Models\PartnerCategory;
use App\Models\User;
use App\Services\RavuApp\AppDatabase;
use App\Support\RavuAppAccounts;
use App\Support\LoginProfile;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class AuthController extends Controller
{
    public function showLogin(): Response
    {
        return Inertia::render('Website/Login', ['status' => session('status')]);
    }

    public function login(Request $request): SymfonyResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $credentials['email'] = strtolower(trim($credentials['email']));

        // Check the password first, then portal access, and only then start a session, so an
        // account without access is recorded as "denied" rather than a sign-in followed by a sign-out.
        if (! Auth::validate($credentials)) {
            event(new Failed('web', Auth::getLastAttempted(), $credentials));
            throw ValidationException::withMessages(['email' => 'These credentials do not match our records.']);
        }

        /** @var User $user */
        $user = Auth::getLastAttempted();
        $role = $user->portalRole();

        if (! $user->isActiveAccount()) {
            ActivityLog::record('auth', 'sign_in_denied', ['email' => $user->email, 'reason' => 'Account is not active'], user: $user);
            throw ValidationException::withMessages(['email' => 'This account is not active. Contact RAVU support.']);
        }

        if (! in_array($role, ['partner', 'partner_reviewer', 'super_admin'], true)
            || ($role === 'partner' && ! $user->partners()->exists())) {
            ActivityLog::record('auth', 'sign_in_denied', ['email' => $user->email, 'reason' => 'No partner portal access'], user: $user);
            throw ValidationException::withMessages(['email' => 'This account does not have RAVU Partner Portal access.']);
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();
        LoginProfile::capture($request, $user, 'password');

        return redirect()->to(LoginProfile::homeFor($role))->with('success', 'Welcome back to the RAVU Partner Portal.');
    }

    public function register(Request $request): RedirectResponse
    {
        // Fields follow the RAVU app's partner record (name, category, address, phone,
        // optional location) plus the contact person who signs in.
        $validated = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:255'],
            'business_phone' => ['nullable', 'string', 'max:50'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitude'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
            'name' => ['required', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'preferred_communication' => ['nullable', 'in:email,phone,whatsapp'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
            'terms' => ['required', 'accepted'],
            'privacy' => ['required', 'accepted'],
        ], [
            'business_name.required' => 'Enter your business name.',
            'category_id.required' => 'Choose or type your business category.',
            'address.required' => 'Enter your business address.',
        ]);

        $email = strtolower(trim($validated['email']));
        $phone = $this->appPhone($validated['phone']);
        $businessPhone = filled($validated['business_phone'] ?? null) ? $this->appPhone($validated['business_phone']) : $phone;

        $errors = [];
        if (! $phone) {
            $errors['phone'] = 'Enter a Tanzanian mobile number, e.g. 0712 345 678.';
        } elseif (User::where('phone', $phone)->exists()) {
            $errors['phone'] = 'This phone number already has a RAVU account. Sign in, or use another number.';
        }
        if (! $businessPhone) {
            $errors['business_phone'] = 'Enter a Tanzanian phone number, e.g. 0712 345 678.';
        }
        if (User::whereRaw('LOWER(email) = ?', [$email])->exists()) {
            $errors['email'] = 'This email already has a RAVU account. Sign in instead.';
        }
        if ($errors) {
            throw ValidationException::withMessages($errors);
        }

        $user = DB::transaction(function () use ($validated, $request, $email, $phone, $businessPhone) {
            $now = now();
            $shared = RavuAppAccounts::shared();
            $preferred = $validated['preferred_communication'] ?? 'whatsapp';

            $user = new User;
            $user->forceFill(array_merge([
                'name' => trim($validated['name']),
                'position' => trim($validated['position'] ?? '') ?: 'Partner Representative',
                'email' => $email,
                'phone' => $phone,
                'preferred_communication' => $preferred,
                'password' => Hash::make($validated['password']),
                'role' => $shared ? config('ravu_app.partner_role', 'partner') : 'partner',
                'terms_accepted_at' => $now,
                'privacy_accepted_at' => $now,
                'terms_version' => config('partner.terms_version', 'v1'),
                'privacy_version' => config('partner.privacy_version', 'v1'),
            ], $shared ? [
                // Columns the RAVU app's users table has beyond Laravel's defaults.
                'status' => 'active',
                'whatsapp_opt_in' => $preferred === 'whatsapp',
            ] : []))->save();

            $registeredName = trim($validated['business_name']);
            $category = $this->resolveCategory(trim($validated['category_id']));
            $location = [
                'address' => trim($validated['address']),
                'phone' => $businessPhone,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
            ];

            // The RAVU app's own partner directory: a draft for staff to verify in the app.
            $appPartnerId = $shared ? DB::table(config('ravu_app.partners_table', 'public.partners'))->insertGetId([
                'name' => $registeredName,
                'category' => $category->name,
                ...$location,
                'status' => 'draft',
                'created_by' => $user->id,
                'updated_by' => $user->id,
                'created_at' => $now,
                'updated_at' => $now,
            ]) : null;

            $partner = Partner::create([
                'registered_name' => $registeredName,
                'trading_name' => $registeredName,
                'partner_category_id' => $category->id,
                'status' => 'onboarding',
                'app_partner_id' => $appPartnerId,
                ...$location,
            ]);
            $partner->users()->attach($user->id, ['role' => 'owner']);
            $application = PartnerApplication::create(['partner_id' => $partner->id, 'status' => 'draft']);
            PartnerApplicationStatusHistory::create([
                'partner_application_id' => $application->id,
                'new_status' => 'draft',
                'changed_by' => $user->id,
                'comment' => 'Partner account created.',
            ]);
            PartnerAuditLog::create([
                'partner_id' => $partner->id,
                'user_id' => $user->id,
                'action' => 'account_registered',
                'subject_type' => PartnerApplication::class,
                'subject_id' => $application->id,
                'ip_address' => $request->ip(),
            ]);

            return $user;
        });

        event(new Registered($user));
        Auth::login($user);
        $request->session()->regenerate();
        LoginProfile::capture($request, $user, 'password');

        return redirect()->to('/partner-dashboard')->with('success', 'Partner account created! Welcome to your RAVU Partner Portal.');
    }

    public function showForgotPassword(): Response
    {
        return Inertia::render('Website/ForgotPassword', ['status' => session('status')]);
    }

    public function sendResetLink(Request $request): RedirectResponse
    {
        $request->validate(['email' => ['required', 'email']]);
        $email = strtolower(trim($request->string('email')->toString()));
        $status = Password::sendResetLink(['email' => $email]);
        ActivityLog::record('auth', 'password_reset_requested', [
            'email' => $email,
            'outcome' => $status === Password::RESET_LINK_SENT ? 'Link sent' : __($status),
        ], user: User::firstWhere('email', $email));

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages(['email' => __($status)]);
        }

        return back()->with('status', __($status));
    }

    public function showResetPassword(Request $request, string $token): Response
    {
        return Inertia::render('Website/ResetPassword', [
            'email' => $request->query('email'),
            'token' => $token,
        ]);
    }

    public function resetPassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(12)->letters()->numbers()],
        ]);

        $status = Password::reset($validated, function (User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password),
                'remember_token' => Str::random(60),
            ])->save();
            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => __($status)]);
        }

        return redirect()->route('login')->with('status', __($status));
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login')->with('success', 'You have been signed out.');
    }

    public function forgetProfile(): RedirectResponse
    {
        LoginProfile::forget();

        return redirect('/login');
    }

    /** The RAVU app stores phones as E.164 (+255…); other numbers are kept as typed outside shared mode. */
    private function appPhone(string $value): ?string
    {
        $normalised = AppDatabase::phone($value);
        if ($normalised || RavuAppAccounts::shared()) {
            return $normalised;
        }

        return trim($value) !== '' ? trim($value) : null;
    }

    /** A category picked from the list (by id) or typed in (matched by name, else created). */
    private function resolveCategory(string $value): PartnerCategory
    {
        $category = ctype_digit($value) ? PartnerCategory::find((int) $value) : null;
        $category ??= PartnerCategory::whereRaw('LOWER(name) = ?', [Str::lower($value)])->first();

        if ($category) {
            return $category;
        }

        $baseSlug = Str::slug($value) ?: 'business';
        $slug = $baseSlug;
        $suffix = 2;
        while (PartnerCategory::where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$suffix++;
        }

        return PartnerCategory::create(['name' => $value, 'slug' => $slug]);
    }
}
