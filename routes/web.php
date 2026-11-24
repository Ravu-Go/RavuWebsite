<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\MembershipPlanController;
use App\Http\Controllers\MobileAppController;
use App\Http\Controllers\PartnerAdminController;
use App\Http\Controllers\PartnerOnboardingController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Middleware\EnsurePartnerPortalUser;
use App\Http\Middleware\EnsurePartnerReviewer;
use App\Http\Middleware\EnsurePasswordChanged;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Notifications\PartnerPortalNotification;
use App\Services\SiteContentService;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public marketing pages render CMS-managed content (published, or drafts while a super admin previews).
$contentPage = fn (string $component, string $key) => fn (Request $request, SiteContentService $content) => Inertia::render($component, [
    'content' => $content->forRequest($key, $request),
]);

Route::get('/', $contentPage('Website/Home', 'home'))->name('home');
Route::get('/about-ravu', $contentPage('Website/AboutRavu', 'about'))->name('about-ravu');
Route::get('/for-riders', $contentPage('Website/ForRiders', 'forRiders'))->name('for-riders');
Route::get('/membership', $contentPage('Website/Membership', 'membership'))->name('membership');
Route::get('/benefits', $contentPage('Website/Benefits', 'benefits'))->name('benefits');
Route::get('/partners', $contentPage('Website/Partners', 'partners'))->name('partners');
Route::get('/how-it-works', $contentPage('Website/How_It_Works', 'howItWorks'))->name('how-it-works');
Route::get('/support', $contentPage('Website/Support', 'support'))->name('support');

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login')->name('login.submit');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');
Route::post('/login/forget-profile', [AuthController::class, 'forgetProfile'])->name('login.forget-profile');

Route::get('/register', fn () => Inertia::render('Website/Register', [
    'categories' => \App\Models\PartnerCategory::where('is_active', true)->orderBy('sort_order')->orderBy('name')->get(['id', 'name']),
    'policyLinks' => [
        'terms' => config('partner.terms_url', '#terms'),
        'privacy' => config('partner.privacy_url', '#privacy'),
    ],
]))->name('register');
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register')->name('register.submit');

Route::get('/password/forgot', [AuthController::class, 'showForgotPassword'])->name('password.request');
Route::post('/password/forgot', [AuthController::class, 'sendResetLink'])->middleware('throttle:6,1')->name('password.email');
Route::get('/password/reset/{token}', [AuthController::class, 'showResetPassword'])->name('password.reset');
Route::post('/password/reset', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1')->name('password.update');

Route::middleware('auth')->group(function () {
    Route::get('/email/verify', fn () => Inertia::render('Website/VerifyEmail', ['status' => session('status')]))
        ->name('verification.notice');
    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect('/partner-dashboard');
        }

        $request->fulfill();
        $request->user()->notify(new PartnerPortalNotification(
            'Email verified',
            'Your email is verified. Continue your RAVU partner application.',
        ));

        return redirect('/partner-dashboard')->with('success', 'Email verified. Continue your partner application.');
    })->middleware(['signed', 'throttle:6,1'])->name('verification.verify');
    Route::post('/email/verification-notification', function (Request $request) {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect('/partner-dashboard');
        }

        $request->user()->sendEmailVerificationNotification();
        \App\Models\ActivityLog::record('auth', 'verification_email_sent');

        return back()->with('status', 'A new verification link has been sent to your email address.');
    })->middleware('throttle:6,1')->name('verification.send');
});

Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

Route::middleware(['auth', EnsurePartnerPortalUser::class])->group(function () {
    Route::get('/partner-dashboard', [PartnerOnboardingController::class, 'index'])->name('partner-dashboard');
    Route::get('/partner-portal', [PartnerOnboardingController::class, 'index'])->name('partner-portal');
    Route::patch('/partner/onboarding/business', [PartnerOnboardingController::class, 'saveBusiness'])->name('partner.onboarding.business');
    Route::patch('/partner/account', [PartnerOnboardingController::class, 'saveAccount'])->name('partner.account.update');
    Route::patch('/partner/onboarding/location', [PartnerOnboardingController::class, 'saveLocation'])->name('partner.onboarding.location');
    Route::post('/partner/onboarding/benefit', [PartnerOnboardingController::class, 'saveBenefit'])->name('partner.onboarding.benefit');
    Route::post('/partner/onboarding/documents', [PartnerOnboardingController::class, 'uploadDocument'])->name('partner.onboarding.documents.store');
    Route::get('/partner/documents/{document}', [PartnerOnboardingController::class, 'downloadDocument'])->name('partner.documents.download');
    Route::post('/partner/onboarding/submit', [PartnerOnboardingController::class, 'submit'])->name('partner.onboarding.submit');
    Route::post('/partner/notifications/{notification}/read', [PartnerOnboardingController::class, 'markNotificationRead'])->name('partner.notifications.read');
});

Route::middleware(['auth', 'verified', EnsurePartnerReviewer::class, EnsurePasswordChanged::class])->prefix('partner-management')->name('partner-management.')->group(function () {
    Route::get('/', [PartnerAdminController::class, 'index'])->name('index');
    Route::get('/applications/{application}', [PartnerAdminController::class, 'show'])->name('applications.show');
    Route::post('/applications/{application}/under-review', [PartnerAdminController::class, 'underReview'])->name('applications.under-review');
    Route::post('/applications/{application}/action-required', [PartnerAdminController::class, 'requestChanges'])->name('applications.action-required');
    Route::post('/applications/{application}/approve', [PartnerAdminController::class, 'approve'])->name('applications.approve');
    Route::post('/applications/{application}/reject', [PartnerAdminController::class, 'reject'])->name('applications.reject');
    Route::post('/applications/{application}/suspend', [PartnerAdminController::class, 'suspend'])->name('applications.suspend');
    Route::post('/documents/{document}/review', [PartnerAdminController::class, 'reviewDocument'])->name('documents.review');
    Route::get('/documents/{document}', [PartnerAdminController::class, 'downloadDocument'])->name('documents.download');
    Route::post('/benefits/{benefit}/review', [PartnerAdminController::class, 'reviewBenefit'])->name('benefits.review');
    Route::post('/categories', [PartnerAdminController::class, 'storeCategory'])->name('categories.store');
    Route::patch('/categories/{category}', [PartnerAdminController::class, 'updateCategory'])->name('categories.update');
    Route::post('/requirements', [PartnerAdminController::class, 'storeRequirement'])->name('requirements.store');
    Route::patch('/requirements/{requirement}', [PartnerAdminController::class, 'updateRequirement'])->name('requirements.update');
});

Route::middleware(['auth', 'verified', EnsureSuperAdmin::class])->group(function () {
    $contentKeys = array_keys(config('site_content.pages', []));

    Route::get('/super-admin', [SuperAdminController::class, 'index'])->name('super-admin');
    Route::redirect('/admin', '/super-admin')->name('admin');

    // Account settings stay reachable while a one-time password is still in use.
    Route::patch('/super-admin/account', [AccountController::class, 'updateProfile'])->name('super-admin.account.update');
    Route::put('/super-admin/account/password', [AccountController::class, 'updatePassword'])
        ->middleware('throttle:6,1')
        ->name('super-admin.account.password');

    Route::prefix('super-admin')->name('super-admin.')->middleware(EnsurePasswordChanged::class)->group(function () use ($contentKeys) {
        Route::put('/content/{key}', [SuperAdminController::class, 'saveDraft'])->whereIn('key', $contentKeys)->name('content.draft');
        Route::post('/content/{key}/publish', [SuperAdminController::class, 'publish'])->whereIn('key', $contentKeys)->name('content.publish');
        Route::delete('/content/{key}/draft', [SuperAdminController::class, 'discardDraft'])->whereIn('key', $contentKeys)->name('content.discard');
        Route::post('/content/{key}/revisions/{revision}/restore', [SuperAdminController::class, 'restoreRevision'])->whereIn('key', $contentKeys)->name('content.restore');
        Route::get('/preview/{key}', [SuperAdminController::class, 'startPreview'])->whereIn('key', $contentKeys)->name('preview.start');
        Route::get('/preview-exit', [SuperAdminController::class, 'stopPreview'])->name('preview.stop');
        Route::post('/media', [SuperAdminController::class, 'uploadMedia'])->name('media.store');
        Route::get('/activity/export', [SuperAdminController::class, 'exportActivity'])->name('activity.export');

        Route::prefix('plans')->name('plans.')->controller(MembershipPlanController::class)->group(function () {
            Route::post('/', 'store')->name('store');
            Route::put('/{plan}', 'update')->name('update');
            Route::post('/{plan}/price', 'changePrice')->name('price');
            Route::post('/{plan}/publish', 'publish')->name('publish');
            Route::post('/{plan}/retire', 'retire')->name('retire');
            Route::post('/{plan}/reactivate', 'reactivate')->name('reactivate');
            Route::post('/{plan}/move', 'move')->name('move');
            Route::delete('/{plan}', 'destroy')->name('destroy');
        });

        Route::prefix('mobile')->name('mobile.')->controller(MobileAppController::class)->group(function () {
            Route::put('/versions', 'updateVersions')->name('versions');
            Route::put('/maintenance', 'updateMaintenance')->name('maintenance');
            Route::put('/support', 'updateSupport')->name('support');
            Route::post('/announcements', 'storeAnnouncement')->name('announcements.store');
            Route::put('/announcements/{announcement}', 'updateAnnouncement')->name('announcements.update');
            Route::delete('/announcements/{announcement}', 'destroyAnnouncement')->name('announcements.destroy');
            Route::post('/features', 'storeFeature')->name('features.store');
            Route::put('/features/{feature}', 'updateFeature')->name('features.update');
            Route::delete('/features/{feature}', 'destroyFeature')->name('features.destroy');
        });
        Route::delete('/media/{media}', [SuperAdminController::class, 'deleteMedia'])->name('media.destroy');
    });
});
