<?php

namespace App\Services;

use App\Models\PerformanceMetric;
use App\Models\PerformanceScore;
use App\Models\ScoreHistory;
use App\Models\User;
use App\Models\Vendor;

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
        ?string $notes = null,
        bool $recalculate = true
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

        if ($recalculate) {
            // Recalculate overall vendor performance score
            $this->recalculateVendorScore($vendor, $scoredBy, [
                'metric_id' => $metric->id,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
            ]);
        }

        return $performanceScore;
    }

    /**
     * Recalculate a vendor's overall performance score.
     * Uses weighted average of most recent scores per metric.
     */
    public function recalculateVendorScore(Vendor $vendor, ?User $actor = null, array $metadata = []): int
    {
        $metrics = PerformanceMetric::where('is_active', true)->get();

        if ($metrics->isEmpty()) {
            return 0;
        }

        $totalWeight = 0;
        $weightedSum = 0;

        $latestScoresByMetric = PerformanceScore::query()
            ->where('vendor_id', $vendor->id)
            ->whereIn('performance_metric_id', $metrics->pluck('id'))
            ->orderByDesc('period_end')
            ->orderByDesc('id')
            ->get()
            ->groupBy('performance_metric_id')
            ->map(fn ($scores) => $scores->first());

        foreach ($metrics as $metric) {
            $latestScore = $latestScoresByMetric->get($metric->id);
            if (! $latestScore || $metric->max_score <= 0) {
                continue;
            }

            // Normalize score to 0-100
            $normalizedScore = ($latestScore->score / $metric->max_score) * 100;
            $weightedSum += $normalizedScore * $metric->weight;
            $totalWeight += $metric->weight;
        }

        $overallScore = $totalWeight > 0
            ? (int) round($weightedSum / $totalWeight)
            : 0;

        $vendor->update(['performance_score' => $overallScore]);

        ScoreHistory::create([
            'vendor_id' => $vendor->id,
            'user_id' => $actor?->id,
            'performance_score' => $overallScore,
            'source' => $actor ? 'manual_rating' : 'system',
            'metadata' => $metadata,
            'recorded_at' => now(),
        ]);

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
            if (! isset($monthlyData[$month])) {
                $monthlyData[$month] = [
                    'month' => $month,
                    'scores' => [],
                    'average' => 0,
                ];
            }
            $maxScore = max(1, (int) ($score->metric?->max_score ?? 1));
            $monthlyData[$month]['scores'][] = [
                'metric' => $score->metric->name,
                'score' => $score->score,
                'max' => $maxScore,
                'normalized' => ($score->score / $maxScore) * 100,
            ];
        }

        // Calculate monthly averages
        foreach ($monthlyData as &$data) {
            $total = array_sum(array_column($data['scores'], 'normalized'));
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
        $scoresByMetric = PerformanceScore::query()
            ->where('vendor_id', $vendor->id)
            ->whereIn('performance_metric_id', $metrics->pluck('id'))
            ->orderByDesc('period_end')
            ->orderByDesc('id')
            ->get()
            ->groupBy('performance_metric_id');

        $breakdown = [];

        foreach ($metrics as $metric) {
            $metricScores = $scoresByMetric->get($metric->id, collect());
            $latestScore = $metricScores->first();
            $allScores = $metricScores->pluck('score');

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
