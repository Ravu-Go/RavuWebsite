import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    AlertCircle,
    ArrowUpRight,
    Building2,
    CheckCircle2,
    Clock,
    ExternalLink,
    Eye,
    FileText,
    History,
    Image as ImageIcon,
    LayoutDashboard,
    LogOut,
    Menu,
    RotateCcw,
    Save,
    Send,
    ShieldCheck,
    Trash2,
    Undo2,
    Users,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ContentEditor, {
    clone,
    MediaUploadButton,
} from "../../Components/admin/ContentEditor";
import { BUNDLED_MEDIA, CONTENT_DEFAULTS } from "../../content";
import logoImg from "../../../imgs/Logo.png";

/* ==========================================================================
   RAVU Super Admin console
   - Website content: edit every page's copy as a draft, preview, publish.
   - Partner applications: the review queue from the partner portal.
   ========================================================================== */

const STATUS_STYLES = {
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    under_review: "bg-indigo-50 text-indigo-700 border-indigo-200",
    action_required: "bg-amber-50 text-amber-800 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    suspended: "bg-slate-100 text-slate-700 border-slate-300",
    draft: "bg-slate-50 text-slate-600 border-slate-200",
};

const statusLabel = (value = "") =>
    value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
          })
        : "—";

const relative = (value) => {
    if (!value) return "";
    const diff = (Date.now() - new Date(value).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d ago`;
    return new Date(value).toLocaleDateString();
};

function StatusPill({ status }) {
    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLES[status] || STATUS_STYLES.draft}`}
        >
            {statusLabel(status)}
        </span>
    );
}

export default function SuperAdminDashboard({
    auth,
    flash,
    pages = [],
    documents = {},
    revisions = [],
    media = [],
    partnerSummary,
    activity = [],
    mediaMaxKb,
}) {
    const [section, setSection] = useState(() => {
        if (typeof window === "undefined") return "overview";
        return new URLSearchParams(window.location.search).get("section") || "overview";
    });
    const [selectedKey, setSelectedKey] = useState(() => {
        if (typeof window === "undefined") return "home";
        return new URLSearchParams(window.location.search).get("page") || "home";
    });
    const [mobileNav, setMobileNav] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

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

    const go = (nextSection, pageKey) => {
        if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
        setDirty(false);
        setSection(nextSection);
        if (pageKey) setSelectedKey(pageKey);
        setMobileNav(false);
        const params = new URLSearchParams({ section: nextSection });
        if (nextSection === "content") params.set("page", pageKey || selectedKey);
        window.history.replaceState(window.history.state, "", `/super-admin?${params}`);
    };

    const counts = partnerSummary?.counts || {};
    const awaitingReview = (counts.submitted || 0) + (counts.under_review || 0);
    const draftPages = pages.filter((p) => p.has_draft);

    const nav = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "content", label: "Website content", icon: FileText, badge: draftPages.length || null },
        { id: "partners", label: "Partner applications", icon: Building2, badge: awaitingReview || null },
        { id: "media", label: "Media library", icon: ImageIcon },
        { id: "history", label: "Publishing history", icon: History },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-800">
            <Head title="Super Admin — RAVU" />

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#050B17] text-slate-300 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
                    <Link href="/" className="flex items-center gap-3">
                        <img src={logoImg} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/15" />
                        <div>
                            <p className="text-base font-black text-white">RAVU Admin</p>
                            <p className="text-[11px] text-slate-400">Content & partners</p>
                        </div>
                    </Link>
                    <button type="button" onClick={() => setMobileNav(false)} className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden" aria-label="Close menu">
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
                    {nav.map((item) => {
                        const Icon = item.icon;
                        const active = section === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => go(item.id)}
                                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${active ? "bg-[#00289a] text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                            >
                                <span className="flex items-center gap-3">
                                    <Icon size={17} /> {item.label}
                                </span>
                                {item.badge && (
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? "bg-white/20" : "bg-amber-400/90 text-amber-950"}`}>
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    {section === "content" && (
                        <div className="mt-4 border-t border-white/10 pt-4">
                            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Pages</p>
                            {pages.map((page) => (
                                <button
                                    key={page.key}
                                    type="button"
                                    onClick={() => go("content", page.key)}
                                    className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2 text-left text-xs font-semibold ${selectedKey === page.key ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
                                >
                                    <span className="truncate">{page.label}</span>
                                    {page.has_draft && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" title="Unpublished changes" />}
                                </button>
                            ))}
                        </div>
                    )}
                </nav>

                <div className="space-y-1 border-t border-white/10 p-3">
                    <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white">
                        <ExternalLink size={16} /> View website
                    </a>
                    <Link href="/logout" method="post" as="button" className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white">
                        <LogOut size={16} /> Sign out
                    </Link>
                    <p className="truncate px-3.5 pt-1 text-[11px] text-slate-500">{auth?.user?.email}</p>
                </div>
            </aside>

            {mobileNav && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileNav(false)} aria-hidden="true" />}

            {/* Main */}
            <div className="min-w-0 flex-1">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
                    <button type="button" onClick={() => setMobileNav(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
                        <Menu size={20} />
                    </button>
                    <h1 className="text-lg font-black text-slate-950">{nav.find((n) => n.id === section)?.label}</h1>
                </header>

                <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
                    {section === "overview" && (
                        <Overview pages={pages} partnerSummary={partnerSummary} activity={activity} revisions={revisions} go={go} />
                    )}
                    {section === "content" && documents[selectedKey] && (
                        <ContentWorkspace
                            key={selectedKey}
                            page={pages.find((p) => p.key === selectedKey)}
                            document={documents[selectedKey]}
                            media={media}
                            mediaMaxKb={mediaMaxKb}
                            onDirtyChange={setDirty}
                        />
                    )}
                    {section === "partners" && <PartnersPanel summary={partnerSummary} />}
                    {section === "media" && <MediaPanel media={media} mediaMaxKb={mediaMaxKb} />}
                    {section === "history" && <HistoryPanel revisions={revisions} pages={pages} />}
                </main>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Overview                                                                   */
/* -------------------------------------------------------------------------- */

function Overview({ pages, partnerSummary, activity, revisions, go }) {
    const counts = partnerSummary?.counts || {};
    const pageLabel = Object.fromEntries(pages.map((p) => [p.key, p.label]));

    const feed = useMemo(() => {
        const partnerEvents = activity.map((a) => ({
            id: `a-${a.id}`,
            at: a.created_at,
            who: a.user,
            what: describeActivity(a),
            kind: "partner",
        }));
        const contentEvents = revisions.map((r) => ({
            id: `r-${r.id}`,
            at: r.created_at,
            who: r.published_by,
            what: `Published ${pageLabel[r.key] || r.key}`,
            kind: "content",
        }));
        return [...partnerEvents, ...contentEvents]
            .sort((a, b) => new Date(b.at) - new Date(a.at))
            .slice(0, 12);
    }, [activity, revisions]);

    const stats = [
        { label: "Awaiting review", value: (counts.submitted || 0) + (counts.under_review || 0), hint: "Submitted or under review", icon: Clock, tone: "text-blue-700 bg-blue-50", action: () => go("partners") },
        { label: "Waiting on partner", value: counts.action_required || 0, hint: "Changes requested", icon: AlertCircle, tone: "text-amber-700 bg-amber-50", action: () => go("partners") },
        { label: "Active partners", value: partnerSummary?.active_partners || 0, hint: "Approved & live", icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-50", action: () => go("partners") },
        { label: "Unpublished pages", value: pages.filter((p) => p.has_draft).length, hint: "Drafts not yet live", icon: FileText, tone: "text-violet-700 bg-violet-50", action: () => go("content") },
    ];

    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <button key={stat.label} type="button" onClick={stat.action} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xs transition hover:border-slate-300 hover:shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                                <span className={`rounded-lg p-2 ${stat.tone}`}>
                                    <Icon size={16} />
                                </span>
                            </div>
                            <p className="mt-3 text-3xl font-black text-slate-950">{stat.value}</p>
                            <p className="mt-1 text-xs text-slate-500">{stat.hint}</p>
                        </button>
                    );
                })}
            </div>

            <div className="grid gap-6 xl:grid-cols-5">
                <section className="rounded-2xl border border-slate-200 bg-white shadow-xs xl:col-span-3">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <h2 className="text-sm font-black">Partner review queue</h2>
                        <button type="button" onClick={() => go("partners")} className="text-xs font-bold text-blue-700 hover:underline">
                            View all
                        </button>
                    </div>
                    <ApplicationList items={(partnerSummary?.queue || []).slice(0, 5)} compact />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-xs xl:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <h2 className="text-sm font-black">Website pages</h2>
                        <button type="button" onClick={() => go("content")} className="text-xs font-bold text-blue-700 hover:underline">
                            Edit content
                        </button>
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {pages.map((page) => (
                            <li key={page.key}>
                                <button type="button" onClick={() => go("content", page.key)} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-slate-50">
                                    <span className="text-sm font-semibold text-slate-800">{page.label}</span>
                                    {page.has_draft ? (
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800">Draft</span>
                                    ) : (
                                        <span className="text-[11px] text-slate-400">{page.published_at ? `Published ${relative(page.published_at)}` : "Default content"}</span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
                <h2 className="border-b border-slate-100 px-5 py-4 text-sm font-black">Recent activity</h2>
                {feed.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-slate-500">No activity yet.</p>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {feed.map((event) => (
                            <li key={event.id} className="flex items-start gap-3 px-5 py-3">
                                <span className={`mt-0.5 rounded-lg p-1.5 ${event.kind === "content" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}`}>
                                    {event.kind === "content" ? <FileText size={14} /> : <Building2 size={14} />}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-slate-800">{event.what}</p>
                                    <p className="text-xs text-slate-500">
                                        {event.who} · {relative(event.at)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

function describeActivity(entry) {
    const partner = entry.partner || "a partner";
    switch (entry.action) {
        case "application_status_changed":
            return `${partner}: application ${statusLabel(entry.details?.from || "")} → ${statusLabel(entry.details?.to || "")}`;
        case "account_registered":
            return `${partner} registered for the partner portal`;
        case "document_uploaded":
            return `${partner} uploaded a document`;
        case "document_reviewed":
            return `Document reviewed for ${partner}`;
        case "benefit_reviewed":
            return `Member benefit reviewed for ${partner}`;
        case "benefit_proposal_saved":
            return `${partner} updated their proposed member benefit`;
        case "business_profile_saved":
            return `${partner} updated business details`;
        case "primary_location_saved":
            return `${partner} updated their business location`;
        default:
            return `${partner}: ${statusLabel(entry.action)}`;
    }
}

/* -------------------------------------------------------------------------- */
/* Partner applications                                                       */
/* -------------------------------------------------------------------------- */

function ApplicationList({ items, compact = false }) {
    if (!items.length) {
        return (
            <div className="flex flex-col items-center px-5 py-10 text-center">
                <CheckCircle2 className="text-emerald-600" size={28} />
                <p className="mt-2 text-sm font-semibold text-slate-700">No applications waiting.</p>
                <p className="text-xs text-slate-500">New submissions from the partner portal appear here.</p>
            </div>
        );
    }
    return (
        <ul className="divide-y divide-slate-100">
            {items.map((app) => (
                <li key={app.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">{app.business}</p>
                        <p className="truncate text-xs text-slate-500">
                            {[app.category || "Category pending", app.contact, !compact && app.contact_email].filter(Boolean).join(" · ")}
                        </p>
                    </div>
                    <StatusPill status={app.status} />
                    <span className="hidden w-28 text-right text-xs text-slate-500 sm:block">{app.submitted_at ? relative(app.submitted_at) : "—"}</span>
                    <Link href={`/partner-management/applications/${app.id}`} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700">
                        Review <ArrowUpRight size={13} />
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function PartnersPanel({ summary }) {
    const counts = summary?.counts || {};
    const order = ["submitted", "under_review", "action_required", "approved", "rejected", "suspended", "draft"];
    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-base font-black">Partnership requests</h2>
                        <p className="mt-1 max-w-xl text-sm text-slate-600">
                            Businesses apply through the partner portal. Review their documents and proposed member benefits, then approve, request changes or reject.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/partner-management" className="inline-flex items-center gap-2 rounded-lg bg-[#00289a] px-4 py-2 text-sm font-bold text-white hover:bg-[#001f78]">
                            <ShieldCheck size={16} /> Open review workspace
                        </Link>
                    </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                    {order.map((status) => {
                        const inner = (
                            <>
                                {status === "draft" ? "Still onboarding" : statusLabel(status)}
                                <span className="rounded-full bg-white px-1.5 font-black text-slate-900">{counts[status] || 0}</span>
                            </>
                        );
                        const cls = "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700";
                        return status === "draft" ? (
                            <span key={status} className={cls} title="Registered but not yet submitted">
                                {inner}
                            </span>
                        ) : (
                            <Link key={status} href={`/partner-management?status=${status}`} className={`${cls} hover:border-slate-300`}>
                                {inner}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-sm font-black">Needs attention</h2>
                    <p className="text-xs text-slate-500">New submissions first, then applications under review and those waiting on the partner.</p>
                </div>
                <ApplicationList items={summary?.queue || []} />
            </section>

            <p className="flex items-center gap-2 text-xs text-slate-500">
                <Users size={14} /> Staff with the <code className="rounded bg-slate-100 px-1">partner_reviewer</code> role can review applications without access to website content.
            </p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Content workspace                                                          */
/* -------------------------------------------------------------------------- */

function ContentWorkspace({ page, document, media, mediaMaxKb, onDirtyChange }) {
    const { errors = {} } = usePage().props;
    const serverDraft = JSON.stringify(document.draft);
    const [working, setWorking] = useState(() => clone(document.draft));
    const [busy, setBusy] = useState(false);

    // Re-sync when the server's draft changes (after save/publish/discard/restore).
    useEffect(() => {
        setWorking(clone(document.draft));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverDraft]);

    const dirty = JSON.stringify(working) !== serverDraft;
    useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

    const differsFromLive = page.has_draft;
    const contentErrors = Object.fromEntries(Object.entries(errors).filter(([k]) => k.startsWith("content")));

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

    return (
        <div className="space-y-5">
            <div className="sticky top-16 z-20 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-black text-slate-950">{page.label}</h2>
                            {dirty ? (
                                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700">Unsaved changes</span>
                            ) : differsFromLive ? (
                                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">Draft — not published</span>
                            ) : (
                                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">Live</span>
                            )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {page.path} ·{" "}
                            {page.published_at ? `Last published ${formatDate(page.published_at)} by ${page.published_by || "RAVU"}` : "Showing the original website copy"}
                            {page.has_draft && page.draft_updated_at && ` · Draft saved ${relative(page.draft_updated_at)}`}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={save} disabled={busy || !dirty} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-40">
                            <Save size={14} /> Save draft
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
                            className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 ${dirty ? "cursor-not-allowed opacity-40" : ""}`}
                        >
                            <Eye size={14} /> Preview
                        </a>
                        <button type="button" onClick={publish} disabled={busy || (!dirty && !differsFromLive)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#00289a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#001f78] disabled:opacity-40">
                            <Send size={14} /> Publish
                        </button>
                    </div>
                </div>
            </div>

            {Object.keys(contentErrors).length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
                    <p className="font-bold">Fix these fields before saving:</p>
                    <ul className="mt-1 list-disc pl-5">
                        {Object.values(contentErrors).slice(0, 6).map((message) => (
                            <li key={message}>{message}</li>
                        ))}
                    </ul>
                </div>
            )}

            <ContentEditor
                value={working}
                schema={CONTENT_DEFAULTS[page.key]}
                onChange={setWorking}
                errors={contentErrors}
                media={media}
                mediaMaxKb={mediaMaxKb}
            />

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5 text-xs">
                {differsFromLive && (
                    <button type="button" onClick={discard} disabled={busy} className="inline-flex items-center gap-1.5 font-bold text-red-700 hover:underline">
                        <Undo2 size={14} /> Discard unpublished changes
                    </button>
                )}
                <button type="button" onClick={resetToDefaults} className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:underline">
                    <RotateCcw size={14} /> Load original website copy
                </button>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Media & history                                                            */
/* -------------------------------------------------------------------------- */

function MediaPanel({ media, mediaMaxKb }) {
    const remove = (item) => {
        if (!window.confirm(`Delete ${item.name}? Pages still using it will show no image.`)) return;
        router.delete(`/super-admin/media/${item.id}`, { preserveScroll: true });
    };
    const bundled = Object.entries(BUNDLED_MEDIA);

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-black">Uploaded images</h2>
                        <p className="text-xs text-slate-500">JPG, PNG or WebP up to {Math.round((mediaMaxKb || 5120) / 1024)} MB. Choose them from any image field in the content editor.</p>
                    </div>
                    <MediaUploadButton mediaMaxKb={mediaMaxKb} />
                </div>
                {media.length === 0 ? (
                    <p className="mt-6 text-sm text-slate-500">No uploads yet.</p>
                ) : (
                    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {media.map((item) => (
                            <figure key={item.id} className="overflow-hidden rounded-xl border border-slate-200">
                                <img src={item.url} alt="" loading="lazy" className="aspect-[4/3] w-full bg-slate-100 object-cover" />
                                <figcaption className="flex items-center justify-between gap-2 px-3 py-2">
                                    <span className="min-w-0">
                                        <span className="block truncate text-xs font-semibold text-slate-700">{item.name}</span>
                                        <span className="text-[11px] text-slate-400">{Math.round(item.size / 1024)} KB</span>
                                    </span>
                                    <button type="button" onClick={() => remove(item)} className="rounded-md p-1.5 text-red-600 hover:bg-red-50" aria-label={`Delete ${item.name}`}>
                                        <Trash2 size={14} />
                                    </button>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h2 className="text-sm font-black">Built-in site images</h2>
                <p className="text-xs text-slate-500">These ship with the website and can be used in any image field.</p>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {bundled.map(([name, src]) => (
                        <figure key={name} className="overflow-hidden rounded-xl border border-slate-200">
                            <img src={src} alt="" loading="lazy" className="aspect-[4/3] w-full bg-slate-100 object-cover" />
                            <figcaption className="truncate px-3 py-2 text-[11px] font-medium text-slate-600">{name}</figcaption>
                        </figure>
                    ))}
                </div>
            </section>
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
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-black">Published versions</h2>
                <p className="text-xs text-slate-500">Every publish is kept. Load an earlier version into the draft to roll back.</p>
            </div>
            {revisions.length === 0 ? (
                <p className="px-5 py-6 text-sm text-slate-500">Nothing has been published from the CMS yet.</p>
            ) : (
                <ul className="divide-y divide-slate-100">
                    {revisions.map((revision) => (
                        <li key={revision.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{label[revision.key] || revision.key}</p>
                                <p className="text-xs text-slate-500">
                                    {formatDate(revision.created_at)} · {revision.published_by}
                                </p>
                            </div>
                            <button type="button" onClick={() => restore(revision)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                                <RotateCcw size={13} /> Load into draft
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
