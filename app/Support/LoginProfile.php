<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Schema;
use Throwable;

/**
 * Captures the signed-in user's profile so the next visit to /login can
 * greet them ("Continue as …") and pre-select their sign-in method.
 *
 * The profile is stored in an encrypted, HTTP-only cookie (it survives
 * logout on purpose) and, when the columns exist, on the users table.
 */
class LoginProfile
{
    public const COOKIE = 'ravu_last_profile';

    public const MINUTES = 60 * 24 * 30; // 30 days

    /**
     * Record a successful login for the given user.
     *
     * @param  User|array{name:string,email:string,role?:string,avatar?:string|null}  $user
     */
    public static function capture(Request $request, User|array $user, string $provider = 'password'): void
    {
        $profile = $user instanceof User
            ? [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar ?? null,
                'role' => $user->portalRole(),
            ]
            : [
                'name' => $user['name'],
                'email' => $user['email'],
                'avatar' => $user['avatar'] ?? null,
                'role' => $user['role'] ?? 'partner',
            ];

        $profile['provider'] = $provider;
        $profile['last_login_at'] = now()->toIso8601String();

        if ($user instanceof User) {
            self::persist($request, $user, $provider);
        }

        Cookie::queue(Cookie::make(
            self::COOKIE,
            json_encode($profile),
            self::MINUTES,
            null,
            null,
            $request->isSecure(),
            true,
            false,
            'lax',
        ));
    }

    /**
     * Read the remembered profile from the request, if any.
     */
    public static function read(Request $request): ?array
    {
        $raw = $request->cookie(self::COOKIE);
        if (! is_string($raw) || $raw === '') {
            return null;
        }

        $data = json_decode($raw, true);
        if (! is_array($data) || empty($data['email'])) {
            return null;
        }

        return [
            'name' => (string) ($data['name'] ?? ''),
            'email' => (string) $data['email'],
            'avatar' => $data['avatar'] ?? null,
            'role' => $data['role'] ?? 'partner',
            'provider' => in_array($data['provider'] ?? null, ['google', 'password'], true) ? $data['provider'] : 'password',
            'last_login_at' => $data['last_login_at'] ?? null,
        ];
    }

    /**
     * Forget the remembered profile ("Not you?").
     */
    public static function forget(): void
    {
        Cookie::queue(Cookie::forget(self::COOKIE));
    }

    /**
     * Where a user with the given role should land after signing in.
     */
    public static function homeFor(string $role): string
    {
        return match ($role) {
            'super_admin' => '/super-admin',
            'partner_reviewer' => '/partner-management',
            default => '/partner-dashboard',
        };
    }

    private static function persist(Request $request, User $user, string $provider): void
    {
        try {
            $updates = [];
            if (Schema::hasColumn('users', 'last_login_at')) {
                $updates['last_login_at'] = now();
            }
            if (Schema::hasColumn('users', 'last_login_provider')) {
                $updates['last_login_provider'] = $provider;
            }
            if (Schema::hasColumn('users', 'last_login_ip')) {
                $updates['last_login_ip'] = $request->ip();
            }

            if ($updates) {
                $user->forceFill($updates)->saveQuietly();
            }
        } catch (Throwable $e) {
            // Profile capture must never block a login.
            report($e);
        }
    }
}
