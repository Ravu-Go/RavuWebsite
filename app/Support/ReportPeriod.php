<?php

namespace App\Support;

use Carbon\CarbonImmutable;

/**
 * A reporting window: one calendar month ("2026-11") or one calendar year ("2026").
 *
 * Partner performance, the Super Admin leaderboard and payouts all accept the same
 * `period` query value, so the filters behave identically everywhere.
 */
final class ReportPeriod
{
    private function __construct(
        public readonly string $type,
        public readonly CarbonImmutable $start,
    ) {}

    public static function month(int $year, int $month): self
    {
        return new self('month', CarbonImmutable::create($year, $month, 1)->startOfMonth());
    }

    public static function year(int $year): self
    {
        return new self('year', CarbonImmutable::create($year, 1, 1)->startOfYear());
    }

    /** Parse "YYYY-MM" or "YYYY"; anything else (or a future period) falls back to the current month. */
    public static function parse(?string $value): self
    {
        $now = CarbonImmutable::now();
        $value = trim((string) $value);

        if (preg_match('/^(\d{4})-(0[1-9]|1[0-2])$/', $value, $m)) {
            $period = self::month((int) $m[1], (int) $m[2]);
        } elseif (preg_match('/^(\d{4})$/', $value, $m)) {
            $period = self::year((int) $m[1]);
        } else {
            return self::month($now->year, $now->month);
        }

        return $period->start > $now || $period->start->year < 2000 ? self::month($now->year, $now->month) : $period;
    }

    public function end(): CarbonImmutable
    {
        return $this->type === 'month' ? $this->start->endOfMonth() : $this->start->endOfYear();
    }

    /** End of the window, capped at "now" for a period that is still running. */
    public function effectiveEnd(): CarbonImmutable
    {
        return $this->end()->min(CarbonImmutable::now());
    }

    public function isRunning(): bool
    {
        return $this->end() >= CarbonImmutable::now();
    }

    public function previous(): self
    {
        return $this->type === 'month'
            ? self::month($this->start->subMonth()->year, $this->start->subMonth()->month)
            : self::year($this->start->year - 1);
    }

    /**
     * The window to compare against: the previous period, cut to the same elapsed
     * length while this one is still running (1–24 Nov is compared with 1–24 Oct,
     * not with the whole of October).
     *
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    public function comparison(): array
    {
        $previous = $this->previous();
        if (! $this->isRunning()) {
            return [$previous->start, $previous->end()];
        }
        $elapsed = (int) $this->start->diffInSeconds(CarbonImmutable::now());

        return [$previous->start, $previous->start->addSeconds($elapsed)->min($previous->end())];
    }

    public function comparisonLabel(): string
    {
        if (! $this->isRunning()) {
            return $this->previous()->label();
        }
        [$start, $end] = $this->comparison();

        return $this->type === 'month'
            ? $start->format('j').'–'.$end->format('j M Y')
            : $start->format('j M').'–'.$end->format('j M Y');
    }

    public function key(): string
    {
        return $this->type === 'month' ? $this->start->format('Y-m') : $this->start->format('Y');
    }

    public function label(): string
    {
        return $this->type === 'month' ? $this->start->format('F Y') : $this->start->format('Y');
    }

    /**
     * The months a trend chart shows for this period: the twelve months of a year,
     * or the twelve months ending with the selected month.
     *
     * @return array<int, CarbonImmutable> month starts
     */
    public function trendMonths(): array
    {
        $first = $this->type === 'year' ? $this->start : $this->start->subMonths(11);

        return array_map(fn (int $i) => $first->addMonths($i), range(0, 11));
    }

    public function toArray(): array
    {
        return [
            'key' => $this->key(),
            'type' => $this->type,
            'label' => $this->label(),
            'previous_key' => $this->previous()->key(),
            'previous_label' => $this->comparisonLabel(),
            'running' => $this->isRunning(),
        ];
    }

    /** Years the period pickers offer, newest first, from $firstYear to this year. */
    public static function years(int $firstYear): array
    {
        $current = CarbonImmutable::now()->year;

        return range($current, min($current, max(2000, $firstYear)));
    }
}
