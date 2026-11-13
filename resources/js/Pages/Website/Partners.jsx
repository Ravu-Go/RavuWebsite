import { Link } from "@inertiajs/react";
import {
    ArrowRight,
    BadgeCheck,
    Banknote,
    Building2,
    Check,
    Handshake,
    Landmark,
    ShieldCheck,
    Store,
    TrendingUp,
    Users,
    Wrench,
} from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import { FeatureStrip } from "../../Components/sections";
import partnerHeroImg from "../../../imgs/memberPlusPartners.jpg";
import workshopImg from "../../../imgs/fundRepairShop-.png";

const PARTNER_PILLARS = [
    {
        icon: Users,
        title: "Active member network",
        text: "Connect directly with verified riders, drivers and everyday commuters.",
    },
    {
        icon: BadgeCheck,
        title: "Simple verification",
        text: "Verify RAVU Member IDs quickly through the Partner Portal.",
    },
    {
        icon: TrendingUp,
        title: "Shared growth",
        text: "Deliver real value to members while growing repeat business.",
    },
];

const OPPORTUNITIES = [
    {
        icon: Store,
        title: "Mobility Businesses",
        text: "Fuel stations, spare part retailers and everyday merchants building relevant service connections around members.",
    },
    {
        icon: Banknote,
        title: "Financial Institutions",
        text: "Banks, microfinance and payment providers exploring responsible financial opportunities for operators.",
    },
    {
        icon: Wrench,
        title: "Service & Repair Workshops",
        text: "Trusted garages and mechanics supporting practical maintenance needs across the network.",
    },
    {
        icon: Building2,
        title: "Community Organisations",
        text: "Associations and local groups helping strengthen the communities that keep movement happening.",
    },
    {
        icon: Handshake,
        title: "Technology Partners",
        text: "Platform and digital infrastructure partners contributing to accessible, connected mobility experiences.",
    },
    {
        icon: Landmark,
        title: "Insurance & Protection",
        text: "Underwriters and protection providers developing practical coverage solutions for mobility users.",
    },
];

const PROCESS = [
    {
        title: "Connect",
        text: "Introduce your organisation and the everyday value or service it can bring to RAVU members.",
    },
    {
        title: "Explore fit",
        text: "Align on practical member benefits, locations and how your teams will verify and serve members.",
    },
    {
        title: "Build together",
        text: "Launch your offer across the RAVU ecosystem and track engagement through the Partner Portal.",
    },
];

export default function Partners() {
    return (
        <WebsiteLayout>
            {/* ---------------------------------------------------------- HERO */}
            <section className="relative overflow-hidden bg-white">
                <div className="relative lg:min-h-[560px] xl:min-h-[600px] flex items-center">
                    {/* Right-side blended background image on desktop */}
                    <div
                        aria-hidden="true"
                        className="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-[66%] xl:w-[64%] select-none pointer-events-none"
                    >
                        <img
                            src={partnerHeroImg}
                            alt="RAVU riders, fuel partners, service partners and businesses connecting"
                            fetchPriority="high"
                            decoding="async"
                            className="h-full w-full object-cover object-right"
                        />
                        {/* Smooth white gradient blend on the left seam */}
                        <div className="absolute inset-y-0 left-0 w-56 xl:w-72 bg-gradient-to-r from-white via-white/95 to-transparent" />
                        {/* Top-left subtle white mask so baked-in image text never shows through */}
                        <div className="absolute left-0 top-0 h-56 w-80 bg-gradient-to-br from-white via-white/90 to-transparent" />
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
                                PARTNERS &amp; BUSINESS
                            </span>

                            {/* Stacked Bold Headline */}
                            <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-[#050B17] sm:text-5xl lg:text-[3.35rem]">
                                People. Partners.
                                <br />
                                A stronger mobility
                                <br />
                                <span className="text-[#1864E8]">
                                    ecosystem.
                                </span>
                            </h1>

                            {/* Body Copy */}
                            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-[17px]">
                                RAVU creates space for businesses, workshops,
                                fuel stations, financial institutions and
                                service providers to connect with the verified
                                communities that keep Tanzania moving.
                            </p>

                            {/* Primary & Secondary Action Buttons */}
                            <div className="mt-7 flex flex-wrap items-center gap-3.5">
                                <Link
                                    href="/register"
                                    prefetch
                                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#0B3B8C] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#00289a] active:scale-[0.98]"
                                >
                                    <span>Become a Partner</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    href="/login"
                                    prefetch
                                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white/95 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-2xs transition-colors hover:border-slate-400 hover:bg-slate-50"
                                >
                                    Partner Portal Sign In
                                </Link>
                            </div>
                        </div>

                        {/* Mobile / Tablet Image Presentation */}
                        <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-100 shadow-lg lg:hidden">
                            <img
                                src={partnerHeroImg}
                                alt="RAVU riders, fuel partners, service partners and businesses connecting"
                                fetchPriority="high"
                                decoding="async"
                                className="h-auto w-full object-cover object-right"
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

            {/* ------------------------------------------- 3 PILLARS STRIP */}
            <FeatureStrip items={PARTNER_PILLARS} />

            {/* -------------------------------------------------- OPPORTUNITIES */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            PARTNERSHIP OPPORTUNITIES
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                            Relevant services,{" "}
                            <span className="text-[#1864E8]">
                                closer to members.
                            </span>
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            Partnership at RAVU is about adding genuine,
                            practical value to members while reaching an active,
                            engaged mobility community.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {OPPORTUNITIES.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.title}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md sm:p-7"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="mt-5 text-base font-bold text-slate-950">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        {item.text}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ---------------------------------- BLENDED BANNER (WORKSHOP) */}
            <section className="relative overflow-hidden border-t border-slate-100 bg-white">
                <div className="relative flex items-center lg:min-h-[560px] xl:min-h-[600px]">
                    {/* Right-side blended background image on desktop */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none hidden select-none lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-[64%] xl:w-[62%]"
                    >
                        <img
                            src={workshopImg}
                            alt="RAVU Workshop & Service mechanics repairing a member motorcycle"
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover object-center"
                        />
                        {/* Smooth white gradient blend on the left seam */}
                        <div className="absolute inset-y-0 left-0 w-48 xl:w-64 bg-gradient-to-r from-white via-white/90 to-transparent" />
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
                    <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-18 lg:px-10 lg:py-20">
                        <div className="max-w-xl lg:max-w-[540px]">
                            {/* Solid Royal Blue Pill Badge */}
                            <span className="inline-flex items-center rounded-full bg-[#1246A8] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-2xs">
                                DESIGNED FOR REAL OPERATIONS
                            </span>

                            {/* Stacked Bold Headline */}
                            <h2 className="mt-5 text-3xl font-black leading-[1.08] tracking-tight text-[#050B17] sm:text-4xl lg:text-[2.85rem]">
                                Practical tools for
                                <br />
                                every partner{" "}
                                <span className="text-[#1864E8]">
                                    location.
                                </span>
                            </h2>

                            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 sm:text-[17px]">
                                Whether you operate a single repair workshop or
                                a nationwide network of service stations, RAVU
                                makes it effortless to recognise members and
                                deliver benefits at the point of service.
                            </p>

                            <ul className="mt-6 space-y-3">
                                {[
                                    "Instant digital Member ID verification in the Partner Portal.",
                                    "Clear benefit terms and eligibility for your front-line staff.",
                                    "Direct visibility to thousands of riders and drivers in your area.",
                                ].map((point) => (
                                    <li
                                        key={point}
                                        className="flex items-start gap-3 text-sm font-medium text-slate-700"
                                    >
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                            <Check size={12} strokeWidth={3} />
                                        </span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8 flex flex-wrap items-center gap-3.5">
                                <Link
                                    href="/login"
                                    prefetch
                                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#0B3B8C] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#00289a] active:scale-[0.98]"
                                >
                                    <span>Open Partner Portal</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    href="/support"
                                    prefetch
                                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white/95 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-2xs transition-colors hover:border-slate-400 hover:bg-slate-50"
                                >
                                    Contact Partnership Team
                                </Link>
                            </div>
                        </div>

                        {/* Mobile / Tablet Image Presentation */}
                        <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-100 shadow-lg lg:hidden">
                            <img
                                src={workshopImg}
                                alt="RAVU Workshop & Service mechanics repairing a member motorcycle"
                                loading="lazy"
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

            {/* ------------------------------------------- HOW PARTNERSHIP WORKS */}
            <section
                id="process"
                className="border-t border-slate-100 bg-white py-16 sm:py-24"
            >
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            HOW PARTNERSHIP WORKS
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                            Start with{" "}
                            <span className="text-[#1864E8]">
                                shared purpose.
                            </span>
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            A simple, practical process  no unnecessary
                            complexity.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-3">
                        {PROCESS.map((step, index) => (
                            <div
                                key={step.title}
                                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-7"
                            >
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EBF3FE] text-xs font-black text-[#1864E8]">
                                    0{index + 1}
                                </span>
                                <h3 className="mt-5 text-lg font-bold text-slate-950">
                                    {step.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    {step.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CommunitySection />
        </WebsiteLayout>
    );
}
