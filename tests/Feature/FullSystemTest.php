<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vendor;
use App\Models\Role;
use App\Notifications\VendorApplicationSubmitted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FullSystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed Roles
        \App\Models\Role::create([
            'name' => 'vendor',
            'display_name' => 'Vendor',
            'description' => 'Vendor Role'
        ]);
        \App\Models\Role::create([
            'name' => 'ops_manager',
            'display_name' => 'Ops Manager',
            'description' => 'Operations Manager'
        ]);

        // Seed Document Types
        \App\Models\DocumentType::create([
            'id' => 1,
            'name' => 'gst_certificate',
            'display_name' => 'GST Certificate',
            'is_mandatory' => true,
            'is_active' => true,
        ]);
    }

    public function test_full_vendor_onboarding_journey()
    {
        Notification::fake();
        Storage::fake('private');

        // 1. Create User (Vendor)
        $user = User::factory()->create();
        $user->assignRole('vendor'); // Using string name as Role::VENDOR might be constant validation issue or just easier

        // Create Ops Manager for notifications
        $opsManager = User::factory()->create();
        $opsManager->assignRole('ops_manager');

        // 2. Login
        $this->actingAs($user);

        // 3. Visit Dashboard -> Redirects to Onboarding
        $response = $this->get('/vendor/dashboard');
        $response->assertRedirect('/vendor/onboarding');

        // 4. Step 1: Company Info
        $companyData = [
            'company_name' => 'Test Corp Ltd',
            'registration_number' => 'U12345MH2023PTC123456',
            'tax_id' => '22AAAAA0000A1Z5',
            'pan_number' => 'ABCDE1234F',
            'contact_person' => 'John Doe',
            'contact_phone' => '+919876543210',
            'address' => '123 Tech Park',
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'pincode' => '400001',
        ];

        $this->post('/vendor/onboarding/step1', $companyData)
            ->assertRedirect('/vendor/onboarding?step=2');

        // Verify Draft Created
        $this->assertDatabaseHas('vendor_applications', [
            'user_id' => $user->id,
            'current_step' => 2,
        ]);

        // 5. Step 2: Bank Info
        $bankData = [
            'bank_name' => 'HDFC Bank',
            'bank_account_number' => '123456789012',
            'bank_ifsc' => 'HDFC0001234',
            'bank_branch' => 'Mumbai Main',
        ];

        $this->post('/vendor/onboarding/step2', $bankData)
            ->assertRedirect('/vendor/onboarding?step=3');

        // 6. Step 3: Documents
        // Mock a document upload
        $file = UploadedFile::fake()->create('gst_cert.pdf', 100);

        // We need a document_type_id. Let's assume one exists or mock it if using DB seed.
        // For test stability, we'll create one if not exists or use ID 1.
        $docTypeId = 1; // Assuming seeded

        $docData = [
            'documents' => [
                [
                    'document_type_id' => $docTypeId,
                    'file' => $file,
                ]
            ]
        ];

        $this->post('/vendor/onboarding/step3', $docData);

        // 7. Submit Application
        $this->post('/vendor/onboarding/submit')
            ->assertRedirect('/vendor/dashboard');

        // 8. Verify Vendor Created and Submitted
        $this->assertDatabaseHas('vendors', [
            'user_id' => $user->id,
            'company_name' => 'Test Corp Ltd',
            'status' => Vendor::STATUS_SUBMITTED,
        ]);

        // 9. Verify Notification Sent
        Notification::assertSentTo(
            User::role(Role::OPS_MANAGER)->get(),
            VendorApplicationSubmitted::class
        );

        // 10. Verify State Log
        $vendor = Vendor::where('user_id', $user->id)->first();
        $this->assertDatabaseHas('vendor_state_logs', [
            'vendor_id' => $vendor->id,
            'to_status' => Vendor::STATUS_SUBMITTED,
        ]);
    }
}
