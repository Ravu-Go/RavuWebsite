import { Link } from "@inertiajs/react";
import {
    ArrowRight,
    BadgeCheck,
    Check,
    Handshake,
    ShieldCheck,
    Wrench,
} from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import {
    AppPromo,
    FeatureStrip,
    StoreButtons,
} from "../../Components/sections";
import ridersConversationImg from "../../../imgs/RAVU Riders Lively Street Conversation.png";

const SUPPORT_AREAS = [
    {
        icon: BadgeCheck,
        title: "Membership access",
        text: "Connect with verified benefits and partner services across the network.",
    },
    {
        icon: Wrench,
        title: "Practical support",
        text: "Mobility-focused services built around your everyday operations.",
    },
    {
        icon: Handshake,
        title: "Connected community",
        text: "Move forward as part of an organised, recognised rider community.",
    },
];

const RIDER_JOURNEY = [
    {
        title: "Download the app",
        text: "The RAVU mobile app is the starting point for every rider and driver.",
    },
    {
        title: "Register in the app",
        text: "Complete your profile directly inside the operational mobile experience.",
    },
    {
        title: "Access your membership",
        text: "Unlock your digital RAVU ID, partner benefits and support services.",
    },
    {
        title: "Participate and grow",
        text: "Build connections and move forward with the wider mobility ecosystem.",
    },
];

export default function ForRiders() {
    return (
        <WebsiteLayout>
            {/* ---------------------------------------------------------- HERO */}
            <section className="relative overflow-hidden bg-white">
                {/* Right-side blended background image on desktop */}
                <div className="relative lg:min-h-[560px] xl:min-h-[600px] flex items-center">
                    <div
                        aria-hidden="true"
                        className="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-[64%] xl:w-[62%] select-none pointer-events-none"
                    >
                        <img
                            src={ridersConversationImg}
                            alt="RAVU riders in branded vests having a lively street conversation"
                            fetchPriority="high"
                            decoding="async"
                            className="h-full w-full object-cover object-center"
                        />
                        {/* Smooth white gradient blend on the left seam */}
                        <div className="absolute inset-y-0 left-0 w-44 xl:w-56 bg-gradient-to-r from-white via-white/85 to-transparent" />
                        {/* Subtle top & bottom edge softness */}
                        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/50 to-transparent" />
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
                                FOR RIDERS &amp; DRIVERS
                            </span>

                            {/* Stacked Bold Headline */}
                            <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-[#050B17] sm:text-5xl lg:text-[3.35rem]">
                                A stronger ride.
                                <br />
                                A stronger community.
                                <br />
                                Real{" "}
                                <span className="text-[#1864E8]">
                                    opportunities.
                                </span>
                            </h1>

                            {/* Body Copy */}
                            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-[17px]">
                                RAVU begins with the boda boda and motorcycle
                                communities whose work keeps people and places
                                connected across Tanzania connecting you with
                                membership benefits, practical support and
                                opportunities to grow.
                            </p>

                            {/* Primary & Secondary Action Buttons */}
                            <div className="mt-7 flex flex-wrap items-center gap-3.5">
                                <Link
                                    href="/for-riders#app"
                                    prefetch
                                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#0B3B8C] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#00289a] active:scale-[0.98]"
                                >
                                    <span>Get the RAVU App</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    href="/benefits"
                                    prefetch
                                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white/95 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-2xs transition-colors hover:border-slate-400 hover:bg-slate-50"
                                >
                                    Explore Member Benefits
                                </Link>
                            </div>

                            {/* App Store & Google Play Store Badges */}
                            <div className="mt-6">
                                <StoreButtons />
                            </div>
                        </div>

                        {/* Mobile / Tablet Image Presentation */}
                        <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-100 shadow-lg lg:hidden">
                            <img
                                src={ridersConversationImg}
                                alt="RAVU riders in branded vests having a lively street conversation"
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

            {/* ------------------------------------------- 3 FEATURES STRIP */}
            <FeatureStrip items={SUPPORT_AREAS} />

            {/* ------------------------------------------- APP IS THE FRONT DOOR */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                THE RAVU APP IS WHERE YOU JOIN
                            </p>
                            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                                Everything you need,{" "}
                                <span className="text-[#1864E8]">
                                    right in your pocket.
                                </span>
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                                This website introduces RAVU — the membership,
                                the ecosystem and the opportunity. The mobile
                                app is where the operational experience happens:
                                registration, membership access, partner
                                discounts and the day-to-day tools built around
                                your work.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3.5">
                                <Link
                                    href="/membership"
                                    prefetch
                                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-slate-800 sm:text-sm"
                                >
                                    <span>Explore Membership</span>
                                    <ArrowRight size={15} />
                                </Link>
                                <Link
                                    href="/benefits"
                                    prefetch
                                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950 sm:text-sm"
                                >
                                    View Member Benefits
                                </Link>
                            </div>
                        </div>

                        <div className="lg:col-span-6">
                            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-7 sm:p-9">
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#EBF3FE] px-3.5 py-1.5 text-xs font-bold text-[#1864E8]">
                                    <ShieldCheck size={15} />
                                    <span>What to expect inside the app</span>
                                </div>

                                <ul className="mt-6 space-y-4">
                                    {[
                                        "Verified digital RAVU Member ID inside the app.",
                                        "Direct access to fuel, workshop and financial partner benefits.",
                                        "A recognised identity across the wider RAVU mobility network.",
                                        "Clear step-by-step guidance at every stage of your journey.",
                                    ].map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-3.5 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-2xs"
                                        >
                                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                                <Check
                                                    size={12}
                                                    strokeWidth={3}
                                                />
                                            </span>
                                            <span className="text-sm font-medium text-slate-800">
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* -------------------------------------------------- RIDER JOURNEY */}
            <section className="border-t border-slate-100 bg-slate-50/50 py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            YOUR JOURNEY
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                            Join. Connect.{" "}
                            <span className="text-[#1864E8]">
                                Participate. Grow.
                            </span>
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {RIDER_JOURNEY.map((step, index) => (
                            <div
                                key={step.title}
                                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md"
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

            <AppPromo />

            <CommunitySection />
        </WebsiteLayout>
    );
}
