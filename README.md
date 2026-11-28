<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).


## Website content (Super Admin CMS)

Every marketing page's copy, links and images live in `resources/content/*.json`
(one file per page, plus `global.json` for the navigation, footer and shared
sections). These files are the defaults **and** the schema for the editor:

- Super admins edit content at `/super-admin` → *Website content*. Changes are
  saved as a **draft**, can be **previewed** across the whole site, then
  **published**. Every publish is kept in *Publishing history* and can be
  loaded back into the draft.
- Laravel stores drafts/published versions in `site_contents` and merges them
  over the JSON defaults (`App\Services\SiteContentService`). Saved content is
  validated against the JSON shape: unknown fields are dropped, links must be
  `/path`, `#anchor`, `https://`, `mailto:` or `tel:`, and images must come from
  the media library.
- To make new copy editable, add the field to the page's JSON file and render it
  from `useSiteContent("<page>")` — the editor picks it up automatically.
- Uploaded images go to the `SITE_MEDIA_DISK` disk (default `public`; run
  `php artisan storage:link`). Use an S3-compatible disk when the app server's
  filesystem is not persistent.

## Partner applications

Businesses register and apply through the partner portal (`/register` →
`/partner-dashboard`). Super admins see the review queue in the Super Admin
dashboard; full review (documents, benefits, decisions) happens at
`/partner-management`, which `partner_reviewer` staff can also use without
access to website content.

## Cloudflare Deployment (Workers + Pages)

Production runs **Laravel as the origin** with Cloudflare in front:

1. **Laravel origin (required for accounts)**: set `BACKEND_URL` as a Worker
   secret (`npx wrangler secret put BACKEND_URL`). The worker serves static
   build assets from the edge and proxies every other request to Laravel —
   including sign-in, registration, the partner portal, partner review and the
   Super Admin CMS.
2. **Edge fallback**: if `BACKEND_URL` is missing or the origin returns a 5xx,
   `cloudflare/edge-handler.js` renders the public marketing pages from the
   bundled default content. It performs **no authentication**: account areas
   redirect to `/login`, and sign-in/registration show a "temporarily
   unavailable" notice.
3. **Static-only `dist/` upload**: `resources/js/cloudflare-spa-adapter.js`
   gives the same read-only behaviour client-side. It only activates when the
   page was served from the static `dist/index.html` shell and never intercepts
   responses from a real server.

### Files

| File | Purpose |
|---|---|
| `wrangler.jsonc` | Cloudflare Workers config with static assets binding & observability |
| `worker.js` / `workers/app.js` | Worker entry point (static assets + `BACKEND_URL` proxy + edge fallback) |
| `functions/[[path]].js` | Cloudflare Pages Functions catch-all entry point |
| `cloudflare/edge-handler.js` | Read-only edge fallback for public pages |
| `cloudflare/build-meta.js` | Auto-generated Vite manifest metadata used by the edge HTML renderer |
| `scripts/build-cloudflare.mjs` | Post-build script that populates `dist/` |
| `resources/js/cloudflare-spa-adapter.js` | Client-side fallback for static-only hosting |
| `.dev.vars.example` | Template for local `wrangler dev` / `wrangler pages dev` variables |

### Deploy to Cloudflare Workers

```bash
npm run build
npx wrangler secret put BACKEND_URL   # once: your Laravel origin URL
npm run workers:dev                    # local preview with workerd
npm run workers:deploy
```

### Deploy to Cloudflare Pages

- **Build command**: `npm run build`
- **Build output directory**: `dist`

```bash
npm run pages:dev
npm run pages:deploy
```


## Partner portal: members served, redemptions & payouts

Approved partners verify RAVU members at the counter (**Serve members**), record each
visit with the member discount (a *redemption*), and follow their performance, receipts
and monthly payouts. Super admins see the **Partner performance** leaderboard and run
**Payouts** (approve a finished month → record each payment).

- **Payout rule:** each month RAVU shares `PARTNER_PAYOUT_POOL_PERCENT` (default 30) of
  that month's subscription income between partners, in proportion to the distinct
  members each partner served. Approving a month freezes its figures
  (`App\Services\PartnerPayoutService`).
- **Member lookups** come from `App\Contracts\MemberDirectory`. Until the mobile app API
  is live they use sample members (`MEMBERSHIP_MEMBER_SOURCE=demo`); set it to `api` to
  call `GET {MEMBERSHIP_API_URL}/members/lookup?q=…` (shape documented on the contract).
- **Dummy data:** `php artisan partners:demo --login` creates 8 sample partners, a demo partner login (`jux@partner.com` / `password1234` locally) and 18 months of
  sample redemptions (flagged `is_demo`) for every approved partner with an approved
  offer; `php artisan partners:demo --purge` removes all of it. Refuses to run in
  production without `--force`.
- **Local logins:** `php artisan db:seed --class=DemoPartnerSeeder` creates (or resets) the
  demo partner login `jux@partner.com` / `password1234`, generating the demo data first if
  needed; `php artisan db:seed --class=SuperAdminSeeder` resets the four super admins to
  `password1234`. Both only do this when `APP_ENV=local`.
- `PARTNER_VOID_WINDOW_HOURS` (default 24): how long a partner can void a mistaken receipt.

## Connecting the RAVU app (ravu-api)

The website reads real members, plans and subscription payments straight from the
RAVU app's PostgreSQL database ([Ravu-Go/ravu-api](https://github.com/Ravu-Go/ravu-api)),
**read-only**. Partner redemptions and payouts stay in the website's own database.

```env
MEMBERSHIP_REVENUE_SOURCE=database
MEMBERSHIP_MEMBER_SOURCE=database
RAVU_API_DB_HOST=…            # the app's PostgreSQL host
RAVU_API_DB_DATABASE=ravu
RAVU_API_DB_USERNAME=ravu_website_ro
RAVU_API_DB_PASSWORD=…
RAVU_API_DB_SSLMODE=require
```

Ask the API's database administrator to create a role that can only read the six
tables the website uses:

```sql
CREATE ROLE ravu_website_ro LOGIN PASSWORD '…';
GRANT CONNECT ON DATABASE ravu TO ravu_website_ro;
GRANT USAGE ON SCHEMA public TO ravu_website_ro;
GRANT SELECT (id, name, phone, phone_verified_at, role, status) ON users TO ravu_website_ro;
GRANT SELECT ON memberships, membership_plans, payments, member_passes, driver_profiles TO ravu_website_ro;
```

How the app's data is used (`App\Services\Membership\DatabaseMembershipRevenueSource`,
`App\Services\Members\DatabaseMemberDirectory`):

- **Members** are app accounts with role `driver`. Member number = `RAVU-` + the app
  user id padded to 5 digits (user 42 → `RAVU-00042`).
- **Partners find a member** by member number, phone (`0712 345 678`, `+255…`) or the
  15-minute member pass the app issues (`RVU-…`, from `member_passes`). Expired passes
  are rejected.
- **Who may use a benefit** follows the app's own `OfferEligibility` rule: active account,
  verified phone, membership `active` and today between `starts_at` and `ends_at`.
- **Plans** are BASIC / PRO / ELITE, billed yearly. **Income** = `payments` with status
  `settled` (dated by `settled_at`); `failed` and `refunded` are shown as such; queued or
  pending attempts are not income yet. Payments the app marks `simulated` are counted
  only when `MEMBERSHIP_DB_INCLUDE_SIMULATED` is on (default: on except in production).
- Before switching, remove the sample data: `php artisan partners:demo --purge`.

Note: staging-api.ravultd.com currently sits behind a Cloudflare bot challenge, so
server-to-server HTTP calls to it are blocked. The database connection is not affected.
