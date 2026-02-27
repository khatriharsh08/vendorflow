<?php

namespace Tests\Feature;

use App\Models\JobLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SystemHealthPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_view_system_health_dashboard(): void
    {
        Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Admin']);

        $admin = User::factory()->create();
        $admin->assignRole(Role::SUPER_ADMIN);

        JobLog::create([
            'job_name' => 'vendors:evaluate-compliance',
            'status' => 'success',
            'started_at' => now()->subMinutes(10),
            'finished_at' => now()->subMinutes(9),
            'duration_ms' => 1500,
            'result' => ['processed' => 10],
        ]);

        JobLog::create([
            'job_name' => 'vendors:weekly-summary',
            'status' => 'failed',
            'started_at' => now()->subMinutes(8),
            'finished_at' => now()->subMinutes(7),
            'duration_ms' => 900,
            'error_message' => 'Test failure',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.system-health.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('Admin/SystemHealth/Index')
                ->where('stats.total', 2)
                ->where('stats.success', 1)
                ->where('stats.failed', 1)
                ->has('jobs.data', 2)
        );
    }

    public function test_vendor_cannot_access_system_health_dashboard(): void
    {
        Role::firstOrCreate(['name' => Role::VENDOR], ['display_name' => 'Vendor']);

        $vendorUser = User::factory()->create();
        $vendorUser->assignRole(Role::VENDOR);

        $response = $this->actingAs($vendorUser)->get(route('admin.system-health.index'));

        $response->assertForbidden();
    }
}
