<?php

namespace Tests\Browser;

use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class RoleBasedAccessTest extends DuskTestCase
{
    /**
     * Create a vendor user with associated vendor profile
     */
    protected function createVendorUser(): User
    {
        $user = User::create([
            'name' => 'Test Vendor RBAC',
            'email' => 'rbac.vendor@test.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $user->assignRole(Role::VENDOR);

        Vendor::create([
            'user_id' => $user->id,
            'company_name' => 'RBAC Test Company',
            'contact_person' => 'Test Vendor',
            'contact_email' => 'rbac.vendor@test.com',
            'contact_phone' => '9876543210',
            'status' => 'active',
            'compliance_status' => 'compliant',
            'performance_score' => 85,
        ]);

        return $user;
    }

    /**
     * Test: RBAC-001 - Vendor cannot access admin dashboard
     */
    public function test_vendor_cannot_access_admin_dashboard(): void
    {
        $this->createVendorUser();

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'rbac.vendor@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->visit('/admin/dashboard')
                ->pause(1000)
                ->assertPathIsNot('/admin/dashboard');
        });
    }

    /**
     * Test: RBAC-002 - Vendor cannot view other vendor data
     */
    public function test_vendor_cannot_access_other_vendor_data(): void
    {
        $this->createVendorUser();

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'rbac.vendor@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->visit('/admin/vendors')
                ->pause(1000)
                ->assertPathIsNot('/admin/vendors');
        });
    }

    /**
     * Test: RBAC-005 - Ops Manager cannot approve payments
     */
    public function test_ops_manager_cannot_approve_finance_payments(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'ops@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->visit('/admin/payments')
                ->assertPathIs('/admin/payments')
                // Ops can view payments but cannot see approve-finance button
                ->assertDontSee('Approve Finance');
        });
    }

    /**
     * Test: RBAC-008 - Vendor redirected to vendor dashboard
     */
    public function test_vendor_redirected_to_vendor_dashboard(): void
    {
        $this->createVendorUser();

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'rbac.vendor@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->assertPathIs('/vendor/dashboard');
        });
    }

    /**
     * Test: RBAC-009 - Admin redirected to admin dashboard
     */
    public function test_admin_redirected_to_admin_dashboard(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'admin@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->assertPathIs('/admin/dashboard');
        });
    }

    /**
     * Test: AUD-008 - Vendor cannot view audit logs
     */
    public function test_vendor_cannot_view_audit_logs(): void
    {
        $this->createVendorUser();

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'rbac.vendor@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->visit('/admin/audit')
                ->pause(1000)
                ->assertPathIsNot('/admin/audit');
        });
    }

    /**
     * Test: Finance Manager can access payment approval
     */
    public function test_finance_manager_accesses_payments(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'finance@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->visit('/admin/payments')
                ->assertPathIs('/admin/payments')
                ->assertSee('Payments');
        });
    }
}
