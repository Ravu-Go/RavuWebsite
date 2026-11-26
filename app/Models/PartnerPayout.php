<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A partner's approved share of one month's payout pool (frozen figures).
 */
class PartnerPayout extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'subscription_revenue' => 'integer',
            'pool_percent' => 'float',
            'pool_amount' => 'integer',
            'members_served' => 'integer',
            'total_members_served' => 'integer',
            'visits' => 'integer',
            'share_percent' => 'float',
            'amount' => 'integer',
            'is_demo' => 'boolean',
            'approved_at' => 'immutable_datetime',
            'paid_at' => 'immutable_datetime',
        ];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
