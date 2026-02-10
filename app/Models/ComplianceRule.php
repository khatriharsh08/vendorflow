<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComplianceRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'conditions',
        'severity',
        'penalty_points',
        'blocks_payment',
        'blocks_activation',
        'is_active',
    ];

    protected $casts = [
        'conditions' => 'array',
        'blocks_payment' => 'boolean',
        'blocks_activation' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Rule types
    const TYPE_DOCUMENT_REQUIRED = 'document_required';

    const TYPE_DOCUMENT_EXPIRY = 'document_expiry';

    const TYPE_PERFORMANCE_THRESHOLD = 'performance_threshold';

    const TYPE_CUSTOM = 'custom';

    // Severity levels
    const SEVERITY_LOW = 'low';

    const SEVERITY_MEDIUM = 'medium';

    const SEVERITY_HIGH = 'high';

    const SEVERITY_CRITICAL = 'critical';

    public function results(): HasMany
    {
        return $this->hasMany(ComplianceResult::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeBlocking($query)
    {
        return $query->where('blocks_payment', true)
            ->orWhere('blocks_activation', true);
    }
}
