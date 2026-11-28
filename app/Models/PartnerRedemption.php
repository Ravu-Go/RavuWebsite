<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * One visit where a partner served a verified RAVU member and applied the member discount.
 */
class PartnerRedemption extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'bill_amount' => 'integer',
            'discount_amount' => 'integer',
            'paid_amount' => 'integer',
            'is_demo' => 'boolean',
            'redeemed_at' => 'immutable_datetime',
            'voided_at' => 'immutable_datetime',
        ];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(PartnerLocation::class, 'partner_location_id');
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /** Redemptions that count towards reports and payouts (not voided). */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    /** "RV-2611-7KQ2M": year+month, then a random suffix, short enough to read out at the till. */
    public static function newReceiptNumber(?\DateTimeInterface $at = null): string
    {
        $prefix = 'RV-'.($at ? $at->format('ym') : now()->format('ym')).'-';
        do {
            $number = $prefix.strtoupper(Str::random(5));
        } while (static::where('receipt_no', $number)->exists());

        return $number;
    }

    /** "Hamisi Mrema" -> "Hamisi M." — what reports keep about a member. */
    public static function shortName(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [];
        $first = array_shift($parts) ?: 'Member';
        $last = array_pop($parts);

        return $last ? $first.' '.mb_strtoupper(mb_substr($last, 0, 1)).'.' : $first;
    }
}
