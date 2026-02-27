<?php

namespace Tests\Feature;

use App\Models\JobLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobLogCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_compliance_command_writes_success_job_log(): void
    {
        $this->artisan('vendors:evaluate-compliance')
            ->assertExitCode(0);

        $this->assertDatabaseHas('jobs_log', [
            'status' => 'success',
        ]);

        $this->assertTrue(
            JobLog::query()
                ->where('job_name', 'like', 'vendors:evaluate-compliance%')
                ->where('status', 'success')
                ->exists()
        );
    }

    public function test_performance_command_writes_failed_job_log_for_unknown_vendor(): void
    {
        $this->artisan('vendors:generate-performance-scores', [
            '--vendor' => 999999,
        ])->assertExitCode(1);

        $failedLog = JobLog::query()
            ->where('job_name', 'like', 'vendors:generate-performance-scores%')
            ->where('status', 'failed')
            ->latest('id')
            ->first();

        $this->assertNotNull($failedLog);
        $this->assertStringContainsString('not found', strtolower((string) $failedLog->error_message));
    }
}
