<?php

namespace App\Services;

use App\Models\ComplianceFlag;
use App\Models\DocumentType;
use App\Models\User;
use App\Models\Vendor;
use InvalidArgumentException;

class VendorLifecycleService
{
    private const MIN_ACTIVATION_COMPLIANCE_SCORE = 80;

    /**
     * Move a submitted/reviewed/approved vendor to active through valid transitions.
     */
    public function approveAndActivate(Vendor $vendor, User $actor, ?string $comment = null): void
    {
        $note = $comment ?: 'Vendor approved and activated';

        if ($vendor->status === Vendor::STATUS_SUBMITTED) {
            $vendor->transitionTo(Vendor::STATUS_UNDER_REVIEW, $actor, $note);
            $vendor->refresh();
        }

        if ($vendor->status === Vendor::STATUS_UNDER_REVIEW) {
            $vendor->transitionTo(Vendor::STATUS_APPROVED, $actor, $note);
            $vendor->refresh();
        }

        if ($vendor->status === Vendor::STATUS_APPROVED) {
            $this->assertReadyForActivation($vendor);
            $vendor->transitionTo(Vendor::STATUS_ACTIVE, $actor, $note);

            return;
        }

        throw new InvalidArgumentException("Vendor cannot be approved from {$vendor->status} state.");
    }

    /**
     * Reject a vendor with mandatory reason.
     */
    public function reject(Vendor $vendor, User $actor, string $reason): void
    {
        if ($vendor->status === Vendor::STATUS_SUBMITTED) {
            $vendor->transitionTo(Vendor::STATUS_UNDER_REVIEW, $actor, 'Vendor moved to review before rejection');
            $vendor->refresh();
        }

        if ($vendor->status !== Vendor::STATUS_UNDER_REVIEW) {
            throw new InvalidArgumentException("Vendor cannot be rejected from {$vendor->status} state.");
        }

        $vendor->transitionTo(Vendor::STATUS_REJECTED, $actor, $reason);
    }

    /**
     * Activate a vendor from approved or suspended state.
     */
    public function activate(Vendor $vendor, User $actor, ?string $comment = null): void
    {
        if (! in_array($vendor->status, [Vendor::STATUS_APPROVED, Vendor::STATUS_SUSPENDED], true)) {
            throw new InvalidArgumentException("Vendor cannot be activated from {$vendor->status} state.");
        }

        $this->assertReadyForActivation($vendor);
        $vendor->transitionTo(Vendor::STATUS_ACTIVE, $actor, $comment ?: 'Vendor activated');
    }

    /**
     * Suspend an active vendor with mandatory reason.
     */
    public function suspend(Vendor $vendor, User $actor, string $reason): void
    {
        if ($vendor->status !== Vendor::STATUS_ACTIVE) {
            throw new InvalidArgumentException("Vendor cannot be suspended from {$vendor->status} state.");
        }

        $vendor->transitionTo(Vendor::STATUS_SUSPENDED, $actor, $reason);
    }

    /**
     * Terminate a vendor from active or suspended state with mandatory reason.
     */
    public function terminate(Vendor $vendor, User $actor, string $reason): void
    {
        if (! in_array($vendor->status, [Vendor::STATUS_ACTIVE, Vendor::STATUS_SUSPENDED], true)) {
            throw new InvalidArgumentException("Vendor cannot be terminated from {$vendor->status} state.");
        }

        if (blank($reason)) {
            throw new InvalidArgumentException('A reason is required when terminating a vendor.');
        }

        $vendor->transitionTo(Vendor::STATUS_TERMINATED, $actor, $reason);
    }

    /**
     * Enforce non-negotiable readiness checks before activation.
     */
    private function assertReadyForActivation(Vendor $vendor): void
    {
        $mandatoryTypeIds = DocumentType::where('is_mandatory', true)->pluck('id');

        if ($mandatoryTypeIds->isNotEmpty()) {
            $verifiedCurrentTypeIds = $vendor->documents()
                ->where('is_current', true)
                ->where('verification_status', 'verified')
                ->where(function ($query) {
                    $query->whereNull('expiry_date')
                        ->orWhereDate('expiry_date', '>=', now()->toDateString());
                })
                ->pluck('document_type_id');

            $missingTypeIds = $mandatoryTypeIds->diff($verifiedCurrentTypeIds);

            if ($missingTypeIds->isNotEmpty()) {
                throw new InvalidArgumentException('Vendor cannot be activated until all mandatory documents are verified and valid.');
            }
        }

        if ($vendor->compliance_status !== Vendor::COMPLIANCE_COMPLIANT || (int) $vendor->compliance_score < self::MIN_ACTIVATION_COMPLIANCE_SCORE) {
            throw new InvalidArgumentException('Vendor cannot be activated until compliance score meets the activation threshold.');
        }

        $openFlagsCount = ComplianceFlag::where('vendor_id', $vendor->id)
            ->where('status', 'open')
            ->count();

        if ($openFlagsCount > 0) {
            throw new InvalidArgumentException('Vendor cannot be activated while compliance flags are unresolved.');
        }
    }
}
