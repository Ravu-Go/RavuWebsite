<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Membership revenue source
    |--------------------------------------------------------------------------
    |
    | "demo" generates realistic sample data so the Super Admin revenue page can
    | be designed and reviewed before the memberships API exists.
    | "database" reads the real plans, memberships and payments straight from the
    | RAVU app's database (ravu-api), read-only, over the "ravu_api" connection.
    | "api" reads them over HTTP (see App\Contracts\MembershipRevenueSource).
    |
    */

    'revenue_source' => env('MEMBERSHIP_REVENUE_SOURCE', 'demo'),

    /*
    | Member lookups for the partner verifier: "demo" builds sample members from the
    | revenue source above; "database" reads members from the RAVU app's database;
    | "api" asks an HTTP endpoint (GET {api.url}/members/lookup).
    */
    'member_source' => env('MEMBERSHIP_MEMBER_SOURCE', env('MEMBERSHIP_REVENUE_SOURCE', 'demo')),

    'currency' => env('MEMBERSHIP_CURRENCY', 'TZS'),

    'database' => [
        'connection' => env('MEMBERSHIP_DB_CONNECTION', 'ravu_api'),
        // The app marks local/staging test payments as "simulated". Counting them as
        // income is useful on staging but must stay off in production, where they would
        // inflate the partner payout pool.
        'include_simulated' => (bool) env('MEMBERSHIP_DB_INCLUDE_SIMULATED', env('APP_ENV') !== 'production'),
    ],

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
