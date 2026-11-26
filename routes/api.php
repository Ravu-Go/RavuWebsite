<?php

use Illuminate\Support\Facades\Route;

// Remote configuration for the RAVU mobile app (public, read-only).
Route::get('/mobile/config', \App\Http\Controllers\Api\MobileConfigController::class)
    ->middleware('throttle:120,1')
    ->name('api.mobile.config');

Route::get('/mobile/plans', \App\Http\Controllers\Api\MembershipPlansController::class)
    ->middleware('throttle:120,1')
    ->name('api.mobile.plans');

Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working 🚀'
    ]);
});
