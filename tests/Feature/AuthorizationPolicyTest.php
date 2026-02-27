<?php

namespace Tests\Feature;

use App\Models\PaymentRequest;
use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class AuthorizationPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_vendor_cannot_view_another_vendor_payment_request(): void
    {
        Role::firstOrCreate(['name' => 'vendor'], ['display_name' => 'Vendor']);

        $owner = User::factory()->create();
        $owner->roles()->attach(Role::where('name', 'vendor')->first());

        $otherVendorUser = User::factory()->create();
        $otherVendorUser->roles()->attach(Role::where('name', 'vendor')->first());

        $ownerVendor = Vendor::create([
            'user_id' => $owner->id,
            'company_name' => 'Owner Vendor',
            'contact_person' => 'Owner',
            'contact_email' => $owner->email,
            'contact_phone' => '9876543210',
            'status' => Vendor::STATUS_ACTIVE,
            'compliance_status' => Vendor::COMPLIANCE_COMPLIANT,
            'compliance_score' => 95,
            'pan_number' => 'ABCDE1234F',
            'address' => '123 St',
            'city' => 'City',
            'pincode' => '123456',
        ]);

        Vendor::create([
            'user_id' => $otherVendorUser->id,
            'company_name' => 'Other Vendor',
            'contact_person' => 'Other',
            'contact_email' => $otherVendorUser->email,
            'contact_phone' => '9876543211',
            'status' => Vendor::STATUS_ACTIVE,
            'compliance_status' => Vendor::COMPLIANCE_COMPLIANT,
            'compliance_score' => 95,
            'pan_number' => 'ABCDE1234G',
            'address' => '124 St',
            'city' => 'City',
            'pincode' => '123456',
        ]);

        $payment = PaymentRequest::create([
            'vendor_id' => $ownerVendor->id,
            'requested_by' => $owner->id,
            'reference_number' => 'PAY-POLICY-001',
            'amount' => 1000,
            'description' => 'Policy test payment',
            'status' => 'pending_ops',
        ]);

        $this->assertTrue(Gate::forUser($owner)->allows('view', $payment));
        $this->assertFalse(Gate::forUser($otherVendorUser)->allows('view', $payment));
    }

    public function test_super_admin_gate_before_bypass_is_applied(): void
    {
        Role::firstOrCreate(['name' => 'super_admin'], ['display_name' => 'Super Admin']);

        $superAdmin = User::factory()->create();
        $superAdmin->roles()->attach(Role::where('name', 'super_admin')->first());

        $vendorOwner = User::factory()->create();

        $vendor = Vendor::create([
            'user_id' => $vendorOwner->id,
            'company_name' => 'Bypass Vendor',
            'contact_person' => 'Owner',
            'contact_email' => $vendorOwner->email,
            'contact_phone' => '9876543210',
            'status' => Vendor::STATUS_SUBMITTED,
            'pan_number' => 'ABCDE1234H',
            'address' => '125 St',
            'city' => 'City',
            'pincode' => '123456',
        ]);

        $this->assertTrue(Gate::forUser($superAdmin)->allows('approve', $vendor));
    }
}
