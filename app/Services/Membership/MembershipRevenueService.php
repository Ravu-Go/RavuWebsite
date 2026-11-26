<?php

namespace App\Services\Membership;

use App\Contracts\MembershipRevenueSource;
use App\Services\PartnerInsightsService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Throwable;

/**
 * Turns plans, subscriptions and payments into the Super Admin revenue report.
 *
 * Revenue = successful payments in the period (refunded payments are excluded and
 * reported separately). MRR counts each active subscription at its monthly
 * equivalent (annual price ÷ 12).
 */
class MembershipRevenueService
{
    public const DEFAULT_RANGE = '12m';

    public function __construct(private readonly MembershipRevenueSource $source) {}

    public function build(string $range): array
    {
        $range = array_key_exists($range, PartnerInsightsService::RANGES) ? $range : self::DEFAULT_RANGE;
        [$unit, $count] = PartnerInsightsService::RANGES[$range];

        $source = ['label' => $this->source->label(), 'demo' => $this->source->isDemo()];

        try {
            $now = CarbonImmutable::now();
            $start = $this->bucketStart($now, $unit)->sub($count - 1, $unit);
            $previousStart = $start->sub($count, $unit);

            $plans = collect($this->source->plans())->keyBy('id');
            $subscriptions = collect($this->source->subscriptions($previousStart))->map(fn ($s) => [
                ...$s,
                'started' => CarbonImmutable::parse($s['started_at']),
                'cancelled' => $s['cancelled_at'] ? CarbonImmutable::parse($s['cancelled_at']) : null,
            ]);
            $payments = collect($this->source->payments($previousStart, $now))->map(fn ($p) => [...$p, 'at' => CarbonImmutable::parse($p['paid_at'])]);
        } catch (Throwable $e) {
            report($e);

            return ['range' => $range, 'source' => $source, 'error' => 'Revenue data could not be loaded: '.$e->getMessage()];
        }

        $current = $payments->filter(fn ($p) => $p['at'] >= $start);
        $previous = $payments->filter(fn ($p) => $p['at'] < $start);
        $paid = fn (Collection $set) => $set->where('status', 'paid');

        $activeAt = fn (CarbonImmutable $at) => $subscriptions->filter(fn ($s) => $s['started'] <= $at && ($s['cancelled'] === null || $s['cancelled'] > $at));
        $mrr = fn (Collection $active) => (int) round($active->sum(fn ($s) => $this->monthly($plans[$s['plan_id']] ?? null)));
        $activeNow = $activeAt($now);
        $activeAtStart = $activeAt($start);

        $newCurrent = $subscriptions->filter(fn ($s) => $s['started'] >= $start);
        $newPrevious = $subscriptions->filter(fn ($s) => $s['started'] >= $previousStart && $s['started'] < $start);
        $cancelledCurrent = $subscriptions->filter(fn ($s) => $s['cancelled'] && $s['cancelled'] >= $start);
        $cancelledPrevious = $subscriptions->filter(fn ($s) => $s['cancelled'] && $s['cancelled'] >= $previousStart && $s['cancelled'] < $start);

        $revenue = $paid($current)->sum('amount');
        $mrrNow = $mrr($activeNow);
        // Monthly churn: cancellations ÷ average active members, per month of the range.
        $months = max(1 / 30, $start->diffInDays($now) / 30.44);
        $averageActive = ($activeAtStart->count() + $activeNow->count()) / 2;
        $monthlyChurn = $averageActive > 0 ? round($cancelledCurrent->count() / $averageActive / $months * 100, 1) : null;

        return [
            'range' => $range,
            'unit' => $unit,
            'currency' => config('membership.currency', 'TZS'),
            'source' => $source,
            'plans' => $plans->map(fn ($p) => ['id' => $p['id'], 'name' => $p['name'], 'price' => (int) $p['price'], 'interval' => $p['interval']])->values()->all(),
            'totals' => [
                'revenue' => ['current' => (int) $revenue, 'previous' => (int) $paid($previous)->sum('amount')],
                'mrr' => ['current' => $mrrNow, 'previous' => $mrr($activeAtStart)],
                'active' => ['current' => $activeNow->count(), 'previous' => $activeAtStart->count()],
                'new' => ['current' => $newCurrent->count(), 'previous' => $newPrevious->count()],
                'cancelled' => ['current' => $cancelledCurrent->count(), 'previous' => $cancelledPrevious->count()],
                'churn_rate' => $monthlyChurn,
                // Average monthly revenue per active member.
                'arpu' => $activeNow->count() ? (int) round($mrrNow / $activeNow->count()) : 0,
                'payments' => $paid($current)->count(),
                'failed' => ['count' => $current->where('status', 'failed')->count(), 'amount' => (int) $current->where('status', 'failed')->sum('amount')],
                'refunded' => ['count' => $current->where('status', 'refunded')->count(), 'amount' => (int) $current->where('status', 'refunded')->sum('amount')],
            ],
            'periods' => $this->periods($paid($current), $plans->keys()->all(), $start, $unit, $count),
            'by_plan' => $plans->map(fn ($plan) => [
                'id' => $plan['id'],
                'name' => $plan['name'],
                'price' => (int) $plan['price'],
                'interval' => $plan['interval'],
                'active' => $activeNow->where('plan_id', $plan['id'])->count(),
                'new' => $newCurrent->where('plan_id', $plan['id'])->count(),
                'cancelled' => $cancelledCurrent->where('plan_id', $plan['id'])->count(),
                'revenue' => (int) $paid($current)->where('plan_id', $plan['id'])->sum('amount'),
                'mrr' => $mrr($activeNow->where('plan_id', $plan['id'])),
            ])->values()->all(),
            'by_method' => $paid($current)
                ->groupBy('method')
                ->map(fn ($group, $method) => ['method' => $method, 'revenue' => (int) $group->sum('amount'), 'count' => $group->count()])
                ->sortByDesc('revenue')
                ->values()
                ->all(),
            'recent_payments' => $payments
                ->sortByDesc('paid_at')
                ->take(12)
                ->map(function ($p) use ($plans, $subscriptions) {
                    $subscription = $subscriptions->firstWhere('id', $p['subscription_id']);

                    return [
                        'id' => $p['id'],
                        'member' => $subscription['member_ref'] ?? $p['subscription_id'],
                        'phone' => $subscription['member_phone'] ?? null,
                        'plan' => $plans[$p['plan_id']]['name'] ?? $p['plan_id'],
                        'amount' => (int) $p['amount'],
                        'method' => $p['method'],
                        'status' => $p['status'],
                        'paid_at' => $p['at']->toIso8601String(),
                    ];
                })
                ->values()
                ->all(),
        ];
    }

    private function monthly(?array $plan): float
    {
        if (! $plan) {
            return 0;
        }

        return match ($plan['interval']) {
            'year' => $plan['price'] / 12,
            'quarter' => $plan['price'] / 3,
            default => (float) $plan['price'],
        };
    }

    private function bucketStart(CarbonImmutable $at, string $unit): CarbonImmutable
    {
        return match ($unit) {
            'day' => $at->startOfDay(),
            'week' => $at->startOfWeek(),
            'month' => $at->startOfMonth(),
        };
    }

    private function periods(Collection $paid, array $planIds, CarbonImmutable $start, string $unit, int $count): array
    {
        $periods = [];
        for ($i = 0; $i < $count; $i++) {
            $from = $start->add($i, $unit);
            $periods[$from->toDateString()] = [
                'start' => $from->toDateString(),
                'label' => $unit === 'month' ? $from->format('M') : $from->format('M j'),
                'long' => match ($unit) {
                    'day' => $from->format('D, j M Y'),
                    'week' => 'Week of '.$from->format('j M Y'),
                    'month' => $from->format('F Y'),
                },
                'plans' => array_fill_keys($planIds, 0),
                'total' => 0,
            ];
        }

        foreach ($paid as $payment) {
            $bucket = $this->bucketStart($payment['at'], $unit)->toDateString();
            if (isset($periods[$bucket])) {
                $periods[$bucket]['plans'][$payment['plan_id']] = ($periods[$bucket]['plans'][$payment['plan_id']] ?? 0) + $payment['amount'];
                $periods[$bucket]['total'] += $payment['amount'];
            }
        }

        return array_values($periods);
    }
}
