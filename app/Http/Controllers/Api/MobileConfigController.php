<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MobileAppConfigService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public, read-only configuration the RAVU mobile app fetches at launch:
 *
 *   GET /api/mobile/config?platform=ios|android&version=1.4.2
 *
 * Responds with an ETag so the app can send If-None-Match and get a 304 when
 * nothing has changed.
 */
class MobileConfigController extends Controller
{
    public function __invoke(Request $request, MobileAppConfigService $config): JsonResponse
    {
        $payload = $config->payload(
            $request->query('platform') ? strtolower((string) $request->query('platform')) : null,
            $request->query('version') ? (string) $request->query('version') : null,
        );

        // The ETag ignores the generation time so it only changes when the content does.
        $etag = '"'.md5(json_encode(array_diff_key($payload, ['generated_at' => true]))).'"';
        $response = response()->json($payload)
            ->setEtag(trim($etag, '"'))
            ->header('Cache-Control', 'public, max-age=60');

        // Turns the response into an empty 304 when the app already has this version.
        $response->isNotModified($request);

        return $response;
    }
}
