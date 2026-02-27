<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\DocumentType;
use App\Models\PaymentRequest;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorDocument;
use App\Services\DashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_data_includes_stats_pending_items_and_activity(): void
    {
        $vendorUser = User::factory()->create();
        $actor = User::factory()->create(['name' => 'Ops Actor']);

        $vendor = Vendor::factory()->create([
            'user_id' => $vendorUser->id,
            'status' => Vendor::STATUS_SUBMITTED,
            'compliance_status' => Vendor::COMPLIANCE_NON_COMPLIANT,
        ]);

        $documentType = DocumentType::create([
            'name' => 'tax_certificate',
            'display_name' => 'Tax Certificate',
            'is_mandatory' => true,
            'is_active' => true,
        ]);

        VendorDocument::create([
            'vendor_id' => $vendor->id,
            'document_type_id' => $documentType->id,
            'file_name' => 'tax.pdf',
            'file_path' => 'vendor-documents/tax.pdf',
            'file_hash' => hash('sha256', 'tax'),
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
            'version' => 1,
            'is_current' => true,
            'verification_status' => VendorDocument::STATUS_PENDING,
        ]);

        PaymentRequest::create([
            'vendor_id' => $vendor->id,
            'requested_by' => $vendorUser->id,
            'reference_number' => 'PAY-DASH-001',
            'amount' => 1500,
            'description' => 'Pending payment',
            'status' => PaymentRequest::STATUS_PENDING_OPS,
        ]);

        PaymentRequest::create([
            'vendor_id' => $vendor->id,
            'requested_by' => $vendorUser->id,
            'reference_number' => 'PAY-DASH-002',
            'amount' => 2500,
            'description' => 'Approved payment',
            'status' => PaymentRequest::STATUS_APPROVED,
        ]);

        AuditLog::create([
            'user_id' => $actor->id,
            'auditable_type' => Vendor::class,
            'auditable_id' => $vendor->id,
            'event' => AuditLog::EVENT_STATE_CHANGED,
            'old_values' => ['status' => Vendor::STATUS_DRAFT],
            'new_values' => ['status' => Vendor::STATUS_SUBMITTED],
            'reason' => 'Submitted for review',
        ]);

        /** @var DashboardService $service */
        $service = app(DashboardService::class);
        $data = $service->adminDashboardData();

        $this->assertSame(1, $data['stats']['total_vendors']);
        $this->assertSame(1, $data['stats']['pending_review']);
        $this->assertSame(1, $data['stats']['non_compliant']);
        $this->assertSame(1, $data['stats']['pending_payments']);
        $this->assertSame(2500.0, $data['stats']['approved_payments']);

        $this->assertCount(1, $data['pendingVendors']);
        $this->assertCount(1, $data['pendingDocuments']);
        $this->assertCount(1, $data['pendingPayments']);
        $this->assertGreaterThanOrEqual(1, $data['recentActivity']->count());

        $matchingActivity = $data['recentActivity']->first(function (array $activity) {
            return $activity['actor'] === 'Ops Actor'
                && $activity['model'] === 'Vendor'
                && $activity['reason'] === 'Submitted for review';
        });

        $this->assertNotNull($matchingActivity);
    }
}
