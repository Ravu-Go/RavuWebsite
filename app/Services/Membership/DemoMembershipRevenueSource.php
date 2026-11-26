<?php

namespace App\Services\Membership;

use App\Contracts\MembershipRevenueSource;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

/**
 * Sample membership data for designing the revenue page before the API exists.
 *
 * Deterministic (fixed seed) so figures don't jump between page loads, and sized
 * like the RAVU pilot: a few hundred active members after two years of growth,
 * monthly churn, occasional failed and refunded payments, mobile-money heavy.
 */
class DemoMembershipRevenueSource implements MembershipRevenueSource
{
    private const PLAN_MIX = [55, 28, 10, 7];

    private const MONTHLY_CHURN = [0.06, 0.04, 0.0, 0.02];

    private const METHODS = ['M-Pesa' => 52, 'Airtel Money' => 17, 'Mixx by Yas' => 14, 'Card' => 11, 'Bank transfer' => 6];

    private ?array $data = null;

    public function __construct(private readonly array $plans) {}

    public function label(): string
    {
        return 'Demo data';
    }

    public function isDemo(): bool
    {
        return true;
    }

    public function plans(): array
    {
        return array_values($this->plans);
    }

    public function subscriptions(CarbonInterface $since): array
    {
        return array_values(array_filter(
            $this->dataset()['subscriptions'],
            fn ($s) => $s['cancelled_at'] === null || $s['cancelled_at'] >= $since->toIso8601String(),
        ));
    }

    public function payments(CarbonInterface $from, CarbonInterface $to): array
    {
        $from = $from->toIso8601String();
        $to = $to->toIso8601String();

        return array_values(array_filter(
            $this->dataset()['payments'],
            fn ($p) => $p['paid_at'] >= $from && $p['paid_at'] <= $to,
        ));
    }

    private function dataset(): array
    {
        if ($this->data !== null) {
            return $this->data;
        }

        mt_srand(20261124);
        $now = CarbonImmutable::now();
        $start = $now->startOfDay()->subMonths(24);
        $days = (int) $start->diffInDays($now->startOfDay());
        $plans = array_values($this->plans);
        // Popularity per plan: the first four follow a typical mix, any extra plans are niche.
        $mix = array_map(fn ($i) => self::PLAN_MIX[$i] ?? 5, array_keys($plans));
        $subscriptions = [];
        $payments = [];
        $member = 10400;

        for ($d = 0; $d <= $days; $d++) {
            // Sign-ups grow through the pilot: ~0.1/day at launch to ~0.85/day now.
            $rate = 0.1 + 0.75 * (($d / max(1, $days)) ** 1.2);
            $count = (int) floor($rate) + ($this->chance($rate - floor($rate)) ? 1 : 0);

            for ($n = 0; $n < $count; $n++) {
                $planIndex = $this->weighted($mix);
                $plan = $plans[$planIndex];
                $started = $start->addDays($d)->setTime(mt_rand(7, 21), mt_rand(0, 59), mt_rand(0, 59));
                if ($started > $now) {
                    continue;
                }

                $cancelled = $this->cancellation($started, $plan['interval'], self::MONTHLY_CHURN[$planIndex] ?? 0.04);
                $cancelled = $cancelled && $cancelled <= $now ? $cancelled : null;
                $member++;
                $id = 'sub_'.$member;
                $method = $this->pickMethod();

                $subscriptions[] = [
                    'id' => $id,
                    'plan_id' => $plan['id'],
                    'member_ref' => 'RAVU-'.$member,
                    'member_phone' => '+255 7'.mt_rand(1, 8).'• ••• '.str_pad((string) mt_rand(0, 999), 3, '0', STR_PAD_LEFT),
                    'started_at' => $started->toIso8601String(),
                    'cancelled_at' => $cancelled?->toIso8601String(),
                ];

                // Bill at sign-up, then every interval until cancelled.
                for ($due = $started; $due <= $now && ($cancelled === null || $due < $cancelled); $due = $due->add(1, $plan['interval'])) {
                    $payment = fn (string $status, CarbonImmutable $at) => [
                        'id' => 'pay_'.(count($payments) + 1),
                        'subscription_id' => $id,
                        'plan_id' => $plan['id'],
                        'amount' => (int) $plan['price'],
                        'method' => $method,
                        'status' => $status,
                        'paid_at' => $at->toIso8601String(),
                    ];

                    if ($this->chance(0.035)) {
                        // A failed mobile-money push, usually retried successfully the next day.
                        $payments[] = $payment('failed', $due);
                        $due = $due->addDay();
                        if ($due > $now || $this->chance(0.25)) {
                            continue;
                        }
                    }
                    $payments[] = $payment($this->chance(0.006) ? 'refunded' : 'paid', $due->addMinutes(mt_rand(0, 90)));
                }
            }
        }

        usort($payments, fn ($a, $b) => strcmp($a['paid_at'], $b['paid_at']));

        return $this->data = ['subscriptions' => $subscriptions, 'payments' => $payments];
    }

    private function cancellation(CarbonImmutable $started, string $interval, float $monthlyChurn): ?CarbonImmutable
    {
        if ($interval === 'year') {
            // Roughly a quarter of annual members don't renew.
            return $this->chance(0.25) ? $started->addYear()->subDays(mt_rand(0, 20)) : null;
        }
        for ($month = 1; $month <= 36; $month++) {
            if ($this->chance($monthlyChurn)) {
                return $started->addMonths($month)->subDays(mt_rand(0, 25));
            }
        }

        return null;
    }

    private function pickMethod(): string
    {
        $names = array_keys(self::METHODS);

        return $names[$this->weighted(array_values(self::METHODS))];
    }

    private function weighted(array $weights): int
    {
        $roll = mt_rand(1, array_sum($weights));
        foreach ($weights as $i => $weight) {
            if (($roll -= $weight) <= 0) {
                return $i;
            }
        }

        return 0;
    }

    private function chance(float $p): bool
    {
        return mt_rand() / mt_getrandmax() < $p;
    }
}
