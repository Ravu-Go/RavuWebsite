import { Link } from "@inertiajs/react";
import { Minus, Plus, Smartphone } from "lucide-react";
import { useState } from "react";
import {
    Button,
    ButtonRow,
    Card,
    Container,
    Eyebrow,
    GridBackdrop,
    PatternBackdrop,
    Reveal,
} from "./ui";

/* ==========================================================================
   RAVU SHARED PAGE SECTIONS
   Composed from the ui kit so every page keeps the same rhythm.
   ========================================================================== */

/**
 * Page hero. `layout="split"` places supporting art beside the copy;
 * `layout="stacked"` is the quiet corporate variant used by text pages.
 */
export function Hero({
    eyebrow,
    title,
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
        <section className="relative overflow-hidden border-b border-ink-200 bg-white">
            <GridBackdrop />

            <Container className="relative py-14 sm:py-16 lg:py-20">
                <div
                    className={
                        isSplit
                            ? "grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14"
                            : ""
                    }
                >
                    <div className={`ravu-reveal ${isSplit ? "" : "max-w-3xl"}`}>
                        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
                        <h1 className="mt-4 text-[2.1rem] font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                            {title}
                        </h1>
                        {text && (
                            <p className="mt-5 max-w-xl text-base leading-7 text-ink-600 sm:text-lg sm:leading-8">
                                {text}
                            </p>
                        )}
                        {(primary || secondary) && (
                            <ButtonRow className="mt-8">
                                {primary && (
                                    <Button
                                        href={primary.href}
                                        size="lg"
                                        variant="primary"
                                    >
                                        {primary.label}
                                    </Button>
                                )}
                                {secondary && (
                                    <Button
                                        href={secondary.href}
                                        size="lg"
                                        variant="outline"
                                    >
                                        {secondary.label}
                                    </Button>
                                )}
                            </ButtonRow>
                        )}
                        {children}
                    </div>

                    {isSplit && (
                        <div className="ravu-reveal ravu-reveal-delay-2 relative">
                            <div className="overflow-hidden rounded-xl border-ink-200 bg-ink-50">
                                <img
                                    src={media}
                                    alt={mediaAlt || ""}
                                    loading="lazy"
                                    decoding="async"
                                    className="aspect-[4/3] w-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        </section>
    );
}

/** Dark closing call-to-action band. */
export function CTASection({ eyebrow, title, text, primary, secondary }) {
    return (
        <section className="relative overflow-hidden bg-ink-950 py-16 sm:py-20">
            <PatternBackdrop tone="dark" />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-ravu-600/20 blur-3xl"
            />
            <Container className="relative">
                <Reveal className="max-w-2xl">
                    {eyebrow && <Eyebrow tone="light">{eyebrow}</Eyebrow>}
                    <h2 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-[2.5rem]">
                        {title}
                    </h2>
                    {text && (
                        <p className="mt-5 max-w-xl text-base leading-7 text-ink-300 sm:text-lg">
                            {text}
                        </p>
                    )}
                    {(primary || secondary) && (
                        <ButtonRow className="mt-8">
                            {primary && (
                                <Button
                                    href={primary.href}
                                    size="lg"
                                    variant="primary"
                                >
                                    {primary.label}
                                </Button>
                            )}
                            {secondary && (
                                <Button
                                    href={secondary.href}
                                    size="lg"
                                    variant="onDarkOutline"
                                >
                                    {secondary.label}
                                </Button>
                            )}
                        </ButtonRow>
                    )}
                </Reveal>
            </Container>
        </section>
    );
}

const ECOSYSTEM = [
    {
        title: "Members",
        text: "People who join RAVU and participate in the ecosystem.",
    },
    {
        title: "Riders & Drivers",
        text: "The mobility community whose work keeps places connected.",
    },
    {
        title: "Businesses",
        text: "Hotels, restaurants and organisations that serve and reach members.",
    },
    {
        title: "Partners",
        text: "Insurers, banks, workshops, spare parts and technology partners.",
    },
    {
        title: "Services",
        text: "Support, protection and practical services around mobility.",
    },
    {
        title: "Community",
        text: "A connected network that grows stronger as it grows wider.",
    },
];

/**
 * Visual explanation of how RAVU connects people, businesses and services.
 * Deliberately reads as a human/business relationship map, not a system diagram.
 */
export function EcosystemSection({ tone = "muted" }) {
    const isDark = tone === "dark";

    return (
        <section
            className={`relative overflow-hidden py-16 sm:py-20 lg:py-24 ${isDark ? "bg-ravu-950 text-ravu-100" : "bg-ink-50"
                }`}
        >
            <PatternBackdrop tone={isDark ? "dark" : "light"} />
            <Container className="relative">
                <Reveal className="max-w-2xl">
                    <Eyebrow tone={isDark ? "light" : "dark"}>
                        The RAVU ecosystem
                    </Eyebrow>
                    <h2
                        className={`mt-4 text-3xl font-black leading-[1.08] tracking-tight sm:text-[2.4rem] ${isDark ? "text-white" : "text-ink-950"
                            }`}
                    >
                        RAVU sits at the centre and connects everyone around it.
                    </h2>
                    <p
                        className={`mt-4 text-base leading-7 sm:text-lg ${isDark ? "text-ink-300" : "text-ink-600"
                            }`}
                    >
                        The ecosystem works because each part strengthens the
                        others people, businesses, services and opportunity,
                        connected around mobility.
                    </p>
                </Reveal>

                <div className="relative mt-12">
                    {/* Connector spine — a subtle brand line, not a diagram. */}
                    <div
                        aria-hidden="true"
                        className={`absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 lg:block ${isDark ? "bg-white/10" : "bg-ink-200"
                            }`}
                    />

                    <Reveal className="relative mx-auto max-w-md">
                        <div className="rounded-xl border-ravu-500/40 bg-ink-950 px-6 py-5 text-center shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ravu-400">
                                RAVU
                            </p>
                            <p className="mt-1.5 text-sm text-ink-300">
                                Membership &amp; ecosystem
                            </p>
                        </div>
                    </Reveal>

                    <div
                        aria-hidden="true"
                        className={`mx-auto mt-4 h-8 w-px ${isDark ? "bg-white/15" : "bg-ink-200"
                            }`}
                    />

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {ECOSYSTEM.map((node, index) => (
                            <Reveal key={node.title} delay={index * 0.05}>
                                <Card title={node.title} tone={isDark ? "dark" : "light"}>
                                    {node.text}
                                </Card>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}

/**
 * Rider/driver app pathway. The website's job is to hand riders to the app —
 * not to reproduce the operational experience here.
 */
export function AppPromo() {
    return (
        <section className="relative overflow-hidden border-y border-ink-200 bg-white py-16 sm:py-20 lg:py-24">
            <div
                aria-hidden="true"
                className="ravu-mesh pointer-events-none absolute inset-0"
            />
            <Container className="relative">
                <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                    <Reveal>
                        <Eyebrow>For riders &amp; drivers</Eyebrow>
                        <h2 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight sm:text-[2.4rem]">
                            Are you a rider or driver?
                        </h2>
                        <p className="mt-5 max-w-xl text-base leading-7 text-ink-600 sm:text-lg">
                            The RAVU app is where the operational experience
                            lives — membership access, services, benefits and
                            the day-to-day tools built around your journey.
                        </p>
                        <p className="mt-4 max-w-xl text-base leading-7 text-ink-600">
                            This website is the front door to RAVU. The app is
                            where you use it.
                        </p>
                        <ButtonRow className="mt-8">
                            <Button href="/for-riders" size="lg">
                                Get the RAVU App
                            </Button>
                            <Button
                                href="/membership"
                                size="lg"
                                variant="outline"
                            >
                                Learn About Membership
                            </Button>
                        </ButtonRow>
                        <p className="mt-5 text-xs leading-5 text-ink-500">
                            App download links will be published here once the
                            RAVU mobile app is available.
                        </p>
                    </Reveal>

                    <Reveal delay={0.1} className="relative">
                        <div className="relative mx-auto w-full max-w-sm">
                            <div
                                aria-hidden="true"
                                className="absolute inset-6 rounded-[2rem] bg-ravu-500/15 blur-2xl"
                            />
                            <div className="relative rounded-[1.75rem] border-ink-200 bg-white p-2.5 shadow-sm">
                                <div className="relative overflow-hidden rounded-[1.4rem] bg-ink-950 px-6 py-10 text-center">
                                    <PatternBackdrop tone="dark" />
                                    <div className="relative">
                                        <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-ravu-500 text-ink-950">
                                            <Smartphone
                                                size={26}
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <p className="mt-5 text-lg font-black text-white">
                                            RAVU App
                                        </p>
                                        <p className="mt-1.5 text-sm text-ink-400">
                                            Membership access and daily tools
                                        </p>
                                        <span className="mt-6 inline-flex rounded-lg border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ink-300">
                                            Coming soon
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </Container>
        </section>
    );
}

/** Accessible FAQ accordion using native disclosure semantics. */
export function FAQAccordion({ items, className = "" }) {
    const [open, setOpen] = useState(0);

    return (
        <div
            className={`divide-y divide-ink-200 overflow-hidden rounded-xl border-ink-200 bg-white ${className}`}
        >
            {items.map((item, index) => {
                const isOpen = open === index;
                return (
                    <div key={item.question}>
                        <h3>
                            <button
                                type="button"
                                onClick={() => setOpen(isOpen ? -1 : index)}
                                aria-expanded={isOpen}
                                aria-controls={`faq-panel-${index}`}
                                id={`faq-trigger-${index}`}
                                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-[15px] font-bold text-ink-950 transition-colors hover:bg-ink-50 sm:px-6"
                            >
                                <span>{item.question}</span>
                                <span
                                    className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-ink-100 text-ink-700"
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
                            <p className="max-w-2xl text-sm leading-6 text-ink-600">
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
            className="inline-flex items-center gap-1.5 text-sm font-bold text-ravu-700 transition-colors hover:text-ravu-800"
        >
            {children}
        </Link>
    );
}
