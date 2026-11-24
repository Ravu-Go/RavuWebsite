<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SuperAdminSeeder extends Seeder
{
    /**
     * RAVU Super Admin accounts.
     *
     * @var array<int, array{name: string, email: string}>
     */
    private const ADMINS = [
        ['name' => 'James', 'email' => 'james@ravu.com'],
        ['name' => 'Lusinde', 'email' => 'lusinde@ravu.com'],
        ['name' => 'Nyindo', 'email' => 'nyindo@ravu.com'],
        ['name' => 'Evance', 'email' => 'evance@ravu.com'],
    ];

    /**
     * Seed the RAVU Super Admin accounts.
     *
     * New accounts get a random one-time password, printed once below, and must
     * choose their own password on first sign-in. Re-running the seeder never
     * touches the password of an account that already exists.
     *
     *   php artisan db:seed --class=SuperAdminSeeder
     */
    public function run(): void
    {
        $issued = [];

        foreach (self::ADMINS as $admin) {
            $user = User::firstWhere('email', $admin['email']);

            if ($user) {
                // Existing account: make sure it is a verified super admin, keep its credentials.
                $user->forceFill([
                    'role' => 'super_admin',
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ])->save();

                $issued[] = [$admin['email'], '(existing account, password unchanged)'];

                continue;
            }

            $password = Str::password(16, symbols: false);

            User::create([
                'name' => $admin['name'],
                'email' => $admin['email'],
                'password' => $password,
                'role' => 'super_admin',
            ])->forceFill([
                'email_verified_at' => now(),
                'password_change_required' => true,
            ])->save();

            $issued[] = [$admin['email'], $password];
        }

        $this->command?->info('Super admins seeded. Share each one-time password privately; it is shown only now.');
        $this->command?->table(['Email', 'One-time password'], $issued);
    }
}
