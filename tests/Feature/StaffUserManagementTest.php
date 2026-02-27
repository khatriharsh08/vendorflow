<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_view_staff_management_page(): void
    {
        Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Admin']);

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole(Role::SUPER_ADMIN);

        $response = $this->actingAs($superAdmin)->get(route('admin.staff-users.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('Admin/Staff/Index')
                ->has('availableRoles')
        );
    }

    public function test_super_admin_can_create_staff_user(): void
    {
        Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Admin']);
        Role::firstOrCreate(['name' => Role::OPS_MANAGER], ['display_name' => 'Ops Manager']);

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole(Role::SUPER_ADMIN);

        $response = $this->actingAs($superAdmin)->post(route('admin.staff-users.store'), [
            'name' => 'Ops One',
            'email' => 'ops.one@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => Role::OPS_MANAGER,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'ops.one@example.com',
            'name' => 'Ops One',
        ]);

        $createdUserId = User::where('email', 'ops.one@example.com')->value('id');
        $opsRoleId = Role::where('name', Role::OPS_MANAGER)->value('id');

        $this->assertDatabaseHas('role_user', [
            'user_id' => $createdUserId,
            'role_id' => $opsRoleId,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'event' => AuditLog::EVENT_CREATED,
            'auditable_type' => User::class,
            'auditable_id' => $createdUserId,
        ]);
    }

    public function test_non_super_admin_cannot_access_staff_management_page(): void
    {
        Role::firstOrCreate(['name' => Role::OPS_MANAGER], ['display_name' => 'Ops Manager']);

        $opsUser = User::factory()->create();
        $opsUser->assignRole(Role::OPS_MANAGER);

        $response = $this->actingAs($opsUser)->get(route('admin.staff-users.index'));

        $response->assertForbidden();
    }
}
