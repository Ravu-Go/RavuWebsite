<?php

/*
|--------------------------------------------------------------------------
| Shared accounts with the RAVU app (ravu-api)
|--------------------------------------------------------------------------
|
| When "shared_accounts" is on, the website signs people in against the RAVU
| app's own users table instead of keeping its own. The website's other tables
| live in their own schema (DB_SEARCH_PATH=website,public), so the app's tables
| are only reached for accounts and for the partner record a registration
| creates. Website-only account details (job title, consent, Google link, last
| sign-in) are kept in website.user_profiles, never on the app's users table.
|
*/

return [
    'shared_accounts' => (bool) env('RAVU_APP_SHARED_ACCOUNTS', false),

    // The app's partner directory (name, category, address, phone, location).
    // A registration adds a "draft" row here that RAVU staff verify in the app.
    'partners_table' => env('RAVU_APP_PARTNERS_TABLE', 'public.partners'),

    // users.role given to accounts created through partner registration.
    'partner_role' => env('RAVU_APP_PARTNER_ROLE', 'partner'),

    // App roles that open the website's Super Admin dashboard.
    'super_admin_roles' => array_filter(array_map('trim', explode(',', (string) env('RAVU_APP_SUPER_ADMIN_ROLES', 'administrator')))),
];
