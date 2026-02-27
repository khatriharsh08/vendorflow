<?php

namespace App\Console\Commands;

use App\Models\JobLog;
use App\Models\PaymentRequest;
use App\Models\User;
use App\Notifications\PaymentDelayAlert;
use App\Notifications\PendingPaymentApprovalsAlert;
use Illuminate\Console\Command;

class SendPaymentAlerts extends Command
{
    protected $signature = 'vendors:payment-alerts
        {--approval-hours=48 : Threshold hours for pending approval backlog}
        {--delay-days=7 : Threshold days for approved-but-unpaid payment delay}';

    protected $description = 'Send pending approval and payment delay alerts';

    public function handle(): int
    {
        $startedAt = now();
        $approvalHours = (int) $this->option('approval-hours');
        $delayDays = (int) $this->option('delay-days');

        $jobLog = JobLog::create([
            'job_name' => $this->signature,
            'status' => 'running',
            'started_at' => $startedAt,
            'payload' => [
                'approval_hours' => $approvalHours,
                'delay_days' => $delayDays,
            ],
        ]);

        try {
            $opsBacklog = PaymentRequest::where('status', PaymentRequest::STATUS_PENDING_OPS)
                ->where('created_at', '<=', now()->subHours($approvalHours))
                ->count();

            $financeBacklog = PaymentRequest::where('status', PaymentRequest::STATUS_PENDING_FINANCE)
                ->where('created_at', '<=', now()->subHours($approvalHours))
                ->count();

            $delayedPayments = PaymentRequest::with('vendor.user')
                ->where('status', PaymentRequest::STATUS_APPROVED)
                ->where(function ($query) use ($delayDays) {
                    $query->where('created_at', '<=', now()->subDays($delayDays))
                        ->orWhere(function ($dueDateQuery) {
                            $dueDateQuery->whereNotNull('due_date')
                                ->whereDate('due_date', '<', now()->toDateString());
                        });
                })
                ->get();

            if ($opsBacklog > 0) {
                $opsUsers = User::whereHas('roles', fn ($q) => $q->whereIn('name', ['ops_manager', 'super_admin']))->get();
                foreach ($opsUsers as $user) {
                    $user->notify(new PendingPaymentApprovalsAlert('ops', $opsBacklog, $approvalHours));
                }
            }

            if ($financeBacklog > 0) {
                $financeUsers = User::whereHas('roles', fn ($q) => $q->whereIn('name', ['finance_manager', 'super_admin']))->get();
                foreach ($financeUsers as $user) {
                    $user->notify(new PendingPaymentApprovalsAlert('finance', $financeBacklog, $approvalHours));
                }
            }

            $vendorDelayAlertsSent = 0;
            foreach ($delayedPayments->groupBy('vendor.user_id') as $vendorUserId => $payments) {
                /** @var \App\Models\User|null $vendorUser */
                $vendorUser = optional($payments->first()->vendor)->user;

                if (! $vendorUser || (int) $vendorUser->id !== (int) $vendorUserId) {
                    continue;
                }

                $vendorUser->notify(new PaymentDelayAlert(
                    $payments->count(),
                    (float) $payments->sum('amount'),
                    $delayDays,
                    true
                ));
                $vendorDelayAlertsSent++;
            }

            $staffDelayCount = $delayedPayments->count();
            if ($staffDelayCount > 0) {
                $staffUsers = User::whereHas('roles', fn ($q) => $q->whereIn('name', ['finance_manager', 'ops_manager', 'super_admin']))->get();
                foreach ($staffUsers as $user) {
                    $user->notify(new PaymentDelayAlert(
                        $staffDelayCount,
                        (float) $delayedPayments->sum('amount'),
                        $delayDays
                    ));
                }
            }

            $jobLog->update([
                'status' => 'success',
                'finished_at' => now(),
                'duration_ms' => $startedAt->diffInMilliseconds(now()),
                'result' => [
                    'ops_backlog' => $opsBacklog,
                    'finance_backlog' => $financeBacklog,
                    'delayed_payments' => $staffDelayCount,
                    'vendor_delay_alerts_sent' => $vendorDelayAlertsSent,
                ],
            ]);

            $this->info('Payment alerts processed successfully.');

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $jobLog->update([
                'status' => 'failed',
                'finished_at' => now(),
                'duration_ms' => $startedAt->diffInMilliseconds(now()),
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
