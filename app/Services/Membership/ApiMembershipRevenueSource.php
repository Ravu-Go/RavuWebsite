<?php

namespace App\Services\Membership;

use App\Contracts\MembershipRevenueSource;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Reads membership revenue data from the memberships API.
 *
 * Expected endpoints (Bearer token, JSON; each returns { "data": [...] } in the
 * shapes documented on App\Contracts\MembershipRevenueSource):
 *
 *   GET {url}/plans
 *   GET {url}/subscriptions?since=ISO-8601
 *   GET {url}/payments?from=ISO-8601&to=ISO-8601
 *
 * Adjust the paths or field mapping here if the real API differs; nothing else changes.
 */
class ApiMembershipRevenueSource implements MembershipRevenueSource
{
    public function __construct(private readonly array $config) {}

    public function label(): string
    {
        return 'Memberships API';
    }

    public function isDemo(): bool
    {
        return false;
    }

    public function plans(): array
    {
        return array_map(fn (array $plan) => [
            'id' => (string) $plan['id'],
            'name' => (string) $plan['name'],
            'price' => (int) $plan['price'],
            'interval' => in_array($plan['interval'] ?? 'month', ['month', 'quarter', 'year'], true) ? $plan['interval'] : 'month',
        ], $this->get('plans'));
    }

    public function subscriptions(CarbonInterface $since): array
    {
        return array_map(fn (array $s) => [
            'id' => (string) $s['id'],
            'plan_id' => (string) $s['plan_id'],
            'member_ref' => (string) ($s['member_ref'] ?? $s['id']),
            'member_phone' => $s['member_phone'] ?? null,
            'started_at' => (string) $s['started_at'],
            'cancelled_at' => $s['cancelled_at'] ?? null,
        ], $this->get('subscriptions', ['since' => $since->toIso8601String()]));
    }

    public function payments(CarbonInterface $from, CarbonInterface $to): array
    {
        return array_map(fn (array $p) => [
            'id' => (string) $p['id'],
            'subscription_id' => (string) $p['subscription_id'],
            'plan_id' => (string) $p['plan_id'],
            'amount' => (int) $p['amount'],
            'method' => (string) ($p['method'] ?? 'Unknown'),
            'status' => in_array($p['status'] ?? 'paid', ['paid', 'failed', 'refunded'], true) ? $p['status'] : 'paid',
            'paid_at' => (string) $p['paid_at'],
        ], $this->get('payments', ['from' => $from->toIso8601String(), 'to' => $to->toIso8601String()]));
    }

    private function get(string $path, array $query = []): array
    {
        $url = rtrim((string) ($this->config['url'] ?? ''), '/');
        if ($url === '') {
            throw new RuntimeException('MEMBERSHIP_API_URL is not set.');
        }

        // Key on minute precision so "to = now" still hits the cache between page loads.
        $key = 'membership-api:'.md5($path.json_encode(array_map(fn ($v) => substr((string) $v, 0, 16), $query)));

        return Cache::remember($key, max(0, (int) ($this->config['cache_seconds'] ?? 300)), function () use ($url, $path, $query) {
            $response = Http::withToken((string) ($this->config['token'] ?? ''))
                ->acceptJson()
                ->timeout((int) ($this->config['timeout'] ?? 10))
                ->get("{$url}/{$path}", $query);

            if ($response->failed()) {
                throw new RuntimeException("The memberships API returned {$response->status()} for /{$path}.");
            }

            return (array) $response->json('data', []);
        });
    }
}
