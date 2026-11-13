import { Link } from "@inertiajs/react";
import {
    ArrowRight,
    BadgeCheck,
    Check,
    CreditCard,
    ShieldCheck,
    UsersRound,
} from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import { FeatureStrip, Hero } from "../../Components/sections";
import riderIdImage from "../../../imgs/ravuRiderID.jpg";

const MEMBERSHIP_PILLARS = [
    {
        icon: CreditCard,
        title: "Verified Member ID",
        text: "One recognised identity connecting you to the RAVU ecosystem.",
    },
    {
        icon: BadgeCheck,
        title: "Partner privileges",
        text: "Unlock everyday savings across workshops, fuel and services.",
    },
    {
        icon: UsersRound,
        title: "Growing network",
        text: "Built to expand with more benefits as the community grows.",
    },
];

const MEANING = [
    "Access to relevant partner benefits and discounts as they become available.",
    "Direct connection to verified workshops, fuel stations and service providers.",
    "A recognised mobility identity built around trust and participation.",
    "Continuous progress and new opportunities within a growing ecosystem.",
];

const JOURNEY = [
    {
        title: "Register",
        text: "Share your interest in joining RAVU or sign up in the mobile app.",
    },
    {
        title: "Apply",
        text: "Complete the streamlined membership onboarding process.",
    },
    {
        title: "Verification",
        text: "Receive your verified RAVU Member ID and clear guidance.",
    },
    {
        title: "Participate",
        text: "Connect with fellow riders, drivers and community hubs.",
    },
    {
        title: "Access benefits",
        text: "Redeem partner offers and practical operational support.",
    },
    {
        title: "Grow",
        text: "Move forward with a stronger, connected mobility network.",
    },
];

export default function Membership() {
    return (
        <WebsiteLayout>
            {/* ------------------------------------------------------------ HERO */}
            <Hero
                eyebrow="RAVU MEMBERSHIP"
                title="Membership that"
                highlight="moves with you."
                text="A RAVU membership connects you to a growing ecosystem of support, partner benefits and community built around your everyday mobility journey."
                primary={{ label: "Register Interest", href: "/register" }}
                secondary={{ label: "See Member Benefits", href: "/benefits" }}
                media={riderIdImage}
                mediaAlt="Example RAVU Rider Member ID card"
                layout="split"
            />

            {/* ------------------------------------------- 3 PILLARS STRIP */}
            <FeatureStrip items={MEMBERSHIP_PILLARS} />

            {/* -------------------------------------------------- WHAT IT MEANS */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                WHAT IT MEANS
                            </p>
                            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                                Your place in{" "}
                                <span className="text-[#1864E8]">
                                    the ecosystem.
                                </span>
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                                Membership is designed for people who want to
                                participate in a stronger mobility community —
                                and benefit from it every day as the ecosystem
                                develops.
                            </p>

                            <ul className="mt-6 space-y-3.5">
                                {MEANING.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-3 text-sm text-slate-700"
                                    >
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                            <Check size={12} strokeWidth={3} />
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid gap-5 lg:col-span-6">
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-7">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                    <CreditCard size={20} />
                                </div>
                                <h3 className="mt-5 text-lg font-bold text-slate-950">
                                    Your membership, made visible.
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    A RAVU Rider Member ID represents verified
                                    connection to the people, partner locations
                                    and opportunities that make up the
                                    ecosystem.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-7">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="mt-5 text-lg font-bold text-slate-950">
                                    Built to grow with you.
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Membership is an entry point, not an end
                                    state. As new partner services and ecosystem
                                    benefits launch across Tanzania, members are
                                    connected directly to them.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* -------------------------------------------------- MEMBER JOURNEY */}
            <section className="border-t border-slate-100 bg-slate-50/50 py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            MEMBER JOURNEY
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                            A clear route{" "}
                            <span className="text-[#1864E8]">into RAVU.</span>
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            Six simple steps from registration to everyday
                            value.
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

                    {/* Rollout Transparency Banner */}
                    <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:flex-row sm:items-center sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                <UsersRound size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-950">
                                    Membership is rolling out step by step
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                                    Registering your interest today ensures you
                                    are first in line as new partner benefits
                                    and onboarding stages go live in your area.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/register"
                            prefetch
                            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800"
                        >
                            <span>Register Now</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            <CommunitySection />
        </WebsiteLayout>
    );
}
