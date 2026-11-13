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
    Hero,
} from "../../Components/sections";
import riderImage from "../../../imgs/rider.jpg";

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
            <Hero
                eyebrow="ABOUT RAVU"
                title="Mobility works better when its people are"
                highlight="connected."
                text="RAVU is building a membership-based mobility ecosystem around the riders, drivers, owners, partners and communities who keep movement happening across Tanzania."
                primary={{ label: "Partner With RAVU", href: "/partners" }}
                secondary={{ label: "Explore Membership", href: "/membership" }}
                media={riderImage}
                mediaAlt="RAVU rider in branded kit on a RAVU motorcycle"
                layout="split"
            />

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
                            economy — starting with the people at its centre.
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
                                everyone involved in it — the people who move,
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
