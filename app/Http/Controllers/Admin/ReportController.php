<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    protected ReportService $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Reports dashboard overview.
     */
    public function index()
    {
        $this->authorize('viewReports');

        return Inertia::render('Admin/Reports/Index', [
            'stats' => $this->reportService->dashboardStats(),
        ]);
    }

    /**
     * Payment Report - View payment data with filters.
     */
    public function paymentReport(Request $request)
    {
        $this->authorize('viewReports');

        $data = $this->reportService->paymentReportData($request);

        return Inertia::render('Admin/Reports/PaymentReport', [
            'payments' => $data['payments'],
            'stats' => $data['stats'],
            'filters' => $data['filters'],
        ]);
    }

    /**
     * Export report as CSV.
     */
    public function exportCsv(Request $request, string $type)
    {
        $this->authorize('exportReports');

        return $this->reportService->exportCsvByType($request, $type);
    }

    /**
     * Vendor Summary Report - Overview of all vendors.
     */
    public function vendorSummaryReport(Request $request)
    {
        $this->authorize('viewReports');

        $data = $this->reportService->vendorSummaryReportData($request);

        return Inertia::render('Admin/Reports/VendorSummaryReport', [
            'vendors' => $data['vendors'],
            'stats' => $data['stats'],
            'filters' => $data['filters'],
        ]);
    }

    /**
     * Performance Report - Vendor performance scores and trends.
     */
    public function performanceReport(Request $request)
    {
        $this->authorize('viewReports');

        $data = $this->reportService->performanceReportData($request);

        return Inertia::render('Admin/Reports/PerformanceReport', [
            'vendors' => $data['vendors'],
            'stats' => $data['stats'],
            'filters' => $data['filters'],
        ]);
    }

    /**
     * Compliance Report - Detailed compliance status and rule violations.
     */
    public function complianceReport(Request $request)
    {
        $this->authorize('viewReports');

        $data = $this->reportService->complianceReportData($request);

        return Inertia::render('Admin/Reports/ComplianceReport', [
            'vendors' => $data['vendors'],
            'stats' => $data['stats'],
            'filters' => $data['filters'],
        ]);
    }

    /**
     * Document Expiry Report - Documents expiring within selected date range.
     */
    public function documentExpiryReport(Request $request)
    {
        $this->authorize('viewReports');

        $data = $this->reportService->documentExpiryReportData($request);

        return Inertia::render('Admin/Reports/DocumentExpiryReport', [
            'documents' => $data['documents'],
            'stats' => $data['stats'],
            'filters' => $data['filters'],
        ]);
    }
}
