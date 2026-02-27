<?php

namespace Tests\Feature;

use App\Models\DocumentType;
use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use App\Notifications\VendorApplicationSubmitted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class VendorOnboardingTest extends TestCase
{
    use RefreshDatabase;

    protected $vendorUser;

    protected $opsUser;

    protected $documentType;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles
        Role::firstOrCreate(['name' => 'vendor'], ['display_name' => 'Vendor']);
        Role::firstOrCreate(['name' => 'ops_manager'], ['display_name' => 'Ops Manager']);

        // Create Vendor User
        $this->vendorUser = User::factory()->create();
        $this->vendorUser->roles()->attach(Role::where('name', 'vendor')->first());

        // Create Ops User for onboarding notifications
        $this->opsUser = User::factory()->create();
        $this->opsUser->roles()->attach(Role::where('name', 'ops_manager')->first());

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

        $this->assertDatabaseHas('vendor_applications', [
            'user_id' => $this->vendorUser->id,
            'current_step' => 2,
        ]);

        $application = \App\Models\VendorApplication::where('user_id', $this->vendorUser->id)->first();
        $this->assertEquals('Test Company', $application->data['step1']['company_name']);
    }

    public function test_vendor_can_save_step_2_bank_details()
    {
        // Setup Step 1 data in DB
        \App\Models\VendorApplication::create([
            'user_id' => $this->vendorUser->id,
            'current_step' => 2,
            'status' => 'draft',
            'data' => [
                'step1' => ['company_name' => 'Test Co']
            ]
        ]);

        $response = $this->actingAs($this->vendorUser)
            ->post(route('vendor.onboarding.step2'), [
                'bank_name' => 'Test Bank',
                'bank_account_number' => '1234567890',
                'bank_ifsc' => 'TEST0001',
            ]);

        $response->assertRedirect(route('vendor.onboarding', ['step' => 3]));

        $application = \App\Models\VendorApplication::where('user_id', $this->vendorUser->id)->first();
        $this->assertEquals('Test Bank', $application->data['step2']['bank_name']);
        $this->assertEquals(3, $application->current_step);
    }

    public function test_vendor_can_upload_documents_step_3()
    {
        // Setup previous steps
        \App\Models\VendorApplication::create([
            'user_id' => $this->vendorUser->id,
            'current_step' => 3,
            'status' => 'draft',
            'data' => [
                'step1' => ['company_name' => 'Test Co'],
                'step2' => ['bank_name' => 'Test Bank'],
            ]
        ]);

        $file = UploadedFile::fake()->create('pan.pdf', 100);

        $response = $this->actingAs($this->vendorUser)
            ->post(route('vendor.onboarding.step3'), [
                'documents' => [
                    [
                        'document_type_id' => $this->documentType->id,
                        'file' => $file,
                    ],
                ],
            ]);

        $response->assertRedirect(route('vendor.onboarding', ['step' => 4]));

        $application = \App\Models\VendorApplication::where('user_id', $this->vendorUser->id)->first();
        $this->assertNotEmpty($application->data['step3']['documents']);
        $this->assertEquals(4, $application->current_step);
        // The file path should contain the application ID
        $this->assertStringContainsString('vendor-applications/' . $application->id, $application->data['step3']['documents'][0]['file_path']);
    }

    public function test_vendor_can_submit_application()
    {
        Notification::fake();

        // create application record
        $application = \App\Models\VendorApplication::create([
            'user_id' => $this->vendorUser->id,
            'current_step' => 4,
            'status' => 'draft',
            'data' => [
                'step1' => [
                    'company_name' => 'Test Company',
                    'contact_person' => 'Test Person',
                    'contact_phone' => '1234567890',
                    'pan_number' => 'ABCDE1234F',
                    'address' => '123 Test St',
                    'city' => 'Test City',
                    'pincode' => '123456',
                    'contact_email' => $this->vendorUser->email,
                ],
                'step2' => [
                    'bank_name' => 'Test Bank',
                    'bank_account_number' => '1234567890',
                    'bank_ifsc' => 'TEST0001',
                ],
                // Step 3 will be set up with a real temp file
            ]
        ]);

        // Create a real temp file
        $file = UploadedFile::fake()->create('pan.pdf', 100);
        $path = $file->store('vendor-applications/' . $application->id . '/temp', 'private');

        // Update application data with document info
        $data = $application->data;
        $data['step3'] = [
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
        ];
        $application->update(['data' => $data]);

        $response = $this->actingAs($this->vendorUser)
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

        // Check document was moved to final location
        $document = $vendor->documents->first();
        Storage::disk('private')->assertExists($document->file_path);

        // Check application status updated
        $this->assertDatabaseHas('vendor_applications', [
            'id' => $application->id,
            'status' => 'submitted',
        ]);

        Notification::assertSentTo($this->opsUser, VendorApplicationSubmitted::class);
    }
}
