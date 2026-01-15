<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentRequest;
use App\Models\Vendor;
use App\Models\VendorDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Response;

class ReportController extends Controller
{
    /**
     * Payment Report - View payment data with filters
     */
    public function paymentReport(Request $request)
    {
        $query = PaymentRequest::with('vendor:id,company_name');

        // Date range filter
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Get data
        $payments = $query->orderBy('created_at', 'desc')->paginate(20);

        // Calculate summary stats
        $stats = [
            'total_amount' => PaymentRequest::sum('amount'),
            'pending_count' => PaymentRequest::whereIn('status', ['requested', 'pending_ops', 'pending_finance'])->count(),
            'pending_amount' => PaymentRequest::whereIn('status', ['requested', 'pending_ops', 'pending_finance'])->sum('amount'),
            'approved_count' => PaymentRequest::where('status', 'approved')->count(),
            'approved_amount' => PaymentRequest::where('status', 'approved')->sum('amount'),
            'paid_count' => PaymentRequest::where('status', 'paid')->count(),
            'paid_amount' => PaymentRequest::where('status', 'paid')->sum('amount'),
            'rejected_count' => PaymentRequest::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Reports/PaymentReport', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'status' => $request->status ?? 'all',
            ],
        ]);
    }

    /**
     * Export report as CSV
     */
    public function exportCsv(Request $request, string $type)
    {
        if ($type === 'payment') {
            return $this->exportPaymentCsv($request);
        }

        if ($type === 'vendor_summary' || $type === 'vendor') {
            return $this->exportVendorCsv($request);
        }

        if ($type === 'performance') {
            return $this->exportPerformanceCsv($request);
        }

        if ($type === 'compliance' || $type === 'compliance_report') {
            return $this->exportComplianceCsv($request);
        }

        if ($type === 'document_expiry') {
            return $this->exportDocumentExpiryCsv($request);
        }

        abort(404, 'Report type not found');
    }

    /**
     * Export payment data as CSV
     */
    private function exportPaymentCsv(Request $request)
    {
        $query = PaymentRequest::with('vendor:id,company_name');

        // Apply same filters as view
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $payments = $query->orderBy('created_at', 'desc')->get();

        // Build CSV content
        $headers = ['ID', 'Vendor', 'Invoice Number', 'Amount (₹)', 'Status', 'Requested Date', 'Notes'];
        $rows = [];

        foreach ($payments as $payment) {
            $rows[] = [
                $payment->id,
                $payment->vendor->company_name ?? 'N/A',
                $payment->invoice_number ?? 'N/A',
                number_format($payment->amount, 2),
                ucfirst(str_replace('_', ' ', $payment->status)),
                $payment->created_at->format('Y-m-d H:i'),
                $payment->notes ?? '',
            ];
        }

        // Generate CSV
        $filename = 'payment_report_' . now()->format('Y-m-d_His') . '.csv';
        $handle = fopen('php://temp', 'r+');

        fputcsv($handle, $headers);
        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Export vendor data as CSV
     */
    private function exportVendorCsv(Request $request)
    {
        $query = Vendor::query();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->filled('compliance') && $request->compliance !== 'all') {
            $query->where('compliance_status', $request->compliance);
        }

        $vendors = $query->orderBy('created_at', 'desc')->get();

        $headers = ['ID', 'Company Name', 'Contact Person', 'Email', 'Status', 'Compliance Status', 'Compliance Score', 'Performance Score', 'Registered On'];
        $rows = [];

        foreach ($vendors as $vendor) {
            $rows[] = [
                $vendor->id,
                $vendor->company_name,
                $vendor->contact_person ?? 'N/A',
                $vendor->contact_email ?? 'N/A',
                ucfirst(str_replace('_', ' ', $vendor->status)),
                ucfirst(str_replace('_', ' ', $vendor->compliance_status ?? 'pending')),
                $vendor->compliance_score ?? 0,
                $vendor->performance_score ?? 0,
                $vendor->created_at->format('Y-m-d'),
            ];
        }

        $filename = 'vendor_summary_' . now()->format('Y-m-d_His') . '.csv';
        $handle = fopen('php://temp', 'r+');

        fputcsv($handle, $headers);
        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Export performance data as CSV
     */
    private function exportPerformanceCsv(Request $request)
    {
        $query = Vendor::where('status', 'active');

        if ($request->filled('min_score')) {
            $query->where('performance_score', '>=', $request->min_score);
        }

        $vendors = $query->orderBy('performance_score', 'desc')->get();

        $headers = ['Rank', 'Company Name', 'Performance Score', 'Compliance Score', 'Status'];
        $rows = [];

        $rank = 1;
        foreach ($vendors as $vendor) {
            $rows[] = [
                $rank++,
                $vendor->company_name,
                $vendor->performance_score ?? 0,
                $vendor->compliance_score ?? 0,
                ucfirst($vendor->status),
            ];
        }

        $filename = 'performance_report_' . now()->format('Y-m-d_His') . '.csv';
        $handle = fopen('php://temp', 'r+');

        fputcsv($handle, $headers);
        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Export compliance data as CSV
     */
    private function exportComplianceCsv(Request $request)
    {
        $query = Vendor::query();

        if ($request->filled('compliance_status') && $request->compliance_status !== 'all') {
            $query->where('compliance_status', $request->compliance_status);
        }

        $vendors = $query->orderBy('compliance_score', 'asc')->get();

        $headers = ['ID', 'Company Name', 'Compliance Status', 'Compliance Score', 'Vendor Status', 'Registered On'];
        $rows = [];

        foreach ($vendors as $vendor) {
            $rows[] = [
                $vendor->id,
                $vendor->company_name,
                ucfirst(str_replace('_', ' ', $vendor->compliance_status ?? 'pending')),
                $vendor->compliance_score ?? 0,
                ucfirst($vendor->status),
                $vendor->created_at->format('Y-m-d'),
            ];
        }

        $filename = 'compliance_report_' . now()->format('Y-m-d_His') . '.csv';
        $handle = fopen('php://temp', 'r+');

        fputcsv($handle, $headers);
        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Export document expiry data as CSV
     */
    private function exportDocumentExpiryCsv(Request $request)
    {
        $query = VendorDocument::with(['vendor', 'documentType'])
            ->whereNotNull('expiry_date');

        $startDate = $request->filled('start_date') ? $request->start_date : now()->format('Y-m-d');
        $endDate = $request->filled('end_date') ? $request->end_date : now()->addDays(30)->format('Y-m-d');

        $query->whereBetween('expiry_date', [$startDate, $endDate]);

        $documents = $query->orderBy('expiry_date', 'asc')->get();

        $headers = ['Vendor', 'Document Type', 'File Name', 'Expiry Date', 'Days Until Expiry'];
        $rows = [];

        foreach ($documents as $doc) {
            $daysUntil = $doc->expiry_date ? now()->diffInDays($doc->expiry_date, false) : null;
            $rows[] = [
                $doc->vendor?->company_name ?? 'N/A',
                $doc->documentType?->display_name ?? 'N/A',
                $doc->file_name,
                $doc->expiry_date ? $doc->expiry_date->format('Y-m-d') : 'N/A',
                $daysUntil !== null ? ($daysUntil < 0 ? 'Expired' : $daysUntil . ' days') : 'Unknown',
            ];
        }

        $filename = 'document_expiry_' . now()->format('Y-m-d_His') . '.csv';
        $handle = fopen('php://temp', 'r+');

        fputcsv($handle, $headers);
        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Vendor Summary Report - Overview of all vendors
     */
    public function vendorSummaryReport(Request $request)
    {
        $query = Vendor::query();

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Compliance filter
        if ($request->filled('compliance') && $request->compliance !== 'all') {
            $query->where('compliance_status', $request->compliance);
        }

        // Get vendors with pagination
        $vendors = $query->select([
            'id',
            'company_name',
            'contact_person',
            'contact_email',
            'status',
            'compliance_status',
            'compliance_score',
            'performance_score',
            'created_at'
        ])->orderBy('created_at', 'desc')->paginate(20);

        // Summary stats
        $stats = [
            'total' => Vendor::count(),
            'active' => Vendor::where('status', 'active')->count(),
            'pending' => Vendor::whereIn('status', ['submitted', 'under_review'])->count(),
            'suspended' => Vendor::where('status', 'suspended')->count(),
            'compliant' => Vendor::where('compliance_status', 'compliant')->count(),
            'non_compliant' => Vendor::where('compliance_status', 'non_compliant')->count(),
            'avg_compliance_score' => round(Vendor::avg('compliance_score') ?? 0),
            'avg_performance_score' => round(Vendor::avg('performance_score') ?? 0),
        ];

        return Inertia::render('Admin/Reports/VendorSummaryReport', [
            'vendors' => $vendors,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status ?? 'all',
                'compliance' => $request->compliance ?? 'all',
            ],
        ]);
    }

    /**
     * Performance Report - Vendor performance scores and trends
     */
    public function performanceReport(Request $request)
    {
        $query = Vendor::where('status', 'active');

        // Score filter
        if ($request->filled('min_score')) {
            $query->where('performance_score', '>=', $request->min_score);
        }

        // Get vendors with performance data
        $vendors = $query->select([
            'id',
            'company_name',
            'performance_score',
            'compliance_score',
            'status',
            'created_at'
        ])->orderBy('performance_score', 'desc')->paginate(20);

        // Performance distribution
        $stats = [
            'total_active' => Vendor::where('status', 'active')->count(),
            'avg_performance' => round(Vendor::where('status', 'active')->avg('performance_score') ?? 0),
            'high_performers' => Vendor::where('status', 'active')->where('performance_score', '>=', 80)->count(),
            'medium_performers' => Vendor::where('status', 'active')->whereBetween('performance_score', [50, 79])->count(),
            'low_performers' => Vendor::where('status', 'active')->where('performance_score', '<', 50)->count(),
            'top_scorer' => Vendor::where('status', 'active')->orderBy('performance_score', 'desc')->first()?->company_name ?? 'N/A',
        ];

        return Inertia::render('Admin/Reports/PerformanceReport', [
            'vendors' => $vendors,
            'stats' => $stats,
            'filters' => [
                'min_score' => $request->min_score ?? '',
            ],
        ]);
    }

    /**
     * Compliance Report - Detailed compliance status and rule violations
     */
    public function complianceReport(Request $request)
    {
        $query = Vendor::query();

        // Status filter
        if ($request->filled('compliance_status') && $request->compliance_status !== 'all') {
            $query->where('compliance_status', $request->compliance_status);
        }

        $vendors = $query->select([
            'id',
            'company_name',
            'compliance_status',
            'compliance_score',
            'status',
            'created_at'
        ])->orderBy('compliance_score', 'asc')->paginate(20);

        // Stats
        $stats = [
            'total_vendors' => Vendor::count(),
            'compliant' => Vendor::where('compliance_status', 'compliant')->count(),
            'non_compliant' => Vendor::where('compliance_status', 'non_compliant')->count(),
            'pending' => Vendor::where('compliance_status', 'pending')->orWhereNull('compliance_status')->count(),
            'avg_score' => round(Vendor::avg('compliance_score') ?? 0),
        ];

        return Inertia::render('Admin/Reports/ComplianceReport', [
            'vendors' => $vendors,
            'stats' => $stats,
            'filters' => [
                'compliance_status' => $request->compliance_status ?? 'all',
            ],
        ]);
    }

    /**
     * Document Expiry Report - Documents expiring within selected date range
     */
    public function documentExpiryReport(Request $request)
    {
        $query = VendorDocument::with(['vendor', 'documentType'])
            ->whereNotNull('expiry_date');

        // Date range filter (default: next 30 days)
        $startDate = $request->filled('start_date') ? $request->start_date : now()->format('Y-m-d');
        $endDate = $request->filled('end_date') ? $request->end_date : now()->addDays(30)->format('Y-m-d');

        $query->whereBetween('expiry_date', [$startDate, $endDate]);

        $documents = $query->orderBy('expiry_date', 'asc')->paginate(20);

        // Format dates for display
        $documents->getCollection()->transform(function ($doc) {
            $doc->expiry_formatted = $doc->expiry_date ? $doc->expiry_date->format('Y-m-d') : 'N/A';
            $doc->days_until_expiry = $doc->expiry_date ? now()->diffInDays($doc->expiry_date, false) : null;
            return $doc;
        });

        // Stats
        $stats = [
            'expiring_7_days' => VendorDocument::whereNotNull('expiry_date')
                ->whereBetween('expiry_date', [now(), now()->addDays(7)])->count(),
            'expiring_30_days' => VendorDocument::whereNotNull('expiry_date')
                ->whereBetween('expiry_date', [now(), now()->addDays(30)])->count(),
            'expired' => VendorDocument::whereNotNull('expiry_date')
                ->where('expiry_date', '<', now())->count(),
            'total_with_expiry' => VendorDocument::whereNotNull('expiry_date')->count(),
        ];

        return Inertia::render('Admin/Reports/DocumentExpiryReport', [
            'documents' => $documents,
            'stats' => $stats,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
