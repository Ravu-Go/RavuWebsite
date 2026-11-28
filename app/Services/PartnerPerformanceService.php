<?php

namespace App\Services;

use App\Contracts\MembershipRevenueSource;
use App\Models\Partner;
use App\Models\PartnerRedemption;
use App\Support\ReportPeriod;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Throwable;

/**
 * Reports built from partner redemptions (members served, visits, sales, discounts):
 * one partner's performance for the partner portal, and the partner leaderboard for
 * the Super Admin. Rows are bucketed in PHP so the queries stay portable across
 * MySQL and SQLite.
 *
 * Terms used throughout:
 *   members served  distinct RAVU members (member_ref) with at least one visit
 *   visits          completed redemptions
 *   sales           bill totals before the member discount
 *   discount        what members saved
 *   paid            what members actually paid the partner (sales − discount)
 */
class PartnerPerformanceService
{
    private const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    public function __construct(
        private readonly PartnerPayoutService $payouts,
        private readonly MembershipRevenueSource $membership,
    ) {}

    /* ============================== Partner portal ============================== */

    public function forPartner(Partner $partner, ReportPeriod $period): array
    {
        $trend = $period->trendMonths();
        $from = min($trend[0], $period->previous()->start);
        $rows = $this->rows($from, $period->end(), $partner->id);

        $current = $this->within($rows, $period->start, $period->end());
        $previous = $this->within($rows, ...$period->comparison());

        // First-ever visit per member at this partner, to tell new members from returning ones.
        $firstVisits = PartnerRedemption::query()->completed()->where('partner_id', $partner->id)
            ->whereIn('member_ref', $current->pluck('member_ref')->unique()->values())
            ->selectRaw('member_ref, min(redeemed_at) as first_at')->groupBy('member_ref')
            ->pluck('first_at', 'member_ref');
        $newMembers = $current->pluck('member_ref')->unique()
            ->filter(fn ($ref) => isset($firstVisits[$ref]) && CarbonImmutable::parse($firstVisits[$ref]) >= $period->start)->count();

        $locations = $partner->locations()->get(['id', 'name', 'district', 'is_primary'])->keyBy('id');
        $benefit = $partner->activeBenefit();
        $firstYear = PartnerRedemption::query()->where('partner_id', $partner->id)->min('redeemed_at');

        return [
            'period' => $period->toArray(),
            'years' => ReportPeriod::years($firstYear ? CarbonImmutable::parse($firstYear)->year : CarbonImmutable::now()->year),
            'currency' => config('membership.currency', 'TZS'),
            'demo' => $current->contains('is_demo', true) || $previous->contains('is_demo', true),
            'benefit' => $benefit ? ['name' => $benefit->name, 'label' => $this->benefitLabel($benefit)] : null,
            'totals' => [
                'members' => ['current' => $this->members($current), 'previous' => $this->members($previous)],
                'visits' => ['current' => $current->count(), 'previous' => $previous->count()],
                'sales' => ['current' => $current->sum('bill_amount'), 'previous' => $previous->sum('bill_amount')],
                'discount' => ['current' => $current->sum('discount_amount'), 'previous' => $previous->sum('discount_amount')],
                'paid' => ['current' => $current->sum('paid_amount'), 'previous' => $previous->sum('paid_amount')],
                'average_bill' => ['current' => $this->average($current), 'previous' => $this->average($previous)],
                'new_members' => $newMembers,
                'returning_members' => $this->members($current) - $newMembers,
            ],
            'trend' => $this->trend($rows, $trend),
            'by_location' => $current->groupBy('partner_location_id')->map(fn (Collection $set, $id) => [
                'name' => $locations[$id]->name ?? 'Unassigned',
                'members' => $this->members($set), 'visits' => $set->count(), 'paid' => $set->sum('paid_amount'),
            ])->sortByDesc('visits')->values()->all(),
            'by_vehicle' => $this->breakdown($current, 'vehicle_category', 'Not recorded'),
            'by_plan' => $this->breakdown($current, 'member_plan_name', 'Unknown plan'),
            'by_weekday' => array_map(fn ($day, $i) => [
                'label' => $day,
                'visits' => $current->filter(fn ($r) => $r->redeemed_at->dayOfWeekIso === $i + 1)->count(),
            ], self::WEEKDAYS, array_keys(self::WEEKDAYS)),
            'by_hour' => array_map(fn ($h) => [
                'label' => sprintf('%02d', $h),
                'visits' => $current->filter(fn ($r) => $r->redeemed_at->hour === $h)->count(),
            ], range(6, 21)),
            'top_members' => $current->groupBy('member_ref')->map(fn (Collection $set, $ref) => [
                'member_ref' => $ref, 'name' => $set->first()->member_name, 'visits' => $set->count(), 'paid' => $set->sum('paid_amount'),
            ])->sortByDesc('visits')->take(5)->values()->all(),
            'payout' => $this->payouts->forPartner($partner, $period),
        ];
    }

    /** The redemptions list for the partner portal (newest first, voided included). */
    public function redemptions(Partner $partner, ReportPeriod $period, int $limit = 100): array
    {
        $voidHours = (int) config('partner.void_window_hours', 24);
        $query = $partner->redemptions()
            ->whereBetween('redeemed_at', [$period->start, $period->end()])
            ->with(['location:id,name', 'recorder:id,name'])
            ->latest('redeemed_at')->latest('id');
        $total = (clone $query)->count();
        $locked = [];

        return [
            'total' => $total,
            'limit' => $limit,
            'rows' => $query->limit($limit)->get()->map(function (PartnerRedemption $r) use ($voidHours, &$locked) {
                $month = $r->redeemed_at->format('Y-m');
                $locked[$month] ??= $this->payouts->monthLocked($r->redeemed_at);

                return [
                    'id' => $r->id,
                    'receipt_no' => $r->receipt_no,
                    'redeemed_at' => $r->redeemed_at->toIso8601String(),
                    'member_ref' => $r->member_ref,
                    'member_name' => $r->member_name,
                    'plan' => $r->member_plan_name,
                    'vehicle' => $r->vehicle_category,
                    'location' => $r->location?->name,
                    'recorded_by' => $r->recorder?->name,
                    'description' => $r->description,
                    'invoice_ref' => $r->invoice_ref,
                    'bill' => $r->bill_amount,
                    'discount' => $r->discount_amount,
                    'paid' => $r->paid_amount,
                    'status' => $r->status,
                    'void_reason' => $r->void_reason,
                    'can_void' => $r->status === 'completed' && ! $r->is_demo && ! $locked[$month]
                        && $r->redeemed_at->gt(now()->subHours($voidHours)),
                ];
            })->all(),
        ];
    }

    /* ================================ Super Admin =============================== */

    public function leaderboard(ReportPeriod $period): array
    {
        $trend = $period->trendMonths();
        $from = min($trend[0], $period->previous()->start);
        $rows = $this->rows($from, $period->end());
        $current = $this->within($rows, $period->start, $period->end());
        $previous = $this->within($rows, ...$period->comparison());

        $partners = Partner::query()
            ->where(fn ($q) => $q->where('status', 'active')->orWhereIn('id', $current->pluck('partner_id')->unique()))
            ->with(['category:id,name', 'locations'])
            ->get();

        try {
            $payouts = $this->payouts->partnerAmounts($period);
        } catch (Throwable $e) {
            report($e);
            $payouts = [];
        }

        $byPartnerNow = $current->groupBy('partner_id');
        $byPartnerBefore = $previous->groupBy('partner_id');
        $table = $partners->map(function (Partner $partner) use ($byPartnerNow, $byPartnerBefore, $payouts) {
            $now = $byPartnerNow->get($partner->id, collect());
            $before = $byPartnerBefore->get($partner->id, collect());
            $location = $partner->locations->firstWhere('is_primary', true) ?? $partner->locations->first();

            return [
                'id' => $partner->id,
                'name' => $partner->trading_name ?: $partner->registered_name ?: "Partner #{$partner->id}",
                'category' => $partner->category?->name ?? 'Uncategorised',
                'region' => $location ? trim($location->district.', '.$location->region, ', ') : null,
                'is_demo' => (bool) $partner->is_demo,
                'members' => $this->members($now),
                'members_previous' => $this->members($before),
                'visits' => $now->count(),
                'sales' => $now->sum('bill_amount'),
                'discount' => $now->sum('discount_amount'),
                'paid' => $now->sum('paid_amount'),
                'payout' => $payouts[$partner->id] ?? 0,
                'last_visit_at' => $now->max('redeemed_at')?->toIso8601String(),
            ];
        })->sort(fn ($a, $b) => [$b['members'], $b['visits']] <=> [$a['members'], $a['visits']])->values();

        $firstYear = PartnerRedemption::query()->min('redeemed_at');

        return [
            'period' => $period->toArray(),
            'years' => ReportPeriod::years($firstYear ? CarbonImmutable::parse($firstYear)->year : CarbonImmutable::now()->year),
            'currency' => config('membership.currency', 'TZS'),
            'demo' => $current->contains('is_demo', true),
            'totals' => [
                'members' => ['current' => $this->members($current), 'previous' => $this->members($previous)],
                'visits' => ['current' => $current->count(), 'previous' => $previous->count()],
                'paid' => ['current' => $current->sum('paid_amount'), 'previous' => $previous->sum('paid_amount')],
                'discount' => ['current' => $current->sum('discount_amount'), 'previous' => $previous->sum('discount_amount')],
                'active_partners' => ['current' => $current->pluck('partner_id')->unique()->count(), 'previous' => $previous->pluck('partner_id')->unique()->count()],
                'approved_partners' => $partners->where('status', 'active')->count(),
                'payouts' => array_sum($payouts),
            ],
            'benefit_usage' => $this->benefitUsage($period, $current),
            'trend' => $this->trend($rows, $trend),
            'by_category' => $table->groupBy('category')->map(fn (Collection $set, $name) => [
                'name' => $name,
                'partners' => $set->count(),
                'members' => $this->members($current->whereIn('partner_id', $set->pluck('id'))),
                'visits' => $set->sum('visits'),
                'paid' => $set->sum('paid'),
            ])->sortByDesc('members')->values()->all(),
            'partners' => $table->all(),
        ];
    }

    /* ================================== Helpers ================================= */

    private function rows(CarbonImmutable $from, CarbonImmutable $to, ?int $partnerId = null): Collection
    {
        return PartnerRedemption::query()->completed()
            ->when($partnerId, fn ($q) => $q->where('partner_id', $partnerId))
            ->whereBetween('redeemed_at', [$from, $to])
            ->get(['id', 'partner_id', 'partner_location_id', 'member_ref', 'member_name', 'member_plan_name', 'vehicle_category', 'bill_amount', 'discount_amount', 'paid_amount', 'is_demo', 'redeemed_at']);
    }

    private function within(Collection $rows, CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        return $rows->filter(fn ($r) => $r->redeemed_at >= $start && $r->redeemed_at <= $end)->values();
    }

    private function members(Collection $rows): int
    {
        return $rows->pluck('member_ref')->unique()->count();
    }

    private function average(Collection $rows): int
    {
        return $rows->isEmpty() ? 0 : (int) round($rows->avg('bill_amount'));
    }

    /** @param array<int, CarbonImmutable> $months */
    private function trend(Collection $rows, array $months): array
    {
        $grouped = $rows->groupBy(fn ($r) => $r->redeemed_at->format('Y-m'));
        $now = CarbonImmutable::now();

        return array_map(function (CarbonImmutable $month) use ($grouped, $now) {
            $set = $grouped->get($month->format('Y-m'), collect());

            return [
                'key' => $month->format('Y-m'),
                'label' => $month->format('M'),
                'long' => $month->format('F Y'),
                'future' => $month > $now,
                'members' => $this->members($set),
                'visits' => $set->count(),
                'sales' => $set->sum('bill_amount'),
                'discount' => $set->sum('discount_amount'),
                'paid' => $set->sum('paid_amount'),
            ];
        }, $months);
    }

    private function breakdown(Collection $rows, string $field, string $fallback): array
    {
        return $rows->groupBy(fn ($r) => $r->{$field} ?: $fallback)->map(fn (Collection $set, $name) => [
            'name' => $name, 'members' => $this->members($set), 'visits' => $set->count(), 'paid' => $set->sum('paid_amount'),
        ])->sortByDesc('members')->values()->all();
    }

    /** Paying members in the period vs how many of them used a partner benefit. */
    private function benefitUsage(ReportPeriod $period, Collection $current): ?array
    {
        try {
            $start = $period->start;
            $end = $period->effectiveEnd();
            $active = collect($this->membership->subscriptions($start))
                ->filter(fn ($s) => CarbonImmutable::parse($s['started_at']) <= $end
                    && ($s['cancelled_at'] === null || CarbonImmutable::parse($s['cancelled_at']) >= $start))
                ->pluck('member_ref')->unique();
        } catch (Throwable $e) {
            report($e);

            return null;
        }

        $used = $current->pluck('member_ref')->unique()->intersect($active)->count();

        return [
            'active_members' => $active->count(),
            'members_used' => $used,
            'members_unused' => max(0, $active->count() - $used),
            'rate' => $active->count() > 0 ? round($used / $active->count() * 100, 1) : null,
        ];
    }

    public function benefitLabel($benefit): string
    {
        return match ($benefit->benefit_type) {
            'percentage_discount' => rtrim(rtrim(number_format((float) $benefit->discount_percentage, 2), '0'), '.').'% off',
            'fixed_discount' => 'TSh '.number_format((float) $benefit->discount_amount).' off',
            'special_pricing' => 'Special member pricing',
            'free_service' => 'Free service',
            'priority_service' => 'Priority service',
            default => 'Member offer',
        };
    }
}
