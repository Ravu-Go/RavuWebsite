<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Flag accounts issued a one-time password so they must choose their own on first sign-in.
     */
    public function up(): void
    {
        if (Schema::hasTable('users') && ! Schema::hasColumn('users', 'password_change_required')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('password_change_required')->default(false)->after('password');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'password_change_required')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('password_change_required');
            });
        }
    }
};
