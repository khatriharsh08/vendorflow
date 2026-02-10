<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\VendorDocument;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class SendExpiryReminders extends Command
{
    protected $signature = 'vendors:expiry-reminders';

    protected $description = 'Send reminders for documents expiring soon';

    public function handle(): int
    {
        $this->info('Checking for expiring documents...');

        // Find documents expiring in the next 30 days
        $expiringDocs = VendorDocument::with(['vendor.user', 'documentType'])
            ->where('is_current', true)
            ->whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [Carbon::now(), Carbon::now()->addDays(30)])
            ->get();

        $remindersSent = 0;

        foreach ($expiringDocs as $doc) {
            $daysUntilExpiry = Carbon::now()->diffInDays($doc->expiry_date, false);

            // Send reminders at 30, 15, 7, 3, 1 days before expiry
            if (in_array($daysUntilExpiry, [30, 15, 7, 3, 1])) {
                $this->createNotification($doc, $daysUntilExpiry);
                $remindersSent++;
            }
        }

        // Check for already expired documents
        $expiredDocs = VendorDocument::with(['vendor.user', 'documentType'])
            ->where('is_current', true)
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<', Carbon::now())
            ->where('verification_status', '!=', 'expired')
            ->get();

        foreach ($expiredDocs as $doc) {
            $doc->update(['verification_status' => 'expired']);
            $this->createNotification($doc, 0, true);
            $remindersSent++;
        }

        $this->info("Sent {$remindersSent} expiry reminders.");

        // Notify ops managers about expired documents
        if ($expiredDocs->count() > 0) {
            $this->notifyOpsManagers($expiredDocs);
        }

        return self::SUCCESS;
    }

    protected function createNotification(VendorDocument $doc, int $daysRemaining, bool $isExpired = false): void
    {
        $vendor = $doc->vendor;
        $user = $vendor->user;

        if (! $user) {
            return;
        }

        $message = $isExpired
            ? "Your {$doc->documentType->display_name} has expired. Please upload a new document."
            : "Your {$doc->documentType->display_name} will expire in {$daysRemaining} days. Please renew it.";

        // Store in-app notification
        \DB::table('notifications')->insert([
            'id' => \Illuminate\Support\Str::uuid(),
            'type' => 'App\\Notifications\\DocumentExpiryReminder',
            'notifiable_type' => 'App\\Models\\User',
            'notifiable_id' => $user->id,
            'data' => json_encode([
                'title' => $isExpired ? 'Document Expired' : 'Document Expiring Soon',
                'message' => $message,
                'document_id' => $doc->id,
                'vendor_id' => $vendor->id,
                'days_remaining' => $daysRemaining,
                'severity' => $isExpired ? 'critical' : ($daysRemaining <= 7 ? 'high' : 'medium'),
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    protected function notifyOpsManagers($expiredDocs): void
    {
        $opsManagers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['ops_manager', 'super_admin']);
        })->get();

        foreach ($opsManagers as $manager) {
            \DB::table('notifications')->insert([
                'id' => \Illuminate\Support\Str::uuid(),
                'type' => 'App\\Notifications\\ExpiredDocumentsAlert',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $manager->id,
                'data' => json_encode([
                    'title' => 'Expired Documents Alert',
                    'message' => "{$expiredDocs->count()} vendor document(s) have expired and need attention.",
                    'count' => $expiredDocs->count(),
                    'severity' => 'critical',
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
