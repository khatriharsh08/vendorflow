<?php

namespace Database\Seeders;

use App\Models\PerformanceMetric;
use Illuminate\Database\Seeder;

class PerformanceMetricSeeder extends Seeder
{
    public function run(): void
    {
        $metrics = [
            [
                'name' => 'delivery_timeliness',
                'display_name' => 'Delivery Timeliness',
                'description' => 'How consistently the vendor meets delivery deadlines',
                'weight' => 0.30,
                'max_score' => 10,
                'is_active' => true,
            ],
            [
                'name' => 'issue_frequency',
                'display_name' => 'Issue Frequency',
                'description' => 'Frequency of issues or defects reported (lower is better)',
                'weight' => 0.25,
                'max_score' => 10,
                'is_active' => true,
            ],
            [
                'name' => 'ops_rating',
                'display_name' => 'Operations Rating',
                'description' => 'Manual rating provided by operations team',
                'weight' => 0.25,
                'max_score' => 10,
                'is_active' => true,
            ],
            [
                'name' => 'contract_adherence',
                'display_name' => 'Contract Adherence',
                'description' => 'How well the vendor adheres to contract terms',
                'weight' => 0.20,
                'max_score' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($metrics as $metric) {
            PerformanceMetric::updateOrCreate(
                ['name' => $metric['name']],
                $metric
            );
        }
    }
}
