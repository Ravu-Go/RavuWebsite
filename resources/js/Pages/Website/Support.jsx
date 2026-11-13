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
    Hero,
} from "../../Components/sections";
import supportImage from "../../../imgs/support.jpg";

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
            <Hero
                eyebrow="HELP & SUPPORT"
                title="We're here to help you"
                highlight="move forward."
                text="Find straightforward answers about RAVU membership, the mobile app, member benefits and business partnerships."
                primary={{ label: "Register Interest", href: "/register" }}
                secondary={{ label: "Partner Sign In", href: "/login" }}
                media={supportImage}
                mediaAlt="A RAVU support specialist ready to help"
                layout="split"
            />

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
