<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class WeeklySummaryGenerated extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<string, mixed>  $summary
     */
    public function __construct(private readonly array $summary) {}

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
        $period = (string) ($this->summary['period'] ?? 'This week');
        $newVendors = (int) ($this->summary['vendors']['new_this_week'] ?? 0);
        $approvedPayments = (int) ($this->summary['payments']['approved'] ?? 0);

        return [
            'title' => 'Weekly Summary Available',
            'message' => "Week of {$period}: {$newVendors} new vendors, {$approvedPayments} payments approved.",
            'summary' => $this->summary,
            'severity' => 'info',
        ];
    }
}
