import { router } from "@inertiajs/react";
import { AlertTriangle, CheckCircle2, Download, Info, Loader2 } from "lucide-react";
import { useState } from "react";
import { fmt, StatTile } from "./chartKit";
import { DemoBadge, formatDate, money, PayoutStatus } from "./reportKit";

/* ==========================================================================
   Super Admin · Partner payouts. Each month a share of subscription income
   (the pool) is split between partners by distinct members served.
   Estimate → (month ends) awaiting approval → approved (frozen) → paid.
   ========================================================================== */

export default function PartnerPayouts({ data, loading, onMonthChange }) {
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const [paying, setPaying] = useState(null);
    const [reference, setReference] = useState("");
    const [errors, setErrors] = useState({});

    if (!data) return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" aria-label="Loading payouts" />;

    const m = money(data.currency);
    const s = data.summary;
    const anyDemo = data.source?.demo || data.partners?.some((p) => p.is_demo);

    const approve = () => {
        setBusy(true);
        router.post(`/super-admin/payouts/${data.period.key}/approve`, {}, {
            preserveScroll: true,
            onError: (e) => setErrors(e),
            onSuccess: () => setConfirming(false),
            onFinish: () => setBusy(false),
        });
    };
    const markPaid = (event, payoutId) => {
        event.preventDefault();
        setBusy(true);
        router.post(`/super-admin/payouts/${payoutId}/paid`, { reference }, {
            preserveScroll: true,
            onError: (e) => setErrors(e),
            onSuccess: () => {
                setPaying(null);
                setReference("");
                setErrors({});
            },
            onFinish: () => setBusy(false),
        });
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-950">Partner payouts</h1>
                    <p className="mt-0.5 text-[13px] text-slate-500">What RAVU pays partners from membership income, month by month.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {anyDemo && <DemoBadge />}
                    <a href={`/super-admin/payouts/${data.period.key}/export`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-700 hover:bg-slate-50">
                        <Download size={14} /> Export statement
                    </a>
                </div>
            </div>

            {/* Month strip */}
            <nav aria-label="Payout month" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                {data.months.map((month) => {
                    const active = month.key === data.period.key;
                    return (
                        <button
                            key={month.key}
                            type="button"
                            disabled={loading}
                            onClick={() => onMonthChange(month.key)}
                            aria-current={active ? "true" : undefined}
                            className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${active ? "border-[#2a78d6] bg-[#2a78d6]/5 ring-1 ring-[#2a78d6]" : "border-slate-200 bg-white hover:border-slate-300"}`}
                        >
                            <p className="text-[12.5px] font-semibold text-slate-900">{month.label}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                                {month.status === "paid" && <CheckCircle2 size={11} className="text-emerald-600" />}
                                {month.status === "pending_approval" && <AlertTriangle size={11} className="text-amber-600" />}
                                {{ paid: "Paid", approved: "Approved", pending_approval: "To approve", estimate: "In progress" }[month.status]}
                            </p>
                        </button>
                    );
                })}
            </nav>

            {data.error ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-[13px] text-rose-900">{data.error}</p>
            ) : (
                <>
                    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-[12px] font-medium text-slate-500">{data.period.label}</p>
                                <div className="mt-1"><PayoutStatus status={s.status} /></div>
                                {s.approved_at && <p className="mt-1 text-[12px] text-slate-500">Approved {formatDate(s.approved_at)}{s.approved_by ? ` by ${s.approved_by}` : ""}</p>}
                            </div>
                            {s.status === "pending_approval" && !confirming && (
                                <button type="button" onClick={() => setConfirming(true)} disabled={s.total_members === 0} className="h-9 rounded-lg bg-slate-900 px-3.5 text-[13px] font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                                    Approve {data.period.label}
                                </button>
                            )}
                        </div>

                        {/* The formula, with this month's numbers */}
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" style={{ fontVariantNumeric: "tabular-nums" }}>
                            <StatTile label="Membership income" value={m.full(s.revenue)}>
                                <p className="mt-1 text-[11.5px] text-slate-500">successful subscription payments</p>
                            </StatTile>
                            <StatTile label={`Partner pool (${s.pool_percent}%)`} value={m.full(s.pool)}>
                                <p className="mt-1 text-[11.5px] text-slate-500">{s.total_members > 0 ? "shared between partners" : "no members served — nothing shared"}</p>
                            </StatTile>
                            <StatTile label="RAVU keeps" value={m.full(s.ravu_keeps)}>
                                <p className="mt-1 text-[11.5px] text-slate-500">{s.revenue > 0 ? `${Math.round((s.ravu_keeps / s.revenue) * 100)}% of income` : "—"}</p>
                            </StatTile>
                            <StatTile label="Paid out" value={m.full(s.paid)}>
                                <p className="mt-1 text-[11.5px] text-slate-500">{fmt(data.partners.filter((p) => p.status === "paid").length)} of {fmt(data.partners.length)} partners</p>
                            </StatTile>
                        </div>

                        <p className="mt-3 flex items-start gap-2 text-[12.5px] text-slate-500">
                            <Info size={14} className="mt-0.5 shrink-0" />
                            Each partner gets pool × (members they served ÷ {fmt(s.total_members)} members served across all partners). A member who visits two partners counts for both.
                            {s.status === "estimate" && " This month is still running, so the figures will change."}
                        </p>

                        {confirming && (
                            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-950">
                                <p className="font-semibold">Approve {m.full(s.pool)} for {fmt(data.partners.length)} partners?</p>
                                <p className="mt-1">This freezes {data.period.label}: partners can no longer void its receipts and later changes to the pool percentage won’t affect it.</p>
                                {errors.period && <p className="mt-2 font-semibold text-rose-700">{errors.period}</p>}
                                <div className="mt-3 flex gap-2">
                                    <button type="button" onClick={approve} disabled={busy} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-[12.5px] font-semibold text-white disabled:opacity-50">
                                        {busy && <Loader2 size={13} className="animate-spin" />} Approve payouts
                                    </button>
                                    <button type="button" onClick={() => setConfirming(false)} className="h-8 rounded-lg px-3 text-[12.5px] font-semibold text-slate-700 hover:bg-amber-100">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] text-left text-[13px]">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11.5px] uppercase tracking-wide text-slate-500">
                                        <th className="px-4 py-2 font-semibold sm:px-5">Partner</th>
                                        <th className="px-3 py-2 text-right font-semibold">Members served</th>
                                        <th className="px-3 py-2 text-right font-semibold">Visits</th>
                                        <th className="px-3 py-2 text-right font-semibold">Share</th>
                                        <th className="px-3 py-2 text-right font-semibold">Payout</th>
                                        <th className="px-4 py-2 font-semibold sm:px-5">Status</th>
                                    </tr>
                                </thead>
                                <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                                    {data.partners.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-10 text-center text-slate-400">No partner served a member in {data.period.label}.</td>
                                        </tr>
                                    )}
                                    {data.partners.map((p) => (
                                        <tr key={p.partner_id ?? p.name} className="border-b border-slate-100 align-top last:border-0">
                                            <td className="px-4 py-2.5 sm:px-5">
                                                <p className="font-semibold text-slate-900">{p.name} {p.is_demo && <span className="ml-1 align-middle"><DemoBadge>Demo</DemoBadge></span>}</p>
                                                <p className="text-[11.5px] text-slate-500">{[p.category, p.region].filter(Boolean).join(" · ")}</p>
                                            </td>
                                            <td className="px-3 py-2.5 text-right">{fmt(p.members_served)}</td>
                                            <td className="px-3 py-2.5 text-right text-slate-600">{fmt(p.visits)}</td>
                                            <td className="px-3 py-2.5 text-right text-slate-600">{p.share_percent}%</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-slate-900">{m.full(p.amount)}</td>
                                            <td className="px-4 py-2.5 sm:px-5">
                                                {paying !== null && paying === p.payout_id ? (
                                                    <form onSubmit={(e) => markPaid(e, p.payout_id)} className="flex w-60 flex-col gap-1.5">
                                                        <label htmlFor={`ref-${p.payout_id}`} className="text-[11.5px] font-semibold text-slate-600">M-Pesa / bank reference</label>
                                                        <input id={`ref-${p.payout_id}`} autoFocus value={reference} onChange={(e) => setReference(e.target.value)} maxLength={80} className="h-8 rounded-md border border-slate-300 px-2 text-[12.5px] focus:border-[#2a78d6] focus:outline-none" />
                                                        {errors.reference && <span className="text-[11.5px] text-rose-700">{errors.reference}</span>}
                                                        <div className="flex gap-1.5">
                                                            <button type="submit" disabled={busy || reference.trim().length < 3} className="h-7 rounded-md bg-emerald-600 px-2.5 text-[12px] font-semibold text-white disabled:opacity-50">Mark paid</button>
                                                            <button type="button" onClick={() => setPaying(null)} className="h-7 rounded-md px-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <PayoutStatus status={p.status} short />
                                                        {p.status === "approved" && p.payout_id && (
                                                            <button type="button" onClick={() => { setPaying(p.payout_id); setReference(""); setErrors({}); }} className="text-[12px] font-semibold text-[#2a78d6] hover:underline">
                                                                Record payment
                                                            </button>
                                                        )}
                                                        {p.status === "paid" && <span className="text-[11.5px] text-slate-500">{formatDate(p.paid_at)}{p.reference ? ` · ${p.reference}` : ""}</span>}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
