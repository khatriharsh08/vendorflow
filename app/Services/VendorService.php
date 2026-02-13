<?php

namespace App\Services;

use App\Interfaces\VendorRepositoryInterface;
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
    public function storeOnboardingStep1(array $data)
    {
        $user = Auth::user();

        if (! $user instanceof User) {
            throw new \RuntimeException('User must be logged in.');
        }

        $sessionData = session('vendor_onboarding', []);
        $sessionData['step1'] = $data;
        $sessionData['step1']['contact_email'] = $user->email;
        session(['vendor_onboarding' => $sessionData]);
    }

    /**
     * Handle Step 2 of onboarding (Bank Details).
     *
     * @param  array<string, mixed>  $data  Validated bank details.
     * @return void
     */
    public function storeOnboardingStep2(array $data)
    {
        $sessionData = session('vendor_onboarding', []);
        $sessionData['step2'] = $data;
        session(['vendor_onboarding' => $sessionData]);
    }

    /**
     * Handle Step 3 of onboarding (Document Uploads to Temp).
     *
     * @param  array<int, array{document_type_id: int, file: \Illuminate\Http\UploadedFile}>  $documentsData
     * @return void
     */
    public function storeOnboardingStep3(array $documentsData)
    {
        // Store files in temp folder with unique session key
        $tempFolder = 'temp-documents/'.session()->getId();
        $processedDocuments = [];

        // Check for existing documents in session
        $sessionData = session('vendor_onboarding', []);
        $existingDocuments = $sessionData['step3']['documents'] ?? [];

        foreach ($documentsData as $doc) {
            /** @var UploadedFile $file */
            $file = $doc['file'];
            $path = $file->store($tempFolder, 'private');

            $processedDocuments[] = [
                'document_type_id' => $doc['document_type_id'],
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'file_hash' => hash_file('sha256', $file->getRealPath()),
            ];
        }

        // Merge logic: If a document type already exists in session, replace it with the new one
        // Otherwise, keep the existing one.
        $finalDocuments = $existingDocuments;

        foreach ($processedDocuments as $newDoc) {
            $replaced = false;
            foreach ($finalDocuments as $key => $existingDoc) {
                if ($existingDoc['document_type_id'] == $newDoc['document_type_id']) {
                    // Remove old file from temp storage if it exists (optional cleanup)
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

        $sessionData['step3'] = ['documents' => $finalDocuments];
        session(['vendor_onboarding' => $sessionData]);
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
        $sessionData = session('vendor_onboarding', []);

        return DB::transaction(function () use ($user, $sessionData) {
            // 1. Create or Update Vendor
            $vendorData = array_merge(
                $sessionData['step1'],
                $sessionData['step2'],
                ['status' => Vendor::STATUS_SUBMITTED]
            );

            $vendor = $this->vendorRepository->updateOrCreate(
                ['user_id' => $user->id],
                $vendorData
            );

            // Sync contact_phone
            if (! empty($sessionData['step1']['contact_phone'])) {
                $user->phone = $sessionData['step1']['contact_phone'];
                $user->save();
            }

            // 2. Delete existing documents
            $this->vendorRepository->deleteDocuments($vendor);

            // 3. Move files and create records
            foreach ($sessionData['step3']['documents'] as $doc) {
                $tempPath = $doc['file_path'];
                $newPath = 'vendor-documents/'.$vendor->id.'/'.basename($tempPath);

                if (Storage::disk('private')->exists($tempPath)) {
                    Storage::disk('private')->move($tempPath, $newPath);
                }

                $this->vendorRepository->createDocument($vendor, [
                    'document_type_id' => $doc['document_type_id'],
                    'file_name' => $doc['file_name'],
                    'file_path' => $newPath,
                    'file_hash' => $doc['file_hash'],
                    'file_size' => $doc['file_size'],
                    'mime_type' => $doc['mime_type'],
                    'verification_status' => 'pending',
                ]);
            }

            // 4. Log status
            $vendor->stateLogs()->create([
                'from_status' => Vendor::STATUS_DRAFT,
                'to_status' => Vendor::STATUS_SUBMITTED,
                'user_id' => $user->id,
                'comment' => 'Vendor application submitted for review',
            ]);

            // Cleanup
            session()->forget('vendor_onboarding');
            $tempFolder = 'temp-documents/'.session()->getId();
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
        $path = $file->store('vendor-documents/'.$vendor->id, 'private');
        $hash = hash_file('sha256', $file->getRealPath());

        // Check for existing document of same type
        $existing = $vendor->documents()->where('document_type_id', $documentTypeId)->first();

        if ($existing) {
            Storage::disk('private')->delete($existing->file_path);
            $existing->delete();
        }

        return $this->vendorRepository->createDocument($vendor, [
            'document_type_id' => $documentTypeId,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_hash' => $hash,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'expiry_date' => $expiryDate,
            'verification_status' => 'pending',
        ]);
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
