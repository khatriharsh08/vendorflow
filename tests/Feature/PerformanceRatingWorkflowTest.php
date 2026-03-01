<?php

namespace Tests\Feature;

use App\Models\PerformanceMetric;
use App\Models\Role;
use App\Models\ScoreHistory;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class PerformanceRatingWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $opsUser;

    protected Vendor $vendor;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'ops_manager'], ['display_name' => 'Ops Manager']);

        $this->opsUser = User::factory()->create();
        $this->opsUser->roles()->attach(Role::where('name', 'ops_manager')->first());

        $vendorUser = User::factory()->create();
        $this->vendor = Vendor::factory()->create([
            'user_id' => $vendorUser->id,
            'status' => Vendor::STATUS_ACTIVE,
            'compliance_status' => Vendor::COMPLIANCE_COMPLIANT,
            'performance_score' => 0,
        ]);
    }

    public function test_ops_rating_creates_scores_and_single_history_entry(): void
    {
        $metricA = PerformanceMetric::create([
            'name' => 'delivery_timeliness',
            'display_name' => 'Delivery Timeliness',
            'weight' => 0.60,
            'max_score' => 10,
            'is_active' => true,
        ]);

        $metricB = PerformanceMetric::create([
            'name' => 'contract_adherence',
            'display_name' => 'Contract Adherence',
            'weight' => 0.40,
            'max_score' => 10,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->opsUser)->post(
            route('admin.performance.rate', $this->vendor),
            [
                'period_start' => now()->startOfMonth()->toDateString(),
                'period_end' => now()->endOfMonth()->toDateString(),
                'ratings' => [
                    ['metric_id' => $metricA->id, 'score' => 8, 'notes' => 'Good timing'],
                    ['metric_id' => $metricB->id, 'score' => 6, 'notes' => 'Needs stricter adherence'],
                ],
            ]
        );

        $response->assertRedirect(route('admin.performance.index'));
        $response->assertSessionHas('success', 'Performance ratings recorded successfully.');

        $this->assertDatabaseCount('performance_scores', 2);

        $this->vendor->refresh();
        $this->assertSame(72, (int) $this->vendor->performance_score);

        $this->assertDatabaseCount('score_history', 1);
        $history = ScoreHistory::query()->where('vendor_id', $this->vendor->id)->latest('id')->first();
        $this->assertNotNull($history);
        $this->assertSame('manual_rating', $history->source);
        $this->assertSame('rating_batch', $history->metadata['source'] ?? null);
        $this->assertSame(2, $history->metadata['metric_count'] ?? null);
    }

    public function test_rating_validation_uses_metric_max_score(): void
    {
        $metric = PerformanceMetric::create([
            'name' => 'issue_frequency',
            'display_name' => 'Issue Frequency',
            'weight' => 1.0,
            'max_score' => 5,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->opsUser)
            ->from(route('admin.performance.rate-form', $this->vendor))
            ->post(route('admin.performance.rate', $this->vendor), [
                'period_start' => now()->startOfMonth()->toDateString(),
                'period_end' => now()->endOfMonth()->toDateString(),
                'ratings' => [
                    ['metric_id' => $metric->id, 'score' => 8],
                ],
            ]);

        $response->assertRedirect(route('admin.performance.rate-form', $this->vendor));
        $response->assertSessionHasErrors(['ratings.0.score']);
        $this->assertDatabaseCount('performance_scores', 0);
        $this->assertDatabaseCount('score_history', 0);
    }

    public function test_performance_dashboard_includes_approved_vendor_for_ops(): void
    {
        $response = $this->actingAs($this->opsUser)->get(route('admin.performance.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Admin/Performance/Index')
                ->has('vendors', 1)
                ->where('vendors.0.id', $this->vendor->id)
                ->where('vendors.0.company_name', $this->vendor->company_name)
        );
    }
}
