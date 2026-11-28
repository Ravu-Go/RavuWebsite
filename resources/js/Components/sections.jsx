import { Link } from "@inertiajs/react";
import { ArrowRight, Check, Minus, Plus, Smartphone } from "lucide-react";
import { useState } from "react";
import { Headline, keyFor, resolveMedia, useSiteContent } from "../content";
import { iconFor } from "../content/icons";

/* ==========================================================================
   RAVU SHARED PAGE SECTIONS (Aligned with Home.jsx design language)
   ========================================================================== */

/** A store link is live once it is a real URL, not a "#app-store" placeholder. */
function isLive(url) {
    return Boolean(url) && !url.startsWith("#");
}

function AppleLogo() {
    return (
        <svg viewBox="0 0 384 512" className="h-[22px] w-[22px] shrink-0 fill-current" aria-hidden="true">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 62.3 26 139.7c15.6 44.5 44 95.3 84.7 95.7 32 .3 42.4-21.7 82.2-21.7 39.4 0 50.8 21.7 84 21.7 41.5-.4 68.9-46.7 84.2-91.2 17.6-51.1 24.8-100.8 25.1-103.3-1.2-.6-70.3-26.9-71.5-45.7zm-61.9-158.4c17.5-21.6 29.5-51.5 26.2-81.9-25.3 1.1-56.5 17.2-74.6 38.6-16 18.8-30.2 49-26.4 78.4 28.3 2.2 57.3-13.5 74.8-35.1z" />
        </svg>
    );
}

/** Google Play mark: four wedges meeting at one point, in the store's colours. */
function GooglePlayLogo() {
    return (
        <svg viewBox="0 0 28 30" className="h-[22px] w-[21px] shrink-0" aria-hidden="true">
            <path fill="#00A0FF" d="M2.4 1.1 16 15 2.4 28.9c-.5-.3-.8-.9-.8-1.6V2.7c0-.7.3-1.3.8-1.6Z" />
            <path fill="#00D27A" d="M2.4 1.1c.5-.3 1.2-.3 1.8 0L20.6 10.4 16 15Z" />
            <path fill="#FF3A44" d="M2.4 28.9 16 15l4.6 4.6L4.2 28.9c-.6.3-1.3.3-1.8 0Z" />
            <path fill="#FFC400" d="m20.6 10.4 4.9 2.8c1.4.8 1.4 2.8 0 3.6l-4.9 2.8L16 15Z" />
        </svg>
    );
}

/**
 * Store badge in the stores' own badge layout (black, thin grey border, mark
 * on the left, two lines of text). A link once the app is published; until
 * then a plain badge that says "Coming soon".
 */
function StoreBadge({ url, logo, smallLine, comingSoonLine, storeName }) {
    const live = isLive(url);
    const body = (
        <>
            {logo}
            <span className="flex flex-col text-left leading-none">
                <span className="text-[10px] font-medium tracking-[0.01em] text-white/85">
                    {live ? smallLine : comingSoonLine}
                </span>
                <span className="mt-[3px] text-[17px] font-semibold tracking-[-0.01em] text-white">
                    {storeName}
                </span>
            </span>
        </>
    );
    const base =
        "inline-flex h-[46px] min-w-[150px] items-center gap-2.5 rounded-[10px] border border-[#A6A6A6] bg-black px-3.5 text-white";
    if (!live) {
        return (
            <span className={base} aria-label={`${storeName}: coming soon`}>
                {body}
            </span>
        );
    }
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${smallLine} ${storeName}`}
            className={`${base} transition-colors hover:bg-[#1a1a1a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1864E8]`}
        >
            {body}
        </a>
    );
}

/**
 * App Store and Google Play badges. Store URLs come from the CMS (global.appLinks).
 */
export function StoreButtons({ className = "" }) {
    const { appLinks } = useSiteContent("global");
    return (
        <div className={`flex flex-wrap items-center gap-3 ${className}`}>
            <StoreBadge
                url={appLinks.appStoreUrl}
                logo={<AppleLogo />}
                smallLine="Download on the"
                comingSoonLine="Coming soon to the"
                storeName="App Store"
            />
            <StoreBadge
                url={appLinks.googlePlayUrl}
                logo={<GooglePlayLogo />}
                smallLine="GET IT ON"
                comingSoonLine="Coming soon to"
                storeName="Google Play"
            />
        </div>
    );
}

/**
 * Page hero matching Home.jsx typography, whitespace, and clean white canvas.
 * `layout="split"` places supporting art beside the copy;
 * `layout="stacked"` is the centered editorial variant.
 */
export function Hero({
    eyebrow,
    title,
    highlight,
    text,
    primary,
    secondary,
    media,
    mediaAlt,
    layout = "stacked",
    children,
}) {
    const isSplit = layout === "split" && media;

    return (
        <section className="relative overflow-hidden bg-white pt-12 pb-12 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <div
                    className={
                        isSplit
                            ? "grid items-center gap-10 lg:grid-cols-12 lg:gap-16"
                            : "mx-auto max-w-3xl text-center"
                    }
                >
                    <div className={isSplit ? "lg:col-span-6" : ""}>
                        {eyebrow && (
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                {eyebrow}
                            </p>
                        )}
                        <h1 className="mt-4 text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.35rem]">
                            <Headline
                                title={title}
                                highlight={highlight}
                                highlightClassName="text-[#1864E8]"
                            />
                        </h1>
                        {text && (
                            <p
                                className={`mt-5 text-base leading-relaxed text-slate-600 sm:text-lg ${
                                    isSplit ? "max-w-xl" : "mx-auto max-w-xl"
                                }`}
                            >
                                {text}
                            </p>
                        )}
                        {(primary || secondary) && (
                            <div
                                className={`mt-8 flex flex-wrap items-center gap-3.5 ${
                                    isSplit ? "" : "justify-center"
                                }`}
                            >
                                {primary && (
                                    <Link
                                        href={primary.href}
                                        prefetch
                                        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-slate-800 active:scale-[0.98] sm:text-sm"
                                    >
                                        <span>{primary.label}</span>
                                        <ArrowRight size={15} />
                                    </Link>
                                )}
                                {secondary && (
                                    <Link
                                        href={secondary.href}
                                        prefetch
                                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950 sm:text-sm"
                                    >
                                        {secondary.label}
                                    </Link>
                                )}
                            </div>
                        )}
                        {children}
                    </div>

                    {isSplit && (
                        <div className="lg:col-span-6">
                            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 shadow-xl shadow-slate-900/5">
                                <img
                                    src={media}
                                    alt={mediaAlt || ""}
                                    fetchPriority="high"
                                    decoding="async"
                                    className="aspect-[4/3] w-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

/**
 * 3-Item Horizontal Feature Strip matching the Home.jsx 3-column divided bar.
 */
export function FeatureStrip({ items = [] }) {
    return (
        <section className="border-t border-b border-slate-100 bg-white py-10 sm:py-14">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-y-0 sm:divide-x sm:divide-slate-200/80">
                    {items.map((item, index) => {
                        const Icon =
                            typeof item.icon === "string"
                                ? iconFor(item.icon)
                                : item.icon;
                        return (
                            <div
                                key={keyFor(item, index)}
                                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 sm:px-6 sm:py-0 sm:first:pl-0 sm:last:pr-0"
                            >
                                {Icon && (
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                        <Icon size={20} />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        {item.title}
                                    </h3>
                                    <p className="mt-0.5 max-w-[230px] text-xs leading-relaxed text-slate-500">
                                        {item.text}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/**
 * Clean Ecosystem overview section matching the Home.jsx slate + cobalt aesthetic.
 */
export function EcosystemSection() {
    const { ecosystem } = useSiteContent("global");
    return (
        <section className="border-t border-slate-100 bg-slate-50/60 py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {ecosystem.eyebrow}
                    </p>
                    <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                        <Headline
                            title={ecosystem.title}
                            highlight={ecosystem.highlight}
                            highlightClassName="text-[#1864E8]"
                        />
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                        {ecosystem.text}
                    </p>
                </div>

                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {ecosystem.items.map((node, index) => (
                        <div
                            key={keyFor(node, index)}
                            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#EBF3FE] text-xs font-black text-[#1864E8]">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="h-1.5 w-1.5 rounded-full bg-[#1864E8]/40" />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-slate-950">
                                {node.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                {node.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/**
 * Rider/driver app showcase matching the Home.jsx Map Phone showcase.
 */
export function AppPromo() {
    const { appPromo } = useSiteContent("global");
    return (
        <section
            id="app"
            className="overflow-hidden border-t border-slate-100 bg-white py-16 sm:py-24"
        >
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                    <div className="flex justify-center lg:col-span-6">
                        <div className="relative w-full max-w-xs sm:max-w-sm">
                            <img
                                src={resolveMedia(appPromo.image)}
                                alt={appPromo.imageAlt}
                                loading="lazy"
                                decoding="async"
                                className="h-auto w-full select-none drop-shadow-xl"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {appPromo.eyebrow}
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                            <Headline
                                title={appPromo.title}
                                highlight={appPromo.highlight}
                                highlightClassName="text-[#1864E8]"
                            />
                        </h2>
                        <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
                            {appPromo.text}
                        </p>
                        <div className="mt-8">
                            <StoreButtons />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/** Accessible FAQ accordion styled in the clean slate + #1864E8 palette. */
export function FAQAccordion({ items, className = "" }) {
    const [open, setOpen] = useState(0);

    return (
        <div
            className={`divide-y divide-slate-200/80 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs ${className}`}
        >
            {items.map((item, index) => {
                const isOpen = open === index;
                return (
                    <div key={keyFor(item, index)}>
                        <h3>
                            <button
                                type="button"
                                onClick={() => setOpen(isOpen ? -1 : index)}
                                aria-expanded={isOpen}
                                aria-controls={`faq-panel-${index}`}
                                id={`faq-trigger-${index}`}
                                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-[15px] font-bold text-slate-950 transition-colors hover:bg-slate-50/80 sm:px-6"
                            >
                                <span>{item.question}</span>
                                <span
                                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${
                                        isOpen
                                            ? "bg-[#1864E8] text-white"
                                            : "bg-[#EBF3FE] text-[#1864E8]"
                                    }`}
                                    aria-hidden="true"
                                >
                                    {isOpen ? (
                                        <Minus size={15} />
                                    ) : (
                                        <Plus size={15} />
                                    )}
                                </span>
                            </button>
                        </h3>
                        <div
                            id={`faq-panel-${index}`}
                            role="region"
                            aria-labelledby={`faq-trigger-${index}`}
                            hidden={!isOpen}
                            className="px-5 pb-5 sm:px-6"
                        >
                            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                                {item.answer}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/** Small inline link used to close out sections. */
export function InlineLink({ href, children }) {
    return (
        <Link
            href={href}
            prefetch
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1864E8] transition-colors hover:text-[#00289a]"
        >
            {children}
        </Link>
    );
}
