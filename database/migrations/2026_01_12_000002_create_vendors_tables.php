<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Vendors table - core vendor profile
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Company Information
            $table->string('company_name');
            $table->string('registration_number')->nullable();
            $table->string('tax_id')->nullable(); // GST/VAT number
            $table->string('pan_number')->nullable();
            $table->string('business_type')->nullable(); // sole_proprietor, partnership, pvt_ltd, etc.

            // Contact Information
            $table->string('contact_person');
            $table->string('contact_email');
            $table->string('contact_phone');
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->default('India');
            $table->string('pincode')->nullable();

            // Bank Details
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_ifsc')->nullable();
            $table->string('bank_branch')->nullable();

            // Status & Compliance
            $table->enum('status', [
                'draft',
                'submitted',
                'under_review',
                'approved',
                'active',
                'suspended',
                'terminated',
                'rejected',
            ])->default('draft');

            $table->enum('compliance_status', [
                'pending',
                'compliant',
                'at_risk',
                'non_compliant',
                'blocked',
            ])->default('pending');

            $table->integer('compliance_score')->default(0);
            $table->integer('performance_score')->default(0);

            // Internal Notes (not visible to vendor)
            $table->text('internal_notes')->nullable();

            // Timestamps
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamp('terminated_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('status');
            $table->index('compliance_status');
            $table->index('company_name');
        });

        // Vendor State Logs - immutable transition history
        Schema::create('vendor_state_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained(); // Who made the change
            $table->string('from_status');
            $table->string('to_status');
            $table->text('comment')->nullable(); // Required for rejections
            $table->json('metadata')->nullable(); // Additional context
            $table->timestamps();

            $table->index(['vendor_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_state_logs');
        Schema::dropIfExists('vendors');
    }
};
