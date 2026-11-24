import { router, useForm } from "@inertiajs/react";
import {
    AlertTriangle,
    BellRing,
    Check,
    Code2,
    Copy,
    Download,
    LifeBuoy,
    Loader2,
    Megaphone,
    Pause,
    Pencil,
    Play,
    Plus,
    Power,
    RefreshCw,
    Smartphone,
    ToggleRight,
    Trash2,
    Wrench,
    X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

/* ==========================================================================
   Mobile app control — remote settings the RAVU app reads at launch from
   GET /api/mobile/config. Every change is recorded in the activity log.
   ========================================================================== */

const btn = {
    primary:
        "inline-flex items-center justify-center gap-2 rounded-lg bg-[#00289a] px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(0,40,154,0.25)] transition hover:bg-[#0032bd] disabled:cursor-not-allowed disabled:opacity-45",
    secondary:
        "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-700 shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition hover:bg-slate-50 disabled:opacity-45",
    danger:
        "inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-45",
    icon: "rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800",
};

const input =
    "mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-[0_1px_2px_rgba(16,24,40,0.04)] placeholder:text-slate-400 focus:border-[#00289a] focus:outline-none focus:ring-4 focus:ring-[#00289a]/10";

const TONES = {
    info: { label: "Info", bar: "bg-blue-500", soft: "bg-blue-50 text-blue-900 ring-blue-600/15" },
    success: { label: "Good news", bar: "bg-emerald-500", soft: "bg-emerald-50 text-emerald-900 ring-emerald-600/15" },
    warning: { label: "Warning", bar: "bg-amber-400", soft: "bg-amber-50 text-amber-900 ring-amber-600/20" },
    critical: { label: "Critical", bar: "bg-rose-500", soft: "bg-rose-50 text-rose-900 ring-rose-600/15" },
};

const STATES = {
    live: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    scheduled: "bg-blue-50 text-blue-700 ring-blue-600/15",
    ended: "bg-slate-100 text-slate-500 ring-slate-500/20",
    paused: "bg-amber-50 text-amber-800 ring-amber-600/20",
};

const AUDIENCE = { all: "All users", ios: "iPhone only", android: "Android only" };

/* datetime-local <-> ISO, in the admin's own time zone. */
const toLocalInput = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (value) => (value ? new Date(value).toISOString() : null);
const when = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : null);

function Field({ label, hint, error, children, className = "" }) {
    return (
        <label className={`block ${className}`}>
            <span className="text-[12.5px] font-medium text-slate-700">{label}</span>
            {children}
            {hint && !error && <span className="mt-1 block text-[11.5px] text-slate-500">{hint}</span>}
            {error && <span className="mt-1 block text-[12px] font-medium text-rose-600">{error}</span>}
        </label>
    );
}

function Card({ title, description, icon: Icon, action, children, tone = "" }) {
    return (
        <section className={`rounded-2xl border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${tone || "border-slate-200/80"}`}>
            <header className="flex flex-wrap items-start justify-between gap-3 px-4 pb-2 pt-3.5 sm:px-5">
                <div className="flex min-w-0 items-start gap-2.5">
                    {Icon && (
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Icon size={15} />
                        </span>
                    )}
                    <div className="min-w-0">
                        <h3 className="text-[14px] font-semibold tracking-tight text-slate-900">{title}</h3>
                        {description && <p className="mt-0.5 text-[12.5px] text-slate-500">{description}</p>}
                    </div>
                </div>
                {action}
            </header>
            <div className="px-4 pb-4 sm:px-5">{children}</div>
        </section>
    );
}

function Switch({ checked, onChange, label, danger = false, disabled = false }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00289a]/20 disabled:opacity-50 ${checked ? (danger ? "bg-rose-600" : "bg-emerald-500") : "bg-slate-300"}`}
        >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
    );
}

/* ------------------------------- Phone preview ---------------------------- */

function PhonePreview({ revision, platform, setPlatform, version, setVersion }) {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams({ platform, ...(version ? { version } : {}) });
        fetch(`/api/mobile/config?${params}`, { headers: { Accept: "application/json" }, cache: "no-store" })
            .then((r) => r.json())
            .then(setConfig)
            .catch(() => setConfig(null))
            .finally(() => setLoading(false));
    }, [platform, version]);

    // Reload when the inputs change or the settings are saved (revision bumps).
    useEffect(() => {
        const timer = setTimeout(load, 250);
        return () => clearTimeout(timer);
    }, [load, revision]);

    const update = config?.update;
    const screen = !config ? "loading" : config.maintenance.active ? "maintenance" : update?.status === "required" ? "required" : "home";

    return (
        <Card
            title="What app users see"
            description="Live from the same feed the app reads"
            icon={Smartphone}
            action={
                <button type="button" onClick={load} className={btn.icon} aria-label="Refresh preview">
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                </button>
            }
        >
            <div className="mb-3 flex gap-2">
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={`${input} !mt-0`} aria-label="Platform">
                    <option value="android">Android</option>
                    <option value="ios">iPhone</option>
                </select>
                <input value={version} onChange={(e) => setVersion(e.target.value.trim())} className={`${input} !mt-0 w-28`} placeholder="1.0.0" aria-label="App version" />
            </div>

            <div className="mx-auto w-[248px] rounded-[2.2rem] border-[7px] border-slate-900 bg-slate-900 shadow-[0_20px_40px_-18px_rgba(15,23,42,0.6)]">
                <div className="relative h-[440px] overflow-hidden rounded-[1.7rem] bg-[#f4f6fb]">
                    <div className="absolute left-1/2 top-1.5 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-900" />
                    {screen === "loading" && (
                        <div className="flex h-full items-center justify-center text-slate-400">
                            <Loader2 className="animate-spin" />
                        </div>
                    )}
                    {screen === "maintenance" && (
                        <div className="flex h-full flex-col items-center justify-center bg-[#00289a] px-6 text-center text-white">
                            <Wrench size={30} className="opacity-90" />
                            <p className="mt-3 text-[15px] font-semibold">We'll be right back</p>
                            <p className="mt-1.5 text-[12px] leading-relaxed text-blue-100">{config.maintenance.message}</p>
                            {config.maintenance.until && <p className="mt-3 text-[11px] text-blue-200">Until {when(config.maintenance.until)}</p>}
                        </div>
                    )}
                    {screen === "required" && (
                        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00289a] text-white">
                                <Download size={22} />
                            </span>
                            <p className="mt-3 text-[15px] font-semibold text-slate-900">Update required</p>
                            <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600">{update.message}</p>
                            <span className="mt-4 rounded-lg bg-[#00289a] px-4 py-2 text-[12px] font-semibold text-white">Update now</span>
                            <p className="mt-2 text-[10.5px] text-slate-400">Needs {update.min_version} or newer</p>
                        </div>
                    )}
                    {screen === "home" && (
                        <div className="h-full overflow-y-auto px-3 pb-4 pt-8">
                            <p className="px-1 text-[15px] font-bold text-slate-900">Habari 👋</p>
                            {update?.status === "recommended" && (
                                <div className="mt-2 rounded-xl bg-white p-2.5 text-[11px] text-slate-700 shadow-sm ring-1 ring-slate-200">
                                    <span className="font-semibold text-slate-900">New version {update.latest_version}</span> · {update.message}
                                </div>
                            )}
                            {config.announcements.map((a) => (
                                <div key={a.id} className={`mt-2 overflow-hidden rounded-xl ring-1 ring-inset ${TONES[a.tone]?.soft}`}>
                                    <div className={`h-1 ${TONES[a.tone]?.bar}`} />
                                    <div className="p-2.5">
                                        <p className="text-[12px] font-semibold">{a.title}</p>
                                        <p className="mt-0.5 text-[11px] leading-snug opacity-90">{a.body}</p>
                                        {a.cta && <p className="mt-1.5 text-[11px] font-semibold underline">{a.cta.label}</p>}
                                    </div>
                                </div>
                            ))}
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {["Ride", "Membership", "Benefits", "Support"].map((tile) => (
                                    <div key={tile} className="rounded-xl bg-white p-2.5 text-[11px] font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
                                        {tile}
                                    </div>
                                ))}
                            </div>
                            {Object.keys(config.features).length > 0 && (
                                <div className="mt-2 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-slate-200">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Features for this install</p>
                                    {Object.entries(config.features).map(([key, on]) => (
                                        <p key={key} className="mt-1 flex items-center justify-between text-[11px] text-slate-700">
                                            <code>{key}</code>
                                            <span className={on ? "font-semibold text-emerald-600" : "text-slate-400"}>{on ? "on" : "off"}</span>
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

/* ------------------------------ Updates tab ------------------------------- */

function MaintenanceCard({ maintenance }) {
    const form = useForm({ enabled: maintenance.enabled, message: maintenance.message, until: toLocalInput(maintenance.until) });
    const on = maintenance.enabled && (!maintenance.until || new Date(maintenance.until) > new Date());

    const submit = (enabled) => {
        if (enabled && !maintenance.enabled && !window.confirm("Turn ON maintenance mode? Every app user will see the maintenance screen and won't be able to use the app until you turn it off.")) return;
        form.transform((d) => ({ ...d, enabled, until: fromLocalInput(d.until) }));
        form.put("/super-admin/mobile/maintenance", { preserveScroll: true });
    };

    return (
        <Card
            title="Maintenance mode"
            description="Blocks the app with a message while you fix or upgrade something."
            icon={Wrench}
            tone={on ? "border-rose-300 ring-2 ring-rose-100" : ""}
            action={
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ring-inset ${on ? "bg-rose-50 text-rose-700 ring-rose-600/20" : "bg-emerald-50 text-emerald-700 ring-emerald-600/15"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-rose-500 motion-safe:animate-pulse" : "bg-emerald-500"}`} />
                    {on ? "App is in maintenance" : "App is online"}
                </span>
            }
        >
            <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
                <Field label="Message shown to users" error={form.errors.message}>
                    <textarea value={form.data.message} onChange={(e) => form.setData("message", e.target.value)} rows={2} maxLength={280} className={`${input} field-sizing-content`} />
                </Field>
                <Field label="Ends automatically at (optional)" hint="Leave empty to stay on until you turn it off." error={form.errors.until}>
                    <input type="datetime-local" value={form.data.until} onChange={(e) => form.setData("until", e.target.value)} className={input} />
                </Field>
            </div>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
                {maintenance.enabled ? (
                    <>
                        <button type="button" onClick={() => submit(true)} disabled={form.processing} className={btn.secondary}>
                            Save message
                        </button>
                        <button type="button" onClick={() => submit(false)} disabled={form.processing} className={btn.primary}>
                            <Power size={15} /> Turn maintenance off
                        </button>
                    </>
                ) : (
                    <>
                        <button type="button" onClick={() => submit(false)} disabled={form.processing} className={btn.secondary}>
                            Save message
                        </button>
                        <button type="button" onClick={() => submit(true)} disabled={form.processing} className={btn.danger}>
                            <Power size={15} /> Turn maintenance on
                        </button>
                    </>
                )}
            </div>
        </Card>
    );
}

function VersionsCard({ settings, stores }) {
    const form = useForm({ versions: settings.versions, update_message: settings.update_message });
    const set = (platform, key, value) => form.setData("versions", { ...form.data.versions, [platform]: { ...form.data.versions[platform], [key]: value.trim() || null } });

    const save = (e) => {
        e.preventDefault();
        const raised = ["ios", "android"].filter((p) => form.data.versions[p].min && form.data.versions[p].min !== settings.versions[p].min);
        if (raised.length && !window.confirm(`Users on ${raised.map((p) => `${p === "ios" ? "iPhone" : "Android"} below ${form.data.versions[p].min}`).join(" and ")} will be blocked until they update. Continue?`)) return;
        form.put("/super-admin/mobile/versions", { preserveScroll: true });
    };

    return (
        <Card title="App versions" description="Ask or force people to update after a release." icon={Download}>
            <form onSubmit={save}>
                <div className="grid gap-3 sm:grid-cols-2">
                    {[
                        ["android", "Android", Smartphone],
                        ["ios", "iPhone", Smartphone],
                    ].map(([platform, label, Icon]) => (
                        <div key={platform} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                            <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-800">
                                <Icon size={15} /> {label}
                            </p>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <Field label="Minimum (force update)" error={form.errors[`versions.${platform}.min`]}>
                                    <input value={form.data.versions[platform].min ?? ""} onChange={(e) => set(platform, "min", e.target.value)} placeholder="e.g. 1.2.0" className={input} />
                                </Field>
                                <Field label="Latest (suggest update)" error={form.errors[`versions.${platform}.latest`]}>
                                    <input value={form.data.versions[platform].latest ?? ""} onChange={(e) => set(platform, "latest", e.target.value)} placeholder="e.g. 1.4.0" className={input} />
                                </Field>
                            </div>
                            {!stores[platform] && (
                                <p className="mt-2 flex items-start gap-1.5 text-[11.5px] text-amber-800">
                                    <AlertTriangle size={13} className="mt-px shrink-0" />
                                    No {platform === "ios" ? "App Store" : "Google Play"} link yet. Add it in Website content → Header, footer & shared sections → App store links.
                                </p>
                            )}
                        </div>
                    ))}
                </div>
                <Field label="Update message" className="mt-3" error={form.errors.update_message}>
                    <input value={form.data.update_message} onChange={(e) => form.setData("update_message", e.target.value)} maxLength={280} className={input} />
                </Field>
                <div className="mt-3 flex justify-end">
                    <button type="submit" disabled={form.processing || !form.isDirty} className={btn.primary}>
                        {form.processing ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save version rules
                    </button>
                </div>
            </form>
        </Card>
    );
}

/* ---------------------------- Announcements tab --------------------------- */

const blankAnnouncement = { title: "", body: "", tone: "info", audience: "all", cta_label: "", cta_url: "", min_app_version: "", starts_at: "", ends_at: "", is_active: true, dismissible: true };

function AnnouncementForm({ announcement, onClose }) {
    const form = useForm(
        announcement
            ? { ...blankAnnouncement, ...announcement, cta_label: announcement.cta_label ?? "", cta_url: announcement.cta_url ?? "", min_app_version: announcement.min_app_version ?? "", starts_at: toLocalInput(announcement.starts_at), ends_at: toLocalInput(announcement.ends_at) }
            : blankAnnouncement,
    );
    const submit = (e) => {
        e.preventDefault();
        form.transform((d) => ({ ...d, starts_at: fromLocalInput(d.starts_at), ends_at: fromLocalInput(d.ends_at), cta_label: d.cta_label || null, cta_url: d.cta_url || null, min_app_version: d.min_app_version || null }));
        const opts = { preserveScroll: true, onSuccess: onClose };
        announcement ? form.put(`/super-admin/mobile/announcements/${announcement.id}`, opts) : form.post("/super-admin/mobile/announcements", opts);
    };
    const tone = TONES[form.data.tone];

    return (
        <form onSubmit={submit} className="rounded-2xl border border-[#00289a]/20 bg-white p-4 shadow-[0_8px_24px_-12px_rgba(0,40,154,0.25)] motion-safe:animate-pop sm:p-5">
            <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-slate-900">{announcement ? "Edit announcement" : "New announcement"}</h3>
                <button type="button" onClick={onClose} className={btn.icon} aria-label="Close">
                    <X size={16} />
                </button>
            </div>
            <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_260px]">
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={`Title (${form.data.title.length}/80)`} error={form.errors.title} className="sm:col-span-2">
                        <input value={form.data.title} onChange={(e) => form.setData("title", e.target.value)} maxLength={80} className={input} required />
                    </Field>
                    <Field label={`Message (${form.data.body.length}/280)`} error={form.errors.body} className="sm:col-span-2">
                        <textarea value={form.data.body} onChange={(e) => form.setData("body", e.target.value)} maxLength={280} rows={3} className={`${input} field-sizing-content`} required />
                    </Field>
                    <Field label="Style">
                        <select value={form.data.tone} onChange={(e) => form.setData("tone", e.target.value)} className={input}>
                            {Object.entries(TONES).map(([id, t]) => (
                                <option key={id} value={id}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Who sees it">
                        <select value={form.data.audience} onChange={(e) => form.setData("audience", e.target.value)} className={input}>
                            {Object.entries(AUDIENCE).map(([id, label]) => (
                                <option key={id} value={id}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Button label (optional)" error={form.errors.cta_label}>
                        <input value={form.data.cta_label} onChange={(e) => form.setData("cta_label", e.target.value)} maxLength={30} placeholder="e.g. See offer" className={input} />
                    </Field>
                    <Field label="Button link" hint="https://…, ravu://… or /page" error={form.errors.cta_url}>
                        <input value={form.data.cta_url} onChange={(e) => form.setData("cta_url", e.target.value)} placeholder="ravu://membership" className={input} />
                    </Field>
                    <Field label="Show from (optional)" error={form.errors.starts_at}>
                        <input type="datetime-local" value={form.data.starts_at} onChange={(e) => form.setData("starts_at", e.target.value)} className={input} />
                    </Field>
                    <Field label="Hide after (optional)" error={form.errors.ends_at}>
                        <input type="datetime-local" value={form.data.ends_at} onChange={(e) => form.setData("ends_at", e.target.value)} className={input} />
                    </Field>
                    <Field label="Only app version or newer (optional)" error={form.errors.min_app_version}>
                        <input value={form.data.min_app_version} onChange={(e) => form.setData("min_app_version", e.target.value.trim())} placeholder="e.g. 1.4.0" className={input} />
                    </Field>
                    <div className="flex flex-col justify-end gap-2 pb-1 text-[13px] text-slate-700">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={form.data.dismissible} onChange={(e) => form.setData("dismissible", e.target.checked)} /> Users can dismiss it
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData("is_active", e.target.checked)} /> Active
                        </label>
                    </div>
                </div>
                <div>
                    <p className="text-[12.5px] font-medium text-slate-700">Preview</p>
                    <div className={`mt-1 overflow-hidden rounded-xl ring-1 ring-inset ${tone.soft}`}>
                        <div className={`h-1 ${tone.bar}`} />
                        <div className="p-3">
                            <p className="text-[13px] font-semibold">{form.data.title || "Title"}</p>
                            <p className="mt-0.5 text-[12px] leading-snug opacity-90">{form.data.body || "Your message appears here."}</p>
                            {form.data.cta_label && <p className="mt-2 text-[12px] font-semibold underline">{form.data.cta_label}</p>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={onClose} className={btn.secondary}>
                    Cancel
                </button>
                <button type="submit" disabled={form.processing} className={btn.primary}>
                    {form.processing && <Loader2 size={15} className="animate-spin" />} {announcement ? "Save changes" : "Publish announcement"}
                </button>
            </div>
        </form>
    );
}

function Announcements({ items }) {
    const [editing, setEditing] = useState(null); // null | "new" | announcement

    const toggle = (a) =>
        router.put(
            `/super-admin/mobile/announcements/${a.id}`,
            { ...a, is_active: !a.is_active, cta_label: a.cta_label || null, cta_url: a.cta_url || null },
            { preserveScroll: true },
        );
    const remove = (a) => {
        if (window.confirm(`Delete “${a.title}”? It disappears from the app on next launch.`)) router.delete(`/super-admin/mobile/announcements/${a.id}`, { preserveScroll: true });
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13px] text-slate-500">Banners at the top of the app home screen. The most urgent show first.</p>
                {editing === null && (
                    <button type="button" onClick={() => setEditing("new")} className={btn.primary}>
                        <Plus size={15} /> New announcement
                    </button>
                )}
            </div>
            {editing !== null && <AnnouncementForm key={editing === "new" ? "new" : editing.id} announcement={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
            {items.length === 0 && editing === null ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-10 text-center">
                    <Megaphone className="mx-auto text-slate-300" size={26} />
                    <p className="mt-2 text-sm font-semibold text-slate-800">No announcements yet</p>
                    <p className="mt-1 text-[13px] text-slate-500">Tell app users about offers, outages or new partners.</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {items.map((a) => (
                        <li key={a.id} className="flex gap-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                            <span className={`w-1 shrink-0 ${TONES[a.tone]?.bar}`} />
                            <div className="min-w-0 flex-1 py-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-[13.5px] font-semibold text-slate-900">{a.title}</p>
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${STATES[a.state]}`}>{a.state}</span>
                                </div>
                                <p className="mt-0.5 line-clamp-2 text-[12.5px] text-slate-600">{a.body}</p>
                                <p className="mt-1 text-[11.5px] text-slate-400">
                                    {[AUDIENCE[a.audience], TONES[a.tone]?.label, a.starts_at && `from ${when(a.starts_at)}`, a.ends_at && `until ${when(a.ends_at)}`, a.min_app_version && `v${a.min_app_version}+`].filter(Boolean).join(" · ")}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-start gap-0.5 p-2">
                                <button type="button" onClick={() => toggle(a)} className={btn.icon} title={a.is_active ? "Pause" : "Resume"} aria-label={a.is_active ? "Pause" : "Resume"}>
                                    {a.is_active ? <Pause size={15} /> : <Play size={15} />}
                                </button>
                                <button type="button" onClick={() => setEditing(a)} className={btn.icon} title="Edit" aria-label="Edit">
                                    <Pencil size={15} />
                                </button>
                                <button type="button" onClick={() => remove(a)} className={`${btn.icon} hover:!bg-rose-50 hover:!text-rose-600`} title="Delete" aria-label="Delete">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/* ----------------------------- Features tab ------------------------------- */

const blankFeature = { key: "", name: "", description: "", enabled: false, platforms: "all", min_app_version: "" };

function FeatureForm({ feature, onClose }) {
    const form = useForm(feature ? { ...blankFeature, ...feature, description: feature.description ?? "", min_app_version: feature.min_app_version ?? "" } : blankFeature);
    const submit = (e) => {
        e.preventDefault();
        form.transform(({ keyTouched, ...d }) => ({ ...d, description: d.description || null, min_app_version: d.min_app_version || null }));
        const opts = { preserveScroll: true, onSuccess: onClose };
        feature ? form.put(`/super-admin/mobile/features/${feature.id}`, opts) : form.post("/super-admin/mobile/features", opts);
    };
    return (
        <form onSubmit={submit} className="rounded-2xl border border-[#00289a]/20 bg-white p-4 shadow-[0_8px_24px_-12px_rgba(0,40,154,0.25)] motion-safe:animate-pop sm:p-5">
            <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-slate-900">{feature ? "Edit feature switch" : "New feature switch"}</h3>
                <button type="button" onClick={onClose} className={btn.icon} aria-label="Close">
                    <X size={16} />
                </button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Name" error={form.errors.name}>
                    <input
                        value={form.data.name}
                        onChange={(e) => {
                            const name = e.target.value;
                            form.setData((d) => ({ ...d, name, key: feature || d.keyTouched ? d.key : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 50) }));
                        }}
                        placeholder="Fleet dashboard"
                        className={input}
                        required
                    />
                </Field>
                <Field label="Key (used by the app)" hint="Agree this with the app team." error={form.errors.key}>
                    <input value={form.data.key} onChange={(e) => form.setData((d) => ({ ...d, key: e.target.value, keyTouched: true }))} placeholder="fleet_dashboard" className={`${input} font-mono text-[13px]`} required />
                </Field>
                <Field label="Platforms">
                    <select value={form.data.platforms} onChange={(e) => form.setData("platforms", e.target.value)} className={input}>
                        {Object.entries(AUDIENCE).map(([id, label]) => (
                            <option key={id} value={id}>
                                {label.replace("users", "platforms")}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Needs app version (optional)" error={form.errors.min_app_version}>
                    <input value={form.data.min_app_version} onChange={(e) => form.setData("min_app_version", e.target.value.trim())} placeholder="e.g. 1.4.0" className={input} />
                </Field>
                <Field label="Description (optional)" className="sm:col-span-2 lg:col-span-3">
                    <input value={form.data.description} onChange={(e) => form.setData("description", e.target.value)} maxLength={280} placeholder="What this switch controls" className={input} />
                </Field>
                <label className="flex items-end gap-2 pb-2 text-[13px] text-slate-700">
                    <input type="checkbox" checked={form.data.enabled} onChange={(e) => form.setData("enabled", e.target.checked)} /> On
                </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={onClose} className={btn.secondary}>
                    Cancel
                </button>
                <button type="submit" disabled={form.processing} className={btn.primary}>
                    {form.processing && <Loader2 size={15} className="animate-spin" />} {feature ? "Save changes" : "Add switch"}
                </button>
            </div>
        </form>
    );
}

function Features({ items }) {
    const [editing, setEditing] = useState(null);
    const toggle = (f, enabled) => {
        if (!window.confirm(`Turn ${enabled ? "ON" : "OFF"} “${f.name}” for app users? It takes effect on their next launch.`)) return;
        router.put(`/super-admin/mobile/features/${f.id}`, { ...f, enabled, description: f.description || null, min_app_version: f.min_app_version || null }, { preserveScroll: true });
    };
    const remove = (f) => {
        if (window.confirm(`Remove the “${f.name}” switch? The app will treat ${f.key} as off.`)) router.delete(`/super-admin/mobile/features/${f.id}`, { preserveScroll: true });
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13px] text-slate-500">Turn app features on or off without releasing a new version.</p>
                {editing === null && (
                    <button type="button" onClick={() => setEditing("new")} className={btn.primary}>
                        <Plus size={15} /> New feature switch
                    </button>
                )}
            </div>
            {editing !== null && <FeatureForm key={editing === "new" ? "new" : editing.id} feature={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
            {items.length === 0 && editing === null ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-10 text-center">
                    <ToggleRight className="mx-auto text-slate-300" size={26} />
                    <p className="mt-2 text-sm font-semibold text-slate-800">No feature switches yet</p>
                    <p className="mt-1 text-[13px] text-slate-500">Add one for any feature the app team wants to control remotely.</p>
                </div>
            ) : (
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                    {items.map((f) => (
                        <li key={f.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                            <Switch checked={f.enabled} onChange={(on) => toggle(f, on)} label={`${f.name} ${f.enabled ? "on" : "off"}`} />
                            <div className="min-w-0 flex-1">
                                <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-slate-900">
                                    {f.name}
                                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-normal text-slate-600">{f.key}</code>
                                </p>
                                <p className="mt-0.5 truncate text-[12px] text-slate-500">
                                    {[f.description, f.platforms !== "all" && AUDIENCE[f.platforms], f.min_app_version && `needs v${f.min_app_version}+`].filter(Boolean).join(" · ") || "All platforms"}
                                </p>
                            </div>
                            <button type="button" onClick={() => setEditing(f)} className={btn.icon} aria-label={`Edit ${f.name}`}>
                                <Pencil size={15} />
                            </button>
                            <button type="button" onClick={() => remove(f)} className={`${btn.icon} hover:!bg-rose-50 hover:!text-rose-600`} aria-label={`Remove ${f.name}`}>
                                <Trash2 size={15} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/* ------------------------------ Support tab ------------------------------- */

function SupportCard({ settings }) {
    const form = useForm({ support: settings.support, links: settings.links });
    const set = (group, key, value) => form.setData(group, { ...form.data[group], [key]: value });
    return (
        <Card title="Support & links" description="Shown on the app's help and account screens." icon={LifeBuoy}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.put("/super-admin/mobile/support", { preserveScroll: true });
                }}
            >
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Field label="Support phone" error={form.errors["support.phone"]}>
                        <input value={form.data.support.phone} onChange={(e) => set("support", "phone", e.target.value)} placeholder="+255 7…" className={input} />
                    </Field>
                    <Field label="WhatsApp" error={form.errors["support.whatsapp"]}>
                        <input value={form.data.support.whatsapp} onChange={(e) => set("support", "whatsapp", e.target.value)} placeholder="+255 7…" className={input} />
                    </Field>
                    <Field label="Support email" error={form.errors["support.email"]}>
                        <input type="email" value={form.data.support.email} onChange={(e) => set("support", "email", e.target.value)} className={input} />
                    </Field>
                    <Field label="Support hours" error={form.errors["support.hours"]}>
                        <input value={form.data.support.hours} onChange={(e) => set("support", "hours", e.target.value)} className={input} />
                    </Field>
                    <Field label="Terms of service link" error={form.errors["links.terms"]}>
                        <input value={form.data.links.terms} onChange={(e) => set("links", "terms", e.target.value)} placeholder="https://…" className={input} />
                    </Field>
                    <Field label="Privacy policy link" error={form.errors["links.privacy"]}>
                        <input value={form.data.links.privacy} onChange={(e) => set("links", "privacy", e.target.value)} placeholder="https://…" className={input} />
                    </Field>
                    <Field label="Help centre link" error={form.errors["links.help"]} className="sm:col-span-2">
                        <input value={form.data.links.help} onChange={(e) => set("links", "help", e.target.value)} placeholder="https://…" className={input} />
                    </Field>
                </div>
                <div className="mt-3 flex justify-end">
                    <button type="submit" disabled={form.processing || !form.isDirty} className={btn.primary}>
                        {form.processing ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save support details
                    </button>
                </div>
            </form>
        </Card>
    );
}

/* ----------------------------- Developers tab ----------------------------- */

function Developers({ endpoint, revision }) {
    const [sample, setSample] = useState("");
    const example = `${endpoint}?platform=android&version=1.0.0`;
    useEffect(() => {
        fetch(example, { headers: { Accept: "application/json" }, cache: "no-store" })
            .then((r) => r.json())
            .then((json) => setSample(JSON.stringify(json, null, 2)))
            .catch(() => setSample("Could not load the sample response."));
    }, [example, revision]);
    const copy = (text) => navigator.clipboard?.writeText(text).then(() => toast.success("Copied"), () => toast.error("Copy failed"));

    return (
        <div className="grid items-start gap-4 xl:grid-cols-2">
            <Card title="Connect the app" description="Share this with the mobile team." icon={Code2}>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <code className="min-w-0 flex-1 truncate text-[12.5px] text-slate-800">GET {endpoint}</code>
                    <button type="button" onClick={() => copy(endpoint)} className={btn.icon} aria-label="Copy endpoint">
                        <Copy size={14} />
                    </button>
                </div>
                <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-600">
                    <li>
                        <strong className="text-slate-800">Query:</strong> <code className="text-[12px]">platform=ios|android</code> and <code className="text-[12px]">version=1.4.2</code> (the installed app version) so update rules, announcements and features are resolved for that install.
                    </li>
                    <li>
                        <strong className="text-slate-800">When:</strong> at launch and when the app returns to the foreground. Send <code className="text-[12px]">If-None-Match</code> with the last <code className="text-[12px]">ETag</code>; a <code className="text-[12px]">304</code> means nothing changed.
                    </li>
                    <li>
                        <strong className="text-slate-800">update.status:</strong> <code className="text-[12px]">required</code> → block with an update screen linking to <code className="text-[12px]">store_url</code>; <code className="text-[12px]">recommended</code> → dismissible prompt.
                    </li>
                    <li>
                        <strong className="text-slate-800">maintenance.active:</strong> show the message full-screen; re-check every minute or two.
                    </li>
                    <li>
                        <strong className="text-slate-800">features:</strong> a missing key means off. If the request fails, keep the last saved config.
                    </li>
                    <li>
                        <strong className="text-slate-800">Membership plans:</strong> the plan picker reads <code className="text-[12px]">GET {endpoint.replace(/config$/, "plans")}</code>. The app's backend must charge by plan <code className="text-[12px]">id</code> from that list, never a price sent by the phone.
                    </li>
                    <li>
                        <strong className="text-slate-800">Public data only:</strong> no sign-in needed; nothing secret is ever included. Limited to 120 requests per minute per device IP.
                    </li>
                </ul>
            </Card>
            <Card
                title="Live sample response"
                description="Android, app version 1.0.0"
                icon={BellRing}
                action={
                    <button type="button" onClick={() => copy(sample)} className={btn.icon} aria-label="Copy sample">
                        <Copy size={14} />
                    </button>
                }
            >
                <pre className="max-h-[420px] overflow-auto rounded-lg bg-slate-950 p-3 text-[11.5px] leading-relaxed text-slate-200">{sample || "Loading…"}</pre>
            </Card>
        </div>
    );
}

/* ---------------------------------- Panel --------------------------------- */

const TABS = [
    { id: "updates", label: "Updates & maintenance", icon: Wrench },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "features", label: "Feature switches", icon: ToggleRight },
    { id: "support", label: "Support & links", icon: LifeBuoy },
    { id: "developers", label: "For developers", icon: Code2 },
];

export default function MobileApp({ mobile }) {
    const [tab, setTab] = useState(() => (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tab")) || "updates");
    // The preview install is shared by every tab; it starts as an up-to-date Android install.
    const [previewPlatform, setPreviewPlatform] = useState("android");
    const [previewVersion, setPreviewVersion] = useState(() => mobile?.settings.versions.android.latest || mobile?.settings.versions.android.min || "1.0.0");

    if (!mobile) {
        return (
            <div className="animate-pulse space-y-4" aria-busy="true">
                <div className="h-10 w-80 rounded-lg bg-slate-200/70" />
                <div className="h-96 rounded-2xl bg-white" />
            </div>
        );
    }

    const choose = (id) => {
        setTab(id);
        const params = new URLSearchParams(window.location.search);
        params.set("tab", id);
        window.history.replaceState(window.history.state, "", `${window.location.pathname}?${params}`);
    };
    const { settings } = mobile;
    const preview = { platform: previewPlatform, setPlatform: setPreviewPlatform, version: previewVersion, setVersion: setPreviewVersion };
    const live = mobile.announcements.filter((a) => a.state === "live").length;
    const featuresOn = mobile.features.filter((f) => f.enabled).length;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#00289a]">Mobile app</p>
                    <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-950">App control</h2>
                    <p className="mt-0.5 text-[13px] text-slate-500">Changes reach the RAVU app the next time it opens. Everything here is recorded in the activity log.</p>
                </div>
                <p className="text-[12px] text-slate-500">
                    Settings version <strong className="text-slate-700">#{mobile.revision}</strong>
                    {mobile.updated_at && ` · ${when(mobile.updated_at)}${mobile.updated_by ? ` by ${mobile.updated_by}` : ""}`}
                </p>
            </div>

            <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-[0_1px_2px_rgba(16,24,40,0.04)]" role="tablist">
                {TABS.map((t) => {
                    const Icon = t.icon;
                    const badge = t.id === "announcements" ? live : t.id === "features" ? featuresOn : null;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            aria-selected={tab === t.id}
                            onClick={() => choose(t.id)}
                            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${tab === t.id ? "bg-[#00289a] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                        >
                            <Icon size={15} /> {t.label}
                            {badge ? <span className={`rounded-full px-1.5 text-[11px] ${tab === t.id ? "bg-white/20" : "bg-slate-100 text-slate-700"}`}>{badge}</span> : null}
                        </button>
                    );
                })}
            </div>

            {tab === "updates" && (
                <div className="grid items-start gap-4 xl:grid-cols-[1fr_300px]">
                    <div className="min-w-0 space-y-4">
                        <MaintenanceCard key={`m-${mobile.revision}`} maintenance={settings.maintenance} />
                        <VersionsCard key={`v-${mobile.revision}`} settings={settings} stores={mobile.stores} />
                    </div>
                    <PhonePreview revision={`${mobile.revision}-${mobile.announcements.length}-${featuresOn}`} {...preview} />
                </div>
            )}
            {tab === "announcements" && (
                <div className="grid items-start gap-4 xl:grid-cols-[1fr_300px]">
                    <div className="min-w-0">
                        <Announcements items={mobile.announcements} />
                    </div>
                    <PhonePreview revision={JSON.stringify(mobile.announcements.map((a) => [a.id, a.state, a.title, a.body, a.tone]))} {...preview} />
                </div>
            )}
            {tab === "features" && <Features items={mobile.features} />}
            {tab === "support" && <SupportCard key={`s-${mobile.revision}`} settings={settings} />}
            {tab === "developers" && <Developers endpoint={mobile.endpoint} revision={mobile.revision} />}
        </div>
    );
}
