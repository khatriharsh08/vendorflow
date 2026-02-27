<?php

namespace Tests\Feature;

use App\Models\JobLog;
use App\Models\PerformanceMetric;
use App\Models\PerformanceScore;
use App\Models\ScoreHistory;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PerformanceCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_monthly_performance_command_recalculates_scores_and_logs_job(): void
    {
        $vendorUser = User::factory()->create();
        $scorer = User::factory()->create();

        $vendor = Vendor::factory()->create([
            'user_id' => $vendorUser->id,
            'status' => Vendor::STATUS_ACTIVE,
            'compliance_status' => Vendor::COMPLIANCE_COMPLIANT,
            'performance_score' => 0,
        ]);

        $metricA = PerformanceMetric::create([
            'name' => 'delivery_timeliness',
            'display_name' => 'Delivery Timeliness',
            'weight' => 2,
            'max_score' => 100,
            'is_active' => true,
        ]);

        $metricB = PerformanceMetric::create([
            'name' => 'issue_frequency',
            'display_name' => 'Issue Frequency',
            'weight' => 1,
            'max_score' => 100,
            'is_active' => true,
        ]);

        PerformanceScore::create([
            'vendor_id' => $vendor->id,
            'performance_metric_id' => $metricA->id,
            'scored_by' => $scorer->id,
            'score' => 80,
            'period_start' => now()->startOfMonth()->toDateString(),
            'period_end' => now()->endOfMonth()->toDateString(),
        ]);

        PerformanceScore::create([
            'vendor_id' => $vendor->id,
            'performance_metric_id' => $metricB->id,
            'scored_by' => $scorer->id,
            'score' => 50,
            'period_start' => now()->startOfMonth()->toDateString(),
            'period_end' => now()->endOfMonth()->toDateString(),
        ]);

        $this->artisan('vendors:generate-performance-scores')
            ->assertSuccessful();

        $vendor->refresh();
        $this->assertSame(70, $vendor->performance_score);

        $history = ScoreHistory::where('vendor_id', $vendor->id)->latest('id')->first();
        $this->assertNotNull($history);
        $this->assertSame(70, $history->performance_score);
        $this->assertSame('system', $history->source);
        $this->assertSame('scheduled_monthly', $history->metadata['source'] ?? null);

        $this->assertDatabaseHas('jobs_log', [
            'status' => 'success',
        ]);

        $latestJob = JobLog::latest('id')->first();
        $this->assertNotNull($latestJob);
        $this->assertSame(1, $latestJob->result['processed_vendors'] ?? null);
    }
}
