<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isSuperAdmin()) {
            \App\Models\ActivityLog::record('access', 'access_denied', ['path' => '/'.ltrim($request->path(), '/'), 'area' => 'Super admin console', 'method' => $request->method()]);
            abort(403, 'Super administrator access is required.');
        }

        return $next($request);
    }
}
