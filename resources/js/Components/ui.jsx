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
    const Tag = as;

    useEffect(() => {
        const node = ref.current;
        if (!node || reduceMotion || typeof IntersectionObserver === "undefined") {
            if (node) node.setAttribute("data-visible", "true");
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry && entry.isIntersecting) {
                    node.setAttribute("data-visible", "true");
                    observer.disconnect();
                }
            },
            { threshold: 0.05, rootMargin: "0px 0px 40px 0px" },
        );
        observer.observe(node);

        return () => observer.disconnect();
    }, [reduceMotion]);

    return (
        <Tag
            ref={ref}
            className={`ravu-scroll-reveal ${className}`}
            style={{ animationDelay: reduceMotion ? "0ms" : `${delay}s` }}
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
            <Link href={href} prefetch className={classes} {...props}>
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

/* ------------------------------------------------------------ ButtonRow */
/**
 * The one wrapper for groups of side-by-side buttons.
 * Stacks with a comfortable gap on mobile, then becomes a roomy row of
 * flexed buttons on larger screens. Use this instead of hand-rolling a
 * flex container so the rhythm stays identical across every page.
 */
export function ButtonRow({ children, className = "" }) {
    return (
        <div
            className={`flex flex-col items-stretch gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 ${className}`}
        >
            {children}
        </div>
    );
}

/* --------------------------------------------------------- GridBackdrop */
/**
 * The shared hero background: a soft mesh wash plus the RAVU grid.
 *
 * The grid is drawn twice — a quiet always-on layer, plus a brighter copy
 * that behaves like a WAVE travelling with the cursor:
 *
 *   - Moving fast whips the crest up (a bigger, brighter ripple).
 *   - Slowing down lets the crest sink back toward flat.
 *   - Stopping settles it flat entirely.
 *   - Where the cursor has already passed, the ripple collapses, so the
 *     grid behind the pointer flattens out and only the leading edge is up.
 *
 * The crest is a radial mask whose SIZE and OPACITY are the two animated
 * channels. Everything is written straight to CSS custom properties on the
 * element and reads are batched into a rAF, so pointer movement never
 * triggers a React render.
 *
 * Renders as a fragment of `absolute inset-0` layers, so it must be placed
 * inside a `relative` hero. It contributes no wrapper box of its own.
 *
 * Degrades cleanly: no pointer (touch), reduced motion, or JS failure all
 * leave the plain `ravu-grid` layer visible, so the background is never
 * worse than it was before this effect existed.
 */
export function GridBackdrop() {
    const reduceMotion = useReducedMotion();
    const glowRef = useRef(null);

    useEffect(() => {
        const glow = glowRef.current;
        if (!glow) return;

        // Respect the user's motion preference: leave the static grid.
        if (reduceMotion) return;

        // Touch / stylus-only devices have no moving cursor to track.
        if (typeof window.matchMedia === "function") {
            const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
            if (!fine.matches) return;
        }

        // --- Wave tuning -------------------------------------------------
        // Radius is in px; it is written as a CSS length so the mask can
        // interpolate it without us ever touching layout.
        const CREST_MIN = 95; // settled / flat ripple
        const CREST_MAX = 620; // fully whipped-up crest
        // A slow hand sweep (~520px/s) still reaches a full crest, so a
        // casual mouse move produces an obvious wave. Stepped down over time:
        // 2200 -> 700 -> 420 -> 520.
        const SPEED_FOR_MAX = 520; // px/s that counts as "fast"
        // Per-frame sink rate once the pointer stops feeding energy.
        // Kept high for a long visible trail (0.88 -> 0.93 -> 0.955 -> 0.945)
        // without leaving the crest hanging around after the cursor stops.
        const DECAY = 0.945;
        const EPSILON = 0.01; // below this, treat the wave as flat
        let frame = 0;
        let lastX = null;
        let lastY = null;
        let lastTime = 0;
        let energy = 0; // 0 = flat, 1 = full crest
        const setCrest = (value) => {
            energy = Math.max(0, Math.min(1, value));
            const radius = CREST_MIN + (CREST_MAX - CREST_MIN) * energy;
            glow.style.setProperty("--grid-r", `${radius.toFixed(1)}px`);
            // Opacity must NOT simply track energy 1:1 — that makes the
            // brightest moment also the smallest radius, so the crest only
            // ever appears as a faint dot mid-sweep. Hold it near full across
            // most of the travel, but still reach exactly 0 at rest so no
            // stationary blob is left parked on the grid.
            const strength =
                energy <= EPSILON ? 0 : Math.min(1, 0.3 + energy * 1.1);
            glow.style.setProperty("--grid-o", strength.toFixed(3));
            glow.dataset.active = energy > EPSILON ? "true" : "false";
        };

        let cachedRect = null;
        const updateRect = () => {
            if (glow) cachedRect = glow.getBoundingClientRect();
        };

        const onMove = (event) => {
            const rect = cachedRect || glow.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const now = event.timeStamp || performance.now();

            // Position is applied immediately (no rAF) — it must stay glued
            // to the cursor. Cheap: two custom-property writes, no layout.
            glow.style.setProperty(
                "--grid-x",
                `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(2)}%`,
            );
            glow.style.setProperty(
                "--grid-y",
                `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(2)}%`,
            );

            // Speed drives the crest height. Distance per unit time, in px/s.
            if (lastX !== null) {
                const dt = Math.max(1, now - lastTime);
                const dist = Math.hypot(event.clientX - lastX, event.clientY - lastY);
                const speed = (dist / dt) * 1000;
                const target = Math.min(1, speed / SPEED_FOR_MAX);
                // Rise instantly on acceleration, so the crest leads the cursor.
                // Decay is handled in the frame loop, which is what produces
                // the trailing settle behind the pointer.
                if (target > energy) setCrest(target);
            }

            lastX = event.clientX;
            lastY = event.clientY;
            lastTime = now;
        };

        // The decay loop is what makes it a wave rather than a spotlight:
        // once the pointer stops feeding it energy, the crest sinks to flat.
        const tick = () => {
            if (energy > EPSILON) {
                setCrest(energy * DECAY);
                frame = window.requestAnimationFrame(tick);
            } else {
                setCrest(0);
                frame = 0;
            }
        };

        const wake = () => {
            if (!frame) frame = window.requestAnimationFrame(tick);
        };

        const onEnter = (event) => {
            // Re-entering should not read as a huge jump from the last point.
            lastX = event.clientX;
            lastY = event.clientY;
            lastTime = event.timeStamp || performance.now();
        };

        const onLeave = () => {
            lastX = null;
            lastY = null;
            // Let the crest sink naturally instead of snapping off.
            wake();
        };

        const onMoveAndWake = (event) => {
            onMove(event);
            wake();
        };

        // Listen on the document, not the hero: the wave keeps tracking while
        // the cursor is over the hero's own children.
        document.addEventListener("pointermove", onMoveAndWake, { passive: true });
        document.addEventListener("pointerenter", onEnter, { passive: true });
        document.addEventListener("pointerleave", onLeave, { passive: true });
        window.addEventListener("blur", onLeave);

        return () => {
            if (frame) window.cancelAnimationFrame(frame);
            document.removeEventListener("pointermove", onMoveAndWake);
            document.removeEventListener("pointerenter", onEnter);
            document.removeEventListener("pointerleave", onLeave);
            window.removeEventListener("blur", onLeave);
        };
    }, [reduceMotion]);

    return (
        <>
            <div
                aria-hidden="true"
                className="ravu-mesh pointer-events-none absolute inset-0"
            />
            <div
                aria-hidden="true"
                className="ravu-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
            />
            <div
                ref={glowRef}
                aria-hidden="true"
                data-active="false"
                /* No [mask-image:...] utility here on purpose: the fade is
                   composed inside .ravu-grid-glow, and an arbitrary mask
                   utility would override the radial crest with equal
                   specificity. See the note in app.css. */
                className="ravu-grid-glow pointer-events-none absolute inset-0"
            />
        </>
    );
}

/* -------------------------------------------------------- useCursorWave */
/**
 * Shared engine behind the grid wave and the pattern wave.
 *
 * Attaches one set of document-level pointer listeners and writes the wave
 * state to CSS custom properties on `ref.current`:
 *
 *   --<prefix>-x / --<prefix>-y   crest position, as percentages
 *   --<prefix>-r                  crest radius, e.g. "320px"
 *   --<prefix>-o                  strength, 0..1 (0 = fully flat)
 *
 * `prefix` defaults to "grid"; the pattern uses "pattern".
 *
 * Speed drives the crest: fast movement whips it up, a rAF loop sinks it
 * back to flat once input stops. All reads happen after the listener has
 * already checked for the element, and no state is ever written through
 * React, so pointer movement cannot trigger a re-render.
 */
function useCursorWave(ref, prefix = "grid", tuning = {}) {
    const reduceMotion = useReducedMotion();
    const {
        crestMin = 95,
        crestMax = 620,
        speedForMax = 520,
        // Per-frame sink rate once the pointer stops feeding energy.
        // 0.945 lingered: measured opacity was still 0.33 a second after the
        // cursor stopped. 0.90 settles in roughly 350-400ms, which reads as
        // the wave passing through and flattening behind the cursor.
        decay = 0.9,
        epsilon = 0.01,
    } = tuning;

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Respect the user's motion preference.
        if (reduceMotion) return;

        // Touch / stylus-only devices have no moving cursor to track.
        if (typeof window.matchMedia === "function") {
            const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
            if (!fine.matches) return;
        }

        let frame = 0;
        let lastX = null;
        let lastY = null;
        let lastTime = 0;
        let energy = 0; // 0 = flat, 1 = full crest
        const setCrest = (value) => {
            energy = Math.max(0, Math.min(1, value));
            const radius = crestMin + (crestMax - crestMin) * energy;
            el.style.setProperty(`--${prefix}-r`, `${radius.toFixed(1)}px`);
            // Brightness must fall all the way to 0 as energy decays, or a
            // stationary patch is left parked on the surface and the whole
            // thing reads as static wallpaper rather than a passing wave.
            //
            // An earlier version used `0.3 + energy * 1.1` to keep the crest
            // punchy. That floor was the bug: measured after the cursor had
            // stopped, opacity was still 0.33 with a 217px radius a full
            // second later and never reached zero.
            //
            // A gentle curve here instead — sqrt lifts brightness early so the
            // crest still feels strong on the move, while still bottoming out
            // at exactly 0.
            const strength =
                energy <= epsilon ? 0 : Math.min(1, Math.sqrt(energy) * 1.15);
            el.style.setProperty(`--${prefix}-o`, strength.toFixed(3));
            el.dataset.active = energy > epsilon ? "true" : "false";
        };

        // The decay loop is what makes it a wave rather than a static glow.
        // Defined BEFORE onMove, which references it: these are `const` arrow
        // functions, so `tick` is in the temporal dead zone until this line
        // and referencing it earlier would throw at runtime.
        const tick = () => {
            if (energy > epsilon) {
                setCrest(energy * decay);
                frame = window.requestAnimationFrame(tick);
            } else {
                setCrest(0);
                frame = 0;
            }
        };

        let cachedRect = null;
        const updateRect = () => {
            if (el) cachedRect = el.getBoundingClientRect();
        };

        const onMove = (event) => {
            // Measure the layer itself; positioned to span its parent exactly.
            const rect = cachedRect || el.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const now = event.timeStamp || performance.now();

            el.style.setProperty(
                `--${prefix}-x`,
                `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(2)}%`,
            );
            el.style.setProperty(
                `--${prefix}-y`,
                `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(2)}%`,
            );

            // Speed drives the crest height, in px/s.
            if (lastX !== null) {
                const dt = Math.max(1, now - lastTime);
                const dist = Math.hypot(
                    event.clientX - lastX,
                    event.clientY - lastY,
                );
                const speed = (dist / dt) * 1000;
                const target = Math.min(1, speed / speedForMax);
                // Rise instantly so the crest leads the cursor; the frame loop
                // above handles the trailing settle behind it.
                if (target > energy) setCrest(target);
            }

            lastX = event.clientX;
            lastY = event.clientY;
            lastTime = now;
            if (!frame) frame = window.requestAnimationFrame(tick);
        };

        const onEnter = (event) => {
            updateRect();
            // Re-entering must not read as a huge jump from the last point.
            lastX = event.clientX;
            lastY = event.clientY;
            lastTime = event.timeStamp || performance.now();
        };

        const onLeave = () => {
            cachedRect = null;
            lastX = null;
            lastY = null;
            // Let the crest sink naturally instead of snapping off.
            if (!frame) frame = window.requestAnimationFrame(tick);
        };

        document.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerenter", onEnter, { passive: true });
        document.addEventListener("pointerleave", onLeave, { passive: true });
        window.addEventListener("scroll", updateRect, { passive: true });
        window.addEventListener("resize", updateRect);
        window.addEventListener("blur", onLeave);

        return () => {
            if (frame) window.cancelAnimationFrame(frame);
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerenter", onEnter);
            document.removeEventListener("pointerleave", onLeave);
            window.removeEventListener("scroll", updateRect);
            window.removeEventListener("resize", updateRect);
            window.removeEventListener("blur", onLeave);
        };
    }, [ref, prefix, reduceMotion, crestMin, crestMax, speedForMax, decay, epsilon]);
}

/* ------------------------------------------------------- PatternBackdrop */
/**
 * The diagonal chevron stripe motif, with the same cursor wave as the grid:
 * the lines flare up where the cursor passes and flatten behind it.
 *
 * Renders the resting pattern plus a brighter wave copy, as a fragment of
 * `absolute inset-0` layers — so it MUST be placed inside a `relative`
 * parent. Placing it as a sibling before an opaque positioned block lets
 * that block paint over it and the effect vanishes entirely.
 *
 * `tone` picks the surface: "dark" for the ink-950 bands and the footer,
 * "light" for white/muted sections.
 */
export function PatternBackdrop({ tone = "dark", className = "" }) {
    const waveRef = useRef(null);
    const isDark = tone === "dark";
    // Larger than the grid crest because these bands are full viewport height
    // (measured 1440x828 on the partner section) and the stripes sit 18px
    // apart versus a 64px grid, so a wider lustre has to travel further to
    // read as movement.
    //
    // 1150 was tried and was far too much: combined with a bright stripe
    // colour it lit nearly the whole section at once, which stops looking
    // like a wave and starts looking like striped wallpaper.
    useCursorWave(waveRef, "pattern", {
        crestMin: 200,
        crestMax: 780,
        speedForMax: 520,
        decay: 0.9,
    });

    return (
        <>
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 ${
                    isDark ? "ravu-pattern-dark" : "ravu-pattern"
                } ${className}`}
            />
            <div
                ref={waveRef}
                aria-hidden="true"
                data-active="false"
                /* No [mask-*] utility here on purpose — see app.css. */
                className={`pointer-events-none absolute inset-0 ${
                    isDark
                        ? "ravu-pattern-glow-dark"
                        : "ravu-pattern-glow-light"
                } ${className}`}
            />
        </>
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
            {pattern && <PatternBackdrop tone={isDark ? "dark" : "light"} />}
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
