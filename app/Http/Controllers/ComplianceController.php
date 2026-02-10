<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\UpdateComplianceRuleRequest;
use App\Models\ComplianceResult;
use App\Models\ComplianceRule;
use App\Models\Vendor;
use App\Services\ComplianceService;
use Inertia\Inertia;

class ComplianceController extends Controller
{
    protected ComplianceService $complianceService;

    public function __construct(ComplianceService $complianceService)
    {
        $this->complianceService = $complianceService;
    }

    /**
     * Display compliance dashboard.
     */
    public function dashboard()
    {
        $stats = [
            'compliant' => Vendor::where('compliance_status', Vendor::COMPLIANCE_COMPLIANT)->count(),
            'at_risk' => Vendor::where('compliance_status', Vendor::COMPLIANCE_AT_RISK)->count(),
            'non_compliant' => Vendor::where('compliance_status', Vendor::COMPLIANCE_NON_COMPLIANT)->count(),
            'blocked' => Vendor::where('compliance_status', Vendor::COMPLIANCE_BLOCKED)->count(),
        ];

        $atRiskVendors = Vendor::whereIn('compliance_status', [
            Vendor::COMPLIANCE_AT_RISK,
            Vendor::COMPLIANCE_NON_COMPLIANT,
            Vendor::COMPLIANCE_BLOCKED,
        ])
            ->with('user')
            ->orderBy('compliance_score', 'asc')
            ->take(10)
            ->get();

        $recentResults = ComplianceResult::with(['vendor', 'rule'])
            ->where('status', ComplianceResult::STATUS_FAIL)
            ->whereNull('resolved_at')
            ->latest()
            ->take(10)
            ->get();

        $rules = ComplianceRule::withCount([
            'results as failures_count' => fn ($q) => $q->where('status', 'fail')->whereNull('resolved_at'),
        ])->get();

        return Inertia::render('Admin/Compliance/Dashboard', [
            'stats' => $stats,
            'atRiskVendors' => $atRiskVendors,
            'recentResults' => $recentResults,
            'rules' => $rules,
        ]);
    }

    /**
     * Show compliance details for a vendor.
     */
    public function vendorCompliance(Vendor $vendor)
    {
        $results = ComplianceResult::with('rule')
            ->where('vendor_id', $vendor->id)
            ->orderBy('evaluated_at', 'desc')
            ->get();

        $grouped = $results->groupBy('status');

        return Inertia::render('Admin/Compliance/VendorDetail', [
            'vendor' => $vendor->load('user'),
            'results' => $results,
            'summary' => [
                'passing' => $grouped->get('pass', collect())->count(),
                'failing' => $grouped->get('fail', collect())->count(),
                'warnings' => $grouped->get('warning', collect())->count(),
            ],
        ]);
    }

    /**
     * Run compliance evaluation for a vendor.
     */
    public function evaluate(Vendor $vendor)
    {
        $result = $this->complianceService->evaluateVendor($vendor);

        return back()->with('success', "Compliance evaluated. Score: {$result['score']}, Status: {$result['status']}");
    }

    /**
     * Run compliance evaluation for all vendors.
     */
    public function evaluateAll()
    {
        $results = $this->complianceService->evaluateAllVendors();

        return back()->with('success', 'Compliance evaluation completed for '.count($results).' vendors.');
    }

    /**
     * Manage compliance rules.
     */
    public function rules()
    {
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
        $validated = $request->validated();

        $rule->update($validated);

        return back()->with('success', 'Rule updated successfully.');
    }
}
