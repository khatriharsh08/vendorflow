<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class GateAbilityTest extends TestCase
{
    use RefreshDatabase;

    protected User $opsUser;

    protected User $financeUser;

    protected User $superAdmin;

    protected User $vendorUser;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'vendor'], ['display_name' => 'Vendor']);
        Role::firstOrCreate(['name' => 'ops_manager'], ['display_name' => 'Ops Manager']);
        Role::firstOrCreate(['name' => 'finance_manager'], ['display_name' => 'Finance Manager']);
        Role::firstOrCreate(['name' => 'super_admin'], ['display_name' => 'Super Admin']);

        $this->opsUser = User::factory()->create();
        $this->opsUser->roles()->attach(Role::where('name', 'ops_manager')->first());

        $this->financeUser = User::factory()->create();
        $this->financeUser->roles()->attach(Role::where('name', 'finance_manager')->first());

        $this->superAdmin = User::factory()->create();
        $this->superAdmin->roles()->attach(Role::where('name', 'super_admin')->first());

        $this->vendorUser = User::factory()->create();
        $this->vendorUser->roles()->attach(Role::where('name', 'vendor')->first());
    }

    public function test_report_gate_permissions(): void
    {
        $this->assertTrue(Gate::forUser($this->opsUser)->allows('viewReports'));
        $this->assertTrue(Gate::forUser($this->financeUser)->allows('viewReports'));
        $this->assertFalse(Gate::forUser($this->vendorUser)->allows('viewReports'));

        $this->assertTrue(Gate::forUser($this->opsUser)->allows('exportReports'));
        $this->assertTrue(Gate::forUser($this->financeUser)->allows('exportReports'));
        $this->assertFalse(Gate::forUser($this->vendorUser)->allows('exportReports'));
    }

    public function test_compliance_gate_permissions(): void
    {
        $this->assertTrue(Gate::forUser($this->opsUser)->allows('viewCompliance'));
        $this->assertFalse(Gate::forUser($this->financeUser)->allows('viewCompliance'));

        $this->assertTrue(Gate::forUser($this->opsUser)->allows('runCompliance'));
        $this->assertFalse(Gate::forUser($this->financeUser)->allows('runCompliance'));

        $this->assertTrue(Gate::forUser($this->superAdmin)->allows('manageComplianceRules'));
        $this->assertFalse(Gate::forUser($this->opsUser)->allows('manageComplianceRules'));
    }

    public function test_audit_gate_permissions(): void
    {
        $this->assertTrue(Gate::forUser($this->superAdmin)->allows('viewAuditLogs'));
        $this->assertFalse(Gate::forUser($this->opsUser)->allows('viewAuditLogs'));
        $this->assertFalse(Gate::forUser($this->financeUser)->allows('viewAuditLogs'));
    }

    public function test_performance_gate_permissions(): void
    {
        $this->assertTrue(Gate::forUser($this->opsUser)->allows('viewPerformance'));
        $this->assertFalse(Gate::forUser($this->financeUser)->allows('viewPerformance'));
        $this->assertFalse(Gate::forUser($this->vendorUser)->allows('viewPerformance'));

        $this->assertTrue(Gate::forUser($this->opsUser)->allows('ratePerformance'));
        $this->assertFalse(Gate::forUser($this->financeUser)->allows('ratePerformance'));
        $this->assertFalse(Gate::forUser($this->vendorUser)->allows('ratePerformance'));
    }
}
