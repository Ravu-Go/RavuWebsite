<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Partner;
use App\Models\PartnerAuditLog;
use App\Models\User;
use App\Services\SiteContentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    private function admin(array $attributes = []): User
    {
        return User::factory()->create(['role' => 'super_admin', 'email_verified_at' => now(), 'password' => 'AdminPass12345', ...$attributes]);
    }

    public function test_partner_audit_events_are_mirrored_into_the_activity_log(): void
    {
        $partner = Partner::create(['registered_name' => 'Mwenge Auto', 'status' => 'onboarding']);
        PartnerAuditLog::create(['partner_id' => $partner->id, 'action' => 'document_uploaded', 'details' => ['filename' => 'tin.pdf']]);

        $log = ActivityLog::sole();
        $this->assertSame('partner', $log->category);
        $this->assertSame($partner->id, $log->partner_id);
        $this->assertSame(['filename' => 'tin.pdf'], $log->details);
    }

    public function test_content_media_and_account_actions_are_recorded(): void
    {
        $admin = $this->admin();
        $support = app(SiteContentService::class)->defaults('support');

        $this->actingAs($admin)->put('/super-admin/content/support', ['content' => $support]);
        $this->actingAs($admin)->post('/super-admin/content/support/publish');
        $this->actingAs($admin)->patch('/super-admin/account', ['name' => 'New Name', 'email' => $admin->email]);
        $this->actingAs($admin)->put('/super-admin/account/password', [
            'current_password' => 'AdminPass12345',
            'password' => 'BrandNewPass2026',
            'password_confirmation' => 'BrandNewPass2026',
        ]);

        $this->assertSame(
            ['content_draft_saved', 'content_published', 'account_updated', 'password_changed'],
            ActivityLog::orderBy('id')->pluck('action')->all(),
        );
        $this->assertSame(['changed' => ['name']], ActivityLog::firstWhere('action', 'account_updated')->details);
        $this->assertTrue(ActivityLog::pluck('user_id')->every(fn ($id) => $id === $admin->id));
    }

    public function test_sign_ins_failures_and_sign_outs_are_recorded(): void
    {
        $admin = $this->admin(['email' => 'james@ravu.com']);

        $this->post('/login', ['email' => 'james@ravu.com', 'password' => 'wrong-password']);
        $this->post('/login', ['email' => 'nobody@ravu.com', 'password' => 'whatever']);
        $this->post('/login', ['email' => 'james@ravu.com', 'password' => 'AdminPass12345']);
        $this->post('/logout');

        $rows = ActivityLog::orderBy('id')->get(['action', 'user_id', 'details']);
        $this->assertSame(['sign_in_failed', 'sign_in_failed', 'signed_in', 'signed_out'], $rows->pluck('action')->all());
        $this->assertSame($admin->id, $rows[0]->user_id);
        $this->assertNull($rows[1]->user_id);
        $this->assertSame(['email' => 'nobody@ravu.com', 'attempt' => 1], $rows[1]->details);
        $this->assertSame('password', $rows[2]->details['method']);
        $this->assertStringNotContainsString('AdminPass12345', ActivityLog::all()->toJson());
    }

    public function test_activity_section_filters_pages_and_describes_entries(): void
    {
        $admin = $this->admin(['name' => 'James']);
        $other = $this->admin(['name' => 'Lusinde']);
        ActivityLog::create(['user_id' => $admin->id, 'category' => 'content', 'action' => 'content_published', 'details' => ['page' => 'home']]);
        ActivityLog::create(['user_id' => $other->id, 'category' => 'media', 'action' => 'media_uploaded', 'details' => ['name' => 'rider.jpg', 'size' => 20480]]);
        ActivityLog::create(['user_id' => $other->id, 'category' => 'auth', 'action' => 'signed_in', 'details' => ['method' => 'google']]);

        $this->actingAs($admin)->get('/super-admin')
            ->assertInertia(fn (Assert $page) => $page
                ->where('activityLog', null)
                ->where('activity.0.description', 'Signed in with Google'));

        $this->actingAs($admin)->get('/super-admin?section=activity')
            ->assertInertia(fn (Assert $page) => $page
                ->where('activityLog.pagination.total', 3)
                ->where('activityLog.entries.0.description', 'Signed in with Google')
                ->has('activityLog.people', 2));

        $this->actingAs($admin)->get('/super-admin?section=activity&category=media')
            ->assertInertia(fn (Assert $page) => $page
                ->where('activityLog.pagination.total', 1)
                ->where('activityLog.entries.0.description', 'Uploaded image rider.jpg')
                ->where('activityLog.entries.0.details.1', ['label' => 'Size', 'value' => '20 KB']));

        $this->actingAs($admin)->get("/super-admin?section=activity&user={$admin->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('activityLog.pagination.total', 1)
                ->where('activityLog.entries.0.description', 'Published Home'));

        $this->actingAs($admin)->get('/super-admin?section=activity&q=lusinde')
            ->assertInertia(fn (Assert $page) => $page->where('activityLog.pagination.total', 2));
    }

    public function test_repeated_failures_are_numbered_and_the_lockout_is_recorded(): void
    {
        $admin = $this->admin(['email' => 'james@ravu.com']);

        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', ['email' => 'james@ravu.com', 'password' => 'wrong-password']);
        }
        $this->from('/login')->post('/login', ['email' => 'james@ravu.com', 'password' => 'wrong-password'])
            ->assertRedirect('/login')
            ->assertSessionHasErrors('email');

        $failed = ActivityLog::where('action', 'sign_in_failed')->orderBy('id')->get();
        $this->assertSame([1, 2, 3, 4, 5], $failed->pluck('details.attempt')->all());
        $lockout = ActivityLog::firstWhere('action', 'sign_in_locked_out');
        $this->assertNotNull($lockout);
        $this->assertSame($admin->id, $lockout->user_id);
        $this->assertSame('james@ravu.com', $lockout->details['email']);
    }

    public function test_a_valid_password_without_portal_access_is_recorded_as_denied_not_a_sign_in(): void
    {
        User::factory()->create(['email' => 'member@ravu.com', 'role' => 'member', 'password' => 'MemberPass12345']);

        $this->post('/login', ['email' => 'member@ravu.com', 'password' => 'MemberPass12345'])->assertSessionHasErrors('email');

        $this->assertGuest();
        $this->assertSame(['sign_in_denied'], ActivityLog::pluck('action')->all());
    }

    public function test_blocked_pages_application_views_exports_and_reset_requests_are_recorded(): void
    {
        $admin = $this->admin();
        $partnerUser = User::factory()->create(['role' => 'partner', 'email_verified_at' => now()]);
        $partner = Partner::create(['registered_name' => 'Mwenge Auto', 'status' => 'pending_review']);
        $application = \App\Models\PartnerApplication::create(['partner_id' => $partner->id, 'status' => 'submitted', 'submitted_at' => now()]);

        $this->actingAs($partnerUser)->get('/super-admin')->assertForbidden();
        $this->actingAs($admin)->get("/partner-management/applications/{$application->id}")->assertOk();
        $this->actingAs($admin)->get('/super-admin/activity/export')->assertOk()->streamedContent();
        $this->post('/password/forgot', ['email' => $admin->email]);

        $denied = ActivityLog::firstWhere('action', 'access_denied');
        $this->assertSame($partnerUser->id, $denied->user_id);
        $this->assertSame('/super-admin', $denied->details['path']);
        $this->assertSame($partner->id, ActivityLog::firstWhere('action', 'application_viewed')->partner_id);
        $this->assertNotNull(ActivityLog::firstWhere('action', 'activity_exported'));
        $this->assertSame($admin->email, ActivityLog::firstWhere('action', 'password_reset_requested')->details['email']);
    }

    public function test_activity_section_summarises_sign_in_activity(): void
    {
        $admin = $this->admin();
        foreach (['signed_in', 'signed_in', 'sign_in_failed', 'sign_in_failed', 'sign_in_failed', 'sign_in_locked_out'] as $action) {
            ActivityLog::create(['category' => 'auth', 'action' => $action, 'details' => ['email' => 'evance@ravu.com'], 'ip_address' => '10.0.0.'.rand(1, 2)]);
        }

        $this->actingAs($admin)->get('/super-admin?section=activity&action=sign_in_failed')
            ->assertInertia(fn (Assert $page) => $page
                ->where('activityLog.pagination.total', 3)
                ->where('activityLog.summary.signed_in', 2)
                ->where('activityLog.summary.sign_in_failed', 3)
                ->where('activityLog.summary.sign_in_locked_out', 1)
                ->where('activityLog.summary.failures_by_account.0.email', 'evance@ravu.com')
                ->where('activityLog.summary.failures_by_account.0.failed', 3)
                ->where('activityLog.summary.failures_by_account.0.locked', 1));
    }

    public function test_activity_can_be_exported_as_csv(): void
    {
        $admin = $this->admin(['name' => 'James']);
        ActivityLog::create(['user_id' => $admin->id, 'category' => 'content', 'action' => 'content_published', 'details' => ['page' => 'home'], 'ip_address' => '10.0.0.1']);

        $response = $this->actingAs($admin)->get('/super-admin/activity/export?category=content');
        $response->assertOk();
        $csv = $response->streamedContent();
        $this->assertStringContainsString('Time,Category,Activity,Person', $csv);
        $this->assertStringContainsString('"Published Home",James', $csv);
        $this->assertStringContainsString('10.0.0.1', $csv);
    }

    public function test_entries_are_ordered_by_time_not_insertion_order(): void
    {
        $admin = $this->admin();
        ActivityLog::create(['category' => 'content', 'action' => 'content_published', 'details' => ['page' => 'home']])->forceFill(['created_at' => now()->subDays(1)])->save();
        ActivityLog::create(['category' => 'content', 'action' => 'content_published', 'details' => ['page' => 'about']])->forceFill(['created_at' => now()->subDays(5)])->save();
        ActivityLog::create(['category' => 'content', 'action' => 'content_published', 'details' => ['page' => 'support']])->forceFill(['created_at' => now()->subHour()])->save();

        $this->actingAs($admin)->get('/super-admin?section=activity')
            ->assertInertia(fn (Assert $page) => $page
                ->where('activityLog.entries.0.details.0.value', 'Support & FAQs')
                ->where('activityLog.entries.1.details.0.value', 'Home')
                ->where('activityLog.entries.2.details.0.value', 'About RAVU'));
    }

    public function test_only_super_admins_can_read_or_export_the_log(): void
    {
        $partnerUser = User::factory()->create(['role' => 'partner', 'email_verified_at' => now()]);

        $this->actingAs($partnerUser)->get('/super-admin?section=activity')->assertForbidden();
        $this->actingAs($partnerUser)->get('/super-admin/activity/export')->assertForbidden();
    }
}
