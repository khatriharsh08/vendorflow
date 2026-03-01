<?php

namespace Tests\Feature;

use App\Models\DocumentType;
use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorApplication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentExpiryWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('private');
        Role::firstOrCreate(['name' => 'vendor'], ['display_name' => 'Vendor']);
    }

    private function createVendorUser(): User
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::where('name', 'vendor')->first());

        return $user;
    }

    public function test_onboarding_step3_requires_expiry_for_expiry_document_types(): void
    {
        $user = $this->createVendorUser();

        $documentType = DocumentType::create([
            'name' => 'insurance_certificate',
            'display_name' => 'Insurance Certificate',
            'is_mandatory' => true,
            'has_expiry' => true,
            'is_active' => true,
        ]);

        VendorApplication::create([
            'user_id' => $user->id,
            'current_step' => 3,
            'status' => 'draft',
            'data' => [
                'step1' => ['company_name' => 'Expiry Test Co'],
                'step2' => ['bank_name' => 'Expiry Bank'],
            ],
        ]);

        $file = UploadedFile::fake()->create('insurance.pdf', 120);

        $response = $this->actingAs($user)->post(route('vendor.onboarding.step3'), [
            'documents' => [
                [
                    'document_type_id' => $documentType->id,
                    'file' => $file,
                ],
            ],
        ]);

        $response->assertSessionHasErrors(['documents.0.expiry_date']);
    }

    public function test_onboarding_submission_persists_document_expiry_date(): void
    {
        $user = $this->createVendorUser();

        $documentType = DocumentType::create([
            'name' => 'service_agreement',
            'display_name' => 'Service Agreement',
            'is_mandatory' => true,
            'has_expiry' => true,
            'is_active' => true,
        ]);

        VendorApplication::create([
            'user_id' => $user->id,
            'current_step' => 3,
            'status' => 'draft',
            'data' => [
                'step1' => [
                    'company_name' => 'Expiry Persist Co',
                    'contact_person' => 'Owner',
                    'contact_phone' => '9999999999',
                    'pan_number' => 'ABCDE1234F',
                    'address' => 'Address',
                    'city' => 'City',
                    'pincode' => '123456',
                    'contact_email' => $user->email,
                ],
                'step2' => [
                    'bank_name' => 'Expiry Bank',
                    'bank_account_number' => '1234567890',
                    'bank_ifsc' => 'TEST0001',
                ],
            ],
        ]);

        $expiryDate = now()->addDays(45)->format('Y-m-d');
        $file = UploadedFile::fake()->create('agreement.pdf', 120);

        $this->actingAs($user)->post(route('vendor.onboarding.step3'), [
            'documents' => [
                [
                    'document_type_id' => $documentType->id,
                    'file' => $file,
                    'expiry_date' => $expiryDate,
                ],
            ],
        ])->assertRedirect(route('vendor.onboarding', ['step' => 4]));

        $this->actingAs($user)->post(route('vendor.onboarding.submit'))
            ->assertRedirect(route('vendor.dashboard'));

        $vendor = Vendor::query()->where('user_id', $user->id)->firstOrFail();
        $document = $vendor->documents()
            ->where('document_type_id', $documentType->id)
            ->firstOrFail();

        $this->assertSame($expiryDate, $document->expiry_date?->toDateString());
    }

    public function test_vendor_document_upload_requires_expiry_when_document_type_has_expiry(): void
    {
        $user = $this->createVendorUser();

        $vendor = Vendor::create([
            'user_id' => $user->id,
            'company_name' => 'Upload Expiry Co',
            'contact_person' => 'Owner',
            'contact_email' => $user->email,
            'contact_phone' => '9999999999',
            'status' => Vendor::STATUS_ACTIVE,
            'pan_number' => 'ABCDE1234F',
            'address' => 'Address',
            'city' => 'City',
            'pincode' => '123456',
        ]);

        $documentType = DocumentType::create([
            'name' => 'insurance',
            'display_name' => 'Insurance',
            'is_mandatory' => false,
            'has_expiry' => true,
            'is_active' => true,
        ]);

        $file = UploadedFile::fake()->create('insurance.pdf', 100);

        $this->actingAs($user)->post(route('vendor.documents.upload'), [
            'document_type_id' => $documentType->id,
            'file' => $file,
        ])->assertSessionHasErrors(['expiry_date']);

        $this->assertDatabaseCount('vendor_documents', 0);
        $this->assertNotNull($vendor);
    }

    public function test_vendor_document_upload_allows_optional_expiry_for_non_expiry_document_type(): void
    {
        $user = $this->createVendorUser();

        $vendor = Vendor::create([
            'user_id' => $user->id,
            'company_name' => 'General Docs Co',
            'contact_person' => 'Owner',
            'contact_email' => $user->email,
            'contact_phone' => '9999999999',
            'status' => Vendor::STATUS_ACTIVE,
            'pan_number' => 'ABCDE1234F',
            'address' => 'Address',
            'city' => 'City',
            'pincode' => '123456',
        ]);

        $documentType = DocumentType::create([
            'name' => 'tax_form',
            'display_name' => 'Tax Form',
            'is_mandatory' => false,
            'has_expiry' => false,
            'is_active' => true,
        ]);

        $expiryDate = now()->addDays(120)->toDateString();
        $file = UploadedFile::fake()->create('tax-form.pdf', 80);

        $this->actingAs($user)->post(route('vendor.documents.upload'), [
            'document_type_id' => $documentType->id,
            'file' => $file,
            'expiry_date' => $expiryDate,
        ])->assertSessionHasNoErrors();

        $document = $vendor->documents()
            ->where('document_type_id', $documentType->id)
            ->latest('id')
            ->firstOrFail();

        $this->assertSame($expiryDate, $document->expiry_date?->toDateString());
    }
}
