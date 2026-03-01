<?php

namespace Database\Seeders;

use App\Services\SystemMasterDataService;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $service = app(SystemMasterDataService::class);
        $service->syncRolesAndPermissions();
        $service->syncDefaultStaffUsers();

        if ($this->command) {
            $this->command->info('Roles, permissions, and default users created successfully!');
            $this->command->info('Default admin login: admin@vendorflow.com / '.(env('DEFAULT_STAFF_PASSWORD') ?: 'password'));
        }
    }
}
