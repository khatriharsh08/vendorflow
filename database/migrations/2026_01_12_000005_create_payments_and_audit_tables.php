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
        // Payment Requests
        Schema::create('payment_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->foreignId('requested_by')->constrained('users');

            $table->string('reference_number')->unique();
            $table->string('invoice_number')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('INR');
            $table->text('description');

            $table->enum('status', [
                'requested',
                'pending_ops',
                'pending_finance',
                'approved',
                'paid',
                'rejected',
                'cancelled',
            ])->default('requested');

            $table->text('rejection_reason')->nullable();
            $table->boolean('is_duplicate_flagged')->default(false);
            $table->boolean('is_compliance_blocked')->default(false);

            // Payment Details
            $table->date('due_date')->nullable();
            $table->date('paid_date')->nullable();
            $table->string('payment_reference')->nullable();
            $table->string('payment_method')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('reference_number');
            $table->index(['vendor_id', 'status']);
        });

        // Payment Approvals - multi-stage approval chain
        Schema::create('payment_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained();

            $table->enum('stage', ['ops_validation', 'finance_approval']);
            $table->enum('action', ['approved', 'rejected', 'pending'])->default('pending');
            $table->text('comment')->nullable();

            $table->timestamps();

            $table->index(['payment_request_id', 'stage']);
        });

        // Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        // Audit Logs - comprehensive activity trail
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained();

            $table->string('auditable_type'); // Model class
            $table->unsignedBigInteger('auditable_id');
            $table->string('event'); // created, updated, deleted, state_changed, approved, rejected

            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('reason')->nullable();

            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();

            $table->timestamps();

            $table->index(['auditable_type', 'auditable_id']);
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('payment_approvals');
        Schema::dropIfExists('payment_requests');
    }
};
