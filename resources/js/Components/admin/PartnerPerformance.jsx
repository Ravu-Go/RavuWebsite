import { ArrowDownRight, ArrowUpRight, Info, Minus, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { ChartCard, Delta, fmt, StatTile } from "./chartKit";
import { BarList, DemoBadge, formatDate, money, PeriodPicker, SERIES, TrendCard } from "./reportKit";

/* ==========================================================================
   Super Admin · Partner performance — which partners serve ("hudumia") the
   most RAVU members, and what that activity is worth.
   ========================================================================== */

const SORTS = [
    { id: "members", label: "Members served" },
    { id: "visits", label: "Visits" },
    { id: "paid", label: "Member spend" },
    { id: "payout", label: "Payout" },
];

export default function PartnerPerformance({ data, loading, onPeriodChange, onOpenPayouts }) {
    const [sort, setSort] = useState("members");
    const [category, setCategory] = useState("");
    const partners = useMemo(() => {
        const rows = (data?.partners || []).filter((p) => !category || p.category === category);
        return [...rows].sort((a, b) => b[sort] - a[sort] || b.members - a.members);
    }, [data, sort, category]);

    if (!data) {
        return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" aria-label="Loading partner performance" />;
    }

    const m = money(data.currency);
    const t = data.totals;
    const prev = data.period.previous_label;
    const usage = data.benefit_usage;
    const maxMembers = Math.max(1, ...partners.map((p) => p.members));
    const categories = data.by_category.map((c) => c.name);

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-950">Partner performance</h1>
                    <p className="mt-0.5 text-[13px] text-slate-500">Which partners serve the most RAVU members · {data.period.label}{data.period.running ? " (in progress)" : ""}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {data.demo && <DemoBadge />}
                    <PeriodPicker period={data.period} years={data.years} onChange={onPeriodChange} loading={loading} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                <StatTile label="Members served" value={fmt(t.members.current)}>
                    <Delta current={t.members.current} previous={t.members.previous} previousLabel={prev} percent />
                </StatTile>
                <StatTile label="Visits to partners" value={fmt(t.visits.current)}>
                    <Delta current={t.visits.current} previous={t.visits.previous} previousLabel={prev} percent />
                </StatTile>
                <StatTile label="Member spend at partners" value={m.compact(t.paid.current)}>
                    <Delta current={t.paid.current} previous={t.paid.previous} previousLabel={prev} percent />
                </StatTile>
                <StatTile label="Members saved" value={m.compact(t.discount.current)}>
                    <p className="mt-1 text-[11.5px] text-slate-500">in partner discounts</p>
                </StatTile>
                <StatTile label="Active partners" value={`${fmt(t.active_partners.current)} / ${fmt(t.approved_partners)}`}>
                    <p className="mt-1 text-[11.5px] text-slate-500">served at least one member</p>
                </StatTile>
                <StatTile label="Benefit usage" value={usage?.rate != null ? `${usage.rate}%` : "—"}>
                    <p className="mt-1 text-[11.5px] text-slate-500">{usage ? `${fmt(usage.members_used)} of ${fmt(usage.active_members)} paying members` : "Membership data unavailable"}</p>
                </StatTile>
            </div>

            {usage && usage.members_unused > 0 && (
                <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-[13px] text-amber-900">
                    <Info size={16} className="mt-0.5 shrink-0" />
                    <span>
                        <strong>{fmt(usage.members_unused)} paying members</strong> did not use any partner benefit in {data.period.label}. Members who never use their benefits are the most likely to cancel, so they are worth a reminder in the app.
                    </span>
                </p>
            )}

            <div className="grid gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <TrendCard
                        title="Ecosystem activity"
                        description={data.period.type === "year" ? `Every month of ${data.period.label}` : `12 months to ${data.period.label}`}
                        trend={data.trend}
                        metrics={[
                            { id: "members", label: "Members", format: fmt },
                            { id: "visits", label: "Visits", format: fmt },
                            { id: "paid", label: "Member spend", format: m.full, axis: m.axis },
                            { id: "discount", label: "Savings", format: m.full, axis: m.axis },
                        ]}
                    />
                </div>
                <ChartCard title="By partner category" description="Members served per category">
                    <BarList rows={data.by_category} value="members" secondary={(r) => `· ${r.partners} ${r.partners === 1 ? "partner" : "partners"}`} />
                </ChartCard>
            </div>

            <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <header className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-3.5 sm:px-5">
                    <div>
                        <h3 className="flex items-center gap-1.5 text-[14px] font-semibold tracking-tight text-slate-900">
                            <Trophy size={15} className="text-slate-500" /> Partner leaderboard
                        </h3>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">Distinct members each partner served. Payouts are estimates until the month is approved.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <label className="sr-only" htmlFor="lb-category">Category</label>
                        <select id="lb-category" value={category} onChange={(e) => setCategory(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white pl-2 pr-7 text-[12.5px] font-medium text-slate-700">
                            <option value="">All categories</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <label className="sr-only" htmlFor="lb-sort">Sort by</label>
                        <select id="lb-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white pl-2 pr-7 text-[12.5px] font-medium text-slate-700">
                            {SORTS.map((s) => (
                                <option key={s.id} value={s.id}>Sort: {s.label}</option>
                            ))}
                        </select>
                        {data.period.type === "month" && (
                            <button type="button" onClick={onOpenPayouts} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50">
                                Open payouts
                            </button>
                        )}
                    </div>
                </header>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-left text-[13px]">
                        <thead>
                            <tr className="border-y border-slate-200 bg-slate-50/70 text-[11.5px] uppercase tracking-wide text-slate-500">
                                <th className="w-10 px-4 py-2 font-semibold sm:px-5">#</th>
                                <th className="px-3 py-2 font-semibold">Partner</th>
                                <th className="px-3 py-2 font-semibold">Members served</th>
                                <th className="px-3 py-2 text-right font-semibold">Visits</th>
                                <th className="px-3 py-2 text-right font-semibold">Member spend</th>
                                <th className="px-3 py-2 text-right font-semibold">Discounts</th>
                                <th className="px-3 py-2 text-right font-semibold">Payout</th>
                                <th className="px-4 py-2 font-semibold sm:px-5">Last visit</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                            {partners.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-5 py-10 text-center text-slate-400">No approved partners yet.</td>
                                </tr>
                            )}
                            {partners.map((p, i) => (
                                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                                    <td className="px-4 py-2.5 font-semibold text-slate-400 sm:px-5">{i + 1}</td>
                                    <td className="px-3 py-2.5">
                                        <p className="font-semibold text-slate-900">
                                            {p.name} {p.is_demo && <span className="ml-1 align-middle"><DemoBadge>Demo</DemoBadge></span>}
                                        </p>
                                        <p className="text-[11.5px] text-slate-500">{[p.category, p.region].filter(Boolean).join(" · ")}</p>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-10 font-semibold text-slate-900">{fmt(p.members)}</span>
                                            <div className="h-1.5 w-28 rounded-full bg-slate-100" aria-hidden="true">
                                                <div className="h-full rounded-full" style={{ width: `${(p.members / maxMembers) * 100}%`, background: SERIES }} />
                                            </div>
                                            <Change now={p.members} before={p.members_previous} />
                                        </div>
                                    </td>
                                    <td className="px-3 py-2.5 text-right text-slate-700">{fmt(p.visits)}</td>
                                    <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">{m.full(p.paid)}</td>
                                    <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-700">{m.full(p.discount)}</td>
                                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-slate-900">{m.full(p.payout)}</td>
                                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500 sm:px-5">{p.last_visit_at ? formatDate(p.last_visit_at, { day: "numeric", month: "short" }) : <span className="text-amber-700">No members served</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function Change({ now, before }) {
    if (now === before) return <Minus size={13} className="text-slate-400" aria-label="No change" />;
    const up = now > before;
    const Icon = up ? ArrowUpRight : ArrowDownRight;
    return (
        <span className={`inline-flex items-center text-[11.5px] font-semibold ${up ? "text-emerald-700" : "text-rose-700"}`} title={`Previous period: ${before}`}>
            <Icon size={13} />
            {up ? "+" : "−"}
            {Math.abs(now - before)}
        </span>
    );
}
