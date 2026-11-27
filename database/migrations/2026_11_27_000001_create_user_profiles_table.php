<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Website-only account details, kept apart from the users table so the website can
 * sign in against the RAVU app's own users table without changing its columns.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('position', 120)->nullable();
            $table->string('preferred_communication', 20)->nullable();
            $table->timestamp('terms_accepted_at')->nullable();
            $table->timestamp('privacy_accepted_at')->nullable();
            $table->string('terms_version', 30)->nullable();
            $table->string('privacy_version', 30)->nullable();
            $table->string('google_id')->nullable()->unique();
            $table->string('avatar', 2048)->nullable();
            $table->boolean('password_change_required')->default(false);
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_provider', 20)->nullable();
            $table->string('last_login_ip', 45)->nullable();
            $table->timestamps();
        });

        // Link to the partner record a registration creates in the RAVU app.
        Schema::table('partners', function (Blueprint $table) {
            $table->unsignedBigInteger('app_partner_id')->nullable()->unique();
            $table->string('address')->nullable();
            $table->string('phone', 50)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->dropUnique(['app_partner_id']);
            $table->dropColumn(['app_partner_id', 'address', 'phone', 'latitude', 'longitude']);
        });
        Schema::dropIfExists('user_profiles');
    }
};
