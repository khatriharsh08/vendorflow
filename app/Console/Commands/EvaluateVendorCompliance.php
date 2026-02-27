<?php

namespace App\Console\Commands;

use App\Models\JobLog;
use App\Services\ComplianceService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class EvaluateVendorCompliance extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'vendors:evaluate-compliance {--vendor= : Specific vendor ID to evaluate}';

    /**
     * The console command description.
     */
    protected $description = 'Evaluate compliance for all active vendors or a specific vendor';

    /**
     * Execute the console command.
     */
    public function handle(ComplianceService $complianceService): int
    {
        $startedAt = now();
        $jobLog = JobLog::create([
            'job_name' => $this->signature,
            'status' => 'running',
            'started_at' => $startedAt,
            'payload' => ['vendor' => $this->option('vendor')],
        ]);

        $vendorId = $this->option('vendor');

        try {
            $this->info('Starting compliance evaluation...');

            if ($vendorId) {
                $vendor = \App\Models\Vendor::find($vendorId);

                if (! $vendor) {
                    $this->error("Vendor with ID {$vendorId} not found.");
                    $jobLog->update([
                        'status' => 'failed',
                        'finished_at' => now(),
                        'duration_ms' => $startedAt->diffInMilliseconds(now()),
                        'error_message' => "Vendor with ID {$vendorId} not found.",
                    ]);

                    return self::FAILURE;
                }

                $result = $complianceService->evaluateVendor($vendor);
                $this->displayResult($vendor, $result);
            } else {
                $results = $complianceService->evaluateAllVendors();

                $this->info('Evaluated '.count($results).' vendors.');

                $table = [];
                foreach ($results as $vendorId => $result) {
                    $table[] = [
                        $vendorId,
                        $result['score'],
                        $result['status'],
                        $result['failures'].'/'.$result['rules_evaluated'],
                    ];
                }

                $this->table(['Vendor ID', 'Score', 'Status', 'Failures/Rules'], $table);
            }

            $this->info('Compliance evaluation completed.');
            $resultCount = $vendorId ? 1 : count($results ?? []);
            Log::info('Compliance evaluation completed', ['results_count' => $resultCount]);
            $jobLog->update([
                'status' => 'success',
                'finished_at' => now(),
                'duration_ms' => $startedAt->diffInMilliseconds(now()),
                'result' => ['results_count' => $resultCount],
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

    protected function displayResult($vendor, array $result): void
    {
        $this->info("Vendor: {$vendor->company_name} (ID: {$vendor->id})");
        $this->info("Score: {$result['score']}");
        $this->info("Status: {$result['status']}");
        $this->info("Rules evaluated: {$result['rules_evaluated']}");
        $this->info("Failures: {$result['failures']}");
    }
}
