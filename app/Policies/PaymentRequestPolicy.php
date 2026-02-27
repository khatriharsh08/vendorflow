<?php

namespace App\Policies;

use App\Models\PaymentRequest;
use App\Models\User;

class PaymentRequestPolicy
{
    public function view(User $user, PaymentRequest $paymentRequest): bool
    {
        if ($user->isStaff()) {
            return true;
        }

        return $user->isVendor() && $paymentRequest->vendor->user_id === $user->id;
    }

    public function validateOps(User $user, PaymentRequest $paymentRequest): bool
    {
        return $user->hasAnyRole(['ops_manager', 'super_admin']);
    }

    public function approveFinance(User $user, PaymentRequest $paymentRequest): bool
    {
        return $user->hasAnyRole(['finance_manager', 'super_admin']);
    }

    public function markPaid(User $user, PaymentRequest $paymentRequest): bool
    {
        return $user->hasAnyRole(['finance_manager', 'super_admin']);
    }
}
