import { AlertTriangle, Info, PlugZap } from "lucide-react";
import { useState } from "react";
import { ChartCard, columnPath, Delta, INK, niceTicks, StatTile, useWidth, ViewToggle } from "./chartKit";

/* ==========================================================================
   Membership revenue — subscription income by plan.
   Plan colours: validated categorical slots 1–4 (blue, orange, aqua, yellow),
   assigned by plan order (never by rank). Aqua and yellow sit under 3:1 on
   white, so the chart ships a legend, 2px gaps between segments and a table view.
   ========================================================================== */

const PLAN_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#6250d6"];

const RANGES = [
    { id: "30d", label: "30 days", period: "day", previous: "previous 30 days" },
    { id: "12w", label: "12 weeks", period: "week", previous: "previous 12 weeks" },
    { id: "12m", label: "12 months", period: "month", previous: "previous 12 months" },
];

const METHOD_COLOR = "#2a78d6";

function money(currency) {
    const symbol = currency === "TZS" ? "TSh" : currency;
    const full = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
    const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
    return {
        full: (n) => `${symbol} ${full.format(n ?? 0)}`,
        compact: (n) => `${symbol} ${compact.format(n ?? 0)}`,
        axis: (n) => compact.format(n ?? 0),
    };
}

const STATUS = {
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    failed: "bg-rose-50 text-rose-700 ring-rose-600/15",
    refunded: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

/* ------------------------- Stacked revenue columns ------------------------ */

function RevenueChart({ periods, plans, colorOf, m }) {
    const [ref, width] = useWidth();
    const [hover, setHover] = useState(null);
    const height = 240;
    const margin = { top: 12, right: 4, bottom: 28, left: 48 };
    const plotW = Math.max(0, width - margin.left - margin.right);
    const plotH = height - margin.top - margin.bottom;
    const max = Math.max(0, ...periods.map((p) => p.total));
    const ticks = niceTicks(max);
    const top = ticks[ticks.length - 1] || 1;
    const scale = (v) => (v / top) * plotH;
    const band = periods.length ? plotW / periods.length : 0;
    const barW = Math.max(3, Math.min(24, band * 0.62));
    const gap = 2;
    const every = Math.max(1, Math.ceil(periods.length / Math.max(1, Math.floor(plotW / 54))));
    const hovered = hover !== null ? periods[hover] : null;
    const tipW = 240;
    const bandX = margin.left + band * (hover ?? 0);
    const tipLeft = bandX + band + 8 + tipW <= width ? bandX + band + 8 : Math.max(0, bandX - 8 - tipW);

    return (
        <div ref={ref} className="relative" onPointerLeave={() => setHover(null)}>
            {width > 0 && (
                <svg width={width} height={height} role="img" aria-label="Membership revenue by plan over time" className="block overflow-visible">
                    {ticks.map((t) => (
                        <g key={t}>
                            <line x1={margin.left} x2={width - margin.right} y1={margin.top + plotH - scale(t)} y2={margin.top + plotH - scale(t)} stroke={t === 0 ? INK.axis : INK.grid} shapeRendering="crispEdges" />
                            <text x={margin.left - 8} y={margin.top + plotH - scale(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={INK.muted} style={{ fontVariantNumeric: "tabular-nums" }}>
                                {m.axis(t)}
                            </text>
                        </g>
                    ))}
                    {periods.map((p, i) => {
                        const x = margin.left + band * i + (band - barW) / 2;
                        // Stack bottom-up in plan order; a 2px surface gap separates segments; only the top is rounded.
                        const segments = plans.map((plan) => ({ plan, value: p.plans[plan.id] || 0 })).filter((s) => s.value > 0);
                        let y = margin.top + plotH;
                        return (
                            <g key={p.start}>
                                {hover === i && <rect x={margin.left + band * i + 1} y={margin.top} width={Math.max(0, band - 2)} height={plotH} rx="6" fill="#f1f5f9" />}
                                {segments.map((s, j) => {
                                    const h = Math.max(1, scale(s.value) - (j > 0 ? gap : 0));
                                    y -= h + (j > 0 ? gap : 0);
                                    const isTop = j === segments.length - 1;
                                    return isTop ? (
                                        <path key={s.plan.id} d={columnPath(x, y, barW, h)} fill={colorOf(s.plan.id)} opacity={hover === null || hover === i ? 1 : 0.55} />
                                    ) : (
                                        <rect key={s.plan.id} x={x} y={y} width={barW} height={h} fill={colorOf(s.plan.id)} opacity={hover === null || hover === i ? 1 : 0.55} />
                                    );
                                })}
                                {i % every === 0 && (
                                    <text x={margin.left + band * i + band / 2} y={height - 8} textAnchor="middle" fontSize="11" fill={INK.muted}>
                                        {p.label}
                                    </text>
                                )}
                                <rect
                                    x={margin.left + band * i}
                                    y={margin.top}
                                    width={band}
                                    height={plotH}
                                    fill="transparent"
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`${p.long}: ${m.full(p.total)}`}
                                    onPointerEnter={() => setHover(i)}
                                    onFocus={() => setHover(i)}
                                    onBlur={() => setHover(null)}
                                    style={{ outline: "none" }}
                                />
                            </g>
                        );
                    })}
                </svg>
            )}
            {hovered && (
                <div className="pointer-events-none absolute top-0 z-10 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.35)] backdrop-blur" style={{ left: tipLeft, width: tipW }}>
                    <p className="text-[11.5px] font-medium text-slate-500">{hovered.long}</p>
                    <p className="mt-0.5 text-[15px] font-semibold text-slate-950">{m.full(hovered.total)}</p>
                    <ul className="mt-1.5 space-y-1">
                        {plans.map((plan) => (
                            <li key={plan.id} className="flex items-center gap-2">
                                <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: colorOf(plan.id) }} />
                                <span className="whitespace-nowrap text-[12.5px] font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                                    {m.compact(hovered.plans[plan.id] || 0)}
                                </span>
                                <span className="truncate text-[12px] text-slate-500">{plan.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function RevenueTable({ periods, plans, unit, m }) {
    return (
        <div className="max-h-[240px] overflow-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-[13px]">
                <caption className="sr-only">Revenue per {unit} by plan</caption>
                <thead className="sticky top-0 bg-slate-50 text-[12px] text-slate-500">
                    <tr>
                        <th className="px-3 py-2 font-medium capitalize">{unit}</th>
                        {plans.map((plan) => (
                            <th key={plan.id} className="whitespace-nowrap px-3 py-2 text-right font-medium">
                                {plan.name}
                            </th>
                        ))}
                        <th className="px-3 py-2 text-right font-medium">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {[...periods].reverse().map((p) => (
                        <tr key={p.start}>
                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">{p.long}</td>
                            {plans.map((plan) => (
                                <td key={plan.id} className="whitespace-nowrap px-3 py-2 text-right text-slate-900">
                                    {m.full(p.plans[plan.id] || 0)}
                                </td>
                            ))}
                            <td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-slate-900">{m.full(p.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ------------------------------ Plan breakdown ---------------------------- */

function PlanShare({ rows, total, colorOf, m }) {
    if (!total) return <p className="py-4 text-center text-[13px] text-slate-500">No revenue in this period.</p>;
    return (
        <div>
            {/* Tall segmented bar: one whole split by plan, share printed where it fits. */}
            <div className="flex h-7 gap-0.5 overflow-hidden" role="img" aria-label={rows.map((r) => `${r.name} ${Math.round((r.revenue / total) * 100)}%`).join(", ")}>
                {rows
                    .filter((r) => r.revenue > 0)
                    .map((r) => {
                        const share = (r.revenue / total) * 100;
                        const dark = colorOf(r.id) === "#eda100";
                        return (
                            <div key={r.id} className="flex items-center rounded-[4px] px-2" style={{ width: `${share}%`, background: colorOf(r.id) }} title={`${r.name}: ${m.full(r.revenue)} (${Math.round(share)}%)`}>
                                {share >= 9 && <span className={`text-[11.5px] font-semibold ${dark ? "text-[#0b0b0b]" : "text-white"}`}>{Math.round(share)}%</span>}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}

function PlanTable({ rows, total, colorOf, m }) {
    return (
        <div className="-mx-4 mt-4 overflow-x-auto sm:-mx-5">
            <table className="w-full text-left text-[13px]">
                <thead className="border-y border-slate-100 bg-slate-50 text-[11.5px] uppercase tracking-[0.08em] text-slate-500">
                    <tr>
                        <th className="px-4 py-2 font-semibold sm:px-5">Plan</th>
                        <th className="px-3 py-2 text-right font-semibold">Price</th>
                        <th className="px-3 py-2 text-right font-semibold">Active</th>
                        <th className="px-3 py-2 text-right font-semibold">New</th>
                        <th className="px-3 py-2 text-right font-semibold">Cancelled</th>
                        <th className="px-3 py-2 text-right font-semibold">MRR</th>
                        <th className="px-3 py-2 text-right font-semibold">Revenue</th>
                        <th className="px-4 py-2 text-right font-semibold sm:px-5">Share</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {rows.map((r) => (
                        <tr key={r.id}>
                            <td className="whitespace-nowrap px-4 py-2.5 sm:px-5">
                                <span className="flex items-center gap-2 font-medium text-slate-900">
                                    <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: colorOf(r.id) }} />
                                    {r.name}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-600">
                                {m.full(r.price)}
                                <span className="text-slate-400">/{r.interval === "year" ? "yr" : "mo"}</span>
                            </td>
                            <td className="px-3 py-2.5 text-right text-slate-900">{r.active.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-right text-emerald-700">+{r.new.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-right text-slate-500">{r.cancelled ? `−${r.cancelled.toLocaleString()}` : "0"}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-900">{m.compact(r.mrr)}</td>
                            <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-slate-900">{m.full(r.revenue)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-600 sm:px-5">{total ? Math.round((r.revenue / total) * 100) : 0}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Methods({ rows, m }) {
    if (!rows.length) return <p className="py-4 text-center text-[13px] text-slate-500">No payments in this period.</p>;
    const max = Math.max(...rows.map((r) => r.revenue));
    const total = rows.reduce((sum, r) => sum + r.revenue, 0);
    return (
        <ul className="space-y-2.5">
            {rows.map((r) => (
                <li key={r.method}>
                    <div className="flex items-baseline justify-between gap-3 text-[13px]">
                        <span className="text-slate-700">{r.method}</span>
                        <span className="text-slate-500" style={{ fontVariantNumeric: "tabular-nums" }}>
                            <span className="font-semibold text-slate-900">{m.compact(r.revenue)}</span> · {Math.round((r.revenue / total) * 100)}%
                        </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full" style={{ background: INK.track }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.max(2, (r.revenue / max) * 100)}%`, background: METHOD_COLOR }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}

/* ---------------------------------- Panel --------------------------------- */

export default function MembershipRevenue({ revenue, loading, onRangeChange }) {
    const [table, setTable] = useState(false);

    if (!revenue) {
        return (
            <div className="animate-pulse space-y-4" aria-busy="true">
                <div className="h-9 w-72 rounded-lg bg-slate-200/70" />
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-24 rounded-xl bg-white" />
                    ))}
                </div>
                <div className="h-80 rounded-2xl bg-white" />
            </div>
        );
    }

    const range = RANGES.find((r) => r.id === revenue.range) || RANGES[2];
    const header = (
        <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#00289a]">Workspace</p>
                <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-950">Membership revenue</h2>
                <p className="mt-0.5 text-[13px] text-slate-500">Subscription income from RAVU membership plans.</p>
            </div>
            {revenue.source.demo ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
                    <Info size={13} /> Demo data
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live · {revenue.source.label}
                </span>
            )}
        </div>
    );

    if (revenue.error) {
        return (
            <div className="space-y-4">
                {header}
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold">Revenue data is unavailable right now</p>
                        <p className="mt-0.5 text-[13px] text-rose-800/90">{revenue.error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const m = money(revenue.currency);
    const { totals, periods, plans, by_plan: byPlan, by_method: byMethod, recent_payments: recent } = revenue;
    const colorOf = (planId) => PLAN_COLORS[plans.findIndex((p) => p.id === planId) % PLAN_COLORS.length];
    const revenueTotal = totals.revenue.current;

    return (
        <div className="space-y-4">
            {header}

            {revenue.source.demo && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-[13px] text-amber-900">
                    <PlugZap size={16} className="mt-0.5 shrink-0 text-amber-600" />
                    <p>
                        These figures are <strong>sample data</strong> for designing this page. When the memberships API is ready, set{" "}
                        <code className="rounded bg-white/70 px-1 text-[12px]">MEMBERSHIP_REVENUE_SOURCE=api</code> and{" "}
                        <code className="rounded bg-white/70 px-1 text-[12px]">MEMBERSHIP_API_URL</code> to show real payments. Plan names and prices are placeholders.
                    </p>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-[0_1px_2px_rgba(16,24,40,0.04)]" role="group" aria-label="Time range">
                    {RANGES.map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => r.id !== revenue.range && onRangeChange(r.id)}
                            aria-pressed={r.id === revenue.range}
                            className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${r.id === revenue.range ? "bg-[#00289a] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                        >
                            Last {r.label}
                        </button>
                    ))}
                </div>
                <p className="text-[12.5px] text-slate-500">Grouped by {range.period}</p>
            </div>

            <div className={`space-y-4 transition-opacity ${loading ? "pointer-events-none opacity-50" : ""}`}>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                    <StatTile label="Revenue" value={m.compact(totals.revenue.current)}>
                        <Delta current={totals.revenue.current} previous={totals.revenue.previous} previousLabel={range.previous} percent />
                    </StatTile>
                    <StatTile label="Monthly recurring revenue" value={m.compact(totals.mrr.current)}>
                        <Delta current={totals.mrr.current} previous={totals.mrr.previous} previousLabel="start of period" percent />
                    </StatTile>
                    <StatTile label="Active members" value={totals.active.current.toLocaleString()}>
                        <Delta current={totals.active.current} previous={totals.active.previous} previousLabel="start of period" />
                    </StatTile>
                    <StatTile label="New subscriptions" value={totals.new.current.toLocaleString()}>
                        <Delta current={totals.new.current} previous={totals.new.previous} previousLabel={range.previous} />
                    </StatTile>
                    <StatTile label="Monthly churn" value={totals.churn_rate === null ? "—" : `${totals.churn_rate}%`}>
                        <p className="mt-1 text-[11.5px] text-slate-500">{totals.cancelled.current.toLocaleString()} cancelled in period</p>
                    </StatTile>
                    <StatTile label="Avg. per member / month" value={m.compact(totals.arpu)}>
                        <p className="mt-1 text-[11.5px] text-slate-500">MRR ÷ active members</p>
                    </StatTile>
                </div>

                <ChartCard title="Revenue by plan" description={`Successful payments per ${range.period}, stacked by plan`} actions={<ViewToggle table={table} onChange={setTable} />}>
                    <ul className="mb-2 flex flex-wrap gap-x-5 gap-y-1.5">
                        {byPlan.map((p) => (
                            <li key={p.id} className="flex items-center gap-2 text-[12.5px] text-slate-600">
                                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: colorOf(p.id) }} />
                                {p.name}
                                <span className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                                    {m.compact(p.revenue)}
                                </span>
                            </li>
                        ))}
                    </ul>
                    {table ? <RevenueTable periods={periods} plans={plans} unit={revenue.unit} m={m} /> : <RevenueChart periods={periods} plans={plans} colorOf={colorOf} m={m} />}
                </ChartCard>

                <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
                    <div className="min-w-0 xl:col-span-2">
                        <ChartCard title="Plans" description={`Share of ${m.full(revenueTotal)} revenue in this period`}>
                            <PlanShare rows={byPlan} total={revenueTotal} colorOf={colorOf} m={m} />
                            <PlanTable rows={byPlan} total={revenueTotal} colorOf={colorOf} m={m} />
                        </ChartCard>
                    </div>
                    <div className="min-w-0 space-y-4">
                        <ChartCard title="Payment methods" description="Revenue by how members paid">
                            <Methods rows={byMethod} m={m} />
                        </ChartCard>
                        <ChartCard title="Collections" description="Payment outcomes in this period">
                            <dl className="grid grid-cols-3 gap-3 text-[12px]">
                                <div>
                                    <dt className="text-slate-500">Successful</dt>
                                    <dd className="mt-0.5 text-lg font-semibold text-slate-950">{totals.payments.toLocaleString()}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Failed</dt>
                                    <dd className="mt-0.5 text-lg font-semibold text-rose-700">{totals.failed.count.toLocaleString()}</dd>
                                    <dd className="text-[11.5px] text-slate-500">{m.compact(totals.failed.amount)}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Refunded</dt>
                                    <dd className="mt-0.5 text-lg font-semibold text-slate-950">{totals.refunded.count.toLocaleString()}</dd>
                                    <dd className="text-[11.5px] text-slate-500">{m.compact(totals.refunded.amount)}</dd>
                                </div>
                            </dl>
                        </ChartCard>
                    </div>
                </div>

                <ChartCard title="Recent payments" description="Latest payment attempts across all plans">
                    {recent.length === 0 ? (
                        <p className="py-4 text-center text-[13px] text-slate-500">No payments yet.</p>
                    ) : (
                        <div className="-mx-4 overflow-x-auto sm:-mx-5">
                            <table className="w-full text-left text-[13px]">
                                <thead className="border-y border-slate-100 bg-slate-50 text-[11.5px] uppercase tracking-[0.08em] text-slate-500">
                                    <tr>
                                        <th className="px-4 py-2 font-semibold sm:px-5">Member</th>
                                        <th className="px-3 py-2 font-semibold">Plan</th>
                                        <th className="px-3 py-2 text-right font-semibold">Amount</th>
                                        <th className="px-3 py-2 font-semibold">Method</th>
                                        <th className="px-3 py-2 font-semibold">Status</th>
                                        <th className="px-4 py-2 text-right font-semibold sm:px-5">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100" style={{ fontVariantNumeric: "tabular-nums" }}>
                                    {recent.map((p) => (
                                        <tr key={p.id}>
                                            <td className="whitespace-nowrap px-4 py-2 sm:px-5">
                                                <span className="font-medium text-slate-900">{p.member}</span>
                                                {p.phone && <span className="ml-2 text-[12px] text-slate-400">{p.phone}</span>}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">{p.plan}</td>
                                            <td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-slate-900">{m.full(p.amount)}</td>
                                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">{p.method}</td>
                                            <td className="px-3 py-2">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-semibold capitalize ring-1 ring-inset ${STATUS[p.status] || STATUS.paid}`}>{p.status}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2 text-right text-slate-500 sm:px-5">
                                                {new Date(p.paid_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </ChartCard>
            </div>
        </div>
    );
}

