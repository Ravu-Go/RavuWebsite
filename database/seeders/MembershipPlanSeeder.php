<?php

namespace Database\Seeders;

use App\Models\MembershipPlan;
use Illuminate\Database\Seeder;

/**
 * Placeholder plans so the admin portal, app and revenue page have something
 * to work with. Flagged as samples; only seeded when there are no plans yet.
 */
class MembershipPlanSeeder extends Seeder
{
    public function run(): void
    {
        if (MembershipPlan::query()->exists()) {
            $this->command?->info('Membership plans already exist; sample plans not added.');

            return;
        }

        $plans = [
            [
                'slug' => 'rider-basic', 'name' => 'Rider Basic', 'interval' => 'month', 'price' => 10000,
                'tagline' => 'The essentials for every rider.',
                'benefits' => ['RAVU member ID card', 'Discounts at partner workshops', 'Member support line'],
            ],
            [
                'slug' => 'rider-plus', 'name' => 'Rider Plus', 'interval' => 'month', 'price' => 25000, 'is_featured' => true, 'trial_days' => 7,
                'tagline' => 'More protection and bigger savings.',
                'benefits' => ['Everything in Rider Basic', 'Preferred insurance rates (20%+ target discount)', 'Spare-parts discounts', 'Priority claims support'],
            ],
            [
                'slug' => 'rider-plus-annual', 'name' => 'Rider Plus (Annual)', 'interval' => 'year', 'price' => 250000,
                'tagline' => 'Rider Plus, paid yearly: two months free.',
                'benefits' => ['Everything in Rider Plus', 'Two months free versus monthly', 'Personal accident cover'],
            ],
            [
                'slug' => 'fleet', 'name' => 'Fleet', 'interval' => 'month', 'price' => 120000,
                'tagline' => 'For owners managing several bikes.',
                'benefits' => ['Up to 10 riders on one plan', 'Fleet dashboard', 'Dedicated account manager', 'Bulk insurance and maintenance rates'],
            ],
        ];

        foreach ($plans as $i => $plan) {
            MembershipPlan::create([
                ...$plan,
                'currency' => 'TZS',
                'status' => 'active',
                'is_sample' => true,
                'sort_order' => $i + 1,
                'published_at' => now(),
            ]);
        }

        $this->command?->info('Added 4 sample membership plans. Replace them with the real plans before launch.');
    }
}
