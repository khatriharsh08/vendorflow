<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('compliance_flags', function (Blueprint $table) {
            $table->foreignId('compliance_rule_id')
                ->nullable()
                ->after('vendor_id')
                ->constrained('compliance_rules')
                ->nullOnDelete();

            $table->index(['vendor_id', 'compliance_rule_id', 'status'], 'compliance_flags_vendor_rule_status_idx');
        });

        // Backfill from compliance_results for existing rows.
        // Uses SQL compatible with both SQLite (tests) and MySQL (runtime).
        DB::statement(
            'UPDATE compliance_flags
             SET compliance_rule_id = (
                 SELECT compliance_results.compliance_rule_id
                 FROM compliance_results
                 WHERE compliance_results.id = compliance_flags.compliance_result_id
             )
             WHERE compliance_rule_id IS NULL
               AND compliance_result_id IS NOT NULL'
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('compliance_flags', function (Blueprint $table) {
            $table->dropIndex('compliance_flags_vendor_rule_status_idx');
            $table->dropConstrainedForeignId('compliance_rule_id');
        });
    }
};
