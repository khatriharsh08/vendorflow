<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\RedirectResponse;

class DashboardRedirectController extends Controller
{
    public function __invoke(): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        if ($user->hasAnyRole([Role::SUPER_ADMIN, Role::OPS_MANAGER, Role::FINANCE_MANAGER])) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('vendor.dashboard');
    }
}
