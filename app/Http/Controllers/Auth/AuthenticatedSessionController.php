<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        /** @var \App\Models\User $user */
        $user = $request->user();

        // Guard vendor access for restricted lifecycle states.
        if ($user?->isVendor()) {
            $vendor = $user->vendor;
            $blockedStates = [
                Vendor::STATUS_SUSPENDED,
                Vendor::STATUS_TERMINATED,
                Vendor::STATUS_REJECTED,
            ];

            if ($vendor && in_array($vendor->status, $blockedStates, true)) {
                HandleInertiaRequests::clearAuthCache($user->id);
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return back()->withErrors([
                    'email' => "Your vendor account is currently {$vendor->status}. Please contact support.",
                ])->onlyInput('email');
            }
        }

        HandleInertiaRequests::clearAuthCache($user->id);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        /** @var \App\Models\User|null $user */
        $user = $request->user();
        if ($user) {
            HandleInertiaRequests::clearAuthCache($user->id);
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
