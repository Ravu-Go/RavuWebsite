import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import {
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    Building2,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    HandCoins,
    Trophy,
    ChevronRight,
    Clock,
    CornerDownLeft,
    ExternalLink,
    Eye,
    FileText,
    Globe2,
    History,
    Image as ImageIcon,
    Inbox,
    KeyRound,
    Layers,
    LayoutDashboard,
    Loader2,
    LogOut,
    Menu,
    MessageSquareWarning,
    RotateCcw,
    Save,
    ScrollText,
    Search,
    Send,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Trash2,
    Undo2,
    Upload,
    UserCog,
    Users,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import ContentEditor, {
    clone,
    MediaUploadButton,
} from "../../Components/admin/ContentEditor";
import ActivityLog, { categoryStyle } from "../../Components/admin/ActivityLog";
import MembershipPlans from "../../Components/admin/MembershipPlans";
import MembershipRevenue from "../../Components/admin/MembershipRevenue";
import MobileApp from "../../Components/admin/MobileApp";
import PartnerInsights from "../../Components/admin/PartnerInsights";
import PartnerPayouts from "../../Components/admin/PartnerPayouts";
import PartnerPerformance from "../../Components/admin/PartnerPerformance";
import { BUNDLED_MEDIA, CONTENT_DEFAULTS, thumbFor } from "../../content";
import logoImg from "../../../imgs/Logo.png";

/* ==========================================================================
   RAVU Super Admin console
   - Website content: edit every page's copy as a draft, preview, publish.
   - Partner applications: the review queue from the partner portal.
   ========================================================================== */

/* ---------------------------------- Tokens -------------------------------- */

const btn = {
    primary:
        "inline-flex items-center justify-center gap-2 rounded-lg bg-[#00289a] px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(0,40,154,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:bg-[#0032bd] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00289a]/20 disabled:cursor-not-allowed disabled:opacity-45",
    secondary:
        "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-700 shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-45",
    ghost:
        "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200",
};

const STATUS = {
    draft: { label: "Onboarding", dot: "bg-slate-400", pill: "bg-slate-50 text-slate-600 ring-slate-500/15", bar: "bg-slate-300" },
    submitted: { label: "Submitted", dot: "bg-blue-500", pill: "bg-blue-50 text-blue-700 ring-blue-600/15", bar: "bg-blue-500" },
    under_review: { label: "Under review", dot: "bg-indigo-500", pill: "bg-indigo-50 text-indigo-700 ring-indigo-600/15", bar: "bg-indigo-500" },
    action_required: { label: "Action required", dot: "bg-amber-500", pill: "bg-amber-50 text-amber-800 ring-amber-600/20", bar: "bg-amber-400" },
    approved: { label: "Approved", dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/15", bar: "bg-emerald-500" },
    rejected: { label: "Rejected", dot: "bg-rose-500", pill: "bg-rose-50 text-rose-700 ring-rose-600/15", bar: "bg-rose-400" },
    suspended: { label: "Suspended", dot: "bg-slate-600", pill: "bg-slate-100 text-slate-700 ring-slate-600/20", bar: "bg-slate-500" },
};
const PIPELINE = ["draft", "submitted", "under_review", "action_required", "approved", "rejected", "suspended"];

const statusLabel = (value = "") =>
    STATUS[value]?.label || value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (value) =>
    value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

const relative = (value) => {
    if (!value) return "";
    const diff = (Date.now() - new Date(value).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d ago`;
    return new Date(value).toLocaleDateString();
};

const greeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/* ------------------------------- Primitives ------------------------------- */

function StatusPill({ status }) {
    const s = STATUS[status] || STATUS.draft;
    return (
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset ${s.pill}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {statusLabel(status)}
        </span>
    );
}

function Avatar({ name = "", size = "md", tone = "brand" }) {
    const initials =
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "R";
    const sizes = { sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-16 w-16 text-lg" };
    const tones = {
        brand: "bg-gradient-to-br from-[#1f4fe0] to-[#00289a] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
        glass: "bg-white/10 text-white ring-1 ring-white/15",
        soft: "bg-slate-100 text-slate-600",
    };
    return (
        <span className={`flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide ${sizes[size]} ${tones[tone]}`}>
            {initials}
        </span>
    );
}

function Card({ title, description, action, children, className = "", bodyClassName = "" }) {
    return (
        <section className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}>
            {(title || action) && (
                <header className="flex items-start justify-between gap-4 px-4 pb-2 pt-3.5 sm:px-5">
                    <div className="min-w-0">
                        {title && <h3 className="text-[14px] font-semibold tracking-tight text-slate-900">{title}</h3>}
                        {description && <p className="mt-0.5 text-[12.5px] text-slate-500">{description}</p>}
                    </div>
                    {action}
                </header>
            )}
            <div className={bodyClassName}>{children}</div>
        </section>
    );
}

function EmptyState({ icon: Icon = Inbox, title, text, action }) {
    return (
        <div className="flex flex-col items-center px-6 py-6 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                <Icon size={17} />
            </span>
            <p className="mt-3 text-sm font-semibold text-slate-800">{title}</p>
            {text && <p className="mt-1 max-w-xs text-[13px] text-slate-500">{text}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

function Kbd({ children, dark = false }) {
    return (
        <kbd className={`inline-flex h-5 min-w-5 items-center justify-center rounded-md border px-1 font-sans text-[11px] font-medium ${dark ? "border-white/15 bg-white/5 text-slate-400" : "border-slate-200 bg-white text-slate-500 shadow-[0_1px_0_rgba(16,24,40,0.06)]"}`}>
            {children}
        </kbd>
    );
}

function SectionHeading({ eyebrow, title, description, actions }) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
                {eyebrow && <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#00289a]">{eyebrow}</p>}
                <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
                {description && <p className="mt-0.5 max-w-2xl text-[13px] text-slate-500">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

/* ---------------------------------- Shell --------------------------------- */

export default function SuperAdminDashboard({
    auth,
    flash,
    pages = [],
    editor = null,
    revisions = [],
    media = [],
    partnerSummary,
    insights = null,
    revenue = null,
    partnerPerformance = null,
    payouts = null,
    plans = null,
    mobile = null,
    activityLog = null,
    activity = [],
    mediaMaxKb,
}) {
    const mustChangePassword = Boolean(auth?.user?.password_change_required);
    const [chosenSection, setSection] = useState(() => {
        if (typeof window === "undefined") return "overview";
        return new URLSearchParams(window.location.search).get("section") || "overview";
    });
    // Accounts on a one-time password only see the account screen until they set their own.
    const section = mustChangePassword ? "account" : chosenSection;
    // The server sends the draft for one page at a time; follow whichever page it sent.
    const [selectedKey, setSelectedKey] = useState(() => editor?.key || "home");
    const [loadingKey, setLoadingKey] = useState(null);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [activityLoading, setActivityLoading] = useState(false);
    const [revenueLoading, setRevenueLoading] = useState(false);
    const [performanceLoading, setPerformanceLoading] = useState(false);
    const [payoutsLoading, setPayoutsLoading] = useState(false);
    const [mobileNav, setMobileNav] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Opening the content section from a URL that has no draft loaded yet.
    useEffect(() => {
        if (section === "content" && !editor && !loadingKey) go("content", selectedKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [section]);

    // Warn before leaving the browser tab with unsaved edits.
    useEffect(() => {
        if (!dirty) return undefined;
        const handler = (event) => {
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty]);

    // Ctrl/⌘ + K opens the quick-jump palette.
    useEffect(() => {
        if (mustChangePassword) return undefined;
        const onKey = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setPaletteOpen((open) => !open);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [mustChangePassword]);

    const go = useCallback(
        (nextSection, pageKey) => {
            if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
            setDirty(false);
            setSection(nextSection);
            setMobileNav(false);
            setPaletteOpen(false);
            window.scrollTo({ top: 0 });

            if (nextSection === "insights") {
                if (insights) {
                    window.history.replaceState(window.history.state, "", `/super-admin?section=insights&range=${insights.range}`);
                } else {
                    router.get("/super-admin", { section: "insights" }, { only: ["insights"], preserveState: true, preserveScroll: true, replace: true });
                }
                return;
            }

            if (nextSection === "plans") {
                if (plans) {
                    window.history.replaceState(window.history.state, "", `/super-admin?section=plans`);
                } else {
                    router.get("/super-admin", { section: "plans" }, { only: ["plans"], preserveState: true, preserveScroll: true, replace: true });
                }
                return;
            }

            if (nextSection === "mobile") {
                if (mobile) {
                    window.history.replaceState(window.history.state, "", `/super-admin?section=mobile`);
                } else {
                    router.get("/super-admin", { section: "mobile" }, { only: ["mobile"], preserveState: true, preserveScroll: true, replace: true });
                }
                return;
            }

            if (nextSection === "revenue") {
                if (revenue) {
                    window.history.replaceState(window.history.state, "", `/super-admin?section=revenue&range=${revenue.range}`);
                } else {
                    router.get("/super-admin", { section: "revenue" }, { only: ["revenue"], preserveState: true, preserveScroll: true, replace: true });
                }
                return;
            }

            if (nextSection === "partner-performance" || nextSection === "payouts") {
                const prop = nextSection === "payouts" ? "payouts" : "partnerPerformance";
                const loaded = nextSection === "payouts" ? payouts : partnerPerformance;
                if (loaded) {
                    window.history.replaceState(window.history.state, "", `/super-admin?section=${nextSection}&period=${loaded.period.key}`);
                } else {
                    router.get("/super-admin", { section: nextSection }, { only: [prop], preserveState: true, preserveScroll: true, replace: true });
                }
                return;
            }

            if (nextSection === "activity") {
                if (activityLog) {
                    window.history.replaceState(window.history.state, "", `/super-admin?section=activity`);
                } else {
                    router.get("/super-admin", { section: "activity" }, { only: ["activityLog"], preserveState: true, preserveScroll: true, replace: true });
                }
                return;
            }

            if (nextSection !== "content") {
                window.history.replaceState(window.history.state, "", `/super-admin?section=${nextSection}`);
                return;
            }

            const key = pageKey || selectedKey;
            setSelectedKey(key);
            if (editor?.key === key) {
                window.history.replaceState(window.history.state, "", `/super-admin?section=content&page=${key}`);
                return;
            }
            // Fetch just this page's draft; every other prop stays as it is.
            setLoadingKey(key);
            router.get(
                "/super-admin",
                { section: "content", page: key },
                {
                    only: ["editor"],
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onFinish: () => setLoadingKey(null),
                },
            );
        },
        [dirty, selectedKey, editor?.key, insights, revenue, partnerPerformance, payouts, plans, mobile, activityLog],
    );

    const changePerformancePeriod = (period) => {
        setPerformanceLoading(true);
        router.get(
            "/super-admin",
            { section: "partner-performance", period },
            { only: ["partnerPerformance"], preserveState: true, preserveScroll: true, replace: true, onFinish: () => setPerformanceLoading(false) },
        );
    };

    const changePayoutMonth = (period) => {
        setPayoutsLoading(true);
        router.get(
            "/super-admin",
            { section: "payouts", period },
            { only: ["payouts"], preserveState: true, preserveScroll: true, replace: true, onFinish: () => setPayoutsLoading(false) },
        );
    };

    const openPayoutsFor = (period) => {
        setSection("payouts");
        window.scrollTo({ top: 0 });
        changePayoutMonth(period);
    };

    const changeRevenueRange = (range) => {
        setRevenueLoading(true);
        router.get(
            "/super-admin",
            { section: "revenue", range },
            { only: ["revenue"], preserveState: true, preserveScroll: true, replace: true, onFinish: () => setRevenueLoading(false) },
        );
    };

    // Filters and paging refetch only the log; the current page stays up, dimmed.
    const changeActivity = (filters) => {
        const params = Object.fromEntries(
            Object.entries({ section: "activity", ...filters }).filter(([, v]) => v !== "" && v !== null && v !== undefined),
        );
        if (params.p === 1) delete params.p;
        setActivityLoading(true);
        router.get("/super-admin", params, {
            only: ["activityLog"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setActivityLoading(false),
        });
    };

    // Switching the insights range refetches only the insights prop; the old charts stay up, dimmed.
    const changeRange = (range) => {
        setInsightsLoading(true);
        router.get(
            "/super-admin",
            { section: "insights", range },
            { only: ["insights"], preserveState: true, preserveScroll: true, replace: true, onFinish: () => setInsightsLoading(false) },
        );
    };

    const counts = partnerSummary?.counts || {};
    const awaitingReview = (counts.submitted || 0) + (counts.under_review || 0);
    const draftPages = pages.filter((p) => p.has_draft);

    const groups = [
        {
            label: "Workspace",
            items: [
                { id: "overview", label: "Overview", icon: LayoutDashboard },
                { id: "insights", label: "Insights", icon: BarChart3 },
                { id: "activity", label: "Activity log", icon: ScrollText },
            ],
        },
        {
            label: "Partners",
            items: [
                { id: "partners", label: "Partner applications", icon: Building2, badge: awaitingReview || null },
                { id: "partner-performance", label: "Partner performance", icon: Trophy },
                { id: "payouts", label: "Payouts", icon: HandCoins },
            ],
        },
        {
            label: "Website",
            items: [
                { id: "content", label: "Website content", icon: FileText, badge: draftPages.length || null },
                { id: "media", label: "Media library", icon: ImageIcon },
                { id: "history", label: "Publishing history", icon: History },
            ],
        },
        {
            label: "Membership",
            items: [
                { id: "plans", label: "Plans", icon: Layers },
                { id: "revenue", label: "Revenue", icon: CircleDollarSign },
            ],
        },
        { label: "Mobile app", items: [{ id: "mobile", label: "App control", icon: Smartphone }] },
        { label: "Account", items: [{ id: "account", label: "My account", icon: UserCog }] },
    ]
        .map((group) => ({ ...group, items: group.items.filter((item) => !mustChangePassword || item.id === "account") }))
        .filter((group) => group.items.length);

    const allItems = groups.flatMap((g) => g.items);
    const current = allItems.find((n) => n.id === section);
    const currentGroup = groups.find((g) => g.items.some((i) => i.id === section))?.label;

    return (
        <div className="flex min-h-screen bg-[#f5f7fb] text-slate-800 antialiased">
            <Head title={`${current?.label || "Admin"} — RAVU Admin`} />

            {/* ------------------------------ Sidebar ------------------------------ */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col overflow-hidden bg-[#050b17] text-slate-300 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Brand glow */}
                <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#1f4fe0]/25 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-[#00289a]/20 blur-3xl" />

                <div className="relative flex h-16 items-center justify-between px-5">
                    <Link href="/" className="flex items-center gap-3">
                        <img src={logoImg} alt="" className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/15" />
                        <div className="leading-tight">
                            <p className="text-[15px] font-semibold tracking-tight text-white">RAVU</p>
                            <p className="text-[11px] font-medium text-slate-400">Admin console</p>
                        </div>
                    </Link>
                    <button type="button" onClick={() => setMobileNav(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close menu">
                        <X size={18} />
                    </button>
                </div>

                {!mustChangePassword && (
                    <div className="relative px-3 pb-2 pt-1">
                        <button
                            type="button"
                            onClick={() => setPaletteOpen(true)}
                            className="flex w-full items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-slate-400 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-slate-200"
                        >
                            <Search size={15} />
                            <span className="flex-1 text-left">Jump to…</span>
                            <Kbd dark>⌘K</Kbd>
                        </button>
                    </div>
                )}

                <nav className="relative flex-1 overflow-y-auto px-3 pb-4">
                    {groups.map((group) => (
                        <div key={group.label} className="mt-4 first:mt-2">
                            <p className="px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-500">{group.label}</p>
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = section === item.id;
                                    return (
                                        <div key={item.id}>
                                            <button
                                                type="button"
                                                onClick={() => go(item.id)}
                                                aria-current={active ? "page" : undefined}
                                                className={`group relative flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13.5px] font-medium transition ${active ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"}`}
                                            >
                                                {active && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-[#4f7bff]" />}
                                                <span className="flex items-center gap-3">
                                                    <Icon size={17} className={active ? "text-[#7d9dff]" : "text-slate-500 group-hover:text-slate-300"} />
                                                    {item.label}
                                                </span>
                                                {item.badge && (
                                                    <span className="min-w-5 rounded-full bg-[#4f7bff]/15 px-1.5 py-0.5 text-center text-[11px] font-semibold text-[#9db4ff] ring-1 ring-inset ring-[#4f7bff]/30">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </button>

                                            {item.id === "content" && active && (
                                                <div className="relative mb-1 ml-[21px] mt-1 border-l border-white/10 pl-3">
                                                    {pages.map((page) => (
                                                        <button
                                                            key={page.key}
                                                            type="button"
                                                            onClick={() => go("content", page.key)}
                                                            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[12.5px] transition ${selectedKey === page.key ? "bg-white/[0.07] font-medium text-white" : "text-slate-400 hover:text-slate-100"}`}
                                                        >
                                                            <span className="truncate">{page.label}</span>
                                                            {page.has_draft && <span className="ml-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" title="Unpublished changes" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="relative border-t border-white/[0.07] p-3">
                    <a href="/" target="_blank" rel="noreferrer" className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-100">
                        <Globe2 size={16} className="text-slate-500" /> View live website
                        <ArrowUpRight size={13} className="ml-auto opacity-60" />
                    </a>
                    <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2">
                        <button type="button" onClick={() => go("account")} className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 text-left hover:bg-white/[0.04]">
                            <Avatar name={auth?.user?.name} tone="brand" />
                            <span className="min-w-0">
                                <span className="block truncate text-[13px] font-semibold text-white">{auth?.user?.name}</span>
                                <span className="block truncate text-[11px] text-slate-400">{auth?.user?.email}</span>
                            </span>
                        </button>
                        <Link href="/logout" method="post" as="button" className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white" aria-label="Sign out" title="Sign out">
                            <LogOut size={16} />
                        </Link>
                    </div>
                </div>
            </aside>

            {mobileNav && <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] lg:hidden" onClick={() => setMobileNav(false)} aria-hidden="true" />}

            {/* ------------------------------- Main -------------------------------- */}
            <div className="min-w-0 flex-1">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl sm:px-8">
                    <button type="button" onClick={() => setMobileNav(true)} className="-ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
                        <Menu size={20} />
                    </button>
                    <div className="min-w-0 flex-1">
                        <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500" aria-label="Breadcrumb">
                            <span className="hidden sm:inline">Admin</span>
                            {currentGroup && (
                                <>
                                    <ChevronRight size={13} className="hidden text-slate-300 sm:inline" />
                                    <span className="hidden sm:inline">{currentGroup}</span>
                                </>
                            )}
                        </nav>
                        <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-900 sm:text-base">{current?.label}</h1>
                    </div>

                    {!mustChangePassword && (
                        <button
                            type="button"
                            onClick={() => setPaletteOpen(true)}
                            className="hidden w-64 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-[13px] text-slate-400 transition hover:border-slate-300 hover:bg-white md:flex"
                        >
                            <Search size={15} />
                            <span className="flex-1 text-left">Search pages & sections</span>
                            <Kbd>⌘K</Kbd>
                        </button>
                    )}
                    {!mustChangePassword && (
                        <button type="button" onClick={() => setPaletteOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden" aria-label="Search">
                            <Search size={18} />
                        </button>
                    )}
                    <span className="hidden sm:block">
                        <a href="/" target="_blank" rel="noreferrer" className={`${btn.secondary} !py-1.5`}>
                            <ExternalLink size={14} /> View site
                        </a>
                    </span>
                    <button type="button" onClick={() => go("account")} className="rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00289a]/20" aria-label="My account" title={auth?.user?.email}>
                        <Avatar name={auth?.user?.name} />
                    </button>
                </header>

                <main key={section} className="w-full px-4 py-5 motion-safe:animate-rise sm:px-8 sm:py-6">
                    {section === "overview" && (
                        <Overview user={auth?.user} pages={pages} partnerSummary={partnerSummary} activity={activity} revisions={revisions} go={go} />
                    )}
                    {section === "content" &&
                        (editor && editor.key === selectedKey && !loadingKey ? (
                            <ContentWorkspace
                                key={selectedKey}
                                page={pages.find((p) => p.key === selectedKey)}
                                pages={pages}
                                draft={editor.draft}
                                media={media}
                                mediaMaxKb={mediaMaxKb}
                                onDirtyChange={setDirty}
                                onSwitchPage={(key) => go("content", key)}
                            />
                        ) : (
                            <EditorSkeleton label={pages.find((p) => p.key === selectedKey)?.label} />
                        ))}
                    {section === "insights" && <PartnerInsights insights={insights} loading={insightsLoading} onRangeChange={changeRange} />}
                    {section === "revenue" && <MembershipRevenue revenue={revenue} loading={revenueLoading} onRangeChange={changeRevenueRange} />}
                    {section === "partner-performance" && (
                        <PartnerPerformance data={partnerPerformance} loading={performanceLoading} onPeriodChange={changePerformancePeriod} onOpenPayouts={() => openPayoutsFor(partnerPerformance.period.key)} />
                    )}
                    {section === "payouts" && <PartnerPayouts data={payouts} loading={payoutsLoading} onMonthChange={changePayoutMonth} />}
                    {section === "plans" && <MembershipPlans data={plans} onViewRevenue={() => go("revenue")} />}
                    {section === "mobile" && <MobileApp mobile={mobile} />}
                    {section === "partners" && <PartnersPanel summary={partnerSummary} />}
                    {section === "activity" && <ActivityLog log={activityLog} loading={activityLoading} onChange={changeActivity} />}
                    {section === "media" && <MediaPanel media={media} mediaMaxKb={mediaMaxKb} />}
                    {section === "history" && <HistoryPanel revisions={revisions} pages={pages} />}
                    {section === "account" && <AccountPanel user={auth?.user} mustChangePassword={mustChangePassword} />}
                </main>
            </div>

            {paletteOpen && <CommandPalette groups={groups} pages={pages} onClose={() => setPaletteOpen(false)} go={go} />}
        </div>
    );
}

/* ----------------------------- Command palette ---------------------------- */

function CommandPalette({ groups, pages, go, onClose }) {
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const listRef = useRef(null);

    const items = useMemo(() => {
        const all = [
            ...groups.flatMap((g) => g.items.map((item) => ({ id: `s-${item.id}`, group: "Go to", label: item.label, icon: item.icon, run: () => go(item.id) }))),
            ...pages.map((page) => ({
                id: `p-${page.key}`,
                group: "Edit website page",
                label: page.label,
                hint: page.path,
                icon: FileText,
                run: () => go("content", page.key),
            })),
            { id: "a-upload", group: "Actions", label: "Upload an image", icon: Upload, run: () => go("media") },
            { id: "a-review", group: "Actions", label: "Open partner review workspace", icon: ShieldCheck, run: () => router.visit("/partner-management") },
            { id: "a-site", group: "Actions", label: "View live website", icon: Globe2, run: () => window.open("/", "_blank", "noopener") },
        ];
        const q = query.trim().toLowerCase();
        return q ? all.filter((i) => `${i.label} ${i.hint || ""} ${i.group}`.toLowerCase().includes(q)) : all;
    }, [groups, pages, go, query]);

    useEffect(() => setActive(0), [query]);
    useEffect(() => {
        listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
    }, [active]);

    const onKeyDown = (event) => {
        if (event.key === "Escape") onClose();
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((i) => Math.min(i + 1, items.length - 1));
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
        }
        if (event.key === "Enter" && items[active]) {
            event.preventDefault();
            items[active].run();
            onClose();
        }
    };

    let lastGroup = null;
    return (
        <div className="fixed inset-0 z-[90] flex items-start justify-center bg-slate-950/40 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={onClose} role="dialog" aria-modal="true" aria-label="Quick jump">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_64px_-12px_rgba(15,23,42,0.35)] motion-safe:animate-pop" onMouseDown={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 border-b border-slate-100 px-4">
                    <Search size={18} className="text-slate-400" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Search pages, sections and actions…"
                        className="h-14 flex-1 bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                    <Kbd>Esc</Kbd>
                </div>
                <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
                    {items.length === 0 && <p className="px-3 py-8 text-center text-sm text-slate-500">No matches for “{query}”.</p>}
                    {items.map((item, index) => {
                        const Icon = item.icon;
                        const header = item.group !== lastGroup ? item.group : null;
                        lastGroup = item.group;
                        return (
                            <div key={item.id}>
                                {header && <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 first:pt-1">{header}</p>}
                                <button
                                    type="button"
                                    data-index={index}
                                    onMouseMove={() => setActive(index)}
                                    onClick={() => {
                                        item.run();
                                        onClose();
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${index === active ? "bg-[#00289a]/[0.06] text-slate-950" : "text-slate-700"}`}
                                >
                                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${index === active ? "border-[#00289a]/20 bg-white text-[#00289a]" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                                        <Icon size={15} />
                                    </span>
                                    <span className="flex-1 font-medium">{item.label}</span>
                                    {item.hint && <span className="text-xs text-slate-400">{item.hint}</span>}
                                    {index === active && <CornerDownLeft size={14} className="text-slate-400" />}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="flex items-center gap-4 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11.5px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <Kbd>↑</Kbd>
                        <Kbd>↓</Kbd> navigate
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Kbd>↵</Kbd> open
                    </span>
                </div>
            </div>
        </div>
    );
}

/* -------------------------------- Overview -------------------------------- */

function Overview({ user, pages, partnerSummary, activity, revisions, go }) {
    const counts = partnerSummary?.counts || {};
    const feed = activity.slice(0, 8);

    const awaiting = (counts.submitted || 0) + (counts.under_review || 0);
    const drafts = pages.filter((p) => p.has_draft).length;
    const customised = pages.filter((p) => p.is_customised).length;
    const firstName = (user?.name || "").split(/\s+/)[0];
    const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

    const stats = [
        { label: "Awaiting review", value: awaiting, hint: "Submitted or under review", icon: Clock, tone: "bg-blue-50 text-blue-600 ring-blue-600/10", action: () => go("partners") },
        { label: "Waiting on partner", value: counts.action_required || 0, hint: "Changes requested", icon: MessageSquareWarning, tone: "bg-amber-50 text-amber-600 ring-amber-600/10", action: () => go("partners") },
        { label: "Active partners", value: partnerSummary?.active_partners || 0, hint: "Approved and live", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600 ring-emerald-600/10", action: () => go("partners") },
        { label: "Unpublished pages", value: drafts, hint: "Drafts not yet live", icon: FileText, tone: "bg-violet-50 text-violet-600 ring-violet-600/10", action: () => go("content") },
    ];

    const summary =
        awaiting + drafts === 0
            ? "Everything is up to date. Nothing needs your attention right now."
            : [awaiting && `${plural(awaiting, "application")} waiting for review`, drafts && `${plural(drafts, "page")} with unpublished changes`].filter(Boolean).join(" and ") + ".";

    return (
        <div className="space-y-4">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-2xl bg-[#00289a] px-5 py-5 text-white shadow-[0_12px_32px_-12px_rgba(0,40,154,0.55)] sm:px-7">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_0%,#2f63ff_0%,transparent_55%),radial-gradient(80%_100%_at_0%_100%,#001a66_0%,transparent_60%)]" />
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border-[28px] border-white/[0.06]" />
                <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-10 h-44 w-44 rounded-full border-[14px] border-white/[0.07]" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

                <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <div className="max-w-xl">
                        <p className="flex items-center gap-2 text-[12.5px] font-medium text-blue-100/80">
                            <CalendarDays size={14} /> {today}
                        </p>
                        <h2 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-white sm:text-2xl">
                            {greeting()}
                            {firstName ? `, ${firstName}` : ""}
                        </h2>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-blue-50/85">{summary}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => go("partners")} className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-[13px] font-semibold text-[#00289a] shadow-sm transition hover:bg-blue-50">
                            <ShieldCheck size={15} /> Review applications
                        </button>
                        <button type="button" onClick={() => go("content")} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur transition hover:bg-white/15">
                            <Sparkles size={15} /> Edit website
                        </button>
                    </div>
                </div>
            </section>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <button
                            key={stat.label}
                            type="button"
                            onClick={stat.action}
                            title={stat.hint}
                            className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-slate-300 hover:shadow-[0_6px_18px_-8px_rgba(16,24,40,0.15)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00289a]/15"
                        >
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${stat.tone}`}>
                                <Icon size={17} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-[12px] font-medium leading-tight text-slate-500">{stat.label}</span>
                                <span className="block text-xl font-semibold leading-tight tracking-tight text-slate-950">{stat.value}</span>
                            </span>
                            <ArrowUpRight size={15} className="hidden shrink-0 text-slate-300 transition group-hover:text-slate-500 sm:block" />
                        </button>
                    );
                })}
            </div>

            <div className="grid items-start gap-4 xl:grid-cols-3">
                <div className="space-y-4 xl:col-span-2">
                    <PipelineCard counts={counts} onOpen={() => go("insights")} />
                    <Card
                        title="Review queue"
                        description="Newest submissions first"
                        action={
                            <button type="button" onClick={() => go("partners")} className={btn.ghost}>
                                View all <ArrowRight size={14} />
                            </button>
                        }
                    >
                        <ApplicationList items={(partnerSummary?.queue || []).slice(0, 5)} compact />
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card
                        title="Website"
                        description={`${customised} of ${pages.length} pages edited in the CMS`}
                        action={
                            <button type="button" onClick={() => go("content")} className={btn.ghost}>
                                Edit <ArrowRight size={14} />
                            </button>
                        }
                    >
                        <div className="px-4 sm:px-5">
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full bg-gradient-to-r from-[#2f63ff] to-[#00289a]" style={{ width: `${pages.length ? (customised / pages.length) * 100 : 0}%` }} />
                            </div>
                        </div>
                        <ul className="mt-2.5 border-t border-slate-100 p-1.5">
                            {pages.map((page) => (
                                <li key={page.key}>
                                    <button type="button" onClick={() => go("content", page.key)} className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left transition hover:bg-slate-50">
                                        <span className={`h-2 w-2 shrink-0 rounded-full ${page.has_draft ? "bg-amber-400" : page.is_customised ? "bg-emerald-500" : "bg-slate-300"}`} />
                                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-700 group-hover:text-slate-950">{page.label}</span>
                                        <span className="shrink-0 text-[11.5px] text-slate-400">
                                            {page.has_draft ? <span className="font-medium text-amber-700">Draft</span> : page.published_at ? relative(page.published_at) : "Default"}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card
                        title="Recent activity"
                        action={
                            <button type="button" onClick={() => go("activity")} className={btn.ghost}>
                                View all <ArrowRight size={14} />
                            </button>
                        }
                    >
                        {feed.length === 0 ? (
                            <EmptyState icon={History} title="No activity yet" text="Publishing and partner events will appear here." />
                        ) : (
                            <ol className="relative px-4 pb-3 sm:px-5">
                                <span aria-hidden="true" className="absolute bottom-6 left-[27px] top-2 w-px bg-slate-200 sm:left-[31px]" />
                                {feed.map((event) => {
                                    const style = categoryStyle(event);
                                    const Icon = style.icon;
                                    return (
                                        <li key={event.id} className="relative flex gap-3 py-1.5">
                                            <span className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${style.tone}`}>
                                                <Icon size={12} />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[13px] leading-snug text-slate-800">{event.description}</p>
                                                <p className="mt-0.5 text-[11.5px] text-slate-400">
                                                    {event.user?.name || "System"} · {relative(event.created_at)}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

function PipelineCard({ counts, onOpen }) {
    const total = PIPELINE.reduce((sum, s) => sum + (counts[s] || 0), 0);
    return (
        <Card
            title="Partner pipeline"
            description={total ? `${plural(total, "application")} across every stage` : "No partner applications yet"}
            action={
                <button type="button" onClick={onOpen} className={btn.ghost}>
                    View trends <ArrowRight size={14} />
                </button>
            }
            bodyClassName="px-4 pb-4 sm:px-5"
        >
            <div className="flex h-2 overflow-hidden rounded-full bg-slate-100" role="img" aria-label="Applications by status">
                {total > 0 &&
                    PIPELINE.filter((s) => counts[s]).map((s) => (
                        <div key={s} className={`h-full ${STATUS[s].bar} border-r-2 border-white last:border-r-0`} style={{ width: `${(counts[s] / total) * 100}%` }} title={`${statusLabel(s)}: ${counts[s]}`} />
                    ))}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                {PIPELINE.map((s) => (
                    <div key={s} className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS[s].dot}`} />
                        <dt className="min-w-0 flex-1 truncate text-[12.5px] text-slate-500">{statusLabel(s)}</dt>
                        <dd className="text-[13px] font-semibold text-slate-900 tabular-nums">{counts[s] || 0}</dd>
                    </div>
                ))}
            </dl>
        </Card>
    );
}

/* -------------------------- Partner applications -------------------------- */

function ApplicationList({ items, compact = false }) {
    if (!items.length) {
        return <EmptyState icon={CheckCircle2} title="You're all caught up" text="New submissions from the partner portal will appear here." />;
    }
    return (
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {items.map((app) => (
                <li key={app.id}>
                    <Link href={`/partner-management/applications/${app.id}`} className="group flex items-center gap-3 px-4 py-2.5 transition hover:bg-slate-50/80 sm:px-5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[12px] font-semibold text-slate-600">
                            {(app.business || "?")[0].toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13.5px] font-semibold text-slate-900">{app.business}</p>
                            <p className="truncate text-[12px] text-slate-500">
                                {[app.category || "Category pending", app.contact, !compact && app.contact_email].filter(Boolean).join(" · ")}
                            </p>
                        </div>
                        <StatusPill status={app.status} />
                        <span className="hidden w-24 text-right text-[12px] text-slate-400 sm:block">{app.submitted_at ? relative(app.submitted_at) : "—"}</span>
                        <ChevronRight size={16} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function PartnersPanel({ summary }) {
    const counts = summary?.counts || {};
    const order = ["submitted", "under_review", "action_required", "approved", "rejected", "suspended"];
    return (
        <div className="space-y-4">
            <SectionHeading
                eyebrow="Partners"
                title="Partner applications"
                description="Businesses apply through the partner portal. Review their documents and proposed member benefits, then approve, request changes or reject."
                actions={
                    <Link href="/partner-management" className={btn.primary}>
                        <ShieldCheck size={16} /> Open review workspace
                    </Link>
                }
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                {order.map((status) => (
                    <Link
                        key={status}
                        href={`/partner-management?status=${status}`}
                        className="group rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-slate-300 hover:shadow-[0_6px_18px_-8px_rgba(16,24,40,0.15)]"
                    >
                        <span className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                            <span className={`h-2 w-2 rounded-full ${STATUS[status].dot}`} />
                            {statusLabel(status)}
                        </span>
                        <span className="mt-0.5 block text-xl font-semibold tracking-tight text-slate-950">{counts[status] || 0}</span>
                    </Link>
                ))}
            </div>

            <Card title="Needs attention" description="New submissions first, then applications under review and those waiting on the partner.">
                <ApplicationList items={summary?.queue || []} />
            </Card>

            <p className="flex items-center gap-2 text-[12.5px] text-slate-500">
                <Users size={14} />
                <span>
                    {counts.draft || 0} {counts.draft === 1 ? "business is" : "businesses are"} still onboarding. Staff with the{" "}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-[11.5px] text-slate-700">partner_reviewer</code> role can review applications without website access.
                </span>
            </p>
        </div>
    );
}

/* ---------------------------- Content workspace --------------------------- */

function EditorSkeleton({ label }) {
    return (
        <div className="space-y-3" aria-busy="true">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4">
                <Loader2 size={18} className="animate-spin text-[#00289a]" />
                <p className="text-sm font-medium text-slate-600">Loading {label || "page"}…</p>
            </div>
            {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4">
                    <div className="h-3.5 w-48 rounded-full bg-slate-200" />
                    {i === 0 && (
                        <div className="mt-6 space-y-4">
                            <div className="h-9 rounded-lg bg-slate-100" />
                            <div className="h-20 rounded-lg bg-slate-100" />
                            <div className="h-9 w-1/2 rounded-lg bg-slate-100" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function ContentWorkspace({ page, pages, draft, media, mediaMaxKb, onDirtyChange, onSwitchPage }) {
    const { errors = {} } = usePage().props;
    const serverDraft = useMemo(() => JSON.stringify(draft), [draft]);
    const [working, setWorking] = useState(() => clone(draft));
    const [busy, setBusy] = useState(false);

    // Re-sync when the server's draft changes (after save/publish/discard/restore).
    useEffect(() => {
        setWorking(clone(draft));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverDraft]);

    const dirty = useMemo(() => JSON.stringify(working) !== serverDraft, [working, serverDraft]);
    useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

    const differsFromLive = page.has_draft;
    // Stable identity so memoised editor fields only re-render when errors really change.
    const contentErrors = useMemo(() => Object.fromEntries(Object.entries(errors).filter(([k]) => k.startsWith("content"))), [errors]);

    const visit = (method, url, data, message) => {
        setBusy(true);
        router[method](url, data, {
            preserveScroll: true,
            preserveState: true,
            onError: () => toast.error("Some fields need attention."),
            onFinish: () => setBusy(false),
            ...(message ? { onSuccess: () => toast.success(message) } : {}),
        });
    };

    const save = () => visit("put", `/super-admin/content/${page.key}`, { content: working });

    // Ctrl/⌘ + S saves the draft.
    useEffect(() => {
        const onKey = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                event.preventDefault();
                if (dirty && !busy) save();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    const publish = () => {
        if (!window.confirm(`Publish ${page.label}? Visitors will see these changes immediately.`)) return;
        visit("post", `/super-admin/content/${page.key}/publish`, { content: working });
    };
    const discard = () => {
        if (!window.confirm("Discard all unpublished changes to this page? The live version stays as it is.")) return;
        visit("delete", `/super-admin/content/${page.key}/draft`, {});
    };
    const resetToDefaults = () => {
        if (!window.confirm("Load the original website copy into the editor? Nothing changes until you save or publish.")) return;
        setWorking(clone(CONTENT_DEFAULTS[page.key]));
    };

    const state = dirty
        ? { label: "Unsaved changes", cls: "bg-rose-50 text-rose-700 ring-rose-600/15", dot: "bg-rose-500" }
        : differsFromLive
          ? { label: "Draft · not published", cls: "bg-amber-50 text-amber-800 ring-amber-600/20", dot: "bg-amber-500" }
          : { label: "Live", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/15", dot: "bg-emerald-500" };

    return (
        <div className="space-y-4">
            <div className="sticky top-16 z-20 -mx-4 border-b border-slate-200/70 bg-[#f5f7fb]/90 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
                <label className="mb-3 block lg:hidden">
                    <span className="sr-only">Page to edit</span>
                    <select
                        value={page.key}
                        onChange={(e) => onSwitchPage(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
                    >
                        {pages.map((p) => (
                            <option key={p.key} value={p.key}>
                                {p.label}
                                {p.has_draft ? " • draft" : ""}
                            </option>
                        ))}
                    </select>
                </label>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className="text-lg font-semibold tracking-tight text-slate-950">{page.label}</h2>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset ${state.cls}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${state.dot} ${dirty ? "motion-safe:animate-pulse" : ""}`} />
                                {state.label}
                            </span>
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[12.5px] text-slate-500">
                            <code className="rounded bg-white px-1.5 py-0.5 text-[11.5px] text-slate-600 ring-1 ring-slate-200">{page.path}</code>
                            <span>
                                {page.published_at ? `Published ${formatDate(page.published_at)} by ${page.published_by || "RAVU"}` : "Showing the original website copy"}
                                {page.has_draft && page.draft_updated_at && ` · draft saved ${relative(page.draft_updated_at)}`}
                            </span>
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={save} disabled={busy || !dirty} title="Save draft (Ctrl/⌘ + S)" className={btn.secondary}>
                            {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save draft
                            <span className="hidden sm:inline-flex">
                                <Kbd>⌘S</Kbd>
                            </span>
                        </button>
                        <a
                            href={dirty ? undefined : `/super-admin/preview/${page.key}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-disabled={dirty}
                            onClick={(e) => {
                                if (dirty) {
                                    e.preventDefault();
                                    toast("Save your draft first, then preview it.");
                                }
                            }}
                            className={`${btn.secondary} ${dirty ? "cursor-not-allowed opacity-45" : ""}`}
                        >
                            <Eye size={15} /> Preview
                        </a>
                        <button type="button" onClick={publish} disabled={busy || (!dirty && !differsFromLive)} className={btn.primary}>
                            <Send size={15} /> Publish
                        </button>
                    </div>
                </div>
            </div>

            {Object.keys(contentErrors).length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
                    <p className="font-semibold">Fix these fields before saving:</p>
                    <ul className="mt-1 list-disc pl-5">
                        {Object.values(contentErrors)
                            .slice(0, 6)
                            .map((message) => (
                                <li key={message}>{message}</li>
                            ))}
                    </ul>
                </div>
            )}

            <ContentEditor value={working} schema={CONTENT_DEFAULTS[page.key]} onChange={setWorking} errors={contentErrors} media={media} mediaMaxKb={mediaMaxKb} />

            <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                {differsFromLive && (
                    <button type="button" onClick={discard} disabled={busy} className={`${btn.ghost} !text-rose-700 hover:!bg-rose-50`}>
                        <Undo2 size={14} /> Discard unpublished changes
                    </button>
                )}
                <button type="button" onClick={resetToDefaults} className={btn.ghost}>
                    <RotateCcw size={14} /> Load original website copy
                </button>
            </div>
        </div>
    );
}

/* ---------------------------- Media & history ----------------------------- */

function MediaTile({ src, name, meta, onDelete }) {
    return (
        <figure className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:shadow-[0_8px_24px_-8px_rgba(16,24,40,0.15)]">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                {onDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-rose-600 opacity-0 shadow-sm backdrop-blur transition hover:bg-white focus:opacity-100 group-hover:opacity-100"
                        aria-label={`Delete ${name}`}
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
            <figcaption className="px-2.5 py-1.5">
                <span className="block truncate text-[11.5px] font-medium text-slate-700">{name}</span>
                {meta && <span className="text-[11px] text-slate-400">{meta}</span>}
            </figcaption>
        </figure>
    );
}

function MediaPanel({ media, mediaMaxKb }) {
    const remove = (item) => {
        if (!window.confirm(`Delete ${item.name}? Pages still using it will show no image.`)) return;
        router.delete(`/super-admin/media/${item.id}`, { preserveScroll: true });
    };
    const bundled = Object.keys(BUNDLED_MEDIA);

    return (
        <div className="space-y-4">
            <SectionHeading
                eyebrow="Website"
                title="Media library"
                description={`JPG, PNG or WebP up to ${Math.round((mediaMaxKb || 5120) / 1024)} MB. Choose images from any image field in the content editor.`}
                actions={<MediaUploadButton mediaMaxKb={mediaMaxKb} className="!rounded-lg !px-3.5 !py-2 !text-[13px] !font-semibold" />}
            />

            <Card title="Your uploads" description={media.length ? plural(media.length, "image") : undefined} bodyClassName="px-4 pb-4 sm:px-5">
                {media.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                        <EmptyState icon={Upload} title="No uploads yet" text="Upload photos to use them anywhere on the website." />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8">
                        {media.map((item) => (
                            <MediaTile key={item.id} src={item.url} name={item.name} meta={`${Math.round(item.size / 1024)} KB · ${relative(item.created_at)}`} onDelete={() => remove(item)} />
                        ))}
                    </div>
                )}
            </Card>

            <Card title="Built-in site images" description="These ship with the website and can be used in any image field." bodyClassName="px-4 pb-4 sm:px-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8">
                    {bundled.map((name) => (
                        <MediaTile key={name} src={thumbFor(name)} name={name} />
                    ))}
                </div>
            </Card>
        </div>
    );
}

function HistoryPanel({ revisions, pages }) {
    const label = Object.fromEntries(pages.map((p) => [p.key, p.label]));
    const restore = (revision) => {
        if (!window.confirm(`Load the ${formatDate(revision.created_at)} version of ${label[revision.key]} into the draft? You can review it before publishing.`)) return;
        router.post(`/super-admin/content/${revision.key}/revisions/${revision.id}/restore`, {}, { preserveScroll: true });
    };

    return (
        <div className="space-y-4">
            <SectionHeading eyebrow="Website" title="Publishing history" description="Every publish is kept. Load an earlier version into the draft to roll back." />
            <Card>
                {revisions.length === 0 ? (
                    <EmptyState icon={History} title="Nothing published yet" text="Versions appear here each time a page is published from the CMS." />
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {revisions.map((revision, index) => (
                            <li key={revision.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 sm:px-5">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-600/10">
                                    <FileText size={15} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-2 text-[13.5px] font-semibold text-slate-900">
                                        {label[revision.key] || revision.key}
                                        {index === 0 && <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/15">Latest</span>}
                                    </p>
                                    <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-slate-500">
                                        <Avatar name={revision.published_by} size="sm" tone="soft" />
                                        {revision.published_by} · {formatDate(revision.created_at)}
                                    </p>
                                </div>
                                <button type="button" onClick={() => restore(revision)} className={btn.secondary}>
                                    <RotateCcw size={14} /> Load into draft
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
}

/* ------------------------------- My account ------------------------------- */

const inputClass =
    "mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition placeholder:text-slate-400 focus:border-[#00289a] focus:outline-none focus:ring-4 focus:ring-[#00289a]/10";

function Field({ label, error, hint, ...props }) {
    return (
        <label className="block">
            <span className="text-[13px] font-medium text-slate-700">{label}</span>
            <input className={`${inputClass} ${error ? "!border-rose-400 focus:!ring-rose-500/10" : ""}`} {...props} />
            {hint && !error && <span className="mt-1.5 block text-[12px] text-slate-500">{hint}</span>}
            {error && <span className="mt-1.5 block text-[12px] font-medium text-rose-600">{error}</span>}
        </label>
    );
}

function AccountPanel({ user, mustChangePassword }) {
    const profile = useForm({ name: user?.name || "", email: user?.email || "", current_password: "" });
    const password = useForm({ current_password: "", password: "", password_confirmation: "" });
    const emailChanged = profile.data.email.trim().toLowerCase() !== (user?.email || "").toLowerCase();

    const saveProfile = (event) => {
        event.preventDefault();
        profile.patch("/super-admin/account", {
            preserveScroll: true,
            onSuccess: () => profile.setData("current_password", ""),
        });
    };

    const savePassword = (event) => {
        event.preventDefault();
        password.put("/super-admin/account/password", {
            preserveScroll: true,
            onSuccess: () => password.reset(),
            onError: () => password.reset("password", "password_confirmation"),
        });
    };

    return (
        <div className="space-y-4">
            <SectionHeading eyebrow="Account" title="My account" description="Manage how you sign in to the RAVU admin console." />

            {mustChangePassword && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/60 p-4 text-amber-900">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 ring-1 ring-amber-200">
                        <ShieldCheck size={18} />
                    </span>
                    <div>
                        <p className="text-sm font-semibold">Set your own password to continue</p>
                        <p className="mt-0.5 text-[13px] text-amber-800/90">You signed in with a one-time password. Choose a new one below to open the rest of the admin console.</p>
                    </div>
                </div>
            )}

            <div className="grid items-start gap-4 lg:grid-cols-3">
                <Card bodyClassName="p-5">
                    <div className="flex flex-col items-center text-center">
                        <Avatar name={user?.name} size="lg" />
                        <p className="mt-4 text-base font-semibold text-slate-900">{user?.name}</p>
                        <p className="text-[13px] text-slate-500">{user?.email}</p>
                        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#00289a]/[0.06] px-2.5 py-1 text-[11.5px] font-semibold text-[#00289a] ring-1 ring-inset ring-[#00289a]/15">
                            <ShieldCheck size={13} /> Super admin
                        </span>
                    </div>
                    <div className="mt-6 space-y-2 border-t border-slate-100 pt-5 text-[12.5px] text-slate-500">
                        <p className="flex items-center gap-2">
                            <KeyRound size={14} className="text-slate-400" /> Passwords need 12+ characters with letters and numbers.
                        </p>
                        <p className="flex items-center gap-2">
                            <Users size={14} className="text-slate-400" /> Your name appears on content you publish.
                        </p>
                    </div>
                </Card>

                <div className="space-y-4 lg:col-span-2">
                    <Card title="Password" description={mustChangePassword ? "Replace your one-time password." : "Change the password you sign in with."}>
                        <form onSubmit={savePassword} className="border-t border-slate-100 px-4 py-4 sm:px-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <Field
                                        label={mustChangePassword ? "One-time password" : "Current password"}
                                        type="password"
                                        autoComplete="current-password"
                                        value={password.data.current_password}
                                        onChange={(e) => password.setData("current_password", e.target.value)}
                                        error={password.errors.current_password}
                                        required
                                    />
                                </div>
                                <Field
                                    label="New password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={password.data.password}
                                    onChange={(e) => password.setData("password", e.target.value)}
                                    error={password.errors.password}
                                    required
                                />
                                <Field
                                    label="Confirm new password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={password.data.password_confirmation}
                                    onChange={(e) => password.setData("password_confirmation", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button type="submit" disabled={password.processing} className={btn.primary}>
                                    {password.processing ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
                                    {password.processing ? "Saving…" : "Change password"}
                                </button>
                            </div>
                        </form>
                    </Card>

                    {!mustChangePassword && (
                        <Card title="Sign-in details" description="Your email is what you sign in with.">
                            <form onSubmit={saveProfile} className="border-t border-slate-100 px-4 py-4 sm:px-5">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Name" autoComplete="name" value={profile.data.name} onChange={(e) => profile.setData("name", e.target.value)} error={profile.errors.name} required />
                                    <Field
                                        label="Email"
                                        type="email"
                                        autoComplete="email"
                                        value={profile.data.email}
                                        onChange={(e) => profile.setData("email", e.target.value)}
                                        error={profile.errors.email}
                                        hint={emailChanged ? "You'll sign in with this address from now on." : undefined}
                                        required
                                    />
                                    {emailChanged && (
                                        <div className="sm:col-span-2">
                                            <Field
                                                label="Current password"
                                                type="password"
                                                autoComplete="current-password"
                                                value={profile.data.current_password}
                                                onChange={(e) => profile.setData("current_password", e.target.value)}
                                                error={profile.errors.current_password}
                                                hint="Required to change your sign-in email."
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button type="submit" disabled={profile.processing || !profile.isDirty} className={btn.primary}>
                                        {profile.processing ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                        {profile.processing ? "Saving…" : "Save details"}
                                    </button>
                                </div>
                            </form>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
