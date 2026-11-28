<?php

namespace App\Contracts;

use Carbon\CarbonInterface;

/**
 * Where membership plans, subscriptions and payments come from.
 *
 * The Super Admin revenue page only talks to this contract, so swapping the demo
 * data for the real memberships API is a config change (MEMBERSHIP_REVENUE_SOURCE=api).
 *
 * Shapes every implementation returns (amounts are whole currency units, e.g. TZS):
 *
 *   plans():          [{ id: string, name: string, price: int, interval: "month"|"quarter"|"year" }]
 *   subscriptions():  [{ id: string, plan_id: string, member_ref: string, member_phone: ?string,
 *                        started_at: ISO-8601, cancelled_at: ?ISO-8601 }]
 *   payments():       [{ id: string, subscription_id: string, plan_id: string, amount: int,
 *                        method: string, status: "paid"|"failed"|"refunded", paid_at: ISO-8601 }]
 */
interface MembershipRevenueSource
{
    /** Human-readable name of the source, shown on the page. */
    public function label(): string;

    /** True when the figures are sample data rather than real payments. */
    public function isDemo(): bool;

    /** @return array<int, array{id: string, name: string, price: int, interval: string}> */
    public function plans(): array;

    /** Subscriptions active at any point on or after $since (including still-active ones). */
    public function subscriptions(CarbonInterface $since): array;

    /** Payment attempts made between $from and $to. */
    public function payments(CarbonInterface $from, CarbonInterface $to): array;
}
