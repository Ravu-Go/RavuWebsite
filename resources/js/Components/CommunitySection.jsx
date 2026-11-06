import footerBg from "../../imgs/Footer.png";

/**
 * Shared Community & Stats skyline banner.
 * Placed directly above the footer across all marketing pages for visual consistency.
 */
export default function CommunitySection({
    eyebrow = "A GROWING COMMUNITY",
    title = (
        <>
            More people.
            <br />
            Stronger communities.
        </>
    ),
    text = "RAVU connects riders, drivers, businesses and communities to create more value and opportunities across Tanzania.",
}) {
    return (
        <section className="relative overflow-hidden bg-[#061023] py-20 text-white sm:py-28 lg:py-32">
            {/* Background image with skyline & blue ribbons */}
            <div className="pointer-events-none absolute inset-0">
                <img
                    src={footerBg}
                    alt=""
                    className="h-full w-full object-cover object-right-top"
                />
                {/* Gradient overlay to guarantee high-contrast readability on the left */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#061023]/95 via-[#061023]/75 to-transparent sm:via-[#061023]/50" />
            </div>

            <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
                <div className="max-w-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
                        {eyebrow}
                    </p>
                    <h2 className="mt-4 text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
                        {title}
                    </h2>
                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
                        {text}
                    </p>
                </div>

                {/* Stats Row */}
                <div className="mt-16 grid grid-cols-2 gap-8 border-t border-white/15 pt-10 sm:mt-20 sm:grid-cols-4 sm:gap-6">
                    <div className="sm:border-r sm:border-white/15 sm:pr-6">
                        <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            100K+
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-300 sm:text-sm">
                            Riders
                        </p>
                    </div>
                    <div className="sm:border-r sm:border-white/15 sm:pr-6">
                        <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            10K+
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-300 sm:text-sm">
                            Drivers
                        </p>
                    </div>
                    <div className="sm:border-r sm:border-white/15 sm:pr-6">
                        <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            50+
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-300 sm:text-sm">
                            Cities &amp; towns
                        </p>
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            100+
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-300 sm:text-sm">
                            Business partners
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

