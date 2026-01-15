<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'is_mandatory',
        'has_expiry',
        'expiry_warning_days',
        'allowed_extensions',
        'max_file_size_mb',
        'is_active',
    ];

    protected $casts = [
        'is_mandatory' => 'boolean',
        'has_expiry' => 'boolean',
        'is_active' => 'boolean',
        'allowed_extensions' => 'array',
    ];

    /**
     * Get all documents of this type.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(VendorDocument::class);
    }

    /**
     * Scope for active document types.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for mandatory document types.
     */
    public function scopeMandatory($query)
    {
        return $query->where('is_mandatory', true);
    }
}
