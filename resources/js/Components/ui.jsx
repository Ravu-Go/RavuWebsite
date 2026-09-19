import { Link } from "@inertiajs/react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ==========================================================================
   RAVU UI KIT
   ONE design system shared by every page. Change it here, not per page.
   ========================================================================== */

/* ---------------------------------------------------------------- Reveal */
/**
 * The single animation primitive for the site. Scroll-triggered fade + rise
 * using one timing/easing. Falls back to a no-op when the user has asked for
 * reduced motion (CSS also enforces this).
 */
export function Reveal({ children, delay = 0, className = "", as = "div" }) {
    const reduceMotion = useReducedMotion();
    const ref = useRef(null);
    // Default to visible. The observer can only ever ADD the animation;
    // it can never leave content stranded at opacity 0.
    const [visible, setVisible] = useState(true);
    const Tag = motion[as] || motion.div;

    useEffect(() => {
        if (reduceMotion || typeof IntersectionObserver === "undefined") {
            return;
        }

        const node = ref.current;
        if (!node) return;

        // Only elements genuinely below the fold are staged for animation.
        const rect = node.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) return;

        setVisible(false);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.01, rootMargin: "0px 0px -32px 0px" },
        );
        observer.observe(node);

        // Safety net: reveal unconditionally if the observer stays silent.
        const fallback = window.setTimeout(() => setVisible(true), 1200);

        return () => {
            observer.disconnect();
            window.clearTimeout(fallback);
        };
    }, [reduceMotion]);

    return (
        <Tag
            ref={ref}
            className={`ravu-scroll-reveal ${className}`}
            data-visible={visible ? "true" : "false"}
            style={{ transitionDelay: reduceMotion ? "0ms" : `${delay}s` }}
        >
            {children}
        </Tag>
    );
}

/* --------------------------------------------------------------- Buttons */
const BUTTON_BASE =
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const BUTTON_SIZES = {
    sm: "min-h-9 px-4",
    md: "min-h-11 px-5",
    lg: "min-h-12 px-6",
};

const BUTTON_VARIANTS = {
    // Primary RAVU action — reserved for Partner / Get the App / Register.
    primary:
        "bg-ravu-600 text-white hover:bg-ravu-700 active:bg-ravu-800 shadow-sm",
    // Secondary corporate action.
    dark: "bg-ink-950 text-white hover:bg-ink-800 active:bg-ink-900 shadow-sm",
    // Quiet counterpart to primary.
    outline:
        "border border-ink-200 bg-white text-ink-900 hover:border-ink-950 hover:bg-ink-50",
    ghost: "text-ink-700 hover:bg-ink-100 hover:text-ink-950",
    // For use on dark / photographic surfaces.
    onDark:
        "bg-white text-ink-950 hover:bg-ink-100 active:bg-ink-200 shadow-sm",
    onDarkOutline:
        "border border-white/30 text-white hover:border-white hover:bg-white/10",
};

export function Button({
    variant = "primary",
    size = "md",
    href,
    children,
    className = "",
    icon: Icon,
    iconRight: IconRight,
    ...props
}) {
    const classes = `${BUTTON_BASE} ${BUTTON_SIZES[size]} ${BUTTON_VARIANTS[variant]} ${className}`;

    const content = (
        <>
            {Icon && <Icon size={18} aria-hidden="true" />}
            <span>{children}</span>
            {IconRight && <IconRight size={18} aria-hidden="true" />}
        </>
    );

    if (href) {
        const isExternal = /^(https?:|mailto:|tel:)/.test(href);
        if (isExternal) {
            return (
                <a href={href} className={classes} {...props}>
                    {content}
                </a>
            );
        }
        return (
            <Link href={href} className={classes} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <button className={classes} {...props}>
            {content}
        </button>
    );
}

/* ---------------------------------------------------------------- Layout */
export function Container({ children, className = "", size = "default" }) {
    const widths = {
        narrow: "max-w-4xl",
        default: "max-w-7xl",
        wide: "max-w-[88rem]",
    };
    return (
        <div
            className={`mx-auto w-full ${widths[size]} px-5 sm:px-8 lg:px-10 ${className}`}
        >
            {children}
        </div>
    );
}

export function Section({
    children,
    className = "",
    tone = "white",
    pattern = false,
    id,
}) {
    const tones = {
        white: "bg-white",
        muted: "bg-ink-50",
        dark: "bg-ink-950 text-ink-300",
        green: "bg-ravu-950 text-ravu-100",
    };
    const isDark = tone === "dark" || tone === "green";

    return (
        <section
            id={id}
            className={`relative overflow-hidden py-16 sm:py-20 lg:py-24 ${tones[tone]} ${className}`}
        >
            {pattern && (
                <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 ${
                        isDark ? "ravu-pattern-dark" : "ravu-pattern opacity-40"
                    }`}
                />
            )}
            <div className="relative">{children}</div>
        </section>
    );
}

/* ------------------------------------------------------ Section headings */
export function Eyebrow({ children, tone = "dark", className = "" }) {
    const tones = {
        dark: "text-ravu-700",
        light: "text-ravu-300",
    };
    return (
        <p
            className={`text-xs font-bold uppercase tracking-[0.18em] ${tones[tone]} ${className}`}
        >
            {children}
        </p>
    );
}

export function SectionTitle({
    eyebrow,
    title,
    text,
    align = "left",
    tone = "dark",
    className = "",
}) {
    const alignment =
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl";

    return (
        <div className={`${alignment} ${className}`}>
            {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
            <h2
                className={`mt-3 text-3xl font-black leading-[1.08] tracking-tight sm:text-[2.4rem] ${
                    tone === "light" ? "text-white" : "text-ink-950"
                }`}
            >
                {title}
            </h2>
            {text && (
                <p
                    className={`mt-4 text-base leading-7 sm:text-lg ${
                        tone === "light" ? "text-ink-300" : "text-ink-600"
                    }`}
                >
                    {text}
                </p>
            )}
        </div>
    );
}

/* ----------------------------------------------------------------- Cards */
/** The one card style used across benefits, features and partners. */
export function Card({
    icon: Icon,
    title,
    children,
    href,
    meta,
    className = "",
    tone = "light",
}) {
    const isDark = tone === "dark";
    const base = `group relative flex h-full flex-col rounded-xl border p-6 transition-colors duration-200 ${
        isDark
            ? "border-white/10 bg-white/[0.03] hover:border-white/25"
            : "border-ink-200 bg-white hover:border-ravu-300"
    } ${className}`;

    const body = (
        <>
            {Icon && (
                <span
                    className={`mb-5 grid h-11 w-11 place-items-center rounded-lg ${
                        isDark
                            ? "bg-ravu-500/15 text-ravu-300"
                            : "bg-ravu-50 text-ravu-700"
                    }`}
                >
                    <Icon size={21} aria-hidden="true" />
                </span>
            )}
            {meta && (
                <p
                    className={`mb-2 text-xs font-bold uppercase tracking-[0.16em] ${
                        isDark ? "text-ravu-400" : "text-ravu-700"
                    }`}
                >
                    {meta}
                </p>
            )}
            <h3
                className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-ink-950"
                }`}
            >
                {title}
            </h3>
            {children && (
                <p
                    className={`mt-2.5 text-sm leading-6 ${
                        isDark ? "text-ink-400" : "text-ink-600"
                    }`}
                >
                    {children}
                </p>
            )}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={base}>
                {body}
            </Link>
        );
    }
    return <article className={base}>{body}</article>;
}

export function CardGrid({ children, columns = 3, className = "" }) {
    const cols = {
        2: "sm:grid-cols-2",
        3: "sm:grid-cols-2 lg:grid-cols-3",
        4: "sm:grid-cols-2 lg:grid-cols-4",
    }[columns];

    return (
        <div className={`grid gap-5 ${cols} ${className}`}>{children}</div>
    );
}

/* ----------------------------------------------------------------- Steps */
export function StepCard({ index, title, children, meta }) {
    return (
        <div className="relative border-t-2 border-ink-200 pt-5 transition-colors duration-200 hover:border-ravu-500">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-ravu-700">
                {String(index + 1).padStart(2, "0")}
            </span>
            {meta && (
                <span className="ml-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                    {meta}
                </span>
            )}
            <h3 className="mt-2.5 text-lg font-bold text-ink-950">{title}</h3>
            {children && (
                <p className="mt-2 text-sm leading-6 text-ink-600">
                    {children}
                </p>
            )}
        </div>
    );
}

/* ---------------------------------------------------------------- Macro */
/** Compact icon + label + line, used for the homepage trust strip. */
export function TrustPoint({ icon: Icon, title, children }) {
    return (
        <div className="flex gap-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ravu-50 text-ravu-700">
                <Icon size={19} aria-hidden="true" />
            </span>
            <div>
                <p className="text-sm font-bold text-ink-950">{title}</p>
                <p className="mt-0.5 text-sm leading-5 text-ink-500">
                    {children}
                </p>
            </div>
        </div>
    );
}

export function CheckList({ items, tone = "dark", className = "" }) {
    const isDark = tone === "dark";
    return (
        <ul className={`space-y-3.5 ${className}`}>
            {items.map((item) => (
                <li
                    key={item}
                    className={`flex gap-3 text-sm leading-6 ${
                        isDark ? "text-ink-700" : "text-ink-300"
                    }`}
                >
                    <span
                        className={`mt-1.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                            isDark
                                ? "bg-ravu-100 text-ravu-700"
                                : "bg-ravu-500/20 text-ravu-300"
                        }`}
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                            <path
                                d="M2.5 6.2l2.3 2.3 4.7-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}
