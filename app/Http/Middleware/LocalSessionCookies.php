<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Lets the site run on a developer's machine with the live .env.
 *
 * The live settings scope cookies to ".ravultd.com" and mark them Secure. A browser
 * on http://127.0.0.1 or http://localhost drops such cookies (Safari refuses Secure
 * cookies over plain http too), so every request starts a new session: a partner who
 * registers is signed out on the next page. For local hosts only, cookies are made
 * host-only and, over plain http, not Secure. Real domains are left untouched.
 */
class LocalSessionCookies
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->isLocalHost($request->getHost())) {
            $secure = $request->isSecure() && (bool) config('session.secure');

            config(['session.domain' => null, 'session.secure' => $secure]);
            app('cookie')->setDefaultPathAndDomain(
                config('session.path', '/'),
                null,
                $secure,
                config('session.same_site'),
            );
        }

        return $next($request);
    }

    private function isLocalHost(string $host): bool
    {
        $host = strtolower(trim($host, '[]'));

        return in_array($host, ['localhost', '127.0.0.1', '::1'], true)
            || str_ends_with($host, '.localhost')
            || str_ends_with($host, '.test');
    }
}
