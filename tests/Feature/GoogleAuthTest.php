<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Partner;
use App\Models\PartnerApplication;
use App\Support\LoginProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.google.client_id' => 'test-client-id.apps.googleusercontent.com',
            'services.google.client_secret' => 'test-secret',
            'services.google.redirect' => '/auth/google/callback',
            'app.url' => 'http://127.0.0.1:8000',
        ]);
    }

    private function partner(array $attrs = []): User
    {
        $user = User::create(array_merge([
            'name' => 'Chid (TotalEnergies Partner)',
            'email' => 'chid@total.com',
            'password' => 'password',
            'role' => 'partner',
            'email_verified_at' => now(),
        ], $attrs));
        $user->forceFill(['email_verified_at' => now()])->save();
        if ($user->role === 'partner') {
            $partner = Partner::create(['registered_name' => 'TotalEnergies Limited']);
            $partner->users()->attach($user->id, ['role' => 'owner']);
            PartnerApplication::create(['partner_id' => $partner->id]);
        }

        return $user;
    }

    private function fakeGoogle(array $profile = [], int $tokenStatus = 200): void
    {
        Http::fake([
            'oauth2.googleapis.com/token' => Http::response(
                $tokenStatus === 200 ? ['access_token' => 'fake-access-token', 'token_type' => 'Bearer'] : ['error' => 'invalid_grant'],
                $tokenStatus,
            ),
            'openidconnect.googleapis.com/v1/userinfo' => Http::response(array_merge([
                'sub' => '1098765432101234567890',
                'email' => 'chid@total.com',
                'email_verified' => true,
                'name' => 'Chid Google',
                'picture' => 'https://lh3.googleusercontent.com/a/chid-photo',
            ], $profile)),
        ]);
    }

    private function googleCallback(array $query = [])
    {
        return $this->withSession(['google_oauth_state' => 'expected-state'])
            ->get('http://127.0.0.1:8000/auth/google/callback?'.http_build_query(array_merge([
                'state' => 'expected-state',
                'code' => 'auth-code-123',
            ], $query)));
    }

    // ------------------------------------------------------------------
    // Redirect to Google
    // ------------------------------------------------------------------

    public function test_redirect_sends_exact_callback_uri_for_127_0_0_1(): void
    {
        $response = $this->get('http://127.0.0.1:8000/auth/google/redirect');

        $response->assertRedirect();
        $location = $response->headers->get('Location');
        $this->assertStringStartsWith('https://accounts.google.com/o/oauth2/v2/auth?', $location);

        parse_str(parse_url($location, PHP_URL_QUERY), $q);
        $this->assertSame('http://127.0.0.1:8000/auth/google/callback', $q['redirect_uri']);
        $this->assertSame('test-client-id.apps.googleusercontent.com', $q['client_id']);
        $this->assertSame('code', $q['response_type']);
        $this->assertSame('openid email profile', $q['scope']);
        $this->assertSame('select_account', $q['prompt']);
        $this->assertSame(session('google_oauth_state'), $q['state']);
        $this->assertSame(40, strlen($q['state']));
    }

    public function test_sign_in_started_on_another_host_moves_to_app_url_first(): void
    {
        config(['app.url' => 'http://localhost:8000']);

        // Opened on 127.0.0.1: hop to the APP_URL host before talking to Google…
        $this->get('http://127.0.0.1:8000/auth/google/redirect?login_hint=chid%40total.com')
            ->assertRedirect('http://localhost:8000/auth/google/redirect?login_hint=chid%40total.com');

        // …where the callback sent to Google is the registered APP_URL one.
        $location = $this->get('http://localhost:8000/auth/google/redirect')->headers->get('Location');
        parse_str(parse_url($location, PHP_URL_QUERY), $q);
        $this->assertSame('http://localhost:8000/auth/google/callback', $q['redirect_uri']);
    }

    public function test_an_absolute_redirect_uri_is_used_exactly(): void
    {
        config(['services.google.redirect' => 'https://ravu.co.tz/auth/google/callback', 'app.url' => 'https://ravu.co.tz']);

        $location = $this->get('https://ravu.co.tz/auth/google/redirect')->headers->get('Location');
        parse_str(parse_url($location, PHP_URL_QUERY), $q);
        $this->assertSame('https://ravu.co.tz/auth/google/callback', $q['redirect_uri']);
    }

    public function test_redirect_uses_remembered_profile_as_login_hint(): void
    {
        $location = $this->withCookie(LoginProfile::COOKIE, json_encode([
            'name' => 'Chid', 'email' => 'chid@total.com', 'provider' => 'google',
        ]))->get('http://127.0.0.1:8000/auth/google/redirect')->headers->get('Location');

        parse_str(parse_url($location, PHP_URL_QUERY), $q);
        $this->assertSame('chid@total.com', $q['login_hint']);
        $this->assertArrayNotHasKey('prompt', $q);
    }

    public function test_redirect_without_credentials_falls_back_to_login(): void
    {
        config(['services.google.client_secret' => null]);

        $this->get('/auth/google/redirect')
            ->assertRedirect('/login')
            ->assertSessionHasErrors('email');
    }

    // ------------------------------------------------------------------
    // Callback from Google
    // ------------------------------------------------------------------

    public function test_partner_signs_in_links_google_and_captures_profile(): void
    {
        $user = $this->partner();
        $this->fakeGoogle();

        $response = $this->googleCallback();

        $response->assertRedirect('/partner-dashboard');
        $this->assertAuthenticatedAs($user);

        $user->refresh();
        $this->assertSame('1098765432101234567890', $user->google_id);
        $this->assertSame('https://lh3.googleusercontent.com/a/chid-photo', $user->avatar);
        $this->assertSame('google', $user->last_login_provider);
        $this->assertNotNull($user->last_login_at);

        $response->assertCookie(LoginProfile::COOKIE);

        // Code was exchanged against the same callback URI that was sent to Google.
        Http::assertSent(fn ($req) => $req->url() === 'https://oauth2.googleapis.com/token'
            && $req['redirect_uri'] === 'http://127.0.0.1:8000/auth/google/callback'
            && $req['code'] === 'auth-code-123'
            && $req['grant_type'] === 'authorization_code');
    }

    public function test_super_admin_is_sent_to_super_admin_dashboard(): void
    {
        $admin = $this->partner(['name' => 'Jux', 'email' => 'jux@ravu.com', 'role' => 'super_admin']);
        $this->fakeGoogle(['email' => 'jux@ravu.com', 'sub' => 'admin-sub']);

        $this->googleCallback()->assertRedirect('/super-admin');
        $this->assertAuthenticatedAs($admin);
    }

    public function test_unknown_ravu_limited_google_account_is_not_promoted_to_admin(): void
    {
        $this->fakeGoogle(['email' => 'ravu.limited@gmail.com', 'sub' => 'ravu-admin-sub']);

        $this->googleCallback()->assertRedirect('/login')->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'ravu.limited@gmail.com']);
    }

    public function test_new_google_user_must_register_before_signing_in(): void
    {
        $this->fakeGoogle(['email' => 'newpartner@gmail.com', 'sub' => 'new-sub', 'name' => 'New Partner']);

        $this->googleCallback()->assertRedirect('/login')->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'newpartner@gmail.com']);
    }

    public function test_unverified_google_email_is_refused(): void
    {
        $this->partner();
        $this->fakeGoogle(['email_verified' => false]);

        $this->googleCallback()->assertRedirect('/login')->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_state_mismatch_is_refused_without_calling_google(): void
    {
        $this->partner();
        $this->fakeGoogle();

        $this->googleCallback(['state' => 'forged-state'])
            ->assertRedirect('/login')
            ->assertSessionHasErrors(['email' => 'Your Google sign-in session expired. Please try again.']);
        $this->assertGuest();
        Http::assertNothingSent();
    }

    public function test_cancelled_consent_shows_friendly_error(): void
    {
        $this->googleCallback(['error' => 'access_denied'])
            ->assertRedirect('/login')
            ->assertSessionHasErrors(['email' => 'Google sign-in was cancelled.']);
    }

    public function test_failed_token_exchange_is_refused(): void
    {
        $this->partner();
        $this->fakeGoogle([], 400);

        $this->googleCallback()->assertRedirect('/login')->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    // ------------------------------------------------------------------
    // Password login + remembered profile
    // ------------------------------------------------------------------

    public function test_password_login_captures_profile_for_next_login(): void
    {
        $user = $this->partner();

        $response = $this->post('/login', ['email' => 'chid@total.com', 'password' => 'password']);

        $response->assertRedirect('/partner-dashboard');
        $this->assertAuthenticatedAs($user);
        $this->assertSame('password', $user->refresh()->last_login_provider);
        $response->assertCookie(LoginProfile::COOKIE);
    }

    public function test_login_page_shares_remembered_profile_and_google_flag(): void
    {
        $this->withCookie(LoginProfile::COOKIE, json_encode([
            'name' => 'Chid', 'email' => 'chid@total.com', 'provider' => 'google', 'role' => 'partner',
        ]))->get('/login')->assertInertia(fn (Assert $page) => $page
            ->component('Website/Login')
            ->where('auth.rememberedProfile.email', 'chid@total.com')
            ->where('auth.rememberedProfile.provider', 'google')
            ->where('auth.googleEnabled', true));
    }

    public function test_logout_keeps_profile_but_forget_clears_it(): void
    {
        $user = $this->partner();

        $logout = $this->actingAs($user)->post('/logout');
        $logout->assertRedirect('/login');
        $this->assertNull($logout->getCookie(LoginProfile::COOKIE, false));

        $forget = $this->post('/login/forget-profile');
        $forget->assertRedirect('/login');
        $this->assertTrue($forget->getCookie(LoginProfile::COOKIE, false)->isCleared());
    }
}
