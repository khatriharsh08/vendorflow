<?php

namespace App\Services;

use App\Models\Vendor;
use App\Models\ComplianceRule;
use App\Models\ComplianceResult;
use App\Models\DocumentType;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ComplianceService
{
    /**
     * Evaluate all active vendors for compliance.
     */
    public function evaluateAllVendors(): array
    {
        $vendors = Vendor::whereIn('status', [
            Vendor::STATUS_APPROVED,
            Vendor::STATUS_ACTIVE,
            Vendor::STATUS_SUSPENDED,
        ])->get();

        $results = [];
        foreach ($vendors as $vendor) {
            $results[$vendor->id] = $this->evaluateVendor($vendor);
        }

        return $results;
    }

    /**
     * Evaluate a single vendor's compliance.
     */
    public function evaluateVendor(Vendor $vendor): array
    {
        $rules = ComplianceRule::active()->get();
        $results = [];
        $totalPenalty = 0;
        $hasBlockingFailure = false;

        foreach ($rules as $rule) {
            $result = $this->evaluateRule($vendor, $rule);
            $results[] = $result;

            if ($result['status'] === ComplianceResult::STATUS_FAIL) {
                $totalPenalty += $rule->penalty_points;
                
                if ($rule->blocks_payment || $rule->blocks_activation) {
                    $hasBlockingFailure = true;
                }
            }
        }

        // Calculate compliance score (100 - penalty, min 0)
        $complianceScore = max(0, 100 - $totalPenalty);

        // Determine compliance status
        $complianceStatus = $this->determineComplianceStatus($complianceScore, $hasBlockingFailure);

        // Update vendor
        $vendor->update([
            'compliance_score' => $complianceScore,
            'compliance_status' => $complianceStatus,
        ]);

        return [
            'vendor_id' => $vendor->id,
            'score' => $complianceScore,
            'status' => $complianceStatus,
            'rules_evaluated' => count($results),
            'failures' => collect($results)->where('status', ComplianceResult::STATUS_FAIL)->count(),
        ];
    }

    /**
     * Evaluate a single rule against a vendor.
     */
    protected function evaluateRule(Vendor $vendor, ComplianceRule $rule): array
    {
        $status = ComplianceResult::STATUS_PASS;
        $details = '';
        $metadata = [];

        switch ($rule->type) {
            case ComplianceRule::TYPE_DOCUMENT_REQUIRED:
                $result = $this->checkRequiredDocuments($vendor, $rule);
                $status = $result['status'];
                $details = $result['details'];
                $metadata = $result['metadata'];
                break;

            case ComplianceRule::TYPE_DOCUMENT_EXPIRY:
                $result = $this->checkDocumentExpiry($vendor, $rule);
                $status = $result['status'];
                $details = $result['details'];
                $metadata = $result['metadata'];
                break;

            case ComplianceRule::TYPE_PERFORMANCE_THRESHOLD:
                $result = $this->checkPerformanceThreshold($vendor, $rule);
                $status = $result['status'];
                $details = $result['details'];
                break;

            default:
                // Custom rules can be handled here
                break;
        }

        // Store the result
        ComplianceResult::updateOrCreate(
            [
                'vendor_id' => $vendor->id,
                'compliance_rule_id' => $rule->id,
            ],
            [
                'status' => $status,
                'details' => $details,
                'metadata' => $metadata,
                'evaluated_at' => now(),
                'resolved_at' => $status === ComplianceResult::STATUS_PASS ? now() : null,
            ]
        );

        return [
            'rule_id' => $rule->id,
            'rule_name' => $rule->name,
            'status' => $status,
            'details' => $details,
        ];
    }

    /**
     * Check if vendor has all required documents.
     */
    protected function checkRequiredDocuments(Vendor $vendor, ComplianceRule $rule): array
    {
        $mandatoryTypes = DocumentType::where('is_mandatory', true)->pluck('id');
        $uploadedTypes = $vendor->documents()
            ->where('is_current', true)
            ->where('verification_status', 'verified')
            ->pluck('document_type_id');

        $missingTypes = $mandatoryTypes->diff($uploadedTypes);

        if ($missingTypes->isEmpty()) {
            return [
                'status' => ComplianceResult::STATUS_PASS,
                'details' => 'All mandatory documents are verified.',
                'metadata' => [],
            ];
        }

        $missingNames = DocumentType::whereIn('id', $missingTypes)->pluck('display_name')->toArray();

        return [
            'status' => ComplianceResult::STATUS_FAIL,
            'details' => 'Missing mandatory documents: ' . implode(', ', $missingNames),
            'metadata' => ['missing_document_ids' => $missingTypes->toArray()],
        ];
    }

    /**
     * Check if any documents are expiring soon or expired.
     */
    protected function checkDocumentExpiry(Vendor $vendor, ComplianceRule $rule): array
    {
        $warningDays = $rule->conditions['warning_days'] ?? 15;
        $warningDate = Carbon::now()->addDays($warningDays);

        $expiringDocs = $vendor->documents()
            ->where('is_current', true)
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', $warningDate)
            ->with('documentType')
            ->get();

        $expiredDocs = $expiringDocs->filter(fn($doc) => Carbon::parse($doc->expiry_date)->isPast());
        $soonToExpire = $expiringDocs->filter(fn($doc) => !Carbon::parse($doc->expiry_date)->isPast());

        if ($expiredDocs->isNotEmpty()) {
            return [
                'status' => ComplianceResult::STATUS_FAIL,
                'details' => 'Expired documents: ' . $expiredDocs->pluck('documentType.display_name')->implode(', '),
                'metadata' => ['expired_document_ids' => $expiredDocs->pluck('id')->toArray()],
            ];
        }

        if ($soonToExpire->isNotEmpty()) {
            return [
                'status' => ComplianceResult::STATUS_WARNING,
                'details' => 'Documents expiring soon: ' . $soonToExpire->pluck('documentType.display_name')->implode(', '),
                'metadata' => ['expiring_document_ids' => $soonToExpire->pluck('id')->toArray()],
            ];
        }

        return [
            'status' => ComplianceResult::STATUS_PASS,
            'details' => 'No document expiry issues.',
            'metadata' => [],
        ];
    }

    /**
     * Check if vendor meets performance threshold.
     */
    protected function checkPerformanceThreshold(Vendor $vendor, ComplianceRule $rule): array
    {
        $threshold = $rule->conditions['min_score'] ?? 50;

        if ($vendor->performance_score >= $threshold) {
            return [
                'status' => ComplianceResult::STATUS_PASS,
                'details' => "Performance score ({$vendor->performance_score}) meets threshold ({$threshold}).",
            ];
        }

        return [
            'status' => ComplianceResult::STATUS_FAIL,
            'details' => "Performance score ({$vendor->performance_score}) below threshold ({$threshold}).",
        ];
    }

    /**
     * Determine overall compliance status based on score and blocking rules.
     */
    protected function determineComplianceStatus(int $score, bool $hasBlockingFailure): string
    {
        if ($hasBlockingFailure) {
            return Vendor::COMPLIANCE_BLOCKED;
        }

        if ($score >= 80) {
            return Vendor::COMPLIANCE_COMPLIANT;
        }

        if ($score >= 50) {
            return Vendor::COMPLIANCE_AT_RISK;
        }

        return Vendor::COMPLIANCE_NON_COMPLIANT;
    }
}
