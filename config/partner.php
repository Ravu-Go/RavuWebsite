<?php

return [
    'terms_url' => env('PARTNER_TERMS_URL'),
    'privacy_url' => env('PARTNER_PRIVACY_URL'),
    'terms_version' => env('PARTNER_TERMS_VERSION', 'v1'),
    'privacy_version' => env('PARTNER_PRIVACY_VERSION', 'v1'),

    /*
    | Partner payouts. Each month RAVU sets aside this percentage of the subscription
    | income it collected and shares it between partners in proportion to the number
    | of distinct RAVU members each partner served that month.
    */
    'payout_pool_percent' => (float) env('PARTNER_PAYOUT_POOL_PERCENT', 30),

    // A cashier can void a redemption recorded by mistake within this many hours
    // (and only while its month's payout has not been approved).
    'void_window_hours' => (int) env('PARTNER_VOID_WINDOW_HOURS', 24),
];
