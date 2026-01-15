<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'auditable_type',
        'auditable_id',
        'event',
        'old_values',
        'new_values',
        'reason',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    // Event types
    const EVENT_CREATED = 'created';
    const EVENT_UPDATED = 'updated';
    const EVENT_DELETED = 'deleted';
    const EVENT_STATE_CHANGED = 'state_changed';
    const EVENT_APPROVED = 'approved';
    const EVENT_REJECTED = 'rejected';
    const EVENT_UPLOADED = 'uploaded';
    const EVENT_VERIFIED = 'verified';
    const EVENT_SCORED = 'scored';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auditable()
    {
        return $this->morphTo();
    }

    /**
     * Log an audit event.
     */
    public static function log(
        string $event,
        $model,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $reason = null
    ): self {
        $user = auth()->user();

        return self::create([
            'user_id' => $user?->id,
            'auditable_type' => get_class($model),
            'auditable_id' => $model->id,
            'event' => $event,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'reason' => $reason,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Get logs for a specific model.
     */
    public static function forModel($model)
    {
        return self::where('auditable_type', get_class($model))
            ->where('auditable_id', $model->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get formatted event name.
     */
    public function getEventDisplayAttribute(): string
    {
        return match ($this->event) {
            self::EVENT_CREATED => 'Created',
            self::EVENT_UPDATED => 'Updated',
            self::EVENT_DELETED => 'Deleted',
            self::EVENT_STATE_CHANGED => 'Status Changed',
            self::EVENT_APPROVED => 'Approved',
            self::EVENT_REJECTED => 'Rejected',
            self::EVENT_UPLOADED => 'Document Uploaded',
            self::EVENT_VERIFIED => 'Verified',
            self::EVENT_SCORED => 'Performance Scored',
            default => ucfirst($this->event),
        };
    }
}
