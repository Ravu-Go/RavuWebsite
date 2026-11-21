import { Link } from "@inertiajs/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    Check,
    ChevronLeft,
    ChevronRight,
    Layers,
    Pause,
    Play,
    Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/**
 * Full-Width Edge-to-Edge Parallax Image Slideshow for RAVU.
 *
 * Performance-engineered for zero scroll lag (120fps page scrolling):
 * - No `useScroll` or `mousemove` listeners running during page scroll
 * - No heavy `backdrop-filter: blur()` over animated full-bleed canvases
 * - Hardware-accelerated (`translate3d` / `scale`) multi-layer parallax
 *   runs strictly when transitioning between slides (background canvas,
 *   foreground story card, and 3D "Up Next" preview card move at distinct
 *   parallax velocities and depths).
 */
export default function EcosystemSlideshow({
    eyebrow = "THE RAVU ECOSYSTEM IN MOTION",
    title = "Mobility, protection and savings —",
    highlight = "connected in one network.",
    description = "Explore how riders, Bajaj operators, private vehicle owners, commercial fleets and official partners connect across Tanzania.",
    slides = [],
    autoPlayMs = 6000,
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const reduceMotion = useReducedMotion();

    const total = slides.length;

    const goTo = useCallback(
        (nextIdx) => {
            if (total <= 1) return;
            const normalized = ((nextIdx % total) + total) % total;
            if (normalized === activeIndex) return;
            setDirection(normalized > activeIndex ? 1 : -1);
            setActiveIndex(normalized);
        },
        [activeIndex, total],
    );

    const handleNext = useCallback(() => {
        if (total <= 1) return;
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % total);
    }, [total]);

    const handlePrev = useCallback(() => {
        if (total <= 1) return;
        setDirection(-1);
        setActiveIndex((prev) => (prev - 1 + total) % total);
    }, [total]);

    useEffect(() => {
        if (isPaused || total <= 1 || !autoPlayMs) return undefined;
        const timer = window.setInterval(handleNext, autoPlayMs);
        return () => window.clearInterval(timer);
    }, [isPaused, total, autoPlayMs, handleNext]);

    if (!total) return null;

    const currentSlide = slides[activeIndex] || slides[0];
    const nextIndex = (activeIndex + 1) % total;
    const nextSlide = slides[nextIndex] || slides[0];

    // Layer 1 (Deep Background): Wide parallax travel + subtle scale settle
    const bgParallaxVariants = {
        enter: (dir) => ({
            opacity: 0,
            scale: reduceMotion ? 1 : 1.09,
            x: reduceMotion ? 0 : dir > 0 ? "7%" : "-7%",
        }),
        center: {
            opacity: 1,
            scale: 1,
            x: "0%",
            transition: {
                duration: reduceMotion ? 0 : 0.7,
                ease: [0.22, 1, 0.36, 1],
            },
        },
        exit: (dir) => ({
            opacity: 0,
            scale: reduceMotion ? 1 : 1.03,
            x: reduceMotion ? 0 : dir > 0 ? "-5%" : "5%",
            transition: {
                duration: reduceMotion ? 0 : 0.5,
                ease: [0.22, 1, 0.36, 1],
            },
        }),
    };

    // Layer 2 (Foreground Story HUD): Faster counter-velocity parallax
    const hudParallaxVariants = {
        enter: (dir) => ({
            opacity: 0,
            x: reduceMotion ? 0 : dir > 0 ? 36 : -36,
        }),
        center: {
            opacity: 1,
            x: 0,
            transition: {
                duration: reduceMotion ? 0 : 0.48,
                delay: reduceMotion ? 0 : 0.05,
                ease: [0.22, 1, 0.36, 1],
            },
        },
        exit: (dir) => ({
            opacity: 0,
            x: reduceMotion ? 0 : dir > 0 ? -24 : 24,
            transition: {
                duration: reduceMotion ? 0 : 0.28,
                ease: [0.22, 1, 0.36, 1],
            },
        }),
    };

    return (
        <section className="relative w-full overflow-hidden border-t border-slate-100 bg-white pt-14 sm:pt-20">
            {/* ----------------------------------- WIDE FLUID HEADER BAR */}
            <div className="mx-auto w-full max-w-[1600px] px-5 pb-8 sm:px-10 sm:pb-10 lg:px-16">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div className="max-w-3xl">
                        {eyebrow && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#EBF3FE] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1864E8]">
                                <Layers size={13} />
                                <span>{eyebrow}</span>
                            </span>
                        )}
                        <h2 className="mt-3.5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.06]">
                            {title}{" "}
                            {highlight && (
                                <span className="text-[#1864E8]">
                                    {highlight}
                                </span>
                            )}
                        </h2>
                        {description && (
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Top Controls & Live Counter */}
                    <div className="flex items-center gap-3 self-start lg:self-auto">
                        <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs">
                            <span className="text-[#1864E8]">
                                0{activeIndex + 1}
                            </span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-400">0{total}</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsPaused((p) => !p)}
                            aria-label={
                                isPaused
                                    ? "Resume parallax slideshow"
                                    : "Pause parallax slideshow"
                            }
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 cursor-pointer"
                        >
                            {isPaused ? (
                                <Play size={16} />
                            ) : (
                                <Pause size={16} />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handlePrev}
                            aria-label="Previous slide"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 cursor-pointer"
                        >
                            <ChevronLeft size={19} />
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            aria-label="Next slide"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0B3B8C] text-white shadow-sm transition-colors hover:bg-[#00289a] cursor-pointer"
                        >
                            <ChevronRight size={19} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ----------------------------------- 100% FULL-WIDTH PARALLAX STAGE */}
            <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                style={{ contain: "layout paint" }}
                className="relative w-full overflow-hidden border-y border-slate-100 bg-white text-slate-950"
            >
                {/* Top Auto-Advance Progress Bar (GPU scaleX instead of layout width) */}
                <div className="absolute inset-x-0 top-0 z-30 h-1 bg-white/10">
                    <motion.div
                        key={`${activeIndex}-${isPaused}`}
                        initial={{ scaleX: 0 }}
                        animate={{
                            scaleX: isPaused ? 0.35 : 1,
                        }}
                        transition={{
                            duration: isPaused
                                ? 0.25
                                : (autoPlayMs || 6000) / 1000,
                            ease: "linear",
                        }}
                        style={{ transformOrigin: "left" }}
                        className="h-full w-full bg-gradient-to-r from-[#1864E8] via-sky-400 to-[#1864E8] will-change-transform"
                    />
                </div>

                {/* =======================================================
                    LAYER 1: FULL-BLEED PARALLAX PHOTOGRAPH CANVAS (100vw)
                   ======================================================= */}
                <div className="relative min-h-[560px] sm:min-h-[600px] lg:min-h-[650px] xl:min-h-[690px] w-full overflow-hidden flex flex-col justify-between">
                    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
                        <AnimatePresence
                            initial={false}
                            custom={direction}
                            mode="sync"
                        >
                            <motion.img
                                key={currentSlide.id || currentSlide.title}
                                src={currentSlide.image}
                                alt={
                                    currentSlide.imageAlt || currentSlide.title
                                }
                                custom={direction}
                                variants={bgParallaxVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                decoding="async"
                                className="absolute inset-0 h-full w-full object-cover object-center opacity-60 will-change-transform"
                            />
                        </AnimatePresence>
                    </div>

                    {/* Multi-Directional Editorial Scrims */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/95 via-white/65 to-white/20 lg:via-white/55 lg:to-white/10"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/35 via-transparent to-white/20"
                    />

                    {/* ===================================================
                        LAYER 2: TOP PARALLAX BADGES (WIDE FLUID)
                       =================================================== */}
                    <div className="relative z-20 mx-auto w-full max-w-[1600px] flex flex-wrap items-center justify-between gap-3 px-5 pt-7 sm:px-10 sm:pt-9 lg:px-16">
                        <div className="flex flex-wrap items-center gap-2.5">
                            {currentSlide.badge && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#0B3B8C] shadow-sm">
                                    <Sparkles
                                        size={13}
                                        className="text-[#1864E8]"
                                    />
                                    <span>{currentSlide.badge}</span>
                                </span>
                            )}
                            {currentSlide.caption && (
                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                                    {currentSlide.caption}
                                </span>
                            )}
                        </div>

                        <span className="rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 text-xs font-bold tracking-widest text-slate-600 shadow-sm">
                            SLIDE 0{activeIndex + 1} / 0{total}
                        </span>
                    </div>

                    {/* ===================================================
                        LAYER 3: FOREGROUND PARALLAX STORY CARD + PEEK CARD
                       =================================================== */}
                    <div className="relative z-20 mx-auto w-full max-w-[1600px] grid items-end gap-8 px-5 pb-10 pt-8 sm:px-10 sm:pb-12 lg:grid-cols-12 lg:items-center lg:px-16 lg:py-12">
                        {/* Left 7 Cols: Story HUD Card */}
                        <div className="lg:col-span-7 xl:col-span-6">
                            <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-7 shadow-xl shadow-slate-900/10 sm:p-9 lg:p-11">
                                <AnimatePresence
                                    mode="wait"
                                    initial={false}
                                    custom={direction}
                                >
                                    <motion.div
                                        key={
                                            currentSlide.id ||
                                            currentSlide.title
                                        }
                                        custom={direction}
                                        variants={hudParallaxVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className="will-change-transform"
                                    >
                                        {currentSlide.eyebrow && (
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1864E8]">
                                                {currentSlide.eyebrow}
                                            </p>
                                        )}

                                        <h3 className="mt-3 text-2xl font-black leading-[1.1] tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                                            {currentSlide.title}
                                        </h3>

                                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                                            {currentSlide.description}
                                        </p>

                                        {currentSlide.bullets &&
                                            currentSlide.bullets.length > 0 && (
                                                <ul className="mt-6 space-y-3 border-t border-slate-200 pt-5">
                                                    {currentSlide.bullets.map(
                                                        (bullet) => (
                                                            <li
                                                                key={bullet}
                                                                className="flex items-start gap-3 text-xs font-medium text-slate-700 sm:text-sm"
                                                            >
                                                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1864E8] text-white">
                                                                    <Check
                                                                        size={
                                                                            12
                                                                        }
                                                                        strokeWidth={
                                                                            3
                                                                        }
                                                                    />
                                                                </span>
                                                                <span>
                                                                    {bullet}
                                                                </span>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            )}

                                        <div className="mt-8 flex flex-wrap items-center gap-3.5 border-t border-slate-200 pt-6">
                                            {currentSlide.ctaHref && (
                                                <Link
                                                    href={currentSlide.ctaHref}
                                                    prefetch
                                                    className="inline-flex items-center gap-2 rounded-xl bg-[#1864E8] px-6 py-3.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-[#0B3B8C] sm:text-sm"
                                                >
                                                    <span>
                                                        {currentSlide.ctaLabel ||
                                                            "Explore More"}
                                                    </span>
                                                    <ArrowRight size={15} />
                                                </Link>
                                            )}

                                            <button
                                                type="button"
                                                onClick={handleNext}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 cursor-pointer sm:text-sm"
                                            >
                                                <span>
                                                    Next:{" "}
                                                    {nextSlide.tabLabel ||
                                                        nextSlide.title}
                                                </span>
                                                <ChevronRight size={15} />
                                            </button>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Right 5 Cols (Desktop): Floating Parallax "Up Next" Preview Window */}
                        {total > 1 && (
                            <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 justify-end">
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="group relative w-80 xl:w-96 overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-3.5 text-left shadow-xl shadow-slate-900/10 transition-transform duration-200 hover:-translate-y-1 hover:border-blue-300 cursor-pointer"
                                >
                                    <div className="relative h-44 xl:h-48 w-full overflow-hidden rounded-2xl bg-slate-900">
                                        <img
                                            src={nextSlide.image}
                                            alt={
                                                nextSlide.imageAlt ||
                                                nextSlide.title
                                            }
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                                        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#0B3B8C] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-200">
                                            Up Next • 0{nextIndex + 1}
                                        </span>
                                    </div>
                                    <div className="mt-3.5 px-1.5 pb-1.5">
                                        <p className="text-xs font-bold uppercase tracking-wider text-[#1864E8]">
                                            {nextSlide.tabLabel ||
                                                nextSlide.eyebrow}
                                        </p>
                                        <p className="mt-1 line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-[#1864E8] transition-colors">
                                            {nextSlide.title}
                                        </p>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* =======================================================
                    LAYER 4: FULL-WIDTH THUMBNAIL FILMSTRIP DOCK
                   ======================================================= */}
                <div className="relative z-20 border-t border-slate-200 bg-white">
                    <div className="mx-auto w-full max-w-[1600px] px-5 py-4 sm:px-10 lg:px-16">
                        <div
                            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
                            role="tablist"
                            aria-label="Parallax slideshow slides"
                        >
                            {slides.map((slide, idx) => {
                                const active = idx === activeIndex;
                                return (
                                    <button
                                        key={slide.id || slide.title}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => goTo(idx)}
                                        className={`group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border p-2.5 text-left transition-colors cursor-pointer ${
                                            active
                                                ? "border-blue-300 bg-blue-50"
                                                : "border-slate-200 bg-white opacity-80 hover:border-slate-300 hover:bg-slate-50 hover:opacity-100"
                                        }`}
                                    >
                                        {/* Mini Thumbnail Preview */}
                                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                            <img
                                                src={slide.image}
                                                alt=""
                                                loading="lazy"
                                                decoding="async"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={`text-[11px] font-black uppercase tracking-wider ${
                                                    active
                                                        ? "text-[#1864E8]"
                                                        : "text-slate-500"
                                                }`}
                                            >
                                                0{idx + 1}
                                            </p>
                                            <p className="truncate text-xs sm:text-sm font-bold text-slate-800">
                                                {slide.tabLabel || slide.title}
                                            </p>
                                        </div>

                                        {active && (
                                            <span
                                                aria-hidden="true"
                                                className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#1864E8]"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
