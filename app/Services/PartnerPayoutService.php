<?php

namespace App\Services;

use App\Contracts\MembershipRevenueSource;
use App\Models\ActivityLog;
use App\Models\Partner;
use App\Models\PartnerPayout;
use App\Models\PartnerRedemption;
use App\Models\User;
use App\Support\ReportPeriod;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * Monthly partner payouts.
 *
 * RAVU earns subscription income from members. Each month it sets aside
 * `partner.payout_pool_percent` of that month's income (successful payments) as the
 * partner pool, and shares the pool between partners in proportion to the number of
 * distinct RAVU members each partner served that month:
 *
 *   share(partner) = members served by partner ÷ Σ members served by every partner
 *   payout(partner) = pool × share   (rounded so the shares add up to the pool exactly)
 *
 * A member who visits two partners counts once for each. Months that have not been
 * approved are live estimates; approving a finished month freezes the figures in
 * partner_payouts, after which they are marked paid one by one.
 */
class PartnerPayoutService
{
    public function __construct(private readonly MembershipRevenueSource $source) {}

    public function poolPercent(): float
    {
        return max(0.0, min(100.0, (float) config('partner.payout_pool_percent', 30)));
    }

    /**
     * Live allocation for each given month.
     *
     * @param  array<int, CarbonImmutable>  $months  month starts
     * @return array<string, array{revenue: int, pool_percent: float, pool: int, total_members: int, rows: array<int, array>}>
     */
    public function allocations(array $months): array
    {
        if ($months === []) {
            return [];
        }
        usort($months, fn ($a, $b) => $a <=> $b);
        $from = $months[0]->startOfMonth();
        $to = end($months)->endOfMonth()->min(CarbonImmutable::now());
        $percent = $this->poolPercent();

        $revenue = [];
        foreach ($this->source->payments($from, $to) as $payment) {
            if (($payment['status'] ?? 'paid') === 'paid') {
                $key = CarbonImmutable::parse($payment['paid_at'])->format('Y-m');
                $revenue[$key] = ($revenue[$key] ?? 0) + (int) $payment['amount'];
            }
        }

        // Distinct members per partner per month, counted in PHP to stay portable across MySQL and SQLite.
        $served = [];
        $visits = [];
        PartnerRedemption::query()->completed()
            ->whereBetween('redeemed_at', [$from, $to])
            ->select(['partner_id', 'member_ref', 'redeemed_at'])
            ->orderBy('id')
            ->lazy(2000)
            ->each(function (PartnerRedemption $r) use (&$served, &$visits) {
                $key = $r->redeemed_at->format('Y-m');
                $served[$key][$r->partner_id][$r->member_ref] = true;
                $visits[$key][$r->partner_id] = ($visits[$key][$r->partner_id] ?? 0) + 1;
            });

        $result = [];
        foreach ($months as $month) {
            $key = $month->format('Y-m');
            $monthRevenue = $revenue[$key] ?? 0;
            $pool = (int) round($monthRevenue * $percent / 100);
            $weights = array_map('count', $served[$key] ?? []);
            $total = array_sum($weights);
            $amounts = $this->split($pool, $weights);

            $rows = [];
            foreach ($weights as $partnerId => $members) {
                $rows[$partnerId] = [
                    'members_served' => $members,
                    'visits' => $visits[$key][$partnerId] ?? 0,
                    'share_percent' => $total > 0 ? round($members / $total * 100, 4) : 0.0,
                    'amount' => $amounts[$partnerId] ?? 0,
                ];
            }

            $result[$key] = ['revenue' => $monthRevenue, 'pool_percent' => $percent, 'pool' => $total > 0 ? $pool : 0, 'unallocated' => $total > 0 ? 0 : $pool, 'total_members' => $total, 'rows' => $rows];
        }

        return $result;
    }

    /** Payout totals per partner for a period: frozen amounts where approved, live estimates elsewhere. */
    public function partnerAmounts(ReportPeriod $period): array
    {
        $months = $this->monthsIn($period);
        $stored = PartnerPayout::query()->whereIn('period', array_map(fn ($m) => $m->format('Y-m'), $months))->get()->groupBy('period');
        $live = $this->allocations(array_values(array_filter($months, fn ($m) => ! $stored->has($m->format('Y-m')))));

        $totals = [];
        foreach ($months as $month) {
            $key = $month->format('Y-m');
            $rows = $stored->has($key)
                ? $stored[$key]->mapWithKeys(fn (PartnerPayout $p) => [$p->partner_id => $p->amount])->all()
                : array_map(fn ($row) => $row['amount'], $live[$key]['rows'] ?? []);
            foreach ($rows as $partnerId => $amount) {
                $totals[$partnerId] = ($totals[$partnerId] ?? 0) + $amount;
            }
        }

        return $totals;
    }

    /** What the partner portal shows about payouts for the selected period. */
    public function forPartner(Partner $partner, ReportPeriod $period): array
    {
        try {
            $months = $this->monthsIn($period);
            $stored = $partner->payouts()->whereIn('period', array_map(fn ($m) => $m->format('Y-m'), $months))->get()->keyBy('period');
            $approvedPeriods = PartnerPayout::query()->whereIn('period', array_map(fn ($m) => $m->format('Y-m'), $months))->distinct()->pluck('period')->flip();
            $live = $this->allocations(array_values(array_filter($months, fn ($m) => ! $approvedPeriods->has($m->format('Y-m')))));
        } catch (Throwable $e) {
            report($e);

            return ['error' => 'Payout figures are not available right now.'];
        }

        $rows = [];
        foreach (array_reverse($months) as $month) {
            $key = $month->format('Y-m');
            $payout = $stored->get($key);
            if ($payout) {
                $rows[] = [
                    'period' => $key, 'label' => $month->format('F Y'), 'status' => $payout->status,
                    'members_served' => $payout->members_served, 'share_percent' => round($payout->share_percent, 2),
                    'amount' => $payout->amount, 'paid_at' => $payout->paid_at?->toIso8601String(), 'reference' => $payout->payment_reference,
                ];
            } elseif ($approvedPeriods->has($key)) {
                // Month approved, but this partner served nobody in it.
                $rows[] = ['period' => $key, 'label' => $month->format('F Y'), 'status' => 'approved', 'members_served' => 0, 'share_percent' => 0, 'amount' => 0, 'paid_at' => null, 'reference' => null];
            } else {
                $row = $live[$key]['rows'][$partner->id] ?? ['members_served' => 0, 'share_percent' => 0, 'amount' => 0];
                $running = $month->endOfMonth() >= CarbonImmutable::now();
                $rows[] = [
                    'period' => $key, 'label' => $month->format('F Y'), 'status' => $running ? 'estimate' : 'pending_approval',
                    'members_served' => $row['members_served'], 'share_percent' => round($row['share_percent'], 2),
                    'amount' => $row['amount'], 'paid_at' => null, 'reference' => null,
                ];
            }
        }

        return [
            'currency' => config('membership.currency', 'TZS'),
            'pool_percent' => $this->poolPercent(),
            'total' => array_sum(array_column($rows, 'amount')),
            'paid' => array_sum(array_map(fn ($r) => $r['status'] === 'paid' ? $r['amount'] : 0, $rows)),
            'months' => $rows,
        ];
    }

    /** The Super Admin payouts screen for one month. */
    public function adminMonth(ReportPeriod $month): array
    {
        $key = $month->key();
        $base = [
            'period' => $month->toArray(),
            'currency' => config('membership.currency', 'TZS'),
            'months' => $this->recentMonths(),
            'source' => ['demo' => $this->source->isDemo(), 'label' => $this->source->label()],
        ];

        try {
            $stored = PartnerPayout::query()->where('period', $key)->with('partner.category:id,name', 'partner.locations')->get();
            $live = $stored->isEmpty() ? ($this->allocations([$month->start])[$key] ?? null) : null;
        } catch (Throwable $e) {
            report($e);

            return [...$base, 'error' => 'Payout figures could not be calculated: '.$e->getMessage()];
        }

        if ($stored->isNotEmpty()) {
            $first = $stored->first();
            $summary = [
                'status' => $stored->every(fn ($p) => $p->status === 'paid') ? 'paid' : 'approved',
                'revenue' => $first->subscription_revenue,
                'pool_percent' => $first->pool_percent,
                'pool' => $first->pool_amount,
                'total_members' => $first->total_members_served,
                'approved_at' => $first->approved_at?->toIso8601String(),
                'approved_by' => $first->approver?->name,
            ];
            $partners = $stored->map(fn (PartnerPayout $p) => $this->partnerRow($p->partner, [
                'payout_id' => $p->id, 'members_served' => $p->members_served, 'visits' => $p->visits,
                'share_percent' => round($p->share_percent, 2), 'amount' => $p->amount, 'status' => $p->status,
                'paid_at' => $p->paid_at?->toIso8601String(), 'reference' => $p->payment_reference,
            ]));
        } else {
            $summary = [
                'status' => $month->isRunning() ? 'estimate' : 'pending_approval',
                'revenue' => $live['revenue'], 'pool_percent' => $live['pool_percent'], 'pool' => $live['pool'],
                'total_members' => $live['total_members'], 'approved_at' => null, 'approved_by' => null,
            ];
            $models = Partner::query()->whereIn('id', array_keys($live['rows']))->with('category:id,name', 'locations')->get()->keyBy('id');
            $partners = collect($live['rows'])->map(fn ($row, $partnerId) => $this->partnerRow($models[$partnerId] ?? null, [
                'payout_id' => null, ...$row, 'share_percent' => round($row['share_percent'], 2), 'status' => $summary['status'], 'paid_at' => null, 'reference' => null,
            ]));
        }

        $summary['paid'] = $partners->where('status', 'paid')->sum('amount');
        $summary['ravu_keeps'] = max(0, $summary['revenue'] - $summary['pool']);

        return [...$base, 'summary' => $summary, 'partners' => $partners->sortByDesc('amount')->values()->all()];
    }

    /** Freeze a finished month's allocation so it can be paid. */
    public function approve(ReportPeriod $month, User $by): int
    {
        if ($month->type !== 'month' || $month->isRunning()) {
            throw ValidationException::withMessages(['period' => 'Only a finished month can be approved.']);
        }
        $key = $month->key();
        if (PartnerPayout::where('period', $key)->exists()) {
            throw ValidationException::withMessages(['period' => "{$month->label()} has already been approved."]);
        }

        $allocation = $this->allocations([$month->start])[$key];
        if ($allocation['total_members'] === 0) {
            throw ValidationException::withMessages(['period' => "No partner served a member in {$month->label()}, so there is nothing to approve."]);
        }

        $demoPartners = PartnerRedemption::query()->completed()->where('is_demo', true)
            ->whereBetween('redeemed_at', [$month->start, $month->end()])->distinct()->pluck('partner_id')->flip();

        DB::transaction(function () use ($allocation, $key, $by, $demoPartners) {
            foreach ($allocation['rows'] as $partnerId => $row) {
                PartnerPayout::create([
                    'partner_id' => $partnerId,
                    'period' => $key,
                    'subscription_revenue' => $allocation['revenue'],
                    'pool_percent' => $allocation['pool_percent'],
                    'pool_amount' => $allocation['pool'],
                    'members_served' => $row['members_served'],
                    'total_members_served' => $allocation['total_members'],
                    'visits' => $row['visits'],
                    'share_percent' => $row['share_percent'],
                    'amount' => $row['amount'],
                    'currency' => config('membership.currency', 'TZS'),
                    'status' => 'approved',
                    'approved_by' => $by->id,
                    'approved_at' => now(),
                    'is_demo' => $demoPartners->has($partnerId),
                ]);
            }
        });

        ActivityLog::record('partner', 'payouts_approved', ['period' => $key, 'pool' => $allocation['pool'], 'partners' => count($allocation['rows'])], user: $by);

        return count($allocation['rows']);
    }

    public function markPaid(PartnerPayout $payout, string $reference, User $by): void
    {
        if ($payout->status === 'paid') {
            throw ValidationException::withMessages(['reference' => 'This payout is already marked as paid.']);
        }
        $payout->update(['status' => 'paid', 'paid_at' => now(), 'paid_by' => $by->id, 'payment_reference' => $reference]);
        ActivityLog::record('partner', 'payout_paid', ['payout_id' => $payout->id, 'partner_id' => $payout->partner_id, 'period' => $payout->period, 'amount' => $payout->amount, 'reference' => $reference], user: $by);
    }

    /** True when the redemption's month has an approved payout (its figures are frozen). */
    public function monthLocked(CarbonImmutable $at): bool
    {
        return PartnerPayout::where('period', $at->format('Y-m'))->exists();
    }

    /** The last twelve months with their payout status, newest first (for the month picker). */
    private function recentMonths(): array
    {
        $now = CarbonImmutable::now()->startOfMonth();
        $keys = array_map(fn ($i) => $now->subMonths($i)->format('Y-m'), range(0, 11));
        $stored = PartnerPayout::query()->whereIn('period', $keys)
            ->selectRaw("period, sum(amount) as total, sum(case when status = 'paid' then 1 else 0 end) as paid_count, count(*) as row_count")
            ->groupBy('period')->get()->keyBy('period');

        return array_map(function ($key) use ($stored, $now) {
            $row = $stored->get($key);
            $status = $row ? ((int) $row->paid_count === (int) $row->row_count ? 'paid' : 'approved') : ($key === $now->format('Y-m') ? 'estimate' : 'pending_approval');

            return ['key' => $key, 'label' => CarbonImmutable::createFromFormat('Y-m-d', $key.'-01')->format('M Y'), 'status' => $status];
        }, $keys);
    }

    /** @return array<int, CarbonImmutable> month starts in the period, up to the current month */
    private function monthsIn(ReportPeriod $period): array
    {
        if ($period->type === 'month') {
            return [$period->start];
        }
        $now = CarbonImmutable::now();

        return array_values(array_filter(
            array_map(fn ($i) => $period->start->addMonths($i), range(0, 11)),
            fn ($m) => $m <= $now,
        ));
    }

    private function partnerRow(?Partner $partner, array $figures): array
    {
        $location = $partner?->locations->firstWhere('is_primary', true) ?? $partner?->locations->first();

        return [
            'partner_id' => $partner?->id,
            'name' => $partner ? ($partner->trading_name ?: $partner->registered_name ?: "Partner #{$partner->id}") : 'Removed partner',
            'category' => $partner?->category?->name,
            'region' => $location ? trim($location->district.', '.$location->region, ', ') : null,
            'is_demo' => (bool) $partner?->is_demo,
            ...$figures,
        ];
    }

    /**
     * Split $pool across weights with the largest-remainder method, so whole-shilling
     * amounts always add up to the pool exactly.
     *
     * @param  array<int, int>  $weights
     * @return array<int, int>
     */
    private function split(int $pool, array $weights): array
    {
        $total = array_sum($weights);
        if ($total === 0 || $pool === 0) {
            return array_map(fn () => 0, $weights);
        }

        $amounts = [];
        $remainders = [];
        foreach ($weights as $id => $weight) {
            $exact = $pool * $weight / $total;
            $amounts[$id] = (int) floor($exact);
            $remainders[$id] = $exact - $amounts[$id];
        }
        arsort($remainders);
        foreach (array_slice(array_keys($remainders), 0, $pool - array_sum($amounts)) as $id) {
            $amounts[$id]++;
        }

        return $amounts;
    }
}
