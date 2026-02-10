<?php

namespace Tests\Browser;

use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class EndToEndTest extends DuskTestCase
{
    /**
     * Test: E2E-001 - Complete Vendor Registration to Dashboard Flow
     */
    public function test_complete_vendor_registration_flow(): void
    {
        $this->browse(function (Browser $browser) {
            // Step 1: Register new vendor
            $browser->visit('/register')
                ->type('name', 'E2E Test Vendor')
                ->type('email', 'e2e.vendor@test.com')
                ->type('password', 'password123')
                ->type('password_confirmation', 'password123')
                ->press('Register')
                ->waitForLocation('/vendor/onboarding')
                ->assertPathIs('/vendor/onboarding');
        });
    }

    /**
     * Test: Complete Admin workflow - View Dashboard and Navigate
     */
    public function test_complete_admin_workflow(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'admin@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->assertPathIs('/admin/dashboard');

            // Navigate through all sections
            $browser->visit('/admin/vendors')
                ->assertPathIs('/admin/vendors')
                ->visit('/admin/documents')
                ->assertPathIs('/admin/documents')
                ->visit('/admin/compliance')
                ->assertPathIs('/admin/compliance')
                ->visit('/admin/performance')
                ->assertPathIs('/admin/performance')
                ->visit('/admin/payments')
                ->assertPathIs('/admin/payments')
                ->visit('/admin/reports')
                ->assertPathIs('/admin/reports');
        });
    }

    /**
     * Test: Vendor Full Navigation Flow
     */
    public function test_vendor_full_navigation_flow(): void
    {
        // Create vendor user
        $user = User::create([
            'name' => 'E2E Active Vendor',
            'email' => 'e2e.active@test.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $user->assignRole(Role::VENDOR);

        Vendor::create([
            'user_id' => $user->id,
            'company_name' => 'E2E Test Company',
            'contact_person' => 'E2E Vendor',
            'contact_email' => 'e2e.active@test.com',
            'contact_phone' => '9876543210',
            'status' => 'active',
            'compliance_status' => 'compliant',
            'performance_score' => 85,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                ->type('email', 'e2e.active@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->assertPathIs('/vendor/dashboard');

            // Navigate through vendor sections
            $browser->visit('/vendor/profile')
                ->assertPathIs('/vendor/profile')
                ->visit('/vendor/documents')
                ->assertPathIs('/vendor/documents')
                ->visit('/vendor/compliance')
                ->assertPathIs('/vendor/compliance')
                ->visit('/vendor/performance')
                ->assertPathIs('/vendor/performance')
                ->visit('/vendor/payments')
                ->assertPathIs('/vendor/payments')
                ->visit('/vendor/notifications')
                ->assertPathIs('/vendor/notifications');
        });
    }

    /**
     * Test: Public Pages Accessibility
     */
    public function test_public_pages_accessibility(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/')
                ->assertSee('VendorFlow');

            $browser->visit('/about')
                ->assertPathIs('/about')
                ->assertSee('About');

            $browser->visit('/contact')
                ->assertPathIs('/contact')
                ->assertSee('Contact');

            $browser->visit('/privacy')
                ->assertPathIs('/privacy')
                ->assertSee('Privacy');

            $browser->visit('/terms')
                ->assertPathIs('/terms')
                ->assertSee('Terms');
        });
    }

    /**
     * Test: Error Handling - 404 for non-existent pages
     */
    public function test_fallback_route_handling(): void
    {
        $this->browse(function (Browser $browser) {
            // Guest accessing random page should redirect to home
            $browser->visit('/random-nonexistent-page')
                ->pause(1000)
                ->assertPathIs('/');
        });
    }
}
