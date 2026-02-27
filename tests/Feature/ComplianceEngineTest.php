<?php

namespace Tests\Feature;

use App\Models\ComplianceFlag;
use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use App\Services\ComplianceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ComplianceEngineTest extends TestCase
{
    use RefreshDatabase;

    public function test_vendor_becomes_blocked_with_more_than_two_open_flags(): void
    {
        Role::firstOrCreate(['name' => 'vendor'], ['display_name' => 'Vendor']);

        $user = User::factory()->create();
        $user->roles()->attach(Role::where('name', 'vendor')->first());

        $vendor = Vendor::create([
            'user_id' => $user->id,
            'company_name' => 'Compliance Test Vendor',
            'contact_person' => 'Compliance Owner',
            'contact_email' => $user->email,
            'contact_phone' => '9876543210',
            'status' => Vendor::STATUS_ACTIVE,
            'compliance_status' => Vendor::COMPLIANCE_COMPLIANT,
            'compliance_score' => 95,
            'pan_number' => 'ABCDE1234F',
            'address' => '123 St',
            'city' => 'City',
            'pincode' => '123456',
        ]);

        foreach ([1, 2, 3] as $i) {
            ComplianceFlag::create([
                'vendor_id' => $vendor->id,
                'severity' => 'high',
                'status' => 'open',
                'reason' => "Unresolved issue {$i}",
                'flagged_at' => now(),
            ]);
        }

        $result = app(ComplianceService::class)->evaluateVendor($vendor);

        $this->assertSame(Vendor::COMPLIANCE_BLOCKED, $result['status']);
        $this->assertSame(3, $result['open_flags']);

        $this->assertDatabaseHas('vendors', [
            'id' => $vendor->id,
            'compliance_status' => Vendor::COMPLIANCE_BLOCKED,
        ]);
    }
}
