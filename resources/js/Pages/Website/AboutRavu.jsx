import { Link } from "@inertiajs/react";
import {
    ArrowRight,
    Check,
    Globe2,
    Lightbulb,
    Share2,
    ShieldCheck,
    Target,
    UsersRound,
} from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import {
    EcosystemSection,
    FeatureStrip,
} from "../../Components/sections";
import serviceHubImg from "../../../imgs/RAVU Riders at the Service Hub.png";

const VALUES = [
    {
        icon: ShieldCheck,
        title: "Trust",
        text: "Clear, responsible relationships at every point in the ecosystem.",
    },
    {
        icon: UsersRound,
        title: "Community",
        text: "Mobility is people first, and progress works better together.",
    },
    {
        icon: Share2,
        title: "Inclusion",
        text: "A platform designed to grow with the people who keep movement happening.",
    },
];

const PURPOSE_CARDS = [
    {
        icon: Globe2,
        title: "Our Vision",
        text: "A stronger, more connected mobility ecosystem across Tanzania where people can participate and grow.",
    },
    {
        icon: Target,
        title: "Our Mission",
        text: "Connect mobility communities with relevant support, trusted partner services and everyday opportunity.",
    },
    {
        icon: Lightbulb,
        title: "Our Approach",
        text: "Start with real mobility needs on the ground and build practical ecosystem connections around them.",
    },
];

export default function AboutRavu() {
    return (
        <WebsiteLayout>
            {/* ---------------------------------------------------------- HERO */}
            <section className="relative overflow-hidden bg-white">
                <div className="relative flex items-center lg:min-h-[560px] xl:min-h-[600px]">
                    {/* Right-side blended background image on desktop */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none hidden select-none lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-[64%] xl:w-[62%]"
                    >
                        <img
                            src={serviceHubImg}
                            alt="RAVU riders at a local motorcycle workshop and service hub"
                            fetchPriority="high"
                            decoding="async"
                            className="h-full w-full object-cover object-center"
                        />
                        {/* Smooth white gradient blend on the left seam */}
                        <div className="absolute inset-y-0 left-0 w-44 xl:w-56 bg-gradient-to-r from-white via-white/85 to-transparent" />
                        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/40 to-transparent" />
                    </div>

                    {/* Diagonal two-tone blue corner ribbon (bottom-right) */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 right-0 z-10 hidden h-36 w-36 overflow-hidden lg:block"
                    >
                        <div className="absolute -bottom-16 -right-16 h-36 w-56 -rotate-45 bg-[#1864E8] shadow-lg" />
                        <div className="absolute -bottom-20 -right-12 h-32 w-56 -rotate-45 bg-[#0B3B8C]" />
                    </div>

                    {/* Foreground Content Container */}
                    <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
                        <div className="max-w-xl lg:max-w-[540px]">
                            {/* Solid Royal Blue Pill Badge */}
                            <span className="inline-flex items-center rounded-full bg-[#1246A8] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-2xs">
                                ABOUT RAVU
                            </span>

                            {/* Stacked Bold Headline */}
                            <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-[#050B17] sm:text-5xl lg:text-[3.35rem]">
                                Mobility works better
                                <br />
                                when its people are{" "}
                                <span className="text-[#1864E8]">
                                    connected.
                                </span>
                            </h1>

                            {/* Body Copy */}
                            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-[17px]">
                                RAVU is building a membership-based mobility
                                ecosystem around the riders, drivers, owners,
                                partners and communities who keep movement
                                happening across Tanzania.
                            </p>

                            {/* Primary & Secondary Action Buttons */}
                            <div className="mt-7 flex flex-wrap items-center gap-3.5">
                                <Link
                                    href="/partners"
                                    prefetch
                                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#0B3B8C] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#00289a] active:scale-[0.98]"
                                >
                                    <span>Partner With RAVU</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    href="/membership"
                                    prefetch
                                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white/95 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-2xs transition-colors hover:border-slate-400 hover:bg-slate-50"
                                >
                                    Explore Membership
                                </Link>
                            </div>
                        </div>

                        {/* Mobile / Tablet Image Presentation */}
                        <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-100 shadow-lg lg:hidden">
                            <img
                                src={serviceHubImg}
                                alt="RAVU riders at a local motorcycle workshop and service hub"
                                fetchPriority="high"
                                decoding="async"
                                className="h-auto w-full object-cover"
                            />
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute bottom-0 right-0 h-20 w-20 overflow-hidden"
                            >
                                <div className="absolute -bottom-10 -right-10 h-20 w-32 -rotate-45 bg-[#1864E8]" />
                                <div className="absolute -bottom-12 -right-8 h-16 w-32 -rotate-45 bg-[#0B3B8C]" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ------------------------------------------- 3 VALUES STRIP */}
            <FeatureStrip items={VALUES} />

            {/* ------------------------------------------------------- PURPOSE */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            OUR PURPOSE
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                            Opportunity and support,{" "}
                            <span className="text-[#1864E8]">
                                closer to the road.
                            </span>
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            RAVU brings connected services, trusted
                            relationships and practical progress to the mobility
                            economy starting with the people at its centre.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-3">
                        {PURPOSE_CARDS.map((card) => {
                            const Icon = card.icon;
                            return (
                                <div
                                    key={card.title}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md sm:p-7"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="mt-5 text-lg font-bold text-slate-950">
                                        {card.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        {card.text}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ------------------------------------------------------ WHO RAVU IS */}
            <section className="border-t border-slate-100 bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                WHO RAVU IS
                            </p>
                            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                                A mobility ecosystem,{" "}
                                <span className="text-[#1864E8]">
                                    not just an app.
                                </span>
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                                RAVU exists to make mobility work better for
                                everyone involved in it the people who move,
                                the businesses they move between and the
                                services that support them.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3.5">
                                <Link
                                    href="/how-it-works"
                                    prefetch
                                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-slate-800 sm:text-sm"
                                >
                                    <span>See How It Works</span>
                                    <ArrowRight size={15} />
                                </Link>
                                <Link
                                    href="/for-riders"
                                    prefetch
                                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950 sm:text-sm"
                                >
                                    For Riders &amp; Drivers
                                </Link>
                            </div>
                        </div>

                        <div className="lg:col-span-6">
                            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-7 sm:p-9">
                                <ul className="space-y-4">
                                    {[
                                        "A membership ecosystem connecting people, businesses, services and technology.",
                                        "Built around real everyday mobility needs, not abstract technology.",
                                        "Designed to grow alongside the local communities it serves.",
                                        "Open to vetted partners who add genuine, measurable value to members.",
                                    ].map((point) => (
                                        <li
                                            key={point}
                                            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-2xs"
                                        >
                                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                                <Check
                                                    size={12}
                                                    strokeWidth={3}
                                                />
                                            </span>
                                            <span className="text-sm font-medium text-slate-800">
                                                {point}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------- ECOSYSTEM */}
            <EcosystemSection />

            <CommunitySection />
        </WebsiteLayout>
    );
}
