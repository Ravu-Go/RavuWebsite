<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePartnerReviewer
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isPartnerReviewer()) {
            \App\Models\ActivityLog::record('access', 'access_denied', ['path' => '/'.ltrim($request->path(), '/'), 'area' => 'Partner review workspace', 'method' => $request->method()]);
            abort(403, 'Partner review access is restricted to RAVU administrators and reviewers.');
        }

        return $next($request);
    }
}
