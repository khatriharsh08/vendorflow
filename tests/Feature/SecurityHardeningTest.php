<?php

namespace Tests\Feature;

use App\Models\DocumentType;
use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_security_headers_are_present_and_csp_disallows_eval_in_non_local_env(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy');
        $response->assertHeader('Content-Security-Policy');

        $csp = (string) $response->headers->get('Content-Security-Policy');
        $this->assertStringNotContainsString("'unsafe-eval'", $csp);
        $this->assertStringContainsString("object-src 'none'", $csp);
    }

    public function test_contact_form_is_rate_limited(): void
    {
        $payload = [
            'name' => 'Security Tester',
            'email' => 'security@example.com',
            'subject' => 'Load',
            'message' => 'Testing throttling.',
        ];

        for ($i = 0; $i < 10; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => '10.10.10.10'])
                ->post(route('contact.store'), $payload)
                ->assertRedirect();
        }

        $this->withServerVariables(['REMOTE_ADDR' => '10.10.10.10'])
            ->post(route('contact.store'), $payload)
            ->assertStatus(429);
    }

    public function test_document_access_blocks_path_traversal_but_allows_valid_private_files(): void
    {
        Role::firstOrCreate(['name' => Role::VENDOR], ['display_name' => 'Vendor']);

        $user = User::factory()->create();
        $user->assignRole(Role::VENDOR);

        $vendor = Vendor::factory()->create([
            'user_id' => $user->id,
            'contact_email' => $user->email,
        ]);

        $type = DocumentType::create([
            'name' => 'tax_certificate',
            'display_name' => 'Tax Certificate',
            'is_mandatory' => true,
            'is_active' => true,
        ]);

        // Create a file outside the private root to emulate traversal target.
        File::ensureDirectoryExists(storage_path('app'));
        File::put(storage_path('app/leak.txt'), 'sensitive');

        $traversalDoc = VendorDocument::create([
            'vendor_id' => $vendor->id,
            'document_type_id' => $type->id,
            'file_name' => 'leak.txt',
            'file_path' => '../leak.txt',
            'file_hash' => hash('sha256', 'leak'),
            'file_size' => 9,
            'mime_type' => 'text/plain',
            'version' => 1,
            'is_current' => true,
            'verification_status' => VendorDocument::STATUS_PENDING,
        ]);

        $this->actingAs($user)
            ->get(route('documents.download', $traversalDoc))
            ->assertStatus(404);

        File::ensureDirectoryExists(storage_path('app/private/vendor-documents'));
        File::put(storage_path('app/private/vendor-documents/safe.txt'), 'safe');

        $safeDoc = VendorDocument::create([
            'vendor_id' => $vendor->id,
            'document_type_id' => $type->id,
            'file_name' => 'safe.txt',
            'file_path' => 'vendor-documents/safe.txt',
            'file_hash' => hash('sha256', 'safe'),
            'file_size' => 4,
            'mime_type' => 'text/plain',
            'version' => 1,
            'is_current' => true,
            'verification_status' => VendorDocument::STATUS_PENDING,
        ]);

        $this->actingAs($user)
            ->get(route('documents.download', $safeDoc))
            ->assertOk();
    }
}
