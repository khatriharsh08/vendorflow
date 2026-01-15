<?php

namespace App\Services;

use App\Models\Vendor;
use App\Models\PerformanceMetric;
use App\Models\PerformanceScore;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PerformanceService
{
    /**
     * Record a performance score for a vendor.
     * Scores are immutable once created.
     */
    public function recordScore(
        Vendor $vendor,
        PerformanceMetric $metric,
        int $score,
        User $scoredBy,
        string $periodStart,
        string $periodEnd,
        ?string $notes = null
    ): PerformanceScore {
        // Validate score range
        $score = max(0, min($metric->max_score, $score));

        $performanceScore = PerformanceScore::create([
            'vendor_id' => $vendor->id,
            'performance_metric_id' => $metric->id,
            'scored_by' => $scoredBy->id,
            'score' => $score,
            'notes' => $notes,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
        ]);

        // Recalculate overall vendor performance score
        $this->recalculateVendorScore($vendor);

        return $performanceScore;
    }

    /**
     * Recalculate a vendor's overall performance score.
     * Uses weighted average of most recent scores per metric.
     */
    public function recalculateVendorScore(Vendor $vendor): int
    {
        $metrics = PerformanceMetric::where('is_active', true)->get();
        
        if ($metrics->isEmpty()) {
            return 0;
        }

        $totalWeight = 0;
        $weightedSum = 0;

        foreach ($metrics as $metric) {
            // Get most recent score for this metric
            $latestScore = PerformanceScore::where('vendor_id', $vendor->id)
                ->where('performance_metric_id', $metric->id)
                ->orderBy('period_end', 'desc')
                ->first();

            if ($latestScore) {
                // Normalize score to 0-100
                $normalizedScore = ($latestScore->score / $metric->max_score) * 100;
                $weightedSum += $normalizedScore * $metric->weight;
                $totalWeight += $metric->weight;
            }
        }

        $overallScore = $totalWeight > 0 
            ? (int) round($weightedSum / $totalWeight) 
            : 0;

        $vendor->update(['performance_score' => $overallScore]);

        return $overallScore;
    }

    /**
     * Get performance history for a vendor.
     */
    public function getVendorHistory(Vendor $vendor, int $months = 12): array
    {
        $scores = PerformanceScore::with('metric')
            ->where('vendor_id', $vendor->id)
            ->where('period_end', '>=', now()->subMonths($months))
            ->orderBy('period_end', 'asc')
            ->get();

        // Group by month for trend analysis
        $monthlyData = [];
        foreach ($scores as $score) {
            $month = $score->period_end->format('Y-m');
            if (!isset($monthlyData[$month])) {
                $monthlyData[$month] = [
                    'month' => $month,
                    'scores' => [],
                    'average' => 0,
                ];
            }
            $monthlyData[$month]['scores'][] = [
                'metric' => $score->metric->name,
                'score' => $score->score,
                'max' => $score->metric->max_score,
            ];
        }

        // Calculate monthly averages
        foreach ($monthlyData as &$data) {
            $total = array_sum(array_column($data['scores'], 'score'));
            $data['average'] = count($data['scores']) > 0 
                ? round($total / count($data['scores'])) 
                : 0;
        }

        return array_values($monthlyData);
    }

    /**
     * Get performance breakdown by metric.
     */
    public function getMetricBreakdown(Vendor $vendor): array
    {
        $metrics = PerformanceMetric::where('is_active', true)->get();
        $breakdown = [];

        foreach ($metrics as $metric) {
            $latestScore = PerformanceScore::where('vendor_id', $vendor->id)
                ->where('performance_metric_id', $metric->id)
                ->orderBy('period_end', 'desc')
                ->first();

            $allScores = PerformanceScore::where('vendor_id', $vendor->id)
                ->where('performance_metric_id', $metric->id)
                ->pluck('score');

            $breakdown[] = [
                'metric_id' => $metric->id,
                'metric_name' => $metric->display_name,
                'weight' => $metric->weight,
                'current_score' => $latestScore?->score ?? 0,
                'max_score' => $metric->max_score,
                'average_score' => $allScores->isNotEmpty() 
                    ? round($allScores->average()) 
                    : 0,
                'score_count' => $allScores->count(),
            ];
        }

        return $breakdown;
    }
}
