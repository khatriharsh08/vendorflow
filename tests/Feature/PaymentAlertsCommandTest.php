<?php

namespace Tests\Feature;

use App\Models\PaymentRequest;
use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use App\Notifications\PaymentDelayAlert;
use App\Notifications\PendingPaymentApprovalsAlert;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PaymentAlertsCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_payment_alert_command_sends_backlog_and_delay_notifications(): void
    {
        Carbon::setTestNow('2026-02-14 10:00:00');

        try {
            Notification::fake();

            Role::firstOrCreate(['name' => 'vendor'], ['display_name' => 'Vendor']);
            Role::firstOrCreate(['name' => 'ops_manager'], ['display_name' => 'Ops Manager']);
            Role::firstOrCreate(['name' => 'finance_manager'], ['display_name' => 'Finance Manager']);
            Role::firstOrCreate(['name' => 'super_admin'], ['display_name' => 'Super Admin']);

            $opsUser = User::factory()->create();
            $opsUser->roles()->attach(Role::where('name', 'ops_manager')->first());

            $financeUser = User::factory()->create();
            $financeUser->roles()->attach(Role::where('name', 'finance_manager')->first());

            $superAdmin = User::factory()->create();
            $superAdmin->roles()->attach(Role::where('name', 'super_admin')->first());

            $vendorUser = User::factory()->create();
            $vendorUser->roles()->attach(Role::where('name', 'vendor')->first());

            $vendor = Vendor::factory()->create([
                'user_id' => $vendorUser->id,
                'status' => Vendor::STATUS_ACTIVE,
                'compliance_status' => Vendor::COMPLIANCE_COMPLIANT,
                'compliance_score' => 90,
            ]);

            $opsPayment = PaymentRequest::create([
                'vendor_id' => $vendor->id,
                'requested_by' => $vendorUser->id,
                'reference_number' => 'PAY-ALERT-OPS',
                'amount' => 1000,
                'description' => 'Ops backlog',
                'status' => PaymentRequest::STATUS_PENDING_OPS,
            ]);
            PaymentRequest::whereKey($opsPayment->id)->update([
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
            ]);

            $financePayment = PaymentRequest::create([
                'vendor_id' => $vendor->id,
                'requested_by' => $vendorUser->id,
                'reference_number' => 'PAY-ALERT-FIN',
                'amount' => 2000,
                'description' => 'Finance backlog',
                'status' => PaymentRequest::STATUS_PENDING_FINANCE,
            ]);
            PaymentRequest::whereKey($financePayment->id)->update([
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
            ]);

            PaymentRequest::create([
                'vendor_id' => $vendor->id,
                'requested_by' => $vendorUser->id,
                'reference_number' => 'PAY-ALERT-DELAY',
                'amount' => 3000,
                'description' => 'Delayed approved payment',
                'status' => PaymentRequest::STATUS_APPROVED,
                'due_date' => now()->subDays(2)->toDateString(),
            ]);

            $this->artisan('vendors:payment-alerts')
                ->assertSuccessful();

            Notification::assertSentTo($opsUser, PendingPaymentApprovalsAlert::class, function ($notification) {
                $data = $notification->toArray(new \stdClass);

                return $data['stage'] === 'ops' && $data['count'] === 1;
            });

            Notification::assertSentTo($financeUser, PendingPaymentApprovalsAlert::class, function ($notification) {
                $data = $notification->toArray(new \stdClass);

                return $data['stage'] === 'finance' && $data['count'] === 1;
            });

            Notification::assertSentTo($vendorUser, PaymentDelayAlert::class);
            Notification::assertSentTo($superAdmin, PendingPaymentApprovalsAlert::class);
            Notification::assertSentTo($superAdmin, PaymentDelayAlert::class);

            $this->assertDatabaseHas('jobs_log', [
                'status' => 'success',
            ]);
        } finally {
            Carbon::setTestNow();
        }
    }
}
