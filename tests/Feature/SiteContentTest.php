<?php

namespace Tests\Feature;

use App\Models\Partner;
use App\Models\PartnerApplication;
use App\Models\SiteContent;
use App\Models\SiteMedia;
use App\Models\User;
use App\Services\SiteContentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SiteContentTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        return User::factory()->create(['role' => 'super_admin', 'email_verified_at' => now()]);
    }

    private function homeWith(string $eyebrow): array
    {
        $content = app(SiteContentService::class)->defaults('home');
        $content['hero']['eyebrow'] = $eyebrow;

        return $content;
    }

    public function test_public_pages_render_default_content_when_nothing_is_published(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Website/Home')
                ->where('content.hero.eyebrow', 'PILOTING IN DAR ES SALAAM')
                ->where('site.global.brand.siteName', 'Ravu')
                ->where('site.preview', false));

        foreach (['/about-ravu', '/for-riders', '/membership', '/benefits', '/partners', '/how-it-works', '/support'] as $path) {
            $this->get($path)->assertOk()->assertInertia(fn (Assert $page) => $page->has('content.seo.title'));
        }
    }

    public function test_draft_is_private_until_published(): void
    {
        $admin = $this->superAdmin();

        $this->actingAs($admin)
            ->put('/super-admin/content/home', ['content' => $this->homeWith('DRAFT EYEBROW')])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        // Visitors still see the live version.
        auth()->logout();
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('content.hero.eyebrow', 'PILOTING IN DAR ES SALAAM'));

        // The admin can preview the draft across the site.
        $this->actingAs($admin)->get('/super-admin/preview/home')->assertRedirect('/');
        $this->actingAs($admin)->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('content.hero.eyebrow', 'DRAFT EYEBROW')
            ->where('site.preview', true));
        $this->actingAs($admin)->get('/super-admin/preview-exit')->assertRedirect('/super-admin');
        $this->actingAs($admin)->get('/')->assertInertia(fn (Assert $page) => $page->where('content.hero.eyebrow', 'PILOTING IN DAR ES SALAAM'));

        // Publishing makes it live and records a revision.
        $this->actingAs($admin)->post('/super-admin/content/home/publish')->assertSessionHasNoErrors();
        auth()->logout();
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('content.hero.eyebrow', 'DRAFT EYEBROW'));

        $record = SiteContent::where('key', 'home')->firstOrFail();
        $this->assertNull($record->draft);
        $this->assertSame($admin->id, $record->published_by);
        $this->assertSame(1, $record->revisions()->count());
    }

    public function test_publish_can_save_and_publish_in_one_step_and_history_can_be_restored(): void
    {
        $admin = $this->superAdmin();

        $this->actingAs($admin)->post('/super-admin/content/home/publish', ['content' => $this->homeWith('FIRST')]);
        $this->actingAs($admin)->post('/super-admin/content/home/publish', ['content' => $this->homeWith('SECOND')]);
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('content.hero.eyebrow', 'SECOND'));

        $first = SiteContent::where('key', 'home')->firstOrFail()->revisions()->reorder('id')->firstOrFail();
        $this->actingAs($admin)->post("/super-admin/content/home/revisions/{$first->id}/restore")->assertSessionHasNoErrors();

        $this->assertSame('FIRST', SiteContent::where('key', 'home')->first()->draft['hero']['eyebrow']);
        // Restoring only loads a draft; the live page is unchanged until published.
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('content.hero.eyebrow', 'SECOND'));
    }

    public function test_discarding_a_draft_keeps_the_live_version(): void
    {
        $admin = $this->superAdmin();
        $this->actingAs($admin)->post('/super-admin/content/home/publish', ['content' => $this->homeWith('LIVE')]);
        $this->actingAs($admin)->put('/super-admin/content/home', ['content' => $this->homeWith('ABANDONED')]);

        $this->actingAs($admin)->delete('/super-admin/content/home/draft')->assertRedirect();

        $this->assertNull(SiteContent::where('key', 'home')->first()->draft);
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('content.hero.eyebrow', 'LIVE'));
    }

    public function test_global_content_changes_navigation_for_every_page(): void
    {
        $admin = $this->superAdmin();
        $global = app(SiteContentService::class)->defaults('global');
        $global['navigation']['links'][] = ['label' => 'Careers', 'href' => '/support'];

        $this->actingAs($admin)->post('/super-admin/content/global/publish', ['content' => $global]);
        auth()->logout();

        $this->get('/membership')->assertInertia(fn (Assert $page) => $page
            ->where('site.global.navigation.links.5.label', 'Careers'));
    }

    public function test_content_is_validated_against_the_page_schema(): void
    {
        $admin = $this->superAdmin();

        $content = $this->homeWith('OK');
        $content['hero']['title'] = ['not', 'text'];
        $this->actingAs($admin)->put('/super-admin/content/home', ['content' => $content])
            ->assertSessionHasErrors('content.hero.title');

        $content = $this->homeWith('OK');
        $content['slideshow']['slides'][0]['ctaHref'] = 'javascript:alert(1)';
        $this->actingAs($admin)->put('/super-admin/content/home', ['content' => $content])
            ->assertSessionHasErrors('content.slideshow.slides.0.ctaHref');

        $content = $this->homeWith('OK');
        $content['appShowcase']['image'] = '../../.env';
        $this->actingAs($admin)->put('/super-admin/content/home', ['content' => $content])
            ->assertSessionHasErrors('content.appShowcase.image');

        $this->assertDatabaseMissing('site_contents', ['key' => 'home']);

        // Unknown fields are dropped rather than stored.
        $content = $this->homeWith('OK');
        $content['hero']['injected'] = '<script>';
        $content['extra'] = ['x' => 1];
        $this->actingAs($admin)->put('/super-admin/content/home', ['content' => $content])->assertSessionHasNoErrors();
        $draft = SiteContent::where('key', 'home')->first()->draft;
        $this->assertArrayNotHasKey('injected', $draft['hero']);
        $this->assertArrayNotHasKey('extra', $draft);
    }

    public function test_only_super_admins_can_manage_content(): void
    {
        $reviewer = User::factory()->create(['role' => 'partner_reviewer', 'email_verified_at' => now()]);
        $partner = User::factory()->create(['role' => 'partner', 'email_verified_at' => now()]);

        foreach ([$reviewer, $partner] as $user) {
            $this->actingAs($user)->get('/super-admin')->assertForbidden();
            $this->actingAs($user)->put('/super-admin/content/home', ['content' => $this->homeWith('X')])->assertForbidden();
            $this->actingAs($user)->post('/super-admin/content/home/publish')->assertForbidden();
            $this->actingAs($user)->get('/super-admin/preview/home')->assertForbidden();
        }
        auth()->logout();
        $this->put('/super-admin/content/home', ['content' => $this->homeWith('X')])->assertRedirect('/login');

        $this->assertDatabaseCount('site_contents', 0);
    }

    public function test_preview_flag_is_ignored_for_non_admins(): void
    {
        $admin = $this->superAdmin();
        $this->actingAs($admin)->put('/super-admin/content/home', ['content' => $this->homeWith('SECRET DRAFT')]);

        $reviewer = User::factory()->create(['role' => 'partner_reviewer', 'email_verified_at' => now()]);
        $this->actingAs($reviewer)
            ->withSession([SiteContentService::PREVIEW_SESSION_KEY => true])
            ->get('/')
            ->assertInertia(fn (Assert $page) => $page->where('content.hero.eyebrow', 'PILOTING IN DAR ES SALAAM'));
    }

    public function test_media_upload_accepts_images_only(): void
    {
        Storage::fake('public');
        $admin = $this->superAdmin();

        $this->actingAs($admin)
            ->post('/super-admin/media', ['file' => UploadedFile::fake()->image('hero.jpg', 1200, 800)])
            ->assertSessionHasNoErrors();

        $media = SiteMedia::firstOrFail();
        Storage::disk('public')->assertExists($media->path);
        $this->assertStringStartsWith('/storage/site-media/', $media->url);

        // The uploaded URL is accepted as an image value.
        $content = $this->homeWith('OK');
        $content['appShowcase']['image'] = $media->url;
        $this->actingAs($admin)->put('/super-admin/content/home', ['content' => $content])->assertSessionHasNoErrors();

        $this->actingAs($admin)
            ->post('/super-admin/media', ['file' => UploadedFile::fake()->create('evil.svg', 4, 'image/svg+xml')])
            ->assertSessionHasErrors('file');

        $this->actingAs($admin)->delete("/super-admin/media/{$media->id}")->assertRedirect();
        Storage::disk('public')->assertMissing($media->path);
    }

    public function test_dashboard_shows_content_status_and_partner_review_queue(): void
    {
        $admin = $this->superAdmin();
        $partner = Partner::create(['registered_name' => 'Mwenge Auto Spares', 'status' => 'pending_review']);
        PartnerApplication::create(['partner_id' => $partner->id, 'status' => 'submitted', 'submitted_at' => now()]);
        $this->actingAs($admin)->put('/super-admin/content/support', ['content' => app(SiteContentService::class)->defaults('support')]);

        $this->actingAs($admin)->get('/super-admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Website/SuperAdminDashboard')
                ->has('pages', count(config('site_content.pages')))
                ->where('pages.8.key', 'support')
                ->where('pages.8.has_draft', true)
                ->where('partnerSummary.counts.submitted', 1)
                ->where('partnerSummary.queue.0.business', 'Mwenge Auto Spares')
                ->where('editor', null));

        $this->actingAs($admin)->get('/admin')->assertRedirect('/super-admin');
    }

    public function test_content_section_sends_only_the_draft_being_edited(): void
    {
        $admin = $this->superAdmin();

        $this->actingAs($admin)->get('/super-admin?section=content&page=support')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('editor.key', 'support')
                ->has('editor.draft.hero')
                ->missing('documents'));

        // Missing or unknown page keys open the home page instead of failing.
        $this->actingAs($admin)->get('/super-admin?section=content&page=nope')
            ->assertInertia(fn (Assert $page) => $page->where('editor.key', 'home'));

        // Switching pages is a partial reload that carries only the editor.
        $this->actingAs($admin)
            ->withHeaders([
                'X-Inertia' => 'true',
                'X-Inertia-Version' => (string) app(\App\Http\Middleware\HandleInertiaRequests::class)->version(request()),
                'X-Inertia-Partial-Component' => 'Website/SuperAdminDashboard', 'X-Inertia-Partial-Data' => 'editor',
            ])
            ->get('/super-admin?section=content&page=home')
            ->assertOk()
            ->assertJsonPath('props.editor.key', 'home')
            ->assertJsonMissingPath('props.revisions')
            ->assertJsonMissingPath('props.partnerSummary');
    }
}
