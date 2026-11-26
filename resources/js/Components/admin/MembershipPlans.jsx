import { router, useForm, usePage } from "@inertiajs/react";
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Archive,
    BadgeCheck,
    Check,
    CircleDollarSign,
    Info,
    Layers,
    Loader2,
    Lock,
    Pencil,
    Plus,
    RotateCcw,
    Rocket,
    Sparkles,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

/* ==========================================================================
   Membership plans — the catalogue members choose from in the RAVU app.
   Drafts are private; active plans are open for sign-up; retired plans are
   closed to new members but kept for existing ones (never deleted).
   ========================================================================== */

const btn = {
    primary:
        "inline-flex items-center justify-center gap-2 rounded-lg bg-[#00289a] px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(0,40,154,0.25)] transition hover:bg-[#0032bd] disabled:cursor-not-allowed disabled:opacity-45",
    secondary:
        "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-slate-700 shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition hover:bg-slate-50 disabled:opacity-45",
    icon: "rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30",
};

const input =
    "mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-[0_1px_2px_rgba(16,24,40,0.04)] placeholder:text-slate-400 focus:border-[#00289a] focus:outline-none focus:ring-4 focus:ring-[#00289a]/10 disabled:bg-slate-50 disabled:text-slate-500";

const STATUS = {
    draft: { label: "Draft", cls: "bg-slate-100 text-slate-600 ring-slate-500/20", dot: "bg-slate-400" },
    active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/15", dot: "bg-emerald-500" },
    retired: { label: "Retired", cls: "bg-amber-50 text-amber-800 ring-amber-600/20", dot: "bg-amber-500" },
};

const INTERVALS = { month: "month", quarter: "quarter", year: "year" };
const INTERVAL_LABEL = { month: "Monthly", quarter: "Every 3 months", year: "Yearly" };

const tsh = (n) => `TSh ${Number(n || 0).toLocaleString("en")}`;
const date = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "");
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

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

function Modal({ title, onClose, children, wide = false }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);
    // Rendered on <body> so no transformed ancestor can confine the overlay.
    return createPortal(
        <div className="fixed inset-0 z-[85] flex items-start justify-center overflow-y-auto bg-slate-950/40 p-4 pt-[6vh] backdrop-blur-sm" onMouseDown={onClose} role="dialog" aria-modal="true" aria-label={title}>
            <div className={`w-full ${wide ? "max-w-4xl" : "max-w-lg"} rounded-2xl border border-slate-200 bg-white shadow-[0_24px_64px_-12px_rgba(15,23,42,0.35)] motion-safe:animate-pop`} onMouseDown={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                    <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h3>
                    <button type="button" onClick={onClose} className={btn.icon} aria-label="Close">
                        <X size={17} />
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body,
    );
}

/* ------------------------------ Plan preview ------------------------------ */

function PlanCardPreview({ plan }) {
    return (
        <div className={`relative rounded-2xl border bg-white p-4 ${plan.is_featured ? "border-[#00289a] ring-2 ring-[#00289a]/15" : "border-slate-200"}`}>
            {plan.is_featured && <span className="absolute -top-2.5 left-4 rounded-full bg-[#00289a] px-2 py-0.5 text-[10.5px] font-semibold text-white">Most popular</span>}
            <p className="text-[15px] font-semibold text-slate-900">{plan.name || "Plan name"}</p>
            {plan.tagline && <p className="mt-0.5 text-[12px] text-slate-500">{plan.tagline}</p>}
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {tsh(plan.price)}
                <span className="text-[13px] font-medium text-slate-500"> / {INTERVALS[plan.interval]}</span>
            </p>
            {plan.trial_days > 0 && <p className="mt-1 text-[12px] font-medium text-emerald-700">{plan.trial_days}-day free trial</p>}
            <ul className="mt-3 space-y-1.5">
                {(plan.benefits || []).filter((b) => b.trim()).map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] text-slate-700">
                        <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                        {b}
                    </li>
                ))}
            </ul>
            <span className="mt-4 block rounded-lg bg-[#00289a] py-2 text-center text-[12.5px] font-semibold text-white">Choose plan</span>
        </div>
    );
}

/* ------------------------------- Plan editor ------------------------------ */

function PlanEditor({ plan, onClose, onChangePrice }) {
    const isNew = !plan;
    const locked = plan && plan.status !== "draft";
    const form = useForm({
        name: plan?.name ?? "",
        slug: plan?.slug ?? "",
        tagline: plan?.tagline ?? "",
        description: plan?.description ?? "",
        interval: plan?.interval ?? "month",
        price: plan?.price ?? "",
        trial_days: plan?.trial_days ?? 0,
        member_limit: plan?.member_limit ?? "",
        is_featured: plan?.is_featured ?? false,
        benefits: plan?.benefits?.length ? plan.benefits : [""],
    });
    const [slugTouched, setSlugTouched] = useState(!isNew);
    const d = form.data;
    const setBenefit = (i, value) => form.setData("benefits", d.benefits.map((b, j) => (j === i ? value : b)));
    const moveBenefit = (i, dir) => {
        const next = [...d.benefits];
        [next[i], next[i + dir]] = [next[i + dir], next[i]];
        form.setData("benefits", next);
    };

    const submit = (e) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            price: data.price === "" ? null : Number(data.price),
            trial_days: Number(data.trial_days || 0),
            member_limit: data.member_limit === "" ? null : Number(data.member_limit),
        }));
        const opts = { preserveScroll: true, onSuccess: onClose };
        isNew ? form.post("/super-admin/plans", opts) : form.put(`/super-admin/plans/${plan.id}`, opts);
    };

    return (
        <Modal title={isNew ? "New membership plan" : `Edit ${plan.name}`} onClose={onClose} wide>
            <form onSubmit={submit}>
                <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
                    <div className="grid content-start gap-3 sm:grid-cols-2">
                        <Field label="Plan name" error={form.errors.name}>
                            <input
                                value={d.name}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    form.setData((cur) => ({ ...cur, name, slug: slugTouched ? cur.slug : slugify(name) }));
                                }}
                                maxLength={80}
                                className={input}
                                required
                                autoFocus
                            />
                        </Field>
                        <Field
                            label={
                                <span className="inline-flex items-center gap-1">
                                    Plan ID {locked && <Lock size={11} className="text-slate-400" />}
                                </span>
                            }
                            hint={locked ? "Locked: the app and subscriptions use it." : "Used by the app. Can't change once published."}
                            error={form.errors.slug}
                        >
                            <input
                                value={d.slug}
                                onChange={(e) => {
                                    setSlugTouched(true);
                                    form.setData("slug", e.target.value);
                                }}
                                disabled={locked}
                                className={`${input} font-mono text-[13px]`}
                                required
                            />
                        </Field>
                        <Field label="Tagline (optional)" error={form.errors.tagline} className="sm:col-span-2">
                            <input value={d.tagline} onChange={(e) => form.setData("tagline", e.target.value)} maxLength={140} placeholder="One line under the plan name" className={input} />
                        </Field>
                        <Field label="Description (optional)" error={form.errors.description} className="sm:col-span-2">
                            <textarea value={d.description} onChange={(e) => form.setData("description", e.target.value)} maxLength={2000} rows={2} className={`${input} field-sizing-content`} />
                        </Field>

                        <div className="sm:col-span-2">
                            <span className="text-[12.5px] font-medium text-slate-700">Billing</span>
                            <div className="mt-1 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5" role="group" aria-label="Billing interval">
                                {Object.entries(INTERVAL_LABEL).map(([id, label]) => (
                                    <button
                                        key={id}
                                        type="button"
                                        disabled={locked}
                                        onClick={() => form.setData("interval", id)}
                                        aria-pressed={d.interval === id}
                                        className={`rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition disabled:cursor-not-allowed ${d.interval === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {locked && <p className="mt-1 text-[11.5px] text-slate-500">Billing period is fixed once published; create a new plan for a different period.</p>}
                        </div>

                        {locked ? (
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:col-span-2">
                                <p className="text-[12.5px] font-medium text-slate-700">Price</p>
                                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-lg font-semibold text-slate-950">
                                        {tsh(plan.price)} <span className="text-[13px] font-medium text-slate-500">/ {INTERVALS[plan.interval]}</span>
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            onChangePrice(plan);
                                        }}
                                        className={btn.secondary}
                                    >
                                        <CircleDollarSign size={14} /> Change price
                                    </button>
                                </div>
                                <p className="mt-1 text-[11.5px] text-slate-500">Live plans change price through a recorded price change, so existing members are handled fairly.</p>
                            </div>
                        ) : (
                            <Field label="Price (TSh)" error={form.errors.price}>
                                <input type="number" min="0" step="500" value={d.price} onChange={(e) => form.setData("price", e.target.value)} className={input} required />
                            </Field>
                        )}
                        <Field label="Free trial (days)" error={form.errors.trial_days}>
                            <input type="number" min="0" max="90" value={d.trial_days} onChange={(e) => form.setData("trial_days", e.target.value)} className={input} />
                        </Field>
                        <Field label="Member limit (optional)" hint="Close sign-ups after this many members." error={form.errors.member_limit}>
                            <input type="number" min="1" value={d.member_limit} onChange={(e) => form.setData("member_limit", e.target.value)} placeholder="No limit" className={input} />
                        </Field>
                        <label className="flex items-center gap-2 self-end pb-2 text-[13px] text-slate-700">
                            <input type="checkbox" checked={d.is_featured} onChange={(e) => form.setData("is_featured", e.target.checked)} /> Highlight as “Most popular”
                        </label>

                        <div className="sm:col-span-2">
                            <span className="text-[12.5px] font-medium text-slate-700">What's included</span>
                            <ul className="mt-1 space-y-1.5">
                                {d.benefits.map((b, i) => (
                                    <li key={i} className="flex items-center gap-1.5">
                                        <Check size={14} className="shrink-0 text-emerald-600" />
                                        <input value={b} onChange={(e) => setBenefit(i, e.target.value)} maxLength={160} placeholder="e.g. Discounts at partner workshops" className={`${input} !mt-0`} aria-label={`Benefit ${i + 1}`} />
                                        <button type="button" onClick={() => moveBenefit(i, -1)} disabled={i === 0} className={btn.icon} aria-label="Move up">
                                            <ArrowUp size={14} />
                                        </button>
                                        <button type="button" onClick={() => moveBenefit(i, 1)} disabled={i === d.benefits.length - 1} className={btn.icon} aria-label="Move down">
                                            <ArrowDown size={14} />
                                        </button>
                                        <button type="button" onClick={() => form.setData("benefits", d.benefits.filter((_, j) => j !== i))} disabled={d.benefits.length === 1} className={`${btn.icon} hover:!text-rose-600`} aria-label="Remove">
                                            <X size={14} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            {d.benefits.length < 12 && (
                                <button type="button" onClick={() => form.setData("benefits", [...d.benefits, ""])} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:border-[#00289a] hover:text-[#00289a]">
                                    <Plus size={13} /> Add benefit
                                </button>
                            )}
                            {form.errors.benefits && <p className="mt-1 text-[12px] text-rose-600">{form.errors.benefits}</p>}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-[12.5px] font-medium text-slate-700">How it looks in the app</p>
                        <div className="rounded-2xl bg-slate-100 p-3 pt-5">
                            <PlanCardPreview plan={{ ...d, price: locked ? plan.price : d.price }} />
                        </div>
                        {plan?.price_history?.length > 0 && (
                            <div className="mt-4">
                                <p className="text-[12.5px] font-medium text-slate-700">Price history</p>
                                <ol className="mt-1.5 space-y-2 border-l border-slate-200 pl-3">
                                    {plan.price_history.map((h) => (
                                        <li key={h.id} className="text-[12px] text-slate-600">
                                            <span className="font-semibold text-slate-900">
                                                {tsh(h.previous_price)} → {tsh(h.price)}
                                            </span>
                                            <span className="block text-[11.5px] text-slate-500">
                                                {date(h.at)}
                                                {h.by ? ` · ${h.by}` : ""} · {h.existing_members === "keep" ? "existing members kept their price" : `existing members from ${date(h.existing_effective_at)}`}
                                            </span>
                                            {h.reason && <span className="block text-[11.5px] italic text-slate-500">“{h.reason}”</span>}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
                    <button type="button" onClick={onClose} className={btn.secondary}>
                        Cancel
                    </button>
                    <button type="submit" disabled={form.processing} className={btn.primary}>
                        {form.processing && <Loader2 size={15} className="animate-spin" />}
                        {isNew ? "Save as draft" : "Save changes"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/* ----------------------------- Price change ------------------------------- */

function PriceChange({ plan, defaultNotice, onClose }) {
    const form = useForm({ price: plan.price, existing_members: "next_renewal", notice_days: defaultNotice, reason: "" });
    const newPrice = Number(form.data.price || 0);
    const diff = newPrice - plan.price;
    const pct = plan.price ? Math.round((diff / plan.price) * 100) : null;
    const effective = new Date(Date.now() + Number(form.data.notice_days || 0) * 86400000);

    const submit = (e) => {
        e.preventDefault();
        form.transform((d) => ({ ...d, price: Number(d.price), notice_days: d.existing_members === "next_renewal" ? Number(d.notice_days || 0) : null, reason: d.reason || null }));
        form.post(`/super-admin/plans/${plan.id}/price`, { preserveScroll: true, onSuccess: onClose });
    };

    return (
        <Modal title={`Change price: ${plan.name}`} onClose={onClose}>
            <form onSubmit={submit} className="space-y-4 p-5">
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <p className="text-[12.5px] font-medium text-slate-700">Current</p>
                        <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                            {tsh(plan.price)} / {INTERVALS[plan.interval]}
                        </p>
                    </div>
                    <ArrowRight size={16} className="mb-3 text-slate-400" />
                    <Field label="New price (TSh)" error={form.errors.price} className="flex-1">
                        <input type="number" min="0" step="500" value={form.data.price} onChange={(e) => form.setData("price", e.target.value)} className={input} autoFocus required />
                    </Field>
                </div>
                {diff !== 0 && pct !== null && (
                    <p className={`text-[12.5px] font-medium ${diff > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                        {diff > 0 ? "Increase" : "Decrease"} of {tsh(Math.abs(diff))} ({diff > 0 ? "+" : "−"}
                        {Math.abs(pct)}%)
                    </p>
                )}

                <fieldset>
                    <legend className="text-[12.5px] font-medium text-slate-700">What happens to existing members?</legend>
                    <div className="mt-1.5 space-y-2">
                        {[
                            ["next_renewal", "Move them to the new price at renewal", "After a notice period, so they can decide whether to stay."],
                            ["keep", "Keep their current price", "Only new members pay the new price."],
                        ].map(([id, title, text]) => (
                            <label key={id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${form.data.existing_members === id ? "border-[#00289a] bg-[#00289a]/[0.04] ring-2 ring-[#00289a]/10" : "border-slate-200 hover:border-slate-300"}`}>
                                <input type="radio" name="existing" checked={form.data.existing_members === id} onChange={() => form.setData("existing_members", id)} className="mt-1" />
                                <span>
                                    <span className="block text-[13px] font-semibold text-slate-900">{title}</span>
                                    <span className="block text-[12px] text-slate-500">{text}</span>
                                    {id === "next_renewal" && form.data.existing_members === "next_renewal" && (
                                        <span className="mt-2 flex items-center gap-2 text-[12.5px] text-slate-700">
                                            Notice period
                                            <input type="number" min="0" max="180" value={form.data.notice_days} onChange={(e) => form.setData("notice_days", e.target.value)} className={`${input} !mt-0 w-20 !py-1`} />
                                            days
                                        </span>
                                    )}
                                </span>
                            </label>
                        ))}
                    </div>
                    {form.errors.notice_days && <p className="mt-1 text-[12px] text-rose-600">{form.errors.notice_days}</p>}
                </fieldset>

                <Field label="Reason (optional, kept in the history)" error={form.errors.reason}>
                    <input value={form.data.reason} onChange={(e) => form.setData("reason", e.target.value)} maxLength={280} placeholder="e.g. Partner insurance rates increased" className={input} />
                </Field>

                <div className="flex gap-2.5 rounded-xl bg-slate-50 p-3 text-[12.5px] text-slate-700">
                    <Info size={15} className="mt-0.5 shrink-0 text-slate-400" />
                    <p>
                        New members pay <strong>{tsh(newPrice)}</strong> from now.{" "}
                        {form.data.existing_members === "keep" ? (
                            <>Existing members keep paying their current price.</>
                        ) : (
                            <>
                                Existing members move to it from their first renewal after <strong>{effective.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</strong>. The app shows them the change in advance.
                            </>
                        )}
                    </p>
                </div>

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className={btn.secondary}>
                        Cancel
                    </button>
                    <button type="submit" disabled={form.processing || diff === 0} className={btn.primary}>
                        {form.processing && <Loader2 size={15} className="animate-spin" />} Confirm price change
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/* --------------------------------- Panel ---------------------------------- */

export default function MembershipPlans({ data, onViewRevenue }) {
    const [filter, setFilter] = useState("all");
    const [editing, setEditing] = useState(null); // null | "new" | plan
    const [pricing, setPricing] = useState(null);
    const { errors = {} } = usePage().props;

    // Rule violations that aren't tied to a form field (e.g. retiring the last active plan).
    useEffect(() => {
        if (errors.plan) toast.error(errors.plan);
    }, [errors.plan]);

    if (!data) {
        return (
            <div className="animate-pulse space-y-4" aria-busy="true">
                <div className="h-10 w-80 rounded-lg bg-slate-200/70" />
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-80 rounded-2xl bg-white" />
                    ))}
                </div>
            </div>
        );
    }

    const { plans } = data;
    const counts = { all: plans.length, active: 0, draft: 0, retired: 0 };
    plans.forEach((p) => counts[p.status]++);
    const shown = filter === "all" ? plans : plans.filter((p) => p.status === filter);
    const act = (plan, action, confirmText) => {
        if (confirmText && !window.confirm(confirmText)) return;
        router.post(`/super-admin/plans/${plan.id}/${action}`, {}, { preserveScroll: true });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#00289a]">Membership</p>
                    <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-950">Plans</h2>
                    <p className="mt-0.5 text-[13px] text-slate-500">The plans people choose when they join RAVU in the app. Changes reach the app the next time it opens.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={onViewRevenue} className={btn.secondary}>
                        <CircleDollarSign size={14} /> Revenue by plan
                    </button>
                    <button type="button" onClick={() => setEditing("new")} className={btn.primary}>
                        <Plus size={15} /> New plan
                    </button>
                </div>
            </div>

            {data.has_samples && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-[13px] text-amber-900">
                    <Sparkles size={16} className="mt-0.5 shrink-0 text-amber-600" />
                    <p>
                        Plans marked <strong>Sample</strong> are placeholders so you can try everything out. Edit them into your real plans, or retire them and create new ones, before launch.
                    </p>
                </div>
            )}

            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter plans">
                {[
                    ["all", "All plans"],
                    ["active", "Active"],
                    ["draft", "Drafts"],
                    ["retired", "Retired"],
                ].map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setFilter(id)}
                        aria-pressed={filter === id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-semibold transition ${filter === id ? "bg-[#00289a] text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900"}`}
                    >
                        {label}
                        <span className={`rounded-full px-1.5 text-[11px] ${filter === id ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>{counts[id]}</span>
                    </button>
                ))}
            </div>

            {shown.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                    <Layers className="mx-auto text-slate-300" size={28} />
                    <p className="mt-2 text-sm font-semibold text-slate-800">{filter === "all" ? "No plans yet" : `No ${filter} plans`}</p>
                    <p className="mt-1 text-[13px] text-slate-500">Create a plan, then publish it to open it for sign-ups in the app.</p>
                </div>
            ) : (
                <div className="grid items-start gap-4 md:grid-cols-2 2xl:grid-cols-4">
                    {shown.map((plan) => {
                        const index = plans.findIndex((p) => p.id === plan.id);
                        const s = STATUS[plan.status];
                        return (
                            <article
                                key={plan.id}
                                className={`flex flex-col rounded-2xl border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${plan.is_featured && plan.status === "active" ? "border-[#00289a]/60 ring-2 ring-[#00289a]/10" : "border-slate-200/80"} ${plan.status === "retired" ? "opacity-80" : ""}`}
                            >
                                <div className="flex items-center gap-1.5 px-4 pt-3.5">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${s.cls}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                                        {s.label}
                                    </span>
                                    {plan.is_featured && <span className="rounded-full bg-[#00289a]/[0.07] px-2 py-0.5 text-[11px] font-semibold text-[#00289a]">Most popular</span>}
                                    {plan.is_sample && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">Sample</span>}
                                    <span className="ml-auto flex">
                                        <button type="button" onClick={() => router.post(`/super-admin/plans/${plan.id}/move`, { direction: "up" }, { preserveScroll: true })} disabled={index === 0} className={btn.icon} aria-label={`Move ${plan.name} earlier`} title="Show earlier">
                                            <ArrowLeft size={14} />
                                        </button>
                                        <button type="button" onClick={() => router.post(`/super-admin/plans/${plan.id}/move`, { direction: "down" }, { preserveScroll: true })} disabled={index === plans.length - 1} className={btn.icon} aria-label={`Move ${plan.name} later`} title="Show later">
                                            <ArrowRight size={14} />
                                        </button>
                                    </span>
                                </div>

                                <div className="flex-1 px-4 pb-3 pt-2">
                                    <h3 className="text-[16px] font-semibold tracking-tight text-slate-950">{plan.name}</h3>
                                    {plan.tagline && <p className="mt-0.5 text-[12.5px] text-slate-500">{plan.tagline}</p>}
                                    <p className="mt-3 text-[26px] font-semibold leading-none tracking-tight text-slate-950">
                                        {tsh(plan.price)}
                                        <span className="text-[13px] font-medium text-slate-500"> / {INTERVALS[plan.interval]}</span>
                                    </p>
                                    <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-slate-500">
                                        {plan.interval !== "month" && <span>≈ {tsh(plan.monthly_price)} / month</span>}
                                        {plan.trial_days > 0 && <span className="font-medium text-emerald-700">{plan.trial_days}-day free trial</span>}
                                        {plan.member_limit && <span>Max {plan.member_limit.toLocaleString()} members</span>}
                                    </p>

                                    {plan.pending_change && (
                                        <p className="mt-3 rounded-lg bg-amber-50 px-2.5 py-2 text-[11.5px] text-amber-900 ring-1 ring-inset ring-amber-600/15">
                                            Existing members move from {tsh(plan.pending_change.previous_price)} to {tsh(plan.pending_change.price)} on {date(plan.pending_change.effective_at)}.
                                        </p>
                                    )}

                                    <ul className="mt-3 space-y-1.5">
                                        {plan.benefits.map((b, i) => (
                                            <li key={i} className="flex items-start gap-2 text-[12.5px] text-slate-700">
                                                <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                                                {b}
                                            </li>
                                        ))}
                                        {plan.benefits.length === 0 && <li className="text-[12px] italic text-slate-400">No benefits listed yet</li>}
                                    </ul>
                                </div>

                                <div className="border-t border-slate-100 px-4 py-2.5">
                                    <p className="mb-2 truncate text-[11px] text-slate-400">
                                        ID <code className="text-slate-500">{plan.slug}</code>
                                        {plan.status === "retired" && plan.retired_at ? ` · retired ${date(plan.retired_at)}` : plan.published_at ? ` · live since ${date(plan.published_at)}` : ""}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        <button type="button" onClick={() => setEditing(plan)} className={btn.secondary}>
                                            <Pencil size={13} /> Edit
                                        </button>
                                        {plan.status !== "draft" && (
                                            <button type="button" onClick={() => setPricing(plan)} className={btn.secondary}>
                                                <CircleDollarSign size={13} /> Price
                                            </button>
                                        )}
                                        {plan.status === "draft" && (
                                            <button type="button" onClick={() => act(plan, "publish", `Publish ${plan.name}? New members will be able to choose it in the app.`)} className={`${btn.secondary} !border-emerald-200 !text-emerald-700 hover:!bg-emerald-50`}>
                                                <Rocket size={13} /> Publish
                                            </button>
                                        )}
                                        {plan.status === "active" && (
                                            <button type="button" onClick={() => act(plan, "retire", `Retire ${plan.name}? New members can't choose it any more; existing members keep it.`)} className={btn.secondary}>
                                                <Archive size={13} /> Retire
                                            </button>
                                        )}
                                        {plan.status === "retired" && (
                                            <button type="button" onClick={() => act(plan, "reactivate", `Reopen ${plan.name} for new sign-ups?`)} className={btn.secondary}>
                                                <RotateCcw size={13} /> Reopen
                                            </button>
                                        )}
                                        {plan.status === "draft" && (
                                            <button
                                                type="button"
                                                onClick={() => window.confirm(`Delete the draft ${plan.name}?`) && router.delete(`/super-admin/plans/${plan.id}`, { preserveScroll: true })}
                                                className={`${btn.secondary} !text-rose-700 hover:!bg-rose-50`}
                                            >
                                                <Trash2 size={13} /> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            <p className="flex items-start gap-2 text-[12px] text-slate-500">
                <BadgeCheck size={14} className="mt-0.5 shrink-0" />
                <span className="min-w-0">
                    The app reads plans from <code className="break-all rounded bg-slate-100 px-1 text-[11.5px] text-slate-700">{data.endpoint}</code>. The app's backend must charge by plan ID from the same list, never a price sent by the phone.
                </span>
            </p>

            {editing !== null && <PlanEditor key={editing === "new" ? "new" : editing.id} plan={editing === "new" ? null : editing} onClose={() => setEditing(null)} onChangePrice={setPricing} />}
            {pricing && <PriceChange plan={pricing} defaultNotice={data.default_notice_days} onClose={() => setPricing(null)} />}
        </div>
    );
}
