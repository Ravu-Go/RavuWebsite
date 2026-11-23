<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    /**
     * Seed the explicitly configured RAVU Super Admin account.
     *
     * Configure SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD before seeding.
     */
    public function run(): void
    {
        $email = env('SUPER_ADMIN_EMAIL');
        $password = env('SUPER_ADMIN_PASSWORD');

        if (! $email || ! $password) {
            $this->command?->warn('Super admin was not seeded. Configure SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD.');

            return;
        }

        $user = User::updateOrCreate(['email' => strtolower($email)], [
            'name' => 'RAVU Administrator',
            'password' => $password,
            'role' => 'super_admin',
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();

        $this->command?->info('Super admin seeded successfully.');
    }
}
