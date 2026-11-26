<?php

namespace App\Services\RavuApp;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Facades\DB;

/**
 * Read-only access to the RAVU app's own database (the ravu-api PostgreSQL).
 *
 * The website never writes here. Use a database role that only has SELECT on
 * users, memberships, membership_plans, payments, member_passes and driver_profiles.
 *
 * The API stores every timestamp in UTC; these helpers convert at the boundary so
 * the rest of the website keeps working in its own timezone.
 */
class AppDatabase
{
    public function __construct(private readonly array $config) {}

    public function connection(): ConnectionInterface
    {
        return DB::connection($this->config['connection'] ?? 'ravu_api');
    }

    /** Count payments the API marks as simulated (local/staging test payments) as real income. */
    public function includeSimulated(): bool
    {
        return (bool) ($this->config['include_simulated'] ?? false);
    }

    /** API user id 42 → "RAVU-00042", the member number partners see. */
    public static function ref(int|string $userId): string
    {
        return 'RAVU-'.str_pad((string) $userId, 5, '0', STR_PAD_LEFT);
    }

    /** "RAVU-00042", "ravu-42" or a "ravu:member:RAVU-00042" QR payload → 42. */
    public static function idFromRef(string $value): ?int
    {
        return preg_match('/^(?:ravu:member:)?RAVU-?(\d{1,12})$/i', trim($value), $m) ? (int) $m[1] : null;
    }

    /**
     * Normalise a Tanzanian mobile number to the API's stored E.164 form.
     * "0712 345 678", "255712345678", "+255 712 345 678" and "712345678" → "+255712345678".
     */
    public static function phone(string $value): ?string
    {
        $digits = preg_replace('/\D/', '', $value);

        return match (true) {
            strlen($digits) === 12 && str_starts_with($digits, '255') => '+'.$digits,
            strlen($digits) === 10 && str_starts_with($digits, '0') => '+255'.substr($digits, 1),
            strlen($digits) === 9 && in_array($digits[0], ['6', '7'], true) => '+255'.$digits,
            default => null,
        };
    }

    /** "+255712345678" → "+255 7•• ••• 678". */
    public static function maskPhone(?string $phone): ?string
    {
        if (! $phone || strlen($phone) < 7) {
            return null;
        }

        return substr($phone, 0, 4).' '.$phone[4].'•• ••• '.substr($phone, -3);
    }

    public static function vehicle(?string $type): ?string
    {
        return match ($type) {
            'motorcycle' => 'Motorcycle (boda boda)',
            'tuktuk' => 'Bajaj',
            'car' => 'Car',
            null, '' => null,
            default => ucfirst($type),
        };
    }

    /** Website time → the UTC string the API's timestamp columns compare against. */
    public static function utc(CarbonInterface $at): string
    {
        return CarbonImmutable::instance($at)->utc()->format('Y-m-d H:i:s');
    }

    /** An API UTC timestamp → ISO-8601 in the website's timezone. */
    public static function iso(?string $value): ?string
    {
        return $value ? CarbonImmutable::parse($value, 'UTC')->setTimezone(config('app.timezone'))->toIso8601String() : null;
    }
}
