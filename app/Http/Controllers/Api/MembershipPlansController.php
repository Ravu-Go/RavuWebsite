<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MembershipPlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public, read-only plan catalogue for the RAVU app's plan picker:
 *
 *   GET /api/mobile/plans
 *
 * The app's backend must also charge from this catalogue (by plan id), never
 * from a price sent by the phone.
 */
class MembershipPlansController extends Controller
{
    public function __invoke(Request $request, MembershipPlanService $plans): JsonResponse
    {
        $payload = $plans->publicPayload();
        $response = response()->json($payload)
            ->setEtag(md5(json_encode($payload['plans'])))
            ->header('Cache-Control', 'public, max-age=60');
        $response->isNotModified($request);

        return $response;
    }
}
