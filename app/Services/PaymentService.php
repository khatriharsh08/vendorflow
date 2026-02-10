<?php

namespace App\Services;

use App\Interfaces\PaymentRepositoryInterface;
use App\Models\AuditLog;
use App\Models\PaymentApproval;
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

        // Check for duplicate requests
        $this->checkForDuplicates($vendor, $amount, $invoiceNumber);

        $request = $this->paymentRepository->createRequest([
            'vendor_id' => $vendor->id,
            'requested_by' => $requestedBy->id,
            'reference_number' => $this->generateReferenceNumber(),
            'invoice_number' => $invoiceNumber,
            'amount' => $amount,
            'description' => $description,
            'due_date' => $dueDate,
            'status' => PaymentRequest::STATUS_REQUESTED,
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
        ]);

        return $request;
    }

    /**
     * Validate ops (operations validation stage).
     */
    public function validateByOps(PaymentRequest $request, User $opsManager, bool $approve, ?string $comment = null): bool
    {
        if ($request->status !== PaymentRequest::STATUS_REQUESTED) {
            throw new \Exception('Payment is not in the correct state for ops validation.');
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

        // Check compliance before approval
        if ($approve && $request->is_compliance_blocked) {
            throw new \Exception('Cannot approve payment for non-compliant vendor.');
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
        if (! $vendor->isActive()) {
            throw new \Exception('Only active vendors can request payments.');
        }

        if (! $vendor->isCompliant()) {
            throw new \Exception('Vendor is not compliant. Please resolve compliance issues first.');
        }
    }

    /**
     * Check for duplicate payment requests.
     */
    protected function checkForDuplicates(Vendor $vendor, float $amount, ?string $invoiceNumber): void
    {
        if ($this->paymentRepository->existsRecentDuplicate($vendor->id, $amount, $invoiceNumber)) {
            throw new \Exception('A similar payment request already exists within the last 30 days.');
        }
    }

    /**
     * Generate unique reference number.
     */
    protected function generateReferenceNumber(): string
    {
        return 'PAY-'.strtoupper(uniqid()).'-'.date('Ymd');
    }
}
