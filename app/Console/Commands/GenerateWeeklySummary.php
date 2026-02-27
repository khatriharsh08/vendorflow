<?php

namespace App\Console\Commands;

use App\Models\ComplianceResult;
use App\Models\JobLog;
use App\Models\PaymentRequest;
use App\Models\User;
use App\Models\Vendor;
use App\Notifications\WeeklySummaryGenerated;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateWeeklySummary extends Command
{
    protected $signature = 'vendors:weekly-summary';

    protected $description = 'Generate weekly summary report for ops managers';

    public function handle(): int
    {
        $startedAt = now();
        $jobLog = JobLog::create([
            'job_name' => $this->signature,
            'status' => 'running',
            'started_at' => $startedAt,
        ]);

        try {
            $this->info('Generating weekly summary...');

            $weekStart = Carbon::now()->startOfWeek();
            $weekEnd = Carbon::now()->endOfWeek();

            // Gather statistics
            $summary = [
                'period' => $weekStart->format('M d').' - '.$weekEnd->format('M d, Y'),
                'vendors' => [
                    'total' => Vendor::count(),
                    'new_this_week' => Vendor::where('created_at', '>=', $weekStart)->count(),
                    'pending_review' => Vendor::whereIn('status', ['submitted', 'under_review'])->count(),
                    'activated' => Vendor::where('activated_at', '>=', $weekStart)->count(),
                    'suspended' => Vendor::where('suspended_at', '>=', $weekStart)->count(),
                ],
                'compliance' => [
                    'compliant' => Vendor::where('compliance_status', 'compliant')->count(),
                    'at_risk' => Vendor::where('compliance_status', 'at_risk')->count(),
                    'non_compliant' => Vendor::whereIn('compliance_status', ['non_compliant', 'blocked'])->count(),
                    'new_failures' => ComplianceResult::where('status', 'fail')
                        ->where('evaluated_at', '>=', $weekStart)
                        ->count(),
                ],
                'payments' => [
                    'requested' => PaymentRequest::where('created_at', '>=', $weekStart)->count(),
                    'approved' => PaymentRequest::where('status', 'approved')
                        ->where('updated_at', '>=', $weekStart)
                        ->count(),
                    'paid_amount' => PaymentRequest::where('status', 'paid')
                        ->where('paid_date', '>=', $weekStart)
                        ->sum('amount'),
                    'rejected' => PaymentRequest::where('status', 'rejected')
                        ->where('updated_at', '>=', $weekStart)
                        ->count(),
                ],
            ];

            // Display summary
            $this->info("\n========================================");
            $this->info("WEEKLY SUMMARY: {$summary['period']}");
            $this->info("========================================\n");

            $this->info('VENDORS:');
            $this->table(
                ['Metric', 'Count'],
                [
                    ['Total Vendors', $summary['vendors']['total']],
                    ['New This Week', $summary['vendors']['new_this_week']],
                    ['Pending Review', $summary['vendors']['pending_review']],
                    ['Activated', $summary['vendors']['activated']],
                    ['Suspended', $summary['vendors']['suspended']],
                ]
            );

            $this->info("\nCOMPLIANCE:");
            $this->table(
                ['Metric', 'Count'],
                [
                    ['Compliant', $summary['compliance']['compliant']],
                    ['At Risk', $summary['compliance']['at_risk']],
                    ['Non-Compliant', $summary['compliance']['non_compliant']],
                    ['New Failures', $summary['compliance']['new_failures']],
                ]
            );

            $this->info("\nPAYMENTS:");
            $this->table(
                ['Metric', 'Value'],
                [
                    ['Requested', $summary['payments']['requested']],
                    ['Approved', $summary['payments']['approved']],
                    ['Paid Amount', 'INR '.number_format($summary['payments']['paid_amount'], 2)],
                    ['Rejected', $summary['payments']['rejected']],
                ]
            );

            // Notify ops managers
            $this->notifyManagers($summary);

            $this->info("\nWeekly summary generated and notifications sent.");
            $jobLog->update([
                'status' => 'success',
                'finished_at' => now(),
                'duration_ms' => $startedAt->diffInMilliseconds(now()),
                'result' => $summary,
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

    protected function notifyManagers(array $summary): void
    {
        $managers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['ops_manager', 'super_admin']);
        })->get();

        foreach ($managers as $manager) {
            $manager->notify(new WeeklySummaryGenerated($summary));
        }
    }
}
