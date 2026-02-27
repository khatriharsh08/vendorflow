<?php

namespace Tests\Feature;

use App\Models\ComplianceResult;
use App\Models\ComplianceRule;
use App\Models\User;
use App\Models\Vendor;
use App\Services\ComplianceDashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ComplianceDashboardServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_data_and_vendor_detail_data_are_built_correctly(): void
    {
        $vendorUser = User::factory()->create();
        $vendor = Vendor::factory()->create([
            'user_id' => $vendorUser->id,
            'status' => Vendor::STATUS_ACTIVE,
            'compliance_status' => Vendor::COMPLIANCE_AT_RISK,
            'compliance_score' => 62,
        ]);

        $rule = ComplianceRule::create([
            'name' => 'document_expiry',
            'description' => 'Document expiry check',
            'type' => ComplianceRule::TYPE_DOCUMENT_EXPIRY,
            'conditions' => ['warning_days' => 15],
            'severity' => ComplianceRule::SEVERITY_HIGH,
            'penalty_points' => 20,
            'blocks_payment' => false,
            'blocks_activation' => false,
            'is_active' => true,
        ]);

        ComplianceResult::create([
            'vendor_id' => $vendor->id,
            'compliance_rule_id' => $rule->id,
            'status' => ComplianceResult::STATUS_FAIL,
            'details' => 'Expired insurance',
            'metadata' => [],
            'evaluated_at' => now(),
        ]);

        /** @var ComplianceDashboardService $service */
        $service = app(ComplianceDashboardService::class);

        $dashboard = $service->dashboardData();
        $this->assertSame(1, $dashboard['stats']['at_risk']);
        $this->assertCount(1, $dashboard['atRiskVendors']);
        $this->assertCount(1, $dashboard['recentResults']);
        $this->assertCount(1, $dashboard['rules']);

        $detail = $service->vendorDetailData($vendor);
        $this->assertSame($vendor->id, $detail['vendor']->id);
        $this->assertCount(1, $detail['results']);
        $this->assertSame(0, $detail['summary']['passing']);
        $this->assertSame(1, $detail['summary']['failing']);
        $this->assertSame(0, $detail['summary']['warnings']);
    }
}
