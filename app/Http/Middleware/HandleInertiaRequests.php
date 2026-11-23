<?php

namespace App\Http\Middleware;

use App\Services\SiteContentService;
use App\Support\LoginProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = null;

        $authUser = Auth::user();
        if ($authUser) {
            $user = [
                'id' => $authUser->id,
                'name' => $authUser->name,
                'email' => $authUser->email,
                'avatar' => $authUser->avatar ?? null,
                'role' => $authUser->portalRole(),
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                // Captured on the previous successful login; drives "Continue as …".
                'rememberedProfile' => fn () => LoginProfile::read($request),
                'googleEnabled' => (bool) (config('services.google.client_id') && config('services.google.client_secret')),
            ],
            // Site-wide CMS content (navigation, footer, shared sections).
            'site' => fn () => [
                'global' => app(SiteContentService::class)->forRequest('global', $request),
                'preview' => app(SiteContentService::class)->previewing($request),
            ],
            'flash' => [
                'success' => fn () => $request->hasSession() ? $request->session()->get('success') : null,
                'error' => fn () => $request->hasSession() ? $request->session()->get('error') : null,
            ],
        ];
    }
}
