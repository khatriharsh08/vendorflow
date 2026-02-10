<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
    ];

    // Role constants
    const SUPER_ADMIN = 'super_admin';

    const OPS_MANAGER = 'ops_manager';

    const FINANCE_MANAGER = 'finance_manager';

    const VENDOR = 'vendor';

    /**
     * Get all permissions for this role.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class);
    }

    /**
     * Get all users with this role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    /**
     * Check if role has a permission.
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions()->where('name', $permission)->exists();
    }
}
