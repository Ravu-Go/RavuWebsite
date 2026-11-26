<?php

namespace App\Services\Members;

use App\Contracts\MemberDirectory;
use App\Contracts\MembershipRevenueSource;
use Carbon\CarbonImmutable;

/**
 * Sample members for the partner verifier, built from the membership data source's
 * subscriptions so the people a partner verifies are the same ones the revenue page
 * counts. Names, phones and plates are derived from the member ID, so a given ID
 * always shows the same person.
 */
class DemoMemberDirectory implements MemberDirectory
{
    private const FIRST = ['Hamisi', 'Juma', 'Baraka', 'Neema', 'Amina', 'Rehema', 'Salim', 'Musa', 'Halima', 'Daudi', 'Faraji', 'Zawadi', 'Emmanuel', 'Grace', 'Joseph', 'Fatuma', 'Ibrahim', 'Mwanaisha', 'Abdallah', 'Peter', 'Saidi', 'Ally', 'Kassim', 'Upendo', 'Joyce', 'Hassani', 'Rashidi', 'Bakari', 'Elia', 'Mariamu'];

    private const LAST = ['Mrema', 'Mushi', 'Kimaro', 'Mwakyusa', 'Massawe', 'Mollel', 'Lyimo', 'Shirima', 'Mbwana', 'Kombo', 'Mfinanga', 'Swai', 'Njau', 'Temba', 'Mapunda', 'Komba', 'Kapinga', 'Mwita', 'Chacha', 'Magesa'];

    private const LETTERS = 'ABCDEFGHJKLMNPRSTUVWXYZ';

    /** @var array<string, array>|null member_ref => member */
    private ?array $members = null;

    public function __construct(private readonly MembershipRevenueSource $source) {}

    public function isDemo(): bool
    {
        return true;
    }

    public function find(string $query): ?array
    {
        $query = trim($query);
        if ($query === '') {
            return null;
        }

        // QR payload from the member app: "ravu:member:RAVU-10432".
        if (preg_match('/^ravu:member:(.+)$/i', $query, $m)) {
            $query = $m[1];
        }

        $members = $this->all();
        $ref = strtoupper(preg_replace('/\s+/', '', $query));
        if (preg_match('/^(?:RAVU-?)?(\d{4,})$/', $ref, $m) && isset($members['RAVU-'.$m[1]])) {
            return $members['RAVU-'.$m[1]];
        }

        $digits = preg_replace('/\D/', '', $query);
        if (strlen($digits) >= 9) {
            $local = substr($digits, -9);
            foreach ($members as $member) {
                if (substr($member['phone_digits'], -9) === $local) {
                    return $member;
                }
            }
        }

        return null;
    }

    /** Every demo member, keyed by member ref (includes `phone_digits` for lookups). */
    public function all(): array
    {
        if ($this->members !== null) {
            return $this->members;
        }

        $now = CarbonImmutable::now();
        $plans = collect($this->source->plans())->keyBy('id');
        $this->members = [];

        foreach ($this->source->subscriptions($now->subYears(10)) as $subscription) {
            $ref = (string) $subscription['member_ref'];
            $seed = crc32($ref);
            $plan = $plans[$subscription['plan_id']] ?? null;
            $started = CarbonImmutable::parse($subscription['started_at']);
            $cancelled = $subscription['cancelled_at'] ? CarbonImmutable::parse($subscription['cancelled_at']) : null;

            $status = $cancelled && $cancelled <= $now ? 'expired' : ($seed % 41 === 0 ? 'suspended' : 'active');
            $vehicle = $this->vehicle($plan, $seed);
            $phone = '07'.[1, 4, 5, 6, 7, 8][$seed % 6].str_pad((string) ($seed % 10_000_000), 7, '0', STR_PAD_LEFT);

            $this->members[$ref] = [
                'member_ref' => $ref,
                'name' => self::FIRST[$seed % count(self::FIRST)].' '.self::LAST[intdiv($seed, 7) % count(self::LAST)],
                'phone_masked' => '+255 '.substr($phone, 1, 2).'• ••• '.substr($phone, -3),
                'phone_digits' => $phone,
                'photo_url' => null,
                'plan_id' => $plan['id'] ?? $subscription['plan_id'],
                'plan_name' => $plan['name'] ?? null,
                'vehicle_category' => $vehicle,
                'plate_number' => $this->plate($vehicle, $seed),
                'status' => $status,
                'member_since' => $started->toIso8601String(),
                'valid_until' => ($cancelled ?? $this->paidUntil($started, $plan['interval'] ?? 'month', $now))->toIso8601String(),
                'started_at' => $started->toIso8601String(),
                'cancelled_at' => $cancelled?->toIso8601String(),
            ];
        }

        return $this->members;
    }

    private function vehicle(?array $plan, int $seed): string
    {
        $text = strtolower(($plan['id'] ?? '').' '.($plan['name'] ?? ''));

        return match (true) {
            str_contains($text, 'fleet') => 'Commercial fleet',
            str_contains($text, 'bajaj') => 'Bajaj',
            str_contains($text, 'car') || str_contains($text, 'family') || str_contains($text, 'private') => 'Private car',
            str_contains($text, 'rider') || str_contains($text, 'boda') => $seed % 4 === 0 ? 'Bajaj' : 'Motorcycle (boda boda)',
            default => ['Motorcycle (boda boda)', 'Motorcycle (boda boda)', 'Bajaj', 'Private car'][$seed % 4],
        };
    }

    private function plate(string $vehicle, int $seed): string
    {
        $prefix = in_array($vehicle, ['Motorcycle (boda boda)', 'Bajaj'], true) ? 'MC' : 'T';
        $letters = '';
        for ($i = 0, $n = intdiv($seed, 13); $i < 3; $i++, $n = intdiv($n, 23)) {
            $letters .= self::LETTERS[$n % 23];
        }

        return sprintf('%s %03d %s', $prefix, $seed % 1000, $letters);
    }

    /** End of the billing period that contains $now. */
    private function paidUntil(CarbonImmutable $started, string $interval, CarbonImmutable $now): CarbonImmutable
    {
        $due = $started;
        while ($due <= $now) {
            $due = $due->add(1, $interval);
        }

        return $due;
    }
}
