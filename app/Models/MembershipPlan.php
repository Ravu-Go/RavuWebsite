<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A RAVU membership plan.
 *
 * Lifecycle: draft (being prepared, editable, deletable) → active (open for
 * sign-ups) → retired (closed to new members; existing members keep it).
 * Plans people have used are retired, never deleted.
 */
class MembershipPlan extends Model
{
    public const INTERVALS = ['month', 'quarter', 'year'];

    public const STATUSES = ['draft', 'active', 'retired'];

    protected $fillable = [
        'slug', 'name', 'tagline', 'description', 'benefits', 'interval', 'price', 'currency', 'trial_days',
        'member_limit', 'status', 'is_featured', 'is_sample', 'sort_order', 'published_at', 'retired_at', 'created_by', 'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'benefits' => 'array',
            'price' => 'integer',
            'trial_days' => 'integer',
            'member_limit' => 'integer',
            'is_featured' => 'boolean',
            'is_sample' => 'boolean',
            'published_at' => 'datetime',
            'retired_at' => 'datetime',
        ];
    }

    public function prices(): HasMany
    {
        return $this->hasMany(MembershipPlanPrice::class)->latest('id');
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /** Price per month, for comparisons and MRR. */
    public function monthlyPrice(): float
    {
        return match ($this->interval) {
            'year' => $this->price / 12,
            'quarter' => $this->price / 3,
            default => (float) $this->price,
        };
    }

    /**
     * A price change existing members haven't reached yet. Only the latest change counts:
     * a newer decision (e.g. "keep their price") replaces an earlier pending one.
     */
    public function pendingChange(): ?MembershipPlanPrice
    {
        $latest = $this->prices->first();

        return $latest && $latest->existing_members === 'next_renewal' && $latest->existing_effective_at?->isFuture() ? $latest : null;
    }
}
