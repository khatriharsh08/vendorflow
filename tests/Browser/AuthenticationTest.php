<?php

namespace Tests\Browser;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class AuthenticationTest extends DuskTestCase
{
    /**
     * Test: AUTH-006 - Login with valid credentials (Super Admin)
     */
    public function test_login_with_valid_credentials_admin(): void
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
     * Test: Login as Ops Manager
     */
    public function test_login_with_valid_credentials_ops_manager(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'ops@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->assertPathIs('/admin/dashboard');
        });
    }

    /**
     * Test: Login as Finance Manager
     */
    public function test_login_with_valid_credentials_finance_manager(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'finance@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->assertPathIs('/admin/dashboard');
        });
    }

    /**
     * Test: AUTH-007 - Login with invalid password
     */
    public function test_login_with_invalid_password(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'admin@vendorflow.com')
                ->type('password', 'wrongpassword')
                ->press('Sign in')
                ->waitForText('credentials')
                ->assertSee('credentials');
        });
    }

    /**
     * Test: AUTH-008 - Login with non-existent email
     */
    public function test_login_with_non_existent_email(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'nonexistent@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForText('credentials')
                ->assertSee('credentials');
        });
    }

    /**
     * Test: AUTH-010 - Logout successfully
     */
    public function test_logout_successfully(): void
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
     * Test: AUTH-001 - Register with valid data (creates Vendor)
     */
    public function test_register_with_valid_data(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/register')
                ->type('name', 'Test Vendor User')
                ->type('email', 'newvendor@test.com')
                ->type('password', 'password123')
                ->type('password_confirmation', 'password123')
                ->press('Register')
                ->waitForLocation('/vendor/onboarding')
                ->assertPathIs('/vendor/onboarding');
        });
    }

    /**
     * Test: AUTH-002 - Register with existing email
     */
    public function test_register_with_existing_email(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/register')
                ->type('name', 'Duplicate User')
                ->type('email', 'admin@vendorflow.com')
                ->type('password', 'password123')
                ->type('password_confirmation', 'password123')
                ->press('Register')
                ->pause(1000)
                ->assertSee('email has already been taken');
        });
    }

    /**
     * Test: RBAC-007 - Guest cannot access protected routes
     */
    public function test_guest_cannot_access_dashboard(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/dashboard')
                ->waitForLocation('/login')
                ->assertPathIs('/login');
        });
    }
}
