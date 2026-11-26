<?php

namespace App\Http\Controllers;

use App\Contracts\MemberDirectory;
use App\Models\ActivityLog;
use App\Models\Partner;
use App\Models\PartnerAuditLog;
use App\Models\PartnerRedemption;
use App\Models\ProposedPartnerBenefit;
use App\Models\User;
use App\Services\PartnerPayoutService;
use App\Services\PartnerPerformanceService;
use App\Support\ReportPeriod;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

/**
 * Partner portal: verify a RAVU member at the counter, record the visit
 * ("hudumia") with the member discount, void a mistaken entry, export history.
 */
class PartnerMemberController extends Controller
{
    public function __construct(
        private readonly MemberDirectory $members,
        private readonly PartnerPerformanceService $performance,
    ) {}

    public function verify(Request $request): JsonResponse
    {
        $partner = $this->servingPartner($request->user());
        $data = $request->validate(['query' => ['required', 'string', 'max:120']]);

        $result = $this->check($partner, $data['query']);
        PartnerAuditLog::create([
            'partner_id' => $partner->id,
            'user_id' => $request->user()->id,
            'action' => 'member_lookup',
            'details' => ['query' => mb_substr($data['query'], 0, 40), 'member_ref' => $result['member']['member_ref'] ?? null, 'result' => $result['reason'] ?? 'eligible'],
            'ip_address' => $request->ip(),
        ]);

        return response()->json($result, $result['member'] || ($result['reason'] ?? null) === 'not_found' ? 200 : 503);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $partner = $this->servingPartner($user);
        $data = $request->validate([
            'member_ref' => ['required', 'string', 'max:40'],
            'bill_amount' => ['required', 'integer', 'min:100', 'max:100000000'],
            'discount_amount' => ['nullable', 'integer', 'min:0'],
            'partner_location_id' => ['nullable', 'integer'],
            'description' => ['nullable', 'string', 'max:160'],
            'invoice_ref' => ['nullable', 'string', 'max:60'],
        ]);

        // Re-check on the server: status can change between "verify" and "record".
        $check = $this->check($partner, $data['member_ref']);
        if (! $check['eligible']) {
            throw ValidationException::withMessages(['member_ref' => $check['message']]);
        }
        $member = $check['member'];
        $benefit = $partner->activeBenefit();
        $bill = (int) $data['bill_amount'];
        $discount = $this->discountFor($benefit, $bill, $data['discount_amount'] ?? null);

        $locationId = $data['partner_location_id'] ?? null;
        if ($locationId && ! $partner->locations()->whereKey($locationId)->exists()) {
            throw ValidationException::withMessages(['partner_location_id' => 'Choose one of your business locations.']);
        }
        $locationId ??= $partner->locations()->where('is_primary', true)->value('id');

        // A double-tapped "Record" button should not bill the pool twice.
        $duplicate = $partner->redemptions()->completed()
            ->where('member_ref', $member['member_ref'])->where('bill_amount', $bill)
            ->where('redeemed_at', '>=', now()->subMinutes(5))->first();
        if ($duplicate) {
            throw ValidationException::withMessages(['bill_amount' => "This visit was already recorded a moment ago (receipt {$duplicate->receipt_no})."]);
        }

        $redemption = $partner->redemptions()->create([
            'partner_location_id' => $locationId,
            'proposed_partner_benefit_id' => $benefit->id,
            'recorded_by' => $user->id,
            'receipt_no' => PartnerRedemption::newReceiptNumber(),
            'member_ref' => $member['member_ref'],
            'member_name' => PartnerRedemption::shortName($member['name']),
            'member_plan_id' => $member['plan_id'],
            'member_plan_name' => $member['plan_name'],
            'vehicle_category' => $member['vehicle_category'],
            'bill_amount' => $bill,
            'discount_amount' => $discount,
            'paid_amount' => $bill - $discount,
            'currency' => config('membership.currency', 'TZS'),
            'description' => $data['description'] ?? null,
            'invoice_ref' => $data['invoice_ref'] ?? null,
            'status' => 'completed',
            'redeemed_at' => now(),
        ]);

        ActivityLog::record('partner', 'redemption_recorded', ['receipt_no' => $redemption->receipt_no, 'member_ref' => $redemption->member_ref, 'paid' => $redemption->paid_amount], $redemption, $user, $partner->id);

        return response()->json(['redemption' => [
            'receipt_no' => $redemption->receipt_no,
            'redeemed_at' => $redemption->redeemed_at->toIso8601String(),
            'member_ref' => $redemption->member_ref,
            'member_name' => $redemption->member_name,
            'bill' => $redemption->bill_amount,
            'discount' => $redemption->discount_amount,
            'paid' => $redemption->paid_amount,
        ]], 201);
    }

    public function void(Request $request, PartnerRedemption $redemption, PartnerPayoutService $payouts): JsonResponse
    {
        $user = $request->user();
        $partner = $this->servingPartner($user);
        abort_unless($redemption->partner_id === $partner->id, 404);
        $data = $request->validate(['reason' => ['required', 'string', 'min:5', 'max:200']]);

        $hours = (int) config('partner.void_window_hours', 24);
        $problem = match (true) {
            $redemption->status !== 'completed' => 'This receipt is already voided.',
            $redemption->is_demo => 'Sample redemptions cannot be voided.',
            $redemption->redeemed_at->lt(now()->subHours($hours)) => "Receipts can only be voided within {$hours} hours. Contact RAVU support to correct older entries.",
            $payouts->monthLocked($redemption->redeemed_at) => 'This month’s payout is already approved, so its receipts can no longer change.',
            default => null,
        };
        if ($problem) {
            throw ValidationException::withMessages(['reason' => $problem]);
        }

        $redemption->update(['status' => 'voided', 'voided_at' => now(), 'voided_by' => $user->id, 'void_reason' => $data['reason']]);
        ActivityLog::record('partner', 'redemption_voided', ['receipt_no' => $redemption->receipt_no, 'reason' => $data['reason']], $redemption, $user, $partner->id);

        return response()->json(['ok' => true]);
    }

    public function export(Request $request): StreamedResponse
    {
        $partner = $this->servingPartner($request->user());
        $period = ReportPeriod::parse($request->query('period'));
        $name = str($partner->trading_name ?: $partner->registered_name ?: 'partner')->slug();

        return response()->streamDownload(function () use ($partner, $period) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Receipt', 'Date', 'Member ID', 'Member', 'Plan', 'Vehicle', 'Location', 'Recorded by', 'Description', 'Invoice ref', 'Bill (TZS)', 'Discount (TZS)', 'Paid (TZS)', 'Status', 'Void reason']);
            $partner->redemptions()->whereBetween('redeemed_at', [$period->start, $period->end()])
                ->with(['location:id,name', 'recorder:id,name'])->orderBy('redeemed_at')
                ->lazy(1000)->each(fn (PartnerRedemption $r) => fputcsv($out, [
                    $r->receipt_no, $r->redeemed_at->format('Y-m-d H:i'), $r->member_ref, $r->member_name, $r->member_plan_name,
                    $r->vehicle_category, $r->location?->name, $r->recorder?->name, $r->description, $r->invoice_ref,
                    $r->bill_amount, $r->discount_amount, $r->paid_amount, $r->status, $r->void_reason,
                ]));
            fclose($out);
        }, "ravu-redemptions-{$name}-{$period->key()}.csv", ['Content-Type' => 'text/csv']);
    }

    /* --------------------------------------------------------------------- */

    private function servingPartner(User $user): Partner
    {
        $partner = $user->primaryPartner();
        abort_unless($partner, 404);
        abort_unless($partner->canServeMembers(), 403, 'Member verification opens once RAVU approves your partnership.');

        return $partner;
    }

    /** Look the member up and decide whether this partner may apply its offer. */
    private function check(Partner $partner, string $query): array
    {
        $benefit = $partner->activeBenefit();
        $offer = $benefit ? [
            'name' => $benefit->name,
            'label' => $this->performance->benefitLabel($benefit),
            'type' => $benefit->benefit_type,
            'percentage' => $benefit->discount_percentage !== null ? (float) $benefit->discount_percentage : null,
            'amount' => $benefit->discount_amount !== null ? (int) $benefit->discount_amount : null,
            'manual_discount' => ! in_array($benefit->benefit_type, ['percentage_discount', 'fixed_discount'], true),
            'products_or_services' => $benefit->products_or_services,
        ] : null;

        try {
            $member = $this->members->find($query);
        } catch (Throwable $e) {
            report($e);

            return ['member' => null, 'eligible' => false, 'reason' => 'unavailable', 'message' => 'Member lookup is unavailable right now. Please try again in a moment.', 'offer' => $offer];
        }

        if (! $member) {
            return ['member' => null, 'eligible' => false, 'reason' => 'not_found', 'message' => 'No RAVU member matches that ID, phone number or QR code.', 'offer' => $offer];
        }

        $validUntil = $member['valid_until'] ? CarbonImmutable::parse($member['valid_until']) : null;
        $status = $member['status'] === 'active' && $validUntil && $validUntil->isPast() ? 'expired' : $member['status'];
        [$reason, $message] = match (true) {
            $status === 'suspended' => ['suspended', 'This membership is suspended. Do not apply the member discount.'],
            $status !== 'active' => ['expired', 'This membership has expired. The member can renew in the RAVU app.'],
            ! $benefit => ['no_offer', 'Your member offer is not approved yet, so no discount can be recorded.'],
            default => [null, $benefit ? 'Apply your member offer: '.$this->performance->benefitLabel($benefit).'.' : ''],
        };

        $history = $partner->redemptions()->completed()->where('member_ref', $member['member_ref']);
        $last = (clone $history)->latest('redeemed_at')->first();

        unset($member['phone_digits'], $member['started_at'], $member['cancelled_at']);

        return [
            'member' => [...$member, 'status' => $status],
            'eligible' => $reason === null,
            'reason' => $reason,
            'message' => $message,
            'offer' => $offer,
            'history' => [
                'visits' => $history->count(),
                'last_visit_at' => $last?->redeemed_at->toIso8601String(),
                'recent_duplicate' => $last && $last->redeemed_at->gt(now()->subMinutes(10)),
            ],
            'checked_at' => now()->toIso8601String(),
        ];
    }

    private function discountFor(ProposedPartnerBenefit $benefit, int $bill, ?int $manual): int
    {
        $discount = match ($benefit->benefit_type) {
            'percentage_discount' => (int) round($bill * (float) $benefit->discount_percentage / 100),
            'fixed_discount' => (int) round((float) $benefit->discount_amount),
            default => $manual ?? throw ValidationException::withMessages(['discount_amount' => 'Enter the discount you gave the member (0 if none).']),
        };
        if ($discount > $bill) {
            if (! in_array($benefit->benefit_type, ['percentage_discount', 'fixed_discount'], true)) {
                throw ValidationException::withMessages(['discount_amount' => 'The discount cannot be more than the bill.']);
            }
            $discount = $bill;
        }

        return max(0, $discount);
    }
}
