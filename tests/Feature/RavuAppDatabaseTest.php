<?php

namespace Tests\Feature;

use App\Contracts\MemberDirectory;
use App\Contracts\MembershipRevenueSource;
use App\Models\Partner;
use App\Models\PartnerApplication;
use App\Models\PartnerLocation;
use App\Models\ProposedPartnerBenefit;
use App\Models\User;
use App\Services\Members\DatabaseMemberDirectory;
use App\Services\Membership\DatabaseMembershipRevenueSource;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * The website reading the RAVU app's database (ravu-api). The tables below copy the
 * app's column names for everything the website reads.
 */
class RavuAppDatabaseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-11-20 12:00:00');
        config([
            'database.connections.ravu_api' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => ''],
            'membership.revenue_source' => 'database',
            'membership.member_source' => 'database',
            'membership.database.include_simulated' => false,
            'partner.payout_pool_percent' => 30,
        ]);
        DB::purge('ravu_api');
        $this->appSchema();
        $this->appData();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function appSchema(): void
    {
        $s = Schema::connection('ravu_api');
        $s->create('users', function (Blueprint $t) {
            $t->id(); $t->string('name'); $t->string('phone', 16)->nullable(); $t->timestamp('phone_verified_at')->nullable();
            $t->string('role')->default('rider'); $t->string('status')->default('active'); $t->timestamps();
        });
        $s->create('membership_plans', function (Blueprint $t) {
            $t->id(); $t->string('code', 20); $t->string('name', 80); $t->unsignedBigInteger('annual_amount'); $t->boolean('active')->default(true); $t->timestamps();
        });
        $s->create('payments', function (Blueprint $t) {
            $t->id(); $t->foreignId('user_id'); $t->foreignId('membership_plan_id'); $t->string('reference', 40); $t->string('provider')->default('azampesa');
            $t->string('status'); $t->unsignedBigInteger('amount'); $t->timestamp('settled_at')->nullable();
            $t->timestamp('membership_starts_at')->nullable(); $t->timestamp('membership_ends_at')->nullable(); $t->boolean('simulated')->default(false); $t->timestamps();
        });
        $s->create('memberships', function (Blueprint $t) {
            $t->id(); $t->foreignId('user_id'); $t->foreignId('membership_plan_id'); $t->foreignId('payment_id');
            $t->timestamp('starts_at'); $t->timestamp('ends_at'); $t->string('status')->default('active'); $t->timestamps();
        });
        $s->create('driver_profiles', function (Blueprint $t) {
            $t->id(); $t->foreignId('user_id'); $t->string('vehicle_type')->nullable(); $t->string('vehicle_plate', 30)->nullable(); $t->timestamps();
        });
        $s->create('member_passes', function (Blueprint $t) {
            $t->id(); $t->foreignId('user_id'); $t->foreignId('partner_offer_id'); $t->string('code', 40); $t->timestamp('expires_at'); $t->timestamps();
        });
    }

    /**
     * Drivers (API stores UTC):
     *   2 Hamisi  PRO, renewed: first year Oct 2025, renewal paid 2 Oct 2026 → active
     *   3 Neema   BASIC, paid 5 Oct 2026 → active (also holds an app pass)
     *   4 Rehema  ELITE, account suspended
     *   5 Zawadi  BASIC, phone never verified
     *   6 Asha    BASIC, ended 1 Nov 2026 without renewing → expired
     *   7 Rider   a rider, not a paying member
     * October payments: Hamisi 350,000 + Neema 200,000 settled; one failed; one queued;
     * one simulated test payment (excluded) → October income TSh 550,000.
     */
    private function appData(): void
    {
        $db = DB::connection('ravu_api');
        $db->table('membership_plans')->insert([
            ['id' => 1, 'code' => 'BASIC', 'name' => 'Basic', 'annual_amount' => 200000],
            ['id' => 2, 'code' => 'PRO', 'name' => 'Pro', 'annual_amount' => 350000],
            ['id' => 3, 'code' => 'ELITE', 'name' => 'Elite', 'annual_amount' => 450000],
        ]);
        $db->table('users')->insert([
            ['id' => 1, 'name' => 'Staff', 'phone' => '+255700000001', 'phone_verified_at' => '2025-01-01', 'role' => 'administrator', 'status' => 'active'],
            ['id' => 2, 'name' => 'Hamisi Mrisho', 'phone' => '+255712345678', 'phone_verified_at' => '2025-10-01', 'role' => 'driver', 'status' => 'active'],
            ['id' => 3, 'name' => 'Neema Kileo', 'phone' => '+255754000111', 'phone_verified_at' => '2026-10-01', 'role' => 'driver', 'status' => 'active'],
            ['id' => 4, 'name' => 'Rehema Mushi', 'phone' => '+255765000222', 'phone_verified_at' => '2026-01-01', 'role' => 'driver', 'status' => 'suspended'],
            ['id' => 5, 'name' => 'Zawadi Swai', 'phone' => '+255776000333', 'phone_verified_at' => null, 'role' => 'driver', 'status' => 'active'],
            ['id' => 6, 'name' => 'Asha Njau', 'phone' => '+255787000444', 'phone_verified_at' => '2025-11-01', 'role' => 'driver', 'status' => 'active'],
            ['id' => 7, 'name' => 'Rider', 'phone' => '+255798000555', 'phone_verified_at' => '2026-01-01', 'role' => 'rider', 'status' => 'active'],
        ]);
        $pay = fn ($id, $user, $plan, $amount, $status, $settled, $start = null, $end = null, $sim = false) => compact('id', 'status', 'amount') + [
            'user_id' => $user, 'membership_plan_id' => $plan, 'reference' => "PAY-{$id}", 'settled_at' => $settled,
            'membership_starts_at' => $start, 'membership_ends_at' => $end, 'simulated' => $sim,
            'created_at' => $settled ?? '2026-10-20 08:00:00', 'updated_at' => $settled ?? '2026-10-20 08:00:00',
        ];
        $db->table('payments')->insert([
            $pay(1, 2, 2, 350000, 'settled', '2025-10-02 07:00:00', '2025-10-02 07:00:00', '2026-10-02 07:00:00'),
            $pay(2, 2, 2, 350000, 'settled', '2026-10-02 07:00:00', '2026-10-02 07:00:00', '2027-10-02 07:00:00'),
            $pay(3, 3, 1, 200000, 'settled', '2026-10-05 07:00:00', '2026-10-05 07:00:00', '2027-10-05 07:00:00'),
            $pay(4, 4, 3, 450000, 'settled', '2026-01-10 07:00:00', '2026-01-10 07:00:00', '2027-01-10 07:00:00'),
            $pay(5, 5, 1, 200000, 'settled', '2026-03-01 07:00:00', '2026-03-01 07:00:00', '2027-03-01 07:00:00'),
            $pay(6, 6, 1, 200000, 'settled', '2025-11-01 07:00:00', '2025-11-01 07:00:00', '2026-11-01 07:00:00'),
            $pay(7, 6, 1, 200000, 'failed', null),
            $pay(8, 3, 1, 200000, 'queued', null),
            $pay(9, 3, 1, 200000, 'settled', '2026-10-06 07:00:00', null, null, true),
        ]);
        $member = fn ($user, $plan, $payment, $start, $end, $status = 'active') => ['user_id' => $user, 'membership_plan_id' => $plan, 'payment_id' => $payment,
            'starts_at' => $start, 'ends_at' => $end, 'status' => $status, 'created_at' => $start, 'updated_at' => $start];
        $db->table('memberships')->insert([
            $member(2, 2, 2, '2026-10-02 07:00:00', '2027-10-02 07:00:00'),
            $member(3, 1, 3, '2026-10-05 07:00:00', '2027-10-05 07:00:00'),
            $member(4, 3, 4, '2026-01-10 07:00:00', '2027-01-10 07:00:00'),
            $member(5, 1, 5, '2026-03-01 07:00:00', '2027-03-01 07:00:00'),
            $member(6, 1, 6, '2025-11-01 07:00:00', '2026-11-01 07:00:00'),
        ]);
        $db->table('driver_profiles')->insert([
            ['user_id' => 2, 'vehicle_type' => 'motorcycle', 'vehicle_plate' => 'MC 123 ABC'],
            ['user_id' => 3, 'vehicle_type' => 'tuktuk', 'vehicle_plate' => 'MC 456 DEF'],
        ]);
        $db->table('member_passes')->insert([
            ['user_id' => 3, 'partner_offer_id' => 1, 'code' => 'RVU-AbCdEfGhIjKlMnOpQrSt', 'expires_at' => '2026-11-20 12:10:00'],
            ['user_id' => 3, 'partner_offer_id' => 1, 'code' => 'RVU-ExpiredPassExpiredP', 'expires_at' => '2026-11-20 11:50:00'],
        ]);
    }

    private function approvedPartner(string $name): array
    {
        $user = User::factory()->create(['role' => 'partner', 'email_verified_at' => now()]);
        $partner = Partner::create(['registered_name' => $name, 'trading_name' => $name, 'status' => 'active']);
        $partner->users()->attach($user, ['role' => 'owner']);
        $application = PartnerApplication::create(['partner_id' => $partner->id, 'status' => 'approved', 'approved_at' => now()]);
        $location = PartnerLocation::create(['partner_id' => $partner->id, 'region' => 'Dar es Salaam', 'district' => 'Ilala', 'physical_address' => 'Kariakoo', 'is_primary' => true]);
        ProposedPartnerBenefit::create([
            'partner_id' => $partner->id, 'partner_application_id' => $application->id, 'partner_location_id' => $location->id,
            'name' => '10% off', 'description' => 'Member discount', 'benefit_type' => 'percentage_discount',
            'discount_percentage' => 10, 'status' => 'approved', 'approved_at' => now(),
        ]);

        return [$user, $partner];
    }

    public function test_config_selects_the_app_database(): void
    {
        $this->assertInstanceOf(DatabaseMembershipRevenueSource::class, app(MembershipRevenueSource::class));
        $this->assertInstanceOf(DatabaseMemberDirectory::class, app(MemberDirectory::class));
    }

    public function test_members_are_found_by_number_phone_or_app_pass_with_the_apps_eligibility_rule(): void
    {
        $directory = app(MemberDirectory::class);

        $hamisi = $directory->find('RAVU-00002');
        $this->assertSame('active', $hamisi['status']);
        $this->assertSame('PRO', $hamisi['plan_id']);
        $this->assertSame('Motorcycle (boda boda)', $hamisi['vehicle_category']);
        $this->assertSame('MC 123 ABC', $hamisi['plate_number']);
        $this->assertSame('+255 7•• ••• 678', $hamisi['phone_masked']);
        $this->assertStringStartsWith('2025-10-02', $hamisi['member_since']); // first paid year, not the renewal
        $this->assertStringStartsWith('2027-10-02', $hamisi['valid_until']);

        foreach (['ravu:member:RAVU-00002', 'ravu-2', '0712 345 678', '+255712345678', '255712345678', '712345678'] as $query) {
            $this->assertSame('RAVU-00002', $directory->find($query)['member_ref'] ?? null, $query);
        }
        $this->assertSame('RAVU-00003', $directory->find('RVU-AbCdEfGhIjKlMnOpQrSt')['member_ref']);
        $this->assertSame('Bajaj', $directory->find('RVU-AbCdEfGhIjKlMnOpQrSt')['vehicle_category']);

        $this->assertNull($directory->find('RVU-ExpiredPassExpiredP'));
        $this->assertSame('suspended', $directory->find('RAVU-00004')['status']);
        $this->assertSame('suspended', $directory->find('RAVU-00005')['status'], 'unverified phone');
        $this->assertSame('expired', $directory->find('RAVU-00006')['status']);
        $this->assertNull($directory->find('RAVU-00001'), 'staff are not members');
        $this->assertNull($directory->find('RAVU-00007'), 'riders are not paying members');
        $this->assertNull($directory->find('RAVU-99999'));
        $this->assertNull($directory->find('not a member'));
    }

    public function test_revenue_source_maps_plans_memberships_and_payments(): void
    {
        $source = app(MembershipRevenueSource::class);
        $this->assertFalse($source->isDemo());
        $this->assertSame(['BASIC', 'PRO', 'ELITE'], array_column($source->plans(), 'id'));
        $this->assertSame('year', $source->plans()[0]['interval']);

        $subs = collect($source->subscriptions(Carbon::parse('2026-01-01')))->keyBy('member_ref');
        $this->assertCount(5, $subs);
        $this->assertStringStartsWith('2025-10-02', $subs['RAVU-00002']['started_at']);
        $this->assertNull($subs['RAVU-00002']['cancelled_at']);
        $this->assertStringStartsWith('2026-11-01', $subs['RAVU-00006']['cancelled_at']);

        $october = collect($source->payments(Carbon::parse('2026-10-01'), Carbon::parse('2026-10-31 23:59:59')));
        $this->assertSame(['PAY-2', 'PAY-3', 'PAY-7'], $october->pluck('id')->all()); // queued + simulated left out
        $this->assertSame(550000, $october->where('status', 'paid')->sum('amount'));
        $this->assertSame('failed', $october->firstWhere('id', 'PAY-7')['status']);
        $this->assertSame('AzamPesa', $october->first()['method']);
        $this->assertSame('RAVU-00002', $october->first()['subscription_id']);

        config(['membership.database.include_simulated' => true]);
        $this->assertCount(4, app(MembershipRevenueSource::class)->payments(Carbon::parse('2026-10-01'), Carbon::parse('2026-10-31 23:59:59')));
    }

    public function test_partner_serves_a_real_app_member_and_it_feeds_the_payout_pool(): void
    {
        [$user, $partner] = $this->approvedPartner('Kariakoo Garage');

        $this->actingAs($user)->get('/partner-dashboard')->assertInertia(fn (Assert $page) => $page
            ->where('serving.demo_members', false)->where('serving.sample_members', []));

        $this->postJson('/partner/members/verify', ['query' => '0712345678'])
            ->assertOk()->assertJsonPath('eligible', true)
            ->assertJsonPath('member.member_ref', 'RAVU-00002')->assertJsonPath('member.plan_name', 'Pro');
        $this->postJson('/partner/members/verify', ['query' => 'RAVU-00006'])
            ->assertOk()->assertJsonPath('eligible', false)->assertJsonPath('reason', 'expired');
        $this->postJson('/partner/members/verify', ['query' => 'RAVU-00004'])
            ->assertOk()->assertJsonPath('reason', 'suspended');

        Carbon::setTestNow('2026-10-20 12:00:00');
        $this->postJson('/partner/redemptions', ['member_ref' => 'RAVU-00002', 'bill_amount' => 45000, 'description' => 'Service'])
            ->assertCreated()->assertJsonPath('redemption.discount', 4500)->assertJsonPath('redemption.paid', 40500);
        $this->assertSame('Hamisi M.', $partner->redemptions()->first()->member_name);

        // October income 550,000 × 30% = 165,000; the only partner that served members gets all of it.
        Carbon::setTestNow('2026-11-20 12:00:00');
        $admin = User::factory()->create(['role' => 'super_admin', 'email_verified_at' => now()]);
        $this->actingAs($admin)->get('/super-admin?section=payouts&period=2026-10')->assertInertia(fn (Assert $page) => $page
            ->where('payouts.summary.revenue', 550000)
            ->where('payouts.summary.pool', 165000)
            ->where('payouts.partners.0.name', 'Kariakoo Garage')
            ->where('payouts.partners.0.amount', 165000));
    }

    public function test_an_unreachable_app_database_shows_a_friendly_message(): void
    {
        config(['database.connections.ravu_api' => ['driver' => 'sqlite', 'database' => '/nonexistent/ravu.sqlite', 'prefix' => '']]);
        DB::purge('ravu_api');
        [$user] = $this->approvedPartner('Offline Garage');

        $this->actingAs($user)->postJson('/partner/members/verify', ['query' => 'RAVU-00002'])
            ->assertStatus(503)->assertJsonPath('reason', 'unavailable');
    }
}
