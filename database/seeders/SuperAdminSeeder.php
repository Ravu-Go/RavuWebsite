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

    /** Password every admin gets on a local machine (APP_ENV=local) only. */
    public const LOCAL_PASSWORD = 'password1234';

    /**
     * Seed the RAVU Super Admin accounts.
     *
     * Local development (APP_ENV=local): every admin, new or existing, gets the
     * password "password1234" with no forced change, so re-seeding always gives
     * a known way back in. Never applied in any other environment.
     *
     * New accounts get a random one-time password, printed once below, and must
     * choose their own password on first sign-in. Re-running the seeder never
     * touches the password of an account that already exists.
     *
     *   php artisan db:seed --class=SuperAdminSeeder
     */
    public function run(): void
    {
        if (app()->isLocal()) {
            $this->seedLocal();

            return;
        }

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

    private function seedLocal(): void
    {
        foreach (self::ADMINS as $admin) {
            $user = User::firstOrNew(['email' => $admin['email']]);
            $user->forceFill([
                'name' => $user->name ?: $admin['name'],
                'password' => self::LOCAL_PASSWORD,
                'role' => 'super_admin',
                'email_verified_at' => $user->email_verified_at ?? now(),
                'password_change_required' => false,
            ])->save();
        }

        $this->command?->info('Local super admins ready — password for every account: '.self::LOCAL_PASSWORD);
        $this->command?->table(['Email'], array_map(fn ($a) => [$a['email']], self::ADMINS));
    }
}
