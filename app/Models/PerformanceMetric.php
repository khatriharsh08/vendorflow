<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformanceMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'weight',
        'max_score',
        'is_active',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Metric constants
    const DELIVERY_TIMELINESS = 'delivery_timeliness';
    const ISSUE_FREQUENCY = 'issue_frequency';
    const OPS_RATING = 'ops_rating';
    const CONTRACT_ADHERENCE = 'contract_adherence';

    public function scores(): HasMany
    {
        return $this->hasMany(PerformanceScore::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
