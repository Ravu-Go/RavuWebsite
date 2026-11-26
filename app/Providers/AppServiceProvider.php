<?php

namespace App\Providers;

use App\Contracts\MemberDirectory;
use App\Contracts\MembershipRevenueSource;
use App\Models\ActivityLog;
use App\Models\User;
use App\Services\Membership\ApiMembershipRevenueSource;
use App\Services\Membership\DemoMembershipRevenueSource;
use App\Services\Members\ApiMemberDirectory;
use App\Services\Members\DemoMemberDirectory;
use App\Support\AuthActivitySubscriber;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Membership revenue: sample payments until the memberships API is connected,
        // generated for the plans in the admin catalogue (or the config fallback).
        $this->app->bind(MembershipRevenueSource::class, function () {
            if (config('membership.revenue_source') === 'api') {
                return new ApiMembershipRevenueSource((array) config('membership.api'));
            }
            try {
                $plans = app(\App\Services\MembershipPlanService::class)->revenuePlans();
            } catch (\Throwable) {
                $plans = []; // Plans table not migrated yet.
            }

            return new DemoMembershipRevenueSource($plans ?: (array) config('membership.demo_plans'));
        });

        // Member lookups for the partner verifier: sample members until the mobile app API is live.
        $this->app->bind(MemberDirectory::class, fn () => config('membership.member_source') === 'api'
            ? new ApiMemberDirectory((array) config('membership.api'))
            : new DemoMemberDirectory(app(MembershipRevenueSource::class)));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::subscribe(AuthActivitySubscriber::class);

        // Too many sign-in attempts: record the lockout and explain the wait instead of a bare 429 page.
        RateLimiter::for('login', fn (Request $request) => [
            Limit::perMinute(5)
                ->by(strtolower((string) $request->input('email')).'|'.$request->ip())
                ->response(function (Request $request, array $headers) {
                    $email = strtolower(trim((string) $request->input('email')));
                    $wait = (int) ($headers['Retry-After'] ?? 60);
                    ActivityLog::record('auth', 'sign_in_locked_out', ['email' => $email, 'retry_after' => $wait], user: User::firstWhere('email', $email));

                    return back()->withErrors(['email' => "Too many sign-in attempts. Please wait {$wait} seconds and try again."]);
                }),
        ]);
        RateLimiter::for('register', fn (Request $request) => [
            Limit::perHour(5)->by($request->ip())->response(function (Request $request) {
                ActivityLog::record('auth', 'registration_rate_limited', ['email' => strtolower(trim((string) $request->input('email')))]);

                return back()->withErrors(['email' => 'Too many registrations from this network. Please try again later.']);
            }),
        ]);
    }
}
