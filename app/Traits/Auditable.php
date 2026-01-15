<?php

namespace App\Traits;

use App\Models\AuditLog;

trait Auditable
{
    /**
     * Boot the Auditable trait.
     */
    public static function bootAuditable()
    {
        // Log creation
        static::created(function ($model) {
            AuditLog::log(
                AuditLog::EVENT_CREATED,
                $model,
                null,
                $model->getAttributes()
            );
        });

        // Log updates
        static::updated(function ($model) {
            $changes = $model->getChanges();
            $original = collect($model->getOriginal())->only(array_keys($changes))->toArray();

            // Don't log if no meaningful changes
            if (empty($changes)) {
                return;
            }

            // Remove timestamps from audit
            unset($changes['updated_at'], $original['updated_at']);

            if (!empty($changes)) {
                AuditLog::log(
                    AuditLog::EVENT_UPDATED,
                    $model,
                    $original,
                    $changes
                );
            }
        });

        // Log soft deletes
        static::deleted(function ($model) {
            AuditLog::log(
                AuditLog::EVENT_DELETED,
                $model,
                $model->getOriginal(),
                null
            );
        });
    }

    /**
     * Get all audit logs for this model.
     */
    public function auditLogs()
    {
        return $this->morphMany(AuditLog::class, 'auditable');
    }

    /**
     * Log a custom event.
     */
    public function logEvent(string $event, ?array $data = null, ?string $reason = null)
    {
        return AuditLog::log($event, $this, null, $data, $reason);
    }
}
