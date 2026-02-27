<?php

namespace App\Http\Controllers;

use App\Http\Requests\Vendor\StorePaymentRequest;

use App\Http\Requests\Vendor\UpdateProfileRequest;
use App\Http\Requests\Vendor\UploadDocumentRequest;
use App\Models\ComplianceResult;
use App\Models\DocumentType;
use App\Models\Vendor;
use Database\Seeders\DocumentTypeSeeder;
use App\Services\PaymentService;
use App\Services\UserNotificationService;
use App\Services\VendorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VendorController extends Controller
{
    protected VendorService $vendorService;

    protected PaymentService $paymentService;

    protected UserNotificationService $notificationService;

    public function __construct(VendorService $vendorService, PaymentService $paymentService, UserNotificationService $notificationService)
    {
        $this->vendorService = $vendorService;
        $this->paymentService = $paymentService;
        $this->notificationService = $notificationService;
    }

    /**
     * Show vendor dashboard.
     */
    public function index()
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */
        $vendor = $user->vendor;

        if (! $vendor) {
            return redirect()->route('vendor.onboarding');
        }

        $stats = [
            'total_documents' => $vendor->documents()->count(),
            'verified_documents' => $vendor->documents()->where('verification_status', 'verified')->count(),
            'pending_payments' => $vendor->paymentRequests()->whereIn('status', ['requested', 'pending_ops', 'pending_finance', 'approved'])->sum('amount'),
            'total_paid' => $vendor->paymentRequests()->where('status', 'paid')->sum('amount'),
        ];

        $recentDocs = $vendor->documents()->with('documentType')->latest()->take(5)->get();
        $recentPayments = $vendor->paymentRequests()->latest()->take(5)->get();

        return Inertia::render('Vendor/Dashboard', [
            'vendor' => $vendor,
            'stats' => $stats,
            'recentDocuments' => $recentDocs,
            'recentPayments' => $recentPayments,
        ]);
    }

    /**
     * Show documents page.
     */
    public function documents()
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */
        $vendor = $user->vendor;

        if (! $vendor) {
            return redirect()->route('vendor.onboarding');
        }

        $documents = $vendor->documents()->with('documentType')->get();
        $documentTypes = $this->getActiveDocumentTypes();

        return Inertia::render('Vendor/Documents', [
            'vendor' => $vendor,
            'documents' => $documents,
            'documentTypes' => $documentTypes,
        ]);
    }

    /**
     * Get active document types without caching empty results.
     */
    protected function getActiveDocumentTypes()
    {
        $cacheKey = 'document_types_active';
        $cachedTypes = Cache::get($cacheKey);

        if ($cachedTypes && $cachedTypes->isNotEmpty()) {
            return $cachedTypes;
        }

        if ($cachedTypes && $cachedTypes->isEmpty()) {
            Cache::forget($cacheKey);
        }

        $documentTypes = DocumentType::where('is_active', true)->get();

        if ($documentTypes->isEmpty()) {
            $this->seedDefaultDocumentTypes();
            $documentTypes = DocumentType::where('is_active', true)->get();
        }

        if ($documentTypes->isNotEmpty()) {
            Cache::put($cacheKey, $documentTypes, now()->addDay());
        }

        return $documentTypes;
    }

    /**
     * Ensure default onboarding document types exist.
     */
    protected function seedDefaultDocumentTypes(): void
    {
        foreach (DocumentTypeSeeder::defaults() as $docType) {
            DocumentType::updateOrCreate(
                ['name' => $docType['name']],
                [
                    'display_name' => $docType['display_name'],
                    'description' => $docType['description'] ?? null,
                    'is_mandatory' => $docType['is_mandatory'] ?? false,
                    'has_expiry' => $docType['has_expiry'] ?? false,
                    'expiry_warning_days' => $docType['expiry_warning_days'] ?? 30,
                    'allowed_extensions' => $docType['allowed_extensions'] ?? ['pdf'],
                    'is_active' => true,
                ]
            );
        }
    }

    /**
     * Upload a new document.
     */
    public function uploadDocument(UploadDocumentRequest $request)
    {
        // Validation handled by FormRequest

        $user = Auth::user();
        /** @var \App\Models\User $user */
        $vendor = $user->vendor;

        if (! $vendor || $vendor->status === Vendor::STATUS_DRAFT) {
            return back()->withErrors(['upload' => 'Cannot upload documents in draft status.']);
        }

        try {
            $this->vendorService->uploadDocument(
                $vendor,
                $request->file('file'),
                $request->document_type_id,
                $request->expiry_date
            );

            return back()->with('success', 'Document uploaded successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['upload' => 'Upload failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Show payment requests.
     */
    public function payments()
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */
        $vendor = $user->vendor;

        if (! $vendor) {
            return redirect()->route('vendor.onboarding');
        }

        $payments = $vendor->paymentRequests()->latest()->paginate(10);

        return Inertia::render('Vendor/Payments', [
            'vendor' => $vendor,
            'payments' => $payments,
        ]);
    }

    /**
     * Create new payment request.
     */
    public function createPaymentRequest(StorePaymentRequest $request)
    {
        $validated = $request->validated();

        $user = Auth::user();
        /** @var \App\Models\User $user */
        $vendor = $user->vendor;

        if (! $vendor || ! in_array($vendor->status, [Vendor::STATUS_ACTIVE, Vendor::STATUS_APPROVED])) {
            return back()->withErrors(['submit' => 'Only approved or active vendors can request payments.']);
        }

        try {
            $this->paymentService->createRequest(
                $vendor,
                $user,
                (float) $validated['amount'],
                $validated['description'],
                $validated['invoice_number'] ?? null
            );

            return back()->with('success', 'Payment request submitted successfully!');
        } catch (\Throwable $e) {
            return back()->withErrors(['submit' => $e->getMessage()]);
        }
    }

    /**
     * Update vendor internal notes.
     */
    public function updateNotes(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:5000',
            'internal_notes' => 'nullable|string|max:5000',
        ]);

        $vendor->update([
            'internal_notes' => $validated['internal_notes'] ?? $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Notes updated successfully!');
    }

    /**
     * Show vendor profile page.
     */
    public function profile()
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */
        $vendor = $user->vendor;

        return Inertia::render('Vendor/Profile', [
            'vendor' => $vendor,
        ]);
    }

    /**
     * Update vendor profile.
     */
    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */
        $vendor = $user->vendor;

        if (! $vendor) {
            return back()->with('error', 'Vendor profile not found.');
        }

        if ($vendor->status !== Vendor::STATUS_DRAFT) {
            $allowedFields = [
                'contact_person',
                'contact_phone',
                'address',
                'city',
                'state',
                'pincode',
            ];
            $metaFields = ['_token', '_method'];
            $attempted = array_diff(array_keys($request->validated()), $allowedFields);

            if (! empty($attempted)) {
                return back()->withErrors([
                    'profile' => 'Profile is locked after submission. Only contact and location fields can be updated.',
                ]);
            }
        }

        $validated = $request->validated();

        $this->vendorService->updateProfile($vendor, $validated);

        return back()->with('success', 'Profile updated successfully!');
    }

    /**
     * Show vendor compliance page.
     */
    public function compliance()
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */
        $vendor = $user->vendor;

        if (! $vendor) {
            return redirect()->route('vendor.onboarding');
        }

        $latestResults = ComplianceResult::with('rule')
            ->where('vendor_id', $vendor->id)
            ->whereIn('id', ComplianceResult::latestResultIdsQuery($vendor->id))
            ->orderByDesc('evaluated_at')
            ->get();

        $rules = \App\Models\ComplianceRule::where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Vendor/Compliance', [
            'vendor' => $vendor,
            'complianceResults' => $latestResults,
            'rules' => $rules,
        ]);
    }

    /**
     * Show vendor performance page.
     */
    public function performance()
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */
        $vendor = $user->vendor;

        if (! $vendor) {
            return redirect()->route('vendor.onboarding');
        }

        $vendor->load([
            'performanceScores' => fn($q) => $q->with('metric')->latest()->take(10),
        ]);

        $metrics = \App\Models\PerformanceMetric::where('is_active', true)
            ->orderBy('display_name')
            ->get();

        return Inertia::render('Vendor/Performance', [
            'vendor' => $vendor,
            'performanceScores' => $vendor->performanceScores ?? [],
            'metrics' => $metrics,
        ]);
    }

    /**
     * Show vendor notifications page.
     */
    public function notifications()
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */
        $vendor = $user->vendor;

        $notificationData = $this->notificationService->indexData($user);

        return Inertia::render('Vendor/Notifications', [
            'vendor' => $vendor,
            'notifications' => $notificationData['notifications'],
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markNotificationAsRead($id)
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */
        $this->notificationService->markAsRead($user, (string) $id);

        return back();
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllNotificationsAsRead()
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */
        $this->notificationService->markAllAsRead($user);

        return back()->with('success', 'All notifications marked as read.');
    }
}
