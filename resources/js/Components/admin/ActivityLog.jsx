import {
    Building2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    FileText,
    Image as ImageIcon,
    Layers,
    LogIn,
    LogOut,
    Search,
    Settings2,
    ShieldAlert,
    Smartphone,
    UserCog,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ==========================================================================
   Activity log — every recorded event in the portal, newest first.
   ========================================================================== */

export const CATEGORY = {
    partner: { label: "Partners", icon: Building2, tone: "bg-blue-50 text-blue-600 ring-blue-600/10" },
    content: { label: "Website content", icon: FileText, tone: "bg-violet-50 text-violet-600 ring-violet-600/10" },
    media: { label: "Media", icon: ImageIcon, tone: "bg-pink-50 text-pink-600 ring-pink-600/10" },
    settings: { label: "Partner settings", icon: Settings2, tone: "bg-slate-100 text-slate-600 ring-slate-600/10" },
    account: { label: "Accounts", icon: UserCog, tone: "bg-amber-50 text-amber-600 ring-amber-600/15" },
    auth: { label: "Sign-ins & security", icon: LogIn, tone: "bg-emerald-50 text-emerald-600 ring-emerald-600/10" },
    access: { label: "Data access", icon: Eye, tone: "bg-cyan-50 text-cyan-700 ring-cyan-600/15" },
    mobile: { label: "Mobile app", icon: Smartphone, tone: "bg-indigo-50 text-indigo-600 ring-indigo-600/15" },
    membership: { label: "Membership", icon: Layers, tone: "bg-teal-50 text-teal-700 ring-teal-600/15" },
};

const ACTION_LABELS = {
    signed_in: "Successful sign-ins",
    sign_in_failed: "Failed sign-in attempts",
    sign_in_locked_out: "Lockouts",
    sign_in_denied: "Refused sign-ins",
    signed_out: "Sign-outs",
    access_denied: "Blocked page visits",
};

const SECURITY_ACTIONS = new Set(["sign_in_failed", "sign_in_locked_out", "sign_in_denied", "access_denied", "registration_rate_limited"]);

const FAILED = { icon: ShieldAlert, tone: "bg-rose-50 text-rose-600 ring-rose-600/15" };

const PERIODS = [
    { id: "today", label: "Today" },
    { id: "7d", label: "Last 7 days" },
    { id: "30d", label: "Last 30 days" },
    { id: "90d", label: "Last 90 days" },
    { id: "all", label: "All time" },
];

export function categoryStyle(entry) {
    if (SECURITY_ACTIONS.has(entry.action)) return { ...(CATEGORY[entry.category] || CATEGORY.auth), ...FAILED };
    if (entry.action === "signed_out") return { ...CATEGORY.auth, icon: LogOut, tone: "bg-slate-100 text-slate-500 ring-slate-600/10" };
    return CATEGORY[entry.category] || CATEGORY.settings;
}

const time = (value) => new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
const full = (value) => new Date(value).toLocaleString(undefined, { dateStyle: "full", timeStyle: "medium" });

function dayLabel(value) {
    const date = new Date(value);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

const selectClass =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(16,24,40,0.05)] focus:border-[#00289a] focus:outline-none focus:ring-4 focus:ring-[#00289a]/10";

/* --------------------------------- Rows ---------------------------------- */

function Entry({ entry }) {
    const [open, setOpen] = useState(false);
    const style = categoryStyle(entry);
    const Icon = style.icon;
    const expandable = entry.details.length > 0 || entry.user_agent || entry.ip_address;

    return (
        <li className={open ? "bg-slate-50/60" : ""}>
            <button
                type="button"
                onClick={() => expandable && setOpen(!open)}
                aria-expanded={expandable ? open : undefined}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left sm:px-5 ${expandable ? "hover:bg-slate-50" : "cursor-default"}`}
            >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${style.tone}`}>
                    <Icon size={15} />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-[13.5px] font-medium text-slate-900 sm:line-clamp-1">{entry.description}</span>
                    <span className="mt-0.5 block truncate text-[12px] text-slate-500">
                        {entry.user?.name || "System"}
                        {entry.partner && entry.category !== "partner" ? ` · ${entry.partner}` : ""}
                        {" · "}
                        <time dateTime={entry.created_at} title={full(entry.created_at)}>
                            {time(entry.created_at)}
                        </time>
                        {entry.ip_address ? ` · ${entry.ip_address}` : ""}
                    </span>
                </span>
                <span className="hidden shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200 sm:inline">
                    {CATEGORY[entry.category]?.label || entry.category}
                </span>
                {expandable && <ChevronDown size={15} className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />}
            </button>

            {open && (
                <dl className="grid gap-x-6 gap-y-2 border-t border-slate-100 px-4 py-3 pl-[60px] text-[12.5px] sm:grid-cols-2 sm:px-5 sm:pl-[64px] xl:grid-cols-3">
                    {entry.details.map((row) => (
                        <div key={row.label} className="min-w-0">
                            <dt className="text-slate-400">{row.label}</dt>
                            <dd className="break-words text-slate-800">{row.value}</dd>
                        </div>
                    ))}
                    {entry.user?.email && (
                        <div className="min-w-0">
                            <dt className="text-slate-400">Account</dt>
                            <dd className="break-words text-slate-800">{entry.user.email}</dd>
                        </div>
                    )}
                    <div className="min-w-0">
                        <dt className="text-slate-400">When</dt>
                        <dd className="text-slate-800">{full(entry.created_at)}</dd>
                    </div>
                    {entry.ip_address && (
                        <div className="min-w-0">
                            <dt className="text-slate-400">IP address</dt>
                            <dd className="text-slate-800">{entry.ip_address}</dd>
                        </div>
                    )}
                    {entry.user_agent && (
                        <div className="min-w-0 sm:col-span-2 xl:col-span-3">
                            <dt className="text-slate-400">Device</dt>
                            <dd className="break-words text-slate-600">{entry.user_agent}</dd>
                        </div>
                    )}
                </dl>
            )}
        </li>
    );
}

/* -------------------------------- Summary -------------------------------- */

function SummaryTile({ label, value, alert, active, onClick }) {
    const Tag = onClick ? "button" : "div";
    return (
        <Tag
            {...(onClick ? { type: "button", onClick, "aria-pressed": active } : {})}
            className={`rounded-xl border px-3.5 py-2.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition ${onClick ? "hover:border-slate-300" : ""} ${active ? "border-[#00289a] ring-2 ring-[#00289a]/15" : "border-slate-200/80"} ${alert && value > 0 ? "bg-rose-50/60" : "bg-white"}`}
        >
            <span className="block text-[12px] font-medium text-slate-500">{label}</span>
            <span className={`mt-0.5 block text-xl font-semibold tracking-tight ${alert && value > 0 ? "text-rose-700" : "text-slate-950"}`}>{value.toLocaleString()}</span>
        </Tag>
    );
}

function FailuresByAccount({ rows, onPick }) {
    if (!rows.length) return null;
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <header className="flex items-center gap-2 px-4 pb-2 pt-3.5 sm:px-5">
                <ShieldAlert size={15} className="text-rose-600" />
                <h3 className="text-[14px] font-semibold tracking-tight text-slate-900">Failed sign-ins by account</h3>
                <span className="text-[12.5px] text-slate-500">· in this period</span>
            </header>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                    <thead className="border-y border-slate-100 bg-slate-50 text-[11.5px] uppercase tracking-[0.08em] text-slate-500">
                        <tr>
                            <th className="px-4 py-2 font-semibold sm:px-5">Email tried</th>
                            <th className="px-3 py-2 text-right font-semibold">Failed</th>
                            <th className="px-3 py-2 text-right font-semibold">Lockouts</th>
                            <th className="px-3 py-2 text-right font-semibold">Refused</th>
                            <th className="px-3 py-2 text-right font-semibold">IP addresses</th>
                            <th className="px-4 py-2 text-right font-semibold sm:px-5">Last attempt</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {rows.map((row) => (
                            <tr key={row.email} className="cursor-pointer hover:bg-slate-50" onClick={() => onPick(row.email)}>
                                <td className="px-4 py-2 font-medium text-slate-900 sm:px-5">{row.email}</td>
                                <td className={`px-3 py-2 text-right ${row.failed ? "font-semibold text-rose-700" : "text-slate-400"}`}>{row.failed}</td>
                                <td className={`px-3 py-2 text-right ${row.locked ? "font-semibold text-rose-700" : "text-slate-400"}`}>{row.locked}</td>
                                <td className={`px-3 py-2 text-right ${row.denied ? "font-semibold text-slate-800" : "text-slate-400"}`}>{row.denied}</td>
                                <td className="px-3 py-2 text-right text-slate-700">{row.ips}</td>
                                <td className="whitespace-nowrap px-4 py-2 text-right text-slate-500 sm:px-5">{row.last_at ? new Date(row.last_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

/* --------------------------------- Panel --------------------------------- */

export default function ActivityLog({ log, loading, onChange }) {
    const filters = log?.filters || { q: "", category: "", action: "", user: null, period: "30d" };
    const [query, setQuery] = useState(filters.q || "");
    const first = useRef(true);
    // The most recently requested filters. Changes build on these rather than on the
    // last response, so two quick changes (e.g. a type chip, then clearing search) never clobber each other.
    const latest = useRef(filters);
    useEffect(() => {
        latest.current = log?.filters || latest.current;
    }, [log]);
    const request = (patch) => {
        const next = { ...latest.current, ...patch };
        latest.current = next;
        onChange(next);
    };

    // Search as you type, after a short pause.
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return undefined;
        }
        const timer = setTimeout(() => request({ q: query, p: 1 }), 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    if (!log) {
        return (
            <div className="animate-pulse space-y-3" aria-busy="true">
                <div className="h-10 rounded-lg bg-slate-200/70" />
                <div className="h-96 rounded-2xl bg-white" />
            </div>
        );
    }

    const set = (patch) => request({ q: query, ...patch });
    const params = new URLSearchParams(
        Object.entries({ q: query, category: filters.category, action: filters.action, user: filters.user ?? "", period: filters.period }).filter(([, v]) => v !== "" && v !== null),
    );
    const { pagination, entries, summary } = log;
    const pickAction = (action) => set({ category: "", action: filters.action === action ? "" : action, p: 1 });

    // Group consecutive entries by calendar day.
    const groups = [];
    entries.forEach((entry) => {
        const label = dayLabel(entry.created_at);
        if (groups[groups.length - 1]?.label !== label) groups.push({ label, items: [] });
        groups[groups.length - 1].items.push(entry);
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#00289a]">Workspace</p>
                    <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-950">Activity log</h2>
                    <p className="mt-0.5 text-[13px] text-slate-500">Everything recorded across the portal: sign-ins and failed attempts, partner activity, publishing, media, settings, account changes and access to private data.</p>
                </div>
                <a
                    href={`/super-admin/activity/export?${params}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-700 shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition hover:bg-slate-50"
                >
                    <Download size={15} /> Export CSV
                </a>
            </div>

            {/* Headline counts for the chosen person and period; each one filters the list. */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
                <SummaryTile label="All events" value={summary.total} active={!filters.action && !filters.category} onClick={() => set({ category: "", action: "", p: 1 })} />
                <SummaryTile label="Successful sign-ins" value={summary.signed_in} active={filters.action === "signed_in"} onClick={() => pickAction("signed_in")} />
                <SummaryTile label="Failed attempts" value={summary.sign_in_failed} alert active={filters.action === "sign_in_failed"} onClick={() => pickAction("sign_in_failed")} />
                <SummaryTile label="Lockouts" value={summary.sign_in_locked_out} alert active={filters.action === "sign_in_locked_out"} onClick={() => pickAction("sign_in_locked_out")} />
                <SummaryTile label="Blocked page visits" value={summary.access_denied} alert active={filters.action === "access_denied"} onClick={() => pickAction("access_denied")} />
                <SummaryTile label="IP addresses" value={summary.unique_ips} />
            </div>

            <FailuresByAccount rows={summary.failures_by_account} onPick={(email) => { setQuery(email); set({ q: email, category: "auth", action: "", p: 1 }); }} />

            {/* One filter row above everything it scopes. */}
            <div className="flex flex-wrap items-center gap-2">
                <label className="relative min-w-[220px] flex-1 sm:max-w-sm">
                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search people, partners, pages, IPs…"
                        className={`${selectClass} w-full pl-9 pr-8 font-normal`}
                        aria-label="Search activity"
                    />
                    {query && (
                        <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-700" aria-label="Clear search">
                            <X size={14} />
                        </button>
                    )}
                </label>
                <select value={filters.user ?? ""} onChange={(e) => set({ user: e.target.value || null, p: 1 })} className={selectClass} aria-label="Person">
                    <option value="">Everyone</option>
                    {log.people.map((person) => (
                        <option key={person.id} value={person.id}>
                            {person.name}
                        </option>
                    ))}
                </select>
                <select value={filters.period} onChange={(e) => set({ period: e.target.value, p: 1 })} className={selectClass} aria-label="Period">
                    {PERIODS.map((period) => (
                        <option key={period.id} value={period.id}>
                            {period.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Type">
                {[["", "All activity"], ...Object.entries(CATEGORY).map(([id, c]) => [id, c.label])].map(([id, label]) => (
                    <button
                        key={id || "all"}
                        type="button"
                        onClick={() => set({ category: id, action: "", p: 1 })}
                        aria-pressed={filters.category === id && !filters.action}
                        className={`rounded-full px-3 py-1 text-[12.5px] font-semibold transition ${filters.category === id && !filters.action ? "bg-[#00289a] text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900 hover:ring-slate-300"}`}
                    >
                        {label}
                    </button>
                ))}
                {filters.action && (
                    <button
                        type="button"
                        onClick={() => set({ action: "", p: 1 })}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#00289a] px-3 py-1 text-[12.5px] font-semibold text-white"
                        aria-label={`Remove filter: ${ACTION_LABELS[filters.action] || filters.action}`}
                    >
                        Only: {ACTION_LABELS[filters.action] || filters.action.replaceAll("_", " ")} <X size={13} />
                    </button>
                )}
            </div>

            <section className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-opacity ${loading ? "opacity-50" : ""}`}>
                {entries.length === 0 ? (
                    <div className="flex flex-col items-center px-6 py-12 text-center">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                            <Search size={17} />
                        </span>
                        <p className="mt-3 text-sm font-semibold text-slate-800">No activity matches</p>
                        <p className="mt-1 text-[13px] text-slate-500">Try a longer period or clear some filters.</p>
                    </div>
                ) : (
                    groups.map((group) => (
                        <div key={group.label + group.items[0].id} className="[&:first-child>p]:border-t-0">
                            <p className="border-y border-slate-100 bg-slate-50 px-4 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-slate-500 sm:px-5">
                                {group.label}
                            </p>
                            <ul className="divide-y divide-slate-100">
                                {group.items.map((entry) => (
                                    <Entry key={entry.id} entry={entry} />
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </section>

            {pagination.total > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-slate-500">
                    <p>
                        Showing <span className="font-semibold text-slate-800">{pagination.from}–{pagination.to}</span> of{" "}
                        <span className="font-semibold text-slate-800">{pagination.total.toLocaleString()}</span> events
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={pagination.current <= 1 || loading}
                            onClick={() => set({ p: pagination.current - 1 })}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                            <ChevronLeft size={14} /> Newer
                        </button>
                        <span className="px-2">
                            Page {pagination.current} of {pagination.last}
                        </span>
                        <button
                            type="button"
                            disabled={pagination.current >= pagination.last || loading}
                            onClick={() => set({ p: pagination.current + 1 })}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                            Older <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
