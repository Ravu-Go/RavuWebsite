<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Website/Home');
});

Route::inertia('/about-ravu', 'Website/AboutRavu')->name('about-ravu');
Route::inertia('/for-riders', 'Website/ForRiders')->name('for-riders');
Route::inertia('/membership', 'Website/Membership')->name('membership');
Route::inertia('/benefits', 'Website/Benefits')->name('benefits');
Route::inertia('/partners', 'Website/Partners')->name('partners');
Route::inertia('/how-it-works', 'Website/How_It_Works')->name('how-it-works');
Route::inertia('/support', 'Website/Support')->name('support');

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::post('/login/forget-profile', [AuthController::class, 'forgetProfile'])->name('login.forget-profile');

Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

Route::inertia('/register', 'Website/Register')->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('register.submit');

$resolveUser = function (Request $request, array $default) {
    $user = null;
    try {
        $authUser = Auth::user();
        if ($authUser) {
            $user = [
                'id' => $authUser->id,
                'name' => $authUser->name,
                'email' => $authUser->email,
                'role' => $authUser->role ?? ($authUser->email === 'jux@ravu.com' ? 'super_admin' : 'partner'),
            ];
        }
    } catch (\Throwable $e) {
        $user = null;
    }

    return $user ?: $request->session()->get('authenticated_user', $default);
};

$renderSuperAdmin = function (Request $request) use ($resolveUser) {
    return Inertia::render('Website/SuperAdminDashboard', [
        'auth' => [
            'user' => $resolveUser($request, [
                'name' => 'Jux (Super Admin)',
                'email' => 'jux@ravu.com',
                'role' => 'super_admin',
            ]),
        ],
    ]);
};

$renderPartnerDashboard = function (Request $request) use ($resolveUser) {
    return Inertia::render('Website/PartnerDashboard', [
        'auth' => [
            'user' => $resolveUser($request, [
                'name' => 'Chid (TotalEnergies Partner)',
                'email' => 'chid@total.com',
                'role' => 'partner',
                'category' => 'Fuel & Energy Station',
                'phone' => '+255 754 200 100',
            ]),
        ],
    ]);
};

Route::get('/super-admin', $renderSuperAdmin)->name('super-admin');
Route::get('/admin', $renderSuperAdmin)->name('admin');

Route::get('/partner-dashboard', $renderPartnerDashboard)->name('partner-dashboard');
Route::get('/partner-portal', $renderPartnerDashboard)->name('partner-portal');
