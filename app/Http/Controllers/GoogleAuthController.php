<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\LoginProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Throwable;

/**
 * Google OAuth 2.0 / OpenID Connect sign-in for Partners and Super Admins.
 */
class GoogleAuthController extends Controller
{
    private const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';

    private const USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

    /**
     * Send the user to Google's consent screen.
     */
    public function redirect(Request $request): RedirectResponse
    {
        $clientId = config('services.google.client_id');

        if (! $clientId || ! config('services.google.client_secret')) {
            return redirect('/login')->withErrors([
                'email' => 'Google sign-in is not configured yet. Please use your email and password.',
            ]);
        }

        $state = Str::random(40);
        $request->session()->put('google_oauth_state', $state);

        $params = [
            'client_id' => $clientId,
            'redirect_uri' => $this->redirectUri($request),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'access_type' => 'online',
            'include_granted_scopes' => 'true',
        ];

        // Pre-select the remembered account; otherwise let the user choose.
        $hint = $request->query('login_hint') ?: LoginProfile::read($request)['email'] ?? null;
        if ($hint && filter_var($hint, FILTER_VALIDATE_EMAIL)) {
            $params['login_hint'] = $hint;
        } else {
            $params['prompt'] = 'select_account';
        }

        return redirect()->away(self::AUTH_URL.'?'.http_build_query($params));
    }

    /**
     * Handle Google's redirect back to the app.
     */
    public function callback(Request $request): RedirectResponse
    {
        $expectedState = $request->session()->pull('google_oauth_state');

        if ($request->filled('error')) {
            return $this->fail($request->query('error') === 'access_denied'
                ? 'Google sign-in was cancelled.'
                : 'Google sign-in failed. Please try again.');
        }

        if (! $expectedState || ! hash_equals($expectedState, (string) $request->query('state'))) {
            return $this->fail('Your Google sign-in session expired. Please try again.');
        }

        if (! $request->filled('code')) {
            return $this->fail('Google did not return an authorization code.');
        }

        try {
            $token = Http::asForm()->timeout(15)->post(self::TOKEN_URL, [
                'code' => $request->query('code'),
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'redirect_uri' => $this->redirectUri($request),
                'grant_type' => 'authorization_code',
            ]);

            if ($token->failed() || ! $token->json('access_token')) {
                report(new \RuntimeException('Google token exchange failed: '.$token->body()));

                return $this->fail('Could not verify your Google account. Please try again.');
            }

            $profile = Http::withToken($token->json('access_token'))
                ->timeout(15)
                ->get(self::USERINFO_URL);

            if ($profile->failed()) {
                return $this->fail('Could not read your Google profile. Please try again.');
            }
        } catch (Throwable $e) {
            report($e);

            return $this->fail('Unable to reach Google right now. Please use your email and password.');
        }

        $googleId = (string) $profile->json('sub');
        $email = strtolower((string) $profile->json('email'));
        $name = (string) ($profile->json('name') ?: $email);
        $avatar = $profile->json('picture');

        if (! $googleId || ! $email || ! $profile->json('email_verified')) {
            return $this->fail('Your Google account email is not verified.');
        }

        $user = null;
        $hasGoogleId = false;

        try {
            if (Schema::hasTable('users')) {
                $hasGoogleId = Schema::hasColumn('users', 'google_id');

                $user = ($hasGoogleId ? User::where('google_id', $googleId)->first() : null)
                    ?? User::where('email', $email)->first();
            }
        } catch (Throwable $e) {
            $user = null;
        }

        // If user does not exist yet, auto-provision as Super Admin (if authorized) or Partner
        if (! $user) {
            $isAdminEmail = in_array($email, ['ravu.limited@gmail.com', 'jux@ravu.com'], true);
            $role = $isAdminEmail ? 'super_admin' : 'partner';

            try {
                if (Schema::hasTable('users')) {
                    $attrs = [
                        'name' => $name,
                        'email' => $email,
                        'password' => Hash::make(Str::random(32)),
                        'email_verified_at' => now(),
                    ];
                    if (Schema::hasColumn('users', 'role')) {
                        $attrs['role'] = $role;
                    }
                    if ($hasGoogleId) {
                        $attrs['google_id'] = $googleId;
                    }
                    if (Schema::hasColumn('users', 'avatar') && $avatar) {
                        $attrs['avatar'] = $avatar;
                    }
                    $user = User::create($attrs);
                }
            } catch (Throwable $e) {
                // If DB is offline, fall through to session user
            }

            if (! $user) {
                $user = [
                    'id' => rand(100, 999),
                    'name' => $name,
                    'email' => $email,
                    'avatar' => $avatar,
                    'role' => $role,
                ];
            }
        }

        $role = $user instanceof User ? $user->portalRole() : ($user['role'] ?? 'partner');

        if ($user instanceof User) {
            $updates = [];
            if ($hasGoogleId && ! $user->google_id) {
                $updates['google_id'] = $googleId;
            }
            if (Schema::hasColumn('users', 'avatar') && $avatar && ! $user->avatar) {
                $updates['avatar'] = $avatar;
            }
            if (! $user->email_verified_at) {
                $updates['email_verified_at'] = now();
            }
            if ($updates) {
                $user->forceFill($updates)->save();
            }

            Auth::login($user, true);
        }

        $request->session()->regenerate();

        $sessionPayload = [
            'id' => $user instanceof User ? $user->id : $user['id'],
            'name' => $user instanceof User ? $user->name : $user['name'],
            'email' => $user instanceof User ? $user->email : $user['email'],
            'avatar' => ($user instanceof User ? $user->avatar : $user['avatar']) ?? $avatar,
            'role' => $role,
        ];

        $request->session()->put('authenticated_user', $sessionPayload);

        LoginProfile::capture($request, $user, 'google');

        $destination = LoginProfile::homeFor($role);

        return redirect()->to($destination)->with('success', $role === 'super_admin'
            ? 'Signed in with Google. Welcome back, Super Admin!'
            : 'Signed in with Google. Welcome back to your Partner Dashboard!');
    }

    private function redirectUri(?Request $request = null): string
    {
        $uri = (string) config('services.google.redirect');

        if (Str::startsWith($uri, ['http://', 'https://'])) {
            return $uri;
        }

        $request = $request ?: request();

        return $request ? $request->root().'/'.ltrim($uri, '/') : url($uri);
    }

    private function fail(string $message): RedirectResponse
    {
        return redirect('/login')->withErrors(['email' => $message]);
    }
}
