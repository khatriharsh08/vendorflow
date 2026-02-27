<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests\Vendor\StoreStep1Request;
use App\Http\Requests\Vendor\StoreStep2Request;
use App\Http\Requests\Vendor\StoreStep3Request;
use App\Models\DocumentType;
use App\Models\Vendor;
use App\Services\VendorService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VendorOnboardingController extends Controller
{
    protected $vendorService;

    public function __construct(VendorService $vendorService)
    {
        $this->vendorService = $vendorService;
    }

    /**
     * Show the onboarding wizard.
     */
    public function show(Request $request)
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

        // Get draft application data from DB
        $application = $this->vendorService->getDraftApplication($user);
        $sessionData = $application->data ?? [];

        // Logic: current_step in DB is the max step reached.
        if ($step > $application->current_step && $step > 1) {
            return redirect()->route('vendor.onboarding', ['step' => $application->current_step]);
        }

        return Inertia::render('Vendor/Onboarding/Wizard', [
            'currentStep' => (int) $step,
            'vendor' => $vendor,
            'documentTypes' => $documentTypes,
            'sessionData' => $sessionData,
        ]);
    }

    /**
     * Save Step 1 data to draft.
     */
    public function storeStep1(StoreStep1Request $request)
    {
        $validated = $request->validated();

        $this->vendorService->storeOnboardingStep1($validated);

        return redirect()->route('vendor.onboarding', ['step' => 2]);
    }

    /**
     * Save Step 2 data to draft.
     */
    public function storeStep2(StoreStep2Request $request)
    {
        $validated = $request->validated();

        // Validation check
        $application = $this->vendorService->getDraftApplication(Auth::user());
        $data = $application->data ?? [];

        if (empty($data['step1'])) {
            return redirect()->route('vendor.onboarding', ['step' => 1])
                ->withErrors(['step' => 'Please complete Step 1 first.']);
        }

        $this->vendorService->storeOnboardingStep2($validated);

        return redirect()->route('vendor.onboarding', ['step' => 3]);
    }

    /**
     * Save Step 3 documents to temp storage (draft).
     */
    public function storeStep3(StoreStep3Request $request)
    {
        $application = $this->vendorService->getDraftApplication(Auth::user());
        $data = $application->data ?? [];

        // Check if previous steps are complete
        if (empty($data['step1']) || empty($data['step2'])) {
            return redirect()->route('vendor.onboarding', ['step' => 1])
                ->withErrors(['step' => 'Please complete previous steps first.']);
        }

        $this->vendorService->storeOnboardingStep3($request->documents);

        return redirect()->route('vendor.onboarding', ['step' => 4]);
    }

    /**
     * View a temporary onboarding document.
     */
    public function viewDocument($typeId)
    {
        $user = Auth::user();
        $application = $this->vendorService->getDraftApplication($user);

        $data = $application->data ?? [];
        $documents = $data['step3']['documents'] ?? [];

        // Path is now: vendor-applications/{id}/temp/filename
        $expectedPrefix = 'vendor-applications/' . $application->id . '/';

        foreach ($documents as $doc) {
            if ($doc['document_type_id'] == $typeId) {
                $path = $doc['file_path'];
                if (
                    is_string($path)
                    && str_starts_with($path, $expectedPrefix)
                    && Storage::disk('private')->exists($path)
                ) {
                    return Storage::disk('private')->response($path, $doc['file_name']);
                }
            }
        }

        abort(404);
    }

    /**
     * Submit the complete vendor application (saves ALL data to database).
     */
    public function submit(Request $request)
    {
        $user = Auth::user();
        $application = $this->vendorService->getDraftApplication($user);
        $data = $application->data ?? [];

        // Validate all steps are complete
        if (empty($data['step1']) || empty($data['step2']) || empty($data['step3'])) {
            return redirect()->route('vendor.onboarding', ['step' => 1])
                ->withErrors(['step' => 'Please complete all steps before submitting.']);
        }

        // Check mandatory documents
        $mandatoryTypes = DocumentType::where('is_mandatory', true)->pluck('id')->toArray();
        $uploadedTypes = collect($data['step3']['documents'] ?? [])->pluck('document_type_id')->toArray();
        $missingDocs = array_diff($mandatoryTypes, $uploadedTypes);

        if (! empty($missingDocs)) {
            return redirect()->route('vendor.onboarding', ['step' => 3])
                ->withErrors(['documents' => 'Please upload all mandatory documents before submitting.']);
        }

        try {
            $this->vendorService->submitApplication($user);

            return redirect()->route('vendor.dashboard')->with('success', 'Application submitted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to submit application: ' . $e->getMessage()]);
        }
    }
}
