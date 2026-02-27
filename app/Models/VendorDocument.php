<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class VendorDocument extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vendor_id',
        'document_type_id',
        'file_name',
        'file_path',
        'file_hash',
        'file_size',
        'mime_type',
        'version',
        'is_current',
        'verification_status',
        'expiry_date',
        'verification_notes',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'expiry_date' => 'date',
        'verified_at' => 'datetime',
    ];

    // Verification status constants
    const STATUS_PENDING = 'pending';

    const STATUS_VERIFIED = 'verified';

    const STATUS_REJECTED = 'rejected';

    const STATUS_EXPIRED = 'expired';

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class, 'vendor_document_id');
    }

    public function isPending(): bool
    {
        return $this->verification_status === self::STATUS_PENDING;
    }

    public function isVerified(): bool
    {
        return $this->verification_status === self::STATUS_VERIFIED;
    }

    public function isExpired(): bool
    {
        if ($this->verification_status === self::STATUS_EXPIRED) {
            return true;
        }

        if ($this->expiry_date && $this->expiry_date->isPast()) {
            return true;
        }

        return false;
    }
}
