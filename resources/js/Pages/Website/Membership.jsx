import { Link } from "@inertiajs/react";
import {
    ArrowRight,
    BadgeCheck,
    Building2,
    Car,
    Check,
    CreditCard,
    Layers,
    ShieldCheck,
    Truck,
    Users,
    UsersRound,
} from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import EcosystemSlideshow from "../../Components/EcosystemSlideshow";
import { FeatureStrip } from "../../Components/sections";
import riderIdImage from "../../../imgs/ravuRiderID1.jpg";
import fleetMultiVehicleImg from "../../../imgs/ravu_fleet_multi_vehicle.jpg";
import insuranceProtectionImg from "../../../imgs/ravu_insurance_protection.jpg";
import sparePartsGarageImg from "../../../imgs/ravu_spare_parts_garage.jpg";
import mobilityHubImg from "../../../imgs/RAVU Mobility Hub in Tanzania.jpg";

const MEMBERSHIP_SLIDES = [
    {
        id: "mem-slide-categories",
        tabLabel: "6 Mobility Categories",
        badge: "Riders • Bajaj • Cars • Trucks • Buses • Fleets",
        caption: "Inclusive Ecosystem",
        eyebrow: "WHO CAN BECOME A MEMBER",
        title: "One membership built for every vehicle owner and operator.",
        description:
            "RAVU aggregates motorcycle riders, Bajaj operators, private family vehicle owners, commercial drivers, logistics trucks, passenger buses and fleet operators into one powerful network.",
        bullets: [
            "Categories A & B: Boda boda, delivery riders, Bajaj & taxi drivers",
            "Category C: Private sedans, SUVs, pickups & household vehicles",
            "Categories D, E & F: Trucks, logistics, buses & commercial fleets",
        ],
        ctaLabel: "Register Membership Interest",
        ctaHref: "/register",
        image: fleetMultiVehicleImg,
        imageAlt:
            "RAVU multi-vehicle categories in Dar es Salaam",
    },
    {
        id: "mem-slide-insurance",
        tabLabel: "Insurance Protection",
        badge: "20% – 30% Preferred Member Discount",
        caption: "Vehicle, Health & Family Cover",
        eyebrow: "PROTECTING LIVELIHOODS & FAMILIES",
        title: "Discounted insurance for your vehicle, health and loved ones.",
        description:
            "Use your RAVU membership to access preferred rates across comprehensive vehicle insurance, personal accident cover, family medical plans and education protection.",
        bullets: [
            "Minimum 20% target discount on standard insurance premiums",
            "Flexible payment plans, reduced excess & priority claims",
            "Coverage options for spouses, dependents & SME businesses",
        ],
        ctaLabel: "See All Insurance Benefits",
        ctaHref: "/benefits",
        image: insuranceProtectionImg,
        imageAlt:
            "RAVU member reviewing insurance benefits with advisor",
    },
    {
        id: "mem-slide-maintenance",
        tabLabel: "Parts & Garage Savings",
        badge: "10%–25% Off Parts • 5%–20% Off Garages",
        caption: "Reduced Operating Costs",
        eyebrow: "KEEP YOUR VEHICLE EARNING",
        title: "Save on every spare part, tire change, battery and service visit.",
        description:
            "Maintenance is one of the largest expenses for any vehicle owner. RAVU members enjoy guaranteed discounts and priority service bays at accredited garages.",
        bullets: [
            "10%–25% OFF genuine parts, tires, batteries, lubricants & filters",
            "5%–20% OFF routine servicing, engine, brake & electrical repairs",
            "Reduced vehicle downtime and higher daily net earnings",
        ],
        ctaLabel: "Explore Partner Garages",
        ctaHref: "/partners",
        image: sparePartsGarageImg,
        imageAlt:
            "RAVU member vehicle being serviced at official partner garage",
    },
    {
        id: "mem-slide-community",
        tabLabel: "Dar es Salaam Pilot",
        badge: "200 – 500 Initial Members • 4 – 6 Months",
        caption: "Priority Onboarding",
        eyebrow: "JOIN THE FOUNDATIONAL COHORT",
        title: "Your journey starts here in Dar es Salaam.",
        description:
            "Join the initial 200–500 verified members in our Dar es Salaam strategic pilot cohort and be first to access new partner discounts as RAVU expands across Tanzania.",
        bullets: [
            "Verified digital & physical RAVU Member ID recognition",
            "Direct access to pilot insurance and workshop partners",
            "Community support, safety training & financial inclusion programs",
        ],
        ctaLabel: "Join Priority Cohort",
        ctaHref: "/register",
        image: mobilityHubImg,
        imageAlt: "RAVU Mobility Hub in Dar es Salaam, Tanzania",
    },
];

const MEMBERSHIP_PILLARS = [
    {
        icon: CreditCard,
        title: "Verified Member ID",
        text: "One recognised identity connecting riders, drivers, vehicle owners and fleets.",
    },
    {
        icon: BadgeCheck,
        title: "Guaranteed partner discounts",
        text: "20%–30% insurance target discounts, 10%–25% off spare parts & 5%–20% off garages.",
    },
    {
        icon: UsersRound,
        title: "Multi-vehicle ecosystem",
        text: "Serving motorcycles, Bajaj, private cars, taxis, trucks, buses and commercial fleets.",
    },
];

const MEANING = [
    "Exclusive member pricing on motorcycle, Bajaj, private car, fleet, health and family insurance.",
    "10%–25% OFF genuine spare parts, tires, batteries, lubricants and filters at partner suppliers.",
    "5%–20% OFF routine maintenance, engine servicing, brakes and diagnostics at official garages.",
    "Volume-based Fleet Discount Program for commercial transport, delivery and logistics operators.",
];

const MEMBER_CATEGORIES = [
    {
        icon: Users,
        title: "Motorcycle & Boda Boda Riders",
        text: "Boda boda operators, delivery riders, commercial motorcycle operators and private motorcycle owners.",
    },
    {
        icon: Car,
        title: "Bajaj & Commercial Vehicle Drivers",
        text: "Commercial & private Bajaj (three-wheeler) operators, taxi drivers, ride-hailing drivers and service vehicles.",
    },
    {
        icon: ShieldCheck,
        title: "Private Vehicle Owners & Families",
        text: "Individual members and households owning sedans, SUVs, pickups and personal family vehicles.",
    },
    {
        icon: Truck,
        title: "Truck Owners & Logistics Operators",
        text: "Cargo transport operators, long-haul trucking businesses, construction transport and distribution companies.",
    },
    {
        icon: Building2,
        title: "Bus Owners & Passenger Transit",
        text: "Urban bus operators, intercity bus companies, school transport providers and staff shuttle services.",
    },
    {
        icon: Layers,
        title: "Fleet Owners & SMEs",
        text: "Commercial, corporate, delivery, rental, logistics and motorcycle fleets accessing bulk parts & fleet insurance.",
    },
];

const JOURNEY = [
    {
        title: "Register",
        text: "Share your interest online or sign up directly in the RAVU mobile app.",
    },
    {
        title: "Apply",
        text: "Select your mobility category — rider, driver, private vehicle owner or fleet operator.",
    },
    {
        title: "Verification",
        text: "Receive your verified RAVU Member ID for instant recognition at partner branches.",
    },
    {
        title: "Protect & Insure",
        text: "Access preferred member insurance rates (20%+ target discount) and flexible payment plans.",
    },
    {
        title: "Save on Maintenance",
        text: "Redeem 10%–25% spare parts discounts and 5%–20% garage servicing discounts.",
    },
    {
        title: "Grow with RAVU",
        text: "Lower operating costs, reduce vehicle downtime and build long-term financial security.",
    },
];

export default function Membership() {
    return (
        <WebsiteLayout>
            {/* ------------------------------------------------------------ HERO */}
            <section className="relative overflow-hidden bg-white">
                <div className="relative flex items-center lg:min-h-[560px] xl:min-h-[600px]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none hidden select-none lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-[58%] xl:w-[56%]"
                    >
                        <img
                            src={riderIdImage}
                            alt="RAVU Rider Member ID card and branded lanyard"
                            fetchPriority="high"
                            decoding="async"
                            className="h-full w-full object-cover object-left"
                        />
                        <div className="absolute inset-y-0 left-0 w-24 xl:w-32 bg-gradient-to-r from-white via-white/80 to-transparent" />
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
                        <div className="max-w-xl lg:max-w-[500px] xl:max-w-[520px]">
                            <span className="inline-flex items-center rounded-full bg-[#1246A8] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-2xs">
                                RAVU MEMBERSHIP
                            </span>

                            <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-[#050B17] sm:text-5xl lg:text-[3.35rem]">
                                One identity.
                                <br />
                                Lower operating costs.
                                <br />
                                Membership that{" "}
                                <span className="text-[#1864E8]">
                                    protects &amp; pays.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-[17px]">
                                A RAVU membership connects motorcycle riders,
                                Bajaj operators, private vehicle owners,
                                families and commercial fleets to exclusive
                                insurance discounts, genuine spare parts savings
                                and priority garage servicing across Tanzania.
                            </p>

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
                                    href="/benefits"
                                    prefetch
                                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white/95 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-2xs transition-colors hover:border-slate-400 hover:bg-slate-50"
                                >
                                    See Member Discounts
                                </Link>
                            </div>
                        </div>

                        <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-100 shadow-lg lg:hidden">
                            <img
                                src={riderIdImage}
                                alt="RAVU Rider Member ID card and branded lanyard"
                                fetchPriority="high"
                                decoding="async"
                                className="h-auto w-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ------------------------------------------- 3 PILLARS STRIP */}
            <FeatureStrip items={MEMBERSHIP_PILLARS} />

            {/* -------------------------------------------------- MEMBERSHIP SLIDESHOW */}
            <EcosystemSlideshow
                eyebrow="MEMBERSHIP IN ACTION"
                title="Built for riders, vehicle owners,"
                highlight="families and fleets."
                description="Explore how RAVU membership delivers real savings and protection across all six mobility categories."
                slides={MEMBERSHIP_SLIDES}
            />

            {/* -------------------------------------------------- WHO CAN JOIN */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1864E8]">
                            WHO RAVU SERVES
                        </p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                            Built for every vehicle owner and{" "}
                            <span className="text-[#1864E8]">
                                mobility operator.
                            </span>
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            RAVU begins with boda boda riders and Bajaj
                            operators and expands across six connected vehicle
                            and fleet categories so every member household and
                            transport business benefits from collective scale.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {MEMBER_CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <div
                                    key={cat.title}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="mt-5 text-base font-bold text-slate-950">
                                        {cat.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        {cat.text}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* -------------------------------------------------- WHAT IT MEANS */}
            <section className="border-t border-slate-100 bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                WHAT IT MEANS
                            </p>
                            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                                Your financial advantage{" "}
                                <span className="text-[#1864E8]">
                                    on the road.
                                </span>
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                                Rather than negotiating alone, RAVU members
                                access structured corporate-grade discounts on
                                insurance, spare parts, tires, batteries,
                                lubricants and mechanical repairs.
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
                                    Your membership, verified instantly.
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Present your RAVU Member ID at participating
                                    insurers, spare parts shops, tire centers
                                    and garages for instant verification and
                                    transparent member pricing.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-7">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="mt-5 text-lg font-bold text-slate-950">
                                    Protection for you and your family.
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Beyond vehicle coverage and workshop
                                    discounts, RAVU membership extends into
                                    personal accident cover, family medical
                                    plans, education protection and claim-free
                                    loyalty rewards.
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
                            savings and protection.
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

                    {/* Dar es Salaam Pilot Rollout Banner */}
                    <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:flex-row sm:items-center sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                <UsersRound size={20} />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-base font-bold text-slate-950">
                                        Dar es Salaam Strategic Pilot Cohort
                                    </h3>
                                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                                        200 – 500 Initial Members • 4 – 6 Months
                                    </span>
                                </div>
                                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                                    RAVU is launching its initial pilot cohort
                                    of 200–500 verified riders, drivers and
                                    vehicle owners in Dar es Salaam before
                                    expanding nationwide. Register today to join
                                    the priority onboarding wave.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/register"
                            prefetch
                            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800"
                        >
                            <span>Join Priority Cohort</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            <CommunitySection />
        </WebsiteLayout>
    );
}
