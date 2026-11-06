<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class PartnerSeeder extends Seeder
{
    /**
     * Seed the default RAVU Partner account.
     *
     * Credentials:
     *   Email:    chid@total.com
     *   Password: password
     */
    public function run(): void
    {
        $attributes = [
            'name' => 'Chid (TotalEnergies Partner)',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ];

        if (Schema::hasTable('users') && Schema::hasColumn('users', 'role')) {
            $attributes['role'] = 'partner';
        }

        User::updateOrCreate(
            ['email' => 'chid@total.com'],
            $attributes
        );

        $this->command?->info('Partner seeded successfully: chid@total.com / password');
    }
}

