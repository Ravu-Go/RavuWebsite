<?php

namespace App\Console\Commands;

use App\Contracts\MembershipRevenueSource;
use App\Models\Partner;
use App\Models\PartnerApplication;
use App\Models\PartnerApplicationStatusHistory;
use App\Models\PartnerCategory;
use App\Models\PartnerLocation;
use App\Models\PartnerPayout;
use App\Models\PartnerRedemption;
use App\Models\ProposedPartnerBenefit;
use App\Models\User;
use App\Services\Members\DemoMemberDirectory;
use Carbon\CarbonImmutable;
use Database\Seeders\PartnerCategorySeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Sample partner activity for designing and reviewing the partner portal and the
 * Super Admin partner reports before the mobile app produces real redemptions.
 *
 *   php artisan partners:demo            create demo partners + regenerate demo redemptions
 *   php artisan partners:demo --purge    remove every demo partner, redemption and payout
 *
 * Redemptions are generated for every approved partner with an approved offer (demo
 * partners and real ones), always flagged is_demo so they can be purged. The output is
 * deterministic for a given day: the same members, visits and amounts every run.
 */
class PartnerDemoData extends Command
{
    protected $signature = 'partners:demo {--months=18 : How many months of history to generate} {--purge : Remove all demo data and stop} {--login : Also create a demo partner login to view the portal with sample data} {--force : Allow running in production}';

    /** Sign-in for the demo partner portal (created with --login, removed with --purge). */
    public const DEMO_LOGIN = 'demo.partner@ravu.test';

    protected $description = 'Create sample partners and member redemptions (dummy data) for the partner portal and Super Admin reports';

    /** Visit popularity, bill range (TZS) and branch names per category. */
    private const PROFILES = [
        'fuel-stations' => ['weight' => 5.0, 'bill' => [8_000, 60_000]],
        'motorcycle-workshops' => ['weight' => 4.0, 'bill' => [10_000, 150_000]],
        'spare-parts-dealers' => ['weight' => 3.0, 'bill' => [15_000, 300_000]],
        'vehicle-workshops' => ['weight' => 2.0, 'bill' => [40_000, 900_000]],
        'insurance-providers' => ['weight' => 0.6, 'bill' => [150_000, 1_200_000]],
        'healthcare-providers' => ['weight' => 1.0, 'bill' => [15_000, 250_000]],
    ];

    private const DEMO_PARTNERS = [
        ['Kariakoo Boda Service Centre', 'motorcycle-workshops', 15, 'Ilala', 'Kariakoo', 'Engine servicing, brakes and electrical repairs for boda boda and Bajaj', ['Msimbazi branch', 'Ilala', 'Msimbazi']],
        ['Mbezi Motor Garage', 'vehicle-workshops', 12, 'Ubungo', 'Mbezi', 'Servicing, diagnostics and suspension work for private cars and fleets', null],
        ['Ubungo Spare Parts Hub', 'spare-parts-dealers', 18, 'Ubungo', 'Ubungo', 'Genuine motorcycle, Bajaj and car spare parts', null],
        ['Mwenge Tyre & Battery Centre', 'spare-parts-dealers', 10, 'Kinondoni', 'Mwenge', 'Tyres, batteries, lubricants and filters', null],
        ['Tegeta Fuel Point', 'fuel-stations', 3, 'Kinondoni', 'Tegeta', 'Petrol and diesel for members', ['Bunju branch', 'Kinondoni', 'Bunju']],
        ['Temeke Bajaj Garage', 'motorcycle-workshops', 15, 'Temeke', 'Chang\'ombe', 'Bajaj and motorcycle repairs', null],
        ['Salama Cover Insurance Desk', 'insurance-providers', 20, 'Ilala', 'Posta', 'Motorcycle, Bajaj and private vehicle insurance premiums', null],
        ['Sinza Family Clinic', 'healthcare-providers', 10, 'Ubungo', 'Sinza', 'Consultation and laboratory services for members and their families', null],
    ];

    private const HOURS = [7 => 4, 8 => 9, 9 => 10, 10 => 8, 11 => 6, 12 => 6, 13 => 7, 14 => 6, 15 => 6, 16 => 8, 17 => 10, 18 => 9, 19 => 6, 20 => 3];

    public function handle(): int
    {
        if (app()->isProduction() && ! $this->option('force')) {
            $this->error('Refusing to create demo data in production. Pass --force if you really mean it.');

            return self::FAILURE;
        }

        $removed = $this->purge();
        if ($this->option('purge')) {
            $this->info("Removed {$removed['redemptions']} demo redemptions, {$removed['payouts']} demo payouts, {$removed['partners']} demo partners and {$removed['logins']} demo login.");

            return self::SUCCESS;
        }

        if (! PartnerCategory::exists()) {
            $this->call('db:seed', ['--class' => PartnerCategorySeeder::class, '--force' => true]);
        }
        $this->createDemoPartners();

        $partners = Partner::query()->where('status', 'active')
            ->whereHas('application', fn ($q) => $q->where('status', 'approved'))
            ->with(['category', 'locations'])->get()
            ->map(fn (Partner $p) => ['partner' => $p, 'benefit' => $p->activeBenefit()])
            ->filter(function ($row) {
                if (! $row['benefit']) {
                    $this->warn("Skipping {$row['partner']->registered_name}: no approved member offer.");
                }

                return (bool) $row['benefit'];
            })->values();

        $members = array_values((new DemoMemberDirectory(app(MembershipRevenueSource::class)))->all());
        if ($partners->isEmpty() || $members === []) {
            $this->warn('Nothing to generate: no approved partners with an offer, or no members.');

            return self::SUCCESS;
        }

        $count = $this->generate($partners->all(), $members, max(1, min(36, (int) $this->option('months'))));

        $this->table(['Partner', 'Category', 'Demo partner', 'Redemptions'], $partners->map(fn ($row) => [
            $row['partner']->trading_name ?: $row['partner']->registered_name,
            $row['partner']->category?->name,
            $row['partner']->is_demo ? 'yes' : 'no (real partner, demo visits)',
            PartnerRedemption::where('partner_id', $row['partner']->id)->where('is_demo', true)->count(),
        ])->all());
        $this->info("Generated {$count} demo redemptions for ".count($members).' demo members.');

        if ($this->option('login')) {
            $this->createDemoLogin();
        }

        return self::SUCCESS;
    }

    private function purge(): array
    {
        return DB::transaction(fn () => [
            'redemptions' => PartnerRedemption::where('is_demo', true)->delete(),
            'payouts' => PartnerPayout::where('is_demo', true)->delete(),
            'partners' => Partner::where('is_demo', true)->get()->each->delete()->count(),
            'logins' => User::where('email', self::DEMO_LOGIN)->delete(),
        ]);
    }

    /** A partner-portal account on the first demo partner, so the sample data can be viewed. */
    private function createDemoLogin(): void
    {
        $partner = Partner::where('is_demo', true)->orderBy('id')->first();
        $password = Str::password(14, symbols: false);
        $user = User::forceCreate([
            'name' => 'Demo Partner',
            'email' => self::DEMO_LOGIN,
            'password' => $password,
            'role' => 'partner',
            'position' => 'Owner (demo)',
            'email_verified_at' => now(),
        ]);
        $partner->users()->attach($user, ['role' => 'owner']);

        $this->newLine();
        $this->info('Demo partner login (local only, recreated on every run):');
        $this->line('  Partner:  '.$partner->trading_name);
        $this->line('  Email:    '.self::DEMO_LOGIN);
        $this->line('  Password: '.$password);
        $this->line('  Sign in at '.rtrim((string) config('app.url'), '/').'/login');
    }

    private function createDemoPartners(): void
    {
        foreach (self::DEMO_PARTNERS as $i => [$name, $categorySlug, $percent, $district, $ward, $offer, $branch]) {
            $category = PartnerCategory::where('slug', $categorySlug)->first();
            $approvedAt = CarbonImmutable::now()->subMonths(20)->addDays($i * 9);

            DB::transaction(function () use ($i, $name, $category, $percent, $district, $ward, $offer, $branch, $approvedAt) {
                $partner = Partner::forceCreate([
                    'registered_name' => "{$name} Ltd",
                    'trading_name' => $name,
                    'registration_number' => sprintf('DEMO-%03d', $i + 1),
                    'tin_number' => sprintf('900-%03d-%03d', $i + 1, ($i * 37) % 1000),
                    'partner_category_id' => $category?->id,
                    'business_description' => "Sample partner for previewing RAVU reports. {$offer}.",
                    'year_established' => 2010 + $i,
                    'status' => 'active',
                    'is_demo' => true,
                    'created_at' => $approvedAt->subDays(14),
                    'updated_at' => $approvedAt,
                ]);
                $application = PartnerApplication::forceCreate([
                    'partner_id' => $partner->id, 'status' => 'approved', 'version' => 1, 'resubmission_allowed' => false,
                    'submitted_at' => $approvedAt->subDays(5), 'approved_at' => $approvedAt,
                    'created_at' => $approvedAt->subDays(14), 'updated_at' => $approvedAt,
                ]);
                foreach ([['draft', 'submitted', -5], ['submitted', 'approved', 0]] as [$from, $to, $days]) {
                    PartnerApplicationStatusHistory::forceCreate([
                        'partner_application_id' => $application->id, 'previous_status' => $from, 'new_status' => $to,
                        'comment' => 'Demo data', 'created_at' => $approvedAt->addDays($days), 'updated_at' => $approvedAt->addDays($days),
                    ]);
                }
                $location = PartnerLocation::forceCreate([
                    'partner_id' => $partner->id, 'name' => 'Main location', 'country' => 'Tanzania', 'region' => 'Dar es Salaam',
                    'district' => $district, 'ward' => $ward, 'physical_address' => "{$ward}, {$district}, Dar es Salaam",
                    'is_primary' => true, 'status' => 'active',
                ]);
                if ($branch) {
                    PartnerLocation::forceCreate([
                        'partner_id' => $partner->id, 'name' => $branch[0], 'country' => 'Tanzania', 'region' => 'Dar es Salaam',
                        'district' => $branch[1], 'ward' => $branch[2], 'physical_address' => "{$branch[2]}, {$branch[1]}, Dar es Salaam",
                        'is_primary' => false, 'status' => 'active',
                    ]);
                }
                ProposedPartnerBenefit::forceCreate([
                    'partner_id' => $partner->id, 'partner_application_id' => $application->id, 'partner_location_id' => $location->id,
                    'name' => "{$percent}% off for RAVU members", 'description' => $offer, 'benefit_type' => 'percentage_discount',
                    'discount_percentage' => $percent, 'currency' => 'TZS', 'products_or_services' => $offer,
                    'status' => 'approved', 'approved_at' => $approvedAt,
                ]);
            });
        }
    }

    /**
     * Simulate visits day by day: each active member visits a partner about 1.6 times a
     * month, mostly at two or three "regular" partners, during business hours.
     */
    private function generate(array $partners, array $members, int $months): int
    {
        mt_srand(424242);
        $now = CarbonImmutable::now();
        $start = $now->startOfMonth()->subMonths($months - 1);
        $weights = array_map(fn ($row) => $this->profile($row['partner'])['weight'], $partners);

        // Each member's regular partners.
        $favourites = [];
        foreach ($members as $m => $member) {
            $favourites[$m] = array_unique([$this->weighted($weights), $this->weighted($weights), $this->weighted($weights)]);
        }

        $batch = [];
        $count = 0;
        $sequence = 0;
        $stamp = $now->toDateTimeString();
        for ($day = $start; $day <= $now; $day = $day->addDay()) {
            $dayFactor = match ($day->dayOfWeekIso) { 7 => 0.5, 6 => 1.1, default => 1.0 };
            foreach ($members as $m => $member) {
                if ($member['started_at'] > $day->endOfDay()->toIso8601String()
                    || ($member['cancelled_at'] && $member['cancelled_at'] < $day->toIso8601String())
                    || $member['status'] === 'suspended'
                    || mt_rand() / mt_getrandmax() > 1.6 / 30 * $dayFactor) {
                    continue;
                }

                $p = mt_rand(1, 100) <= 80 ? $favourites[$m][array_rand($favourites[$m])] : $this->weighted($weights);
                ['partner' => $partner, 'benefit' => $benefit] = $partners[$p];
                $at = $day->setTime($this->weighted(self::HOURS), mt_rand(0, 59), mt_rand(0, 59));
                if ($at > $now) {
                    continue;
                }

                [$low, $high] = $this->profile($partner)['bill'];
                $bill = (int) (round(exp(log($low) + (log($high) - log($low)) * (mt_rand() / mt_getrandmax()) ** 1.6) / 500) * 500);
                $discount = $benefit->benefit_type === 'fixed_discount'
                    ? min($bill, (int) $benefit->discount_amount)
                    : (int) round($bill * (float) ($benefit->discount_percentage ?? 0) / 100);
                $locations = $partner->locations;
                $location = $locations->count() > 1 && mt_rand(1, 100) > 70 ? $locations->firstWhere('is_primary', false) : ($locations->firstWhere('is_primary', true) ?? $locations->first());

                $batch[] = [
                    'partner_id' => $partner->id,
                    'partner_location_id' => $location?->id,
                    'proposed_partner_benefit_id' => $benefit->id,
                    'recorded_by' => null,
                    'receipt_no' => sprintf('DM-%s-%05s', $at->format('ym'), strtoupper(base_convert((string) ++$sequence, 10, 36))),
                    'member_ref' => $member['member_ref'],
                    'member_name' => PartnerRedemption::shortName($member['name']),
                    'member_plan_id' => $member['plan_id'],
                    'member_plan_name' => $member['plan_name'],
                    'vehicle_category' => $member['vehicle_category'],
                    'bill_amount' => $bill,
                    'discount_amount' => $discount,
                    'paid_amount' => $bill - $discount,
                    'currency' => 'TZS',
                    'status' => mt_rand(1, 200) === 1 ? 'voided' : 'completed',
                    'void_reason' => null,
                    'is_demo' => true,
                    'redeemed_at' => $at->toDateTimeString(),
                    'created_at' => $stamp,
                    'updated_at' => $stamp,
                ];
                if (count($batch) >= 500) {
                    DB::table('partner_redemptions')->insert($batch);
                    $count += count($batch);
                    $batch = [];
                }
            }
        }
        if ($batch) {
            DB::table('partner_redemptions')->insert($batch);
            $count += count($batch);
        }
        DB::table('partner_redemptions')->where('is_demo', true)->where('status', 'voided')->update(['void_reason' => 'Entered twice by mistake (demo)']);

        return $count;
    }

    private function profile(Partner $partner): array
    {
        return self::PROFILES[$partner->category?->slug] ?? ['weight' => 1.5, 'bill' => [10_000, 200_000]];
    }

    /** Key of $weights picked with probability proportional to its weight. */
    private function weighted(array $weights): int
    {
        $total = array_sum($weights);
        $roll = mt_rand() / mt_getrandmax() * $total;
        foreach ($weights as $key => $weight) {
            $roll -= $weight;
            if ($roll <= 0) {
                return $key;
            }
        }

        return array_key_last($weights);
    }
}
