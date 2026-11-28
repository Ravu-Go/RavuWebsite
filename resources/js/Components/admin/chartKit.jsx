import { ArrowDownRight, ArrowUpRight, BarChart3, Minus, Table2 } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

/* ==========================================================================
   Shared chart pieces for the admin console (Insights, Revenue).
   Thin marks, 4px rounded data-ends, hairline grid, legend + table view.
   ========================================================================== */

export const INK = { grid: "#e9edf3", axis: "#cbd2dc", muted: "#8a93a3", track: "#e8f0fb" };

export const fmt = (n) => (n ?? 0).toLocaleString();

/** Clean integer ticks: 0 … max in 1/2/5×10ⁿ steps, about four of them. */
export function niceTicks(max) {
    if (max <= 0) return [0, 1, 2, 3, 4];
    if (max <= 4) return Array.from({ length: max + 1 }, (_, i) => i);
    const raw = max / 4;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw);
    const top = Math.ceil(max / step) * step;
    return Array.from({ length: top / step + 1 }, (_, i) => i * step);
}

/** Column with a 4px rounded data-end and a square baseline. */
export function columnPath(x, y, w, h) {
    const r = Math.min(4, w / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

export function useWidth() {
    const ref = useRef(null);
    const [width, setWidth] = useState(0);
    useLayoutEffect(() => {
        if (!ref.current) return undefined;
        const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return [ref, width];
}

/* ------------------------------- Pieces ---------------------------------- */

export function ViewToggle({ table, onChange }) {
    return (
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5" role="group" aria-label="View">
            {[
                { on: false, icon: BarChart3, label: "Chart" },
                { on: true, icon: Table2, label: "Table" },
            ].map(({ on, icon: Icon, label }) => (
                <button
                    key={label}
                    type="button"
                    onClick={() => onChange(on)}
                    aria-pressed={table === on}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-semibold transition ${table === on ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(16,24,40,0.08)]" : "text-slate-500 hover:text-slate-800"}`}
                >
                    <Icon size={13} /> {label}
                </button>
            ))}
        </div>
    );
}

/**
 * Change against a previous figure. `format` renders the difference; `percent` shows it
 * as a share of the previous value; `lowerIsBetter` flips the good/bad colouring.
 * Direction is always carried by the arrow and sign as well as colour.
 */
export function Delta({ current, previous, previousLabel, format = fmt, percent = false, lowerIsBetter = false }) {
    const diff = current - previous;
    if (current === 0 && previous === 0) return <p className="mt-1 text-[11.5px] text-slate-400">No activity in either period</p>;
    const Icon = diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus;
    const good = lowerIsBetter ? diff < 0 : diff > 0;
    const tone = diff === 0 ? "text-slate-500" : good ? "text-emerald-700" : "text-rose-700";
    const shown = percent && previous > 0 ? `${Math.round((diff / previous) * 100)}%` : format(Math.abs(diff));
    return (
        <p className="mt-1 flex items-center gap-1 text-[11.5px] text-slate-500">
            <span className={`inline-flex items-center gap-0.5 font-semibold ${tone}`}>
                <Icon size={13} />
                {diff > 0 ? "+" : diff < 0 ? "−" : ""}
                {shown.replace(/^-/, "")}
            </span>
            vs {previousLabel}
        </p>
    );
}

export function StatTile({ label, value, children }) {
    return (
        <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <p className="text-[12px] font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-semibold leading-tight tracking-tight text-slate-950">{value}</p>
            {children}
        </div>
    );
}

export function ChartCard({ title, description, actions, children }) {
    return (
        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <header className="flex flex-wrap items-start justify-between gap-3 px-4 pb-2 pt-3.5 sm:px-5">
                <div className="min-w-0">
                    <h3 className="text-[14px] font-semibold tracking-tight text-slate-900">{title}</h3>
                    {description && <p className="mt-0.5 text-[12.5px] text-slate-500">{description}</p>}
                </div>
                {actions}
            </header>
            <div className="px-4 pb-4 sm:px-5">{children}</div>
        </section>
    );
}
