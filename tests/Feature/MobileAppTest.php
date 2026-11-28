<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\MobileAnnouncement;
use App\Models\MobileFeature;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MobileAppTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'super_admin', 'email_verified_at' => now()]);
    }

    private function versions(User $admin, array $versions): \Illuminate\Testing\TestResponse
    {
        return $this->actingAs($admin)->put('/super-admin/mobile/versions', [
            'versions' => $versions,
            'update_message' => 'Please update RAVU.',
        ]);
    }

    public function test_the_public_config_works_without_signing_in_and_has_safe_defaults(): void
    {
        $this->getJson('/api/mobile/config')
            ->assertOk()
            ->assertJsonPath('maintenance.active', false)
            ->assertJsonPath('update.ios.status', 'unknown')
            ->assertJsonPath('announcements', [])
            ->assertJsonPath('features', [])
            ->assertJsonStructure(['revision', 'generated_at', 'support' => ['phone', 'whatsapp', 'email', 'hours'], 'links' => ['terms', 'privacy', 'help']])
            ->assertHeader('ETag');
    }

    public function test_version_rules_decide_required_and_recommended_updates_per_platform(): void
    {
        $admin = $this->admin();
        $this->versions($admin, ['ios' => ['min' => '1.3', 'latest' => '1.5.0'], 'android' => ['min' => null, 'latest' => '2.0']])
            ->assertSessionHasNoErrors();

        $this->getJson('/api/mobile/config?platform=ios&version=1.2.9')->assertJsonPath('update.status', 'required')->assertJsonPath('update.message', 'Please update RAVU.');
        $this->getJson('/api/mobile/config?platform=ios&version=1.4')->assertJsonPath('update.status', 'recommended');
        $this->getJson('/api/mobile/config?platform=ios&version=1.5.0')->assertJsonPath('update.status', 'ok')->assertJsonPath('update.message', null);
        $this->getJson('/api/mobile/config?platform=android&version=1.0')->assertJsonPath('update.status', 'recommended');

        $log = ActivityLog::firstWhere('action', 'mobile_versions_updated');
        $this->assertSame('none → 1.3', $log->details['ios_min']);
        $this->assertArrayNotHasKey('android_min', $log->details);
    }

    public function test_minimum_version_cannot_exceed_latest_and_versions_must_be_numbers(): void
    {
        $admin = $this->admin();
        $this->versions($admin, ['ios' => ['min' => '2.0', 'latest' => '1.9'], 'android' => ['min' => null, 'latest' => null]])
            ->assertSessionHasErrors('versions.ios.min');
        $this->versions($admin, ['ios' => ['min' => 'v1', 'latest' => null], 'android' => ['min' => null, 'latest' => null]])
            ->assertSessionHasErrors('versions.ios.min');
    }

    public function test_maintenance_mode_switches_on_and_expires_by_itself(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin)->put('/super-admin/mobile/maintenance', ['enabled' => true, 'message' => 'Back at 6pm.', 'until' => now()->addHour()->toIso8601String()])
            ->assertSessionHasNoErrors();

        $this->getJson('/api/mobile/config')->assertJsonPath('maintenance.active', true)->assertJsonPath('maintenance.message', 'Back at 6pm.');
        $this->travel(2)->hours();
        $this->getJson('/api/mobile/config')->assertJsonPath('maintenance.active', false);

        $this->actingAs($admin)->put('/super-admin/mobile/maintenance', ['enabled' => false, 'message' => 'Back at 6pm.', 'until' => now()->subHour()->toIso8601String()])
            ->assertSessionHasNoErrors();
        $this->assertSame(['mobile_maintenance_enabled', 'mobile_maintenance_disabled'], ActivityLog::where('category', 'mobile')->orderBy('id')->pluck('action')->all());
    }

    public function test_only_live_targeted_announcements_reach_the_app_most_urgent_first(): void
    {
        $base = ['body' => 'Text', 'audience' => 'all', 'is_active' => true, 'dismissible' => true];
        MobileAnnouncement::create([...$base, 'title' => 'Info', 'tone' => 'info']);
        MobileAnnouncement::create([...$base, 'title' => 'Outage', 'tone' => 'critical']);
        MobileAnnouncement::create([...$base, 'title' => 'Android only', 'tone' => 'info', 'audience' => 'android']);
        MobileAnnouncement::create([...$base, 'title' => 'Scheduled', 'tone' => 'info', 'starts_at' => now()->addDay()]);
        MobileAnnouncement::create([...$base, 'title' => 'Ended', 'tone' => 'info', 'ends_at' => now()->subMinute()]);
        MobileAnnouncement::create([...$base, 'title' => 'Paused', 'tone' => 'info', 'is_active' => false]);
        MobileAnnouncement::create([...$base, 'title' => 'New app only', 'tone' => 'success', 'min_app_version' => '2.0']);

        $titles = fn ($query) => collect($this->getJson("/api/mobile/config{$query}")->json('announcements'))->pluck('title')->all();

        $this->assertSame(['Outage', 'Info'], $titles('?platform=ios&version=1.0'));
        $this->assertSame(['Outage', 'New app only', 'Android only', 'Info'], $titles('?platform=android&version=2.1'));
    }

    public function test_feature_switches_respect_platform_and_version_and_toggles_are_logged(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin)->post('/super-admin/mobile/features', ['key' => 'fleet_dashboard', 'name' => 'Fleet dashboard', 'enabled' => true, 'platforms' => 'android', 'min_app_version' => '1.4'])
            ->assertSessionHasNoErrors();
        $this->actingAs($admin)->post('/super-admin/mobile/features', ['key' => 'Bad Key', 'name' => 'x', 'enabled' => true, 'platforms' => 'all'])
            ->assertSessionHasErrors('key');

        $this->getJson('/api/mobile/config?platform=android&version=1.4.0')->assertJsonPath('features.fleet_dashboard', true);
        $this->getJson('/api/mobile/config?platform=android&version=1.3')->assertJsonPath('features.fleet_dashboard', false);
        $this->getJson('/api/mobile/config?platform=ios&version=9.0')->assertJsonPath('features.fleet_dashboard', false);

        $feature = MobileFeature::sole();
        $this->actingAs($admin)->put("/super-admin/mobile/features/{$feature->id}", [...$feature->only(['key', 'name', 'platforms', 'min_app_version']), 'enabled' => false])
            ->assertSessionHasNoErrors();
        $this->assertSame('mobile_feature_disabled', ActivityLog::where('category', 'mobile')->latest('id')->value('action'));
    }

    public function test_unchanged_config_returns_not_modified(): void
    {
        $etag = $this->getJson('/api/mobile/config?platform=ios&version=1.0')->headers->get('ETag');

        $this->withHeaders(['If-None-Match' => $etag])->get('/api/mobile/config?platform=ios&version=1.0')->assertStatus(304);
    }

    public function test_only_super_admins_can_change_the_app_and_the_section_loads_lazily(): void
    {
        $partner = User::factory()->create(['role' => 'partner', 'email_verified_at' => now()]);
        $this->actingAs($partner)->put('/super-admin/mobile/maintenance', ['enabled' => true, 'message' => 'x'])->assertForbidden();

        $admin = $this->admin();
        $this->actingAs($admin)->get('/super-admin')->assertInertia(fn (Assert $page) => $page->where('mobile', null));
        $this->actingAs($admin)->get('/super-admin?section=mobile')
            ->assertInertia(fn (Assert $page) => $page
                ->where('mobile.settings.maintenance.enabled', false)
                ->where('mobile.endpoint', url('/api/mobile/config')));
    }
}
