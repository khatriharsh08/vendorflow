<?php

namespace Tests\Feature;

use App\Models\DocumentType;
use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorDocument;
use App\Notifications\DocumentExpiryReminder;
use App\Notifications\ExpiredDocumentsAlert;
use App\Notifications\WeeklySummaryGenerated;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_expiry_reminder_command_sends_vendor_and_ops_notifications(): void
    {
        Carbon::setTestNow('2026-02-14 09:00:00');
        try {
            Notification::fake();

            Role::firstOrCreate(['name' => 'vendor'], ['display_name' => 'Vendor']);
            Role::firstOrCreate(['name' => 'ops_manager'], ['display_name' => 'Ops Manager']);

            $vendorUser = User::factory()->create();
            $vendorUser->roles()->attach(Role::where('name', 'vendor')->first());

            $opsUser = User::factory()->create();
            $opsUser->roles()->attach(Role::where('name', 'ops_manager')->first());

            $vendor = Vendor::create([
                'user_id' => $vendorUser->id,
                'company_name' => 'Expiry Vendor',
                'contact_person' => 'Owner',
                'contact_email' => $vendorUser->email,
                'contact_phone' => '9876543210',
                'status' => Vendor::STATUS_ACTIVE,
                'compliance_status' => Vendor::COMPLIANCE_COMPLIANT,
                'compliance_score' => 90,
                'pan_number' => 'ABCDE1234F',
                'address' => '123 St',
                'city' => 'City',
                'pincode' => '123456',
            ]);

            $documentType = DocumentType::create([
                'name' => 'insurance_certificate',
                'display_name' => 'Insurance Certificate',
                'is_mandatory' => true,
                'is_active' => true,
                'has_expiry' => true,
            ]);

            // Expiring soon (7 days): should trigger vendor reminder.
            VendorDocument::create([
                'vendor_id' => $vendor->id,
                'document_type_id' => $documentType->id,
                'file_name' => 'insurance.pdf',
                'file_path' => 'vendor-documents/insurance.pdf',
                'file_hash' => hash('sha256', 'insurance'),
                'file_size' => 12345,
                'mime_type' => 'application/pdf',
                'version' => 1,
                'is_current' => true,
                'verification_status' => 'verified',
                'expiry_date' => Carbon::today()->addDays(7),
            ]);

            // Already expired: should become expired + notify vendor + notify ops.
            $expiredDoc = VendorDocument::create([
                'vendor_id' => $vendor->id,
                'document_type_id' => $documentType->id,
                'file_name' => 'old-insurance.pdf',
                'file_path' => 'vendor-documents/old-insurance.pdf',
                'file_hash' => hash('sha256', 'old-insurance'),
                'file_size' => 12345,
                'mime_type' => 'application/pdf',
                'version' => 2,
                'is_current' => true,
                'verification_status' => 'verified',
                'expiry_date' => Carbon::today()->subDay(),
            ]);

            $this->artisan('vendors:expiry-reminders')->assertSuccessful();

            Notification::assertSentTo($vendorUser, DocumentExpiryReminder::class);
            Notification::assertSentTo($opsUser, ExpiredDocumentsAlert::class);

            $this->assertDatabaseHas('vendor_documents', [
                'id' => $expiredDoc->id,
                'verification_status' => 'expired',
            ]);
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_weekly_summary_command_notifies_ops_and_super_admin(): void
    {
        Notification::fake();

        Role::firstOrCreate(['name' => 'ops_manager'], ['display_name' => 'Ops Manager']);
        Role::firstOrCreate(['name' => 'super_admin'], ['display_name' => 'Super Admin']);

        $opsUser = User::factory()->create();
        $opsUser->roles()->attach(Role::where('name', 'ops_manager')->first());

        $superAdmin = User::factory()->create();
        $superAdmin->roles()->attach(Role::where('name', 'super_admin')->first());

        $this->artisan('vendors:weekly-summary')->assertSuccessful();

        Notification::assertSentTo($opsUser, WeeklySummaryGenerated::class);
        Notification::assertSentTo($superAdmin, WeeklySummaryGenerated::class);
    }
}
