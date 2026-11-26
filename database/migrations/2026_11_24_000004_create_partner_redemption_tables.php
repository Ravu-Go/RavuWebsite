<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Redemptions: every time a partner serves ("hudumia") a verified RAVU member and
     * applies the member discount. They drive partner performance reports, the Super
     * Admin leaderboard and the monthly payout pool split.
     */
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            // Sample partners created by `php artisan partners:demo`; removed with --purge.
            $table->boolean('is_demo')->default(false)->index();
        });

        Schema::create('partner_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->cascadeOnDelete();
            $table->foreignId('partner_location_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('proposed_partner_benefit_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('receipt_no', 24)->unique();
            // Member snapshot at the time of service (the member record lives in the app backend).
            $table->string('member_ref', 40);
            $table->string('member_name', 80);
            $table->string('member_plan_id', 60)->nullable();
            $table->string('member_plan_name', 80)->nullable();
            $table->string('vehicle_category', 40)->nullable();
            // Whole currency units (TZS). paid_amount = bill_amount - discount_amount.
            $table->unsignedBigInteger('bill_amount');
            $table->unsignedBigInteger('discount_amount');
            $table->unsignedBigInteger('paid_amount');
            $table->string('currency', 3)->default('TZS');
            $table->string('description', 160)->nullable();
            $table->string('invoice_ref', 60)->nullable();
            $table->string('status', 12)->default('completed');
            $table->timestamp('voided_at')->nullable();
            $table->foreignId('voided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('void_reason', 200)->nullable();
            $table->boolean('is_demo')->default(false)->index();
            $table->timestamp('redeemed_at');
            $table->timestamps();
            $table->index(['partner_id', 'redeemed_at']);
            $table->index(['status', 'redeemed_at']);
            $table->index('member_ref');
        });

        Schema::create('partner_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->cascadeOnDelete();
            $table->char('period', 7); // "2026-10"
            // Frozen at approval so later changes to the pool % or late voids don't move paid figures.
            $table->unsignedBigInteger('subscription_revenue');
            $table->decimal('pool_percent', 5, 2);
            $table->unsignedBigInteger('pool_amount');
            $table->unsignedInteger('members_served');
            $table->unsignedInteger('total_members_served');
            $table->unsignedInteger('visits');
            $table->decimal('share_percent', 7, 4);
            $table->unsignedBigInteger('amount');
            $table->string('currency', 3)->default('TZS');
            $table->string('status', 12)->default('approved'); // approved | paid
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('paid_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_reference', 80)->nullable();
            $table->boolean('is_demo')->default(false);
            $table->timestamps();
            $table->unique(['partner_id', 'period']);
            $table->index(['period', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_payouts');
        Schema::dropIfExists('partner_redemptions');
        Schema::table('partners', function (Blueprint $table) {
            $table->dropIndex(['is_demo']);
            $table->dropColumn('is_demo');
        });
    }
};
