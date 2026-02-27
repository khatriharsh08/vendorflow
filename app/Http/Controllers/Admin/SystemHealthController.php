<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SystemHealthService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemHealthController extends Controller
{
    public function __construct(protected SystemHealthService $systemHealthService) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewReports');

        $data = $this->systemHealthService->indexData($request);

        return Inertia::render('Admin/SystemHealth/Index', [
            'jobs' => $data['jobs'],
            'stats' => $data['stats'],
            'filters' => $data['filters'],
        ]);
    }
}
