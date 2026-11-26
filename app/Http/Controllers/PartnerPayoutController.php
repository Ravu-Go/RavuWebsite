<?php

namespace App\Http\Controllers;

use App\Models\PartnerPayout;
use App\Services\PartnerPayoutService;
use App\Support\ReportPeriod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Super Admin: approve a month's partner payouts, record each payment, export a statement.
 */
class PartnerPayoutController extends Controller
{
    public function __construct(private readonly PartnerPayoutService $payouts) {}

    public function approve(Request $request, string $period): RedirectResponse
    {
        $month = ReportPeriod::parse($period);
        $count = $this->payouts->approve($month, $request->user());

        return back()->with('success', "Approved {$month->label()} payouts for {$count} ".str('partner')->plural($count).'.');
    }

    public function markPaid(Request $request, PartnerPayout $payout): RedirectResponse
    {
        $data = $request->validate(['reference' => ['required', 'string', 'min:3', 'max:80']]);
        $this->payouts->markPaid($payout, $data['reference'], $request->user());

        return back()->with('success', 'Payout marked as paid.');
    }

    public function export(string $period): StreamedResponse
    {
        $month = ReportPeriod::parse($period);
        $data = $this->payouts->adminMonth($month);

        return response()->streamDownload(function () use ($data, $month) {
            $out = fopen('php://output', 'w');
            $s = $data['summary'] ?? null;
            fputcsv($out, ['RAVU partner payouts', $month->label(), $s ? str_replace('_', ' ', $s['status']) : 'unavailable']);
            if ($s) {
                fputcsv($out, ['Subscription revenue (TZS)', $s['revenue']]);
                fputcsv($out, ['Partner pool', $s['pool_percent'].'%', $s['pool']]);
                fputcsv($out, ['Members served (sum across partners)', $s['total_members']]);
            }
            fputcsv($out, []);
            fputcsv($out, ['Partner', 'Category', 'Location', 'Members served', 'Visits', 'Share %', 'Payout (TZS)', 'Status', 'Paid at', 'Payment reference']);
            foreach ($data['partners'] ?? [] as $row) {
                fputcsv($out, [$row['name'].($row['is_demo'] ? ' (demo)' : ''), $row['category'], $row['region'], $row['members_served'], $row['visits'], $row['share_percent'], $row['amount'], $row['status'], $row['paid_at'], $row['reference']]);
            }
            fclose($out);
        }, "ravu-partner-payouts-{$month->key()}.csv", ['Content-Type' => 'text/csv']);
    }
}
