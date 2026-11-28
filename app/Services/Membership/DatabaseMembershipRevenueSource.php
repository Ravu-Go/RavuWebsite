<?php

namespace App\Services\Membership;

use App\Contracts\MembershipRevenueSource;
use App\Services\RavuApp\AppDatabase;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

/**
 * Membership plans, memberships and payments read straight from the RAVU app's
 * database (ravu-api). Selected with MEMBERSHIP_REVENUE_SOURCE=database.
 *
 * How the app's data maps onto the website's contract:
 *
 *   plans          membership_plans (BASIC / PRO / ELITE), billed once a year
 *   subscriptions  one per member (memberships has one row per user, renewed in place).
 *                  started_at = first paid membership period; cancelled_at = the
 *                  end date once the membership has lapsed without renewal.
 *   payments       payments: settled → paid, failed → failed, refunded → refunded.
 *                  Queued / pending / unknown attempts are not income yet and are left out.
 */
class DatabaseMembershipRevenueSource implements MembershipRevenueSource
{
    public function __construct(private readonly AppDatabase $db) {}

    public function label(): string
    {
        return 'RAVU app database';
    }

    public function isDemo(): bool
    {
        return false;
    }

    public function plans(): array
    {
        return $this->db->connection()->table('membership_plans')->orderBy('annual_amount')->get()
            ->map(fn ($p) => ['id' => $p->code, 'name' => $p->name, 'price' => (int) $p->annual_amount, 'interval' => 'year'])
            ->all();
    }

    public function subscriptions(CarbonInterface $since): array
    {
        $db = $this->db->connection();
        $rows = $db->table('memberships as m')
            ->join('users as u', 'u.id', '=', 'm.user_id')
            ->join('membership_plans as p', 'p.id', '=', 'm.membership_plan_id')
            ->where('m.ends_at', '>=', AppDatabase::utc($since))
            ->get(['m.user_id', 'm.starts_at', 'm.ends_at', 'm.status', 'm.updated_at', 'u.phone', 'p.code']);

        // Renewals move memberships.starts_at forward, so take the member's first paid period.
        $firstPaid = $db->table('payments')->where('status', 'settled')->whereIn('user_id', $rows->pluck('user_id'))
            ->groupBy('user_id')->selectRaw('user_id, min(membership_starts_at) as first_start')->pluck('first_start', 'user_id');

        $now = CarbonImmutable::now();

        return $rows->map(function ($m) use ($firstPaid, $now) {
            $ends = CarbonImmutable::parse($m->ends_at, 'UTC');
            // Ran out without renewal → ended on its end date. Ended early by staff
            // (status no longer active) → ended when the row last changed.
            $ended = match (true) {
                $m->status !== 'active' => $ends->min(CarbonImmutable::parse($m->updated_at, 'UTC'))->min($now),
                $ends->lte($now) => $ends,
                default => null,
            };
            $ref = AppDatabase::ref($m->user_id);

            return [
                'id' => $ref,
                'plan_id' => $m->code,
                'member_ref' => $ref,
                'member_phone' => AppDatabase::maskPhone($m->phone),
                'started_at' => AppDatabase::iso($firstPaid[$m->user_id] ?? $m->starts_at),
                'cancelled_at' => $ended?->setTimezone(config('app.timezone'))->toIso8601String(),
            ];
        })->all();
    }

    public function payments(CarbonInterface $from, CarbonInterface $to): array
    {
        [$start, $end] = [AppDatabase::utc($from), AppDatabase::utc($to)];

        $query = $this->db->connection()->table('payments as pay')
            ->join('membership_plans as p', 'p.id', '=', 'pay.membership_plan_id')
            ->whereIn('pay.status', ['settled', 'failed', 'refunded'])
            ->where(fn ($q) => $q->whereBetween('pay.settled_at', [$start, $end])
                ->orWhere(fn ($q) => $q->whereNull('pay.settled_at')->whereBetween('pay.updated_at', [$start, $end])));

        if (! $this->db->includeSimulated()) {
            $query->where('pay.simulated', false);
        }

        return $query->orderBy('pay.id')
            ->get(['pay.id', 'pay.reference', 'pay.user_id', 'pay.status', 'pay.amount', 'pay.provider', 'pay.settled_at', 'pay.updated_at', 'p.code'])
            ->map(fn ($p) => [
                'id' => $p->reference ?: (string) $p->id,
                'subscription_id' => AppDatabase::ref($p->user_id),
                'plan_id' => $p->code,
                'amount' => (int) $p->amount,
                'method' => match ($p->provider) {
                    'azampesa' => 'AzamPesa',
                    null, '' => 'Unknown',
                    default => ucfirst($p->provider),
                },
                'status' => match ($p->status) {
                    'settled' => 'paid',
                    'refunded' => 'refunded',
                    default => 'failed',
                },
                'paid_at' => AppDatabase::iso($p->settled_at ?? $p->updated_at),
            ])->all();
    }
}
