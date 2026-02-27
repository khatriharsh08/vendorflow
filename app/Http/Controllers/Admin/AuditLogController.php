<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAuditLogs');

        $page = (int) $request->query('page', 1);

        $logs = Cache::remember("audit_logs_page_{$page}", 60, function () {
            return AuditLog::with('user:id,name')
                ->select([
                    'id',
                    'user_id',
                    'event',
                    'auditable_type',
                    'auditable_id',
                    'reason',
                    'ip_address',
                    'created_at',
                ])
                ->latest()
                ->paginate(50);
        });

        return Inertia::render('Admin/Audit/Index', [
            'logs' => $logs->items(),
        ]);
    }
}
