<?php

namespace Tests\Feature;

use App\Models\DocumentRequirement;
use App\Models\Partner;
use App\Models\PartnerApplication;
use App\Models\PartnerApplicationStatusHistory;
use App\Models\PartnerCategory;
use App\Models\PartnerDocument;
use App\Models\PartnerLocation;
use App\Models\ProposedPartnerBenefit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PartnerOnboardingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['partner.terms_url' => 'https://ravu.example/terms', 'partner.privacy_url' => 'https://ravu.example/privacy']);
    }

    public function test_registration_creates_unverified_partner_application_and_requires_policy_acceptance(): void
    {
        Notification::fake();
        $response = $this->post('/register', [
            'business_name' => 'Amina Garage', 'category_id' => 'Vehicle Workshops & Garages', 'address' => 'Morogoro Rd, Dar es Salaam',
            'name' => 'Amina Owner', 'position' => 'Director', 'email' => 'amina@example.test',
            'phone' => '+255700000001', 'preferred_communication' => 'whatsapp',
            'password' => 'SecurePassword123', 'password_confirmation' => 'SecurePassword123',
            'terms' => '1', 'privacy' => '1',
        ]);

        $response->assertRedirect('/partner-dashboard');
        $this->assertAuthenticated();
        $user = User::where('email', 'amina@example.test')->firstOrFail();
        $this->assertFalse($user->hasVerifiedEmail());
        $partner = $user->primaryPartner();
        $this->assertNotNull($partner);
        $this->assertSame('owner', $partner->pivot->role);
        $this->assertSame('draft', $partner->application->status);
        $this->assertNotNull($user->terms_accepted_at);
        Notification::assertSentTo($user, \Illuminate\Auth\Notifications\VerifyEmail::class);

        $this->post('/register', [
            'business_name' => 'Second Garage', 'category_id' => 'Vehicle Workshops & Garages', 'address' => 'Arusha',
            'name' => 'Second Owner', 'position' => 'Owner', 'email' => 'second@example.test',
            'phone' => '+255700000002', 'preferred_communication' => 'email',
            'password' => 'SecurePassword123', 'password_confirmation' => 'SecurePassword123',
            'terms' => '1',
        ])->assertSessionHasErrors('privacy');
        $this->assertDatabaseMissing('users', ['email' => 'second@example.test']);
    }

    public function test_registration_saves_a_custom_business_category(): void
    {
        Notification::fake();
        $categoryName = 'Mobile Money & Digital Payments';

        $response = $this->post('/register', [
            'business_name' => 'Digital Payments Ltd',
            'category_id' => $categoryName,
            'address' => 'Samora Ave, Dar es Salaam',
            'name' => 'Amina Owner',
            'position' => 'Director',
            'email' => 'digital@example.test',
            'phone' => '+255700000003',
            'preferred_communication' => 'whatsapp',
            'password' => 'SecurePassword123',
            'password_confirmation' => 'SecurePassword123',
            'terms' => '1',
            'privacy' => '1',
        ]);

        $response->assertRedirect('/partner-dashboard');
        $category = PartnerCategory::where('name', $categoryName)->firstOrFail();
        $partner = User::where('email', 'digital@example.test')->firstOrFail()->primaryPartner();
        $this->assertSame($category->id, $partner->partner_category_id);
    }

    public function test_registration_requires_the_app_partner_fields_and_a_unique_tanzanian_phone(): void
    {
        Notification::fake();
        $payload = [
            'business_name' => 'Kariakoo Spares', 'category_id' => 'Spare Parts Dealers', 'address' => 'Kariakoo, Dar es Salaam',
            'name' => 'Juma Owner', 'email' => 'juma@example.test', 'phone' => '0712 345 678',
            'password' => 'SecurePassword123', 'password_confirmation' => 'SecurePassword123', 'terms' => '1', 'privacy' => '1',
        ];

        $this->post('/register', array_merge($payload, ['business_name' => '', 'address' => '', 'category_id' => '']))
            ->assertSessionHasErrors(['business_name', 'address', 'category_id']);

        $this->post('/register', $payload)->assertRedirect('/partner-dashboard');
        $user = User::where('email', 'juma@example.test')->firstOrFail();
        $this->assertSame('+255712345678', $user->phone);
        $this->assertSame('Partner Representative', $user->position);
        $partner = $user->primaryPartner();
        $this->assertSame('Kariakoo, Dar es Salaam', $partner->address);
        $this->assertSame('+255712345678', $partner->phone);
        $this->assertDatabaseHas('user_profiles', ['user_id' => $user->id, 'preferred_communication' => 'whatsapp']);

        auth()->logout();
        $this->post('/register', array_merge($payload, ['email' => 'other@example.test', 'phone' => '+255 712 345 678']))
            ->assertSessionHasErrors('phone');
        $this->post('/register', array_merge($payload, ['email' => 'JUMA@example.test', 'phone' => '0713 000 000']))
            ->assertSessionHasErrors('email');
    }

    public function test_app_administrators_sign_in_as_super_admins_and_inactive_accounts_are_refused(): void
    {
        config(['ravu_app.super_admin_roles' => ['administrator']]);
        $admin = User::create(['name' => 'App Admin', 'email' => 'admin@example.test', 'password' => 'SecurePassword123', 'role' => 'administrator']);
        $admin->forceFill(['email_verified_at' => now()])->save();

        $this->assertTrue($admin->isSuperAdmin());
        $this->post('/login', ['email' => 'admin@example.test', 'password' => 'SecurePassword123'])->assertRedirect('/super-admin');
        $this->assertDatabaseHas('user_profiles', ['user_id' => $admin->id, 'last_login_provider' => 'password']);

        auth()->logout();
        $rider = User::create(['name' => 'Rider', 'email' => 'rider@example.test', 'password' => 'SecurePassword123', 'role' => 'rider']);
        $this->post('/login', ['email' => 'rider@example.test', 'password' => 'SecurePassword123'])->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->assertNull($rider->fresh()->last_login_at);
    }

    public function test_session_cookies_stay_on_localhost_when_the_live_cookie_domain_is_configured(): void
    {
        $middleware = new \App\Http\Middleware\LocalSessionCookies;
        $pass = fn () => response('ok');

        foreach (['http://127.0.0.1:8000/register', 'http://localhost:8000/register', 'http://ravu.test/register'] as $url) {
            config(['session.domain' => '.ravultd.com', 'session.secure' => true]);
            $middleware->handle(\Illuminate\Http\Request::create($url), $pass);

            $cookie = app('cookie')->make('probe', 'value');
            $this->assertNull(config('session.domain'), $url);
            $this->assertNull($cookie->getDomain(), $url);
            $this->assertFalse($cookie->isSecure(), $url);
        }

        config(['session.domain' => '.ravultd.com', 'session.secure' => true]);
        $middleware->handle(\Illuminate\Http\Request::create('https://website.ravultd.com/register'), $pass);
        $this->assertSame('.ravultd.com', config('session.domain'));
        $this->assertTrue(config('session.secure'));
    }

    public function test_partner_routes_require_authentication_verification_and_partner_membership(): void
    {
        $this->get('/partner-dashboard')->assertRedirect('/login');
        $this->get('/partner-management')->assertRedirect('/login');
        $member = User::create(['name' => 'Member', 'email' => 'member@example.test', 'password' => 'password', 'role' => 'member', 'email_verified_at' => now()]);
        $member->forceFill(['email_verified_at' => now()])->save();
        $this->actingAs($member)->get('/partner-dashboard')->assertForbidden();
        $this->actingAs($member)->get('/partner-management')->assertForbidden();
    }

    public function test_application_submission_requires_business_location_benefit_and_required_documents(): void
    {
        $user = User::create(['name' => 'Owner', 'email' => 'owner@example.test', 'password' => 'password', 'role' => 'partner', 'email_verified_at' => now()]);
        $user->forceFill(['email_verified_at' => now()])->save();
        $category = PartnerCategory::create(['name' => 'Garage', 'slug' => 'garage']);
        $partner = Partner::create([
            'registered_name' => 'Garage Ltd', 'registration_number' => 'REG-1', 'tin_number' => 'TIN-1',
            'partner_category_id' => $category->id, 'business_description' => 'Vehicle repair and maintenance',
        ]);
        $partner->users()->attach($user->id, ['role' => 'owner']);
        $application = PartnerApplication::create(['partner_id' => $partner->id]);
        PartnerLocation::create(['partner_id' => $partner->id, 'region' => 'Dar es Salaam', 'district' => 'Kinondoni', 'physical_address' => '12 Main Road']);
        ProposedPartnerBenefit::create(['partner_id' => $partner->id, 'partner_application_id' => $application->id, 'name' => 'Member discount', 'description' => 'Ten percent off labor', 'benefit_type' => 'percentage_discount', 'discount_percentage' => 10]);
        DocumentRequirement::create(['document_type' => 'license', 'label' => 'Business license', 'is_required' => true]);

        $this->actingAs($user)->post('/partner/onboarding/submit')->assertSessionHasErrors('documents');
        $this->assertSame('draft', $application->fresh()->status);

        Storage::fake('local');
        $response = $this->actingAs($user)->post('/partner/onboarding/documents', [
            'document_type' => 'license', 'file' => UploadedFile::fake()->create('license.pdf', 20, 'application/pdf'),
        ]);
        $response->assertSessionHasNoErrors();
        $document = PartnerDocument::firstOrFail();
        $this->assertStringStartsWith('partners/'.$partner->id.'/documents/', $document->storage_path);
        Storage::disk('local')->assertExists($document->storage_path);

        $this->actingAs($user)->post('/partner/onboarding/submit')->assertSessionHasNoErrors();
        $this->assertSame('submitted', $application->fresh()->status);
        $this->assertNotNull($application->fresh()->submitted_snapshot);
        $this->assertDatabaseHas('partner_application_status_history', ['partner_application_id' => $application->id, 'new_status' => 'submitted']);
    }

    public function test_approval_requires_required_documents_to_be_verified(): void
    {
        $reviewer = User::create(['name' => 'Reviewer', 'email' => 'reviewer@example.test', 'password' => 'password', 'role' => 'partner_reviewer', 'email_verified_at' => now()]);
        $partner = Partner::create(['registered_name' => 'Garage Ltd']);
        $owner = User::create(['name' => 'Owner', 'email' => 'owner@example.test', 'password' => 'password', 'role' => 'partner', 'email_verified_at' => now()]);
        $reviewer->forceFill(['email_verified_at' => now()])->save();
        $owner->forceFill(['email_verified_at' => now()])->save();
        $partner->users()->attach($owner->id, ['role' => 'owner']);
        $application = PartnerApplication::create(['partner_id' => $partner->id, 'status' => 'under_review']);
        $requirement = DocumentRequirement::create(['document_type' => 'tin', 'label' => 'TIN Certificate', 'is_required' => true]);
        $document = PartnerDocument::create([
            'partner_id' => $partner->id, 'partner_application_id' => $application->id,
            'document_requirement_id' => $requirement->id, 'uploaded_by' => $owner->id,
            'document_type' => 'tin', 'original_filename' => 'tin.pdf', 'storage_path' => 'partners/1/tin.pdf',
            'mime_type' => 'application/pdf', 'file_size' => 100, 'status' => 'pending_review',
        ]);

        $this->actingAs($reviewer)->post("/partner-management/applications/{$application->id}/approve")->assertSessionHasErrors('documents');
        $this->actingAs($reviewer)->post("/partner-management/documents/{$document->id}/review", ['status' => 'verified'])->assertSessionHasNoErrors();
        $this->actingAs($reviewer)->post("/partner-management/applications/{$application->id}/approve")->assertSessionHasNoErrors();
        $this->assertSame('approved', $application->fresh()->status);
        $this->assertSame('active', $partner->fresh()->status);
    }

    public function test_partner_can_only_download_its_own_private_documents(): void
    {
        Storage::fake('local');
        $owner = User::create(['name' => 'Owner', 'email' => 'first@example.test', 'password' => 'password', 'role' => 'partner']);
        $other = User::create(['name' => 'Other', 'email' => 'other@example.test', 'password' => 'password', 'role' => 'partner']);
        $owner->forceFill(['email_verified_at' => now()])->save();
        $other->forceFill(['email_verified_at' => now()])->save();
        $partner = Partner::create(['registered_name' => 'First Ltd']);
        $otherPartner = Partner::create(['registered_name' => 'Other Ltd']);
        $partner->users()->attach($owner->id, ['role' => 'owner']);
        $otherPartner->users()->attach($other->id, ['role' => 'owner']);
        $application = PartnerApplication::create(['partner_id' => $partner->id]);
        $document = PartnerDocument::create([
            'partner_id' => $partner->id, 'partner_application_id' => $application->id,
            'uploaded_by' => $owner->id, 'document_type' => 'license', 'original_filename' => 'license.pdf',
            'storage_path' => 'partners/private/license.pdf', 'mime_type' => 'application/pdf', 'file_size' => 10,
        ]);
        Storage::disk('local')->put('partners/private/license.pdf', 'private contents');

        $this->actingAs($other)->get("/partner/documents/{$document->id}")->assertNotFound();
        $this->actingAs($owner)->get("/partner/documents/{$document->id}")->assertOk();
    }

    public function test_partner_can_replace_a_requested_document_and_resubmit_a_new_revision(): void
    {
        Storage::fake('local');
        $user = User::create(['name' => 'Owner', 'email' => 'revision@example.test', 'password' => 'password', 'role' => 'partner']);
        $user->forceFill(['email_verified_at' => now()])->save();
        $category = PartnerCategory::create(['name' => 'Workshop', 'slug' => 'workshop']);
        $partner = Partner::create([
            'registered_name' => 'Revision Workshop Ltd', 'registration_number' => 'REG-2', 'tin_number' => 'TIN-2',
            'partner_category_id' => $category->id, 'business_description' => 'Motorcycle repair services',
        ]);
        $partner->users()->attach($user->id, ['role' => 'owner']);
        $application = PartnerApplication::create(['partner_id' => $partner->id, 'status' => 'action_required', 'version' => 1]);
        PartnerApplicationStatusHistory::create([
            'partner_application_id' => $application->id,
            'previous_status' => 'under_review', 'new_status' => 'action_required', 'comment' => 'Upload a clearer business license.',
        ]);
        $location = PartnerLocation::create(['partner_id' => $partner->id, 'region' => 'Dar es Salaam', 'district' => 'Ilala', 'physical_address' => '8 Workshop Road']);
        ProposedPartnerBenefit::create([
            'partner_id' => $partner->id, 'partner_application_id' => $application->id, 'partner_location_id' => $location->id,
            'name' => 'Labour discount', 'description' => 'Discount on labour', 'benefit_type' => 'percentage_discount', 'discount_percentage' => 10,
            'status' => 'pending_review',
        ]);
        DocumentRequirement::create(['document_type' => 'license', 'label' => 'Business license', 'is_required' => true]);
        $oldDocument = PartnerDocument::create([
            'partner_id' => $partner->id, 'partner_application_id' => $application->id, 'uploaded_by' => $user->id,
            'document_type' => 'license', 'original_filename' => 'old-license.pdf', 'storage_path' => 'partners/old.pdf',
            'mime_type' => 'application/pdf', 'file_size' => 20, 'status' => 'replacement_required', 'review_comments' => 'Upload a clearer copy.',
        ]);

        $this->actingAs($user)->post('/partner/onboarding/documents', [
            'document_type' => 'license', 'file' => UploadedFile::fake()->create('new-license.pdf', 30, 'application/pdf'),
        ])->assertSessionHasNoErrors();
        $this->actingAs($user)->post('/partner/onboarding/submit')->assertSessionHasNoErrors();

        $this->assertSame('submitted', $application->fresh()->status);
        $this->assertSame(2, $application->fresh()->version);
        $this->assertNotNull($oldDocument->fresh()->superseded_at);
        $this->assertSame(1, $partner->documents()->whereNull('superseded_at')->count());
    }
}
