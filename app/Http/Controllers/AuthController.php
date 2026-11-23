<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use App\Models\PartnerApplication;
use App\Models\PartnerApplicationStatusHistory;
use App\Models\PartnerAuditLog;
use App\Models\PartnerCategory;
use App\Models\User;
use App\Support\LoginProfile;
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
        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages(['email' => 'These credentials do not match our records.']);
        }

        $request->session()->regenerate();
        /** @var User $user */
        $user = Auth::user();
        $role = $user->portalRole();

        if (! in_array($role, ['partner', 'partner_reviewer', 'super_admin'], true)
            || ($role === 'partner' && ! $user->partners()->exists())) {
            Auth::logout();
            throw ValidationException::withMessages(['email' => 'This account does not have RAVU Partner Portal access.']);
        }

        LoginProfile::capture($request, $user, 'password');

        return redirect()->to(LoginProfile::homeFor($role))->with('success', 'Welcome back to the RAVU Partner Portal.');
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'business_name' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable'],
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
            if (! empty($validated['category_id']) && is_numeric($validated['category_id'])) {
                $exists = PartnerCategory::whereKey($validated['category_id'])->exists();
                if ($exists) {
                    $categoryId = (int) $validated['category_id'];
                }
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
        $status = Password::sendResetLink(['email' => strtolower(trim($request->string('email')->toString()))]);

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
