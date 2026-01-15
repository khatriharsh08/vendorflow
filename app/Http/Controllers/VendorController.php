<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\DocumentType;
use App\Models\VendorDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VendorController extends Controller
{
    /**
     * Show the onboarding wizard.
     */
    public function showOnboarding(Request $request)
    {
        $user = Auth::user();
        $vendor = $user->vendor;
        $step = $request->query('step', 1);

        // If vendor has already submitted, redirect to dashboard
        if ($vendor && !in_array($vendor->status, [Vendor::STATUS_DRAFT])) {
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
    public function storeStep1(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'registration_number' => 'nullable|string|max:50',
            'tax_id' => 'nullable|string|max:50',
            'pan_number' => 'required|string|max:20',
            'business_type' => 'nullable|string|max:50',
            'contact_person' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'required|string|max:20',
        ]);

        // Store in session instead of database
        $sessionData = session('vendor_onboarding', []);
        $sessionData['step1'] = $validated;
        $sessionData['step1']['contact_email'] = Auth::user()->email;
        session(['vendor_onboarding' => $sessionData]);

        return redirect()->route('vendor.onboarding', ['step' => 2]);
    }

    /**
     * Save Step 2 data to session (not database).
     */
    public function storeStep2(Request $request)
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:50',
            'bank_ifsc' => 'required|string|max:20',
            'bank_branch' => 'nullable|string|max:255',
        ]);

        // Check if step 1 is complete
        $sessionData = session('vendor_onboarding', []);
        if (empty($sessionData['step1'])) {
            return redirect()->route('vendor.onboarding', ['step' => 1])
                ->withErrors(['step' => 'Please complete Step 1 first.']);
        }

        // Store in session
        $sessionData['step2'] = $validated;
        session(['vendor_onboarding' => $sessionData]);

        return redirect()->route('vendor.onboarding', ['step' => 3]);
    }

    /**
     * Save Step 3 documents to temp storage (not database).
     */
    public function storeStep3(Request $request)
    {
        $request->validate([
            'documents' => 'required|array',
            'documents.*.document_type_id' => 'required|exists:document_types,id',
            'documents.*.file' => 'required|file|max:10240', // 10MB max
        ]);

        // Check if previous steps are complete
        $sessionData = session('vendor_onboarding', []);
        if (empty($sessionData['step1']) || empty($sessionData['step2'])) {
            return redirect()->route('vendor.onboarding', ['step' => 1])
                ->withErrors(['step' => 'Please complete previous steps first.']);
        }

        // Store files in temp folder with unique session key
        $tempFolder = 'temp-documents/' . session()->getId();
        $documents = [];

        foreach ($request->documents as $doc) {
            $file = $doc['file'];
            $path = $file->store($tempFolder, 'private');

            $documents[] = [
                'document_type_id' => $doc['document_type_id'],
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'file_hash' => hash_file('sha256', $file->getRealPath()),
            ];
        }

        // Store document info in session
        $sessionData['step3'] = ['documents' => $documents];
        session(['vendor_onboarding' => $sessionData]);

        return redirect()->route('vendor.onboarding', ['step' => 4]);
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

        if (!empty($missingDocs)) {
            return redirect()->route('vendor.onboarding', ['step' => 3])
                ->withErrors(['documents' => 'Please upload all mandatory documents before submitting.']);
        }

        // Use database transaction to save everything at once
        DB::transaction(function () use ($sessionData) {
            $user = Auth::user();

            // 1. Create or Update Vendor with all data from step 1 & 2
            $vendorData = array_merge(
                $sessionData['step1'],
                $sessionData['step2'],
                ['status' => Vendor::STATUS_SUBMITTED]
            );

            $vendor = Vendor::updateOrCreate(
                ['user_id' => $user->id],
                $vendorData
            );

            // Sync contact_phone to user's phone field
            if (!empty($sessionData['step1']['contact_phone'])) {
                $user->phone = $sessionData['step1']['contact_phone'];
                $user->save();
            }

            // 2. Delete any existing documents (prevent duplicates)
            $vendor->documents()->delete();

            // 3. Move temp files to permanent storage and create document records
            foreach ($sessionData['step3']['documents'] as $doc) {
                $tempPath = $doc['file_path'];
                $newPath = 'vendor-documents/' . $vendor->id . '/' . basename($tempPath);

                // Move from temp to permanent location
                if (Storage::disk('private')->exists($tempPath)) {
                    Storage::disk('private')->move($tempPath, $newPath);
                }

                VendorDocument::create([
                    'vendor_id' => $vendor->id,
                    'document_type_id' => $doc['document_type_id'],
                    'file_name' => $doc['file_name'],
                    'file_path' => $newPath,
                    'file_hash' => $doc['file_hash'],
                    'file_size' => $doc['file_size'],
                    'mime_type' => $doc['mime_type'],
                    'verification_status' => 'pending',
                ]);
            }

            // 4. Log the status transition
            $vendor->stateLogs()->create([
                'from_status' => Vendor::STATUS_DRAFT,
                'to_status' => Vendor::STATUS_SUBMITTED,
                'user_id' => $user->id,
                'comment' => 'Vendor application submitted for review',
            ]);
        });

        // Clear session data after successful submission
        session()->forget('vendor_onboarding');

        // Clean up temp folder
        $tempFolder = 'temp-documents/' . session()->getId();
        Storage::disk('private')->deleteDirectory($tempFolder);

        return redirect()->route('vendor.dashboard')->with('success', 'Application submitted successfully!');
    }

    /**
     * Show vendor dashboard.
     */
    public function index()
    {
        $vendor = Auth::user()->vendor;

        if (!$vendor) {
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
        $vendor = Auth::user()->vendor;

        if (!$vendor) {
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
    public function uploadDocument(Request $request)
    {
        $request->validate([
            'document_type_id' => 'required|exists:document_types,id',
            'file' => 'required|file|max:10240',
            'expiry_date' => 'nullable|date',
        ]);

        $vendor = Auth::user()->vendor;

        if (!$vendor || $vendor->status === Vendor::STATUS_DRAFT) {
            return back()->withErrors(['upload' => 'Cannot upload documents in draft status.']);
        }

        $file = $request->file('file');
        $path = $file->store('vendor-documents/' . $vendor->id, 'private');
        $hash = hash_file('sha256', $file->getRealPath());

        // Check for existing document of same type
        $existing = $vendor->documents()->where('document_type_id', $request->document_type_id)->first();

        if ($existing) {
            // Delete old file
            Storage::disk('private')->delete($existing->file_path);
            $existing->delete();
        }

        VendorDocument::create([
            'vendor_id' => $vendor->id,
            'document_type_id' => $request->document_type_id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_hash' => $hash,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'expiry_date' => $request->expiry_date,
            'verification_status' => 'pending',
        ]);

        return back()->with('success', 'Document uploaded successfully!');
    }

    /**
     * Show payment requests.
     */
    public function payments()
    {
        $vendor = Auth::user()->vendor;

        if (!$vendor) {
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
    public function createPaymentRequest(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'description' => 'required|string|max:500',
            'invoice_number' => 'nullable|string|max:50',
        ]);

        $vendor = Auth::user()->vendor;

        if (!$vendor || $vendor->status !== Vendor::STATUS_ACTIVE) {
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
        $vendor = $user->vendor;

        return Inertia::render('Vendor/Profile', [
            'vendor' => $vendor,
        ]);
    }

    /**
     * Update vendor profile.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $vendor = $user->vendor;

        if (!$vendor) {
            return back()->with('error', 'Vendor profile not found.');
        }

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'registration_number' => 'nullable|string|max:50',
            'tax_id' => 'nullable|string|max:50',
            'pan_number' => 'required|string|max:20',
            'business_type' => 'nullable|string|max:50',
            'contact_person' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'required|string|max:20',
            'bank_name' => 'nullable|string|max:100',
            'bank_account_number' => 'nullable|string|max:30',
            'bank_ifsc' => 'nullable|string|max:20',
            'bank_branch' => 'nullable|string|max:100',
        ]);

        $vendor->update($validated);

        // Sync contact_phone to user's phone field
        if (!empty($validated['contact_phone'])) {
            $user->phone = $validated['contact_phone'];
            $user->save();
        }

        return back()->with('success', 'Profile updated successfully!');
    }

    /**
     * Show vendor compliance page.
     */
    public function compliance()
    {
        $user = Auth::user();
        $vendor = $user->vendor;

        if (!$vendor) {
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
        $vendor = $user->vendor;

        if (!$vendor) {
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
        $user->unreadNotifications->markAsRead();

        return back()->with('success', 'All notifications marked as read.');
    }
}
