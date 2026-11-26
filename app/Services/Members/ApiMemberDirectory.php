<?php

namespace App\Services\Members;

use App\Contracts\MemberDirectory;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Looks members up in the RAVU mobile app's backend.
 *
 * Expected endpoint (Bearer token, JSON):
 *
 *   GET {url}/members/lookup?q=<member ID | phone | QR payload>
 *     200 { "data": { ...member, shape documented on App\Contracts\MemberDirectory } }
 *     404 when no member matches
 *
 * Adjust the path or field mapping here if the real API differs; nothing else changes.
 * Lookups are never cached: a member's status must be current at the counter.
 */
class ApiMemberDirectory implements MemberDirectory
{
    public function __construct(private readonly array $config) {}

    public function isDemo(): bool
    {
        return false;
    }

    public function find(string $query): ?array
    {
        $url = rtrim((string) ($this->config['url'] ?? ''), '/');
        if ($url === '') {
            throw new RuntimeException('MEMBERSHIP_API_URL is not set.');
        }

        $response = Http::withToken((string) ($this->config['token'] ?? ''))
            ->acceptJson()
            ->timeout((int) ($this->config['timeout'] ?? 10))
            ->get("{$url}/members/lookup", ['q' => $query]);

        if ($response->status() === 404) {
            return null;
        }
        if ($response->failed()) {
            throw new RuntimeException("The members API returned {$response->status()}.");
        }

        $m = (array) $response->json('data', []);
        if (empty($m['member_ref'])) {
            return null;
        }

        return [
            'member_ref' => (string) $m['member_ref'],
            'name' => (string) ($m['name'] ?? 'RAVU member'),
            'phone_masked' => $m['phone_masked'] ?? null,
            'photo_url' => $m['photo_url'] ?? null,
            'plan_id' => isset($m['plan_id']) ? (string) $m['plan_id'] : null,
            'plan_name' => $m['plan_name'] ?? null,
            'vehicle_category' => $m['vehicle_category'] ?? null,
            'plate_number' => $m['plate_number'] ?? null,
            'status' => in_array($m['status'] ?? null, ['active', 'expired', 'suspended'], true) ? $m['status'] : 'expired',
            'member_since' => $m['member_since'] ?? null,
            'valid_until' => $m['valid_until'] ?? null,
        ];
    }
}
