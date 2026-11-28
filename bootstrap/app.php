<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\LocalSessionCookies;
use App\Http\Middleware\ResolveClientIp;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust the hosting proxy (Dokploy/Traefik, on a private network) for X-Forwarded-*
        // headers, so Laravel sees https and builds https redirects. Without this every
        // redirect pointed at http://, which Safari blocks from an https page: sign-in
        // succeeded but the page stayed on the login form. TRUSTED_PROXIES=* trusts any peer.
        $middleware->trustProxies(at: env('TRUSTED_PROXIES') ? '*' : ResolveClientIp::PROXY_NETWORKS);
        // Before trusted-proxy handling: the visitor's IP from Cloudflare, not the proxy's.
        $middleware->prepend(ResolveClientIp::class);
        // After trusted-proxy handling, before the session starts: localhost keeps its session cookie.
        $middleware->append(LocalSessionCookies::class);

        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
