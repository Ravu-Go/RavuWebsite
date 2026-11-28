<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The membership plan catalogue. The admin portal owns it; the mobile app
     * reads it from GET /api/mobile/plans and the app's backend charges from it.
     */
    public function up(): void
    {
        Schema::create('membership_plans', function (Blueprint $table) {
            $table->id();
            // Stable identifier the app and subscriptions use; locked once a plan is published.
            $table->string('slug', 60)->unique();
            $table->string('name', 80);
            $table->string('tagline', 140)->nullable();
            $table->text('description')->nullable();
            $table->json('benefits')->nullable();
            $table->string('interval', 10)->default('month');
            $table->unsignedInteger('price');
            $table->string('currency', 3)->default('TZS');
            $table->unsignedSmallInteger('trial_days')->default(0);
            $table->unsignedInteger('member_limit')->nullable();
            $table->string('status', 10)->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_sample')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('retired_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['status', 'sort_order']);
        });

        Schema::create('membership_plan_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('membership_plan_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('price');
            $table->unsignedInteger('previous_price')->nullable();
            // "keep" = existing members stay on their price; "next_renewal" = they move after the notice period.
            $table->string('existing_members', 15)->default('next_renewal');
            $table->unsignedSmallInteger('notice_days')->default(0);
            $table->timestamp('existing_effective_at')->nullable();
            $table->string('reason', 280)->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_plan_prices');
        Schema::dropIfExists('membership_plans');
    }
};
