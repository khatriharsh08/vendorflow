<?php

namespace App\Console\Commands;

use App\Models\JobLog;
use App\Models\Vendor;
use App\Services\PerformanceService;
use Illuminate\Console\Command;

class GeneratePerformanceScores extends Command
{
    protected $signature = 'vendors:generate-performance-scores {--vendor= : Specific vendor ID to recalculate}';

    protected $description = 'Generate monthly vendor performance scores and append score history records';

    public function handle(PerformanceService $performanceService): int
    {
        $startedAt = now();
        $vendorId = $this->option('vendor');

        $jobLog = JobLog::create([
            'job_name' => $this->signature,
            'status' => 'running',
            'started_at' => $startedAt,
            'payload' => ['vendor' => $vendorId],
        ]);

        try {
            $processed = 0;

            if ($vendorId) {
                $vendor = Vendor::find($vendorId);

                if (! $vendor) {
                    $message = "Vendor with ID {$vendorId} not found.";
                    $this->error($message);

                    $jobLog->update([
                        'status' => 'failed',
                        'finished_at' => now(),
                        'duration_ms' => $startedAt->diffInMilliseconds(now()),
                        'error_message' => $message,
                    ]);

                    return self::FAILURE;
                }

                $score = $performanceService->recalculateVendorScore($vendor, null, [
                    'source' => 'scheduled_monthly',
                    'generated_at' => now()->toDateString(),
                ]);

                $this->info("Vendor {$vendor->id} ({$vendor->company_name}) score recalculated: {$score}");
                $processed = 1;
            } else {
                $vendors = Vendor::whereIn('status', [
                    Vendor::STATUS_ACTIVE,
                    Vendor::STATUS_APPROVED,
                ])->get();

                foreach ($vendors as $vendor) {
                    $performanceService->recalculateVendorScore($vendor, null, [
                        'source' => 'scheduled_monthly',
                        'generated_at' => now()->toDateString(),
                    ]);
                    $processed++;
                }

                $this->info("Recalculated performance scores for {$processed} active vendors.");
            }

            $jobLog->update([
                'status' => 'success',
                'finished_at' => now(),
                'duration_ms' => $startedAt->diffInMilliseconds(now()),
                'result' => ['processed_vendors' => $processed],
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
}
