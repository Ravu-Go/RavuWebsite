<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Holds accounts issued a one-time password on the account screen until they set their own.
 */
class EnsurePasswordChanged
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->password_change_required) {
            return redirect('/super-admin?section=account')
                ->with('error', 'Choose a new password before continuing.');
        }

        return $next($request);
    }
}
