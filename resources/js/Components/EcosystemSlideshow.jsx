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
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Modern, High-Performance Interactive Ecosystem Showcase.
 *
 * Clean, editorial studio design:
 * - Centered header hierarchy
 * - Interactive pill tabs with live auto-advance progress indicator
 * - 2-column responsive stage (vivid unhindered photography + crisp story card)
 * - Zero scroll lag (no scroll/mousemove listeners during page scroll)
 * - Touch swipe support for mobile
 */
export default function EcosystemSlideshow({
    eyebrow = "THE RAVU ECOSYSTEM IN MOTION",
    title = "Mobility, protection and savings —",
    highlight = "connected in one network.",
    description = "Swipe or click through how RAVU connects riders, Bajaj operators, private car owners, commercial fleets, insurers and garages across Tanzania.",
    slides = [],
    autoPlayMs = 6500,
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const reduceMotion = useReducedMotion();

    const touchStartX = useRef(null);
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

    // Autoplay timer
    useEffect(() => {
        if (isPaused || total <= 1 || !autoPlayMs) return undefined;
        const timer = window.setInterval(handleNext, autoPlayMs);
        return () => window.clearInterval(timer);
    }, [isPaused, total, autoPlayMs, handleNext]);

    // Touch swipe handlers
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(deltaX) > 45) {
            if (deltaX < 0) {
                handleNext();
            } else {
                handlePrev();
            }
        }
        touchStartX.current = null;
    };

    if (!total) return null;

    const currentSlide = slides[activeIndex] || slides[0];

    // Slide transition variants (crossfade with subtle horizontal drift)
    const imageVariants = {
        enter: (dir) => ({
            opacity: 0,
            scale: reduceMotion ? 1 : 1.04,
            x: reduceMotion ? 0 : dir > 0 ? 20 : -20,
        }),
        center: {
            opacity: 1,
            scale: 1,
            x: 0,
            transition: {
                duration: reduceMotion ? 0 : 0.45,
                ease: [0.25, 1, 0.5, 1],
            },
        },
        exit: (dir) => ({
            opacity: 0,
            scale: reduceMotion ? 1 : 0.98,
            x: reduceMotion ? 0 : dir > 0 ? -20 : 20,
            transition: {
                duration: reduceMotion ? 0 : 0.3,
                ease: [0.25, 1, 0.5, 1],
            },
        }),
    };

    const contentVariants = {
        enter: (dir) => ({
            opacity: 0,
            y: reduceMotion ? 0 : 12,
        }),
        center: {
            opacity: 1,
            y: 0,
            transition: {
                duration: reduceMotion ? 0 : 0.35,
                ease: "easeOut",
            },
        },
        exit: {
            opacity: 0,
            y: reduceMotion ? 0 : -8,
            transition: {
                duration: reduceMotion ? 0 : 0.2,
                ease: "easeIn",
            },
        },
    };

    return (
        <section
            className="relative w-full border-t border-slate-100 bg-[#FAFAFC] py-10 sm:py-14 lg:py-16"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
                {/* =========================================================
                    1. CENTERED HERO HEADER
                   ========================================================= */}
                <div className="mx-auto max-w-3xl text-center">
                    {eyebrow && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1864E8] shadow-2xs">
                            <Layers size={13} />
                            <span>{eyebrow}</span>
                        </span>
                    )}

                    <h2 className="mt-2.5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl lg:leading-[1.12]">
                        {title}{" "}
                        {highlight && (
                            <span className="text-[#1864E8]">{highlight}</span>
                        )}
                    </h2>

                    {description && (
                        <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                            {description}
                        </p>
                    )}
                </div>

                {/* =========================================================
                    2. INTERACTIVE PILL TABS WITH LIVE PROGRESS
                   ========================================================= */}
                <div className="mt-6 sm:mt-7">
                    <div
                        className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar"
                        role="tablist"
                        aria-label="Ecosystem pillars"
                    >
                        {slides.map((slide, idx) => {
                            const isActive = idx === activeIndex;
                            return (
                                <button
                                    key={slide.id || slide.title || idx}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => goTo(idx)}
                                    className={`group relative shrink-0 overflow-hidden rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                        isActive
                                            ? "border border-[#1864E8]/30 bg-white text-slate-950 shadow-sm ring-1 ring-[#1864E8]/20"
                                            : "border border-slate-200/80 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`inline-flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-black ${
                                                isActive
                                                    ? "bg-[#1864E8] text-white"
                                                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                                            }`}
                                        >
                                            0{idx + 1}
                                        </span>
                                        <span>
                                            {slide.tabLabel ||
                                                slide.title ||
                                                `Slide ${idx + 1}`}
                                        </span>
                                    </div>

                                    {/* Active Auto-Advance Progress Underline */}
                                    {isActive && (
                                        <motion.div
                                            key={`progress-${idx}-${isPaused}`}
                                            initial={{ scaleX: 0 }}
                                            animate={{
                                                scaleX: isPaused ? 0.4 : 1,
                                            }}
                                            transition={{
                                                duration: isPaused
                                                    ? 0.2
                                                    : (autoPlayMs || 6500) /
                                                      1000,
                                                ease: "linear",
                                            }}
                                            style={{ transformOrigin: "left" }}
                                            className="absolute inset-x-0 bottom-0 h-[2px] bg-[#1864E8]"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* =========================================================
                    3. MODERN 2-COLUMN SHOWCASE STAGE
                   ========================================================= */}
                <div
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="mt-5 overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-lg shadow-slate-900/5 transition-all"
                >
                    <div className="grid grid-cols-1 items-stretch lg:grid-cols-12">
                        {/* ----------------- LEFT COLUMN: STORY & ACTIONS (5 COLS) */}
                        <div className="flex flex-col justify-between p-5 sm:p-7 lg:col-span-5 lg:p-8 xl:p-9">
                            <div>
                                {/* Badges Header */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {currentSlide.badge && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-[11px] font-bold text-[#0B3B8C]">
                                            <Sparkles
                                                size={11}
                                                className="text-[#1864E8]"
                                            />
                                            <span>{currentSlide.badge}</span>
                                        </span>
                                    )}
                                    {currentSlide.caption && (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                                            {currentSlide.caption}
                                        </span>
                                    )}
                                </div>

                                {/* Animated Text Content */}
                                <AnimatePresence mode="wait" custom={direction}>
                                    <motion.div
                                        key={
                                            currentSlide.id ||
                                            currentSlide.title ||
                                            activeIndex
                                        }
                                        custom={direction}
                                        variants={contentVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className="mt-4"
                                    >
                                        {currentSlide.eyebrow && (
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1864E8]">
                                                {currentSlide.eyebrow}
                                            </p>
                                        )}

                                        <h3 className="mt-1.5 text-xl font-black leading-tight tracking-tight text-slate-950 sm:text-2xl">
                                            {currentSlide.title}
                                        </h3>

                                        <p className="mt-2.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                                            {currentSlide.description}
                                        </p>

                                        {currentSlide.bullets &&
                                            currentSlide.bullets.length > 0 && (
                                                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3.5">
                                                    {currentSlide.bullets.map(
                                                        (bullet) => (
                                                            <li
                                                                key={bullet}
                                                                className="flex items-start gap-2 text-xs font-medium text-slate-700"
                                                            >
                                                                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1864E8]">
                                                                    <Check
                                                                        size={
                                                                            11
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
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Bottom Actions & Slide Controls */}
                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                {currentSlide.ctaHref ? (
                                    <Link
                                        href={currentSlide.ctaHref}
                                        prefetch
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#1864E8] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#0B3B8C]"
                                    >
                                        <span>
                                            {currentSlide.ctaLabel ||
                                                "Explore More"}
                                        </span>
                                        <ArrowRight size={14} />
                                    </Link>
                                ) : (
                                    <span />
                                )}

                                {/* Compact Controls */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-500 mr-1">
                                        <span className="text-[#1864E8]">
                                            0{activeIndex + 1}
                                        </span>
                                        <span className="text-slate-300">
                                            {" "}
                                            /{" "}
                                        </span>
                                        <span>0{total}</span>
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setIsPaused((p) => !p)}
                                        aria-label={
                                            isPaused
                                                ? "Resume slideshow"
                                                : "Pause slideshow"
                                        }
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 cursor-pointer"
                                    >
                                        {isPaused ? (
                                            <Play size={12} />
                                        ) : (
                                            <Pause size={12} />
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handlePrev}
                                        aria-label="Previous slide"
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 cursor-pointer"
                                    >
                                        <ChevronLeft size={15} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        aria-label="Next slide"
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1864E8] text-white shadow-sm transition-colors hover:bg-[#0B3B8C] cursor-pointer"
                                    >
                                        <ChevronRight size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ----------------- RIGHT COLUMN: VIVID VISUAL STAGE (7 COLS) */}
                        <div className="relative min-h-[290px] sm:min-h-[360px] lg:col-span-7 lg:min-h-[420px] xl:min-h-[440px] bg-slate-950 overflow-hidden">
                            <AnimatePresence
                                initial={false}
                                custom={direction}
                                mode="sync"
                            >
                                <motion.div
                                    key={
                                        currentSlide.id ||
                                        currentSlide.image ||
                                        activeIndex
                                    }
                                    custom={direction}
                                    variants={imageVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="absolute inset-0 h-full w-full will-change-transform"
                                >
                                    <img
                                        src={currentSlide.image}
                                        alt={
                                            currentSlide.imageAlt ||
                                            currentSlide.title ||
                                            "RAVU Ecosystem"
                                        }
                                        decoding="async"
                                        className="h-full w-full object-cover object-center select-none"
                                    />
                                    {/* Gentle subtle bottom gradient for text contrast if needed */}
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Floating Visual Badge (Top Right) */}
                            <div className="absolute top-3.5 right-3.5 z-10">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-md">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Verified Ecosystem</span>
                                </span>
                            </div>

                            {/* Floating Caption Overlay (Bottom Left) */}
                            <div className="absolute bottom-3 inset-x-3 z-10 sm:bottom-4 sm:inset-x-4">
                                <div className="rounded-xl border border-white/20 bg-white/90 p-3 shadow-lg backdrop-blur-md sm:p-3.5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-[#1864E8]">
                                                {currentSlide.tabLabel ||
                                                    "RAVU Program"}
                                            </p>
                                            <p className="truncate text-xs font-bold text-slate-900">
                                                {currentSlide.title}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#1864E8] transition-colors cursor-pointer"
                                        >
                                            <span>Next</span>
                                            <ChevronRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
