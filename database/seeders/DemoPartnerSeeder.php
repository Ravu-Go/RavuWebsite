<?php

namespace Database\Seeders;

use App\Console\Commands\PartnerDemoData;
use App\Models\Partner;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use RuntimeException;

/**
 * The demo partner-portal login for local development:
 *
 *   php artisan db:seed --class=DemoPartnerSeeder
 *
 *   jux@partner.com / password1234  →  "Kariakoo Boda Service Centre" (a demo partner)
 *
 * Generates the demo partners and sample redemptions first if they don't exist yet
 * (php artisan partners:demo); otherwise leaves the data alone and only (re)creates
 * the account, resetting its password. Local only (APP_ENV=local).
 */
class DemoPartnerSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->isLocal()) {
            $this->command?->warn('DemoPartnerSeeder only runs locally (APP_ENV=local). Skipped.');

            return;
        }

        if (! Partner::where('is_demo', true)->exists()) {
            $this->command?->info('No demo partners yet — generating demo data (php artisan partners:demo)…');
            Artisan::call('partners:demo');
        }

        $user = self::account(PartnerDemoData::DEMO_PASSWORD);

        $this->command?->info('Demo partner login ready:');
        $this->command?->table(['Email', 'Password', 'Partner'], [[$user->email, PartnerDemoData::DEMO_PASSWORD, $user->primaryPartner()?->trading_name]]);
    }

    /** Create or reset the demo login and attach it (as owner) to the first demo partner. */
    public static function account(string $password): User
    {
        $partner = Partner::where('is_demo', true)->orderBy('id')->first()
            ?? throw new RuntimeException('No demo partner exists. Run php artisan partners:demo first.');

        $user = User::firstOrNew(['email' => PartnerDemoData::DEMO_LOGIN]);
        $user->forceFill([
            'name' => 'Jux (demo partner)',
            'password' => $password,
            'role' => 'partner',
            'position' => 'Owner (demo)',
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();

        // Exactly one partner, the demo one, so the portal always opens on the sample data.
        $user->partners()->sync([$partner->id => ['role' => 'owner']]);

        return $user;
    }
}
