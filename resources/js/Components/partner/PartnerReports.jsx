import axios from "axios";
import { router } from "@inertiajs/react";
import { Download, Info, Loader2, Wallet } from "lucide-react";
import { useState } from "react";
import { ChartCard, Delta, fmt, StatTile } from "../admin/chartKit";
import { BarList, ColumnChart, DemoBadge, formatDate, formatDateTime, money, PayoutStatus, PeriodPicker, TrendCard } from "../admin/reportKit";

/* ==========================================================================
   Partner portal reports: performance, redemption history, payouts.
   "Revenue" here means what RAVU members paid the partner after discount.
   ========================================================================== */

function Toolbar({ period, years, onPeriod, loading, demo, children, allowYear = true }) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
                <PeriodPicker period={period} years={years} onChange={onPeriod} loading={loading} allowYear={allowYear} />
                {demo && <DemoBadge>Sample data until the RAVU app goes live</DemoBadge>}
            </div>
            <div className="flex flex-wrap items-center gap-2">{children}</div>
        </div>
    );
}

export function PartnerPerformance({ performance, payouts, onPeriod, loading }) {
    if (!performance) return null;
    const p = performance;
    const m = money(p.currency);
    const t = p.totals;
    const prev = p.period.previous_label;
    const payout = p.payout?.months?.[0];
    const yearPayout = p.period.type === "year" ? p.payout : null;

    return (
        <div className="space-y-5">
            <Toolbar period={p.period} years={p.years} onPeriod={onPeriod} loading={loading} demo={p.demo}>
                <a href={`/partner/redemptions/export?period=${p.period.key}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-700 hover:bg-slate-50">
                    <Download size={14} /> Export CSV
                </a>
            </Toolbar>

            <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950">{p.period.label}</h2>
                <p className="text-[13px] text-slate-500">
                    {p.period.running ? "In progress · " : ""}
                    How many RAVU members you served and the business they brought you.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                <StatTile label="Members served" value={fmt(t.members.current)}>
                    <Delta current={t.members.current} previous={t.members.previous} previousLabel={prev} percent />
                </StatTile>
                <StatTile label="Visits" value={fmt(t.visits.current)}>
                    <Delta current={t.visits.current} previous={t.visits.previous} previousLabel={prev} percent />
                </StatTile>
                <StatTile label="Revenue from members" value={m.compact(t.paid.current)}>
                    <Delta current={t.paid.current} previous={t.paid.previous} previousLabel={prev} percent />
                </StatTile>
                <StatTile label="Discounts given" value={m.compact(t.discount.current)}>
                    <p className="mt-1 text-[11.5px] text-slate-500">on {m.compact(t.sales.current)} of sales</p>
                </StatTile>
                <StatTile label="Average bill" value={m.compact(t.average_bill.current)}>
                    <Delta current={t.average_bill.current} previous={t.average_bill.previous} previousLabel={prev} percent />
                </StatTile>
                <StatTile label={p.period.type === "year" ? "RAVU payouts" : "RAVU payout"} value={m.compact(yearPayout ? yearPayout.total : payout?.amount)}>
                    <div className="mt-1.5">{yearPayout ? <span className="text-[11.5px] text-slate-500">{m.compact(yearPayout.paid)} paid so far</span> : payout && <PayoutStatus status={payout.status} short />}</div>
                </StatTile>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <TrendCard
                        title="Month by month"
                        description={p.period.type === "year" ? `Every month of ${p.period.label}` : `12 months to ${p.period.label}`}
                        trend={p.trend}
                        metrics={[
                            { id: "members", label: "Members", format: fmt },
                            { id: "visits", label: "Visits", format: fmt },
                            { id: "paid", label: "Revenue", format: m.full, axis: m.axis },
                            { id: "discount", label: "Discounts", format: m.full, axis: m.axis },
                        ]}
                    />
                </div>
                <ChartCard title="New vs returning" description="Members by their first visit to you">
                    <div className="space-y-4 pt-2">
                        <Split label="Returning members" value={t.returning_members} total={t.members.current} />
                        <Split label="First-time members" value={t.new_members} total={t.members.current} />
                        <p className="text-[12px] text-slate-500">Returning members are a sign the RAVU offer keeps customers coming back.</p>
                    </div>
                    {p.top_members.length > 0 && (
                        <div className="mt-5 border-t border-slate-100 pt-4">
                            <p className="text-[12px] font-semibold text-slate-700">Most frequent members</p>
                            <ul className="mt-2 space-y-1.5 text-[13px]">
                                {p.top_members.map((tm) => (
                                    <li key={tm.member_ref} className="flex justify-between gap-2">
                                        <span className="truncate text-slate-800">{tm.name} <span className="font-mono text-[11.5px] text-slate-400">{tm.member_ref}</span></span>
                                        <span className="shrink-0 text-slate-600" style={{ fontVariantNumeric: "tabular-nums" }}>{tm.visits} visits</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </ChartCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard title="Busiest days" description="Visits by day of the week">
                    <ColumnChart data={p.by_weekday.map((d) => ({ ...d, value: d.visits }))} ariaLabel="Visits by day of week" height={180} format={(v) => `${fmt(v)} visits`} axis={fmt} />
                </ChartCard>
                <ChartCard title="Busiest hours" description="Visits by hour of the day">
                    <ColumnChart data={p.by_hour.map((d) => ({ ...d, long: `${d.label}:00–${d.label}:59`, value: d.visits }))} ariaLabel="Visits by hour of day" height={180} format={(v) => `${fmt(v)} visits`} axis={fmt} />
                </ChartCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <ChartCard title="By vehicle" description="Members served by vehicle type">
                    <BarList rows={p.by_vehicle} value="members" secondary={(r) => `· ${fmt(r.visits)} visits`} />
                </ChartCard>
                <ChartCard title="By membership plan" description="Which plans your customers are on">
                    <BarList rows={p.by_plan} value="members" secondary={(r) => `· ${fmt(r.visits)} visits`} />
                </ChartCard>
                <ChartCard title="By branch" description="Revenue from members per location">
                    <BarList rows={p.by_location} value="paid" format={m.compact} secondary={(r) => `· ${fmt(r.members)} members`} />
                </ChartCard>
            </div>
        </div>
    );
}

function Split({ label, value, total }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div>
            <div className="flex items-baseline justify-between text-[13px]">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(value)} <span className="font-normal text-slate-500">· {pct}%</span></span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[#2a78d6]" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

/* ------------------------------- Redemptions ------------------------------ */

export function RedemptionHistory({ redemptions, performance, onPeriod, loading }) {
    const [voiding, setVoiding] = useState(null);
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    if (!redemptions || !performance) return null;
    const m = money(performance.currency);

    const submitVoid = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
            await axios.post(`/partner/redemptions/${voiding}/void`, { reason });
            setVoiding(null);
            setReason("");
            router.reload({ only: ["performance", "redemptions", "payouts"] });
        } catch (e) {
            setError(e.response?.data?.errors?.reason?.[0] || e.response?.data?.message || "Could not void this receipt.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-5">
            <Toolbar period={performance.period} years={performance.years} onPeriod={onPeriod} loading={loading} demo={performance.demo}>
                <a href={`/partner/redemptions/export?period=${performance.period.key}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-700 hover:bg-slate-50">
                    <Download size={14} /> Export CSV
                </a>
            </Toolbar>
            <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <header className="flex flex-wrap items-baseline justify-between gap-2 px-4 pb-2 pt-4 sm:px-5">
                    <h2 className="text-[15px] font-semibold text-slate-900">Redemptions · {performance.period.label}</h2>
                    <p className="text-[12.5px] text-slate-500">
                        {redemptions.total > redemptions.rows.length ? `Latest ${redemptions.rows.length} of ${fmt(redemptions.total)} — export CSV for all` : `${fmt(redemptions.total)} receipts`}
                    </p>
                </header>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] text-left text-[13px]">
                        <thead>
                            <tr className="border-y border-slate-200 bg-slate-50/70 text-[11.5px] uppercase tracking-wide text-slate-500">
                                <th className="px-4 py-2 font-semibold sm:px-5">Receipt</th>
                                <th className="px-3 py-2 font-semibold">Date</th>
                                <th className="px-3 py-2 font-semibold">Member</th>
                                <th className="px-3 py-2 font-semibold">Plan · vehicle</th>
                                <th className="px-3 py-2 text-right font-semibold">Bill</th>
                                <th className="px-3 py-2 text-right font-semibold">Discount</th>
                                <th className="px-3 py-2 text-right font-semibold">Paid</th>
                                <th className="px-4 py-2 text-right font-semibold sm:px-5"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                            {redemptions.rows.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-5 py-10 text-center text-slate-400">No members served in this period yet.</td>
                                </tr>
                            )}
                            {redemptions.rows.map((r) => {
                                const voided = r.status === "voided";
                                return (
                                    <tr key={r.id} className={`border-b border-slate-100 align-top last:border-0 ${voided ? "text-slate-400" : "text-slate-700"}`}>
                                        <td className="px-4 py-2.5 font-mono text-[12px] sm:px-5">
                                            {r.receipt_no}
                                            {voided && <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 font-sans text-[10.5px] font-semibold text-slate-500">Voided</span>}
                                            {voided && r.void_reason && <p className="mt-0.5 max-w-[200px] font-sans text-[11.5px]">{r.void_reason}</p>}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">{formatDateTime(r.redeemed_at)}</td>
                                        <td className="px-3 py-2.5">
                                            <p className={voided ? "" : "font-semibold text-slate-900"}>{r.member_name}</p>
                                            <p className="font-mono text-[11.5px] text-slate-400">{r.member_ref}</p>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <p>{r.plan || "—"}</p>
                                            <p className="text-[11.5px] text-slate-400">{[r.vehicle, r.location].filter(Boolean).join(" · ")}</p>
                                        </td>
                                        <td className={`whitespace-nowrap px-3 py-2.5 text-right ${voided ? "line-through" : ""}`}>{m.full(r.bill)}</td>
                                        <td className={`whitespace-nowrap px-3 py-2.5 text-right ${voided ? "line-through" : ""}`}>{m.full(r.discount)}</td>
                                        <td className={`whitespace-nowrap px-3 py-2.5 text-right font-semibold ${voided ? "line-through" : "text-slate-900"}`}>{m.full(r.paid)}</td>
                                        <td className="px-4 py-2.5 text-right sm:px-5">
                                            {r.can_void && voiding !== r.id && (
                                                <button type="button" onClick={() => { setVoiding(r.id); setReason(""); setError(""); }} className="text-[12px] font-semibold text-rose-700 hover:underline">
                                                    Void
                                                </button>
                                            )}
                                            {voiding === r.id && (
                                                <form onSubmit={submitVoid} className="ml-auto flex w-64 flex-col gap-1.5 text-left">
                                                    <label className="text-[11.5px] font-semibold text-slate-600" htmlFor={`void-${r.id}`}>Why are you voiding this receipt?</label>
                                                    <input id={`void-${r.id}`} autoFocus value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} className="h-8 rounded-md border border-slate-300 px-2 text-[12.5px] text-slate-900 focus:border-[#1864E8] focus:outline-none" placeholder="e.g. Wrong amount entered" />
                                                    {error && <span className="text-[11.5px] text-rose-700">{error}</span>}
                                                    <div className="flex justify-end gap-1.5">
                                                        <button type="button" onClick={() => setVoiding(null)} className="h-7 rounded-md px-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-100">Keep</button>
                                                        <button type="submit" disabled={busy || reason.trim().length < 5} className="inline-flex h-7 items-center gap-1 rounded-md bg-rose-600 px-2.5 text-[12px] font-semibold text-white disabled:opacity-50">
                                                            {busy && <Loader2 size={12} className="animate-spin" />} Void receipt
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

/* --------------------------------- Payouts -------------------------------- */

export function PartnerPayouts({ payouts, performance, onPeriod, loading }) {
    if (!payouts || !performance) return null;
    if (payouts.error) return <p className="rounded-2xl border border-slate-200 bg-white p-6 text-[13px] text-slate-600">{payouts.error}</p>;
    const m = money(payouts.currency);
    const year = performance.period.key.slice(0, 4);

    return (
        <div className="space-y-5">
            <Toolbar period={{ key: year }} years={performance.years} onPeriod={(key) => onPeriod(key.slice(0, 4))} loading={loading} demo={performance.demo} />

            <section className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 text-[13px] text-sky-950 sm:p-5">
                <p className="flex items-center gap-2 font-semibold"><Info size={16} className="text-sky-700" /> How your RAVU payout works</p>
                <p className="mt-1.5 text-sky-900/90">
                    Members pay RAVU for their membership. Each month RAVU shares <strong>{payouts.pool_percent}%</strong> of that membership income between partners.
                    Your share depends on <strong>how many different RAVU members you served</strong> that month, compared with all partners.
                    A month is an estimate until it ends and RAVU approves it.
                </p>
            </section>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatTile label={`Payouts in ${year}`} value={m.compact(payouts.total)} />
                <StatTile label="Paid to you" value={m.compact(payouts.paid)} />
                <StatTile label="Still to come" value={m.compact(payouts.total - payouts.paid)} />
            </div>

            <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <header className="flex items-center gap-2 px-4 pb-2 pt-4 sm:px-5">
                    <Wallet size={16} className="text-slate-500" />
                    <h2 className="text-[15px] font-semibold text-slate-900">Monthly statements · {year}</h2>
                </header>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-[13px]">
                        <thead>
                            <tr className="border-y border-slate-200 bg-slate-50/70 text-[11.5px] uppercase tracking-wide text-slate-500">
                                <th className="px-4 py-2 font-semibold sm:px-5">Month</th>
                                <th className="px-3 py-2 text-right font-semibold">Members served</th>
                                <th className="px-3 py-2 text-right font-semibold">Your share</th>
                                <th className="px-3 py-2 text-right font-semibold">Payout</th>
                                <th className="px-4 py-2 font-semibold sm:px-5">Status</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                            {payouts.months.map((row) => (
                                <tr key={row.period} className="border-b border-slate-100 last:border-0">
                                    <td className="px-4 py-2.5 font-medium text-slate-900 sm:px-5">{row.label}</td>
                                    <td className="px-3 py-2.5 text-right">{fmt(row.members_served)}</td>
                                    <td className="px-3 py-2.5 text-right">{row.share_percent}%</td>
                                    <td className="px-3 py-2.5 text-right font-semibold text-slate-900">{m.full(row.amount)}</td>
                                    <td className="px-4 py-2.5 sm:px-5">
                                        <PayoutStatus status={row.status} />
                                        {row.status === "paid" && (
                                            <p className="mt-0.5 text-[11.5px] text-slate-500">{formatDate(row.paid_at)}{row.reference ? ` · ref ${row.reference}` : ""}</p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
