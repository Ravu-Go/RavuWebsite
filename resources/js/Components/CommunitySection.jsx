import { keyFor, Lines, resolveMedia, useSiteContent } from "../content";

/**
 * Shared Community & Stats skyline banner.
 * Placed directly above the footer across all marketing pages for visual consistency.
 *
 * Optimized with high-contrast text scrim on the left and full-vibrancy
 * illuminated Dar es Salaam city skyline & neon blue ribbons on the right.
 */
export default function CommunitySection() {
    const { community } = useSiteContent("global");
    const { eyebrow, text, stats } = community;
    return (
        <section className="relative overflow-hidden bg-[#061023] py-20 text-white sm:py-24 lg:py-28">
            {/* Background image stage */}
            <div className="pointer-events-none absolute inset-0 select-none">
                {/* Skyline & illuminated ribbons image */}
                <img
                    src={resolveMedia(community.image)}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-bottom sm:object-[80%_bottom] lg:object-right-bottom"
                />

                {/* Left scrim: darkens only the area behind the text, keeping the city lights and blue ribbons crystal clear */}
                <div className="absolute inset-y-0 left-0 w-full sm:w-4/5 lg:w-3/5 bg-gradient-to-r from-[#061023] via-[#061023]/90 to-transparent" />

                {/* Ambient royal blue glow echoing the neon ribbons */}
                {/* Radial glow (no filter: blur — filter:blur() over a large
                    area forces expensive repaints on every scroll frame). */}
                <div
                    aria-hidden="true"
                    className="absolute -right-12 top-1/4 h-[560px] w-[560px] pointer-events-none bg-[radial-gradient(circle,rgba(0,40,154,0.35)_0%,rgba(0,40,154,0.12)_45%,transparent_70%)]"
                />

                {/* Top edge subtle blend */}
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#061023] to-transparent" />

                {/* Bottom edge seamless blend into Footer (#050B17) */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050B17] via-[#050B17]/60 to-transparent" />
            </div>

            <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                {/* Headline & intro copy */}
                <div className="max-w-xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300 backdrop-blur-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                        <span>{eyebrow}</span>
                    </span>

                    <h2 className="mt-5 text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl">
                        <Lines text={community.title} />
                    </h2>

                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
                        {text}
                    </p>
                </div>

                {/* High-visibility Glassmorphic Stats Strip */}
                {/* Opaque glass look without backdrop-filter: backdrop-blur()
                    over the skyline image recomposites every scroll frame and
                    was the main source of scroll jank on this section. */}
                <div className="mt-14 sm:mt-16 rounded-2xl border border-white/10 bg-[#0B1220]/90 p-6 shadow-2xl shadow-black/40 sm:p-8">
                    <div className="grid grid-cols-2 gap-8 divide-y divide-white/10 sm:grid-cols-4 sm:gap-6 sm:divide-y-0 sm:divide-x sm:divide-white/10">
                        {stats.map((stat, index) => (
                            <div
                                key={keyFor(stat, index)}
                                className={
                                    index === 0
                                        ? "sm:pr-6"
                                        : index === stats.length - 1
                                          ? "pt-6 sm:pt-0 sm:pl-6"
                                          : "pt-6 sm:pt-0 sm:px-6"
                                }
                            >
                                <p className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                                    {stat.value}
                                </p>
                                <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-sky-300">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
