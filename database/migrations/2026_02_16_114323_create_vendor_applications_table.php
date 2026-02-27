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
        Schema::create('vendor_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Track progress
            $table->integer('current_step')->default(1);

            // Store consolidated draft data
            $table->json('data')->nullable(); // Stores step1, step2, step3 data structure

            $table->enum('status', ['draft', 'submitted', 'abandoned'])->default('draft');

            $table->timestamps();

            // Ensure one draft per user
            $table->unique(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_applications');
    }
};
