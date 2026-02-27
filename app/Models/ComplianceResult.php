<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    protected static function booted(): void
    {
        static::updating(function () {
            throw new \LogicException('Compliance results are immutable and cannot be updated.');
        });

        static::deleting(function () {
            throw new \LogicException('Compliance results are immutable and cannot be deleted.');
        });
    }

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

    public function flags(): HasMany
    {
        return $this->hasMany(ComplianceFlag::class);
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

    /**
     * Subquery for latest result row IDs per vendor and rule.
     */
    public static function latestResultIdsQuery(?int $vendorId = null): Builder
    {
        $query = self::query()
            ->selectRaw('MAX(id) as id')
            ->groupBy('vendor_id', 'compliance_rule_id');

        if ($vendorId !== null) {
            $query->where('vendor_id', $vendorId);
        }

        return $query;
    }
}
