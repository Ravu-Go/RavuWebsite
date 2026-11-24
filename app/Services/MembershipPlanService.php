<?php

namespace App\Services;

use App\Models\MembershipPlan;
use App\Models\MembershipPlanPrice;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * The membership plan catalogue: admin view, the public feed the app reads,
 * and price changes with history.
 */
class MembershipPlanService
{
    public const DEFAULT_NOTICE_DAYS = 30;

    /** Everything the admin "Plans" section needs. */
    public function admin(): array
    {
        $plans = MembershipPlan::query()->ordered()->with(['prices.author:id,name'])->get();

        return [
            'plans' => $plans->map(fn (MembershipPlan $plan) => [
                ...$plan->only(['id', 'slug', 'name', 'tagline', 'description', 'interval', 'price', 'currency', 'trial_days', 'member_limit', 'status', 'is_featured', 'is_sample', 'sort_order']),
                'benefits' => $plan->benefits ?? [],
                'monthly_price' => (int) round($plan->monthlyPrice()),
                'published_at' => $plan->published_at?->toIso8601String(),
                'retired_at' => $plan->retired_at?->toIso8601String(),
                'updated_at' => $plan->updated_at?->toIso8601String(),
                'pending_change' => $this->pending($plan),
                'price_history' => $plan->prices->take(10)->map(fn (MembershipPlanPrice $p) => [
                    'id' => $p->id,
                    'price' => $p->price,
                    'previous_price' => $p->previous_price,
                    'existing_members' => $p->existing_members,
                    'existing_effective_at' => $p->existing_effective_at?->toIso8601String(),
                    'reason' => $p->reason,
                    'by' => $p->author?->name,
                    'at' => $p->created_at?->toIso8601String(),
                ])->values()->all(),
            ])->all(),
            'has_samples' => $plans->contains('is_sample', true),
            'endpoint' => url('/api/mobile/plans'),
            'default_notice_days' => self::DEFAULT_NOTICE_DAYS,
        ];
    }

    /**
     * What the app (and the app's backend) reads. Active plans are open for sign-up;
     * retired plans are listed so existing members can still see what they're on.
     */
    public function publicPayload(): array
    {
        $plans = MembershipPlan::query()->whereIn('status', ['active', 'retired'])->ordered()->with('prices')->get();

        return [
            'currency' => 'TZS',
            'generated_at' => now()->toIso8601String(),
            'plans' => $plans->map(fn (MembershipPlan $plan) => [
                'id' => $plan->slug,
                'name' => $plan->name,
                'tagline' => $plan->tagline,
                'description' => $plan->description,
                'benefits' => $plan->benefits ?? [],
                'price' => $plan->price,
                'currency' => $plan->currency,
                'interval' => $plan->interval,
                'trial_days' => $plan->trial_days,
                'member_limit' => $plan->member_limit,
                'featured' => $plan->is_featured,
                'status' => $plan->status,
                'available_for_signup' => $plan->status === 'active',
                'sort_order' => $plan->sort_order,
                // For members already on this plan: a new price they'll move to at renewal.
                'existing_members_change' => $this->pending($plan),
            ])->values()->all(),
        ];
    }

    /** Plans in the shape the revenue page uses. */
    public function revenuePlans(): array
    {
        return MembershipPlan::query()->whereIn('status', ['active', 'retired'])->ordered()->get()
            ->map(fn (MembershipPlan $plan) => ['id' => $plan->slug, 'name' => $plan->name, 'price' => $plan->price, 'interval' => $plan->interval])
            ->all();
    }

    /**
     * Change a published plan's price. New sign-ups pay the new price immediately;
     * existing members either keep their price or move to it after the notice period.
     */
    public function changePrice(MembershipPlan $plan, int $price, string $existing, int $noticeDays, ?string $reason, User $user): MembershipPlanPrice
    {
        return DB::transaction(function () use ($plan, $price, $existing, $noticeDays, $reason, $user) {
            $change = $plan->prices()->create([
                'price' => $price,
                'previous_price' => $plan->price,
                'existing_members' => $existing,
                'notice_days' => $existing === 'next_renewal' ? $noticeDays : 0,
                'existing_effective_at' => $existing === 'next_renewal' ? now()->addDays($noticeDays) : null,
                'reason' => $reason,
                'changed_by' => $user->id,
            ]);
            $plan->update(['price' => $price, 'is_sample' => false, 'updated_by' => $user->id]);

            return $change;
        });
    }

    private function pending(MembershipPlan $plan): ?array
    {
        $change = $plan->pendingChange();

        return $change ? [
            'price' => $change->price,
            'previous_price' => $change->previous_price,
            'effective_at' => $change->existing_effective_at->toIso8601String(),
        ] : null;
    }
}
