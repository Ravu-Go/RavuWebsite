<?php

namespace Tests\Feature;

use App\Models\Partner;
use App\Models\PartnerApplication;
use App\Models\PartnerApplicationStatusHistory;
use App\Models\PartnerCategory;
use App\Models\User;
use App\Services\PartnerInsightsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PartnerInsightsTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    /** A partner registered at $registered, optionally submitted and decided later. */
    private function partner(string $registered, ?string $submitted = null, ?string $decided = null, string $decision = 'approved', ?PartnerCategory $category = null): void
    {
        Carbon::setTestNow($registered);
        $partner = Partner::create(['registered_name' => 'Biz '.uniqid(), 'status' => 'onboarding', 'partner_category_id' => $category?->id]);
        $application = PartnerApplication::create(['partner_id' => $partner->id, 'status' => 'draft']);

        if ($submitted) {
            Carbon::setTestNow($submitted);
            $application->update(['status' => 'submitted', 'submitted_at' => now()]);
            PartnerApplicationStatusHistory::create(['partner_application_id' => $application->id, 'new_status' => 'submitted']);
        }
        if ($decided) {
            Carbon::setTestNow($decided);
            $application->update(['status' => $decision, 'approved_at' => $decision === 'approved' ? now() : null]);
            PartnerApplicationStatusHistory::create(['partner_application_id' => $application->id, 'new_status' => $decision]);
        }
    }

    public function test_weekly_insights_bucket_events_and_compare_to_the_previous_period(): void
    {
        $garages = PartnerCategory::create(['name' => 'Garages', 'slug' => 'garages']);

        // Current 12-week window (now = Wed 25 Nov 2026; window starts Mon 7 Sep 2026).
        $this->partner('2026-11-23 09:00', '2026-11-24 09:00', '2026-11-25 09:00', 'approved', $garages);
        $this->partner('2026-11-23 10:00', '2026-11-23 12:00', '2026-11-25 12:00', 'rejected', $garages);
        $this->partner('2026-11-16 10:00');
        // Previous window only.
        $this->partner('2026-08-03 10:00');

        Carbon::setTestNow('2026-11-25 15:00');
        $insights = app(PartnerInsightsService::class)->build('12w');

        $this->assertSame('week', $insights['unit']);
        $this->assertCount(12, $insights['periods']);
        $this->assertSame('2026-09-07', $insights['periods'][0]['start']);

        $thisWeek = $insights['periods'][11];
        $this->assertSame('2026-11-23', $thisWeek['start']);
        $this->assertSame(['registered' => 2, 'submitted' => 2, 'approved' => 1], array_intersect_key($thisWeek, array_flip(['registered', 'submitted', 'approved'])));
        $this->assertSame(1, $insights['periods'][10]['registered']);

        $this->assertSame(['current' => 3, 'previous' => 1], $insights['totals']['registered']);
        $this->assertSame(['current' => 1, 'previous' => 0], $insights['totals']['approved']);

        // Decisions after 1 day and 2 days → median 1.5 days, 1 of 2 approved.
        $this->assertSame(['median_days' => 1.5, 'decisions' => 2, 'approval_rate' => 50.0], $insights['review']);
        $this->assertSame(['registered' => 3, 'submitted' => 2, 'approved' => 1], $insights['funnel']);
        $this->assertSame([['name' => 'Garages', 'count' => 2], ['name' => 'Not chosen yet', 'count' => 1]], $insights['categories']);
    }

    public function test_daily_and_monthly_ranges_and_unknown_ranges_fall_back_to_weekly(): void
    {
        Carbon::setTestNow('2026-11-25 15:00');
        $service = app(PartnerInsightsService::class);

        $daily = $service->build('30d');
        $this->assertCount(30, $daily['periods']);
        $this->assertSame('2026-11-25', $daily['periods'][29]['start']);

        $monthly = $service->build('12m');
        $this->assertCount(12, $monthly['periods']);
        $this->assertSame('2025-12-01', $monthly['periods'][0]['start']);
        $this->assertSame('November 2026', $monthly['periods'][11]['long']);

        $this->assertSame('12w', $service->build('forever')['range']);
        $this->assertNull($service->build('12w')['review']['median_days']);
    }

    public function test_insights_are_only_computed_for_the_insights_section(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin', 'email_verified_at' => now()]);

        $this->actingAs($admin)->get('/super-admin')
            ->assertInertia(fn (Assert $page) => $page->where('insights', null));

        $this->actingAs($admin)->get('/super-admin?section=insights&range=12m')
            ->assertInertia(fn (Assert $page) => $page
                ->where('insights.range', '12m')
                ->has('insights.periods', 12));
    }
}
