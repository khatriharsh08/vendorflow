<?php

namespace App\Services;

use App\Interfaces\PaymentRepositoryInterface;
use App\Models\AuditLog;
use App\Models\PaymentApproval;
use App\Models\PaymentLog;
use App\Models\PaymentRequest;
use App\Models\User;
use App\Models\Vendor;

class PaymentService
{
    protected ComplianceService $complianceService;

    protected PaymentRepositoryInterface $paymentRepository;

    public function __construct(ComplianceService $complianceService, PaymentRepositoryInterface $paymentRepository)
    {
        $this->complianceService = $complianceService;
        $this->paymentRepository = $paymentRepository;
    }

    /**
     * Create a new payment request.
     */
    public function createRequest(
        Vendor $vendor,
        User $requestedBy,
        float $amount,
        string $description,
        ?string $invoiceNumber = null,
        ?string $dueDate = null
    ): PaymentRequest {
        // Check if vendor can request payments
        $this->validateVendorCanRequestPayment($vendor);

        // Flag potential duplicate requests for manual review.
        $isDuplicate = $this->checkForDuplicates($vendor, $amount, $invoiceNumber);

        $request = $this->paymentRepository->createRequest([
            'vendor_id' => $vendor->id,
            'requested_by' => $requestedBy->id,
            'reference_number' => $this->generateReferenceNumber(),
            'invoice_number' => $invoiceNumber,
            'amount' => $amount,
            'description' => $description,
            'due_date' => $dueDate,
            'status' => PaymentRequest::STATUS_PENDING_OPS,
            'is_duplicate_flagged' => $isDuplicate,
            'is_compliance_blocked' => ! $vendor->isCompliant(),
        ]);

        // Create initial approval record for ops
        $this->paymentRepository->createApproval([
            'payment_request_id' => $request->id,
            'user_id' => null,
            'stage' => PaymentApproval::STAGE_OPS_VALIDATION,
            'action' => PaymentApproval::ACTION_PENDING,
        ]);

        // Log the event
        AuditLog::log(AuditLog::EVENT_CREATED, $request, null, [
            'amount' => $amount,
            'vendor' => $vendor->company_name,
            'is_duplicate_flagged' => $isDuplicate,
        ]);
        $this->recordPaymentLog(
            $request,
            PaymentRequest::STATUS_PENDING_OPS,
            $requestedBy,
            $isDuplicate ? 'Payment request submitted (duplicate flagged for review)' : 'Payment request submitted'
        );

        return $request;
    }

    /**
     * Validate ops (operations validation stage).
     */
    public function validateByOps(PaymentRequest $request, User $opsManager, bool $approve, ?string $comment = null): bool
    {
        if (! in_array($request->status, [PaymentRequest::STATUS_REQUESTED, PaymentRequest::STATUS_PENDING_OPS], true)) {
            throw new \Exception('Payment is not in the correct state for ops validation.');
        }

        if (! $approve && blank($comment)) {
            throw new \Exception('A rejection reason is required.');
        }

        // Update or create the approval record
        $this->paymentRepository->updateOrCreateApproval(
            [
                'payment_request_id' => $request->id,
                'stage' => PaymentApproval::STAGE_OPS_VALIDATION,
            ],
            [
                'user_id' => $opsManager->id,
                'action' => $approve ? PaymentApproval::ACTION_APPROVED : PaymentApproval::ACTION_REJECTED,
                'comment' => $comment,
            ]
        );

        if ($approve) {
            $this->paymentRepository->updateRequest($request, ['status' => PaymentRequest::STATUS_PENDING_FINANCE]);
            $this->recordPaymentLog($request, PaymentRequest::STATUS_PENDING_FINANCE, $opsManager, $comment ?? 'Validated by operations');

            // Create finance approval record
            $this->paymentRepository->createApproval([
                'payment_request_id' => $request->id,
                'user_id' => null,
                'stage' => PaymentApproval::STAGE_FINANCE_APPROVAL,
                'action' => PaymentApproval::ACTION_PENDING,
            ]);

            AuditLog::log(AuditLog::EVENT_APPROVED, $request, null, [
                'stage' => 'ops_validation',
                'approved_by' => $opsManager->name,
            ], $comment);
        } else {
            $this->paymentRepository->updateRequest($request, [
                'status' => PaymentRequest::STATUS_REJECTED,
                'rejection_reason' => $comment,
            ]);
            $this->recordPaymentLog($request, PaymentRequest::STATUS_REJECTED, $opsManager, $comment);

            AuditLog::log(AuditLog::EVENT_REJECTED, $request, null, [
                'stage' => 'ops_validation',
                'rejected_by' => $opsManager->name,
            ], $comment);
        }

        return true;
    }

    /**
     * Approve by finance (final approval stage).
     */
    public function approveByFinance(PaymentRequest $request, User $financeManager, bool $approve, ?string $comment = null): bool
    {
        if ($request->status !== PaymentRequest::STATUS_PENDING_FINANCE) {
            throw new \Exception('Payment is not pending finance approval.');
        }

        // Check compliance before approval - REALTIME CHECK
        if ($approve) {
            $request->loadMissing('vendor');
            $vendor = $request->vendor;

            // Critical: Re-check current vendor compliance status
            if (! $vendor || ! $vendor->isCompliant()) {
                throw new \Exception('Cannot approve payment: Vendor is currently Non-Compliant (Status changed after request).');
            }

            // Auto-unblock legacy requests once vendor becomes compliant again.
            if ($request->is_compliance_blocked) {
                $this->paymentRepository->updateRequest($request, ['is_compliance_blocked' => false]);
                $request->refresh();
            }
        }

        if (! $approve && blank($comment)) {
            throw new \Exception('A rejection reason is required.');
        }

        // Update the approval record
        $this->paymentRepository->updateOrCreateApproval(
            [
                'payment_request_id' => $request->id,
                'stage' => PaymentApproval::STAGE_FINANCE_APPROVAL,
            ],
            [
                'user_id' => $financeManager->id,
                'action' => $approve ? PaymentApproval::ACTION_APPROVED : PaymentApproval::ACTION_REJECTED,
                'comment' => $comment,
            ]
        );

        if ($approve) {
            $this->paymentRepository->updateRequest($request, ['status' => PaymentRequest::STATUS_APPROVED]);
            $this->recordPaymentLog($request, PaymentRequest::STATUS_APPROVED, $financeManager, $comment ?? 'Approved by finance');

            AuditLog::log(AuditLog::EVENT_APPROVED, $request, null, [
                'stage' => 'finance_approval',
                'approved_by' => $financeManager->name,
                'amount' => $request->amount,
            ], $comment);
        } else {
            $this->paymentRepository->updateRequest($request, [
                'status' => PaymentRequest::STATUS_REJECTED,
                'rejection_reason' => $comment,
            ]);
            $this->recordPaymentLog($request, PaymentRequest::STATUS_REJECTED, $financeManager, $comment);

            AuditLog::log(AuditLog::EVENT_REJECTED, $request, null, [
                'stage' => 'finance_approval',
                'rejected_by' => $financeManager->name,
            ], $comment);
        }

        return true;
    }

    /**
     * Mark payment as paid.
     */
    public function markAsPaid(PaymentRequest $request, User $user, string $paymentReference, ?string $paymentMethod = null): bool
    {
        if ($request->status !== PaymentRequest::STATUS_APPROVED) {
            throw new \Exception('Payment has not been approved yet.');
        }

        $this->paymentRepository->updateRequest($request, [
            'status' => PaymentRequest::STATUS_PAID,
            'paid_date' => now(),
            'payment_reference' => $paymentReference,
            'payment_method' => $paymentMethod,
        ]);
        $this->recordPaymentLog($request, PaymentRequest::STATUS_PAID, $user, 'Marked as paid');

        AuditLog::log(AuditLog::EVENT_UPDATED, $request, null, [
            'action' => 'marked_as_paid',
            'payment_reference' => $paymentReference,
            'marked_by' => $user->name,
        ]);

        return true;
    }

    /**
     * Validate that vendor can request payments.
     */
    protected function validateVendorCanRequestPayment(Vendor $vendor): void
    {
        if (! $vendor->isActive() && $vendor->status !== Vendor::STATUS_APPROVED) {
            throw new \Exception('Only approved or active vendors can request payments.');
        }

        if (! $vendor->isCompliant() && $vendor->compliance_status !== Vendor::COMPLIANCE_PENDING) {
            throw new \Exception('Vendor is not compliant (Status: ' . $vendor->compliance_status . '). Please resolve compliance issues first.');
        }
    }

    /**
     * Check for duplicate payment requests.
     */
    protected function checkForDuplicates(Vendor $vendor, float $amount, ?string $invoiceNumber): bool
    {
        return $this->paymentRepository->existsRecentDuplicate($vendor->id, $amount, $invoiceNumber);
    }

    /**
     * Generate unique reference number.
     */
    protected function generateReferenceNumber(): string
    {
        return 'PAY-' . strtoupper(uniqid()) . '-' . date('Ymd');
    }

    protected function recordPaymentLog(PaymentRequest $request, string $status, User $actor, ?string $comment = null): void
    {
        PaymentLog::create([
            'payment_request_id' => $request->id,
            'user_id' => $actor->id,
            'status' => $status,
            'comment' => $comment,
            'metadata' => [
                'reference_number' => $request->reference_number,
                'amount' => $request->amount,
            ],
        ]);
    }
}
