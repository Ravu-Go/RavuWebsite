<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\MembershipPlan;
use App\Models\User;
use App\Services\Membership\MembershipRevenueService;
use Database\Seeders\MembershipPlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MembershipPlanTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'super_admin', 'email_verified_at' => now()]);
    }

    private function draft(User $admin, array $overrides = []): MembershipPlan
    {
        $this->actingAs($admin)->post('/super-admin/plans', [
            'name' => 'Rider Gold', 'slug' => 'rider-gold', 'tagline' => 'Top tier', 'interval' => 'month',
            'price' => 40000, 'trial_days' => 0, 'is_featured' => false, 'benefits' => ['Free towing', ' ', 'Priority claims'],
            ...$overrides,
        ])->assertSessionHasNoErrors();

        return MembershipPlan::firstWhere('slug', $overrides['slug'] ?? 'rider-gold');
    }

    private function catalogue(): array
    {
        return collect($this->getJson('/api/mobile/plans')->assertOk()->json('plans'))->keyBy('id')->all();
    }

    public function test_sample_plans_are_seeded_once(): void
    {
        $this->seed(MembershipPlanSeeder::class);
        $this->seed(MembershipPlanSeeder::class);

        $this->assertSame(4, MembershipPlan::count());
        $this->assertTrue(MembershipPlan::where('status', 'active')->where('is_sample', true)->count() === 4);
        $this->assertSame(['rider-basic', 'rider-plus', 'rider-plus-annual', 'fleet'], array_keys($this->catalogue()));
    }

    public function test_a_draft_stays_private_until_published(): void
    {
        $admin = $this->admin();
        $plan = $this->draft($admin);

        $this->assertSame('draft', $plan->status);
        $this->assertSame(['Free towing', 'Priority claims'], $plan->benefits);
        $this->assertArrayNotHasKey('rider-gold', $this->catalogue());

        // While a draft, the ID and price can still be edited directly.
        $this->actingAs($admin)->put("/super-admin/plans/{$plan->id}", [...$plan->only(['name', 'tagline', 'interval', 'trial_days', 'is_featured', 'benefits']), 'slug' => 'gold', 'price' => 45000])
            ->assertSessionHasNoErrors();
        $this->actingAs($admin)->post("/super-admin/plans/{$plan->id}/publish")->assertSessionHasNoErrors();

        $gold = $this->catalogue()['gold'];
        $this->assertSame(45000, $gold['price']);
        $this->assertTrue($gold['available_for_signup']);
    }

    public function test_published_plans_change_price_only_through_a_recorded_price_change(): void
    {
        $admin = $this->admin();
        $plan = $this->draft($admin);
        $this->actingAs($admin)->post("/super-admin/plans/{$plan->id}/publish");

        // A normal edit cannot change the ID or price of a live plan.
        $this->actingAs($admin)->put("/super-admin/plans/{$plan->id}", [...$plan->only(['name', 'tagline', 'interval', 'trial_days', 'is_featured', 'benefits']), 'slug' => 'renamed', 'price' => 1])
            ->assertSessionHasNoErrors();
        $this->assertSame(['rider-gold', 40000], [$plan->fresh()->slug, $plan->fresh()->price]);

        $this->actingAs($admin)->post("/super-admin/plans/{$plan->id}/price", ['price' => 50000, 'existing_members' => 'next_renewal', 'notice_days' => 30, 'reason' => 'Insurance costs rose'])
            ->assertSessionHasNoErrors();

        $gold = $this->catalogue()['rider-gold'];
        $this->assertSame(50000, $gold['price']);
        $this->assertSame(40000, $gold['existing_members_change']['previous_price']);
        $this->assertSame(now()->addDays(30)->toDateString(), substr($gold['existing_members_change']['effective_at'], 0, 10));

        $this->actingAs($admin)->post("/super-admin/plans/{$plan->id}/price", ['price' => 30000, 'existing_members' => 'keep'])->assertSessionHasNoErrors();
        $this->assertNull($this->catalogue()['rider-gold']['existing_members_change']);
        $this->assertSame(2, $plan->prices()->count());

        $log = ActivityLog::where('action', 'plan_price_changed')->orderBy('id')->first();
        // assertEquals: MySQL's JSON type reorders object keys, so compare values, not key order.
        $this->assertEquals(['name' => 'Rider Gold', 'from' => 40000, 'to' => 50000], array_intersect_key($log->details, array_flip(['name', 'from', 'to'])));
    }

    public function test_retiring_keeps_the_plan_for_existing_members_and_published_plans_cannot_be_deleted(): void
    {
        $admin = $this->admin();
        $this->seed(MembershipPlanSeeder::class);
        $fleet = MembershipPlan::firstWhere('slug', 'fleet');

        $this->actingAs($admin)->delete("/super-admin/plans/{$fleet->id}")->assertStatus(422);
        $this->actingAs($admin)->post("/super-admin/plans/{$fleet->id}/retire")->assertSessionHasNoErrors();

        $listed = $this->catalogue()['fleet'];
        $this->assertSame('retired', $listed['status']);
        $this->assertFalse($listed['available_for_signup']);

        $this->actingAs($admin)->post("/super-admin/plans/{$fleet->id}/reactivate")->assertSessionHasNoErrors();
        $this->assertTrue($this->catalogue()['fleet']['available_for_signup']);

        $draft = $this->draft($admin);
        $this->actingAs($admin)->delete("/super-admin/plans/{$draft->id}")->assertSessionHasNoErrors();
        $this->assertModelMissing($draft);
    }

    public function test_the_last_active_plan_cannot_be_retired(): void
    {
        $admin = $this->admin();
        $plan = $this->draft($admin);
        $this->actingAs($admin)->post("/super-admin/plans/{$plan->id}/publish");

        $this->actingAs($admin)->post("/super-admin/plans/{$plan->id}/retire")->assertSessionHasErrors('plan');
    }

    public function test_plans_can_be_reordered(): void
    {
        $admin = $this->admin();
        $this->seed(MembershipPlanSeeder::class);
        $fleet = MembershipPlan::firstWhere('slug', 'fleet');

        $this->actingAs($admin)->post("/super-admin/plans/{$fleet->id}/move", ['direction' => 'up']);

        $this->assertSame(['rider-basic', 'rider-plus', 'fleet', 'rider-plus-annual'], array_keys($this->catalogue()));
    }

    public function test_revenue_uses_the_plan_catalogue(): void
    {
        $this->seed(MembershipPlanSeeder::class);
        MembershipPlan::firstWhere('slug', 'fleet')->update(['name' => 'Fleet Pro']);

        $names = collect(app(MembershipRevenueService::class)->build('12m')['by_plan'])->pluck('name')->all();

        $this->assertContains('Fleet Pro', $names);
    }

    public function test_only_super_admins_manage_plans_and_the_feed_supports_etags(): void
    {
        $partner = User::factory()->create(['role' => 'partner', 'email_verified_at' => now()]);
        $this->actingAs($partner)->post('/super-admin/plans', ['name' => 'x'])->assertForbidden();

        $admin = $this->admin();
        $this->actingAs($admin)->get('/super-admin?section=plans')
            ->assertInertia(fn (Assert $page) => $page->where('plans.endpoint', url('/api/mobile/plans'))->where('plans.default_notice_days', 30));

        $etag = $this->getJson('/api/mobile/plans')->headers->get('ETag');
        $this->withHeaders(['If-None-Match' => $etag])->get('/api/mobile/plans')->assertStatus(304);
    }
}
