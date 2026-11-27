<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Whether sign-in uses the RAVU app's own users table (see config/ravu_app.php).
 *
 * RAVU_APP_SHARED_ACCOUNTS wins when set. Otherwise it is detected: on PostgreSQL,
 * accounts are shared when "users" resolves (through the search_path) to a table
 * outside the website's own schema, i.e. the app's public.users.
 */
class RavuAppAccounts
{
    private static ?bool $detected = null;

    public static function shared(): bool
    {
        $configured = config('ravu_app.shared_accounts');
        if ($configured !== null && $configured !== '') {
            return filter_var($configured, FILTER_VALIDATE_BOOL);
        }

        return self::$detected ??= self::detect();
    }

    /** Forget the detected value (tests, or after switching connections). */
    public static function flush(): void
    {
        self::$detected = null;
    }

    private static function detect(): bool
    {
        try {
            if (DB::connection()->getDriverName() !== 'pgsql') {
                return false;
            }

            $row = DB::selectOne(
                "select n.nspname as users_schema, current_schema() as current_schema
                 from pg_class c join pg_namespace n on n.oid = c.relnamespace
                 where c.oid = to_regclass('users')"
            );

            return $row !== null && $row->users_schema !== $row->current_schema;
        } catch (Throwable $e) {
            report($e);

            return false;
        }
    }
}
