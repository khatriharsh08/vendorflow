<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Super admin bypasses all role checks
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Check if user has any of the required roles
        if (! $user->hasAnyRole($roles)) {
            abort(403, 'Unauthorized access.');
        }

        return $next($request);
    }
}
