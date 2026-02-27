<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\ComplianceResult;
use App\Models\ComplianceRule;
use App\Models\PaymentLog;
use App\Models\PaymentRequest;
use App\Models\PerformanceMetric;
use App\Models\PerformanceScore;
use App\Models\ScoreHistory;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorStateLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditTrailImmutabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_audit_logs_cannot_be_updated(): void
    {
        $log = AuditLog::create([
            'event' => AuditLog::EVENT_CREATED,
            'auditable_type' => Vendor::class,
            'auditable_id' => 1,
            'new_values' => ['status' => 'created'],
        ]);

        $this->expectException(\LogicException::class);
        $log->update(['event' => AuditLog::EVENT_UPDATED]);
    }

    public function test_vendor_state_logs_cannot_be_deleted(): void
    {
        $user = User::factory()->create();
        $vendor = Vendor::factory()->create([
            'user_id' => $user->id,
            'status' => Vendor::STATUS_DRAFT,
        ]);

        $stateLog = VendorStateLog::create([
            'vendor_id' => $vendor->id,
            'user_id' => $user->id,
            'from_status' => Vendor::STATUS_DRAFT,
            'to_status' => Vendor::STATUS_SUBMITTED,
            'comment' => 'Initial transition',
        ]);

        $this->expectException(\LogicException::class);
        $stateLog->delete();
    }

    public function test_payment_logs_cannot_be_updated(): void
    {
        $user = User::factory()->create();
        $vendor = Vendor::factory()->create([
            'user_id' => $user->id,
            'status' => Vendor::STATUS_ACTIVE,
            'compliance_status' => Vendor::COMPLIANCE_COMPLIANT,
            'compliance_score' => 90,
        ]);

        $payment = PaymentRequest::create([
            'vendor_id' => $vendor->id,
            'requested_by' => $user->id,
            'reference_number' => 'PAY-IMMUTABLE-001',
            'amount' => 1000,
            'description' => 'Immutability test',
            'status' => PaymentRequest::STATUS_PENDING_OPS,
        ]);

        $log = PaymentLog::create([
            'payment_request_id' => $payment->id,
            'user_id' => $user->id,
            'status' => PaymentRequest::STATUS_PENDING_OPS,
            'comment' => 'Created',
        ]);

        $this->expectException(\LogicException::class);
        $log->update(['comment' => 'Edited']);
    }

    public function test_compliance_results_cannot_be_deleted(): void
    {
        $user = User::factory()->create();
        $vendor = Vendor::factory()->create([
            'user_id' => $user->id,
            'status' => Vendor::STATUS_ACTIVE,
        ]);

        $rule = ComplianceRule::create([
            'name' => 'Immutable Rule',
            'description' => 'Immutable test rule',
            'type' => ComplianceRule::TYPE_CUSTOM,
            'conditions' => [],
            'severity' => ComplianceRule::SEVERITY_LOW,
            'penalty_points' => 0,
            'blocks_payment' => false,
            'blocks_activation' => false,
            'is_active' => true,
        ]);

        $result = ComplianceResult::create([
            'vendor_id' => $vendor->id,
            'compliance_rule_id' => $rule->id,
            'status' => ComplianceResult::STATUS_PASS,
            'details' => 'Pass',
            'evaluated_at' => now(),
        ]);

        $this->expectException(\LogicException::class);
        $result->delete();
    }

    public function test_performance_scores_cannot_be_updated(): void
    {
        $user = User::factory()->create();
        $vendor = Vendor::factory()->create([
            'user_id' => $user->id,
            'status' => Vendor::STATUS_ACTIVE,
        ]);

        $metric = PerformanceMetric::create([
            'name' => 'delivery_timeliness',
            'display_name' => 'Delivery Timeliness',
            'weight' => 1.0,
            'max_score' => 100,
            'is_active' => true,
        ]);

        $score = PerformanceScore::create([
            'vendor_id' => $vendor->id,
            'performance_metric_id' => $metric->id,
            'scored_by' => $user->id,
            'score' => 80,
            'period_start' => now()->startOfMonth()->toDateString(),
            'period_end' => now()->endOfMonth()->toDateString(),
        ]);

        $this->expectException(\LogicException::class);
        $score->update(['score' => 90]);
    }

    public function test_score_history_records_cannot_be_deleted(): void
    {
        $user = User::factory()->create();
        $vendor = Vendor::factory()->create([
            'user_id' => $user->id,
            'status' => Vendor::STATUS_ACTIVE,
        ]);

        $history = ScoreHistory::create([
            'vendor_id' => $vendor->id,
            'user_id' => $user->id,
            'performance_score' => 75,
            'source' => 'system',
            'metadata' => ['reason' => 'test'],
            'recorded_at' => now(),
        ]);

        $this->expectException(\LogicException::class);
        $history->delete();
    }
}
