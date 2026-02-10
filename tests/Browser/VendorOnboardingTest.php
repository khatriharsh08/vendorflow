<?php

namespace Tests\Browser;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class VendorOnboardingTest extends DuskTestCase
{
    /**
     * Test: VND-001 to VND-004 - Complete Vendor Onboarding Flow
     */
    public function test_complete_onboarding_flow(): void
    {
        $this->browse(function (Browser $browser) {
            // Register new vendor
            $browser->visit('/register')
                ->type('name', 'New Vendor Company')
                ->type('email', 'newvendor@onboarding.com')
                ->type('password', 'password123')
                ->type('password_confirmation', 'password123')
                ->press('Register')
                ->waitForLocation('/vendor/onboarding')
                ->assertPathIs('/vendor/onboarding');

            // Step 1: Basic Info
            $browser->type('company_name', 'New Vendor Company Ltd')
                ->type('registration_number', 'REG123456')
                ->type('tax_id', 'TAX123456')
                ->type('pan_number', 'ABCDE1234F')
                ->press('@next-step')
                ->pause(1000);

            // Step 2: Bank Details
            $browser->type('bank_name', 'Test Bank')
                ->type('account_number', '1234567890')
                ->type('ifsc_code', 'TEST0001234')
                ->type('branch_name', 'Main Branch')
                ->press('@next-step')
                ->pause(1000);

            // Step 3: Documents (skip actual file upload in test)
            // Just verify we can see the documents step
            $browser->assertSee('Documents');
        });
    }

    /**
     * Test: VND-005 - Step 1 validation - missing required fields
     */
    public function test_step1_validation_missing_fields(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/register')
                ->type('name', 'Validation Test Vendor')
                ->type('email', 'validation@test.com')
                ->type('password', 'password123')
                ->type('password_confirmation', 'password123')
                ->press('Register')
                ->waitForLocation('/vendor/onboarding')
                ->press('@next-step')
                ->pause(500)
                ->assertSee('required');
        });
    }

    /**
     * Test: Vendor can access onboarding page
     */
    public function test_vendor_can_access_onboarding(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/register')
                ->type('name', 'Access Test Vendor')
                ->type('email', 'access@test.com')
                ->type('password', 'password123')
                ->type('password_confirmation', 'password123')
                ->press('Register')
                ->waitForLocation('/vendor/onboarding')
                ->assertPathIs('/vendor/onboarding')
                ->assertSee('Onboarding');
        });
    }
}
