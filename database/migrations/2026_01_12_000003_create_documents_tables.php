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
        // Document Types - configurable
        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // company_registration, tax_certificate, insurance, nda, contract
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->boolean('is_mandatory')->default(false);
            $table->boolean('has_expiry')->default(false);
            $table->integer('expiry_warning_days')->default(30); // Days before expiry to warn
            $table->json('allowed_extensions')->nullable(); // ['pdf', 'jpg', 'png']
            $table->integer('max_file_size_mb')->default(10);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Vendor Documents
        Schema::create('vendor_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->onDelete('cascade');
            $table->foreignId('document_type_id')->constrained()->onDelete('restrict');
            
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_hash'); // SHA256 for integrity check
            $table->integer('file_size'); // in bytes
            $table->string('mime_type');
            
            $table->integer('version')->default(1);
            $table->boolean('is_current')->default(true);
            
            $table->enum('verification_status', [
                'pending',
                'verified',
                'rejected',
                'expired'
            ])->default('pending');
            
            $table->date('expiry_date')->nullable();
            $table->text('verification_notes')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamp('verified_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes(); // Never hard delete documents
            
            $table->index(['vendor_id', 'document_type_id', 'is_current']);
            $table->index('expiry_date');
            $table->index('verification_status');
        });

        // Document Versions - for audit trail
        Schema::create('document_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_document_id')->constrained()->onDelete('cascade');
            $table->integer('version');
            $table->string('file_path');
            $table->string('file_hash');
            $table->foreignId('uploaded_by')->constrained('users');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['vendor_document_id', 'version']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_versions');
        Schema::dropIfExists('vendor_documents');
        Schema::dropIfExists('document_types');
    }
};
