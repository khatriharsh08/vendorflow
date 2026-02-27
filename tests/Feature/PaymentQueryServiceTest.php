<?php

namespace Tests\Feature;

use App\Models\PaymentRequest;
use App\Models\User;
use App\Models\Vendor;
use App\Services\PaymentQueryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class PaymentQueryServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_index_data_returns_filtered_payments_and_stats(): void
    {
        $vendorUser = User::factory()->create();
        $vendor = Vendor::factory()->create([
            'user_id' => $vendorUser->id,
            'status' => Vendor::STATUS_ACTIVE,
            'compliance_status' => Vendor::COMPLIANCE_COMPLIANT,
        ]);

        PaymentRequest::create([
            'vendor_id' => $vendor->id,
            'requested_by' => $vendorUser->id,
            'reference_number' => 'PAY-SVC-001',
            'amount' => 1000,
            'description' => 'Pending ops',
            'status' => PaymentRequest::STATUS_PENDING_OPS,
        ]);

        PaymentRequest::create([
            'vendor_id' => $vendor->id,
            'requested_by' => $vendorUser->id,
            'reference_number' => 'PAY-SVC-002',
            'amount' => 2000,
            'description' => 'Approved',
            'status' => PaymentRequest::STATUS_APPROVED,
        ]);

        PaymentRequest::create([
            'vendor_id' => $vendor->id,
            'requested_by' => $vendorUser->id,
            'reference_number' => 'PAY-SVC-003',
            'amount' => 3000,
            'description' => 'Paid',
            'status' => PaymentRequest::STATUS_PAID,
        ]);

        $request = Request::create('/admin/payments', 'GET', ['status' => 'approved']);

        /** @var PaymentQueryService $service */
        $service = app(PaymentQueryService::class);
        $data = $service->adminIndexData($request);

        $this->assertSame('approved', $data['currentStatus']);
        $this->assertSame(3, $data['stats']['total']);
        $this->assertSame(1, $data['stats']['pending']);
        $this->assertSame(1, $data['stats']['approved']);
        $this->assertSame(3000.0, $data['stats']['paid']);
        $this->assertCount(1, $data['payments']->items());
        $this->assertSame('PAY-SVC-002', $data['payments']->items()[0]->reference_number);
    }
}
