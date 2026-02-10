<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Roles
        $superAdmin = Role::create([
            'name' => Role::SUPER_ADMIN,
            'display_name' => 'Super Admin',
            'description' => 'Full system access',
        ]);

        $opsManager = Role::create([
            'name' => Role::OPS_MANAGER,
            'display_name' => 'Operations Manager',
            'description' => 'Vendor onboarding and document verification',
        ]);

        $financeManager = Role::create([
            'name' => Role::FINANCE_MANAGER,
            'display_name' => 'Finance Manager',
            'description' => 'Payment approvals and financial history',
        ]);

        $vendor = Role::create([
            'name' => Role::VENDOR,
            'display_name' => 'Vendor',
            'description' => 'External vendor with limited access',
        ]);

        // Create Permissions
        $permissions = [
            // Vendor permissions
            ['name' => 'vendors.view', 'display_name' => 'View Vendors', 'group' => 'vendors'],
            ['name' => 'vendors.create', 'display_name' => 'Create Vendors', 'group' => 'vendors'],
            ['name' => 'vendors.update', 'display_name' => 'Update Vendors', 'group' => 'vendors'],
            ['name' => 'vendors.delete', 'display_name' => 'Delete Vendors', 'group' => 'vendors'],
            ['name' => 'vendors.approve', 'display_name' => 'Approve Vendors', 'group' => 'vendors'],
            ['name' => 'vendors.suspend', 'display_name' => 'Suspend Vendors', 'group' => 'vendors'],

            // Document permissions
            ['name' => 'documents.view', 'display_name' => 'View Documents', 'group' => 'documents'],
            ['name' => 'documents.upload', 'display_name' => 'Upload Documents', 'group' => 'documents'],
            ['name' => 'documents.verify', 'display_name' => 'Verify Documents', 'group' => 'documents'],
            ['name' => 'documents.reject', 'display_name' => 'Reject Documents', 'group' => 'documents'],

            // Payment permissions
            ['name' => 'payments.view', 'display_name' => 'View Payments', 'group' => 'payments'],
            ['name' => 'payments.request', 'display_name' => 'Request Payment', 'group' => 'payments'],
            ['name' => 'payments.approve', 'display_name' => 'Approve Payments', 'group' => 'payments'],
            ['name' => 'payments.reject', 'display_name' => 'Reject Payments', 'group' => 'payments'],

            // Compliance permissions
            ['name' => 'compliance.view', 'display_name' => 'View Compliance', 'group' => 'compliance'],
            ['name' => 'compliance.manage', 'display_name' => 'Manage Compliance Rules', 'group' => 'compliance'],

            // Reports permissions
            ['name' => 'reports.view', 'display_name' => 'View Reports', 'group' => 'reports'],
            ['name' => 'reports.export', 'display_name' => 'Export Reports', 'group' => 'reports'],

            // System permissions
            ['name' => 'users.manage', 'display_name' => 'Manage Users', 'group' => 'system'],
            ['name' => 'roles.manage', 'display_name' => 'Manage Roles', 'group' => 'system'],
            ['name' => 'audit.view', 'display_name' => 'View Audit Logs', 'group' => 'system'],
        ];

        foreach ($permissions as $permData) {
            Permission::create($permData);
        }

        // Assign permissions to Ops Manager
        $opsPermissions = Permission::whereIn('name', [
            'vendors.view', 'vendors.create', 'vendors.update', 'vendors.approve', 'vendors.suspend',
            'documents.view', 'documents.verify', 'documents.reject',
            'compliance.view',
            'reports.view',
        ])->get();
        $opsManager->permissions()->sync($opsPermissions);

        // Assign permissions to Finance Manager
        $financePermissions = Permission::whereIn('name', [
            'vendors.view',
            'documents.view',
            'payments.view', 'payments.approve', 'payments.reject',
            'compliance.view',
            'reports.view', 'reports.export',
        ])->get();
        $financeManager->permissions()->sync($financePermissions);

        // Assign permissions to Vendor (very limited)
        $vendorPermissions = Permission::whereIn('name', [
            'documents.upload',
            'payments.request', 'payments.view',
        ])->get();
        $vendor->permissions()->sync($vendorPermissions);

        // Create default Super Admin user
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@vendorflow.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole(Role::SUPER_ADMIN);

        // Create sample Ops Manager
        $ops = User::create([
            'name' => 'John Operations',
            'email' => 'ops@vendorflow.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $ops->assignRole(Role::OPS_MANAGER);

        // Create sample Finance Manager
        $finance = User::create([
            'name' => 'Jane Finance',
            'email' => 'finance@vendorflow.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $finance->assignRole(Role::FINANCE_MANAGER);

        $this->command->info('Roles, permissions, and default users created successfully!');
        $this->command->info('Admin login: admin@vendorflow.com / password');
    }
}
