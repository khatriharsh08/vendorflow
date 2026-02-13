<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VendorApplicationSubmitted extends Notification
{
    use Queueable;

    public $vendor;

    /**
     * Create a new notification instance.
     */
    public function __construct($vendor)
    {
        $this->vendor = $vendor;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Vendor Application Submitted')
            ->line('A new vendor application has been submitted by '.$this->vendor->user->name)
            ->line('Company Name: '.$this->vendor->company_name)
            ->action('Review Application', url('/admin/vendors/'.$this->vendor->id))
            ->line('Please review the documents and approve/reject the application.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
