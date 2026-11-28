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
                {/* Authentic Dar es Salaam coastal mobility & skyline photograph */}
                <img
                    src={resolveMedia(community.image)}
                    alt="Dar es Salaam mobility community"
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-center sm:object-[75%_center] lg:object-right"
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
                    {eyebrow && (
                        <p className="text-sm font-medium text-sky-300">{eyebrow}</p>
                    )}
                    <h2 className="mt-3 text-3xl font-bold leading-[1.06] tracking-[-0.03em] text-white text-balance sm:text-4xl lg:text-5xl">
                        <Lines text={community.title} />
                    </h2>
                    <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300 text-pretty sm:text-lg">
                        {text}
                    </p>
                </div>

                {/* Pilot facts. A solid panel (no backdrop blur: blurring over the
                    photo recomposites on every scroll frame) keeps the figures legible
                    over the bright half of the image. */}
                <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 sm:mt-14 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <div
                            key={keyFor(stat, index)}
                            className="flex flex-col-reverse justify-start gap-1.5 bg-[#08132A]/95 px-5 py-5 sm:px-8 sm:py-7"
                        >
                            <dt className="text-sm text-slate-300">{stat.label}</dt>
                            <dd className="whitespace-nowrap text-[1.7rem] font-semibold tracking-[-0.02em] text-white tabular-nums sm:text-4xl">
                                {stat.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
