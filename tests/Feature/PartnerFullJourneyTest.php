<?php

namespace Tests\Feature;

use App\Models\DocumentRequirement;
use App\Models\Partner;
use App\Models\PartnerCategory;
use App\Models\PartnerDocument;
use App\Models\ProposedPartnerBenefit;
use App\Models\User;
use Database\Seeders\PartnerCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PartnerFullJourneyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PartnerCategorySeeder::class);
    }

    public function test_complete_partner_registration_login_and_onboarding_lifecycle(): void
    {
        Storage::fake('partner-documents');

        // 1. Visit registration page
        $registerPageResponse = $this->get('/register');
        $registerPageResponse->assertOk();
        $registerPageResponse->assertInertia(fn ($page) => $page
            ->component('Website/Register')
            ->has('categories')
            ->has('policyLinks')
        );

        $category = PartnerCategory::where('slug', 'motorcycle-workshops')->firstOrFail();

        // 2. Submit partner registration
        $registrationData = [
            'business_name' => 'Kijitonyama Auto Garage & Spares Ltd',
            'category_id' => $category->id,
            'name' => 'Juma Rashidi',
            'position' => 'Managing Director',
            'email' => 'juma@kijitonyama-garage.tz',
            'phone' => '+255712345678',
            'preferred_communication' => 'whatsapp',
            'password' => 'Tanzania2026!Pass',
            'password_confirmation' => 'Tanzania2026!Pass',
            'terms' => '1',
            'privacy' => '1',
        ];

        $registerSubmitResponse = $this->post('/register', $registrationData);

        // Expect immediate redirect into the Partner Portal
        $registerSubmitResponse->assertRedirect('/partner-dashboard');
        $this->assertAuthenticated();

        /** @var User $user */
        $user = User::where('email', 'juma@kijitonyama-garage.tz')->firstOrFail();
        $this->assertSame('partner', $user->role);
        $this->assertSame('Juma Rashidi', $user->name);

        $partner = $user->primaryPartner();
        $this->assertNotNull($partner);
        $this->assertSame('Kijitonyama Auto Garage & Spares Ltd', $partner->registered_name);
        $this->assertSame($category->id, $partner->partner_category_id);
        $this->assertSame('draft', $partner->application->status);

        // 3. Access Partner Portal Dashboard
        $dashboardResponse = $this->get('/partner-dashboard');
        $dashboardResponse->assertOk();
        $dashboardResponse->assertInertia(fn ($page) => $page
            ->component('Website/PartnerDashboard')
            ->has('partner')
            ->has('application')
            ->has('categories')
            ->has('requirements')
            ->where('partner.registered_name', 'Kijitonyama Auto Garage & Spares Ltd')
            ->where('application.status', 'draft')
        );

        // 4. Complete Step 1: Save Business Profile Details (TIN, BRELA, description)
        $businessProfileData = [
            'registered_name' => 'Kijitonyama Auto Garage & Spares Ltd',
            'trading_name' => 'Kijitonyama Garage',
            'registration_number' => 'BRELA-984210',
            'tin_number' => '142-990-128',
            'partner_category_id' => $category->id,
            'year_established' => 2018,
            'website' => 'https://kijitonyama-garage.co.tz',
            'business_description' => 'Full motorcycle and Bajaj diagnostics, engine overhaul, suspension, brakes, genuine spare parts and oil changes.',
        ];

        $saveBusinessResponse = $this->patch('/partner/onboarding/business', $businessProfileData);
        $saveBusinessResponse->assertRedirect();
        $partner->refresh();
        $this->assertSame('142-990-128', $partner->tin_number);
        $this->assertSame('BRELA-984210', $partner->registration_number);

        // 5. Complete Step 2: Attach Documents (TRA TIN Certificate and Business License)
        $tinFile = UploadedFile::fake()->create('TRA_TIN_Certificate.pdf', 500, 'application/pdf');
        $uploadTinResponse = $this->post('/partner/onboarding/documents', [
            'document_type' => 'tin_certificate',
            'file' => $tinFile,
        ]);
        $uploadTinResponse->assertRedirect();
        $this->assertDatabaseHas('partner_documents', [
            'partner_id' => $partner->id,
            'document_type' => 'tin_certificate',
            'original_filename' => 'TRA_TIN_Certificate.pdf',
        ]);

        $licenseFile = UploadedFile::fake()->create('Kinondoni_Business_License.pdf', 600, 'application/pdf');
        $uploadLicenseResponse = $this->post('/partner/onboarding/documents', [
            'document_type' => 'business_license',
            'file' => $licenseFile,
            'expires_at' => now()->addYear()->toDateString(),
        ]);
        $uploadLicenseResponse->assertRedirect();
        $this->assertDatabaseHas('partner_documents', [
            'partner_id' => $partner->id,
            'document_type' => 'business_license',
            'original_filename' => 'Kinondoni_Business_License.pdf',
        ]);

        $brelaFile = UploadedFile::fake()->create('BRELA_Certificate.pdf', 400, 'application/pdf');
        $uploadBrelaResponse = $this->post('/partner/onboarding/documents', [
            'document_type' => 'business_registration_certificate',
            'file' => $brelaFile,
        ]);
        $uploadBrelaResponse->assertRedirect();
        $this->assertDatabaseHas('partner_documents', [
            'partner_id' => $partner->id,
            'document_type' => 'business_registration_certificate',
            'original_filename' => 'BRELA_Certificate.pdf',
        ]);

        // 6. Complete Step 3: Location Details & Landmarks
        $locationData = [
            'country' => 'Tanzania',
            'region' => 'Dar es Salaam',
            'district' => 'Kinondoni',
            'ward' => 'Kijitonyama',
            'physical_address' => 'Plot 12 Ali Hassan Mwinyi Rd, Kijitonyama',
            'business_phone' => '+255712345678',
            'operating_hours' => ['notes' => 'Opposite Makumbusho Bus Terminal, Mon-Sat 8am-6pm'],
        ];

        $saveLocationResponse = $this->patch('/partner/onboarding/location', $locationData);
        $saveLocationResponse->assertRedirect();
        $this->assertDatabaseHas('partner_locations', [
            'partner_id' => $partner->id,
            'district' => 'Kinondoni',
            'physical_address' => 'Plot 12 Ali Hassan Mwinyi Rd, Kijitonyama',
        ]);

        // 7. Complete Step 4: RAVU Member Discount Proposal
        $discountData = [
            'name' => 'RAVU Rider & Driver Maintenance Discount',
            'description' => '15% discount on all spare parts and workshop labor for active RAVU members.',
            'benefit_type' => 'percentage_discount',
            'discount_percentage' => '15.00',
            'currency' => 'TZS',
            'products_or_services' => 'Motorcycle spare parts (Boxer, TVS, Haojue), 4T engine oils, brake servicing and diagnostics',
            'terms_and_conditions' => 'Must show digital RAVU ID in app at checkout',
            'redemption_instructions' => 'Cashier scans member QR code or verifies digital ID card in app',
        ];

        $saveBenefitResponse = $this->post('/partner/onboarding/benefit', $discountData);
        $saveBenefitResponse->assertRedirect();
        $this->assertDatabaseHas('proposed_partner_benefits', [
            'partner_id' => $partner->id,
            'benefit_type' => 'percentage_discount',
            'discount_percentage' => 15.00,
        ]);

        // 8. Complete Step 5: Submit Application to RAVU Reviewers
        $submitAppResponse = $this->post('/partner/onboarding/submit');
        $submitAppResponse->assertRedirect();
        $partner->application->refresh();
        $this->assertSame('submitted', $partner->application->status);
        $this->assertNotNull($partner->application->submitted_at);

        // 9. Sign Out
        $logoutResponse = $this->post('/logout');
        $logoutResponse->assertRedirect('/login');
        $this->assertGuest();

        // 10. Login with newly created Partner Credentials
        $loginResponse = $this->post('/login', [
            'email' => 'juma@kijitonyama-garage.tz',
            'password' => 'Tanzania2026!Pass',
        ]);

        // Expect direct redirect to Partner Dashboard
        $loginResponse->assertRedirect('/partner-dashboard');
        $this->assertAuthenticatedAs($user);

        // Verify the dashboard loads successfully with all submitted details
        $finalDashboardResponse = $this->get('/partner-dashboard');
        $finalDashboardResponse->assertOk();
        $finalDashboardResponse->assertInertia(fn ($page) => $page
            ->component('Website/PartnerDashboard')
            ->where('partner.registered_name', 'Kijitonyama Auto Garage & Spares Ltd')
            ->where('partner.tin_number', '142-990-128')
            ->where('application.status', 'submitted')
            ->where('benefit.discount_percentage', '15.00')
        );
    }
}
