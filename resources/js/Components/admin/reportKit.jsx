import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { ChartCard, columnPath, fmt, INK, niceTicks, useWidth, ViewToggle } from "./chartKit";

/* ==========================================================================
   Report pieces shared by the partner portal and the Super Admin partner
   reports: money formatting, a month/year picker, a single-series column
   chart (hover tooltip + table view) and a horizontal bar list.
   One measure at a time, one hue (categorical slot 1) — the card title
   names the series, so no legend is needed.
   ========================================================================== */

export const SERIES = "#2a78d6";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function money(currency = "TZS") {
    const symbol = currency === "TZS" ? "TSh" : currency;
    const full = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
    const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
    return {
        full: (n) => `${symbol} ${full.format(n ?? 0)}`,
        compact: (n) => `${symbol} ${compact.format(n ?? 0)}`,
        axis: (n) => compact.format(n ?? 0),
    };
}

export const formatDate = (iso, opts = { day: "numeric", month: "short", year: "numeric" }) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", opts) : "—";

export const formatDateTime = (iso) =>
    iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

/* ------------------------------ Period picker ----------------------------- */

/** Year + month selects. `allowYear` adds a "Whole year" choice. Future months are disabled. */
export function PeriodPicker({ period, years = [], onChange, allowYear = true, loading = false }) {
    const key = period?.key || "";
    const year = key.slice(0, 4);
    const month = key.length === 7 ? key.slice(5, 7) : "";
    const now = new Date();
    const isFuture = (y, m) => Number(y) > now.getFullYear() || (Number(y) === now.getFullYear() && Number(m) > now.getMonth() + 1);
    const choose = (y, m) => {
        if (m && isFuture(y, m)) m = String(now.getMonth() + 1).padStart(2, "0");
        onChange(m ? `${y}-${m}` : y);
    };
    const select = "h-9 rounded-lg border border-slate-200 bg-white pl-2.5 pr-7 text-[13px] font-semibold text-slate-800 focus:border-[#1864E8] focus:outline-none focus:ring-2 focus:ring-[#1864E8]/20";

    return (
        <div className="flex flex-wrap items-center gap-2" aria-busy={loading}>
            <CalendarDays size={16} className="text-slate-400" aria-hidden="true" />
            <label className="sr-only" htmlFor="period-month">Month</label>
            <select id="period-month" className={select} value={month} onChange={(e) => choose(year, e.target.value)} disabled={loading}>
                {allowYear && <option value="">Whole year</option>}
                {MONTHS.map((label, i) => {
                    const m = String(i + 1).padStart(2, "0");
                    return (
                        <option key={m} value={m} disabled={isFuture(year, m)}>
                            {label}
                        </option>
                    );
                })}
            </select>
            <label className="sr-only" htmlFor="period-year">Year</label>
            <select id="period-year" className={select} value={year} onChange={(e) => choose(e.target.value, month)} disabled={loading}>
                {(years.length ? years : [now.getFullYear()]).map((y) => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>
            {loading && <span className="text-[12px] text-slate-400">Updating…</span>}
        </div>
    );
}

/* ---------------------------- Segmented control --------------------------- */

export function Segmented({ options, value, onChange, label }) {
    return (
        <div className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-slate-50 p-0.5" role="group" aria-label={label}>
            {options.map((o) => (
                <button
                    key={o.id}
                    type="button"
                    onClick={() => onChange(o.id)}
                    aria-pressed={value === o.id}
                    className={`rounded-md px-2.5 py-1 text-[12px] font-semibold transition ${value === o.id ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(16,24,40,0.08)]" : "text-slate-500 hover:text-slate-800"}`}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

/* ------------------------------- Column chart ----------------------------- */

/**
 * Single-series columns. data: [{ label, long?, value, future? }].
 * `format` renders values in the tooltip; `axis` renders tick labels.
 */
export function ColumnChart({ data, format = fmt, axis = fmt, ariaLabel, height = 220, details }) {
    const [ref, width] = useWidth();
    const [hover, setHover] = useState(null);
    const margin = { top: 12, right: 4, bottom: 28, left: 44 };
    const plotW = Math.max(0, width - margin.left - margin.right);
    const plotH = height - margin.top - margin.bottom;
    const ticks = niceTicks(Math.max(0, ...data.map((d) => d.value || 0)));
    const top = ticks[ticks.length - 1] || 1;
    const scale = (v) => (v / top) * plotH;
    const band = data.length ? plotW / data.length : 0;
    const barW = Math.max(3, Math.min(28, band * 0.62));
    const every = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(plotW / 36))));
    const hovered = hover !== null ? data[hover] : null;
    const tipW = 200;
    const bandX = margin.left + band * (hover ?? 0);
    const tipLeft = bandX + band + 8 + tipW <= width ? bandX + band + 8 : Math.max(0, bandX - 8 - tipW);

    return (
        <div ref={ref} className="relative" onPointerLeave={() => setHover(null)}>
            {width > 0 && (
                <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block overflow-visible">
                    {ticks.map((t) => (
                        <g key={t}>
                            <line x1={margin.left} x2={width - margin.right} y1={margin.top + plotH - scale(t)} y2={margin.top + plotH - scale(t)} stroke={t === 0 ? INK.axis : INK.grid} shapeRendering="crispEdges" />
                            <text x={margin.left - 8} y={margin.top + plotH - scale(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={INK.muted} style={{ fontVariantNumeric: "tabular-nums" }}>
                                {axis(t)}
                            </text>
                        </g>
                    ))}
                    {data.map((d, i) => {
                        const x = margin.left + band * i + (band - barW) / 2;
                        const h = d.value > 0 ? Math.max(1, scale(d.value)) : 0;
                        return (
                            <g key={d.key ?? d.label}>
                                {hover === i && <rect x={margin.left + band * i + 1} y={margin.top} width={Math.max(0, band - 2)} height={plotH} rx="6" fill="#f1f5f9" />}
                                {h > 0 && <path d={columnPath(x, margin.top + plotH - h, barW, h)} fill={SERIES} opacity={hover === null || hover === i ? 1 : 0.55} />}
                                {i % every === 0 && (
                                    <text x={margin.left + band * i + band / 2} y={height - 8} textAnchor="middle" fontSize="11" fill={d.future ? "#c3cad5" : INK.muted}>
                                        {d.label}
                                    </text>
                                )}
                                <rect
                                    x={margin.left + band * i}
                                    y={margin.top}
                                    width={band}
                                    height={plotH}
                                    fill="transparent"
                                    tabIndex={d.future ? -1 : 0}
                                    role="button"
                                    aria-label={`${d.long || d.label}: ${d.future ? "not yet" : format(d.value)}`}
                                    onPointerEnter={() => !d.future && setHover(i)}
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
                    <p className="text-[11.5px] font-medium text-slate-500">{hovered.long || hovered.label}</p>
                    <p className="mt-0.5 text-[15px] font-semibold text-slate-950" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {format(hovered.value)}
                    </p>
                    {details && <div className="mt-1.5 space-y-0.5 text-[12px] text-slate-600">{details(hovered)}</div>}
                </div>
            )}
        </div>
    );
}

/**
 * Monthly trend with one measure at a time (switchable) and a table view.
 * metrics: [{ id, label, format, axis }]; trend rows carry every metric id.
 */
export function TrendCard({ title, description, trend, metrics }) {
    const [metric, setMetric] = useState(metrics[0].id);
    const [table, setTable] = useState(false);
    const m = metrics.find((x) => x.id === metric) || metrics[0];
    const data = trend.map((t) => ({ ...t, value: t[m.id] }));

    return (
        <ChartCard
            title={title}
            description={description}
            actions={
                <div className="flex flex-wrap items-center gap-2">
                    <Segmented options={metrics} value={metric} onChange={setMetric} label="Measure" />
                    <ViewToggle table={table} onChange={setTable} />
                </div>
            }
        >
            {table ? (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-[13px]">
                        <thead>
                            <tr className="border-b border-slate-200 text-[11.5px] uppercase tracking-wide text-slate-500">
                                <th className="py-2 pr-3 font-semibold">Month</th>
                                {metrics.map((x) => (
                                    <th key={x.id} className="py-2 pl-3 text-right font-semibold">{x.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {trend.filter((t) => !t.future).map((t) => (
                                <tr key={t.key} className="border-b border-slate-100 last:border-0">
                                    <td className="py-2 pr-3 font-medium text-slate-800">{t.long}</td>
                                    {metrics.map((x) => (
                                        <td key={x.id} className="py-2 pl-3 text-right text-slate-700" style={{ fontVariantNumeric: "tabular-nums" }}>{x.format(t[x.id])}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <ColumnChart data={data} format={m.format} axis={m.axis || m.format} ariaLabel={`${m.label} by month`} />
            )}
        </ChartCard>
    );
}

/* -------------------------------- Bar list -------------------------------- */

/** Ranked horizontal bars: rows [{ name, ...values }], `value` picks the measure. */
export function BarList({ rows, value = "members", format = fmt, secondary, empty = "No activity in this period." }) {
    const max = Math.max(1, ...rows.map((r) => r[value] || 0));
    if (!rows.length) return <p className="py-6 text-center text-[13px] text-slate-400">{empty}</p>;
    return (
        <ul className="space-y-2.5">
            {rows.map((r) => (
                <li key={r.name}>
                    <div className="flex items-baseline justify-between gap-3 text-[13px]">
                        <span className="min-w-0 truncate font-medium text-slate-800">{r.name}</span>
                        <span className="shrink-0 font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {format(r[value])}
                            {secondary && <span className="ml-1.5 font-normal text-slate-500">{secondary(r)}</span>}
                        </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${((r[value] || 0) / max) * 100}%`, background: SERIES }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}

/* ------------------------------ Status pill ------------------------------- */

const PAYOUT_STATUS = {
    estimate: { label: "Estimate · month in progress", tone: "bg-sky-50 text-sky-800 ring-sky-600/15" },
    pending_approval: { label: "Awaiting RAVU approval", tone: "bg-amber-50 text-amber-800 ring-amber-600/20" },
    approved: { label: "Approved · payment pending", tone: "bg-indigo-50 text-indigo-800 ring-indigo-600/15" },
    paid: { label: "Paid", tone: "bg-emerald-50 text-emerald-800 ring-emerald-600/15" },
};

export function PayoutStatus({ status, short = false }) {
    const s = PAYOUT_STATUS[status] || { label: status, tone: "bg-slate-100 text-slate-700 ring-slate-500/20" };
    const label = short ? s.label.split(" · ")[0] : s.label;
    return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset ${s.tone}`}>{label}</span>;
}

export function DemoBadge({ children = "Sample data" }) {
    return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">{children}</span>;
}
