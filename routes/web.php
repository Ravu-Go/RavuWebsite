<?php

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
Route::inertia('/login', 'Website/Login')->name('login');
Route::inertia('/register', 'Website/Register')->name('register');
