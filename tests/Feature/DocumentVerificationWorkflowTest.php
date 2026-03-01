<?php

namespace Tests\Feature;

use App\Models\DocumentType;
use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DocumentVerificationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $opsUser;

    private Vendor $vendor;

    private DocumentType $documentType;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(
            ['name' => Role::VENDOR],
            ['display_name' => 'Vendor']
        );
        Role::firstOrCreate(
            ['name' => Role::OPS_MANAGER],
            ['display_name' => 'Operations Manager']
        );

        $this->opsUser = User::factory()->create();
        $this->opsUser->assignRole(Role::OPS_MANAGER);

        $vendorUser = User::factory()->create();
        $vendorUser->assignRole(Role::VENDOR);

        $this->vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'company_name' => 'QA Vendor Co',
            'contact_person' => 'QA Contact',
            'contact_email' => $vendorUser->email,
            'contact_phone' => '9876543210',
            'status' => Vendor::STATUS_SUBMITTED,
            'compliance_status' => Vendor::COMPLIANCE_PENDING,
            'compliance_score' => 0,
            'pan_number' => 'ABCDE1234F',
            'address' => '123 QA Street',
            'city' => 'Ahmedabad',
            'pincode' => '380001',
        ]);

        $this->documentType = DocumentType::create([
            'name' => 'pan_card',
            'display_name' => 'PAN Card',
            'description' => 'PAN verification',
            'is_mandatory' => true,
            'has_expiry' => false,
            'expiry_warning_days' => 30,
            'allowed_extensions' => ['pdf'],
            'max_file_size_mb' => 5,
            'is_active' => true,
        ]);
    }

    public function test_documents_index_defaults_to_pending_queue(): void
    {
        $pending = $this->createDocument(VendorDocument::STATUS_PENDING, 'pending-pan.pdf');
        $this->createDocument(VendorDocument::STATUS_VERIFIED, 'verified-pan.pdf');

        $response = $this->actingAs($this->opsUser)
            ->get(route('admin.documents.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Admin/Documents/Index')
                ->where('currentStatus', VendorDocument::STATUS_PENDING)
                ->has('documents.data', 1)
                ->where('documents.data.0.id', $pending->id)
        );
    }

    public function test_verify_action_updates_document_and_sets_specific_success_message(): void
    {
        $document = $this->createDocument(VendorDocument::STATUS_PENDING, 'verify-pan.pdf');

        $response = $this->actingAs($this->opsUser)
            ->post(route('admin.documents.verify', $document), [
                'notes' => 'Verified against official record',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'PAN Card verified successfully.');

        $document->refresh();
        $this->assertSame(VendorDocument::STATUS_VERIFIED, $document->verification_status);
        $this->assertSame($this->opsUser->id, $document->verified_by);
        $this->assertNotNull($document->verified_at);
    }

    public function test_verify_action_blocks_already_processed_document(): void
    {
        $document = $this->createDocument(VendorDocument::STATUS_REJECTED, 'rejected-pan.pdf');

        $response = $this->actingAs($this->opsUser)
            ->post(route('admin.documents.verify', $document), [
                'notes' => 'Should not pass',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Only pending documents can be verified.');

        $document->refresh();
        $this->assertSame(VendorDocument::STATUS_REJECTED, $document->verification_status);
        $this->assertNull($document->verified_by);
        $this->assertNull($document->verified_at);
    }

    private function createDocument(string $status, string $fileName): VendorDocument
    {
        return VendorDocument::create([
            'vendor_id' => $this->vendor->id,
            'document_type_id' => $this->documentType->id,
            'file_name' => $fileName,
            'file_path' => "vendor-documents/{$fileName}",
            'file_hash' => hash('sha256', $fileName.$status),
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
            'version' => 1,
            'is_current' => true,
            'verification_status' => $status,
        ]);
    }
}
