<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * Lets a signed-in portal administrator change their own sign-in details.
 */
class AccountController extends Controller
{
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();
        $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'current_password' => [Rule::requiredIf($request->input('email') !== $user->email), 'nullable', 'current_password'],
        ]);

        $previousEmail = $user->email;
        $user->fill(['name' => trim($data['name']), 'email' => $data['email']]);
        $changed = array_keys($user->getDirty());
        $user->save();

        if ($changed) {
            ActivityLog::record('account', 'account_updated', [
                'changed' => $changed,
                'previous_email' => in_array('email', $changed, true) ? $previousEmail : null,
            ], $user);
        }

        return back()->with('success', 'Account details updated.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', 'different:current_password', Password::min(12)->letters()->numbers()],
        ]);

        $request->user()->forceFill([
            'password' => $data['password'],
            'password_change_required' => false,
            'remember_token' => Str::random(60),
        ])->save();

        $request->session()->regenerate();
        ActivityLog::record('account', 'password_changed', [], $request->user());

        return redirect('/super-admin?section=account')->with('success', 'Password changed. Use it next time you sign in.');
    }
}
