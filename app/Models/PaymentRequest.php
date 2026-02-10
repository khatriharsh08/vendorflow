<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vendor_id',
        'requested_by',
        'reference_number',
        'invoice_number',
        'amount',
        'currency',
        'description',
        'status',
        'rejection_reason',
        'is_duplicate_flagged',
        'is_compliance_blocked',
        'due_date',
        'paid_date',
        'payment_reference',
        'payment_method',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_duplicate_flagged' => 'boolean',
        'is_compliance_blocked' => 'boolean',
        'due_date' => 'date',
        'paid_date' => 'date',
    ];

    // Status constants
    const STATUS_REQUESTED = 'requested';

    const STATUS_PENDING_OPS = 'pending_ops';

    const STATUS_PENDING_FINANCE = 'pending_finance';

    const STATUS_APPROVED = 'approved';

    const STATUS_PAID = 'paid';

    const STATUS_REJECTED = 'rejected';

    const STATUS_CANCELLED = 'cancelled';

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(PaymentApproval::class);
    }

    public function isPending(): bool
    {
        return in_array($this->status, [
            self::STATUS_REQUESTED,
            self::STATUS_PENDING_OPS,
            self::STATUS_PENDING_FINANCE,
        ]);
    }

    public function canBeApproved(): bool
    {
        return $this->isPending() && ! $this->is_compliance_blocked;
    }
}
