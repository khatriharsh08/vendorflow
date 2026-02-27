<?php

namespace App\Services;

use App\Models\ComplianceResult;
use App\Models\ComplianceRule;
use App\Models\Vendor;

class ComplianceDashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function dashboardData(): array
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
            ->whereIn('id', ComplianceResult::latestResultIdsQuery())
            ->where('status', ComplianceResult::STATUS_FAIL)
            ->orderByDesc('evaluated_at')
            ->take(10)
            ->get();

        $rules = ComplianceRule::withCount([
            'results as failures_count' => fn ($q) => $q
                ->whereIn('compliance_results.id', ComplianceResult::latestResultIdsQuery())
                ->where('status', ComplianceResult::STATUS_FAIL),
        ])->get();

        return [
            'stats' => $stats,
            'atRiskVendors' => $atRiskVendors,
            'recentResults' => $recentResults,
            'rules' => $rules,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function vendorDetailData(Vendor $vendor): array
    {
        $results = ComplianceResult::with('rule')
            ->where('vendor_id', $vendor->id)
            ->whereIn('id', ComplianceResult::latestResultIdsQuery($vendor->id))
            ->orderByDesc('evaluated_at')
            ->get();

        $grouped = $results->groupBy('status');

        return [
            'vendor' => $vendor->load('user'),
            'results' => $results,
            'summary' => [
                'passing' => $grouped->get(ComplianceResult::STATUS_PASS, collect())->count(),
                'failing' => $grouped->get(ComplianceResult::STATUS_FAIL, collect())->count(),
                'warnings' => $grouped->get(ComplianceResult::STATUS_WARNING, collect())->count(),
            ],
        ];
    }
}
