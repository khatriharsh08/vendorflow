<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_ops_manager_can_export_vendor_alias_csv(): void
    {
        $user = $this->createOpsUser();

        Vendor::factory()->create([
            'status' => Vendor::STATUS_ACTIVE,
            'compliance_status' => Vendor::COMPLIANCE_COMPLIANT,
            'compliance_score' => 92,
            'performance_score' => 87,
        ]);

        $response = $this->actingAs($user)
            ->get(route('admin.reports.export', ['type' => 'vendor']));

        $response->assertOk();
        $this->assertStringContainsString('attachment; filename="vendor_summary_', (string) $response->headers->get('Content-Disposition'));
        $this->assertStringContainsString('Company Name', $response->getContent());
    }

    public function test_ops_manager_can_export_compliance_report_alias_csv(): void
    {
        $user = $this->createOpsUser();

        Vendor::factory()->create([
            'status' => Vendor::STATUS_ACTIVE,
            'compliance_status' => Vendor::COMPLIANCE_NON_COMPLIANT,
            'compliance_score' => 42,
        ]);

        $response = $this->actingAs($user)
            ->get(route('admin.reports.export', ['type' => 'compliance_report']));

        $response->assertOk();
        $this->assertStringContainsString('attachment; filename="compliance_report_', (string) $response->headers->get('Content-Disposition'));
        $this->assertStringContainsString('Compliance Status', $response->getContent());
    }

    public function test_export_with_unknown_type_returns_not_found(): void
    {
        $user = $this->createOpsUser();

        $this->actingAs($user)
            ->get(route('admin.reports.export', ['type' => 'unknown_type']))
            ->assertNotFound();
    }

    private function createOpsUser(): User
    {
        $opsRole = Role::firstOrCreate(['name' => Role::OPS_MANAGER], ['display_name' => 'Ops Manager']);

        $user = User::factory()->create();
        $user->roles()->attach($opsRole);

        return $user;
    }
}
