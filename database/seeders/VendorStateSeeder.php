<?php

namespace Database\Seeders;

use App\Services\SystemMasterDataService;
use Illuminate\Database\Seeder;

class VendorStateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(SystemMasterDataService::class)->syncVendorStates();
    }
}
