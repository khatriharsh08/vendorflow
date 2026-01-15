<?php

namespace App\Console\Commands;

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
        $vendorId = $this->option('vendor');

        $this->info('Starting compliance evaluation...');

        if ($vendorId) {
            $vendor = \App\Models\Vendor::find($vendorId);
            
            if (!$vendor) {
                $this->error("Vendor with ID {$vendorId} not found.");
                return self::FAILURE;
            }

            $result = $complianceService->evaluateVendor($vendor);
            $this->displayResult($vendor, $result);
        } else {
            $results = $complianceService->evaluateAllVendors();
            
            $this->info("Evaluated " . count($results) . " vendors.");
            
            $table = [];
            foreach ($results as $vendorId => $result) {
                $table[] = [
                    $vendorId,
                    $result['score'],
                    $result['status'],
                    $result['failures'] . '/' . $result['rules_evaluated'],
                ];
            }

            $this->table(['Vendor ID', 'Score', 'Status', 'Failures/Rules'], $table);
        }

        $this->info('Compliance evaluation completed.');
        Log::info('Compliance evaluation completed', ['results_count' => $vendorId ? 1 : count($results ?? [])]);

        return self::SUCCESS;
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
