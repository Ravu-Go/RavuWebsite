<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\MembershipPlan;
use App\Services\MembershipPlanService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Super Admin management of membership plans. Every change is written to the activity log.
 */
class MembershipPlanController extends Controller
{
    public function __construct(private readonly MembershipPlanService $plans) {}

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $plan = MembershipPlan::create([
            ...$data,
            'status' => 'draft',
            'currency' => 'TZS',
            'sort_order' => (int) MembershipPlan::max('sort_order') + 1,
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);
        ActivityLog::record('membership', 'plan_created', ['name' => $plan->name, 'price' => $plan->price, 'interval' => $plan->interval], $plan);

        return back()->with('success', "{$plan->name} saved as a draft. Publish it when it's ready for sign-ups.");
    }

    public function update(Request $request, MembershipPlan $plan): RedirectResponse
    {
        $data = $this->validated($request, $plan);

        // Once published, the ID is used by the app and subscriptions, and price changes go through "Change price".
        if (! $plan->isDraft()) {
            unset($data['slug'], $data['price']);
        }

        $plan->fill([...$data, 'is_sample' => false, 'updated_by' => $request->user()->id]);
        $changed = array_values(array_diff(array_keys($plan->getDirty()), ['updated_by', 'is_sample']));
        $plan->save();

        if ($changed) {
            ActivityLog::record('membership', 'plan_updated', ['name' => $plan->name, 'changed' => $changed], $plan);
        }

        return back()->with('success', "{$plan->name} updated.");
    }

    public function changePrice(Request $request, MembershipPlan $plan): RedirectResponse
    {
        abort_if($plan->isDraft(), 422, 'Edit a draft plan\'s price directly.');

        $data = $request->validate([
            'price' => ['required', 'integer', 'min:0', 'max:100000000'],
            'existing_members' => ['required', Rule::in(['keep', 'next_renewal'])],
            'notice_days' => ['required_if:existing_members,next_renewal', 'nullable', 'integer', 'min:0', 'max:180'],
            'reason' => ['nullable', 'string', 'max:280'],
        ]);

        if ((int) $data['price'] === $plan->price) {
            throw ValidationException::withMessages(['price' => 'Enter a price different from the current one.']);
        }

        $from = $plan->price;
        $change = $this->plans->changePrice($plan, (int) $data['price'], $data['existing_members'], (int) ($data['notice_days'] ?? 0), $data['reason'] ?? null, $request->user());

        ActivityLog::record('membership', 'plan_price_changed', [
            'name' => $plan->name,
            'from' => $from,
            'to' => $change->price,
            'existing' => $change->existing_members === 'keep' ? 'Keep their current price' : "Move at renewal after {$change->notice_days} days",
            'comment' => $change->reason,
        ], $plan);

        return back()->with('success', "{$plan->name} now costs TSh ".number_format($change->price).' for new members.');
    }

    public function publish(Request $request, MembershipPlan $plan): RedirectResponse
    {
        abort_unless($plan->isDraft(), 422, 'Only draft plans can be published.');
        $plan->update(['status' => 'active', 'published_at' => now(), 'updated_by' => $request->user()->id]);
        ActivityLog::record('membership', 'plan_published', ['name' => $plan->name], $plan);

        return back()->with('success', "{$plan->name} is live. New members can choose it in the app.");
    }

    public function retire(Request $request, MembershipPlan $plan): RedirectResponse
    {
        abort_unless($plan->status === 'active', 422, 'Only active plans can be retired.');
        if (MembershipPlan::where('status', 'active')->count() === 1) {
            throw ValidationException::withMessages(['plan' => 'Keep at least one active plan so new members can join.']);
        }
        $plan->update(['status' => 'retired', 'retired_at' => now(), 'is_featured' => false, 'updated_by' => $request->user()->id]);
        ActivityLog::record('membership', 'plan_retired', ['name' => $plan->name], $plan);

        return back()->with('success', "{$plan->name} is closed to new members. Existing members keep it.");
    }

    public function reactivate(Request $request, MembershipPlan $plan): RedirectResponse
    {
        abort_unless($plan->status === 'retired', 422, 'Only retired plans can be reactivated.');
        $plan->update(['status' => 'active', 'retired_at' => null, 'updated_by' => $request->user()->id]);
        ActivityLog::record('membership', 'plan_reactivated', ['name' => $plan->name], $plan);

        return back()->with('success', "{$plan->name} is open for sign-ups again.");
    }

    public function destroy(MembershipPlan $plan): RedirectResponse
    {
        // Published plans may have members and revenue history: retire them instead.
        abort_unless($plan->isDraft(), 422, 'Only draft plans can be deleted. Retire published plans instead.');
        $plan->delete();
        ActivityLog::record('membership', 'plan_deleted', ['name' => $plan->name], $plan);

        return back()->with('success', "Draft {$plan->name} deleted.");
    }

    public function move(Request $request, MembershipPlan $plan): RedirectResponse
    {
        $direction = $request->validate(['direction' => ['required', Rule::in(['up', 'down'])]])['direction'];

        DB::transaction(function () use ($plan, $direction) {
            $ordered = MembershipPlan::query()->ordered()->get()->values();
            $index = $ordered->search(fn ($p) => $p->id === $plan->id);
            $swap = $direction === 'up' ? $index - 1 : $index + 1;
            if ($swap < 0 || $swap >= $ordered->count()) {
                return;
            }
            [$ordered[$index], $ordered[$swap]] = [$ordered[$swap], $ordered[$index]];
            $ordered->each(fn ($p, $i) => $p->sort_order === $i + 1 ?: $p->forceFill(['sort_order' => $i + 1])->save());
        });
        ActivityLog::record('membership', 'plans_reordered', ['name' => $plan->name, 'direction' => $direction], $plan);

        return back();
    }

    private function validated(Request $request, ?MembershipPlan $plan = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'slug' => ['required', 'string', 'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/', 'max:60', Rule::unique('membership_plans', 'slug')->ignore($plan?->id)],
            'tagline' => ['nullable', 'string', 'max:140'],
            'description' => ['nullable', 'string', 'max:2000'],
            'benefits' => ['array', 'max:12'],
            'benefits.*' => ['nullable', 'string', 'max:160'],
            'interval' => ['required', Rule::in(MembershipPlan::INTERVALS)],
            'price' => [$plan && ! $plan->isDraft() ? 'nullable' : 'required', 'integer', 'min:0', 'max:100000000'],
            'trial_days' => ['required', 'integer', 'min:0', 'max:90'],
            'member_limit' => ['nullable', 'integer', 'min:1', 'max:1000000'],
            'is_featured' => ['required', 'boolean'],
        ], ['slug.regex' => 'Use lowercase letters, numbers and dashes (e.g. rider-plus).']);

        // Blank lines from the editor are dropped rather than rejected.
        $data['benefits'] = array_values(array_filter(array_map(fn ($b) => trim((string) $b), $data['benefits'] ?? []), fn ($b) => $b !== ''));

        return $data;
    }
}
