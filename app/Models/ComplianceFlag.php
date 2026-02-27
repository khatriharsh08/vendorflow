<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplianceFlag extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'compliance_rule_id',
        'compliance_result_id',
        'severity',
        'status',
        'reason',
        'metadata',
        'flagged_at',
        'resolved_at',
        'resolved_by',
    ];

    protected $casts = [
        'metadata' => 'array',
        'flagged_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function complianceResult(): BelongsTo
    {
        return $this->belongsTo(ComplianceResult::class);
    }

    public function complianceRule(): BelongsTo
    {
        return $this->belongsTo(ComplianceRule::class);
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
