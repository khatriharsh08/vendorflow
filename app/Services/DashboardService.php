<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\PaymentRequest;
use App\Models\Vendor;
use App\Models\VendorDocument;
use Illuminate\Support\Collection;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function adminDashboardData(): array
    {
        return [
            'stats' => $this->stats(),
            'pendingVendors' => $this->pendingVendors(),
            'pendingDocuments' => $this->pendingDocuments(),
            'pendingPayments' => $this->pendingPayments(),
            'recentActivity' => $this->recentActivity(),
        ];
    }

    /**
     * @return array<string, int|float>
     */
    public function stats(): array
    {
        return [
            'total_vendors' => Vendor::count(),
            'active_vendors' => Vendor::where('status', Vendor::STATUS_ACTIVE)->count(),
            'pending_review' => Vendor::whereIn('status', [Vendor::STATUS_SUBMITTED, Vendor::STATUS_UNDER_REVIEW])->count(),
            'non_compliant' => Vendor::whereIn('compliance_status', [Vendor::COMPLIANCE_NON_COMPLIANT, Vendor::COMPLIANCE_BLOCKED])->count(),
            'pending_payments' => PaymentRequest::whereIn('status', [
                PaymentRequest::STATUS_REQUESTED,
                PaymentRequest::STATUS_PENDING_OPS,
                PaymentRequest::STATUS_PENDING_FINANCE,
            ])->count(),
            'approved_payments' => (float) PaymentRequest::where('status', PaymentRequest::STATUS_APPROVED)->sum('amount'),
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function pendingVendors(): Collection
    {
        return Vendor::with('user')
            ->whereIn('status', [Vendor::STATUS_SUBMITTED, Vendor::STATUS_UNDER_REVIEW])
            ->latest()
            ->take(5)
            ->get()
            ->map(function (Vendor $vendor) {
                return [
                    'id' => $vendor->id,
                    'company_name' => $vendor->company_name,
                    'contact_person' => $vendor->contact_person,
                    'status' => $vendor->status,
                    'submitted_at' => $vendor->submitted_at?->format('M d, Y'),
                    'email' => $vendor->user?->email,
                ];
            });
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function pendingDocuments(): Collection
    {
        return VendorDocument::with(['vendor', 'documentType'])
            ->where('verification_status', VendorDocument::STATUS_PENDING)
            ->latest()
            ->take(5)
            ->get()
            ->map(function (VendorDocument $doc) {
                return [
                    'id' => $doc->id,
                    'vendor_name' => $doc->vendor?->company_name,
                    'document_type' => $doc->documentType?->display_name,
                    'uploaded_at' => $doc->created_at?->format('M d, Y'),
                ];
            });
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function pendingPayments(): Collection
    {
        return PaymentRequest::with('vendor')
            ->whereIn('status', [
                PaymentRequest::STATUS_REQUESTED,
                PaymentRequest::STATUS_PENDING_OPS,
                PaymentRequest::STATUS_PENDING_FINANCE,
            ])
            ->latest()
            ->take(5)
            ->get()
            ->map(function (PaymentRequest $payment) {
                return [
                    'id' => $payment->id,
                    'vendor_name' => $payment->vendor?->company_name,
                    'amount' => $payment->amount,
                    'status' => $payment->status,
                    'created_at' => $payment->created_at?->format('M d, Y'),
                ];
            });
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function recentActivity(): Collection
    {
        return AuditLog::with('user')
            ->latest()
            ->take(10)
            ->get()
            ->map(function (AuditLog $log) {
                return [
                    'id' => $log->id,
                    'event' => $log->event_display,
                    'event_key' => $log->event,
                    'actor' => $log->user?->name ?? 'System',
                    'model' => class_basename($log->auditable_type),
                    'model_id' => $log->auditable_id,
                    'reason' => $log->reason,
                    'created_at' => $log->created_at?->format('M d, Y H:i'),
                ];
            });
    }
}
