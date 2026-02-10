<?php

namespace Tests\Browser;

use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class VendorDashboardTest extends DuskTestCase
{
    /**
     * Create a vendor user with associated vendor profile
     */
    protected function createVendorUser(): User
    {
        $user = User::create([
            'name' => 'Test Vendor',
            'email' => 'testvendor@test.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $user->assignRole(Role::VENDOR);

        Vendor::create([
            'user_id' => $user->id,
            'company_name' => 'Test Company Ltd',
            'contact_person' => 'Test Vendor',
            'contact_email' => 'testvendor@test.com',
            'contact_phone' => '9876543210',
            'status' => 'active',
            'compliance_status' => 'compliant',
            'performance_score' => 85,
        ]);

        return $user;
    }

    /**
     * Test: Vendor Login and View Dashboard
     */
    public function test_vendor_login_and_view_dashboard(): void
    {
        $this->createVendorUser();

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'testvendor@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->assertPathIs('/vendor/dashboard')
                ->assertSee('Dashboard');
        });
    }

    /**
     * Test: Vendor Views Profile Page
     */
    public function test_vendor_views_profile(): void
    {
        $this->createVendorUser();

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'testvendor@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->visit('/vendor/profile')
                ->assertPathIs('/vendor/profile')
                ->assertSee('Test Company Ltd');
        });
    }

    /**
     * Test: Vendor Views Documents Page
     */
    public function test_vendor_views_documents(): void
    {
        $this->createVendorUser();

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'testvendor@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->visit('/vendor/documents')
                ->assertPathIs('/vendor/documents')
                ->assertSee('Documents');
        });
    }

    /**
     * Test: Vendor Views Compliance Page
     */
    public function test_vendor_views_compliance(): void
    {
        $this->createVendorUser();

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'testvendor@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->visit('/vendor/compliance')
                ->assertPathIs('/vendor/compliance')
                ->assertSee('Compliance');
        });
    }

    /**
     * Test: Vendor Views Payments Page
     */
    public function test_vendor_views_payments(): void
    {
        $this->createVendorUser();

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'testvendor@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->visit('/vendor/payments')
                ->assertPathIs('/vendor/payments')
                ->assertSee('Payments');
        });
    }

    /**
     * Test: Vendor Views Performance Page
     */
    public function test_vendor_views_performance(): void
    {
        $this->createVendorUser();

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'testvendor@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->visit('/vendor/performance')
                ->assertPathIs('/vendor/performance')
                ->assertSee('Performance');
        });
    }

    /**
     * Test: RBAC-001 - Vendor cannot access admin dashboard
     */
    public function test_vendor_cannot_access_admin_dashboard(): void
    {
        $this->createVendorUser();

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'testvendor@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->visit('/admin/dashboard')
                ->pause(1000)
                ->assertPathIsNot('/admin/dashboard');
        });
    }

    /**
     * Test: Vendor sees notifications
     */
    public function test_vendor_views_notifications(): void
    {
        $this->createVendorUser();

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'testvendor@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->visit('/vendor/notifications')
                ->assertPathIs('/vendor/notifications')
                ->assertSee('Notifications');
        });
    }
}
