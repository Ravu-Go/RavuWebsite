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
import { FeatureStrip, Hero } from "../../Components/sections";
import partnerHeroImg from "../../../imgs/memberPlusPartners.jpg";
import workshopImg from "../../../imgs/fundRepairShop.jpg";

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
            <Hero
                eyebrow="PARTNERS & BUSINESS"
                title="Build the mobility ecosystem"
                highlight="with RAVU."
                text="RAVU creates space for businesses, workshops, financial institutions and service providers to connect with the communities that keep Tanzania moving."
                primary={{ label: "Become a Partner", href: "/register" }}
                secondary={{ label: "Partner Sign In", href: "/login" }}
                media={partnerHeroImg}
                mediaAlt="RAVU partner welcoming a verified RAVU member"
                layout="split"
            />

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

            {/* ---------------------------------- EDITORIAL SPLIT (WORKSHOP) */}
            <section className="overflow-hidden border-t border-slate-100 bg-slate-50/50 py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-6">
                            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5">
                                <img
                                    src={workshopImg}
                                    alt="A RAVU partner repair shop serving riders"
                                    loading="lazy"
                                    decoding="async"
                                    className="aspect-[4/3] w-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                DESIGNED FOR REAL OPERATIONS
                            </p>
                            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                                Practical tools for{" "}
                                <span className="text-[#1864E8]">
                                    every partner location.
                                </span>
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                                Whether you operate a single workshop or a
                                nationwide network of service stations, RAVU
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
                                        className="flex items-start gap-3 text-sm text-slate-700"
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
                                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-slate-800 sm:text-sm"
                                >
                                    <span>Open Partner Portal</span>
                                    <ArrowRight size={15} />
                                </Link>
                                <Link
                                    href="/support"
                                    prefetch
                                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950 sm:text-sm"
                                >
                                    Contact Partnership Team
                                </Link>
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
                            A simple, practical process — no unnecessary
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
