<?php

namespace Tests\Feature;

use App\Contracts\MembershipRevenueSource;
use App\Models\Partner;
use App\Models\PartnerApplication;
use App\Models\PartnerLocation;
use App\Models\PartnerPayout;
use App\Models\PartnerRedemption;
use App\Models\ProposedPartnerBenefit;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PartnerRedemptionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-11-20 12:00:00');
        config(['membership.member_source' => 'demo', 'partner.payout_pool_percent' => 30]);
        $this->app->instance(MembershipRevenueSource::class, $this->fakeSource());
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    /** Four members; October subscription income is TSh 40,000 → a TSh 12,000 pool at 30%. */
    private function fakeSource(): MembershipRevenueSource
    {
        return new class implements MembershipRevenueSource
        {
            public function label(): string { return 'Test'; }

            public function isDemo(): bool { return true; }

            public function plans(): array
            {
                return [['id' => 'rider-basic', 'name' => 'Rider Basic', 'price' => 10000, 'interval' => 'month']];
            }

            public function subscriptions(CarbonInterface $since): array
            {
                $sub = fn ($n, $cancelled = null) => ['id' => "s{$n}", 'plan_id' => 'rider-basic', 'member_ref' => "RAVU-1000{$n}", 'member_phone' => null, 'started_at' => '2026-09-01T09:00:00+00:00', 'cancelled_at' => $cancelled];

                return [$sub(1), $sub(2), $sub(3, '2026-10-15T09:00:00+00:00'), $sub(4)];
            }

            public function payments(CarbonInterface $from, CarbonInterface $to): array
            {
                return array_values(array_filter(array_map(fn ($n) => [
                    'id' => "p{$n}", 'subscription_id' => "s{$n}", 'plan_id' => 'rider-basic', 'amount' => 10000,
                    'method' => 'M-Pesa', 'status' => 'paid', 'paid_at' => '2026-10-01T09:00:00+00:00',
                ], [1, 2, 3, 4]), fn ($p) => $p['paid_at'] >= $from->toIso8601String() && $p['paid_at'] <= $to->toIso8601String()));
            }
        };
    }

    private function partner(string $name, string $appStatus = 'approved', float $percent = 15): array
    {
        $user = User::factory()->create(['role' => 'partner', 'email_verified_at' => now()]);
        $partner = Partner::create(['registered_name' => $name, 'trading_name' => $name, 'status' => $appStatus === 'approved' ? 'active' : 'onboarding']);
        $partner->users()->attach($user, ['role' => 'owner']);
        $application = PartnerApplication::create(['partner_id' => $partner->id, 'status' => $appStatus, 'approved_at' => $appStatus === 'approved' ? now() : null]);
        $location = PartnerLocation::create(['partner_id' => $partner->id, 'region' => 'Dar es Salaam', 'district' => 'Ilala', 'physical_address' => 'Kariakoo', 'is_primary' => true]);
        ProposedPartnerBenefit::create([
            'partner_id' => $partner->id, 'partner_application_id' => $application->id, 'partner_location_id' => $location->id,
            'name' => "{$percent}% off", 'description' => 'Member discount', 'benefit_type' => 'percentage_discount',
            'discount_percentage' => $percent, 'status' => $appStatus === 'approved' ? 'approved' : 'pending_review', 'approved_at' => now(),
        ]);

        return [$user, $partner];
    }

    private function visit(Partner $partner, string $member, string $at, int $bill = 10000): PartnerRedemption
    {
        return $partner->redemptions()->create([
            'receipt_no' => PartnerRedemption::newReceiptNumber(), 'member_ref' => $member, 'member_name' => 'Test M.',
            'bill_amount' => $bill, 'discount_amount' => (int) ($bill * 0.15), 'paid_amount' => $bill - (int) ($bill * 0.15),
            'status' => 'completed', 'redeemed_at' => $at,
        ]);
    }

    public function test_cashier_verifies_member_records_visit_and_can_void_it(): void
    {
        [$user, $partner] = $this->partner('Kariakoo Garage');

        $this->actingAs($user)->postJson('/partner/members/verify', ['query' => 'ravu-10001'])
            ->assertOk()
            ->assertJsonPath('eligible', true)
            ->assertJsonPath('member.member_ref', 'RAVU-10001')
            ->assertJsonPath('member.plan_name', 'Rider Basic')
            ->assertJsonPath('offer.label', '15% off')
            ->assertJsonMissingPath('member.phone_digits');

        $this->postJson('/partner/members/verify', ['query' => 'ravu:member:RAVU-10003'])
            ->assertOk()->assertJsonPath('eligible', false)->assertJsonPath('reason', 'expired');
        $this->postJson('/partner/members/verify', ['query' => 'RAVU-99999'])
            ->assertOk()->assertJsonPath('reason', 'not_found');

        $receipt = $this->postJson('/partner/redemptions', ['member_ref' => 'RAVU-10001', 'bill_amount' => 20000, 'description' => 'Brake pads'])
            ->assertCreated()
            ->assertJsonPath('redemption.discount', 3000)
            ->assertJsonPath('redemption.paid', 17000)
            ->json('redemption.receipt_no');

        // Double tap: same member, same bill, moments later.
        $this->postJson('/partner/redemptions', ['member_ref' => 'RAVU-10001', 'bill_amount' => 20000])
            ->assertStatus(422)->assertJsonValidationErrors('bill_amount');
        // Expired members cannot be recorded even if the client skips verification.
        $this->postJson('/partner/redemptions', ['member_ref' => 'RAVU-10003', 'bill_amount' => 5000])
            ->assertStatus(422)->assertJsonValidationErrors('member_ref');

        $redemption = PartnerRedemption::firstWhere('receipt_no', $receipt);
        $this->assertSame($partner->locations()->first()->id, $redemption->partner_location_id);
        $this->assertSame('RAVU-10001', $redemption->member_ref);

        $this->postJson("/partner/redemptions/{$redemption->id}/void", ['reason' => 'Wrong amount typed'])->assertOk();
        $this->assertSame('voided', $redemption->fresh()->status);
        $this->postJson("/partner/redemptions/{$redemption->id}/void", ['reason' => 'Again please'])->assertStatus(422);
    }

    public function test_partners_awaiting_approval_cannot_verify_members(): void
    {
        [$user] = $this->partner('Pending Garage', 'submitted');

        $this->actingAs($user)->postJson('/partner/members/verify', ['query' => 'RAVU-10001'])->assertForbidden();
        $this->get('/partner-dashboard')->assertInertia(fn (Assert $page) => $page
            ->where('serving.enabled', false)
            ->where('performance', null));
    }

    public function test_partner_dashboard_reports_members_served_and_revenue_for_a_month(): void
    {
        [$user, $partner] = $this->partner('Kariakoo Garage');
        $this->visit($partner, 'RAVU-10001', '2026-09-20 10:00:00');
        $this->visit($partner, 'RAVU-10001', '2026-10-03 10:00:00', 20000);
        $this->visit($partner, 'RAVU-10001', '2026-10-17 10:00:00', 10000);
        $this->visit($partner, 'RAVU-10002', '2026-10-20 10:00:00', 40000);
        $this->visit($partner, 'RAVU-10002', '2026-10-21 10:00:00', 40000)->update(['status' => 'voided']);

        $this->actingAs($user)->get('/partner-dashboard?period=2026-10')->assertInertia(fn (Assert $page) => $page
            ->where('serving.enabled', true)
            ->where('performance.period.key', '2026-10')
            ->where('performance.totals.members.current', 2)
            ->where('performance.totals.members.previous', 1)
            ->where('performance.totals.visits.current', 3)
            ->where('performance.totals.sales.current', 70000)
            ->where('performance.totals.discount.current', 10500)
            ->where('performance.totals.paid.current', 59500)
            ->where('performance.totals.new_members', 1)
            ->where('performance.totals.returning_members', 1)
            ->where('performance.payout.months.0.status', 'pending_approval')
            ->where('performance.payout.months.0.amount', 12000)
            ->where('redemptions.total', 4));
    }

    public function test_a_running_month_is_compared_with_the_same_days_of_last_month(): void
    {
        [$user, $partner] = $this->partner('Kariakoo Garage');
        $this->visit($partner, 'RAVU-10001', '2026-10-10 10:00:00'); // inside 1–20 Oct
        $this->visit($partner, 'RAVU-10002', '2026-10-28 10:00:00'); // after day 20: excluded
        $this->visit($partner, 'RAVU-10004', '2026-11-05 10:00:00');

        $this->actingAs($user)->get('/partner-dashboard?period=2026-11')->assertInertia(fn (Assert $page) => $page
            ->where('performance.period.previous_label', '1–20 Oct 2026')
            ->where('performance.totals.members.current', 1)
            ->where('performance.totals.members.previous', 1));
    }

    public function test_pool_is_split_by_members_served_approved_and_paid(): void
    {
        [, $a] = $this->partner('Garage A');
        [, $b] = $this->partner('Garage B');
        [, $c] = $this->partner('Garage C');
        // Members served in October: A = 2 (RAVU-10001 twice counts once), B = 1, C = 1 → total 4.
        $this->visit($a, 'RAVU-10001', '2026-10-02 10:00:00');
        $this->visit($a, 'RAVU-10001', '2026-10-09 10:00:00');
        $this->visit($a, 'RAVU-10002', '2026-10-09 11:00:00');
        $this->visit($b, 'RAVU-10001', '2026-10-12 10:00:00');
        $this->visit($c, 'RAVU-10004', '2026-10-13 10:00:00');
        $this->visit($c, 'RAVU-10004', '2026-11-13 10:00:00'); // November: not part of October's pool
        config(['partner.payout_pool_percent' => 33.3325]); // 13,333 pool: 6,666.5 / 3,333.25 / 3,333.25 forces a remainder

        $admin = User::factory()->create(['role' => 'super_admin', 'email_verified_at' => now()]);
        $this->actingAs($admin)->get('/super-admin?section=payouts&period=2026-10')->assertInertia(fn (Assert $page) => $page
            ->where('payouts.summary.status', 'pending_approval')
            ->where('payouts.summary.revenue', 40000)
            ->where('payouts.summary.pool', 13333)
            ->where('payouts.summary.ravu_keeps', 26667)
            ->where('payouts.partners.0.name', 'Garage A')
            ->where('payouts.partners.0.amount', 6667)
            ->where('payouts.partners.1.amount', 3333)
            ->where('payouts.partners.2.amount', 3333));

        $this->post('/super-admin/payouts/2026-11/approve')->assertSessionHasErrors('period'); // month still running
        $this->post('/super-admin/payouts/2026-10/approve')->assertSessionHasNoErrors();
        $this->assertSame(13333, (int) PartnerPayout::where('period', '2026-10')->sum('amount'));
        $this->post('/super-admin/payouts/2026-10/approve')->assertSessionHasErrors('period');

        // Frozen: a later change to the pool % doesn't move approved figures.
        config(['partner.payout_pool_percent' => 50]);
        $payout = PartnerPayout::where('partner_id', $a->id)->first();
        $this->assertSame(6667, $payout->amount);
        $this->post("/super-admin/payouts/{$payout->id}/paid", ['reference' => 'MPESA-QX12'])->assertSessionHasNoErrors();
        $this->assertSame('paid', $payout->fresh()->status);

        $this->get('/super-admin?section=partner-performance&period=2026-10')->assertInertia(fn (Assert $page) => $page
            ->where('partnerPerformance.partners.0.name', 'Garage A')
            ->where('partnerPerformance.partners.0.members', 2)
            ->where('partnerPerformance.partners.0.payout', 6667)
            ->where('partnerPerformance.totals.members.current', 3)
            ->where('partnerPerformance.benefit_usage.active_members', 4)
            ->where('partnerPerformance.benefit_usage.members_used', 3));
    }

    public function test_partners_only_see_and_void_their_own_redemptions(): void
    {
        [$userA] = $this->partner('Garage A');
        [, $b] = $this->partner('Garage B');
        $other = $this->visit($b, 'RAVU-10001', now()->subHour()->toDateTimeString());

        $this->actingAs($userA)->postJson("/partner/redemptions/{$other->id}/void", ['reason' => 'Not mine at all'])->assertNotFound();
    }

    public function test_demo_command_generates_and_purges_sample_data(): void
    {
        [, $real] = $this->partner('Real Garage');

        $this->artisan('partners:demo', ['--months' => 2])->assertSuccessful();
        $this->assertSame(8, Partner::where('is_demo', true)->count());
        $this->assertTrue(PartnerRedemption::where('is_demo', true)->exists());
        $this->assertSame(0, PartnerRedemption::where('is_demo', false)->count());

        // --login: a partner account on a demo partner that sees the sample data.
        $this->artisan('partners:demo', ['--months' => 2, '--login' => true])->assertSuccessful();
        $demoUser = User::firstWhere('email', \App\Console\Commands\PartnerDemoData::DEMO_LOGIN);
        $this->assertTrue($demoUser->primaryPartner()->is_demo);
        $this->actingAs($demoUser)->get('/partner-dashboard?period=2026-11')->assertInertia(fn (Assert $page) => $page
            ->where('serving.enabled', true)
            ->where('performance.period.key', '2026-11')
            ->has('redemptions.rows'));
        auth()->logout();

        $this->artisan('partners:demo', ['--purge' => true])->assertSuccessful();
        $this->assertSame(0, Partner::where('is_demo', true)->count());
        $this->assertSame(0, PartnerRedemption::count());
        $this->assertNull(User::firstWhere('email', \App\Console\Commands\PartnerDemoData::DEMO_LOGIN));
        $this->assertTrue($real->fresh()->exists);
    }
}
