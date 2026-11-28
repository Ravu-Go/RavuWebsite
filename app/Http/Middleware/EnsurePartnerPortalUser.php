<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePartnerPortalUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isPartnerUser()) {
            \App\Models\ActivityLog::record('access', 'access_denied', ['path' => '/'.ltrim($request->path(), '/'), 'area' => 'Partner portal', 'method' => $request->method()]);
            abort(403, 'A verified RAVU partner account is required.');
        }

        return $next($request);
    }
}
