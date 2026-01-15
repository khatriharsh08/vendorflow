<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\PaymentRequest;
use App\Models\VendorDocument;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Stats
        $stats = [
            'total_vendors' => Vendor::count(),
            'active_vendors' => Vendor::where('status', 'active')->count(),
            'pending_review' => Vendor::whereIn('status', ['submitted', 'under_review'])->count(),
            'non_compliant' => Vendor::whereIn('compliance_status', ['non_compliant', 'blocked'])->count(),
            'pending_payments' => PaymentRequest::whereIn('status', ['requested', 'pending_ops', 'pending_finance'])->count(),
            'approved_payments' => PaymentRequest::where('status', 'approved')->sum('amount'),
        ];

        // Pending vendor applications
        $pendingVendors = Vendor::with('user')
            ->whereIn('status', ['submitted', 'under_review'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($vendor) {
                return [
                    'id' => $vendor->id,
                    'company_name' => $vendor->company_name,
                    'contact_person' => $vendor->contact_person,
                    'status' => $vendor->status,
                    'submitted_at' => $vendor->submitted_at?->format('M d, Y'),
                    'email' => $vendor->user?->email,
                ];
            });

        // Documents pending verification
        $pendingDocuments = VendorDocument::with(['vendor', 'documentType'])
            ->where('verification_status', 'pending')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'vendor_name' => $doc->vendor?->company_name,
                    'document_type' => $doc->documentType?->display_name,
                    'uploaded_at' => $doc->created_at?->format('M d, Y'),
                ];
            });

        // Recent pending payments for Finance
        $pendingPayments = PaymentRequest::with('vendor')
            ->whereIn('status', ['requested', 'pending_ops', 'pending_finance'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'vendor_name' => $payment->vendor?->company_name,
                    'amount' => $payment->amount,
                    'status' => $payment->status,
                    'created_at' => $payment->created_at->format('M d, Y'),
                ];
            });

        // Recent activity (uses audit logs if available)
        $recentActivity = [];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'pendingVendors' => $pendingVendors,
            'pendingDocuments' => $pendingDocuments,
            'pendingPayments' => $pendingPayments,
            'recentActivity' => $recentActivity,
        ]);
    }
}
