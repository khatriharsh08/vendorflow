<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_request_id',
        'user_id',
        'stage',
        'action',
        'comment',
    ];

    // Stages
    const STAGE_OPS_VALIDATION = 'ops_validation';
    const STAGE_FINANCE_APPROVAL = 'finance_approval';

    // Actions
    const ACTION_APPROVED = 'approved';
    const ACTION_REJECTED = 'rejected';
    const ACTION_PENDING = 'pending';

    public function paymentRequest(): BelongsTo
    {
        return $this->belongsTo(PaymentRequest::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isApproved(): bool
    {
        return $this->action === self::ACTION_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->action === self::ACTION_REJECTED;
    }
}
