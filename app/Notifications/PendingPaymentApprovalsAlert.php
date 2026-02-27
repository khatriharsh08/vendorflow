<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class PendingPaymentApprovalsAlert extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $stage,
        private readonly int $count,
        private readonly int $thresholdHours
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
        $stageLabel = $this->stage === 'ops' ? 'Ops Validation' : 'Finance Approval';
        $severity = $this->count >= 10 ? 'high' : 'medium';

        return [
            'title' => 'Pending Payment Approvals',
            'message' => "{$this->count} payment request(s) are pending {$stageLabel} for more than {$this->thresholdHours} hours.",
            'type' => 'payment',
            'stage' => $this->stage,
            'count' => $this->count,
            'threshold_hours' => $this->thresholdHours,
            'severity' => $severity,
        ];
    }
}
