<?php

namespace Database\Seeders;

use App\Models\ComplianceRule;
use Illuminate\Database\Seeder;

class ComplianceRuleSeeder extends Seeder
{
    public function run(): void
    {
        $rules = [
            [
                'name' => 'mandatory_documents',
                'description' => 'All mandatory documents must be uploaded and verified',
                'type' => ComplianceRule::TYPE_DOCUMENT_REQUIRED,
                'conditions' => [],
                'severity' => ComplianceRule::SEVERITY_CRITICAL,
                'penalty_points' => 50,
                'blocks_payment' => true,
                'blocks_activation' => true,
                'is_active' => true,
            ],
            [
                'name' => 'document_expiry_check',
                'description' => 'Documents should not be expired or expiring within 15 days',
                'type' => ComplianceRule::TYPE_DOCUMENT_EXPIRY,
                'conditions' => ['warning_days' => 15],
                'severity' => ComplianceRule::SEVERITY_HIGH,
                'penalty_points' => 30,
                'blocks_payment' => true,
                'blocks_activation' => false,
                'is_active' => true,
            ],
            [
                'name' => 'minimum_performance',
                'description' => 'Vendor performance score must be at least 40',
                'type' => ComplianceRule::TYPE_PERFORMANCE_THRESHOLD,
                'conditions' => ['min_score' => 40],
                'severity' => ComplianceRule::SEVERITY_MEDIUM,
                'penalty_points' => 20,
                'blocks_payment' => false,
                'blocks_activation' => false,
                'is_active' => true,
            ],
        ];

        foreach ($rules as $rule) {
            ComplianceRule::updateOrCreate(
                ['name' => $rule['name']],
                $rule
            );
        }
    }
}
