<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\SuperAdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SuperAdminAccountTest extends TestCase
{
    use RefreshDatabase;

    private const EMAILS = ['james@ravu.com', 'lusinde@ravu.com', 'nyindo@ravu.com', 'evance@ravu.com'];

    private function admin(array $attributes = []): User
    {
        return User::factory()->create([
            'role' => 'super_admin',
            'email' => 'james@ravu.com',
            'password' => 'OneTimePass1234',
            'email_verified_at' => now(),
            ...$attributes,
        ]);
    }

    public function test_seeder_creates_verified_super_admins_that_must_change_their_password(): void
    {
        $this->seed(SuperAdminSeeder::class);

        foreach (self::EMAILS as $email) {
            $user = User::firstWhere('email', $email);
            $this->assertNotNull($user, "{$email} was not seeded");
            $this->assertTrue($user->isSuperAdmin());
            $this->assertNotNull($user->email_verified_at);
            $this->assertTrue($user->password_change_required);
        }
    }

    public function test_reseeding_keeps_existing_passwords(): void
    {
        $this->seed(SuperAdminSeeder::class);
        $james = User::firstWhere('email', 'james@ravu.com');
        $james->forceFill(['password' => 'MyOwnPassword123', 'password_change_required' => false])->save();

        $this->seed(SuperAdminSeeder::class);

        $james->refresh();
        $this->assertTrue(Hash::check('MyOwnPassword123', $james->password));
        $this->assertFalse($james->password_change_required);
        $this->assertSame(4, User::where('role', 'super_admin')->count());
    }

    public function test_local_seeding_gives_every_admin_the_known_password(): void
    {
        User::factory()->create(['email' => 'james@ravu.com', 'role' => 'super_admin', 'password' => 'Forgotten123']);
        $this->app['env'] = 'local';

        $this->seed(SuperAdminSeeder::class);

        foreach (self::EMAILS as $email) {
            $user = User::firstWhere('email', $email);
            $this->assertTrue(Hash::check(SuperAdminSeeder::LOCAL_PASSWORD, $user->password), "{$email} has the wrong password");
            $this->assertFalse($user->password_change_required);
            $this->assertTrue($user->isSuperAdmin());
        }
    }

    public function test_admin_on_one_time_password_is_held_on_the_account_screen(): void
    {
        $this->admin(['password_change_required' => true]);

        $this->post('/login', ['email' => 'james@ravu.com', 'password' => 'OneTimePass1234'])
            ->assertRedirect('/super-admin');

        $this->get('/super-admin')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.password_change_required', true));
        $this->put('/super-admin/content/home', ['content' => []])
            ->assertRedirect('/super-admin?section=account');
        $this->get('/partner-management')->assertRedirect('/super-admin?section=account');
    }

    public function test_admin_can_change_password_and_sign_in_with_it(): void
    {
        $admin = $this->admin(['password_change_required' => true]);

        $this->actingAs($admin)->put('/super-admin/account/password', [
            'current_password' => 'OneTimePass1234',
            'password' => 'BrandNewPass2026',
            'password_confirmation' => 'BrandNewPass2026',
        ])->assertRedirect('/super-admin?section=account')->assertSessionHasNoErrors();

        $admin->refresh();
        $this->assertFalse($admin->password_change_required);
        $this->assertTrue(Hash::check('BrandNewPass2026', $admin->password));

        $this->post('/logout');
        $this->post('/login', ['email' => 'james@ravu.com', 'password' => 'BrandNewPass2026'])
            ->assertRedirect('/super-admin');
    }

    public function test_password_change_requires_the_current_password_and_a_strong_new_one(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->put('/super-admin/account/password', [
            'current_password' => 'wrong-password',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])->assertSessionHasErrors(['current_password', 'password']);

        $this->assertTrue(Hash::check('OneTimePass1234', $admin->fresh()->password));
    }

    public function test_admin_can_change_name_and_email_with_current_password(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->patch('/super-admin/account', [
            'name' => 'James Samuel',
            'email' => 'James.Samuel@Ravu.com',
        ])->assertSessionHasErrors('current_password');

        $this->actingAs($admin)->patch('/super-admin/account', [
            'name' => 'James Samuel',
            'email' => 'James.Samuel@Ravu.com',
            'current_password' => 'OneTimePass1234',
        ])->assertSessionHasNoErrors();

        $admin->refresh();
        $this->assertSame('James Samuel', $admin->name);
        $this->assertSame('james.samuel@ravu.com', $admin->email);
    }

    public function test_email_must_stay_unique(): void
    {
        $admin = $this->admin();
        User::factory()->create(['email' => 'lusinde@ravu.com']);

        $this->actingAs($admin)->patch('/super-admin/account', [
            'name' => 'James',
            'email' => 'lusinde@ravu.com',
            'current_password' => 'OneTimePass1234',
        ])->assertSessionHasErrors('email');
    }
}
