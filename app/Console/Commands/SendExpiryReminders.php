<?php

namespace App\Console\Commands;

use App\Models\JobLog;
use App\Models\User;
use App\Models\VendorDocument;
use App\Notifications\DocumentExpiryReminder;
use App\Notifications\ExpiredDocumentsAlert;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendExpiryReminders extends Command
{
    protected $signature = 'vendors:expiry-reminders';

    protected $description = 'Send reminders for documents expiring soon';

    public function handle(): int
    {
        $startedAt = now();
        $jobLog = JobLog::create([
            'job_name' => $this->signature,
            'status' => 'running',
            'started_at' => $startedAt,
        ]);

        try {
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

            $jobLog->update([
                'status' => 'success',
                'finished_at' => now(),
                'duration_ms' => $startedAt->diffInMilliseconds(now()),
                'result' => [
                    'reminders_sent' => $remindersSent,
                    'expired_docs' => $expiredDocs->count(),
                ],
            ]);

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $jobLog->update([
                'status' => 'failed',
                'finished_at' => now(),
                'duration_ms' => $startedAt->diffInMilliseconds(now()),
                'error_message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    protected function createNotification(VendorDocument $doc, int $daysRemaining, bool $isExpired = false): void
    {
        $vendor = $doc->vendor;
        $user = $vendor->user;

        if (! $user) {
            return;
        }

        $user->notify(new DocumentExpiryReminder(
            $doc->documentType->display_name,
            $doc->id,
            $vendor->id,
            $daysRemaining,
            $isExpired
        ));
    }

    protected function notifyOpsManagers($expiredDocs): void
    {
        $expiredCount = $expiredDocs->count();

        $opsManagers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['ops_manager', 'super_admin']);
        })->get();

        foreach ($opsManagers as $manager) {
            $manager->notify(new ExpiredDocumentsAlert($expiredCount));
        }
    }
}
