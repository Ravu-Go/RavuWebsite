import { Link } from "@inertiajs/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    Check,
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/**
 * Rich interactive slideshow / carousel showcasing RAVU ecosystem segments,
 * strategic partnership programs (Insurance 20–30% OFF, Spare Parts 10–25% OFF,
 * Garage Services 5–20% OFF), and multi-vehicle mobility categories.
 */
export default function EcosystemSlideshow({
    eyebrow = "ECOSYSTEM SHOWCASE",
    title = "See the RAVU ecosystem",
    highlight = "in motion.",
    description = "Explore how riders, Bajaj operators, private vehicle owners, commercial fleets and official partners connect across Tanzania.",
    slides = [],
    autoPlayMs = 5500,
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

    return (
        <section
            className="border-t border-slate-100 bg-white py-16 sm:py-24 overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                {/* Header & Controls */}
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div className="max-w-2xl">
                        {eyebrow && (
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1864E8]">
                                {eyebrow}
                            </p>
                        )}
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                            {title}{" "}
                            {highlight && (
                                <span className="text-[#1864E8]">
                                    {highlight}
                                </span>
                            )}
                        </h2>
                        {description && (
                            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Prev / Pause / Next Controls */}
                    <div className="flex items-center gap-2.5 self-start md:self-auto">
                        <button
                            type="button"
                            onClick={() => setIsPaused((p) => !p)}
                            aria-label={
                                isPaused
                                    ? "Resume slideshow"
                                    : "Pause slideshow"
                            }
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 cursor-pointer"
                        >
                            {isPaused ? (
                                <Play size={15} />
                            ) : (
                                <Pause size={15} />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handlePrev}
                            aria-label="Previous slide"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 cursor-pointer"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            aria-label="Next slide"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0B3B8C] text-white shadow-xs transition-colors hover:bg-[#00289a] cursor-pointer"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Quick Category Pill Selector */}
                <div
                    className="mt-8 flex flex-wrap items-center gap-2"
                    role="tablist"
                    aria-label="Slideshow topics"
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
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                                    active
                                        ? "bg-[#0B3B8C] text-white shadow-xs"
                                        : "border border-slate-200 bg-slate-50/80 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-950"
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        active ? "bg-sky-300" : "bg-slate-300"
                                    }`}
                                />
                                <span>{slide.tabLabel || slide.title}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Slide Stage */}
                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-950 text-white shadow-xl">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={currentSlide.id || currentSlide.title}
                            initial={
                                reduceMotion
                                    ? { opacity: 1 }
                                    : { opacity: 0, x: direction * 28 }
                            }
                            animate={{ opacity: 1, x: 0 }}
                            exit={
                                reduceMotion
                                    ? { opacity: 1 }
                                    : { opacity: 0, x: direction * -28 }
                            }
                            transition={{
                                duration: reduceMotion ? 0 : 0.28,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="grid lg:grid-cols-12"
                        >
                            {/* Image Stage (Left/Top 7 Cols) */}
                            <div className="relative min-h-[280px] sm:min-h-[360px] lg:col-span-7 lg:min-h-[460px] overflow-hidden bg-slate-900">
                                <img
                                    src={currentSlide.image}
                                    alt={
                                        currentSlide.imageAlt ||
                                        currentSlide.title
                                    }
                                    loading="eager"
                                    decoding="async"
                                    className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                                />
                                {/* Subtle gradient overlay */}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-slate-950/90" />

                                {/* Floating Top-Left Discount / Program Badge */}
                                {currentSlide.badge && (
                                    <div className="absolute left-5 top-5 z-10">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#0B3B8C]/90 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-md">
                                            <span>{currentSlide.badge}</span>
                                        </span>
                                    </div>
                                )}

                                {/* Bottom-Left Slide Counter Pill */}
                                <div className="absolute bottom-4 left-5 z-10 flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[11px] font-semibold text-slate-200 backdrop-blur-md">
                                    <span>
                                        0{activeIndex + 1} / 0{total}
                                    </span>
                                    {currentSlide.caption && (
                                        <>
                                            <span className="text-slate-400">
                                                •
                                            </span>
                                            <span className="text-sky-300">
                                                {currentSlide.caption}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Content Column (Right 5 Cols) */}
                            <div className="flex flex-col justify-between p-7 sm:p-9 lg:col-span-5 lg:p-10 bg-gradient-to-br from-[#050B17] via-[#071226] to-[#0B245B]">
                                <div>
                                    {currentSlide.eyebrow && (
                                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">
                                            {currentSlide.eyebrow}
                                        </p>
                                    )}
                                    <h3 className="mt-2.5 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                                        {currentSlide.title}
                                    </h3>
                                    <p className="mt-3.5 text-sm leading-relaxed text-slate-300">
                                        {currentSlide.description}
                                    </p>

                                    {currentSlide.bullets &&
                                        currentSlide.bullets.length > 0 && (
                                            <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
                                                {currentSlide.bullets.map(
                                                    (bullet) => (
                                                        <li
                                                            key={bullet}
                                                            className="flex items-start gap-2.5 text-xs font-medium text-slate-200 sm:text-[13px]"
                                                        >
                                                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-400/20 text-sky-300">
                                                                <Check
                                                                    size={11}
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
                                </div>

                                {/* Slide Footer Actions & Progress Dots */}
                                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                                    {currentSlide.ctaHref ? (
                                        <Link
                                            href={currentSlide.ctaHref}
                                            prefetch
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#1864E8] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#0B3B8C]"
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

                                    <div className="flex items-center gap-1.5">
                                        {slides.map((s, idx) => (
                                            <button
                                                key={s.id || s.title}
                                                type="button"
                                                onClick={() => goTo(idx)}
                                                aria-label={`Go to slide ${idx + 1}`}
                                                className={`h-2 rounded-full transition-all cursor-pointer ${
                                                    idx === activeIndex
                                                        ? "w-7 bg-sky-400"
                                                        : "w-2 bg-white/25 hover:bg-white/50"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
