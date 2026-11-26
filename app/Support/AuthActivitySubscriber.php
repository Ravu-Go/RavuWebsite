<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Verified;
use Illuminate\Events\Dispatcher;

/**
 * Records every authentication event in the activity log from Laravel's own auth
 * events, so sign-ins are captured however they happen (password, Google, new
 * account, or a remembered session) and never twice.
 *
 * Kept outside app/Listeners so event discovery doesn't register it a second time.
 */
class AuthActivitySubscriber
{
    public function subscribe(Dispatcher $events): array
    {
        return [
            Login::class => 'handleLogin',
            Logout::class => 'handleLogout',
            Failed::class => 'handleFailed',
            PasswordReset::class => 'handlePasswordReset',
            Verified::class => 'handleVerified',
        ];
    }

    public function handleLogin(Login $event): void
    {
        $method = match (request()?->route()?->getName()) {
            'login.submit' => 'password',
            'auth.google.callback' => 'google',
            'register.submit' => 'new account',
            default => $event->remember ? 'remembered session' : 'session',
        };

        $this->record('signed_in', $event->user, ['method' => $method, 'remember' => $event->remember ? 'yes' : null]);
    }

    public function handleLogout(Logout $event): void
    {
        if ($event->user) {
            $this->record('signed_out', $event->user);
        }
    }

    public function handleFailed(Failed $event): void
    {
        // Only the email is kept; the attempted password never reaches the log.
        $email = strtolower(trim((string) ($event->credentials['email'] ?? '')));

        $this->record('sign_in_failed', $event->user, [
            'email' => $email,
            'attempt' => $this->recentFailures($email, $event->user) + 1,
        ]);
    }

    public function handlePasswordReset(PasswordReset $event): void
    {
        $this->record('password_reset', $event->user);
    }

    public function handleVerified(Verified $event): void
    {
        $this->record('email_verified', $event->user);
    }

    /** Failed attempts for this email in the last hour, since its last successful sign-in. */
    private function recentFailures(string $email, $user): int
    {
        if ($email === '') {
            return 0;
        }

        $since = now()->subHour();
        if ($user instanceof User) {
            $lastSuccess = ActivityLog::where('user_id', $user->id)->where('action', 'signed_in')->max('created_at');
            if ($lastSuccess && $lastSuccess > $since) {
                $since = $lastSuccess;
            }
        }

        return ActivityLog::where('action', 'sign_in_failed')
            ->where('details->email', $email)
            ->where('created_at', '>', $since)
            ->count();
    }

    private function record(string $action, $user, array $details = []): void
    {
        ActivityLog::record('auth', $action, $details, user: $user instanceof User ? $user : null);
    }
}
