<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendorManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $adminUser;

    protected $vendor;

    protected function setUp(): void
    {
        parent::setUp();
        // Disable CSRF protection for tests
        $this->withoutMiddleware([
            \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
        ]);

        // Seed roles
        Role::firstOrCreate(['name' => 'vendor'], ['display_name' => 'Vendor']);
        Role::firstOrCreate(['name' => 'super_admin'], ['display_name' => 'Super Admin']);

        // Create Admin
        $this->adminUser = User::factory()->create();
        $this->adminUser->roles()->attach(Role::where('name', 'super_admin')->first());

        // Create Vendor in submitted state
        $vendorUser = User::factory()->create();
        $vendorUser->roles()->attach(Role::where('name', 'vendor')->first());

        $this->vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'company_name' => 'Test Vendor Co',
            'contact_person' => 'Contact Person',
            'contact_email' => $vendorUser->email,
            'contact_phone' => '9876543210',
            'status' => Vendor::STATUS_SUBMITTED,
            'compliance_status' => Vendor::COMPLIANCE_COMPLIANT,
            'compliance_score' => 90,
            'submitted_at' => now(),
            // Minimum required fields based on model/migrations
            'pan_number' => 'ABCDE1234F',
            'address' => '123 St',
            'city' => 'City',
            'pincode' => '123456',
        ]);
    }

    public function test_admin_can_view_vendors_list()
    {
        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.vendors.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Admin/Vendors/Index')
                ->has('vendors', 1)
        );
    }

    public function test_admin_can_view_vendor_details()
    {
        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.vendors.show', $this->vendor));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Admin/Vendors/Show')
                ->where('vendor.id', $this->vendor->id)
        );
    }

    public function test_admin_can_approve_vendor()
    {
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.vendors.approve', $this->vendor), [
                'comment' => 'Approved for testing',
            ]);

        $response->assertRedirect(); // Back

        $this->assertDatabaseHas('vendors', [
            'id' => $this->vendor->id,
            'status' => Vendor::STATUS_ACTIVE,
        ]);

        $this->assertDatabaseHas('vendor_state_logs', [
            'vendor_id' => $this->vendor->id,
            'to_status' => Vendor::STATUS_ACTIVE,
            'comment' => 'Approved for testing',
        ]);
    }

    public function test_admin_can_reject_vendor()
    {
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.vendors.reject', $this->vendor), [
                'comment' => 'Rejected for testing',
            ]);

        $response->assertRedirect(); // Back

        $this->assertDatabaseHas('vendors', [
            'id' => $this->vendor->id,
            'status' => Vendor::STATUS_REJECTED,
        ]);
    }

    public function test_admin_cannot_activate_vendor_when_compliance_threshold_not_met()
    {
        $this->vendor->update([
            'status' => Vendor::STATUS_APPROVED,
            'compliance_status' => Vendor::COMPLIANCE_AT_RISK,
            'compliance_score' => 60,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.vendors.activate', $this->vendor), [
                'comment' => 'Trying activation',
            ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('status');

        $this->assertDatabaseHas('vendors', [
            'id' => $this->vendor->id,
            'status' => Vendor::STATUS_APPROVED,
        ]);
    }

    public function test_admin_can_terminate_active_vendor()
    {
        $this->vendor->update([
            'status' => Vendor::STATUS_ACTIVE,
            'activated_at' => now(),
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.vendors.terminate', $this->vendor), [
                'comment' => 'Material compliance breach',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('vendors', [
            'id' => $this->vendor->id,
            'status' => Vendor::STATUS_TERMINATED,
        ]);

        $this->assertDatabaseHas('vendor_state_logs', [
            'vendor_id' => $this->vendor->id,
            'from_status' => Vendor::STATUS_ACTIVE,
            'to_status' => Vendor::STATUS_TERMINATED,
            'comment' => 'Material compliance breach',
        ]);
    }
}
