<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Remote control for the RAVU mobile app: version rules, maintenance mode,
     * support details, in-app announcements and feature switches. The app reads
     * them from GET /api/mobile/config.
     */
    public function up(): void
    {
        Schema::create('mobile_app_settings', function (Blueprint $table) {
            $table->id();
            $table->json('data');
            $table->unsignedInteger('revision')->default(1);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('mobile_announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title', 80);
            $table->string('body', 280);
            $table->string('tone', 20)->default('info');
            $table->string('audience', 20)->default('all');
            $table->string('cta_label', 30)->nullable();
            $table->string('cta_url', 500)->nullable();
            $table->string('min_app_version', 20)->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('dismissible')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['is_active', 'starts_at', 'ends_at']);
        });

        Schema::create('mobile_features', function (Blueprint $table) {
            $table->id();
            $table->string('key', 50)->unique();
            $table->string('name', 80);
            $table->string('description', 280)->nullable();
            $table->boolean('enabled')->default(false);
            $table->string('platforms', 20)->default('all');
            $table->string('min_app_version', 20)->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mobile_features');
        Schema::dropIfExists('mobile_announcements');
        Schema::dropIfExists('mobile_app_settings');
    }
};
