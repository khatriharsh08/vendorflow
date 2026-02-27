<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ExpiredDocumentsAlert extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly int $expiredCount) {}

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
        return [
            'title' => 'Expired Documents Alert',
            'message' => "{$this->expiredCount} vendor document(s) have expired and need attention.",
            'count' => $this->expiredCount,
            'severity' => 'critical',
        ];
    }
}
