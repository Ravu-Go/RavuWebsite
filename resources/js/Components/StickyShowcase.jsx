import { Link } from "@inertiajs/react";
import { ArrowRight, Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Scroll-driven showcase: the left column (heading, photo, item list) stays
 * pinned while the items on the right scroll past. The item nearest the middle
 * of the viewport becomes active, and the pinned photo and list follow it.
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
        // Land the item's heading near the middle band so it becomes active.
        window.scrollTo({ top: top - window.innerHeight * 0.3, behavior: reduce ? "auto" : "smooth" });
    }, []);

    if (!slides.length) return null;
    const current = slides[active] ?? slides[0];

    return (
        <section
            aria-labelledby="showcase-title"
            className="border-t border-slate-100 bg-[#F6F8FB]"
        >
            <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
                <div className="lg:grid lg:grid-cols-12 lg:gap-16">
                    {/* ------------------------------------------------ PINNED */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-28">
                            {eyebrow && (
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    {eyebrow}
                                </p>
                            )}
                            <h2
                                id="showcase-title"
                                className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
                            >
                                {title}
                            </h2>
                            {description && (
                                <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
                                    {description}
                                </p>
                            )}

                            {/* Photo that follows the active item (desktop only) */}
                            <div className="relative mt-8 hidden h-[clamp(200px,32vh,380px)] overflow-hidden rounded-3xl bg-slate-200 lg:block">
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
                                {current.badge && (
                                    <p className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-slate-900 shadow-sm">
                                        {current.badge}
                                    </p>
                                )}
                            </div>

                            {/* Item list: shows where you are, jumps on click (desktop only) */}
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

                    {/* ------------------------------------------------ SCROLLING */}
                    <ol className="mt-12 lg:col-span-7 lg:mt-0">
                        {slides.map((slide, index) => (
                            <li
                                key={slide.id}
                                ref={(node) => (itemRefs.current[index] = node)}
                                data-index={index}
                                className={`border-slate-200 py-10 first:pt-0 lg:flex lg:min-h-[58vh] lg:flex-col lg:justify-center lg:py-14 lg:first:pt-6 ${
                                    index > 0 ? "border-t" : ""
                                }`}
                            >
                                {/* Inline photo on small screens */}
                                <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-2xl bg-slate-200 lg:hidden">
                                    <img
                                        src={slide.image}
                                        alt={slide.imageAlt}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-full w-full object-cover"
                                    />
                                    {slide.badge && (
                                        <p className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                                            {slide.badge}
                                        </p>
                                    )}
                                </div>

                                <p className="text-sm font-semibold text-[#1864E8]">
                                    {slide.tabLabel}
                                </p>
                                <h3
                                    className={`mt-2 max-w-xl text-2xl font-bold tracking-tight sm:text-3xl transition-colors duration-300 motion-reduce:transition-none ${
                                        index === active ? "text-slate-950" : "text-slate-950 lg:text-slate-400"
                                    }`}
                                >
                                    {slide.title}
                                </h3>
                                <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                                    {slide.description}
                                </p>
                                {slide.bullets?.length > 0 && (
                                    <ul className="mt-6 max-w-xl space-y-3">
                                        {slide.bullets.map((bullet, bulletIndex) => (
                                            <li
                                                key={`${slide.id}-b${bulletIndex}`}
                                                className="flex gap-3 text-sm leading-relaxed text-slate-700"
                                            >
                                                <Check
                                                    size={18}
                                                    aria-hidden="true"
                                                    className="mt-0.5 shrink-0 text-[#1864E8]"
                                                />
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {slide.ctaLabel && slide.ctaHref && (
                                    <Link
                                        href={slide.ctaHref}
                                        className="mt-8 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[#00289A] hover:text-[#1864E8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1864E8]"
                                    >
                                        {slide.ctaLabel}
                                        <ArrowRight size={16} aria-hidden="true" />
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
