<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\PerformanceMetric;
use App\Services\PerformanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PerformanceController extends Controller
{
    protected PerformanceService $performanceService;

    public function __construct(PerformanceService $performanceService)
    {
        $this->performanceService = $performanceService;
    }

    /**
     * Show performance dashboard.
     */
    public function index()
    {
        $vendors = Vendor::where('status', 'active')
            ->orderBy('performance_score', 'desc')
            ->get()
            ->map(function ($vendor) {
                return [
                    'id' => $vendor->id,
                    'company_name' => $vendor->company_name,
                    'performance_score' => $vendor->performance_score,
                    'compliance_status' => $vendor->compliance_status,
                ];
            });

        $metrics = PerformanceMetric::where('is_active', true)->get();

        $topPerformers = $vendors->take(5);
        $lowPerformers = $vendors->sortBy('performance_score')->take(5);

        return Inertia::render('Admin/Performance/Index', [
            'vendors' => $vendors,
            'metrics' => $metrics,
            'topPerformers' => $topPerformers,
            'lowPerformers' => $lowPerformers->values(),
        ]);
    }

    /**
     * Show vendor performance details.
     */
    public function show(Vendor $vendor)
    {
        $breakdown = $this->performanceService->getMetricBreakdown($vendor);
        $history = $this->performanceService->getVendorHistory($vendor);

        return Inertia::render('Admin/Performance/Show', [
            'vendor' => $vendor,
            'breakdown' => $breakdown,
            'history' => $history,
        ]);
    }

    /**
     * Show form to rate a vendor.
     */
    public function rateForm(Vendor $vendor)
    {
        $metrics = PerformanceMetric::where('is_active', true)->get();

        return Inertia::render('Admin/Performance/Rate', [
            'vendor' => $vendor,
            'metrics' => $metrics,
        ]);
    }

    /**
     * Store performance ratings.
     */
    public function rate(Request $request, Vendor $vendor)
    {
        $request->validate([
            'ratings' => 'required|array',
            'ratings.*.metric_id' => 'required|exists:performance_metrics,id',
            'ratings.*.score' => 'required|integer|min:0|max:10',
            'ratings.*.notes' => 'nullable|string|max:500',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
        ]);

        $metrics = PerformanceMetric::whereIn('id', collect($request->ratings)->pluck('metric_id'))->get()->keyBy('id');

        foreach ($request->ratings as $rating) {
            $metric = $metrics[$rating['metric_id']];

            $this->performanceService->recordScore(
                $vendor,
                $metric,
                $rating['score'],
                Auth::user(),
                $request->period_start,
                $request->period_end,
                $rating['notes'] ?? null
            );
        }

        return redirect()->route('admin.performance.index')
            ->with('success', 'Performance ratings recorded successfully.');
    }
}
