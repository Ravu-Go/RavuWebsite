import { useState } from "react";
import { ChartCard, columnPath, Delta, fmt, INK, niceTicks, StatTile, useWidth, ViewToggle } from "./chartKit";

/* ==========================================================================
   Partner insights — trends for the partner programme.
   Colours: the validated categorical slots 1–3 (blue, orange, aqua), checked
   for colour-blind separation on the white card surface. Aqua sits just under
   3:1 contrast, so every chart ships a table view and a legend.
   ========================================================================== */

export const SERIES = [
    { key: "registered", label: "Registered", color: "#2a78d6", hint: "Businesses that created a partner account" },
    { key: "submitted", label: "Submitted", color: "#eb6834", hint: "Applications sent to RAVU for review (incl. resubmissions)" },
    { key: "approved", label: "Approved", color: "#1baf7a", hint: "Applications approved by a reviewer" },
];

const RANGES = [
    { id: "30d", label: "30 days", period: "day", previous: "previous 30 days" },
    { id: "12w", label: "12 weeks", period: "week", previous: "previous 12 weeks" },
    { id: "12m", label: "12 months", period: "month", previous: "previous 12 months" },
];

/* --------------------------- Grouped column chart ------------------------- */

function TrendChart({ periods, unit }) {
    const [ref, width] = useWidth();
    const [hover, setHover] = useState(null);
    const height = 220;
    const margin = { top: 12, right: 4, bottom: 28, left: 34 };
    const plotW = Math.max(0, width - margin.left - margin.right);
    const plotH = height - margin.top - margin.bottom;

    const max = Math.max(0, ...periods.flatMap((p) => SERIES.map((s) => p[s.key])));
    const ticks = niceTicks(max);
    const top = ticks[ticks.length - 1];
    const y = (v) => margin.top + plotH - (v / top) * plotH;

    const band = periods.length ? plotW / periods.length : 0;
    const gap = 2;
    const barW = Math.max(2, Math.min(24, (band * 0.72 - gap * (SERIES.length - 1)) / SERIES.length));
    const groupW = barW * SERIES.length + gap * (SERIES.length - 1);
    const every = Math.max(1, Math.ceil(periods.length / Math.max(1, Math.floor(plotW / 54))));
    const empty = max === 0;

    const hovered = hover !== null ? periods[hover] : null;
    // Tooltip sits beside the hovered period (never on top of its bars), flipping left near the edge.
    const tipW = 176;
    const bandX = margin.left + band * (hover ?? 0);
    const tipLeft = bandX + band + 8 + tipW <= width ? bandX + band + 8 : Math.max(0, bandX - 8 - tipW);

    return (
        <div ref={ref} className="relative" onPointerLeave={() => setHover(null)}>
            {width > 0 && (
                <svg width={width} height={height} role="img" aria-label={`Partner registrations, submissions and approvals per ${unit}`} className="block overflow-visible">
                    {ticks.map((t) => (
                        <g key={t}>
                            <line x1={margin.left} x2={width - margin.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? INK.axis : INK.grid} strokeWidth="1" shapeRendering="crispEdges" />
                            <text x={margin.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={INK.muted} style={{ fontVariantNumeric: "tabular-nums" }}>
                                {fmt(t)}
                            </text>
                        </g>
                    ))}

                    {periods.map((p, i) => {
                        const x0 = margin.left + band * i + (band - groupW) / 2;
                        return (
                            <g key={p.start}>
                                {hover === i && <rect x={margin.left + band * i + 1} y={margin.top} width={Math.max(0, band - 2)} height={plotH} rx="6" fill="#f1f5f9" />}
                                {SERIES.map((s, j) => {
                                    const v = p[s.key];
                                    if (!v) return null;
                                    const h = Math.max(1, plotH - (y(v) - margin.top));
                                    return <path key={s.key} d={columnPath(x0 + j * (barW + gap), y(v), barW, h)} fill={s.color} opacity={hover === null || hover === i ? 1 : 0.55} />;
                                })}
                                {i % every === 0 && (
                                    <text x={margin.left + band * i + band / 2} y={height - 8} textAnchor="middle" fontSize="11" fill={INK.muted}>
                                        {p.label}
                                    </text>
                                )}
                                {/* Hit target: the whole period band, focusable for keyboard users. */}
                                <rect
                                    x={margin.left + band * i}
                                    y={margin.top}
                                    width={band}
                                    height={plotH}
                                    fill="transparent"
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`${p.long}: ${SERIES.map((s) => `${p[s.key]} ${s.label.toLowerCase()}`).join(", ")}`}
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

            {empty && width > 0 && (
                <div className="pointer-events-none absolute inset-x-0 top-[38%] text-center">
                    <p className="inline-block rounded-lg bg-white/90 px-3 py-1.5 text-[13px] font-medium text-slate-500 shadow-[0_0_0_1px_rgba(15,23,42,0.06)]">No partner activity in this period yet</p>
                </div>
            )}

            {hovered && (
                <div
                    className="pointer-events-none absolute top-0 z-10 w-44 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.35)] backdrop-blur"
                    style={{ left: tipLeft }}
                >
                    <p className="text-[11.5px] font-medium text-slate-500">{hovered.long}</p>
                    <ul className="mt-1.5 space-y-1">
                        {SERIES.map((s) => (
                            <li key={s.key} className="flex items-center gap-2">
                                <span className="h-0.5 w-3 rounded-full" style={{ background: s.color }} />
                                <span className="text-[13px] font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                                    {fmt(hovered[s.key])}
                                </span>
                                <span className="text-[12px] text-slate-500">{s.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function TrendTable({ periods, unit }) {
    return (
        <div className="max-h-[220px] overflow-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-[13px]">
                <caption className="sr-only">Partner activity per {unit}</caption>
                <thead className="sticky top-0 bg-slate-50 text-[12px] text-slate-500">
                    <tr>
                        <th className="px-3 py-2 font-medium capitalize">{unit}</th>
                        {SERIES.map((s) => (
                            <th key={s.key} className="px-3 py-2 text-right font-medium">
                                {s.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {[...periods].reverse().map((p) => (
                        <tr key={p.start}>
                            <td className="px-3 py-2 text-slate-700">{p.long}</td>
                            {SERIES.map((s) => (
                                <td key={s.key} className="px-3 py-2 text-right text-slate-900">
                                    {fmt(p[s.key])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ----------------------------- Bars & meters ------------------------------ */

function Funnel({ funnel }) {
    const base = funnel.registered || 0;
    const rows = [
        { label: "Registered an account", value: funnel.registered },
        { label: "Submitted an application", value: funnel.submitted },
        { label: "Approved as a partner", value: funnel.approved },
    ];
    if (!base) return <p className="py-6 text-center text-[13px] text-slate-500">No businesses registered in this period.</p>;
    return (
        <ul className="space-y-3">
            {rows.map((row) => {
                const pct = Math.round((row.value / base) * 100);
                return (
                    <li key={row.label}>
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="text-[13px] text-slate-600">{row.label}</span>
                            <span className="text-[13px] text-slate-500" style={{ fontVariantNumeric: "tabular-nums" }}>
                                <span className="font-semibold text-slate-900">{fmt(row.value)}</span> · {pct}%
                            </span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: INK.track }} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`${row.label}: ${pct}%`}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: SERIES[0].color }} />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

function CategoryBars({ categories }) {
    if (!categories.length) return <p className="py-6 text-center text-[13px] text-slate-500">No businesses registered in this period.</p>;
    const max = Math.max(...categories.map((c) => c.count));
    const shown = categories.slice(0, 8);
    return (
        <ul className="space-y-2">
            {shown.map((c) => (
                <li key={c.name} className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3 sm:grid-cols-[minmax(0,11rem)_1fr]">
                    <span className="truncate text-[13px] text-slate-600" title={c.name}>
                        {c.name}
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="h-2.5 rounded-r-[4px]" style={{ width: `${Math.max(2, (c.count / max) * 85)}%`, background: SERIES[0].color }} />
                        <span className="text-[12.5px] font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {fmt(c.count)}
                        </span>
                    </span>
                </li>
            ))}
            {categories.length > shown.length && (
                <li className="text-[12px] text-slate-400">+ {categories.length - shown.length} more categories</li>
            )}
        </ul>
    );
}

/* ---------------------------------- Panel --------------------------------- */

export default function PartnerInsights({ insights, loading, onRangeChange }) {
    const [table, setTable] = useState(false);
    const range = RANGES.find((r) => r.id === insights?.range) || RANGES[1];

    if (!insights) {
        return (
            <div className="animate-pulse space-y-6" aria-busy="true">
                <div className="h-9 w-72 rounded-lg bg-slate-200/70" />
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-28 rounded-2xl bg-white" />
                    ))}
                </div>
                <div className="h-80 rounded-2xl bg-white" />
            </div>
        );
    }

    const { totals, review, funnel, categories, periods, unit } = insights;

    return (
        <div className="space-y-4">
            {/* One filter row above everything it scopes. */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-[0_1px_2px_rgba(16,24,40,0.04)]" role="group" aria-label="Time range">
                    {RANGES.map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => r.id !== insights.range && onRangeChange(r.id)}
                            aria-pressed={r.id === insights.range}
                            className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${r.id === insights.range ? "bg-[#00289a] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                        >
                            Last {r.label}
                        </button>
                    ))}
                </div>
                <p className="text-[12.5px] text-slate-500">Grouped by {range.period}</p>
            </div>

            {/* Refetch keeps the frame: hold the previous render, dimmed. */}
            <div className={`space-y-4 transition-opacity ${loading ? "pointer-events-none opacity-50" : ""}`}>
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {SERIES.map((s) => (
                        <StatTile key={s.key} label={`${s.label}`} value={fmt(totals[s.key].current)}>
                            <Delta current={totals[s.key].current} previous={totals[s.key].previous} previousLabel={range.previous} />
                        </StatTile>
                    ))}
                    <StatTile label="Median review time" value={review.median_days === null ? "—" : `${review.median_days} ${review.median_days === 1 ? "day" : "days"}`}>
                        <p className="mt-1 text-[11.5px] text-slate-500">
                            {review.decisions
                                ? `${review.decisions} decision${review.decisions === 1 ? "" : "s"} · ${review.approval_rate}% approved`
                                : "No decisions in this period"}
                        </p>
                    </StatTile>
                </div>

                <ChartCard
                    title="Partner requests over time"
                    description={`Registrations, submissions and approvals per ${range.period}`}
                    actions={<ViewToggle table={table} onChange={setTable} />}
                >
                    <ul className="mb-2 flex flex-wrap gap-x-5 gap-y-1.5">
                        {SERIES.map((s) => (
                            <li key={s.key} className="flex items-center gap-2 text-[12.5px] text-slate-600" title={s.hint}>
                                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
                                {s.label}
                                <span className="font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                                    {fmt(totals[s.key].current)}
                                </span>
                            </li>
                        ))}
                    </ul>
                    {table ? <TrendTable periods={periods} unit={unit} /> : <TrendChart periods={periods} unit={unit} />}
                </ChartCard>

                <div className="grid items-start gap-4 lg:grid-cols-2">
                    <ChartCard title="Conversion" description="Of the businesses that registered in this period, how far they've got">
                        <Funnel funnel={funnel} />
                    </ChartCard>
                    <ChartCard title="Registrations by category" description="Businesses that registered in this period">
                        <CategoryBars categories={categories} />
                    </ChartCard>
                </div>
            </div>
        </div>
    );
}
