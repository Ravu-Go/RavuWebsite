import { Link } from "@inertiajs/react";
import {
    ArrowRight,
    BadgeCheck,
    Banknote,
    Car,
    Check,
    HeartHandshake,
    HeartPulse,
    ShieldCheck,
    Truck,
    Wrench,
    Zap,
} from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import EcosystemSlideshow from "../../Components/EcosystemSlideshow";
import { AppPromo, FeatureStrip, Hero } from "../../Components/sections";
import workshopImg from "../../../imgs/fundRepairShop.jpg";
import fleetMultiVehicleImg from "../../../imgs/ravu_fleet_multi_vehicle.jpg";
import insuranceProtectionImg from "../../../imgs/ravu_insurance_protection.jpg";
import sparePartsGarageImg from "../../../imgs/ravu_spare_parts_garage.jpg";
import memberPartnersImg from "../../../imgs/memberPlusPartners.jpg";

const BENEFIT_SLIDES = [
    {
        id: "ben-slide-insurance",
        tabLabel: "20%–30% Off Insurance",
        badge: "20% – 30% Preferred Member Discount",
        caption: "8 Protection Lines",
        eyebrow: "INSURANCE & PROTECTION BENEFITS",
        title: "Comprehensive protection for your ride, family and fleet.",
        description:
            "Verified RAVU members access preferred insurance pricing and simplified enrollment across motorcycles, Bajaj, private family cars, commercial fleets, health and personal accident cover.",
        bullets: [
            "Minimum 20% target discount on standard insurance premiums",
            "Reduced deductibles/excess, priority claims & flexible payment plans",
            "Emergency roadside assistance & claim-free loyalty rewards",
        ],
        ctaLabel: "Register for Benefits",
        ctaHref: "/register",
        image: insuranceProtectionImg,
        imageAlt:
            "RAVU member reviewing discounted insurance policy in Dar es Salaam",
    },
    {
        id: "ben-slide-parts",
        tabLabel: "10%–25% Off Spare Parts",
        badge: "10% – 25% OFF Genuine Parts & Tires",
        caption: "Official Parts & Garage Network",
        eyebrow: "MAINTENANCE & GARAGE BENEFITS",
        title: "Genuine spare parts, tires, batteries and priority workshop bays.",
        description:
            "Reduce your daily operating costs and minimize vehicle downtime with guaranteed member discounts on parts and mechanical labor across Tanzania.",
        bullets: [
            "10%–25% OFF motorcycle, car, truck & bus spare parts",
            "10%–25% OFF tires, batteries, engine lubricants & filters",
            "5%–20% OFF engine servicing, brakes, suspension & diagnostics",
        ],
        ctaLabel: "Explore Membership",
        ctaHref: "/membership",
        image: sparePartsGarageImg,
        imageAlt:
            "RAVU partner garage and spare parts shop in Dar es Salaam",
    },
    {
        id: "ben-slide-fleet",
        tabLabel: "Fleet & Multi-Vehicle",
        badge: "Volume Pricing & Priority Booking",
        caption: "All 6 Mobility Categories",
        eyebrow: "COMMERCIAL FLEET DISCOUNT PROGRAM",
        title: "Tailored savings for private cars, trucks, buses and commercial fleets.",
        description:
            "Whether you own a single motorcycle, a family SUV or a commercial fleet of delivery vans, trucks and buses, RAVU scales your savings across every vehicle.",
        bullets: [
            "Volume-based pricing & bulk spare-parts discounts for fleets",
            "Priority service bay booking & dedicated account management",
            "Customized preventive maintenance & fleet insurance packages",
        ],
        ctaLabel: "Partner or Enquire",
        ctaHref: "/partners",
        image: fleetMultiVehicleImg,
        imageAlt:
            "Motorcycles, Bajaj, SUV, commercial truck and bus in Dar es Salaam",
    },
    {
        id: "ben-slide-redemption",
        tabLabel: "Instant ID Redemption",
        badge: "Verified RAVU Member ID",
        caption: "Seamless Point-of-Sale Recognition",
        eyebrow: "EFFORTLESS REDEMPTION",
        title: "Show your RAVU Member ID and save immediately at partner locations.",
        description:
            "No complicated paperwork — partner staff verify your RAVU Member ID in seconds through the Partner Portal and apply your member discount on the spot.",
        bullets: [
            "Recognized at participating insurers, garages, parts shops & stations",
            "Transparent discount terms and warranty support",
            "Track all your member benefits inside the RAVU mobile app",
        ],
        ctaLabel: "Get the RAVU App",
        ctaHref: "/for-riders",
        image: memberPartnersImg,
        imageAlt: "RAVU members and partner businesses connecting",
    },
];

const BENEFIT_PILLARS = [
    {
        icon: ShieldCheck,
        title: "20% – 30% Insurance Savings",
        text: "Preferred member discounts across motorcycle, Bajaj, car, fleet, health and family insurance.",
    },
    {
        icon: Wrench,
        title: "10% – 25% Off Spare Parts",
        text: "Exclusive savings on genuine parts, tires, batteries, lubricants and filters.",
    },
    {
        icon: BadgeCheck,
        title: "5% – 20% Off Garage Services",
        text: "Priority servicing, repairs, diagnostics and inspections at official partner garages.",
    },
];

const BENEFIT_AREAS = [
    {
        icon: ShieldCheck,
        badge: "20% – 30% Member Discount Target",
        title: "Exclusive Insurance & Protection Program",
        text: "Access discounted comprehensive and third-party coverage for motorcycles (boda boda), Bajaj three-wheelers, private family vehicles and commercial fleets — plus personal accident, health/medical, family life protection and SME business insurance.",
        bullets: [
            "Reduced deductibles/excess & priority claims processing",
            "Complimentary personal accident & passenger protection options",
            "24/7 emergency roadside assistance & flexible payment plans",
            "Family medical extensions & claim-free loyalty rewards",
        ],
    },
    {
        icon: Wrench,
        badge: "10% – 25% Off Parts • 5% – 20% Off Labor",
        title: "Spare Parts, Tires, Batteries & Garage Program",
        text: "Lower your biggest operational expense with guaranteed member discounts at official spare parts suppliers, tire centers and mechanical garages across Tanzania.",
        bullets: [
            "10%–25% OFF motorcycle, car, truck & bus spare parts",
            "10%–25% OFF tires, batteries, engine lubricants & filters",
            "5%–20% OFF routine servicing, engine, brake & suspension repairs",
            "Priority service bays to minimize vehicle downtime",
        ],
    },
    {
        icon: Truck,
        badge: "Commercial & Fleet Operators",
        title: "Fleet Discount & Maintenance Program",
        text: "Built for transport companies, delivery businesses, logistics providers, bus operators and motorcycle fleet owners seeking predictable maintenance and lower operating costs.",
        bullets: [
            "Volume-based pricing & bulk spare-parts discounts",
            "Priority service booking & dedicated account management",
            "Customized preventive maintenance & inspection packages",
            "Preferential commercial fleet insurance rates",
        ],
    },
    {
        icon: Banknote,
        badge: "Financial Inclusion & Wellness",
        title: "Financial Access, Fuel & Family Prosperity",
        text: "Connect with fuel cashback offers, financial wellness initiatives, asset financing partners and savings-linked protection built around daily mobility earnings.",
        bullets: [
            "Fuel & lubricant cashback at participating stations",
            "Education protection & family welfare packages",
            "Tier-based member rewards for safe, claim-free operators",
            "Professional development & business growth support",
        ],
    },
];

export default function Benefits() {
    return (
        <WebsiteLayout>
            {/* ---------------------------------------------------------- HERO */}
            <Hero
                eyebrow="EXCLUSIVE MEMBER BENEFITS"
                title="Measurable savings around"
                highlight="every mobility journey."
                text="RAVU aggregates the purchasing power of riders, drivers, private vehicle owners and commercial fleets to unlock exclusive 20%–30% insurance discounts, 10%–25% spare parts savings and 5%–20% garage service discounts."
                primary={{ label: "Explore Membership", href: "/membership" }}
                secondary={{ label: "Partner With RAVU", href: "/partners" }}
                media={workshopImg}
                mediaAlt="RAVU member accessing workshop maintenance benefits"
                layout="split"
            />

            {/* ------------------------------------------- 3 PILLARS STRIP */}
            <FeatureStrip items={BENEFIT_PILLARS} />

            {/* ------------------------------------------------ BENEFITS SLIDESHOW */}
            <EcosystemSlideshow
                eyebrow="VISUAL BENEFITS TOUR"
                title="See how RAVU membership"
                highlight="lowers your everyday costs."
                description="Browse our flagship member benefit programs across insurance protection, genuine spare parts, mechanical servicing and fleet operations."
                slides={BENEFIT_SLIDES}
            />

            {/* ------------------------------------------------ BENEFIT CARDS */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1864E8]">
                            MEASURABLE FINANCIAL ADVANTAGE
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                            Benefits that lower costs and{" "}
                            <span className="text-[#1864E8]">
                                protect livelihoods.
                            </span>
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            Every RAVU partnership is structured around clear
                            discount benchmarks and priority service standards —
                            serving boda boda riders, Bajaj operators, private
                            car owners, families, trucks, buses and commercial
                            fleets.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2">
                        {BENEFIT_AREAS.map((area) => {
                            const Icon = area.icon;
                            return (
                                <div
                                    key={area.title}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md sm:p-8 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                                <Icon size={20} />
                                            </div>
                                            <span className="rounded-full bg-[#EBF3FE] px-3 py-1 text-[11px] font-bold text-[#1864E8]">
                                                {area.badge}
                                            </span>
                                        </div>
                                        <h3 className="mt-5 text-lg font-bold text-slate-950">
                                            {area.title}
                                        </h3>
                                        <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                                            {area.text}
                                        </p>
                                        <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                                            {area.bullets.map((b) => (
                                                <li
                                                    key={b}
                                                    className="flex items-start gap-2.5 text-xs font-medium text-slate-700"
                                                >
                                                    <Check
                                                        size={14}
                                                        className="mt-0.5 shrink-0 text-[#1864E8]"
                                                        strokeWidth={2.5}
                                                    />
                                                    <span>{b}</span>
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

            <AppPromo />

            <CommunitySection />
        </WebsiteLayout>
    );
}
