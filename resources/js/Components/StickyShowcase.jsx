import { Link } from "@inertiajs/react";
import { ArrowRight, Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Scroll-driven showcase: the left column (heading, photo, card list) stays
 * pinned while the cards on the right scroll past. On desktop each card fills
 * one screen below the nav and scrolling snaps to it (see app.css), so one
 * card is in view at a time; the pinned photo and list follow it.
 *
 * Takes the same `slides` shape as EcosystemSlideshow (see toSlides), so the
 * CMS content for the section is unchanged. Below the lg breakpoint nothing is
 * pinned: each item shows its own photo above its text.
 */
export default function StickyShowcase({ eyebrow, title, description, slides = [] }) {
    const [active, setActive] = useState(0);
    const itemRefs = useRef([]);

    useEffect(() => {
        const nodes = itemRefs.current.filter(Boolean);
        if (!nodes.length || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActive(Number(entry.target.dataset.index));
                    }
                }
            },
            // A thin band across the middle of the viewport decides the active item.
            { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
        );
        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [slides.length]);

    const scrollTo = useCallback((index) => {
        const node = itemRefs.current[index];
        if (!node) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const top = node.getBoundingClientRect().top + window.scrollY;
        // Each card fills the screen below the 4.5rem nav; line its top up with the nav.
        const navHeight = parseFloat(getComputedStyle(document.documentElement).fontSize) * 4.5;
        window.scrollTo({ top: top - navHeight, behavior: reduce ? "auto" : "smooth" });
    }, []);

    if (!slides.length) return null;

    return (
        <section
            aria-labelledby="showcase-title"
            data-snap-section
            className="border-t border-slate-100 bg-[#F6F8FB]"
        >
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-0">
                <div className="lg:grid lg:grid-cols-12 lg:gap-14">
                    {/* ------------------------------------------------ PINNED */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-[4.5rem] lg:flex lg:h-[calc(100svh-4.5rem)] lg:flex-col lg:justify-center lg:py-8">
                            {eyebrow && (
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    {eyebrow}
                                </p>
                            )}
                            <h2
                                id="showcase-title"
                                className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 text-balance sm:text-4xl lg:text-[2.6rem] lg:leading-[1.06]"
                            >
                                {title}
                            </h2>
                            {description && (
                                <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600 lg:text-lg">
                                    {description}
                                </p>
                            )}

                            {/* Photo that follows the active card (desktop only) */}
                            <div className="relative mt-7 hidden h-[clamp(200px,34vh,400px)] overflow-hidden rounded-3xl bg-slate-200 lg:block">
                                {slides.map((slide, index) => (
                                    <img
                                        key={slide.id}
                                        src={slide.image}
                                        alt={index === active ? slide.imageAlt : ""}
                                        aria-hidden={index === active ? undefined : "true"}
                                        loading={index === 0 ? "eager" : "lazy"}
                                        decoding="async"
                                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${
                                            index === active ? "opacity-100" : "opacity-0"
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Card list: shows where you are, jumps on click (desktop only) */}
                            <nav aria-label={title} className="mt-6 hidden lg:block">
                                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                                    {slides.map((slide, index) => (
                                        <li key={slide.id}>
                                            <button
                                                type="button"
                                                onClick={() => scrollTo(index)}
                                                aria-current={index === active ? "true" : undefined}
                                                className={`border-b-2 pb-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1864E8] ${
                                                    index === active
                                                        ? "border-[#1864E8] text-slate-950"
                                                        : "border-transparent text-slate-500 hover:text-slate-800"
                                                }`}
                                            >
                                                {slide.tabLabel}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </div>

                    {/* ------------------------------------------------ CARDS: one per screen on desktop */}
                    <ol className="mt-10 space-y-6 lg:col-span-7 lg:mt-0 lg:space-y-0">
                        {slides.map((slide, index) => (
                            <li
                                key={slide.id}
                                ref={(node) => (itemRefs.current[index] = node)}
                                data-index={index}
                                className="lg:flex lg:h-[calc(100svh-4.5rem)] lg:snap-start lg:scroll-mt-[4.5rem] lg:items-center lg:py-8"
                            >
                                <article className="flex w-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                                    {/* Photo inside the card on small screens */}
                                    <div className="aspect-[16/10] bg-slate-200 lg:hidden">
                                        <img
                                            src={slide.image}
                                            alt={slide.imageAlt}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-1 flex-col p-6 sm:p-8 lg:p-11 xl:p-12">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <p className="text-sm font-semibold text-[#1864E8]">
                                                {slide.tabLabel}
                                            </p>
                                            {slide.badge && (
                                                <p className="rounded-full bg-[#EBF3FE] px-3.5 py-1.5 text-xs font-semibold text-[#00289A]">
                                                    {slide.badge}
                                                </p>
                                            )}
                                        </div>

                                        <h3 className="mt-4 max-w-xl text-2xl font-bold tracking-[-0.025em] text-slate-950 text-balance sm:text-3xl xl:text-[2.4rem] xl:leading-[1.1]">
                                            {slide.title}
                                        </h3>
                                        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 text-pretty lg:text-lg">
                                            {slide.description}
                                        </p>

                                        {slide.bullets?.length > 0 && (
                                            <ul className="mt-7 space-y-3.5 border-t border-slate-100 pt-7">
                                                {slide.bullets.map((bullet, bulletIndex) => (
                                                    <li
                                                        key={`${slide.id}-b${bulletIndex}`}
                                                        className="flex gap-3 text-[15px] leading-relaxed text-slate-700 lg:text-base"
                                                    >
                                                        <Check
                                                            size={18}
                                                            aria-hidden="true"
                                                            className="mt-[3px] shrink-0 text-[#1864E8]"
                                                        />
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {slide.ctaLabel && slide.ctaHref && (
                                            <Link
                                                href={slide.ctaHref}
                                                className="mt-8 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#00289A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1864E8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1864E8]"
                                            >
                                                {slide.ctaLabel}
                                                <ArrowRight size={16} aria-hidden="true" />
                                            </Link>
                                        )}
                                    </div>
                                </article>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
