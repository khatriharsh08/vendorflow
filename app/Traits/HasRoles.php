<?php

namespace App\Traits;

use App\Models\Permission;
use App\Models\Role;

trait HasRoles
{
    /**
     * Get all roles for this user.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    /**
     * Assign a role to the user.
     */
    public function assignRole(string $roleName): void
    {
        $role = Role::where('name', $roleName)->first();
        if ($role && ! $this->hasRole($roleName)) {
            $this->roles()->attach($role);
        }
    }

    /**
     * Remove a role from the user.
     */
    public function removeRole(string $roleName): void
    {
        $role = Role::where('name', $roleName)->first();
        if ($role) {
            $this->roles()->detach($role);
        }
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    /**
     * Check if user is super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole(Role::SUPER_ADMIN);
    }

    /**
     * Check if user is ops manager.
     */
    public function isOpsManager(): bool
    {
        return $this->hasRole(Role::OPS_MANAGER);
    }

    /**
     * Check if user is finance manager.
     */
    public function isFinanceManager(): bool
    {
        return $this->hasRole(Role::FINANCE_MANAGER);
    }

    /**
     * Check if user is a vendor.
     */
    public function isVendor(): bool
    {
        return $this->hasRole(Role::VENDOR);
    }

    /**
     * Check if user is staff (not a vendor).
     */
    public function isStaff(): bool
    {
        return $this->hasAnyRole([Role::SUPER_ADMIN, Role::OPS_MANAGER, Role::FINANCE_MANAGER]);
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        // Super admin has all permissions
        if ($this->isSuperAdmin()) {
            return true;
        }

        foreach ($this->roles as $role) {
            if ($role->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the user's primary role.
     */
    public function getPrimaryRole(): ?Role
    {
        return $this->roles()->first();
    }

    /**
     * Get role name for display.
     */
    public function getRoleDisplayName(): string
    {
        $role = $this->getPrimaryRole();

        return $role ? $role->display_name : 'No Role';
    }
}
