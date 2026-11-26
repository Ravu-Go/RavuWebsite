<?php

namespace App\Services\Members;

use App\Contracts\MemberDirectory;
use App\Services\RavuApp\AppDatabase;
use Carbon\CarbonImmutable;

/**
 * Looks members up in the RAVU app's database (ravu-api) for the partner counter.
 * Selected with MEMBERSHIP_MEMBER_SOURCE=database. Never cached: a member's
 * standing must be current when the partner serves them.
 *
 * A partner can find a member by:
 *   - member number: "RAVU-00042" (or the QR payload "ravu:member:RAVU-00042")
 *   - phone number: "0712 345 678", "+255712345678", ...
 *   - a member pass from the app: "RVU-" + 20 characters, valid for 15 minutes
 *
 * Standing mirrors the app's own OfferEligibility rule, so the website and the app
 * never disagree about who may use partner benefits:
 *   active    driver account, active, verified phone, membership active today
 *   suspended account suspended/closed, or phone not verified
 *   expired   no membership, or it has ended
 */
class DatabaseMemberDirectory implements MemberDirectory
{
    public function __construct(private readonly AppDatabase $db) {}

    public function isDemo(): bool
    {
        return false;
    }

    public function find(string $query): ?array
    {
        $userId = $this->resolve(trim($query));
        if ($userId === null) {
            return null;
        }

        $db = $this->db->connection();
        $user = $db->table('users')->where('id', $userId)->where('role', 'driver')
            ->first(['id', 'name', 'phone', 'phone_verified_at', 'status']);
        if (! $user) {
            return null;
        }

        $membership = $db->table('memberships as m')->join('membership_plans as p', 'p.id', '=', 'm.membership_plan_id')
            ->where('m.user_id', $user->id)->first(['m.starts_at', 'm.ends_at', 'm.status', 'p.code', 'p.name']);
        $vehicle = $db->table('driver_profiles')->where('user_id', $user->id)->first(['vehicle_type', 'vehicle_plate']);
        $since = $db->table('payments')->where('user_id', $user->id)->where('status', 'settled')->min('membership_starts_at');

        $now = CarbonImmutable::now();
        $current = $membership && $membership->status === 'active'
            && CarbonImmutable::parse($membership->starts_at, 'UTC')->lte($now)
            && CarbonImmutable::parse($membership->ends_at, 'UTC')->gt($now);

        return [
            'member_ref' => AppDatabase::ref($user->id),
            'name' => $user->name ?: 'RAVU member',
            'phone_masked' => AppDatabase::maskPhone($user->phone),
            'photo_url' => null, // Profile photos are private in the app; not shared with partners.
            'plan_id' => $membership?->code,
            'plan_name' => $membership?->name,
            'vehicle_category' => AppDatabase::vehicle($vehicle?->vehicle_type),
            'plate_number' => $vehicle?->vehicle_plate,
            'status' => match (true) {
                $user->status !== 'active' || ! $user->phone_verified_at => 'suspended',
                $current => 'active',
                default => 'expired',
            },
            'member_since' => AppDatabase::iso($since ?? $membership?->starts_at),
            'valid_until' => AppDatabase::iso($membership?->ends_at),
        ];
    }

    private function resolve(string $query): ?int
    {
        if ($query === '') {
            return null;
        }
        if (($id = AppDatabase::idFromRef($query)) !== null) {
            return $id;
        }
        if (preg_match('/^RVU-[A-Za-z0-9]{20}$/', $query)) {
            $pass = $this->db->connection()->table('member_passes')->where('code', $query)
                ->where('expires_at', '>', AppDatabase::utc(now()))->value('user_id');

            return $pass === null ? null : (int) $pass;
        }
        if ($phone = AppDatabase::phone($query)) {
            $id = $this->db->connection()->table('users')->where('phone', $phone)->value('id');

            return $id === null ? null : (int) $id;
        }

        return null;
    }
}
