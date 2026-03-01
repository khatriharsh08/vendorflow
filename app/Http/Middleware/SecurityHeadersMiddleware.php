<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Document preview is intentionally embeddable in same-origin modal viewers.
        $isDocumentPreview = $request->routeIs('documents.view', 'admin.documents.preview');
        $frameAncestors = $isDocumentPreview ? "'self'" : "'none'";

        $response->headers->set('X-Frame-Options', $isDocumentPreview ? 'SAMEORIGIN' : 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '0');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');

        if ($isDocumentPreview) {
            // Relax preview response headers for browser-native PDF viewers inside same-origin iframes.
            $response->headers->remove('Cross-Origin-Opener-Policy');
            $response->headers->remove('Cross-Origin-Resource-Policy');
            $response->headers->remove('Content-Security-Policy');
        } else {
            $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
            $response->headers->set('Cross-Origin-Resource-Policy', 'same-origin');

            if (app()->environment('local')) {
                // Development CSP for Vite HMR.
                $response->headers->set('Content-Security-Policy', "default-src 'self' data: blob: http: https: ws: wss:; script-src 'self' 'unsafe-inline' http: https:; style-src 'self' 'unsafe-inline' http: https:; img-src 'self' data: blob: http: https:; font-src 'self' data: http: https:; connect-src 'self' ws: wss: http: https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors {$frameAncestors};");
            } else {
                // Production CSP disallows eval and untrusted origins.
                $response->headers->set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; img-src 'self' data: blob:; font-src 'self' data: https://fonts.bunny.net; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors {$frameAncestors};");
            }
        }

        if ($request->isSecure() && app()->isProduction()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        return $response;
    }
}
