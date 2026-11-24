<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One price change in a plan's history. */
class MembershipPlanPrice extends Model
{
    protected $fillable = ['membership_plan_id', 'price', 'previous_price', 'existing_members', 'notice_days', 'existing_effective_at', 'reason', 'changed_by'];

    protected function casts(): array
    {
        return ['price' => 'integer', 'previous_price' => 'integer', 'existing_effective_at' => 'datetime'];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class, 'membership_plan_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
