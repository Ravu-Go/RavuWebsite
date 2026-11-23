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
            abort(403, 'Partner review access is restricted to RAVU administrators and reviewers.');
        }

        return $next($request);
    }
}
