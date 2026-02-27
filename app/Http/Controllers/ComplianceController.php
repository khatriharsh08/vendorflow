<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\UpdateComplianceRuleRequest;
use App\Models\ComplianceRule;
use App\Models\Vendor;
use App\Services\ComplianceDashboardService;
use App\Services\ComplianceService;
use Inertia\Inertia;

class ComplianceController extends Controller
{
    protected ComplianceService $complianceService;

    protected ComplianceDashboardService $dashboardService;

    public function __construct(ComplianceService $complianceService, ComplianceDashboardService $dashboardService)
    {
        $this->complianceService = $complianceService;
        $this->dashboardService = $dashboardService;
    }

    /**
     * Display compliance dashboard.
     */
    public function dashboard()
    {
        $this->authorize('viewCompliance');

        $data = $this->dashboardService->dashboardData();

        return Inertia::render('Admin/Compliance/Dashboard', [
            'stats' => $data['stats'],
            'atRiskVendors' => $data['atRiskVendors'],
            'recentResults' => $data['recentResults'],
            'rules' => $data['rules'],
        ]);
    }

    /**
     * Show compliance details for a vendor.
     */
    public function vendorCompliance(Vendor $vendor)
    {
        $this->authorize('viewCompliance');

        $data = $this->dashboardService->vendorDetailData($vendor);

        return Inertia::render('Admin/Compliance/VendorDetail', [
            'vendor' => $data['vendor'],
            'results' => $data['results'],
            'summary' => $data['summary'],
        ]);
    }

    /**
     * Run compliance evaluation for a vendor.
     */
    public function evaluate(Vendor $vendor)
    {
        $this->authorize('runCompliance');

        $result = $this->complianceService->evaluateVendor($vendor);

        return back()->with('success', "Compliance evaluated. Score: {$result['score']}, Status: {$result['status']}");
    }

    /**
     * Run compliance evaluation for all vendors.
     */
    public function evaluateAll()
    {
        $this->authorize('runCompliance');

        $results = $this->complianceService->evaluateAllVendors();

        return back()->with('success', 'Compliance evaluation completed for '.count($results).' vendors.');
    }

    /**
     * Manage compliance rules.
     */
    public function rules()
    {
        $this->authorize('viewCompliance');

        $rules = ComplianceRule::all();

        return Inertia::render('Admin/Compliance/Rules', [
            'rules' => $rules,
        ]);
    }

    /**
     * Update a compliance rule.
     */
    public function updateRule(UpdateComplianceRuleRequest $request, ComplianceRule $rule)
    {
        $this->authorize('manageComplianceRules');

        $validated = $request->validated();

        $rule->update($validated);

        return back()->with('success', 'Rule updated successfully.');
    }
}
