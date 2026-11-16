import {
    BadgeCheck,
    Building2,
    Smartphone,
    UsersRound,
} from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import {
    AppPromo,
    EcosystemSection,
    FeatureStrip,
    Hero,
} from "../../Components/sections";

const FLOW_PILLARS = [
    {
        icon: Smartphone,
        title: "1. Join via the app",
        text: "Riders and drivers register directly in the RAVU mobile app.",
    },
    {
        icon: BadgeCheck,
        title: "2. Get verified ID",
        text: "Receive your digital RAVU Member ID for instant recognition.",
    },
    {
        icon: Building2,
        title: "3. Unlock partner value",
        text: "Access discounts, workshops and services across the network.",
    },
];

const JOURNEY = [
    {
        title: "Discover RAVU",
        text: "Understand the membership ecosystem and how riders, drivers and partners connect.",
    },
    {
        title: "Register",
        text: "Sign up in the mobile app or share your interest online to join the network.",
    },
    {
        title: "Become a member",
        text: "Complete verification and activate your digital RAVU Member ID.",
    },
    {
        title: "Access the ecosystem",
        text: "Explore partner fuel stations, repair workshops and financial services.",
    },
    {
        title: "Participate",
        text: "Build connections through local mobility hubs and community initiatives.",
    },
    {
        title: "Grow with RAVU",
        text: "Move forward with lower operating costs and a stronger support network.",
    },
];

export default function HowItWorks() {
    return (
        <WebsiteLayout>
            {/* ---------------------------------------------------------- HERO */}
            <Hero
                eyebrow="HOW IT WORKS"
                title="A simple path into a"
                highlight="connected ecosystem."
                text="RAVU brings members, riders, partners and community together through one clear journey — discover, join, connect and grow."
                primary={{ label: "Explore Membership", href: "/membership" }}
                secondary={{ label: "Partner With RAVU", href: "/partners" }}
            />

            {/* ------------------------------------------- 3 PILLARS STRIP */}
            <FeatureStrip items={FLOW_PILLARS} />

            {/* --------------------------------------------------- THE JOURNEY */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            STEP BY STEP
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                            Discover. Join.{" "}
                            <span className="text-[#1864E8]">
                                Connect. Grow.
                            </span>
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            Six clear steps, each building on the last.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {JOURNEY.map((step, index) => (
                            <div
                                key={step.title}
                                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md sm:p-7"
                            >
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EBF3FE] text-xs font-black text-[#1864E8]">
                                    0{index + 1}
                                </span>
                                <h3 className="mt-5 text-base font-bold text-slate-950">
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

            {/* ---------------------------------------------- MEMBERS AT CENTRE */}
            <section className="border-t border-slate-100 bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            TWO SIDES OF ONE NETWORK
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                            Members at the centre.{" "}
                            <span className="text-[#1864E8]">
                                Partners all around.
                            </span>
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-2xs sm:p-8">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                <UsersRound size={20} />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-slate-950">
                                Members at the Centre
                            </h3>
                            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                                RAVU starts with people and connects the
                                services around them. Every part of the
                                ecosystem exists to serve the rider, driver and
                                commuter at the centre of it.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-2xs sm:p-8">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                <Building2 size={20} />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-slate-950">
                                Partners in the Ecosystem
                            </h3>
                            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                                Partners contribute relevant support, maintenance
                                discounts, fuel offers and financial
                                opportunities — making membership genuinely
                                valuable every single day.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <EcosystemSection />

            <AppPromo />

            <CommunitySection />
        </WebsiteLayout>
    );
}
