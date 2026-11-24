<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Membership revenue source
    |--------------------------------------------------------------------------
    |
    | "demo" generates realistic sample data so the Super Admin revenue page can
    | be designed and reviewed before the memberships API exists.
    | "api" reads plans, subscriptions and payments from the memberships API
    | (see App\Contracts\MembershipRevenueSource for the expected JSON).
    |
    */

    'revenue_source' => env('MEMBERSHIP_REVENUE_SOURCE', 'demo'),

    'currency' => env('MEMBERSHIP_CURRENCY', 'TZS'),

    'api' => [
        'url' => env('MEMBERSHIP_API_URL'),
        'token' => env('MEMBERSHIP_API_TOKEN'),
        'timeout' => (int) env('MEMBERSHIP_API_TIMEOUT', 10),
        // Seconds to cache API responses so the dashboard doesn't hit the API on every view.
        'cache_seconds' => (int) env('MEMBERSHIP_API_CACHE_SECONDS', 300),
    ],

    /*
    | Plans used by the demo source only. Placeholder names and prices: replace
    | them with the real plans, or switch to the API once it is live.
    */
    'demo_plans' => [
        ['id' => 'rider-basic', 'name' => 'Rider Basic', 'price' => 10000, 'interval' => 'month'],
        ['id' => 'rider-plus', 'name' => 'Rider Plus', 'price' => 25000, 'interval' => 'month'],
        ['id' => 'rider-plus-annual', 'name' => 'Rider Plus (Annual)', 'price' => 250000, 'interval' => 'year'],
        ['id' => 'fleet', 'name' => 'Fleet', 'price' => 120000, 'interval' => 'month'],
    ],
];
