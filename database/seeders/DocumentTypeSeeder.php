<?php

namespace Database\Seeders;

use App\Services\SystemMasterDataService;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Default document type definitions.
     */
    public static function defaults(): array
    {
        $baseline = require database_path('data/system_master_data.php');

        return (array) ($baseline['document_types'] ?? []);
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(SystemMasterDataService::class)->syncDocumentTypes();

        if ($this->command) {
            $this->command->info('Document types seeded successfully!');
        }
    }
}
