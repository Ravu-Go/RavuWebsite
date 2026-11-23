import { Link } from "@inertiajs/react";
import {
    ArrowRight,
    Award,
    BadgeCheck,
    Banknote,
    Briefcase,
    Building2,
    Car,
    Check,
    Compass,
    FileCheck2,
    Handshake,
    HeartPulse,
    Landmark,
    Layers,
    Mail,
    MapPin,
    Percent,
    ShieldCheck,
    Sparkles,
    Store,
    TrendingUp,
    Truck,
    Users,
    Wrench,
} from "lucide-react";
import { useState } from "react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import EcosystemSlideshow from "../../Components/EcosystemSlideshow";
import { FeatureStrip } from "../../Components/sections";
import partnerHeroImg from "../../../imgs/memberPlusPartners.jpg";
import workshopImg from "../../../imgs/fundRepairShop-.jpg";
import fleetMultiVehicleImg from "../../../imgs/ravu_fleet_multi_vehicle.jpg";
import insuranceProtectionImg from "../../../imgs/ravu_insurance_protection.jpg";
import sparePartsGarageImg from "../../../imgs/ravu_spare_parts_garage.jpg";
import communityEcosystemImg from "../../../imgs/RAVU Community Mobility Ecosystem.jpg";

const PARTNER_SLIDES = [
    {
        id: "partner-slide-insurance",
        tabLabel: "1. Insurance Partner Track",
        badge: "20% – 30% Preferred Member Discount",
        caption: "8 Insurance Product Lines (A–H)",
        eyebrow: "STRATEGIC INSURANCE PARTNERSHIP PROPOSAL",
        title: "Become the preferred insurance partner for the RAVU ecosystem.",
        description:
            "Gain direct access to a structured, verified network of motorcycle riders, Bajaj operators, private car owners, families, SMEs and commercial fleets with lower customer acquisition costs and higher renewal retention.",
        bullets: [
            "Cover Motorcycles, Bajaj, Private Cars, Commercial Fleets & SMEs",
            "Extend Personal Accident, Health/Medical & Family Life Protection",
            "Offer 20%+ member discounts or value-added deductibles & roadside cover",
        ],
        ctaLabel: "Register as Insurance Partner",
        ctaHref: "/register",
        image: insuranceProtectionImg,
        imageAlt:
            "Insurance advisor presenting RAVU digital coverage to motorcycle rider and private car owner in Dar es Salaam",
    },
    {
        id: "partner-slide-parts",
        tabLabel: "2. Spare Parts & Garages",
        badge: "10%–25% Off Parts • 5%–20% Off Garage",
        caption: "Official Service & Parts Network",
        eyebrow: "SPARE PARTS, MAINTENANCE & GARAGE PROPOSAL",
        title: "Drive high-volume recurring workshop & spare parts sales.",
        description:
            "Prepared for Spare Parts Suppliers, Vehicle Service Centers, Mechanical Garages, Tire Centers and Auto Retailers seeking steady customer volume across all vehicle categories.",
        bullets: [
            "10%–25% member discount on parts, tires, batteries, lubricants & filters",
            "5%–20% member discount on routine servicing, engine, brakes & alignment",
            "Fleet Discount Program with bulk parts pricing & priority service bays",
        ],
        ctaLabel: "Register Garage or Parts Shop",
        ctaHref: "/register",
        image: sparePartsGarageImg,
        imageAlt:
            "Tanzanian mechanics servicing motorcycle and SUV in a modern spare parts and garage center",
    },
    {
        id: "partner-slide-fleets",
        tabLabel: "3. Multi-Vehicle & Fleets",
        badge: "6 High-Demand Mobility Segments",
        caption: "Beyond Single Riders",
        eyebrow: "ECOSYSTEM CUSTOMER ACQUISITION",
        title: "One partnership unlocks riders, households, trucks, buses and fleets.",
        description:
            "RAVU positions your organization at the center of Tanzania's transportation economy — serving two-wheelers, three-wheelers, private family vehicles, cargo trucks, buses and corporate fleets.",
        bullets: [
            "Categories A–C: Motorcycles, Bajaj operators & Private family vehicles",
            "Categories D–F: Cargo trucks, Intercity/Urban buses & Commercial fleets",
            "Single digital verification flow in the RAVU Partner Portal",
        ],
        ctaLabel: "Open Partner Portal",
        ctaHref: "/login",
        image: fleetMultiVehicleImg,
        imageAlt:
            "Multi-vehicle fleet of motorcycles, Bajaj, SUV, truck and bus in Dar es Salaam",
    },
    {
        id: "partner-slide-pilot",
        tabLabel: "4. Dar es Salaam Pilot",
        badge: "200 – 500 Active Members • 4 – 6 Months",
        caption: "Phased Launch Program",
        eyebrow: "LOW-RISK STRATEGIC PILOT",
        title: "Launch in Dar es Salaam, measure results and scale nationwide.",
        description:
            "Co-design a 4–6 month pilot with 200–500 active verified RAVU members in Dar es Salaam to evaluate uptake, discount conversion and operational workflows before national rollout.",
        bullets: [
            "Co-branded member awareness campaigns & onboarding activations",
            "Real-time redemption tracking inside your RAVU Partner Dashboard",
            "Pathway to Official RAVU Service Center & Preferred Partner status",
        ],
        ctaLabel: "Join Dar es Salaam Pilot",
        ctaHref: "/register",
        image: communityEcosystemImg,
        imageAlt: "RAVU Community Mobility Ecosystem in Dar es Salaam",
    },
];

const PARTNER_PILLARS = [
    {
        icon: Users,
        title: "Structured customer network",
        text: "RAVU aggregates a fragmented mobility market into one verified, pre-engaged network.",
    },
    {
        icon: Percent,
        title: "Lower acquisition costs",
        text: "Reach riders, private car owners, families, SMEs and fleets through a single platform.",
    },
    {
        icon: TrendingUp,
        title: "High retention & volume",
        text: "Continuous member engagement drives repeat workshop visits and timely policy renewals.",
    },
];

const CUSTOMER_SEGMENTS = [
    {
        code: "A",
        icon: Users,
        title: "Motorcycle & Boda Boda Riders",
        subtitle: "Two-Wheeler Mobility Professionals",
        items: [
            "Boda boda passenger riders",
            "Last-mile delivery riders",
            "Commercial motorcycle operators",
            "Private motorcycle owners",
        ],
    },
    {
        code: "B",
        icon: Car,
        title: "Bajaj & Commercial Operators",
        subtitle: "Three-Wheeler & Urban Passenger Operators",
        items: [
            "Commercial & private Bajaj (three-wheeler) operators",
            "Taxi & ride-hailing drivers",
            "Corporate service vehicle operators",
            "Urban commuter transport operators",
        ],
    },
    {
        code: "C",
        icon: ShieldCheck,
        title: "Private Vehicle Owners & Families",
        subtitle: "Member Households & Personal Vehicles",
        items: [
            "Sedans, SUVs & pickups",
            "Family & household vehicles",
            "Personal commuter vehicles",
            "Member dependents & family plans",
        ],
    },
    {
        code: "D",
        icon: Truck,
        title: "Truck Owners & Logistics Companies",
        subtitle: "Cargo & Distribution Networks",
        items: [
            "Cargo transport operators",
            "Long-haul trucking businesses",
            "Construction transport providers",
            "Regional distribution companies",
        ],
    },
    {
        code: "E",
        icon: Building2,
        title: "Bus Owners & Transport Companies",
        subtitle: "Mass Transit & Institutional Transport",
        items: [
            "Urban & intercity bus companies",
            "School transport providers",
            "Staff transportation services",
            "Passenger shuttle operators",
        ],
    },
    {
        code: "F",
        icon: Layers,
        title: "Commercial & Corporate Fleet Owners",
        subtitle: "Multi-Vehicle & SME Operations",
        items: [
            "Commercial & corporate vehicle fleets",
            "Delivery & logistics fleets",
            "Rental & ride-hailing fleets",
            "Managed motorcycle fleets",
        ],
    },
];

const INSURANCE_PRODUCTS = [
    {
        code: "A",
        title: "Motorcycle Insurance",
        target: "Boda boda riders & motorcycle owners",
        coverage: [
            "Comprehensive & third-party liability insurance",
            "Theft, fire & own damage cover",
            "Passenger liability & personal accident benefits",
        ],
    },
    {
        code: "B",
        title: "Bajaj (Three-Wheeler) Insurance",
        target: "Commercial & private Bajaj operators",
        coverage: [
            "Comprehensive & third-party liability",
            "Passenger protection & vehicle damage cover",
            "Theft and fire protection",
        ],
    },
    {
        code: "C",
        title: "Private Motor Vehicle Insurance",
        target: "RAVU members, households & private car owners",
        coverage: [
            "Comprehensive & third-party private vehicle cover",
            "Theft, fire & windscreen protection",
            "Roadside assistance & vehicle recovery services",
        ],
    },
    {
        code: "D",
        title: "Commercial Fleet Insurance",
        target: "Transport, delivery, logistics, corporate & ride-hailing fleets",
        coverage: [
            "Fleet comprehensive & third-party liability",
            "Driver personal accident & asset protection",
            "Theft/recovery solutions & fleet risk management",
        ],
    },
    {
        code: "E",
        title: "Personal Accident Insurance",
        target: "Riders, drivers & mobility professionals",
        coverage: [
            "Medical expense benefits",
            "Temporary & permanent disability benefits",
            "Accidental death protection",
        ],
    },
    {
        code: "F",
        title: "Health & Medical Insurance",
        target: "RAVU members and their dependents",
        coverage: [
            "Outpatient, inpatient & emergency treatment",
            "Family medical protection plans",
            "Maternity benefits",
        ],
    },
    {
        code: "G",
        title: "Life Insurance & Family Protection",
        target: "Members, spouses & children",
        coverage: [
            "Individual life & family protection plans",
            "Education protection policies",
            "Funeral/last-expense & savings-linked insurance",
        ],
    },
    {
        code: "H",
        title: "Business Protection Products",
        target: "Entrepreneurs & SMEs within the RAVU ecosystem",
        coverage: [
            "Business interruption & property insurance",
            "Asset protection & public liability insurance",
            "Employee protection plans",
        ],
    },
];

const SPARE_PARTS_CATEGORIES = [
    "Motorcycle spare parts",
    "Private vehicle spare parts",
    "Truck & heavy-duty parts",
    "Bus & commercial transit parts",
    "Tires & tubes",
    "Batteries & electricals",
    "Engine lubricants & fluids",
    "Filters & genuine accessories",
];

const GARAGE_SERVICES = [
    "Routine preventive maintenance",
    "Engine servicing & tuning",
    "Suspension & shock repairs",
    "Brake servicing & replacement",
    "Electrical diagnostics & wiring",
    "Bodywork & structural repairs",
    "Tire mounting & balancing",
    "Wheel alignment & vehicle inspections",
];

const FLEET_PROGRAM_BENEFITS = [
    "Volume-based preferential pricing",
    "Priority service bay booking",
    "Dedicated partner account management",
    "Customized preventive maintenance packages",
    "Bulk spare-parts & lubricant pricing",
];

const PARTNER_COMMITMENTS = [
    "Provide preferred member discounts (20%+ insurance / 10–25% spare parts / 5–20% garage)",
    "Supply genuine, high-quality spare parts and professional service standards",
    "Recognize verified RAVU Member IDs across all participating branches",
    "Maintain transparent pricing and consistent product/service availability",
    "Deliver priority claims processing, timely service and warranty support",
];

const RAVU_COMMITMENTS = [
    "Actively promote partner products and service locations across the RAVU network",
    "Conduct member awareness campaigns, events and marketing activations",
    "Assist with rider onboarding, policy enrollment and customer referrals",
    "Verify member eligibility instantly via the RAVU Partner Portal",
    "Encourage timely policy renewals, repeat workshop visits and service feedback",
];

const LONG_TERM_ROADMAP = [
    {
        title: "Embedded Digital Insurance",
        text: "In-app policy enrollment, digital policy management and tier-based member protection.",
    },
    {
        title: "Official RAVU Service Centers",
        text: "Accredited national service networks and Official RAVU Spare Parts Suppliers.",
    },
    {
        title: "Roadside & Inspection Programs",
        text: "24/7 emergency breakdown recovery, vehicle inspection and tire & battery programs.",
    },
    {
        title: "Maintenance Subscriptions & Wellness",
        text: "Predictable maintenance subscription packages, rewards programs and family financial wellness.",
    },
];

export default function Partners() {
    const [activeProgram, setActiveProgram] = useState("insurance"); // insurance | maintenance

    return (
        <WebsiteLayout>
            {/* ---------------------------------------------------------- HERO */}
            <section className="relative overflow-hidden bg-white">
                <div className="relative lg:min-h-[560px] xl:min-h-[600px] flex items-center">
                    {/* Right-side blended background image on desktop */}
                    <div
                        aria-hidden="true"
                        className="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-[66%] xl:w-[64%] select-none pointer-events-none"
                    >
                        <img
                            src={partnerHeroImg}
                            alt="RAVU riders, fuel partners, service partners and businesses connecting"
                            fetchPriority="high"
                            decoding="async"
                            className="h-full w-full object-cover object-right"
                        />
                        <div className="absolute inset-y-0 left-0 w-56 xl:w-72 bg-gradient-to-r from-white via-white/95 to-transparent" />
                        <div className="absolute left-0 top-0 h-56 w-80 bg-gradient-to-br from-white via-white/90 to-transparent" />
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
                        <div className="max-w-xl lg:max-w-[560px]">
                            <span className="inline-flex items-center rounded-full bg-[#1246A8] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-2xs">
                                STRATEGIC ECOSYSTEM PARTNERSHIPS
                            </span>

                            <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-[#050B17] sm:text-5xl lg:text-[3.35rem]">
                                Your customer-acquisition
                                <br />
                                partner across the
                                <br />
                                <span className="text-[#1864E8]">
                                    mobility economy.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-[17px]">
                                Rather than serving operators individually, RAVU
                                Ltd aggregates Tanzania&apos;s fragmented
                                mobility market — connecting insurers, spare
                                parts suppliers, garages, financial institutions
                                and merchants with a verified network of riders,
                                private car owners, families, trucks, buses and
                                commercial fleets.
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-3.5">
                                <Link
                                    href="/register"
                                    prefetch
                                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#0B3B8C] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#00289a] active:scale-[0.98]"
                                >
                                    <span>Become an Official Partner</span>
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
                        <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-100 shadow-lg lg:hidden">
                            <img
                                src={partnerHeroImg}
                                alt="RAVU riders, fuel partners, service partners and businesses connecting"
                                fetchPriority="high"
                                decoding="async"
                                className="h-auto w-full object-cover object-right"
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

            {/* ------------------------------------------- 3 PILLARS STRIP */}
            <FeatureStrip items={PARTNER_PILLARS} />

            {/* -------------------- VISUAL PARTNERSHIP SLIDESHOW */}
            <EcosystemSlideshow
                eyebrow="STRATEGIC PARTNERSHIP GALLERY"
                title="Visualizing our partnership programs"
                highlight="across Dar es Salaam."
                description="Explore how insurers, spare parts distributors, mechanical garages and fleet service providers grow with the RAVU ecosystem."
                slides={PARTNER_SLIDES}
            />

            {/* -------------------- 6 TARGET CUSTOMER SEGMENTS (BEYOND RIDERS) */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1864E8]">
                            ECOSYSTEM CUSTOMER BASE
                        </p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                            One partnership.{" "}
                            <span className="text-[#1864E8]">
                                Six high-demand mobility segments.
                            </span>
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            Partnering with RAVU unlocks far more than single
                            motorcycle riders. Through one organized distribution
                            channel, your organization gains direct access to
                            verified operators, private households, SMEs,
                            logistics carriers and multi-vehicle fleets across
                            Tanzania.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {CUSTOMER_SEGMENTS.map((seg) => {
                            const Icon = seg.icon;
                            return (
                                <div
                                    key={seg.code}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md sm:p-7 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                                <Icon size={20} />
                                            </div>
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-700">
                                                Category {seg.code}
                                            </span>
                                        </div>
                                        <h3 className="mt-5 text-base font-bold text-slate-950">
                                            {seg.title}
                                        </h3>
                                        <p className="mt-0.5 text-xs font-semibold text-[#1864E8]">
                                            {seg.subtitle}
                                        </p>
                                        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                                            {seg.items.map((item) => (
                                                <li
                                                    key={item}
                                                    className="flex items-start gap-2 text-xs text-slate-600"
                                                >
                                                    <Check
                                                        size={13}
                                                        className="mt-0.5 shrink-0 text-[#1864E8]"
                                                        strokeWidth={2.5}
                                                    />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* -------------------- FLAGSHIP STRATEGIC PARTNERSHIP PROGRAMS */}
            <section
                id="programs"
                className="border-t border-slate-100 bg-slate-50/70 py-16 sm:py-24"
            >
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1864E8]">
                                STRATEGIC PARTNERSHIP PROPOSALS
                            </p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                                Structured programs with{" "}
                                <span className="text-[#1864E8]">
                                    clear member discounts.
                                </span>
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                                Explore our two flagship partnership frameworks
                                designed to deliver measurable savings to RAVU
                                members and high-volume recurring revenue to
                                preferred partners.
                            </p>
                        </div>

                        {/* Program Switcher Tabs */}
                        <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs self-start">
                            <button
                                type="button"
                                onClick={() => setActiveProgram("insurance")}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer sm:text-sm ${
                                    activeProgram === "insurance"
                                        ? "bg-[#0B3B8C] text-white shadow-xs"
                                        : "text-slate-600 hover:text-slate-950"
                                }`}
                            >
                                <ShieldCheck size={16} />
                                <span>1. Insurance Benefits Program</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveProgram("maintenance")}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer sm:text-sm ${
                                    activeProgram === "maintenance"
                                        ? "bg-[#0B3B8C] text-white shadow-xs"
                                        : "text-slate-600 hover:text-slate-950"
                                }`}
                            >
                                <Wrench size={16} />
                                <span>2. Spare Parts &amp; Garage Program</span>
                            </button>
                        </div>
                    </div>

                    {/* TAB 1: EXCLUSIVE INSURANCE BENEFITS PROGRAM */}
                    {activeProgram === "insurance" && (
                        <div className="mt-10 space-y-8">
                            {/* Top Highlight Banner */}
                            <div className="rounded-3xl bg-[#050B17] p-7 text-white shadow-xl sm:p-10">
                                <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                                    <div className="lg:col-span-7">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-300">
                                            <ShieldCheck size={13} />
                                            <span>
                                                Preferred Insurance Partner
                                                Track
                                            </span>
                                        </span>
                                        <h3 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
                                            Exclusive Insurance Benefits for the
                                            RAVU Ecosystem
                                        </h3>
                                        <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                            Despite the essential role riders and
                                            drivers play in Tanzania&apos;s
                                            economy, insurance penetration
                                            remains low due to high perceived
                                            costs, complicated enrollment and a
                                            lack of tailored products. RAVU
                                            bridges this gap by giving
                                            underwriters a single organized
                                            distribution platform.
                                        </p>
                                    </div>

                                    <div className="lg:col-span-5">
                                        <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-6">
                                            <p className="text-xs font-bold uppercase tracking-wider text-sky-300">
                                                Preferred Member Discount Target
                                            </p>
                                            <p className="mt-2 text-3xl font-black text-white sm:text-4xl">
                                                20% – 30% OFF
                                            </p>
                                            <p className="mt-1 text-xs text-slate-300">
                                                Minimum 20% discount on standard
                                                insurance premiums for all
                                                verified RAVU members.
                                            </p>
                                            <div className="mt-4 border-t border-white/10 pt-4 text-xs text-slate-300">
                                                <p className="font-semibold text-white">
                                                    Where constrained by
                                                    underwriting rules,
                                                    equivalent value-added
                                                    benefits include:
                                                </p>
                                                <p className="mt-1 text-slate-300">
                                                    Reduced deductibles/excess •
                                                    Complimentary personal
                                                    accident cover • Emergency
                                                    roadside assistance •
                                                    Flexible payment plans •
                                                    Priority claims processing •
                                                    Passenger &amp; family
                                                    extensions • Claim-free
                                                    loyalty rewards.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 8 Proposed Insurance Product Lines (A - H) */}
                            <div>
                                <h3 className="text-lg font-black text-slate-950 sm:text-xl">
                                    8 Proposed Insurance Product Lines (A – H)
                                </h3>
                                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                                    Spanning individual riders, three-wheelers,
                                    member households, SMEs and commercial
                                    fleets.
                                </p>

                                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {INSURANCE_PRODUCTS.map((prod) => (
                                        <div
                                            key={prod.code}
                                            className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EBF3FE] text-xs font-black text-[#1864E8]">
                                                        {prod.code}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                                                        20%+ Target Discount
                                                    </span>
                                                </div>
                                                <h4 className="mt-4 text-sm font-bold text-slate-950">
                                                    {prod.title}
                                                </h4>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {prod.target}
                                                </p>
                                                <ul className="mt-3.5 space-y-1.5 border-t border-slate-100 pt-3">
                                                    {prod.coverage.map((c) => (
                                                        <li
                                                            key={c}
                                                            className="flex items-start gap-2 text-xs text-slate-700"
                                                        >
                                                            <Check
                                                                size={12}
                                                                className="mt-0.5 shrink-0 text-[#1864E8]"
                                                                strokeWidth={3}
                                                            />
                                                            <span>{c}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: SPARE PARTS, MAINTENANCE & GARAGE PROGRAM */}
                    {activeProgram === "maintenance" && (
                        <div className="mt-10 space-y-8">
                            {/* Top Highlight Banner */}
                            <div className="rounded-3xl bg-[#050B17] p-7 text-white shadow-xl sm:p-10">
                                <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                                    <div className="lg:col-span-6">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-300">
                                            <Wrench size={13} />
                                            <span>
                                                Official Service &amp; Spare
                                                Parts Track
                                            </span>
                                        </span>
                                        <h3 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
                                            Exclusive Spare Parts, Maintenance
                                            &amp; Garage Services Program
                                        </h3>
                                        <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                            Prepared for Spare Parts Suppliers,
                                            Vehicle Service Centers, Mechanical
                                            Garages, Tire Centers, Auto Service
                                            Networks and Automotive Retailers.
                                            RAVU directs verified members and
                                            high-volume fleets to your branches
                                            while lowering their daily operating
                                            costs.
                                        </p>
                                    </div>

                                    <div className="lg:col-span-6 grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-5">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                                                Spare Parts &amp; Tires
                                            </p>
                                            <p className="mt-2 text-2xl font-black text-white sm:text-3xl">
                                                10% – 25% OFF
                                            </p>
                                            <p className="mt-1.5 text-xs text-slate-300">
                                                Minimum member discount on
                                                genuine motorcycle, car, truck
                                                &amp; bus parts, tires,
                                                batteries, lubricants and
                                                filters.
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-5">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                                                Garage &amp; Mechanical
                                            </p>
                                            <p className="mt-2 text-2xl font-black text-white sm:text-3xl">
                                                5% – 20% OFF
                                            </p>
                                            <p className="mt-1.5 text-xs text-slate-300">
                                                Minimum member discount on
                                                routine servicing, engine,
                                                suspension, brake, electrical,
                                                body and alignment work.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3-Column Breakdown: Spare Parts | Garage Services | Fleet Program */}
                            <div className="grid gap-6 lg:grid-cols-3">
                                {/* Col 1: Spare Parts */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
                                    <div className="flex items-center justify-between">
                                        <span className="rounded-full bg-[#EBF3FE] px-3 py-1 text-xs font-black text-[#1864E8]">
                                            10% – 25% OFF
                                        </span>
                                        <Store
                                            size={18}
                                            className="text-slate-400"
                                        />
                                    </div>
                                    <h4 className="mt-4 text-base font-bold text-slate-950">
                                        Spare Parts, Tires &amp; Lubricants
                                    </h4>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Eligible product categories for verified
                                        RAVU members:
                                    </p>
                                    <ul className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                                        {SPARE_PARTS_CATEGORIES.map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-center gap-2.5 text-xs font-medium text-slate-700"
                                            >
                                                <Check
                                                    size={14}
                                                    className="shrink-0 text-[#1864E8]"
                                                    strokeWidth={2.5}
                                                />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Col 2: Garage & Mechanical Services */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
                                    <div className="flex items-center justify-between">
                                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-black text-emerald-700">
                                            5% – 20% OFF
                                        </span>
                                        <Wrench
                                            size={18}
                                            className="text-slate-400"
                                        />
                                    </div>
                                    <h4 className="mt-4 text-base font-bold text-slate-950">
                                        Garage &amp; Mechanical Services
                                    </h4>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Priority workshop &amp; repair services
                                        reducing vehicle downtime:
                                    </p>
                                    <ul className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                                        {GARAGE_SERVICES.map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-center gap-2.5 text-xs font-medium text-slate-700"
                                            >
                                                <Check
                                                    size={14}
                                                    className="shrink-0 text-emerald-600"
                                                    strokeWidth={2.5}
                                                />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Col 3: Fleet Discount Program */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-black text-amber-800">
                                                High-Volume B2B
                                            </span>
                                            <Truck
                                                size={18}
                                                className="text-slate-400"
                                            />
                                        </div>
                                        <h4 className="mt-4 text-base font-bold text-slate-950">
                                            Commercial Fleet Discount Program
                                        </h4>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Dedicated B2B terms for fleet,
                                            logistics, bus &amp; trucking
                                            operators:
                                        </p>
                                        <ul className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                                            {FLEET_PROGRAM_BENEFITS.map(
                                                (item) => (
                                                    <li
                                                        key={item}
                                                        className="flex items-center gap-2.5 text-xs font-medium text-slate-700"
                                                    >
                                                        <Check
                                                            size={14}
                                                            className="shrink-0 text-[#1864E8]"
                                                            strokeWidth={2.5}
                                                        />
                                                        <span>{item}</span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>

                                    <div className="mt-6 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600">
                                        Creates long-term, high-volume recurring
                                        service contracts for participating
                                        workshops and parts distributors.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ---------------------------------- BLENDED BANNER (WORKSHOP) */}
            <section className="relative overflow-hidden border-t border-slate-100 bg-white">
                <div className="relative flex items-center lg:min-h-[560px] xl:min-h-[600px]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none hidden select-none lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-[64%] xl:w-[62%]"
                    >
                        <img
                            src={workshopImg}
                            alt="RAVU Workshop & Service mechanics repairing a member motorcycle"
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-y-0 left-0 w-48 xl:w-64 bg-gradient-to-r from-white via-white/90 to-transparent" />
                        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/40 to-transparent" />
                    </div>

                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 right-0 z-10 hidden h-36 w-36 overflow-hidden lg:block"
                    >
                        <div className="absolute -bottom-16 -right-16 h-36 w-56 -rotate-45 bg-[#1864E8] shadow-lg" />
                        <div className="absolute -bottom-20 -right-12 h-32 w-56 -rotate-45 bg-[#0B3B8C]" />
                    </div>

                    <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-18 lg:px-10 lg:py-20">
                        <div className="max-w-xl lg:max-w-[540px]">
                            <span className="inline-flex items-center rounded-full bg-[#1246A8] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-2xs">
                                DESIGNED FOR REAL OPERATIONS
                            </span>

                            <h2 className="mt-5 text-3xl font-black leading-[1.08] tracking-tight text-[#050B17] sm:text-4xl lg:text-[2.85rem]">
                                Practical tools for
                                <br />
                                every partner{" "}
                                <span className="text-[#1864E8]">
                                    location.
                                </span>
                            </h2>

                            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 sm:text-[17px]">
                                Whether you operate an insurance underwriting
                                desk, a spare parts warehouse or a nationwide
                                network of garages and fuel stations, RAVU makes
                                it effortless to verify members and apply
                                discounts at the point of service.
                            </p>

                            <ul className="mt-6 space-y-3">
                                {[
                                    "Instant digital Member ID verification in the RAVU Partner Portal.",
                                    "Clear discount tiers and eligibility rules for your front-line staff.",
                                    "Direct referrals and marketing visibility across the RAVU network.",
                                ].map((point) => (
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

                            <div className="mt-8 flex flex-wrap items-center gap-3.5">
                                <Link
                                    href="/login"
                                    prefetch
                                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#0B3B8C] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#00289a] active:scale-[0.98]"
                                >
                                    <span>Open Partner Portal</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    href="/register"
                                    prefetch
                                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white/95 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-2xs transition-colors hover:border-slate-400 hover:bg-slate-50"
                                >
                                    Register Partner Account
                                </Link>
                            </div>
                        </div>

                        <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-100 shadow-lg lg:hidden">
                            <img
                                src={workshopImg}
                                alt="RAVU Workshop & Service mechanics repairing a member motorcycle"
                                loading="lazy"
                                decoding="async"
                                className="h-auto w-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ----------------------- MUTUAL COMMITMENTS & DAR ES SALAAM PILOT */}
            <section className="border-t border-slate-100 bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8 space-y-16">
                    {/* Mutual Commitments Matrix */}
                    <div>
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1864E8]">
                                SHARED RESPONSIBILITY
                            </p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                                A true strategic partnership,{" "}
                                <span className="text-[#1864E8]">
                                    not just a referral channel.
                                </span>
                            </h2>
                        </div>

                        <div className="mt-10 grid gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-7">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B3B8C] text-white">
                                        <Handshake size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-950">
                                            Partner Commitments
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            What official RAVU partners deliver
                                            to members
                                        </p>
                                    </div>
                                </div>
                                <ul className="mt-5 space-y-3">
                                    {PARTNER_COMMITMENTS.map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-2.5 text-sm text-slate-700"
                                        >
                                            <Check
                                                size={15}
                                                className="mt-0.5 shrink-0 text-[#1864E8]"
                                                strokeWidth={2.5}
                                            />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-7">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1864E8] text-white">
                                        <BadgeCheck size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-950">
                                            RAVU Ltd Commitments
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            How RAVU drives volume and retention
                                            to your branches
                                        </p>
                                    </div>
                                </div>
                                <ul className="mt-5 space-y-3">
                                    {RAVU_COMMITMENTS.map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-2.5 text-sm text-slate-700"
                                        >
                                            <Check
                                                size={15}
                                                className="mt-0.5 shrink-0 text-[#1864E8]"
                                                strokeWidth={2.5}
                                            />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Dar es Salaam Pilot Program Card */}
                    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-[#050B17] to-[#0B3B8C] p-8 text-white shadow-xl sm:p-10">
                        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                            <div className="lg:col-span-7">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-300">
                                    <Compass size={13} />
                                    <span>Structured Phased Rollout</span>
                                </span>
                                <h3 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
                                    Launch via the Dar es Salaam Strategic Pilot
                                    Program
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                    We recommend launching new insurance and
                                    service partnerships through a focused pilot
                                    phase in Dar es Salaam. At the conclusion of
                                    the pilot, both parties evaluate performance
                                    metrics to scale nationwide.
                                </p>

                                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                                            Pilot Location
                                        </p>
                                        <p className="mt-1 text-lg font-black text-white sm:text-xl">
                                            Dar es Salaam
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                                            Initial Cohort
                                        </p>
                                        <p className="mt-1 text-lg font-black text-white sm:text-xl">
                                            200 – 500 Members
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                                            Pilot Duration
                                        </p>
                                        <p className="mt-1 text-lg font-black text-white sm:text-xl">
                                            4 – 6 Months
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-5 rounded-2xl border border-white/15 bg-white/[0.06] p-6">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-sky-300">
                                    Pilot Evaluation Objectives
                                </h4>
                                <ul className="mt-4 space-y-2.5 text-xs text-slate-200">
                                    {[
                                        "Measure member uptake, utilization and partner sales volume",
                                        "Assess product suitability and evaluate discount effectiveness",
                                        "Monitor claims experience and workshop service turnaround",
                                        "Refine member onboarding and digital ID verification workflows",
                                        "Establish operational best practices for national expansion",
                                    ].map((goal) => (
                                        <li
                                            key={goal}
                                            className="flex items-start gap-2.5"
                                        >
                                            <Check
                                                size={14}
                                                className="mt-0.5 shrink-0 text-sky-400"
                                                strokeWidth={2.5}
                                            />
                                            <span>{goal}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Long-Term Strategic Vision & Executive Contact */}
                    <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
                        <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-7 shadow-2xs">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1864E8]">
                                LONG-TERM STRATEGIC VISION
                            </p>
                            <h3 className="mt-2 text-2xl font-black text-slate-950">
                                Evolving into Tanzania&apos;s national mobility
                                support network.
                            </h3>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                {LONG_TERM_ROADMAP.map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                                    >
                                        <h4 className="text-sm font-bold text-slate-950">
                                            {item.title}
                                        </h4>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                            {item.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-7 flex flex-col justify-between">
                            <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF3FE] px-3 py-1 text-[11px] font-bold text-[#1864E8]">
                                    <Award size={13} />
                                    <span>Executive Partnership Desk</span>
                                </span>
                                <h3 className="mt-4 text-xl font-black text-slate-950">
                                    Discuss a Strategic Partnership
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                                    &ldquo;Driving Mobility Forward Through
                                    Partnerships, Savings, and
                                    Opportunity.&rdquo;
                                </p>

                                <div className="mt-5 space-y-2.5 border-t border-slate-200/80 pt-4 text-xs text-slate-700">
                                    <p className="font-bold text-slate-950">
                                        Saleh Nyindo — Founder &amp; CEO, RAVU
                                        Ltd
                                    </p>
                                    <p className="flex items-center gap-2 text-slate-600">
                                        <MapPin
                                            size={14}
                                            className="text-[#1864E8]"
                                        />
                                        <span>Dar es Salaam, Tanzania</span>
                                    </p>
                                    <p className="flex items-center gap-2 text-slate-600">
                                        <Mail
                                            size={14}
                                            className="text-[#1864E8]"
                                        />
                                        <a
                                            href="mailto:nyindo@posteo.de"
                                            className="font-semibold text-[#1864E8] hover:underline"
                                        >
                                            nyindo@posteo.de
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href="/register"
                                    prefetch
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#0B3B8C] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#00289a]"
                                >
                                    <span>Register as a Partner</span>
                                    <ArrowRight size={14} />
                                </Link>
                                <a
                                    href="mailto:nyindo@posteo.de?subject=RAVU%20Strategic%20Partnership%20Inquiry"
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
                                >
                                    <Mail size={13} />
                                    <span>Email Founder &amp; CEO</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <CommunitySection />
        </WebsiteLayout>
    );
}
