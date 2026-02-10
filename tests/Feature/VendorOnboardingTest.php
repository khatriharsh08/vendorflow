<?php

namespace Tests\Feature;

use App\Models\DocumentType;
use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class VendorOnboardingTest extends TestCase
{
    use RefreshDatabase;

    protected $vendorUser;

    protected $documentType;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles
        Role::firstOrCreate(['name' => 'vendor'], ['display_name' => 'Vendor']);

        // Create Vendor User
        $this->vendorUser = User::factory()->create();
        $this->vendorUser->roles()->attach(Role::where('name', 'vendor')->first());

        // Create Document Type
        $this->documentType = DocumentType::create([
            'name' => 'pan_card',
            'display_name' => 'PAN Card',
            'is_mandatory' => true,
            'is_active' => true,
        ]);

        Storage::fake('private');
    }

    public function test_vendor_can_save_step_1_company_info()
    {
        $response = $this->actingAs($this->vendorUser)
            ->post(route('vendor.onboarding.step1'), [
                'company_name' => 'Test Company',
                'contact_person' => 'Test Person',
                'contact_phone' => '1234567890',
                'pan_number' => 'ABCDE1234F',
                'address' => '123 Test St',
                'city' => 'Test City',
                'pincode' => '123456',
            ]);

        $response->assertRedirect(route('vendor.onboarding', ['step' => 2]));
        $response->assertSessionHas('vendor_onboarding.step1');
        $this->assertEquals('Test Company', session('vendor_onboarding.step1.company_name'));
    }

    public function test_vendor_can_save_step_2_bank_details()
    {
        // Simulate step 1 completion
        $sessionData = ['step1' => ['company_name' => 'Test Co']];

        $response = $this->actingAs($this->vendorUser)
            ->withSession(['vendor_onboarding' => $sessionData])
            ->post(route('vendor.onboarding.step2'), [
                'bank_name' => 'Test Bank',
                'bank_account_number' => '1234567890',
                'bank_ifsc' => 'TEST0001',
            ]);

        $response->assertRedirect(route('vendor.onboarding', ['step' => 3]));
        $response->assertSessionHas('vendor_onboarding.step2');
    }

    public function test_vendor_can_upload_documents_step_3()
    {
        // Simulate previous steps
        $sessionData = [
            'step1' => ['company_name' => 'Test Co'],
            'step2' => ['bank_name' => 'Test Bank'],
        ];

        $file = UploadedFile::fake()->create('pan.pdf', 100);

        $response = $this->actingAs($this->vendorUser)
            ->withSession(['vendor_onboarding' => $sessionData])
            ->post(route('vendor.onboarding.step3'), [
                'documents' => [
                    [
                        'document_type_id' => $this->documentType->id,
                        'file' => $file,
                    ],
                ],
            ]);

        $response->assertRedirect(route('vendor.onboarding', ['step' => 4]));
        $response->assertSessionHas('vendor_onboarding.step3.documents');
    }

    public function test_vendor_can_submit_application()
    {
        // Setup complete session data with mocked document path
        $file = UploadedFile::fake()->create('pan.pdf', 100);
        $path = $file->store('temp-documents/mock-session-id', 'private');

        $sessionData = [
            'step1' => [
                'company_name' => 'Test Company',
                'contact_person' => 'Test Person',
                'contact_phone' => '1234567890',
                'pan_number' => 'ABCDE1234F',
                'address' => '123 Test St',
                'city' => 'Test City',
                'pincode' => '123456',
                // Add required fields by model logic if any
                'contact_email' => $this->vendorUser->email,
            ],
            'step2' => [
                'bank_name' => 'Test Bank',
                'bank_account_number' => '1234567890',
                'bank_ifsc' => 'TEST0001',
            ],
            'step3' => [
                'documents' => [
                    [
                        'document_type_id' => $this->documentType->id,
                        'file_path' => $path,
                        'file_name' => 'pan.pdf',
                        'file_hash' => 'hash',
                        'file_size' => 100,
                        'mime_type' => 'application/pdf',
                        'verification_status' => 'pending',
                    ],
                ],
            ],
        ];

        $response = $this->actingAs($this->vendorUser)
            ->withSession(['vendor_onboarding' => $sessionData])
            ->post(route('vendor.onboarding.submit'));

        $response->assertRedirect(route('vendor.dashboard'));

        // Verify Vendor created in DB
        $this->assertDatabaseHas('vendors', [
            'user_id' => $this->vendorUser->id,
            'company_name' => 'Test Company',
            'status' => Vendor::STATUS_SUBMITTED,
        ]);

        // Verify Document created
        $vendor = \App\Models\Vendor::where('user_id', $this->vendorUser->id)->first();
        $this->assertDatabaseHas('vendor_documents', [
            'vendor_id' => $vendor->id,
            'document_type_id' => $this->documentType->id,
        ]);
    }
}
