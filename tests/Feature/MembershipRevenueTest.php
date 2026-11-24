<?php

namespace Tests\Feature;

use App\Contracts\MembershipRevenueSource;
use App\Models\User;
use App\Services\Membership\ApiMembershipRevenueSource;
use App\Services\Membership\DemoMembershipRevenueSource;
use App\Services\Membership\MembershipRevenueService;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MembershipRevenueTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    /** A tiny, hand-checkable data set. */
    private function fakeSource(): MembershipRevenueSource
    {
        return new class implements MembershipRevenueSource
        {
            public function label(): string { return 'Test'; }

            public function isDemo(): bool { return false; }

            public function plans(): array
            {
                return [
                    ['id' => 'basic', 'name' => 'Basic', 'price' => 10000, 'interval' => 'month'],
                    ['id' => 'annual', 'name' => 'Annual', 'price' => 120000, 'interval' => 'year'],
                ];
            }

            public function subscriptions(CarbonInterface $since): array
            {
                return [
                    ['id' => 's1', 'plan_id' => 'basic', 'member_ref' => 'RAVU-1', 'member_phone' => null, 'started_at' => '2026-10-02T10:00:00+00:00', 'cancelled_at' => null],
                    ['id' => 's2', 'plan_id' => 'basic', 'member_ref' => 'RAVU-2', 'member_phone' => null, 'started_at' => '2026-10-05T10:00:00+00:00', 'cancelled_at' => '2026-11-10T10:00:00+00:00'],
                    ['id' => 's3', 'plan_id' => 'annual', 'member_ref' => 'RAVU-3', 'member_phone' => null, 'started_at' => '2026-11-03T10:00:00+00:00', 'cancelled_at' => null],
                ];
            }

            public function payments(CarbonInterface $from, CarbonInterface $to): array
            {
                return [
                    ['id' => 'p1', 'subscription_id' => 's1', 'plan_id' => 'basic', 'amount' => 10000, 'method' => 'M-Pesa', 'status' => 'paid', 'paid_at' => '2026-10-02T10:00:00+00:00'],
                    ['id' => 'p2', 'subscription_id' => 's2', 'plan_id' => 'basic', 'amount' => 10000, 'method' => 'Card', 'status' => 'paid', 'paid_at' => '2026-10-05T10:00:00+00:00'],
                    ['id' => 'p3', 'subscription_id' => 's1', 'plan_id' => 'basic', 'amount' => 10000, 'method' => 'M-Pesa', 'status' => 'failed', 'paid_at' => '2026-11-02T10:00:00+00:00'],
                    ['id' => 'p4', 'subscription_id' => 's1', 'plan_id' => 'basic', 'amount' => 10000, 'method' => 'M-Pesa', 'status' => 'paid', 'paid_at' => '2026-11-03T10:00:00+00:00'],
                    ['id' => 'p5', 'subscription_id' => 's3', 'plan_id' => 'annual', 'amount' => 120000, 'method' => 'M-Pesa', 'status' => 'paid', 'paid_at' => '2026-11-03T10:00:00+00:00'],
                    ['id' => 'p6', 'subscription_id' => 's2', 'plan_id' => 'basic', 'amount' => 10000, 'method' => 'Card', 'status' => 'refunded', 'paid_at' => '2026-11-05T10:00:00+00:00'],
                ];
            }
        };
    }

    public function test_report_totals_plans_periods_and_methods(): void
    {
        Carbon::setTestNow('2026-11-24 12:00:00');
        $report = (new MembershipRevenueService($this->fakeSource()))->build('12m');

        $this->assertNull($report['error'] ?? null);
        $this->assertSame(['current' => 150000, 'previous' => 0], $report['totals']['revenue']);
        // Active now: s1 (10,000/month) + s3 (120,000/year = 10,000/month).
        $this->assertSame(['current' => 20000, 'previous' => 0], $report['totals']['mrr']);
        $this->assertSame(2, $report['totals']['active']['current']);
        $this->assertSame(3, $report['totals']['new']['current']);
        $this->assertSame(1, $report['totals']['cancelled']['current']);
        $this->assertSame(10000, $report['totals']['arpu']);
        $this->assertSame(['count' => 1, 'amount' => 10000], $report['totals']['failed']);
        $this->assertSame(['count' => 1, 'amount' => 10000], $report['totals']['refunded']);

        $november = end($report['periods']);
        $this->assertSame('November 2026', $november['long']);
        $this->assertSame(['basic' => 10000, 'annual' => 120000], $november['plans']);
        $this->assertSame(20000, $report['periods'][10]['total']);

        $basic = collect($report['by_plan'])->firstWhere('id', 'basic');
        $this->assertSame(['active' => 1, 'new' => 2, 'cancelled' => 1, 'revenue' => 30000, 'mrr' => 10000], array_intersect_key($basic, array_flip(['active', 'new', 'cancelled', 'revenue', 'mrr'])));
        $this->assertSame([['method' => 'M-Pesa', 'revenue' => 140000, 'count' => 3], ['method' => 'Card', 'revenue' => 10000, 'count' => 1]], $report['by_method']);
        $this->assertSame('RAVU-2', $report['recent_payments'][0]['member']);
        $this->assertSame('refunded', $report['recent_payments'][0]['status']);
    }

    public function test_demo_source_is_deterministic_and_pilot_sized(): void
    {
        $plans = config('membership.demo_plans');
        $first = (new MembershipRevenueService(new DemoMembershipRevenueSource($plans)))->build('12m');
        $second = (new MembershipRevenueService(new DemoMembershipRevenueSource($plans)))->build('12m');

        $this->assertTrue($first['source']['demo']);
        $this->assertSame($first['totals'], $second['totals']);
        $this->assertGreaterThan(100, $first['totals']['active']['current']);
        $this->assertLessThan(600, $first['totals']['active']['current']);
        $this->assertSame($first['totals']['revenue']['current'], array_sum(array_column($first['periods'], 'total')));
    }

    public function test_api_source_maps_the_documented_endpoints(): void
    {
        Http::fake([
            'members.test/plans' => Http::response(['data' => [['id' => 7, 'name' => 'Plus', 'price' => '25000', 'interval' => 'month']]]),
            'members.test/subscriptions*' => Http::response(['data' => [['id' => 's', 'plan_id' => 7, 'started_at' => '2026-11-01T00:00:00Z']]]),
            'members.test/payments*' => Http::response(['data' => [['id' => 'p', 'subscription_id' => 's', 'plan_id' => 7, 'amount' => 25000, 'status' => 'paid', 'paid_at' => '2026-11-01T00:00:00Z']]]),
        ]);
        $source = new ApiMembershipRevenueSource(['url' => 'https://members.test', 'token' => 'secret', 'cache_seconds' => 0]);

        $this->assertSame([['id' => '7', 'name' => 'Plus', 'price' => 25000, 'interval' => 'month']], $source->plans());
        $this->assertSame('Unknown', $source->payments(now()->subYear(), now())[0]['method']);
        $this->assertNull($source->subscriptions(now()->subYear())[0]['cancelled_at']);
        Http::assertSent(fn ($request) => $request->hasHeader('Authorization', 'Bearer secret'));
    }

    public function test_an_unreachable_api_shows_an_error_instead_of_breaking_the_page(): void
    {
        Http::fake(['*' => Http::response('down', 503)]);
        $source = new ApiMembershipRevenueSource(['url' => 'https://members.test', 'cache_seconds' => 0]);

        $report = (new MembershipRevenueService($source))->build('12m');

        $this->assertFalse($report['source']['demo']);
        $this->assertStringContainsString('503', $report['error']);
    }

    public function test_revenue_is_only_computed_for_the_revenue_section(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin', 'email_verified_at' => now()]);

        $this->actingAs($admin)->get('/super-admin')->assertInertia(fn (Assert $page) => $page->where('revenue', null));
        $this->actingAs($admin)->get('/super-admin?section=revenue&range=12w')
            ->assertInertia(fn (Assert $page) => $page
                ->where('revenue.range', '12w')
                ->where('revenue.source.demo', true)
                ->has('revenue.periods', 12)
                ->has('revenue.by_plan', 4));
    }
}
