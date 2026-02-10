<?php

namespace App\Http\Controllers;

use App\Http\Requests\Vendor\StorePaymentRequest;
use App\Http\Requests\Vendor\StoreStep1Request;
use App\Http\Requests\Vendor\StoreStep2Request;
use App\Http\Requests\Vendor\StoreStep3Request;
use App\Http\Requests\Vendor\UpdateProfileRequest;
use App\Http\Requests\Vendor\UploadDocumentRequest;
use App\Models\DocumentType;
use App\Models\Vendor;
use App\Services\VendorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VendorController extends Controller
{
    protected VendorService $vendorService;

    public function __construct(VendorService $vendorService)
    {
        $this->vendorService = $vendorService;
    }

    /**
     * Show the onboarding wizard.
     */
    public function showOnboarding(Request $request)
    {
        $user = Auth::user();
        if (! $user instanceof \App\Models\User) {
            abort(403);
        }
        $vendor = $user->vendor;
        $step = $request->query('step', 1);

        // If vendor has already submitted, redirect to dashboard
        if ($vendor && ! in_array($vendor->status, [Vendor::STATUS_DRAFT])) {
            return redirect()->route('vendor.dashboard');
        }

        $documentTypes = DocumentType::where('is_active', true)->get();

        // Get session data for pre-filling if user goes back
        $sessionData = session('vendor_onboarding', []);

        return Inertia::render('Vendor/Onboarding/Wizard', [
            'currentStep' => (int) $step,
            'vendor' => $vendor,
            'documentTypes' => $documentTypes,
            'sessionData' => $sessionData,
        ]);
    }

    /**
     * Save Step 1 data to session (not database).
     */
    public function storeStep1(StoreStep1Request $request)
    {
        $validated = $request->validated();

        $this->vendorService->storeOnboardingStep1($validated);

        return redirect()->route('vendor.onboarding', ['step' => 2]);
    }

    /**
     * Save Step 2 data to session (not database).
     */
    public function storeStep2(StoreStep2Request $request)
    {
        $validated = $request->validated();

        // Check if step 1 is complete
        $sessionData = session('vendor_onboarding', []);
        if (empty($sessionData['step1'])) {
            return redirect()->route('vendor.onboarding', ['step' => 1])
                ->withErrors(['step' => 'Please complete Step 1 first.']);
        }

        $this->vendorService->storeOnboardingStep2($validated);

        return redirect()->route('vendor.onboarding', ['step' => 3]);
    }

    /**
     * Save Step 3 documents to temp storage (not database).
     */
    public function storeStep3(StoreStep3Request $request)
    {

        // Check if previous steps are complete
        $sessionData = session('vendor_onboarding', []);
        if (empty($sessionData['step1']) || empty($sessionData['step2'])) {
            return redirect()->route('vendor.onboarding', ['step' => 1])
                ->withErrors(['step' => 'Please complete previous steps first.']);
        }

        $this->vendorService->storeOnboardingStep3($request->documents);

        return redirect()->route('vendor.onboarding', ['step' => 4]);
    }

    /**
     * View a temporary onboarding document.
     */
    public function viewOnboardingDocument($typeId)
    {
        $sessionData = session('vendor_onboarding', []);
        $documents = $sessionData['step3']['documents'] ?? [];

        foreach ($documents as $doc) {
            if ($doc['document_type_id'] == $typeId) {
                $path = $doc['file_path'];
                if (Storage::disk('private')->exists($path)) {
                    return Storage::disk('private')->response($path, $doc['file_name']);
                }
            }
        }

        abort(404);
    }

    /**
     * Submit the complete vendor application (saves ALL data to database).
     */
    public function submitApplication(Request $request)
    {
        $sessionData = session('vendor_onboarding', []);

        // Validate all steps are complete
        if (empty($sessionData['step1']) || empty($sessionData['step2']) || empty($sessionData['step3'])) {
            return redirect()->route('vendor.onboarding', ['step' => 1])
                ->withErrors(['step' => 'Please complete all steps before submitting.']);
        }

        // Check mandatory documents
        $mandatoryTypes = DocumentType::where('is_mandatory', true)->pluck('id')->toArray();
        $uploadedTypes = collect($sessionData['step3']['documents'])->pluck('document_type_id')->toArray();
        $missingDocs = array_diff($mandatoryTypes, $uploadedTypes);

        if (! empty($missingDocs)) {
            return redirect()->route('vendor.onboarding', ['step' => 3])
                ->withErrors(['documents' => 'Please upload all mandatory documents before submitting.']);
        }

        try {
            $this->vendorService->submitApplication(Auth::user());

            return redirect()->route('vendor.dashboard')->with('success', 'Application submitted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to submit application: ' . $e->getMessage()]);
        }
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
            'verified_documents' => $vendor->documents()->where('verification_status', 'approved')->count(),
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
        $documentTypes = DocumentType::where('is_active', true)->get();

        return Inertia::render('Vendor/Documents', [
            'vendor' => $vendor,
            'documents' => $documents,
            'documentTypes' => $documentTypes,
        ]);
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

        if (! $vendor || $vendor->status !== Vendor::STATUS_ACTIVE) {
            return back()->withErrors(['submit' => 'Only active vendors can request payments.']);
        }

        $vendor->paymentRequests()->create([
            'requested_by' => Auth::id(),
            'reference_number' => 'PAY-' . strtoupper(uniqid()),
            'amount' => $validated['amount'],
            'description' => $validated['description'],
            'invoice_number' => $validated['invoice_number'],
            'status' => 'requested',
        ]);

        return back()->with('success', 'Payment request submitted successfully!');
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

        $vendor->load([
            'complianceResults' => fn($q) => $q->with('rule'),
        ]);

        $rules = \App\Models\ComplianceRule::where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Vendor/Compliance', [
            'vendor' => $vendor,
            'complianceResults' => $vendor->complianceResults ?? [],
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

        // Get notifications for this user
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Vendor/Notifications', [
            'vendor' => $vendor,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markNotificationAsRead($id)
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */
        $notification = $user->notifications()->findOrFail($id);
        $notification->markAsRead();

        return back();
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllNotificationsAsRead()
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */
        $user->unreadNotifications->markAsRead();

        return back()->with('success', 'All notifications marked as read.');
    }
}
