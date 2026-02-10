<?php

namespace Tests\Browser;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class AdminDashboardTest extends DuskTestCase
{
    /**
     * Test: RBAC-006 - Super Admin has full access
     */
    public function test_super_admin_accesses_dashboard(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'admin@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->assertPathIs('/admin/dashboard')
                ->assertSee('Dashboard');
        });
    }

    /**
     * Test: RBAC-003 - Ops Manager can access vendor list
     */
    public function test_ops_manager_accesses_vendor_list(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'ops@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->visit('/admin/vendors')
                ->assertPathIs('/admin/vendors')
                ->assertSee('Vendors');
        });
    }

    /**
     * Test: Admin views compliance dashboard
     */
    public function test_admin_views_compliance_dashboard(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'admin@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->visit('/admin/compliance')
                ->assertPathIs('/admin/compliance')
                ->assertSee('Compliance');
        });
    }

    /**
     * Test: Admin views performance dashboard
     */
    public function test_admin_views_performance_dashboard(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'admin@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->visit('/admin/performance')
                ->assertPathIs('/admin/performance')
                ->assertSee('Performance');
        });
    }

    /**
     * Test: Admin views payments
     */
    public function test_admin_views_payments(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'admin@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->visit('/admin/payments')
                ->assertPathIs('/admin/payments')
                ->assertSee('Payments');
        });
    }

    /**
     * Test: Admin views documents
     */
    public function test_admin_views_documents(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'admin@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->visit('/admin/documents')
                ->assertPathIs('/admin/documents')
                ->assertSee('Documents');
        });
    }

    /**
     * Test: Admin views audit logs
     */
    public function test_admin_views_audit_logs(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'admin@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->visit('/admin/audit')
                ->assertPathIs('/admin/audit')
                ->assertSee('Audit');
        });
    }

    /**
     * Test: Admin views reports
     */
    public function test_admin_views_reports(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'admin@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->visit('/admin/reports')
                ->assertPathIs('/admin/reports')
                ->assertSee('Reports');
        });
    }
}
