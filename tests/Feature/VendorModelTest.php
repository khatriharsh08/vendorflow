<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendorModelTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test vendor status helper methods.
     */
    public function test_vendor_status_helpers()
    {
        $vendor = Vendor::factory()->make([
            'status' => Vendor::STATUS_ACTIVE,
            'compliance_status' => Vendor::COMPLIANCE_COMPLIANT,
        ]);

        $this->assertTrue($vendor->isActive());
        $this->assertTrue($vendor->isCompliant());
        $this->assertTrue($vendor->canRequestPayment());

        $suspendedVendor = Vendor::factory()->make([
            'status' => Vendor::STATUS_SUSPENDED,
        ]);

        $this->assertFalse($suspendedVendor->isActive());
        $this->assertFalse($suspendedVendor->canRequestPayment());
    }

    /**
     * Test valid state transitions.
     */
    public function test_vendor_state_transitions()
    {
        $vendor = Vendor::factory()->create([
            'status' => Vendor::STATUS_SUBMITTED,
        ]);

        // Submitted -> Under Review (Valid)
        $this->assertTrue($vendor->canTransitionTo(Vendor::STATUS_UNDER_REVIEW));

        // Submitted -> Active (Invalid - must go through approval)
        $this->assertFalse($vendor->canTransitionTo(Vendor::STATUS_ACTIVE));

        // Perform valid transition
        $admin = User::factory()->create();
        $success = $vendor->transitionTo(Vendor::STATUS_UNDER_REVIEW, $admin, 'Reviewing application');

        $this->assertTrue($success);
        $this->assertEquals(Vendor::STATUS_UNDER_REVIEW, $vendor->fresh()->status);

        // Verify Audit Log (VendorStateLog)
        $this->assertDatabaseHas('vendor_state_logs', [
            'vendor_id' => $vendor->id,
            'from_status' => Vendor::STATUS_SUBMITTED,
            'to_status' => Vendor::STATUS_UNDER_REVIEW,
            'comment' => 'Reviewing application',
        ]);
    }

    /**
     * Test badge class generation.
     */
    public function test_status_badge_classes()
    {
        $vendor = new Vendor;

        $vendor->status = Vendor::STATUS_ACTIVE;
        $this->assertEquals('badge-active', $vendor->getStatusBadgeClass());

        $vendor->status = Vendor::STATUS_REJECTED;
        $this->assertEquals('badge-rejected', $vendor->getStatusBadgeClass());

        $vendor->status = 'unknown_status';
        $this->assertEquals('badge-draft', $vendor->getStatusBadgeClass());
    }
}
