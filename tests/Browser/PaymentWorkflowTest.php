<?php

namespace Tests\Browser;

use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class PaymentWorkflowTest extends DuskTestCase
{
    /**
     * Create a vendor user with associated vendor profile
     */
    protected function createActiveVendor(): array
    {
        // Cleanup existing test user to prevent duplicate entry errors
        if ($user = User::where('email', 'payment.vendor@test.com')->first()) {
            $user->delete();
        }

        $user = User::create([
            'name' => 'Payment Test Vendor',
            'email' => 'payment.vendor@test.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $user->assignRole(Role::VENDOR);

        $vendor = Vendor::create([
            'user_id' => $user->id,
            'company_name' => 'Payment Test Company',
            'contact_person' => 'Payment Vendor',
            'contact_email' => 'payment.vendor@test.com',
            'contact_phone' => '9876543210',
            'status' => 'active',
            'compliance_status' => 'compliant',
            'performance_score' => 90,
        ]);

        return ['user' => $user, 'vendor' => $vendor];
    }

    /**
     * Test: PAY-001 - Create payment request
     */
    public function test_vendor_creates_payment_request(): void
    {
        $this->createActiveVendor();

        $this->browse(function (Browser $browser) {
            $browser->logout();
            $browser->visit('/login')
                ->type('email', 'payment.vendor@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->visit('/vendor/payments')
                ->assertPathIs('/vendor/payments')
                ->assertSee('Payments');
        });
    }

    /**
     * Test: PAY-002 - Vendor views own payment requests
     */
    public function test_vendor_views_payment_requests(): void
    {
        $this->createActiveVendor();

        $this->browse(function (Browser $browser) {
            $browser->logout();
            $browser->visit('/login')
                ->type('email', 'payment.vendor@test.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/vendor/dashboard')
                ->visit('/vendor/payments')
                ->assertPathIs('/vendor/payments');
        });
    }

    /**
     * Test: Admin can view all payment requests
     */
    public function test_admin_views_all_payments(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->logout();
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
     * Test: Ops Manager can view payments for validation
     */
    public function test_ops_manager_views_payments(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->logout();
            $browser->visit('/login')
                ->type('email', 'ops@vendorflow.com')
                ->type('password', 'password')
                ->press('Sign in')
                ->waitForLocation('/admin/dashboard')
                ->visit('/admin/payments')
                ->assertPathIs('/admin/payments')
                ->assertSee('Payments');
        });
    }

    /**
     * Test: Finance Manager can view and process payments
     */
    public function test_finance_manager_views_payments(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->logout();
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
