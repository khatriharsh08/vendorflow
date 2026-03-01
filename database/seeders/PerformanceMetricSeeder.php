<?php

namespace Database\Seeders;

use App\Services\SystemMasterDataService;
use Illuminate\Database\Seeder;

class PerformanceMetricSeeder extends Seeder
{
    public function run(): void
    {
        app(SystemMasterDataService::class)->syncPerformanceMetrics();
    }
}
