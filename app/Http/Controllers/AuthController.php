<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Throwable;

class AuthController extends Controller
{
    /**
     * Show the login page (for Super Admin & Partners).
     */
    public function showLogin(): Response
    {
        return Inertia::render('Website/Login');
    }

    /**
     * Handle an incoming authentication request for Super Admin or Partner.
     */
    public function login(Request $request): SymfonyResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $email = strtolower(trim($credentials['email']));
        $password = $credentials['password'];
        $remember = $request->boolean('remember');

        // 1. Try authenticating against the database
        try {
            if (Schema::hasTable('users')) {
                $hasRole = Schema::hasColumn('users', 'role');

                // Auto-provision the default Super Admin if not yet seeded in DB
                if ($email === 'jux@ravu.com' && ! User::where('email', 'jux@ravu.com')->exists()) {
                    $attrs = [
                        'name' => 'Jux (Super Admin)',
                        'email' => 'jux@ravu.com',
                        'password' => Hash::make('password'),
                        'email_verified_at' => now(),
                    ];
                    if ($hasRole) {
                        $attrs['role'] = 'super_admin';
                    }
                    User::create($attrs);
                }

                // Auto-provision the default Partner (chid@total.com) if not yet seeded in DB
                if (in_array($email, ['chid@total.com', 'partner@ravu.com'], true) && ! User::where('email', $email)->exists()) {
                    $attrs = [
                        'name' => 'Chid (TotalEnergies Partner)',
                        'email' => $email,
                        'password' => Hash::make('password'),
                        'email_verified_at' => now(),
                    ];
                    if ($hasRole) {
                        $attrs['role'] = 'partner';
                    }
                    User::create($attrs);
                }

                if (Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
                    $request->session()->regenerate();

                    /** @var User $user */
                    $user = Auth::user();
                    $role = $user->isSuperAdmin() ? 'super_admin' : ($user->role ?? 'partner');

                    // Only Super Admin and Partner can log in on the web platform
                    if (! in_array($role, ['super_admin', 'partner'], true)) {
                        Auth::logout();
                        throw ValidationException::withMessages([
                            'email' => 'Web portal access is restricted to RAVU Partners and Super Admins. Riders use the RAVU mobile app.',
                        ]);
                    }

                    $request->session()->put('authenticated_user', [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $role,
                    ]);

                    $targetUrl = $role === 'super_admin' ? '/super-admin' : '/partner-dashboard';

                    return redirect()->to($targetUrl)->with('success', $role === 'super_admin'
                        ? 'Welcome back, Super Admin!'
                        : 'Welcome back to your Partner Dashboard!');
                }
            }
        } catch (ValidationException $ve) {
            throw $ve;
        } catch (Throwable $e) {
            // Database not running or not migrated yet — fall through to session/seeded fallback
        }

        // 2. Fallback check for Super Admin (jux@ravu.com / password)
        if ($email === 'jux@ravu.com' && $password === 'password') {
            $request->session()->put('authenticated_user', [
                'id' => 1,
                'name' => 'Jux (Super Admin)',
                'email' => 'jux@ravu.com',
                'role' => 'super_admin',
            ]);

            return redirect()->to('/super-admin')->with('success', 'Welcome back, Super Admin!');
        }

        // 3. Fallback check for Partner (chid@total.com / password)
        if (in_array($email, ['chid@total.com', 'partner@ravu.com'], true) && $password === 'password') {
            $request->session()->put('authenticated_user', [
                'id' => 2,
                'name' => 'Chid (TotalEnergies Partner)',
                'email' => $email,
                'role' => 'partner',
                'category' => 'Fuel & Energy Station',
                'phone' => '+255 754 200 100',
            ]);

            return redirect()->to('/partner-dashboard')->with('success', 'Welcome back to your Partner Dashboard!');
        }

        // 4. Check session-registered partners (when DB is offline)
        $registeredPartners = $request->session()->get('registered_partners', []);
        if (isset($registeredPartners[$email]) && Hash::check($password, $registeredPartners[$email]['password'])) {
            $partnerData = $registeredPartners[$email];
            $request->session()->put('authenticated_user', [
                'id' => $partnerData['id'] ?? rand(100, 999),
                'name' => $partnerData['name'],
                'email' => $partnerData['email'],
                'role' => 'partner',
                'category' => $partnerData['category'] ?? 'Business Partner',
                'phone' => $partnerData['phone'] ?? '',
            ]);

            return redirect()->to('/partner-dashboard')->with('success', 'Welcome back to your Partner Dashboard!');
        }

        throw ValidationException::withMessages([
            'email' => 'Invalid email or password. Only registered RAVU Partners and Super Admins can sign in here.',
        ]);
    }

    /**
     * Handle Partner registration and redirect straight to Partner Dashboard.
     */
    public function register(Request $request): SymfonyResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'category' => ['nullable', 'string', 'max:100'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $email = strtolower(trim($validated['email']));
        $name = trim($validated['name']);
        $phone = trim($validated['phone'] ?? '');
        $category = trim($validated['category'] ?? 'Business Partner');

        if ($email === 'jux@ravu.com') {
            throw ValidationException::withMessages([
                'email' => 'This email is reserved for the Super Admin account. Please sign in directly.',
            ]);
        }

        $userRecord = null;

        try {
            if (Schema::hasTable('users')) {
                if (User::where('email', $email)->exists()) {
                    throw ValidationException::withMessages([
                        'email' => 'A partner account with this email already exists. Please sign in instead.',
                    ]);
                }

                $attrs = [
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make($validated['password']),
                    'email_verified_at' => now(),
                ];

                if (Schema::hasColumn('users', 'role')) {
                    $attrs['role'] = 'partner';
                }

                $userRecord = User::create($attrs);
                Auth::login($userRecord, true);
                $request->session()->regenerate();
            }
        } catch (ValidationException $ve) {
            throw $ve;
        } catch (Throwable $e) {
            // Fallback to session storage if MySQL is not migrated/running
        }

        $registeredPartners = $request->session()->get('registered_partners', []);
        $registeredPartners[$email] = [
            'id' => $userRecord?->id ?? rand(100, 999),
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'category' => $category,
            'password' => Hash::make($validated['password']),
            'role' => 'partner',
        ];
        $request->session()->put('registered_partners', $registeredPartners);

        $request->session()->put('authenticated_user', [
            'id' => $userRecord?->id ?? $registeredPartners[$email]['id'],
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'category' => $category,
            'role' => 'partner',
        ]);

        return redirect()->to('/partner-dashboard')->with('success', 'Partner account created! Welcome to your RAVU Partner Dashboard.');
    }

    /**
     * Log the user out of the application.
     */
    public function logout(Request $request): RedirectResponse
    {
        try {
            Auth::logout();
        } catch (Throwable $e) {
            // Ignore if DB session driver isn't active
        }

        $request->session()->forget(['authenticated_user', 'super_admin_user']);

        return redirect('/login')->with('success', 'You have been signed out.');
    }
}
