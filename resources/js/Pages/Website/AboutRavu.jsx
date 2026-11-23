import { Link } from "@inertiajs/react";
import {
    ArrowRight,
    Award,
    Check,
    Globe2,
    Lightbulb,
    Mail,
    MapPin,
    Quote,
    Share2,
    ShieldCheck,
    Target,
    UsersRound,
    Wrench,
} from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import {
    EcosystemSection,
    FeatureStrip,
} from "../../Components/sections";
import serviceHubImg from "../../../imgs/RAVU Riders at the Service Hub.jpg";

const VALUES = [
    {
        icon: ShieldCheck,
        title: "Trust & Protection",
        text: "Structured relationships that deliver real insurance, safety and financial security.",
    },
    {
        icon: UsersRound,
        title: "Aggregated Community Power",
        text: "Transforming a fragmented market into a single organized network with collective bargaining power.",
    },
    {
        icon: Share2,
        title: "Financial Inclusion",
        text: "Lowering daily operating costs so riders, drivers, families and fleets can prosper.",
    },
];

const PURPOSE_CARDS = [
    {
        icon: Globe2,
        title: "Our Vision",
        text: "To build Tanzania's most trusted mobility support ecosystem serving riders, drivers, private vehicle owners, transport operators and fleet owners.",
    },
    {
        icon: Target,
        title: "Our Mission",
        text: "Improve the lives of mobility professionals and vehicle owners through income opportunities, professional development, financial inclusion, safety solutions and essential services.",
    },
    {
        icon: Lightbulb,
        title: "Our Strategic Approach",
        text: "Aggregate a fragmented mobility sector into a verified, structured network — lowering customer acquisition costs for partners while delivering 20%–30% insurance and 10%–25% spare parts savings to members.",
    },
];

const LONG_TERM_PILLARS = [
    "Embedded insurance solutions & digital policy management inside the RAVU platform",
    "Official RAVU Service Centers & Official RAVU Spare Parts Suppliers nationwide",
    "Commercial Fleet Maintenance Programs & volume-based bulk spare-parts pricing",
    "National Roadside Assistance, Vehicle Inspection & Tire and Battery Programs",
    "Predictable Maintenance Subscription Packages & tier-based rider/driver rewards",
    "Family protection packages, health/life insurance & financial wellness initiatives",
];

export default function AboutRavu() {
    return (
        <WebsiteLayout>
            {/* ---------------------------------------------------------- HERO */}
            <section className="relative overflow-hidden bg-white">
                <div className="relative flex items-center lg:min-h-[560px] xl:min-h-[600px]">
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
                        <div className="absolute inset-y-0 left-0 w-44 xl:w-56 bg-gradient-to-r from-white via-white/85 to-transparent" />
                        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/40 to-transparent" />
                    </div>

                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 right-0 z-10 hidden h-36 w-36 overflow-hidden lg:block"
                    >
                        <div className="absolute -bottom-16 -right-16 h-36 w-56 -rotate-45 bg-[#1864E8] shadow-lg" />
                        <div className="absolute -bottom-20 -right-12 h-32 w-56 -rotate-45 bg-[#0B3B8C]" />
                    </div>

                    <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
                        <div className="max-w-xl lg:max-w-[540px]">
                            <span className="inline-flex items-center rounded-full bg-[#1246A8] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-2xs">
                                ABOUT RAVU LTD
                            </span>

                            <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-[#050B17] sm:text-5xl lg:text-[3.35rem]">
                                Mobility, opportunity,
                                <br />
                                protection and{" "}
                                <span className="text-[#1864E8]">
                                    prosperity.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-[17px]">
                                Based in Dar es Salaam, Tanzania, RAVU Ltd is
                                building a comprehensive membership ecosystem
                                that connects motorcycle (boda boda) riders,
                                Bajaj operators, private vehicle owners,
                                commercial fleets, trucks and buses with
                                exclusive insurance protection, genuine spare
                                parts and trusted mechanical garages.
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-3.5">
                                <Link
                                    href="/partners"
                                    prefetch
                                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#0B3B8C] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#00289a] active:scale-[0.98]"
                                >
                                    <span>Explore Strategic Partnerships</span>
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

                        <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-100 shadow-lg lg:hidden">
                            <img
                                src={serviceHubImg}
                                alt="RAVU riders at a local motorcycle workshop and service hub"
                                fetchPriority="high"
                                decoding="async"
                                className="h-auto w-full object-cover"
                            />
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
                            Rather than serving operators individually, RAVU
                            aggregates a fragmented market into a structured
                            network — creating measurable financial advantages
                            for members and scalable distribution for partner
                            organizations.
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

            {/* -------------------- LONG-TERM STRATEGIC VISION & LEADERSHIP */}
            <section className="border-t border-slate-100 bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1864E8]">
                                LONG-TERM STRATEGIC VISION
                            </p>
                            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                                Building Tanzania&apos;s most impactful{" "}
                                <span className="text-[#1864E8]">
                                    mobility protection &amp; service network.
                                </span>
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                                Starting with our 4–6 month Dar es Salaam pilot
                                program (200–500 initial members), RAVU is
                                expanding into a nationwide ecosystem of
                                accredited service centers, embedded protection
                                and financial inclusion.
                            </p>

                            <ul className="mt-6 space-y-3">
                                {LONG_TERM_PILLARS.map((point) => (
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
                        </div>

                        {/* Founder & CEO Executive Perspective Card */}
                        <div className="lg:col-span-6">
                            <div className="rounded-3xl bg-[#050B17] p-8 text-white shadow-xl sm:p-10">
                                <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-300">
                                    <Award size={13} />
                                    <span>Leadership &amp; Founder Vision</span>
                                </span>

                                <blockquote className="mt-6 space-y-4">
                                    <p className="text-lg font-bold leading-snug text-white sm:text-xl">
                                        &ldquo;Building a trusted ecosystem that
                                        delivers mobility, opportunity,
                                        protection, and prosperity for every
                                        rider.&rdquo;
                                    </p>
                                    <p className="text-sm leading-relaxed text-slate-300">
                                        &ldquo;We believe that affordable
                                        insurance and reliable vehicle
                                        maintenance are not only a commercial
                                        opportunity, but a social and economic
                                        necessity for the communities we serve.
                                        Together with our strategic partners, we
                                        are lowering operating costs, protecting
                                        families, and driving mobility forward
                                        across Tanzania.&rdquo;
                                    </p>
                                </blockquote>

                                <div className="mt-7 border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-base font-black text-white">
                                            Saleh Nyindo
                                        </p>
                                        <p className="text-xs font-semibold text-sky-300">
                                            Founder &amp; CEO, RAVU Ltd
                                        </p>
                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                            <MapPin size={12} />
                                            <span>Dar es Salaam, Tanzania</span>
                                            <span>•</span>
                                            <a
                                                href="mailto:nyindo@posteo.de"
                                                className="text-sky-300 hover:underline"
                                            >
                                                nyindo@posteo.de
                                            </a>
                                        </p>
                                    </div>

                                    <Link
                                        href="/partners"
                                        prefetch
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#1864E8] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0B3B8C] self-start sm:self-auto"
                                    >
                                        <span>View Partnership Proposals</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
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
