<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScoreHistory extends Model
{
    use HasFactory;

    protected $table = 'score_history';

    protected $fillable = [
        'vendor_id',
        'user_id',
        'performance_score',
        'source',
        'metadata',
        'recorded_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'recorded_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::updating(function () {
            throw new \LogicException('Score history records are immutable and cannot be updated.');
        });

        static::deleting(function () {
            throw new \LogicException('Score history records are immutable and cannot be deleted.');
        });
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
