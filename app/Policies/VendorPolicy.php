<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vendor;

class VendorPolicy
{
    public function view(User $user, Vendor $vendor): bool
    {
        if ($user->isStaff()) {
            return true;
        }

        return $user->isVendor() && $vendor->user_id === $user->id;
    }

    public function approve(User $user, Vendor $vendor): bool
    {
        return $user->hasAnyRole(['ops_manager', 'super_admin']);
    }

    public function reject(User $user, Vendor $vendor): bool
    {
        return $user->hasAnyRole(['ops_manager', 'super_admin']);
    }

    public function activate(User $user, Vendor $vendor): bool
    {
        return $user->hasAnyRole(['ops_manager', 'super_admin']);
    }

    public function suspend(User $user, Vendor $vendor): bool
    {
        return $user->hasAnyRole(['ops_manager', 'super_admin']);
    }

    public function terminate(User $user, Vendor $vendor): bool
    {
        return $user->hasAnyRole(['ops_manager', 'super_admin']);
    }

    public function updateNotes(User $user, Vendor $vendor): bool
    {
        return $user->hasAnyRole(['ops_manager', 'super_admin']);
    }
}
