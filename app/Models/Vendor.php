<?php

namespace App\Models;

use App\Enums\VendorStatus;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vendor extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'user_id',
        'company_name',
        'registration_number',
        'tax_id',
        'pan_number',
        'business_type',
        'contact_person',
        'contact_email',
        'contact_phone',
        'address',
        'city',
        'state',
        'country',
        'pincode',
        'bank_name',
        'bank_account_number',
        'bank_ifsc',
        'bank_branch',
        'status',
        'compliance_status',
        'compliance_score',
        'performance_score',
        'internal_notes',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'activated_at' => 'datetime',
        'suspended_at' => 'datetime',
        'terminated_at' => 'datetime',
    ];

    // Status constants
    const STATUS_DRAFT = 'draft';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_UNDER_REVIEW = 'under_review';
    const STATUS_APPROVED = 'approved';
    const STATUS_ACTIVE = 'active';
    const STATUS_SUSPENDED = 'suspended';
    const STATUS_TERMINATED = 'terminated';

    // Compliance status constants
    const COMPLIANCE_PENDING = 'pending';
    const COMPLIANCE_COMPLIANT = 'compliant';
    const COMPLIANCE_AT_RISK = 'at_risk';
    const COMPLIANCE_NON_COMPLIANT = 'non_compliant';
    const COMPLIANCE_BLOCKED = 'blocked';

    /**
     * Valid state transitions
     */
    protected static array $validTransitions = [
        self::STATUS_DRAFT => [self::STATUS_SUBMITTED],
        self::STATUS_SUBMITTED => [self::STATUS_UNDER_REVIEW, self::STATUS_DRAFT],
        self::STATUS_UNDER_REVIEW => [self::STATUS_APPROVED, self::STATUS_SUBMITTED],
        self::STATUS_APPROVED => [self::STATUS_ACTIVE, self::STATUS_SUSPENDED],
        self::STATUS_ACTIVE => [self::STATUS_SUSPENDED, self::STATUS_TERMINATED],
        self::STATUS_SUSPENDED => [self::STATUS_ACTIVE, self::STATUS_TERMINATED],
        self::STATUS_TERMINATED => [], // Terminal state
    ];

    // Relationships

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(VendorDocument::class);
    }

    public function stateLogs(): HasMany
    {
        return $this->hasMany(VendorStateLog::class)->orderBy('created_at', 'desc');
    }

    public function paymentRequests(): HasMany
    {
        return $this->hasMany(PaymentRequest::class);
    }

    public function complianceResults(): HasMany
    {
        return $this->hasMany(ComplianceResult::class);
    }

    public function performanceScores(): HasMany
    {
        return $this->hasMany(PerformanceScore::class);
    }

    // State Machine Methods

    /**
     * Check if transition is valid.
     */
    public function canTransitionTo(string $newStatus): bool
    {
        $allowedTransitions = self::$validTransitions[$this->status] ?? [];
        return in_array($newStatus, $allowedTransitions);
    }

    /**
     * Transition to a new status.
     */
    public function transitionTo(string $newStatus, User $user, ?string $comment = null): bool
    {
        if (!$this->canTransitionTo($newStatus)) {
            return false;
        }

        $oldStatus = $this->status;
        $this->status = $newStatus;

        // Set relevant timestamps
        match ($newStatus) {
            self::STATUS_SUBMITTED => $this->submitted_at = now(),
            self::STATUS_APPROVED => $this->approved_at = now(),
            self::STATUS_ACTIVE => $this->activated_at = now(),
            self::STATUS_SUSPENDED => $this->suspended_at = now(),
            self::STATUS_TERMINATED => $this->terminated_at = now(),
            default => null,
        };

        if ($newStatus === self::STATUS_APPROVED) {
            $this->approved_by = $user->id;
        }

        $this->save();

        // Log the transition
        $this->stateLogs()->create([
            'user_id' => $user->id,
            'from_status' => $oldStatus,
            'to_status' => $newStatus,
            'comment' => $comment,
        ]);

        return true;
    }

    // Query Scopes

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeCompliant($query)
    {
        return $query->where('compliance_status', self::COMPLIANCE_COMPLIANT);
    }

    public function scopeNonCompliant($query)
    {
        return $query->whereIn('compliance_status', [
            self::COMPLIANCE_NON_COMPLIANT,
            self::COMPLIANCE_BLOCKED,
        ]);
    }

    // Helper Methods

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isCompliant(): bool
    {
        return $this->compliance_status === self::COMPLIANCE_COMPLIANT;
    }

    public function canRequestPayment(): bool
    {
        return $this->isActive() && $this->isCompliant();
    }

    public function getStatusBadgeClass(): string
    {
        return match ($this->status) {
            self::STATUS_DRAFT => 'badge-draft',
            self::STATUS_SUBMITTED => 'badge-submitted',
            self::STATUS_UNDER_REVIEW => 'badge-review',
            self::STATUS_APPROVED => 'badge-approved',
            self::STATUS_ACTIVE => 'badge-active',
            self::STATUS_SUSPENDED => 'badge-suspended',
            self::STATUS_TERMINATED => 'badge-terminated',
            default => 'badge-draft',
        };
    }
}
