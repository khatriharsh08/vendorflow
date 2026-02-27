<?php

namespace Tests\Feature;

use App\Models\DocumentType;
use App\Models\PaymentRequest;
use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationRouteDenialTest extends TestCase
{
    use RefreshDatabase;

    public function test_vendor_cannot_view_another_vendors_document_route(): void
    {
        Role::firstOrCreate(['name' => 'vendor'], ['display_name' => 'Vendor']);

        $owner = User::factory()->create();
        $owner->roles()->attach(Role::where('name', 'vendor')->first());

        $attacker = User::factory()->create();
        $attacker->roles()->attach(Role::where('name', 'vendor')->first());

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

        $documentType = DocumentType::create([
            'name' => 'tax_certificate',
            'display_name' => 'Tax Certificate',
            'is_mandatory' => true,
            'is_active' => true,
        ]);

        $document = VendorDocument::create([
            'vendor_id' => $ownerVendor->id,
            'document_type_id' => $documentType->id,
            'file_name' => 'tax.pdf',
            'file_path' => 'vendor-documents/tax.pdf',
            'file_hash' => hash('sha256', 'tax'),
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
            'version' => 1,
            'is_current' => true,
            'verification_status' => 'verified',
        ]);

        $this->actingAs($attacker)
            ->get(route('documents.view', $document))
            ->assertForbidden();
    }

    public function test_finance_manager_cannot_access_ops_validation_route(): void
    {
        Role::firstOrCreate(['name' => 'finance_manager'], ['display_name' => 'Finance Manager']);

        $financeUser = User::factory()->create();
        $financeUser->roles()->attach(Role::where('name', 'finance_manager')->first());

        $vendorUser = User::factory()->create();
        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'company_name' => 'Ops Route Vendor',
            'contact_person' => 'Owner',
            'contact_email' => $vendorUser->email,
            'contact_phone' => '9876543210',
            'status' => Vendor::STATUS_ACTIVE,
            'compliance_status' => Vendor::COMPLIANCE_COMPLIANT,
            'compliance_score' => 95,
            'pan_number' => 'ABCDE1234G',
            'address' => '123 St',
            'city' => 'City',
            'pincode' => '123456',
        ]);

        $payment = PaymentRequest::create([
            'vendor_id' => $vendor->id,
            'requested_by' => $vendorUser->id,
            'reference_number' => 'PAY-ROUTE-001',
            'amount' => 1000,
            'description' => 'Route denial test',
            'status' => PaymentRequest::STATUS_PENDING_OPS,
        ]);

        $this->actingAs($financeUser)
            ->post(route('admin.payments.validate-ops', $payment), [
                'action' => 'approve',
            ])
            ->assertForbidden();
    }

    public function test_ops_manager_cannot_access_finance_approval_route(): void
    {
        Role::firstOrCreate(['name' => 'ops_manager'], ['display_name' => 'Ops Manager']);

        $opsUser = User::factory()->create();
        $opsUser->roles()->attach(Role::where('name', 'ops_manager')->first());

        $vendorUser = User::factory()->create();
        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'company_name' => 'Finance Route Vendor',
            'contact_person' => 'Owner',
            'contact_email' => $vendorUser->email,
            'contact_phone' => '9876543210',
            'status' => Vendor::STATUS_ACTIVE,
            'compliance_status' => Vendor::COMPLIANCE_COMPLIANT,
            'compliance_score' => 95,
            'pan_number' => 'ABCDE1234H',
            'address' => '123 St',
            'city' => 'City',
            'pincode' => '123456',
        ]);

        $payment = PaymentRequest::create([
            'vendor_id' => $vendor->id,
            'requested_by' => $vendorUser->id,
            'reference_number' => 'PAY-ROUTE-002',
            'amount' => 2000,
            'description' => 'Route denial test 2',
            'status' => PaymentRequest::STATUS_PENDING_FINANCE,
        ]);

        $this->actingAs($opsUser)
            ->post(route('admin.payments.approve-finance', $payment), [
                'action' => 'approve',
            ])
            ->assertForbidden();
    }
}
