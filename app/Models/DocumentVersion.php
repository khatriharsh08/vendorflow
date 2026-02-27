<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_document_id',
        'version',
        'file_path',
        'file_hash',
        'uploaded_by',
        'notes',
    ];

    protected static function booted(): void
    {
        static::updating(function () {
            throw new \LogicException('Document versions are immutable and cannot be updated.');
        });

        static::deleting(function () {
            throw new \LogicException('Document versions are immutable and cannot be deleted.');
        });
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(VendorDocument::class, 'vendor_document_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
