<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'performance_metric_id',
        'scored_by',
        'score',
        'notes',
        'period_start',
        'period_end',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
    ];

    // Scores are immutable and append-only.
    protected static function booted(): void
    {
        static::updating(function () {
            throw new \LogicException('Performance scores are immutable and cannot be updated.');
        });

        static::deleting(function () {
            throw new \LogicException('Performance scores are immutable and cannot be deleted.');
        });
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function metric(): BelongsTo
    {
        return $this->belongsTo(PerformanceMetric::class, 'performance_metric_id');
    }

    public function scoredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scored_by');
    }

    /**
     * Get normalized score (0-100 scale)
     */
    public function getNormalizedScoreAttribute(): float
    {
        if (! $this->metric || $this->metric->max_score === 0) {
            return 0;
        }

        return ($this->score / $this->metric->max_score) * 100;
    }
}
