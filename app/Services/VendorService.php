<?php

namespace App\Services;

use App\Interfaces\VendorRepositoryInterface;
use App\Models\DocumentVersion;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class VendorService
{
    protected VendorRepositoryInterface $vendorRepository;

    public function __construct(VendorRepositoryInterface $vendorRepository)
    {
        $this->vendorRepository = $vendorRepository;
    }

    /**
     * Handle Step 1 of onboarding (Company Info).
     *
     * @param  array<string, mixed>  $data  Validated company information.
     * @return void
     *
     * @throws \RuntimeException If user is not authenticated.
     */
    /**
     * Get or create a draft application for the user.
     */
    public function getDraftApplication(User $user): \App\Models\VendorApplication
    {
        return \App\Models\VendorApplication::firstOrCreate(
            ['user_id' => $user->id, 'status' => 'draft'],
            ['current_step' => 1, 'data' => []]
        );
    }

    /**
     * Handle Step 1 of onboarding (Company Info).
     */
    public function storeOnboardingStep1(array $data)
    {
        $user = Auth::user();
        $application = $this->getDraftApplication($user);

        $currentData = $application->data ?? [];
        $currentData['step1'] = $data;
        $currentData['step1']['contact_email'] = $user->email;

        $application->update([
            'data' => $currentData,
            'current_step' => max($application->current_step, 2)
        ]);

        return $application;
    }

    /**
     * Handle Step 2 of onboarding (Bank Details).
     */
    public function storeOnboardingStep2(array $data)
    {
        $user = Auth::user();
        $application = $this->getDraftApplication($user);

        $currentData = $application->data ?? [];
        $currentData['step2'] = $data;

        $application->update([
            'data' => $currentData,
            'current_step' => max($application->current_step, 3)
        ]);

        return $application;
    }

    /**
     * Handle Step 3 of onboarding (Document Uploads to Temp).
     */
    public function storeOnboardingStep3(array $documentsData)
    {
        $user = Auth::user();
        $application = $this->getDraftApplication($user);

        // Store files in application-specific folder
        $tempFolder = 'vendor-applications/' . $application->id . '/temp';
        $processedDocuments = [];

        $currentData = $application->data ?? [];

        // Check for existing documents in draft
        $existingDocuments = array_map(function ($doc) {
            $doc['document_type_id'] = (int) ($doc['document_type_id'] ?? 0);
            return $doc;
        }, $currentData['step3']['documents'] ?? []);

        foreach ($documentsData as $doc) {
            $documentTypeId = (int) ($doc['document_type_id'] ?? 0);
            /** @var UploadedFile $file */
            $file = $doc['file'];
            $path = $file->store($tempFolder, 'private');

            $processedDocuments[] = [
                'document_type_id' => $documentTypeId,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'file_hash' => hash_file('sha256', $file->getRealPath()),
            ];
        }

        // Merge logic
        $finalDocuments = $existingDocuments;

        foreach ($processedDocuments as $newDoc) {
            $replaced = false;
            foreach ($finalDocuments as $key => $existingDoc) {
                if ((int) ($existingDoc['document_type_id'] ?? 0) === $newDoc['document_type_id']) {
                    // Remove old file
                    if (Storage::disk('private')->exists($existingDoc['file_path'])) {
                        Storage::disk('private')->delete($existingDoc['file_path']);
                    }
                    $finalDocuments[$key] = $newDoc;
                    $replaced = true;
                    break;
                }
            }
            if (! $replaced) {
                $finalDocuments[] = $newDoc;
            }
        }

        $currentData['step3'] = ['documents' => $finalDocuments];

        $application->update([
            'data' => $currentData,
            'current_step' => max($application->current_step, 4),
        ]);

        return $application;
    }

    /**
     * Submit the final application.
     *
     * @param  \App\Models\User  $user  The authenticated user submitting the application.
     * @return \App\Models\Vendor The created or updated vendor instance.
     *
     * @throws \Exception If database transaction fails.
     */
    public function submitApplication(User $user)
    {
        $application = $this->getDraftApplication($user);
        $data = $application->data ?? [];

        return DB::transaction(function () use ($user, $data, $application) {
            // 1. Create or Update Vendor (Ensure it exists first)
            $vendorData = array_merge(
                $data['step1'] ?? [],
                $data['step2'] ?? []
            );

            // If vendor doesn't exist, create as DRAFT first. 
            // If exists, keep current status (should be DRAFT or REJECTED) to allow transition.
            $vendor = $this->vendorRepository->updateOrCreate(
                ['user_id' => $user->id],
                $vendorData
            );

            // Ensure we are in a valid state to transition (e.g. if new, set to DRAFT)
            if (!$vendor->exists || !$vendor->status) {
                $vendor->status = Vendor::STATUS_DRAFT;
                $vendor->save();
            }

            // Sync contact_phone
            if (! empty($data['step1']['contact_phone'])) {
                $user->phone = $data['step1']['contact_phone'];
                $user->save();
            }

            // 2. Keep history immutable by deactivating current versions.
            $vendor->documents()->where('is_current', true)->update(['is_current' => false]);

            // 3. Move files and create records
            if (!empty($data['step3']['documents'])) {
                foreach ($data['step3']['documents'] as $doc) {
                    $documentTypeId = (int) ($doc['document_type_id'] ?? 0);
                    $tempPath = $doc['file_path'];
                    $newPath = 'vendor-documents/' . $vendor->id . '/' . basename($tempPath);

                    if (Storage::disk('private')->exists($tempPath)) {
                        Storage::disk('private')->move($tempPath, $newPath);
                    } else {
                        // If file not found in temp, check if it's already in final path (re-submission case)
                        if (!Storage::disk('private')->exists($newPath)) {
                            // CRITICAL: Fail the transaction if a document is missing
                            throw new \Exception("Document upload failed: File '{$doc['file_name']}' not found. Please re-upload.");
                        }
                    }

                    $nextVersion = (int) $vendor->documents()
                        ->where('document_type_id', $documentTypeId)
                        ->max('version') + 1;

                    $document = $this->vendorRepository->createDocument($vendor, [
                        'document_type_id' => $documentTypeId,
                        'file_name' => $doc['file_name'],
                        'file_path' => $newPath,
                        'file_hash' => $doc['file_hash'],
                        'file_size' => $doc['file_size'],
                        'mime_type' => $doc['mime_type'],
                        'version' => max(1, $nextVersion),
                        'is_current' => true,
                        'verification_status' => 'pending',
                    ]);

                    DocumentVersion::create([
                        'vendor_document_id' => $document->id,
                        'version' => $document->version,
                        'file_path' => $document->file_path,
                        'file_hash' => $document->file_hash,
                        'uploaded_by' => $user->id,
                        'notes' => 'Uploaded via onboarding submission',
                    ]);
                }
            }

            // 4. Perform State Transition (Logs & Audit included)
            // This sets status to SUBMITTED, sets submitted_at, logs change, etc.
            if ($vendor->status !== Vendor::STATUS_SUBMITTED) {
                $vendor->transitionTo(Vendor::STATUS_SUBMITTED, $user, 'Vendor application submitted for review');
            }

            // Cleanup: Mark application as submitted
            $application->update(['status' => 'submitted']);

            $tempFolder = 'vendor-applications/' . $application->id;
            Storage::disk('private')->deleteDirectory($tempFolder);

            // Notify Ops Managers
            $opsManagers = User::role(\App\Models\Role::OPS_MANAGER)->get();
            foreach ($opsManagers as $manager) {
                $manager->notify(new \App\Notifications\VendorApplicationSubmitted($vendor));
            }

            return $vendor;
        });
    }

    /**
     * Upload a single document for an active vendor.
     *
     * @return \App\Models\VendorDocument
     */
    public function uploadDocument(Vendor $vendor, UploadedFile $file, int $documentTypeId, ?string $expiryDate)
    {
        $path = $file->store('vendor-documents/' . $vendor->id, 'private');
        $hash = hash_file('sha256', $file->getRealPath());
        $actorId = Auth::id() ?? $vendor->user_id;

        // Keep old version immutable, mark it as no longer current.
        $existing = $vendor->documents()
            ->where('document_type_id', $documentTypeId)
            ->where('is_current', true)
            ->latest('version')
            ->first();

        $nextVersion = 1;
        if ($existing) {
            $existing->update(['is_current' => false]);
            $nextVersion = $existing->version + 1;
        }

        $document = $this->vendorRepository->createDocument($vendor, [
            'document_type_id' => $documentTypeId,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_hash' => $hash,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'expiry_date' => $expiryDate,
            'version' => $nextVersion,
            'is_current' => true,
            'verification_status' => 'pending',
        ]);

        DocumentVersion::create([
            'vendor_document_id' => $document->id,
            'version' => $document->version,
            'file_path' => $document->file_path,
            'file_hash' => $document->file_hash,
            'uploaded_by' => $actorId,
            'notes' => 'Re-uploaded document version',
        ]);

        return $document;
    }

    /**
     * Update vendor profile.
     */
    public function updateProfile(Vendor $vendor, array $data)
    {
        $vendor->update($data);

        // Sync contact_phone to user's phone field
        if (! empty($data['contact_phone'])) {
            $user = $vendor->user;
            $user->phone = $data['contact_phone'];
            $user->save();
        }

        return $vendor;
    }
}
