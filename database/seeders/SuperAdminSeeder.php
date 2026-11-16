<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class SuperAdminSeeder extends Seeder
{
    /**
     * Seed the default RAVU Super Admin account.
     *
     * Credentials:
     *   Email:    jux@ravu.com
     *   Password: password
     */
    public function run(): void
    {
        $attributes = [
            'name' => 'Jux (Super Admin)',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ];

        if (Schema::hasTable('users') && Schema::hasColumn('users', 'role')) {
            $attributes['role'] = 'super_admin';
        }

        User::updateOrCreate(
            ['email' => 'jux@ravu.com'],
            $attributes
        );

        $this->command?->info('Super Admin seeded successfully: jux@ravu.com / password');
    }
}
