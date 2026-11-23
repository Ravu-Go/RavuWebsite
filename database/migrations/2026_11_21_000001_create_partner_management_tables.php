<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('document_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_category_id')->nullable()->constrained('partner_categories')->nullOnDelete();
            $table->string('document_type');
            $table->string('label');
            $table->text('description')->nullable();
            $table->boolean('is_required')->default(true);
            $table->boolean('requires_expiry_date')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['partner_category_id', 'is_active']);
        });

        Schema::create('partners', function (Blueprint $table) {
            $table->id();
            $table->string('registered_name')->nullable();
            $table->string('trading_name')->nullable();
            $table->string('registration_number')->nullable();
            $table->string('tin_number')->nullable();
            $table->foreignId('partner_category_id')->nullable()->constrained('partner_categories')->nullOnDelete();
            $table->text('business_description')->nullable();
            $table->unsignedSmallInteger('year_established')->nullable();
            $table->string('website')->nullable();
            $table->json('social_links')->nullable();
            $table->string('status', 30)->default('onboarding')->index();
            $table->timestamps();
            $table->index(['partner_category_id', 'status']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('position')->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('preferred_communication', 20)->nullable();
            $table->timestamp('terms_accepted_at')->nullable();
            $table->timestamp('privacy_accepted_at')->nullable();
            $table->string('terms_version', 30)->nullable();
            $table->string('privacy_version', 30)->nullable();
        });

        Schema::create('partner_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 30)->default('owner');
            $table->timestamps();
            $table->unique(['partner_id', 'user_id']);
            $table->index(['user_id', 'role']);
        });

        Schema::create('partner_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('status', 30)->default('draft')->index();
            $table->unsignedInteger('version')->default(1);
            $table->boolean('resubmission_allowed')->default(true);
            $table->json('submitted_snapshot')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'submitted_at']);
        });

        Schema::create('partner_application_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_application_id')->constrained(null, null, 'pash_application_fk')->cascadeOnDelete();
            $table->string('previous_status', 30)->nullable();
            $table->string('new_status', 30);
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->index(['partner_application_id', 'created_at'], 'pash_application_created_idx');
        });

        Schema::create('partner_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->cascadeOnDelete();
            $table->foreignId('partner_application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_requirement_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('replaces_document_id')->nullable()->constrained('partner_documents')->nullOnDelete();
            $table->string('document_type', 80);
            $table->string('original_filename');
            $table->string('storage_path');
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('file_size');
            $table->date('expires_at')->nullable();
            $table->string('status', 30)->default('pending_review')->index();
            $table->text('review_comments')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('superseded_at')->nullable();
            $table->timestamps();
            $table->index(['partner_id', 'document_type', 'status']);
        });

        Schema::create('partner_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->cascadeOnDelete();
            $table->string('name')->default('Main location');
            $table->string('country', 100)->default('Tanzania');
            $table->string('region', 120);
            $table->string('district', 120);
            $table->string('ward', 120)->nullable();
            $table->text('physical_address');
            $table->string('business_phone', 50)->nullable();
            $table->json('operating_hours')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->boolean('is_primary')->default(true);
            $table->string('status', 20)->default('active');
            $table->timestamps();
            $table->index(['partner_id', 'is_primary']);
            $table->index(['region', 'district']);
        });

        Schema::create('proposed_partner_benefits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->cascadeOnDelete();
            $table->foreignId('partner_application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('partner_location_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->text('description');
            $table->string('benefit_type', 40);
            $table->decimal('discount_percentage', 5, 2)->nullable();
            $table->decimal('discount_amount', 12, 2)->nullable();
            $table->string('currency', 3)->default('TZS');
            $table->text('products_or_services')->nullable();
            $table->date('starts_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->text('terms_and_conditions')->nullable();
            $table->text('redemption_instructions')->nullable();
            $table->string('status', 30)->default('pending_review')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('review_comments')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->index(['partner_id', 'status']);
        });

        Schema::create('partner_benefit_review_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposed_partner_benefit_id')->constrained(null, null, 'pb_review_benefit_fk')->cascadeOnDelete();
            $table->string('previous_status', 30)->nullable();
            $table->string('new_status', 30);
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('comment')->nullable();
            $table->timestamps();
        });

        Schema::create('partner_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 100);
            $table->string('subject_type', 100)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('details')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
            $table->index(['partner_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['notifiable_type', 'notifiable_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('partner_audit_logs');
        Schema::dropIfExists('partner_benefit_review_history');
        Schema::dropIfExists('proposed_partner_benefits');
        Schema::dropIfExists('partner_locations');
        Schema::dropIfExists('partner_documents');
        Schema::dropIfExists('partner_application_status_history');
        Schema::dropIfExists('partner_applications');
        Schema::dropIfExists('partner_user');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['position', 'phone', 'preferred_communication', 'terms_accepted_at', 'privacy_accepted_at', 'terms_version', 'privacy_version']);
        });
        Schema::dropIfExists('partners');
        Schema::dropIfExists('document_requirements');
        Schema::dropIfExists('partner_categories');
    }
};
