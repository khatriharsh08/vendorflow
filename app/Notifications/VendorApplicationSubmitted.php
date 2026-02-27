<?php

namespace App\Notifications;

use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class VendorApplicationSubmitted extends Notification implements ShouldQueue, \Illuminate\Contracts\Broadcasting\ShouldBroadcast
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public readonly Vendor $vendor) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('New Vendor Application: ' . $this->vendor->company_name)
            ->line('A new vendor application has been submitted.')
            ->line('Company: ' . $this->vendor->company_name)
            ->line('Submitted by: ' . $this->vendor->user->name)
            ->action('Review Application', url('/admin/vendors/' . $this->vendor->id));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Vendor Application Submitted',
            'message' => "A new vendor application has been submitted by {$this->vendor->user->name}.",
            'vendor_id' => $this->vendor->id,
            'vendor_name' => $this->vendor->company_name,
            'submitted_by' => $this->vendor->user->name,
            'severity' => 'info',
        ];
    }



    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'VendorApplicationSubmitted';
    }
}
