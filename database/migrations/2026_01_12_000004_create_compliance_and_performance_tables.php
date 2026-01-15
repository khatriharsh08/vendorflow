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
        // Compliance Rules - configurable
        Schema::create('compliance_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->enum('type', [
                'document_required',
                'document_expiry',
                'performance_threshold',
                'custom'
            ]);
            $table->json('conditions'); // JSON rules configuration
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->integer('penalty_points')->default(0); // Points deducted from compliance score
            $table->boolean('blocks_payment')->default(false);
            $table->boolean('blocks_activation')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Compliance Results - per vendor evaluation
        Schema::create('compliance_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->foreignId('compliance_rule_id')->constrained()->onDelete('cascade');
            
            $table->enum('status', ['pass', 'fail', 'warning'])->default('warning');
            $table->text('details')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestamp('evaluated_at');
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users');
            
            $table->timestamps();
            
            $table->index(['vendor_id', 'status']);
            $table->index('evaluated_at');
        });

        // Performance Metrics - scoring criteria
        Schema::create('performance_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // delivery_timeliness, issue_frequency, ops_rating, contract_adherence
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->decimal('weight', 5, 2)->default(1.00); // Weight in scoring
            $table->integer('max_score')->default(100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Performance Scores - immutable records
        Schema::create('performance_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->foreignId('performance_metric_id')->constrained()->onDelete('cascade');
            $table->foreignId('scored_by')->constrained('users');
            
            $table->integer('score'); // 0-100
            $table->text('notes')->nullable();
            $table->date('period_start');
            $table->date('period_end');
            
            $table->timestamps();
            // No update allowed after creation - immutable
            
            $table->index(['vendor_id', 'period_end']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performance_scores');
        Schema::dropIfExists('performance_metrics');
        Schema::dropIfExists('compliance_results');
        Schema::dropIfExists('compliance_rules');
    }
};
