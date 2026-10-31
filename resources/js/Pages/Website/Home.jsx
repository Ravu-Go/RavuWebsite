import { ShieldCheck, Users, Zap } from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import headerImg from "../../../imgs/Header.png";
import mapImg from "../../../imgs/map.png";
import footerBg from "../../../imgs/Footer.png";

/**
 * Reusable official store buttons for App Store & Google Play
 */
function StoreButtons({ className = "" }) {
    return (
        <div className={`flex flex-wrap items-center gap-3 ${className}`}>
            {/* Apple App Store */}
            <a
                href="#app-store"
                className="inline-flex items-center gap-2.5 rounded-lg bg-black px-3.5 py-2 text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
                <svg
                    viewBox="0 0 384 512"
                    className="h-5 w-5 fill-current shrink-0"
                    aria-hidden="true"
                >
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 62.3 26 139.7c15.6 44.5 44 95.3 84.7 95.7 32 .3 42.4-21.7 82.2-21.7 39.4 0 50.8 21.7 84 21.7 41.5-.4 68.9-46.7 84.2-91.2 17.6-51.1 24.8-100.8 25.1-103.3-1.2-.6-70.3-26.9-71.5-45.7zm-61.9-158.4c17.5-21.6 29.5-51.5 26.2-81.9-25.3 1.1-56.5 17.2-74.6 38.6-16 18.8-30.2 49-26.4 78.4 28.3 2.2 57.3-13.5 74.8-35.1z" />
                </svg>
                <div className="text-left leading-none">
                    <p className="text-[8px] font-medium uppercase tracking-wider text-slate-300">
                        Download on the
                    </p>
                    <p className="text-xs font-semibold tracking-tight text-white mt-0.5">
                        App Store
                    </p>
                </div>
            </a>

            {/* Google Play Store */}
            <a
                href="#google-play"
                className="inline-flex items-center gap-2.5 rounded-lg bg-black px-3.5 py-2 text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
                <svg
                    viewBox="0 0 512 512"
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                >
                    <path
                        fill="#00E676"
                        d="M32.8 19.3L275.6 262.1 213.9 323.8 16.5 37.8c-1.3 2.1-2 4.6-2 7.2v422c0 2.6.7 5.1 2 7.2L32.8 19.3z"
                    />
                    <path
                        fill="#FFD54F"
                        d="M352.3 338.8l-76.7-76.7L32.8 19.3C35.9 14.7 41.2 12 47 12c3.4 0 6.7.9 9.6 2.6l328.6 189.7-32.9 134.5z"
                    />
                    <path
                        fill="#FF3D00"
                        d="M56.6 497.4C53.7 499.1 50.4 500 47 500c-5.8 0-11.1-2.7-14.2-7.3l242.8-242.8 76.7 76.7L56.6 497.4z"
                    />
                    <path
                        fill="#00B0FF"
                        d="M495.6 238.2L385.2 174.5l-32.9 32.9 32.9 134.5 32.9-19 77.5-44.7c10.3-6 16.6-17.1 16.6-29 0-11.9-6.3-23-16.6-29z"
                    />
                </svg>
                <div className="text-left leading-none">
                    <p className="text-[8px] font-medium uppercase tracking-wider text-slate-300">
                        GET IT ON
                    </p>
                    <p className="text-xs font-semibold tracking-tight text-white mt-0.5">
                        Google Play
                    </p>
                </div>
            </a>
        </div>
    );
}

export default function Home() {
    return (
        <WebsiteLayout>
            {/* ---------------------------------------------------------- HERO */}
            <section className="relative overflow-hidden bg-white pt-12 pb-10 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16">
                <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
                    {/* Eyebrow */}
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        MOBILITY, CONNECTED
                    </p>

                    {/* Centered Headline */}
                    <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                        Move further{" "}
                        <span className="text-[#1864E8]">together.</span>
                    </h1>

                    {/* Centered Subhead */}
                    <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                        A smarter way to get around. Ride, share and access more
                        value — all in one app, across Tanzania.
                    </p>

                    {/* Centered App Store Buttons */}
                    <div className="mt-8 flex justify-center">
                        <StoreButtons />
                    </div>

                    {/* Centered Social Proof */}
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <div className="flex -space-x-2 overflow-hidden">
                            <img
                                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                                alt="Ravu community member"
                            />
                            <img
                                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                                alt="Ravu driver"
                            />
                            <img
                                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80"
                                alt="Ravu rider"
                            />
                        </div>
                        <p className="text-xs font-medium leading-tight text-slate-600">
                            People moving together across Tanzania
                        </p>
                    </div>

                    {/* Full-Width Showcase Stage for Header.png */}
                    <div className="relative mx-auto mt-12 max-w-6xl sm:mt-16">
                        <div className="relative overflow-hidden rounded-2xl bg-slate-50/60 shadow-lg border border-slate-100">
                            <img
                                src={headerImg}
                                alt="Ravu Ride-Sharing App Journey"
                                className="h-auto w-full object-contain select-none"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ------------------------------------------- 3 FEATURES STRIP */}
            <section className="border-t border-b border-slate-100 bg-white py-10 sm:py-14">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-y-0 sm:divide-x sm:divide-slate-200/80">
                        {/* Feature 1 */}
                        <div className="flex items-center gap-4 py-4 sm:py-0 sm:px-6 first:pl-0">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                <Zap size={20} className="fill-[#1864E8]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Get moving
                                </h3>
                                <p className="mt-0.5 max-w-[210px] text-xs leading-relaxed text-slate-500">
                                    Reliable rides, whenever you need them.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex items-center gap-4 py-4 sm:py-0 sm:px-6">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                <Users size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    More value
                                </h3>
                                <p className="mt-0.5 max-w-[210px] text-xs leading-relaxed text-slate-500">
                                    Exclusive member benefits and savings.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex items-center gap-4 py-4 sm:py-0 sm:px-6 last:pr-0">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Feel safe
                                </h3>
                                <p className="mt-0.5 max-w-[210px] text-xs leading-relaxed text-slate-500">
                                    Trusted drivers and a safer journey.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --------------------------------- THE RAVU APP (MAP SCREEN) */}
            <section className="overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                        {/* Map Phone Image on the Left */}
                        <div className="flex justify-center lg:col-span-6">
                            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
                                <img
                                    src={mapImg}
                                    alt="Ravu mobile app interface showing map and destination search"
                                    className="h-auto w-full select-none drop-shadow-xl"
                                />
                            </div>
                        </div>

                        {/* Text & Store Badges on the Right */}
                        <div className="lg:col-span-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                THE RAVU APP
                            </p>
                            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                                Your journey
                                <br />
                                <span className="text-[#1864E8]">
                                    in one app.
                                </span>
                            </h2>
                            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
                                Book rides, track your trip, access member
                                benefits, find nearby services and more — all in
                                one place.
                            </p>
                            <div className="mt-8">
                                <StoreButtons />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ----------------------- A GROWING COMMUNITY & STATS (CITY SKYLINE) */}
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
                            A GROWING COMMUNITY
                        </p>
                        <h2 className="mt-4 text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
                            More people.
                            <br />
                            Stronger communities.
                        </h2>
                        <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
                            RAVU connects riders, drivers, businesses and
                            communities to create more value and opportunities
                            across Tanzania.
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
        </WebsiteLayout>
    );
}
