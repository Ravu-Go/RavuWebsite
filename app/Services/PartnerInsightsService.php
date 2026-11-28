<?php

namespace App\Services;

use App\Models\Partner;
use App\Models\PartnerApplication;
use App\Models\PartnerApplicationStatusHistory;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * Partner-programme trends for the Super Admin "Insights" section.
 *
 * Every figure comes from timestamps the app already records: a partner's
 * created_at (registration) and the application status history (submitted,
 * approved, rejected). Events are bucketed in PHP so the queries stay portable
 * across MySQL and SQLite.
 */
class PartnerInsightsService
{
    /** range key => [unit, number of buckets] */
    public const RANGES = [
        '30d' => ['day', 30],
        '12w' => ['week', 12],
        '12m' => ['month', 12],
    ];

    public const DEFAULT_RANGE = '12w';

    public function build(string $range): array
    {
        $range = array_key_exists($range, self::RANGES) ? $range : self::DEFAULT_RANGE;
        [$unit, $count] = self::RANGES[$range];

        $now = CarbonImmutable::now();
        $start = $this->bucketStart($now, $unit)->sub($count - 1, $unit);
        $previousStart = $start->sub($count, $unit);

        $partners = Partner::query()
            ->where('created_at', '>=', $previousStart)
            ->with('category:id,name')
            ->get(['id', 'created_at', 'partner_category_id']);

        $events = PartnerApplicationStatusHistory::query()
            ->whereIn('new_status', ['submitted', 'approved', 'rejected'])
            ->where('created_at', '>=', $previousStart)
            ->get(['partner_application_id', 'new_status', 'created_at']);

        $series = [
            'registered' => $partners->pluck('created_at'),
            'submitted' => $events->where('new_status', 'submitted')->pluck('created_at'),
            'approved' => $events->where('new_status', 'approved')->pluck('created_at'),
        ];

        return [
            'range' => $range,
            'unit' => $unit,
            'periods' => $this->periods($series, $start, $unit, $count),
            'totals' => collect($series)->map(fn (Collection $dates) => [
                'current' => $dates->filter(fn ($at) => $at >= $start)->count(),
                'previous' => $dates->filter(fn ($at) => $at >= $previousStart && $at < $start)->count(),
            ])->all(),
            'review' => $this->review($events->filter(fn ($e) => $e->created_at >= $start)),
            'funnel' => $this->funnel($partners->filter(fn ($p) => $p->created_at >= $start)),
            'categories' => $partners
                ->filter(fn ($p) => $p->created_at >= $start)
                ->groupBy(fn ($p) => $p->category?->name ?? 'Not chosen yet')
                ->map(fn (Collection $group, string $name) => ['name' => $name, 'count' => $group->count()])
                ->sortByDesc('count')
                ->values()
                ->all(),
        ];
    }

    private function bucketStart(CarbonImmutable $at, string $unit): CarbonImmutable
    {
        return match ($unit) {
            'day' => $at->startOfDay(),
            'week' => $at->startOfWeek(),
            'month' => $at->startOfMonth(),
        };
    }

    private function periods(array $series, CarbonImmutable $start, string $unit, int $count): array
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
                'registered' => 0,
                'submitted' => 0,
                'approved' => 0,
            ];
        }

        foreach ($series as $key => $dates) {
            foreach ($dates as $at) {
                $bucket = $this->bucketStart(CarbonImmutable::parse($at), $unit)->toDateString();
                if (isset($periods[$bucket])) {
                    $periods[$bucket][$key]++;
                }
            }
        }

        return array_values($periods);
    }

    /** Median days from the latest submission to each decision made in the range. */
    private function review(Collection $events): array
    {
        $decisions = $events->whereIn('new_status', ['approved', 'rejected']);
        if ($decisions->isEmpty()) {
            return ['median_days' => null, 'decisions' => 0, 'approval_rate' => null];
        }

        $submissions = PartnerApplicationStatusHistory::query()
            ->where('new_status', 'submitted')
            ->whereIn('partner_application_id', $decisions->pluck('partner_application_id')->unique())
            ->get(['partner_application_id', 'created_at'])
            ->groupBy('partner_application_id');

        $durations = $decisions
            ->map(function ($decision) use ($submissions) {
                $submitted = ($submissions[$decision->partner_application_id] ?? collect())
                    ->filter(fn ($s) => $s->created_at <= $decision->created_at)
                    ->max('created_at');

                return $submitted ? abs($submitted->diffInMinutes($decision->created_at)) / 1440 : null;
            })
            ->filter(fn ($days) => $days !== null)
            ->sort()
            ->values();

        $median = null;
        if ($durations->isNotEmpty()) {
            $middle = intdiv($durations->count(), 2);
            $median = $durations->count() % 2
                ? $durations[$middle]
                : ($durations[$middle - 1] + $durations[$middle]) / 2;
        }

        return [
            'median_days' => $median === null ? null : round($median, 1),
            'decisions' => $decisions->count(),
            'approval_rate' => round($decisions->where('new_status', 'approved')->count() / $decisions->count() * 100),
        ];
    }

    /** Of the partners who registered in the range, how far each has progressed so far. */
    private function funnel(Collection $partners): array
    {
        $applications = PartnerApplication::query()->whereIn('partner_id', $partners->pluck('id'));

        return [
            'registered' => $partners->count(),
            'submitted' => (clone $applications)->whereNotNull('submitted_at')->distinct()->count('partner_id'),
            'approved' => (clone $applications)->whereNotNull('approved_at')->distinct()->count('partner_id'),
        ];
    }
}
