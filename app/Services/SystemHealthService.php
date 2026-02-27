<?php

namespace App\Services;

use App\Models\JobLog;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class SystemHealthService
{
    /**
     * @return array{jobs: LengthAwarePaginator, stats: array<string, int>, filters: array<string, string>}
     */
    public function indexData(Request $request): array
    {
        $status = (string) $request->query('status', 'all');
        $search = trim((string) $request->query('search', ''));

        $query = JobLog::query()->latest('started_at');

        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->where('job_name', 'like', "%{$search}%");
        }

        return [
            'jobs' => $query->paginate(25)->withQueryString(),
            'stats' => [
                'total' => JobLog::count(),
                'running' => JobLog::where('status', 'running')->count(),
                'success' => JobLog::where('status', 'success')->count(),
                'failed' => JobLog::where('status', 'failed')->count(),
            ],
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ];
    }
}
