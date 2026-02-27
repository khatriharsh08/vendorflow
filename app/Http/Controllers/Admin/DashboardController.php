<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index()
    {
        $this->authorize('viewReports');

        $data = $this->dashboardService->adminDashboardData();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $data['stats'],
            'pendingVendors' => $data['pendingVendors'],
            'pendingDocuments' => $data['pendingDocuments'],
            'pendingPayments' => $data['pendingPayments'],
            'recentActivity' => $data['recentActivity'],
        ]);
    }
}
