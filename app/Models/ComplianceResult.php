<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplianceResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'compliance_rule_id',
        'status',
        'details',
        'metadata',
        'evaluated_at',
        'resolved_at',
        'resolved_by',
    ];

    protected $casts = [
        'metadata' => 'array',
        'evaluated_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    // Status constants
    const STATUS_PASS = 'pass';
    const STATUS_FAIL = 'fail';
    const STATUS_WARNING = 'warning';

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function rule(): BelongsTo
    {
        return $this->belongsTo(ComplianceRule::class, 'compliance_rule_id');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function isFailing(): bool
    {
        return $this->status === self::STATUS_FAIL;
    }

    public function isResolved(): bool
    {
        return $this->resolved_at !== null;
    }

    public function scopeUnresolved($query)
    {
        return $query->whereNull('resolved_at');
    }

    public function scopeFailing($query)
    {
        return $query->where('status', self::STATUS_FAIL);
    }
}
