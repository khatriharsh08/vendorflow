<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use InvalidArgumentException;

class SystemMasterDataService
{
    /**
     * @var array<string, mixed>
     */
    protected array $baseline;

    /**
     * @param  array<string, mixed>|null  $baseline
     */
    public function __construct(?array $baseline = null)
    {
        $this->baseline = $baseline ?? require database_path('data/system_master_data.php');
    }

    /**
     * Sync full baseline data.
     */
    public function sync(bool $includeDefaultStaffUsers = true): void
    {
        DB::transaction(function () use ($includeDefaultStaffUsers): void {
            $this->syncRolesAndPermissions();
            $this->syncVendorStates();
            $this->syncDocumentTypes();
            $this->syncComplianceRules();
            $this->syncPerformanceMetrics();

            if ($includeDefaultStaffUsers) {
                $this->syncDefaultStaffUsers();
            }
        });
    }

    /**
     * Sync all core master data except default staff users.
     */
    public function syncCoreData(): void
    {
        $this->sync(false);
    }

    /**
     * Sync roles, permissions, and role-permission mapping.
     */
    public function syncRolesAndPermissions(): void
    {
        foreach ($this->data('roles') as $role) {
            $this->updateOrCreateByName('roles', [
                'name' => $role['name'],
                'display_name' => $role['display_name'],
                'description' => $role['description'] ?? null,
            ]);
        }

        foreach ($this->data('permissions') as $permission) {
            $this->updateOrCreateByName('permissions', [
                'name' => $permission['name'],
                'display_name' => $permission['display_name'],
                'group' => $permission['group'] ?? null,
            ]);
        }

        $roleIds = DB::table('roles')->pluck('id', 'name');
        $permissionIds = DB::table('permissions')->pluck('id', 'name');
        $rolePermissions = (array) $this->data('role_permissions');

        $managedRoleIds = [];
        $pivotRows = [];

        foreach ($rolePermissions as $roleName => $permissions) {
            $roleId = $roleIds[$roleName] ?? null;
            if (! $roleId) {
                continue;
            }

            $managedRoleIds[] = (int) $roleId;

            foreach ((array) $permissions as $permissionName) {
                $permissionId = $permissionIds[$permissionName] ?? null;
                if (! $permissionId) {
                    continue;
                }

                $pivotRows[] = [
                    'role_id' => (int) $roleId,
                    'permission_id' => (int) $permissionId,
                ];
            }
        }

        if ($managedRoleIds !== []) {
            DB::table('permission_role')->whereIn('role_id', $managedRoleIds)->delete();
        }

        if ($pivotRows !== []) {
            DB::table('permission_role')->insertOrIgnore($pivotRows);
        }
    }

    /**
     * Sync vendor state master data.
     */
    public function syncVendorStates(): void
    {
        foreach ($this->data('vendor_states') as $state) {
            $this->updateOrCreateByName('vendor_states', [
                'name' => $state['name'],
                'display_name' => $state['display_name'],
                'is_terminal' => (bool) ($state['is_terminal'] ?? false),
                'sort_order' => (int) ($state['sort_order'] ?? 0),
            ]);
        }
    }

    /**
     * Sync document type master data.
     */
    public function syncDocumentTypes(): void
    {
        foreach ($this->data('document_types') as $docType) {
            $this->updateOrCreateByName('document_types', [
                'name' => $docType['name'],
                'display_name' => $docType['display_name'],
                'description' => $docType['description'] ?? null,
                'is_mandatory' => (bool) ($docType['is_mandatory'] ?? false),
                'has_expiry' => (bool) ($docType['has_expiry'] ?? false),
                'expiry_warning_days' => (int) ($docType['expiry_warning_days'] ?? 30),
                'allowed_extensions' => json_encode($docType['allowed_extensions'] ?? ['pdf']),
                'max_file_size_mb' => (int) ($docType['max_file_size_mb'] ?? 10),
                'is_active' => (bool) ($docType['is_active'] ?? true),
            ]);
        }
    }

    /**
     * Sync compliance rule master data.
     */
    public function syncComplianceRules(): void
    {
        foreach ($this->data('compliance_rules') as $rule) {
            $this->updateOrCreateByName('compliance_rules', [
                'name' => $rule['name'],
                'description' => $rule['description'],
                'type' => $rule['type'],
                'conditions' => json_encode($rule['conditions'] ?? []),
                'severity' => $rule['severity'] ?? 'medium',
                'penalty_points' => (int) ($rule['penalty_points'] ?? 0),
                'blocks_payment' => (bool) ($rule['blocks_payment'] ?? false),
                'blocks_activation' => (bool) ($rule['blocks_activation'] ?? false),
                'is_active' => (bool) ($rule['is_active'] ?? true),
            ]);
        }
    }

    /**
     * Sync performance metrics master data.
     */
    public function syncPerformanceMetrics(): void
    {
        foreach ($this->data('performance_metrics') as $metric) {
            $this->updateOrCreateByName('performance_metrics', [
                'name' => $metric['name'],
                'display_name' => $metric['display_name'],
                'description' => $metric['description'] ?? null,
                'weight' => $metric['weight'] ?? 1.0,
                'max_score' => (int) ($metric['max_score'] ?? 10),
                'is_active' => (bool) ($metric['is_active'] ?? true),
            ]);
        }
    }

    /**
     * Sync default staff users and assign core staff roles.
     */
    public function syncDefaultStaffUsers(): void
    {
        $roleIds = DB::table('roles')->pluck('id', 'name');
        $defaultPassword = (string) (env('DEFAULT_STAFF_PASSWORD') ?: 'password');

        foreach ($this->data('default_staff_users') as $staffUser) {
            $roleId = $roleIds[$staffUser['role']] ?? null;
            if (! $roleId) {
                continue;
            }

            $existingUser = DB::table('users')
                ->where('email', $staffUser['email'])
                ->first(['id']);

            if ($existingUser) {
                $userId = (int) $existingUser->id;
                DB::table('users')
                    ->where('id', $userId)
                    ->update([
                        'name' => $staffUser['name'],
                        'email_verified_at' => now(),
                        'updated_at' => now(),
                    ]);
            } else {
                $userId = (int) DB::table('users')->insertGetId([
                    'name' => $staffUser['name'],
                    'email' => $staffUser['email'],
                    'password' => Hash::make($defaultPassword),
                    'email_verified_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('role_user')->insertOrIgnore([
                'user_id' => $userId,
                'role_id' => (int) $roleId,
            ]);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function data(string $key): array
    {
        $value = $this->baseline[$key] ?? [];

        return is_array($value) ? $value : [];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function updateOrCreateByName(string $table, array $payload): int
    {
        $name = (string) ($payload['name'] ?? '');
        if ($name === '') {
            throw new InvalidArgumentException("Missing 'name' for {$table} sync.");
        }

        unset($payload['name']);
        $now = now();

        $existingId = DB::table($table)->where('name', $name)->value('id');
        if ($existingId) {
            DB::table($table)
                ->where('id', (int) $existingId)
                ->update(array_merge($payload, ['updated_at' => $now]));

            return (int) $existingId;
        }

        return (int) DB::table($table)->insertGetId(array_merge(
            ['name' => $name],
            $payload,
            ['created_at' => $now, 'updated_at' => $now]
        ));
    }
}
