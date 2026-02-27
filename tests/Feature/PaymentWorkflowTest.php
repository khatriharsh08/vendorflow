<?php

namespace Tests\Feature;

use App\Models\PaymentRequest;
use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected $vendorUser;

    protected $opsUser;

    protected $financeUser;

    protected $vendor;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles
        Role::firstOrCreate(['name' => 'vendor'], ['display_name' => 'Vendor']);
        Role::firstOrCreate(['name' => 'ops_manager'], ['display_name' => 'Ops Manager']);
        Role::firstOrCreate(['name' => 'finance_manager'], ['display_name' => 'Finance Manager']);

        // Create Users
        $this->vendorUser = User::factory()->create();
        $this->vendorUser->roles()->attach(Role::where('name', 'vendor')->first());

        $this->opsUser = User::factory()->create();
        $this->opsUser->roles()->attach(Role::where('name', 'ops_manager')->first());

        $this->financeUser = User::factory()->create();
        $this->financeUser->roles()->attach(Role::where('name', 'finance_manager')->first());

        // Create Active Vendor
        $this->vendor = Vendor::create([
            'user_id' => $this->vendorUser->id,
            'company_name' => 'Test Vendor Co',
            'contact_person' => 'Contact Person',
            'contact_email' => $this->vendorUser->email,
            'contact_phone' => '9876543210',
            'status' => Vendor::STATUS_ACTIVE,
            'compliance_status' => 'compliant',
            'pan_number' => 'ABCDE1234F',
            'address' => '123 St',
            'city' => 'City',
            'pincode' => '123456',
        ]);
    }

    public function test_vendor_can_create_payment_request()
    {
        $response = $this->actingAs($this->vendorUser)
            ->post(route('vendor.payments.request'), [
                'amount' => 5000,
                'description' => 'Service Payment',
                'invoice_number' => 'INV-001',
            ]);

        $response->assertRedirect(); // Back

        $this->assertDatabaseHas('payment_requests', [
            'vendor_id' => $this->vendor->id,
            'amount' => 5000,
            'status' => 'pending_ops',
            'invoice_number' => 'INV-001',
        ]);
    }

    public function test_duplicate_payment_request_is_flagged_for_review()
    {
        $payload = [
            'amount' => 7500,
            'description' => 'Monthly maintenance invoice',
            'invoice_number' => 'INV-DUP-001',
        ];

        $this->actingAs($this->vendorUser)->post(route('vendor.payments.request'), $payload);
        $response = $this->actingAs($this->vendorUser)->post(route('vendor.payments.request'), $payload);

        $response->assertRedirect();

        $this->assertDatabaseHas('payment_requests', [
            'vendor_id' => $this->vendor->id,
            'invoice_number' => 'INV-DUP-001',
            'is_duplicate_flagged' => 1,
        ]);
    }

    public function test_ops_manager_can_validate_payment()
    {
        try {
            $payment = PaymentRequest::create([
                'vendor_id' => $this->vendor->id,
                'requested_by' => $this->vendorUser->id,
                'amount' => 5000,
                'status' => 'requested',
                'reference_number' => 'PAY-TEST-1',
                'description' => 'Test Payment 1',
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Payment Trigger Error: '.$e->getMessage());
            throw $e;
        }

        $response = $this->actingAs($this->opsUser)
            ->post(route('admin.payments.validate-ops', $payment), [
                'action' => 'approve',
                'comment' => 'Validated',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('payment_requests', [
            'id' => $payment->id,
            'status' => 'pending_finance',
        ]);
    }

    public function test_finance_manager_can_approve_payment()
    {
        $payment = PaymentRequest::create([
            'vendor_id' => $this->vendor->id,
            'requested_by' => $this->vendorUser->id,
            'amount' => 5000,
            'status' => 'pending_finance',
            'reference_number' => 'PAY-TEST-2',
            'description' => 'Test Payment 2',
        ]);

        $response = $this->actingAs($this->financeUser)
            ->post(route('admin.payments.approve-finance', $payment), [
                'action' => 'approve',
                'comment' => 'Approved budget',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('payment_requests', [
            'id' => $payment->id,
            'status' => 'approved',
        ]);
    }

    public function test_finance_manager_can_mark_payment_paid()
    {
        $payment = PaymentRequest::create([
            'vendor_id' => $this->vendor->id,
            'requested_by' => $this->vendorUser->id,
            'amount' => 5000,
            'status' => 'approved',
            'reference_number' => 'PAY-TEST-3',
            'description' => 'Test Payment Description',
        ]);

        $response = $this->actingAs($this->financeUser)
            ->post(route('admin.payments.mark-paid', $payment), [
                'payment_reference' => 'UTR-123456',
                'payment_method' => 'Bank Transfer',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('payment_requests', [
            'id' => $payment->id,
            'status' => 'paid',
            'payment_reference' => 'UTR-123456',
        ]);
    }
}
