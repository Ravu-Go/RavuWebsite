import {
    BadgeCheck,
    Banknote,
    HeartHandshake,
    ShieldCheck,
    Wrench,
    Zap,
} from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import { AppPromo, FeatureStrip, Hero } from "../../Components/sections";
import workshopImg from "../../../imgs/fundRepairShop.jpg";

const BENEFIT_PILLARS = [
    {
        icon: Zap,
        title: "Everyday savings",
        text: "Practical discounts on the services you use most on the road.",
    },
    {
        icon: ShieldCheck,
        title: "Trusted partners",
        text: "Vetted garages, stations and institutions across Tanzania.",
    },
    {
        icon: BadgeCheck,
        title: "Instant redemption",
        text: "Present your RAVU Member ID to access partner offers.",
    },
];

const BENEFIT_AREAS = [
    {
        icon: Banknote,
        title: "Savings & Financial Access",
        text: "Connect with responsible financial institutions, fuel savings and payment tools tailored to everyday mobility earnings.",
    },
    {
        icon: ShieldCheck,
        title: "Protection & Support",
        text: "Access a broader safety net around your work — from insurance partners to emergency and welfare support.",
    },
    {
        icon: Wrench,
        title: "Maintenance & Operations",
        text: "Keep moving with preferred rates on genuine spare parts, routine servicing and trusted repair workshops.",
    },
    {
        icon: HeartHandshake,
        title: "Community & Rewards",
        text: "Participate in a recognised membership community where loyalty and active participation unlock greater rewards.",
    },
];

export default function Benefits() {
    return (
        <WebsiteLayout>
            {/* ---------------------------------------------------------- HERO */}
            <Hero
                eyebrow="MEMBER BENEFITS"
                title="More support around"
                highlight="every mobility journey."
                text="RAVU connects members to practical benefits that reduce operating costs, protect their livelihood and help them grow."
                primary={{ label: "Explore Membership", href: "/membership" }}
                secondary={{ label: "Get the RAVU App", href: "/for-riders" }}
                media={workshopImg}
                mediaAlt="RAVU member accessing workshop maintenance benefits"
                layout="split"
            />

            {/* ------------------------------------------- 3 PILLARS STRIP */}
            <FeatureStrip items={BENEFIT_PILLARS} />

            {/* ------------------------------------------------ BENEFIT CARDS */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            MEMBER VALUE
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                            Benefits that{" "}
                            <span className="text-[#1864E8]">
                                work together.
                            </span>
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            Each part of the RAVU ecosystem supports the others.
                            As the partner network grows, the everyday value
                            available to members grows with it.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2">
                        {BENEFIT_AREAS.map((area) => {
                            const Icon = area.icon;
                            return (
                                <div
                                    key={area.title}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md sm:p-8"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="mt-5 text-lg font-bold text-slate-950">
                                        {area.title}
                                    </h3>
                                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                                        {area.text}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <AppPromo />

            <CommunitySection />
        </WebsiteLayout>
    );
}
