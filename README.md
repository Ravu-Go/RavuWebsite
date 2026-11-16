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


## Cloudflare Deployment (Workers + Pages)

This project is ready for **both** **Cloudflare Workers (with Static Assets)** and **Cloudflare Pages (with Pages Functions or Static SPA)** — with or without an external PHP server:

1. **Standalone Edge Mode (Default — Zero PHP Origin Required)**:
   `worker.js` / `workers/app.js` (Workers) and `functions/[[path]].js` (Pages Functions) run a native Cloudflare Edge Inertia + Auth engine (`cloudflare/edge-handler.js`) that renders initial SSR `data-page` HTML, serves Inertia JSON transitions (`X-Inertia: true`), and handles Partner & Super Admin authentication (`/login`, `/register`, `/logout`, `/login/forget-profile`, `/auth/google/*`) using HTTP-only cookies and optional Cloudflare D1 (`database/d1-schema.sql`).
2. **Static-Only SPA Fallback Mode**:
   `dist/index.html`, `dist/_redirects`, and `resources/js/cloudflare-spa-adapter.js` ensure that even a pure static upload of `dist/` to Cloudflare Pages works across all routes, `<Link>` navigations, and Partner/Admin portals.
3. **Laravel Origin Proxy Mode (Optional)**:
   If `BACKEND_URL` is configured as a Worker/Pages secret, dynamic requests are proxied to your Laravel PHP origin with automatic fallback to the Edge Inertia handler.

### Files added

| File | Purpose |
|---|---|
| `wrangler.jsonc` | Cloudflare Workers config with `./dist` static assets binding & observability |
| `worker.js` / `workers/app.js` | Cloudflare Worker entry point (static assets + Edge Inertia handler + optional `BACKEND_URL` proxy) |
| `functions/[[path]].js` | Cloudflare Pages Functions catch-all entry point |
| `cloudflare/edge-handler.js` | Native Cloudflare Edge Inertia router, HTML shell renderer, Auth/Session/OAuth & D1 support |
| `cloudflare/build-meta.js` | Auto-generated Vite manifest metadata used by the Edge HTML renderer |
| `scripts/build-cloudflare.mjs` | Post-build script that populates `dist/` (`index.html`, `_redirects`, `_headers`, `_routes.json`, `build/*`) |
| `resources/js/cloudflare-spa-adapter.js` | Client-side Inertia fallback adapter for static-only hosting |
| `database/d1-schema.sql` | Optional Cloudflare D1 SQLite schema for persistent `users` table |
| `.dev.vars.example` | Template for local `wrangler dev` / `wrangler pages dev` environment variables |

### Option 1: Deploy to Cloudflare Workers

```bash
# Build Vite assets + dist/ bundle
npm run build

# Preview locally with Cloudflare workerd
npm run workers:dev

# Deploy to Cloudflare Workers
npm run workers:deploy
```

### Option 2: Deploy to Cloudflare Pages

- **Build command**: `npm run build`
- **Build output directory**: `dist`

Or deploy via Wrangler CLI:

```bash
# Preview Cloudflare Pages locally (with Pages Functions)
npm run pages:dev

# Deploy to Cloudflare Pages
npm run pages:deploy
```

### Optional: Cloudflare D1 Database or Laravel Origin

```bash
# Optional: Create & migrate a Cloudflare D1 database for persistent accounts
npx wrangler d1 create ravu-db
npx wrangler d1 execute ravu-db --file=database/d1-schema.sql

# Optional: Point the Worker at an external Laravel PHP origin
npx wrangler secret put BACKEND_URL
```
