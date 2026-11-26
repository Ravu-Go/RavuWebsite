<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Partner;
use App\Models\PartnerApplication;
use App\Models\PartnerApplicationStatusHistory;
use App\Models\PartnerAuditLog;
use App\Models\PartnerCategory;
use App\Models\User;
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
        $validated = $request->validate([
            'business_name' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'string', 'max:120'],
            'name' => ['required', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:50'],
            'preferred_communication' => ['nullable', 'in:email,phone,whatsapp'],
            'password' => ['required', 'confirmed', PasswordRule::min(6)],
            'terms' => ['required', 'accepted'],
            'privacy' => ['required', 'accepted'],
        ]);

        $user = DB::transaction(function () use ($validated, $request) {
            $now = now();
            $user = User::create([
                'name' => trim($validated['name']),
                'position' => trim($validated['position'] ?? 'Partner Representative'),
                'email' => strtolower(trim($validated['email'])),
                'phone' => trim($validated['phone']),
                'preferred_communication' => $validated['preferred_communication'] ?? 'whatsapp',
                'password' => Hash::make($validated['password']),
                'role' => 'partner',
                'terms_accepted_at' => $now,
                'privacy_accepted_at' => $now,
                'terms_version' => config('partner.terms_version', 'v1'),
                'privacy_version' => config('partner.privacy_version', 'v1'),
            ]);

            $registeredName = ! empty($validated['business_name'])
                ? trim($validated['business_name'])
                : trim($validated['name']);

            $categoryId = null;
            $categoryName = trim((string) ($validated['category_id'] ?? ''));
            if ($categoryName !== '') {
                $category = ctype_digit($categoryName)
                    ? PartnerCategory::find((int) $categoryName)
                    : null;

                if (! $category) {
                    $category = PartnerCategory::whereRaw('LOWER(name) = ?', [Str::lower($categoryName)])->first();
                }

                if (! $category) {
                    $baseSlug = Str::slug($categoryName) ?: 'business';
                    $slug = $baseSlug;
                    $suffix = 2;
                    while (PartnerCategory::where('slug', $slug)->exists()) {
                        $slug = $baseSlug.'-'.$suffix++;
                    }

                    $category = PartnerCategory::create(['name' => $categoryName, 'slug' => $slug]);
                }

                $categoryId = $category->id;
            }

            $partner = Partner::create([
                'registered_name' => $registeredName,
                'trading_name' => $registeredName,
                'partner_category_id' => $categoryId,
                'status' => 'onboarding',
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
}
