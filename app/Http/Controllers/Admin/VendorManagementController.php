<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComplianceResult;
use App\Models\User;
use App\Models\Vendor;
use App\Services\VendorLifecycleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorManagementController extends Controller
{
    public function __construct(protected VendorLifecycleService $lifecycleService) {}

    public function index(Request $request): Response
    {
        $status = (string) $request->query('status', 'all');
        $search = (string) $request->query('search', '');

        $query = Vendor::select([
            'id',
            'company_name',
            'contact_person',
            'contact_email',
            'status',
            'performance_score',
            'compliance_status',
            'created_at',
        ])->latest();

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%")
                    ->orWhere('contact_email', 'like', "%{$search}%");
            });
        }

        $vendors = $query->paginate(15);

        return Inertia::render('Admin/Vendors/Index', [
            'vendors' => $vendors->items(),
            'currentStatus' => $status,
            'search' => $search,
        ]);
    }

    public function show(Vendor $vendor): Response
    {
        $this->authorize('view', $vendor);

        $vendor->load([
            'documents:id,vendor_id,document_type_id,file_name,verification_status,expiry_date,created_at' => [
                'documentType:id,name,display_name',
            ],
            'stateLogs:id,vendor_id,user_id,from_status,to_status,comment,created_at' => [
                'user:id,name',
            ],
        ]);

        if (in_array($vendor->status, [
            Vendor::STATUS_APPROVED,
            Vendor::STATUS_ACTIVE,
            Vendor::STATUS_SUSPENDED,
            Vendor::STATUS_TERMINATED,
        ], true)) {
            $latestComplianceResults = ComplianceResult::with('rule:id,name,description')
                ->select('id', 'vendor_id', 'compliance_rule_id', 'status', 'details', 'evaluated_at')
                ->where('vendor_id', $vendor->id)
                ->whereIn('id', ComplianceResult::latestResultIdsQuery($vendor->id))
                ->orderByDesc('evaluated_at')
                ->get();

            $vendor->setRelation('complianceResults', $latestComplianceResults);

            $vendor->load([
                'performanceScores:id,vendor_id,performance_metric_id,score,period_start,period_end' => [
                    'metric:id,name,display_name',
                ],
            ]);
        }

        return Inertia::render('Admin/Vendors/Show', ['vendor' => $vendor]);
    }

    public function approve(Request $request, Vendor $vendor): RedirectResponse
    {
        $this->authorize('approve', $vendor);

        /** @var User $actor */
        $actor = $request->user();

        try {
            $this->lifecycleService->approveAndActivate($vendor, $actor, $request->string('comment')->toString());

            return back()->with('success', 'Vendor approved and activated!');
        } catch (\Throwable $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }
    }

    public function reject(Request $request, Vendor $vendor): RedirectResponse
    {
        $this->authorize('reject', $vendor);

        /** @var User $actor */
        $actor = $request->user();

        $validated = $request->validate([
            'comment' => 'required|string|max:1000',
        ]);

        try {
            $this->lifecycleService->reject($vendor, $actor, $validated['comment']);

            return back()->with('success', 'Vendor rejected.');
        } catch (\Throwable $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }
    }

    public function activate(Request $request, Vendor $vendor): RedirectResponse
    {
        $this->authorize('activate', $vendor);

        /** @var User $actor */
        $actor = $request->user();

        try {
            $this->lifecycleService->activate($vendor, $actor, $request->string('comment')->toString());

            return back()->with('success', 'Vendor activated!');
        } catch (\Throwable $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }
    }

    public function suspend(Request $request, Vendor $vendor): RedirectResponse
    {
        $this->authorize('suspend', $vendor);

        /** @var User $actor */
        $actor = $request->user();

        $validated = $request->validate([
            'comment' => 'required|string|max:1000',
        ]);

        try {
            $this->lifecycleService->suspend($vendor, $actor, $validated['comment']);

            return back()->with('success', 'Vendor suspended.');
        } catch (\Throwable $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }
    }

    public function terminate(Request $request, Vendor $vendor): RedirectResponse
    {
        $this->authorize('terminate', $vendor);

        /** @var User $actor */
        $actor = $request->user();

        $validated = $request->validate([
            'comment' => 'required|string|max:1000',
        ]);

        try {
            $this->lifecycleService->terminate($vendor, $actor, $validated['comment']);

            return back()->with('success', 'Vendor terminated.');
        } catch (\Throwable $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }
    }

    public function notes(Request $request, Vendor $vendor): RedirectResponse
    {
        $this->authorize('updateNotes', $vendor);

        $validated = $request->validate([
            'internal_notes' => 'nullable|string|max:5000',
        ]);

        $vendor->update([
            'internal_notes' => $validated['internal_notes'] ?? null,
        ]);

        return back()->with('success', 'Notes saved.');
    }
}
