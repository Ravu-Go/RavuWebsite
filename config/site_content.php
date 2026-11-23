<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Editable website content
    |--------------------------------------------------------------------------
    |
    | Each key maps to resources/content/{key}.json, which holds the default
    | copy and doubles as the schema the Super Admin editor is generated from.
    | Published edits are stored in the site_contents table and laid over the
    | defaults at render time.
    |
    */
    'pages' => [
        'global' => ['label' => 'Header, footer & shared sections', 'path' => '/'],
        'home' => ['label' => 'Home', 'path' => '/'],
        'about' => ['label' => 'About RAVU', 'path' => '/about-ravu'],
        'forRiders' => ['label' => 'For Riders', 'path' => '/for-riders'],
        'membership' => ['label' => 'Membership', 'path' => '/membership'],
        'benefits' => ['label' => 'Benefits', 'path' => '/benefits'],
        'partners' => ['label' => 'Partners', 'path' => '/partners'],
        'howItWorks' => ['label' => 'How It Works', 'path' => '/how-it-works'],
        'support' => ['label' => 'Support & FAQs', 'path' => '/support'],
    ],

    // Disk for images uploaded through the CMS. Use an S3-compatible disk in
    // production when the app server's filesystem is not persistent.
    'media_disk' => env('SITE_MEDIA_DISK', 'public'),
    'media_directory' => 'site-media',
    'media_max_kb' => 5120,
];
