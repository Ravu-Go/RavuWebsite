import { Link } from "@inertiajs/react";
import {
    ArrowRight,
    Building2,
    HelpCircle,
    MessageSquare,
    ShieldCheck,
    Smartphone,
} from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import {
    FAQAccordion,
    FeatureStrip,
} from "../../Components/sections";
import supportVideo from "../../../imgs/Headset.mp4";

const SUPPORT_CHANNELS = [
    {
        icon: Smartphone,
        title: "Riders & Drivers",
        text: "In-app guidance for registration, Member ID and daily operations.",
    },
    {
        icon: Building2,
        title: "Partner Support",
        text: "Dedicated onboarding and Partner Portal assistance for businesses.",
    },
    {
        icon: ShieldCheck,
        title: "Account & Verification",
        text: "Help with membership status, profile updates and security.",
    },
];

const FAQ = [
    {
        question: "What is RAVU?",
        answer: "RAVU is a membership-based mobility ecosystem connecting people, services and opportunity across Tanzania. It is built around the communities who keep movement happening, and grows outward to include the businesses, workshops and technology that support them.",
    },
    {
        question: "Who can become a member?",
        answer: "RAVU begins with boda boda riders, drivers and motorcycle owners, and is designed to grow with mobility communities more broadly. Riders and drivers join and access their digital Member ID directly through the RAVU mobile app.",
    },
    {
        question: "How do I register?",
        answer: "Use the registration page to share your interest or download the RAVU mobile app. Registering online records your interest so RAVU can keep you informed as new membership benefits and partner locations launch in your region.",
    },
    {
        question: "How can an organisation partner with RAVU?",
        answer: "Visit the Partners page to explore partnership categories, or register your organisation's interest. Existing partners can sign in directly to the Partner Portal to verify member IDs and manage offers.",
    },
    {
        question: "How do I access the Partner Portal?",
        answer: "Click 'Sign in' in the top navigation bar and sign in with your partner credentials or authorised Google account to be routed automatically to your Partner Dashboard.",
    },
];

export default function Support() {
    return (
        <WebsiteLayout>
            {/* ---------------------------------------------------------- HERO */}
            <section className="relative overflow-hidden bg-white">
                <div className="relative flex items-center lg:min-h-[540px] xl:min-h-[580px]">
                    {/* Right-side blended background image on desktop */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none hidden select-none lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-[58%] xl:w-[56%]"
                    >
                        <video
                            src={supportVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            fetchPriority="high"
                            className="h-full w-full object-contain object-center py-6"
                        />
                        {/* Smooth white gradient blend on the left seam */}
                        <div className="absolute inset-y-0 left-0 w-36 xl:w-48 bg-gradient-to-r from-white via-white/80 to-transparent" />
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
                                HELP &amp; SUPPORT
                            </span>

                            {/* Stacked Bold Headline */}
                            <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-[#050B17] sm:text-5xl lg:text-[3.35rem]">
                                Straightforward answers.
                                <br />
                                Dedicated support.
                                <br />
                                Here to help you{" "}
                                <span className="text-[#1864E8]">
                                    move forward.
                                </span>
                            </h1>

                            {/* Body Copy */}
                            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-[17px]">
                                Find clear guidance about RAVU membership, the
                                mobile app, verified member benefits and
                                business partnerships across Tanzania.
                            </p>

                            {/* Primary & Secondary Action Buttons */}
                            <div className="mt-7 flex flex-wrap items-center gap-3.5">
                                <Link
                                    href="/register"
                                    prefetch
                                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#0B3B8C] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#00289a] active:scale-[0.98]"
                                >
                                    <span>Register Interest</span>
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
                        <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg lg:hidden">
                            <video
                                src={supportVideo}
                                autoPlay
                                loop
                                muted
                                playsInline
                                fetchPriority="high"
                                className="mx-auto h-64 w-full object-contain p-4"
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

            {/* ------------------------------------------- 3 CHANNELS STRIP */}
            <FeatureStrip items={SUPPORT_CHANNELS} />

            {/* ---------------------------------------------------- FAQ SECTION */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                FREQUENTLY ASKED QUESTIONS
                            </p>
                            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                                Helpful{" "}
                                <span className="text-[#1864E8]">
                                    starting points.
                                </span>
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                                Everything you need to know about how RAVU
                                connects riders, members and partner businesses.
                            </p>

                            <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                    <MessageSquare size={18} />
                                </div>
                                <h3 className="mt-4 text-base font-bold text-slate-950">
                                    Need direct assistance?
                                </h3>
                                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                                    Whether you are registering interest as a
                                    member or onboarding as a business partner,
                                    our team is ready to guide you.
                                </p>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Link
                                        href="/register"
                                        prefetch
                                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800"
                                    >
                                        <span>Register Interest</span>
                                        <ArrowRight size={13} />
                                    </Link>
                                    <Link
                                        href="/partners"
                                        prefetch
                                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                                    >
                                        Explore Partnerships
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <FAQAccordion items={FAQ} />
                        </div>
                    </div>
                </div>
            </section>

            <CommunitySection />
        </WebsiteLayout>
    );
}
