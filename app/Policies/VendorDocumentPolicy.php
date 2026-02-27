<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VendorDocument;

class VendorDocumentPolicy
{
    public function view(User $user, VendorDocument $document): bool
    {
        if ($user->isStaff()) {
            return true;
        }

        return $user->isVendor() && $document->vendor->user_id === $user->id;
    }

    public function download(User $user, VendorDocument $document): bool
    {
        return $this->view($user, $document);
    }

    public function verify(User $user, VendorDocument $document): bool
    {
        return $user->hasAnyRole(['ops_manager', 'super_admin']);
    }

    public function reject(User $user, VendorDocument $document): bool
    {
        return $user->hasAnyRole(['ops_manager', 'super_admin']);
    }
}
