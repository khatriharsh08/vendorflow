<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DocumentExpiryReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $documentTypeName,
        private readonly int $documentId,
        private readonly int $vendorId,
        private readonly int $daysRemaining,
        private readonly bool $isExpired = false
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $message = $this->isExpired
            ? "Your {$this->documentTypeName} has expired. Please upload a new document."
            : "Your {$this->documentTypeName} will expire in {$this->daysRemaining} days. Please renew it.";

        return [
            'title' => $this->isExpired ? 'Document Expired' : 'Document Expiring Soon',
            'message' => $message,
            'document_id' => $this->documentId,
            'vendor_id' => $this->vendorId,
            'days_remaining' => $this->daysRemaining,
            'severity' => $this->isExpired ? 'critical' : ($this->daysRemaining <= 7 ? 'high' : 'medium'),
        ];
    }
}
