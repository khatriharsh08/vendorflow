<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $documentTypes = [
            [
                'name' => 'company_registration',
                'display_name' => 'Company Registration Certificate',
                'description' => 'Certificate of incorporation or business registration',
                'is_mandatory' => true,
                'has_expiry' => false,
                'allowed_extensions' => ['pdf', 'jpg', 'jpeg', 'png'],
            ],
            [
                'name' => 'gst_certificate',
                'display_name' => 'GST Registration Certificate',
                'description' => 'Goods and Services Tax registration certificate',
                'is_mandatory' => true,
                'has_expiry' => false,
                'allowed_extensions' => ['pdf', 'jpg', 'jpeg', 'png'],
            ],
            [
                'name' => 'pan_card',
                'display_name' => 'PAN Card',
                'description' => 'Permanent Account Number card',
                'is_mandatory' => true,
                'has_expiry' => false,
                'allowed_extensions' => ['pdf', 'jpg', 'jpeg', 'png'],
            ],
            [
                'name' => 'cancelled_cheque',
                'display_name' => 'Cancelled Cheque',
                'description' => 'Cancelled cheque for bank verification',
                'is_mandatory' => true,
                'has_expiry' => false,
                'allowed_extensions' => ['pdf', 'jpg', 'jpeg', 'png'],
            ],
            [
                'name' => 'insurance',
                'display_name' => 'Insurance Certificate',
                'description' => 'Business liability insurance certificate',
                'is_mandatory' => false,
                'has_expiry' => true,
                'expiry_warning_days' => 30,
                'allowed_extensions' => ['pdf'],
            ],
            [
                'name' => 'nda',
                'display_name' => 'Non-Disclosure Agreement',
                'description' => 'Signed NDA/Confidentiality agreement',
                'is_mandatory' => true,
                'has_expiry' => true,
                'expiry_warning_days' => 60,
                'allowed_extensions' => ['pdf'],
            ],
            [
                'name' => 'service_agreement',
                'display_name' => 'Service Agreement',
                'description' => 'Master service agreement or contract',
                'is_mandatory' => true,
                'has_expiry' => true,
                'expiry_warning_days' => 90,
                'allowed_extensions' => ['pdf'],
            ],
        ];

        foreach ($documentTypes as $docType) {
            DocumentType::create([
                'name' => $docType['name'],
                'display_name' => $docType['display_name'],
                'description' => $docType['description'] ?? null,
                'is_mandatory' => $docType['is_mandatory'] ?? false,
                'has_expiry' => $docType['has_expiry'] ?? false,
                'expiry_warning_days' => $docType['expiry_warning_days'] ?? 30,
                'allowed_extensions' => json_encode($docType['allowed_extensions'] ?? ['pdf']),
            ]);
        }

        $this->command->info('Document types seeded successfully!');
    }
}
