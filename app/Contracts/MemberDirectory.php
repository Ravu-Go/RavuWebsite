<?php

namespace App\Contracts;

/**
 * Looks up RAVU members (subscribers) for the partner verifier.
 *
 * The mobile app's backend owns member accounts. Until it is live the demo directory
 * builds members from the membership data source; switching to the real API is a
 * config change (MEMBERSHIP_MEMBER_SOURCE=api).
 *
 * find() accepts what a cashier can type or scan: a member ID ("RAVU-10432"), the
 * member's phone number ("0754 123 456" / "+255754123456") or the QR payload from the
 * member's app ("ravu:member:RAVU-10432"). It returns null when nothing matches, else:
 *
 *   {
 *     member_ref: string,            // "RAVU-10432"
 *     name: string,                  // full name, shown only at the counter
 *     phone_masked: ?string,         // "+255 75• ••• 456"
 *     photo_url: ?string,
 *     plan_id: ?string, plan_name: ?string,
 *     vehicle_category: ?string,     // "Motorcycle (boda boda)", "Bajaj", "Private car", ...
 *     plate_number: ?string,
 *     status: "active"|"expired"|"suspended",
 *     member_since: ?ISO-8601,
 *     valid_until: ?ISO-8601,        // end of the current paid period
 *   }
 */
interface MemberDirectory
{
    public function isDemo(): bool;

    public function find(string $query): ?array;
}
