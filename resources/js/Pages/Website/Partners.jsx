import { Link } from "@inertiajs/react";
import {
    ArrowRight,
    Award,
    BadgeCheck,
    Check,
    Compass,
    Handshake,
    Mail,
    MapPin,
    ShieldCheck,
    Store,
    Truck,
    Wrench,
} from "lucide-react";
import { useState } from "react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import EcosystemSlideshow from "../../Components/EcosystemSlideshow";
import { FeatureStrip } from "../../Components/sections";
import {
    Headline,
    keyFor,
    Lines,
    resolveMedia,
    toSlides,
    useSiteContent,
} from "../../content";
import { iconFor } from "../../content/icons";

export default function Partners() {
    const [activeProgram, setActiveProgram] = useState("insurance"); // insurance | maintenance
    const {
        seo,
        hero,
        features,
        slideshow,
        segments,
        programs,
        operations,
        responsibility,
        pilot,
        roadmap,
        contact,
    } = useSiteContent("partners");
    const { insurance, maintenance } = programs;
    const heroImage = resolveMedia(hero.image);
    const operationsImage = resolveMedia(operations.image);

    return (
        <WebsiteLayout seo={seo}>
            {/* ---------------------------------------------------------- HERO */}
            <section className="relative overflow-hidden bg-white">
                <div className="relative lg:min-h-[560px] xl:min-h-[600px] flex items-center">
                    {/* Right-side blended background image on desktop */}
                    <div
                        aria-hidden="true"
                        className="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-[66%] xl:w-[64%] select-none pointer-events-none"
                    >
                        <img
                            src={heroImage}
                            alt={hero.imageAlt}
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
                                {hero.eyebrow}
                            </span>

                            <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-[#050B17] sm:text-5xl lg:text-[3.35rem]">
                                <Headline
                                    title={hero.title}
                                    highlight={hero.highlight}
                                    highlightClassName="text-[#1864E8]"
                                />
                            </h1>

                            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-[17px]">
                                {hero.text}
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-3.5">
                                <Link
                                    href={hero.primaryCta.href}
                                    prefetch
                                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#0B3B8C] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#00289a] active:scale-[0.98]"
                                >
                                    <span>{hero.primaryCta.label}</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    href={hero.secondaryCta.href}
                                    prefetch
                                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white/95 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-2xs transition-colors hover:border-slate-400 hover:bg-slate-50"
                                >
                                    {hero.secondaryCta.label}
                                </Link>
                            </div>
                        </div>

                        {/* Mobile / Tablet Image Presentation */}
                        <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-100 shadow-lg lg:hidden">
                            <img
                                src={heroImage}
                                alt={hero.imageAlt}
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
            <FeatureStrip items={features} />

            {/* -------------------- VISUAL PARTNERSHIP SLIDESHOW */}
            <EcosystemSlideshow
                eyebrow={slideshow.eyebrow}
                title={slideshow.title}
                highlight={slideshow.highlight}
                description={slideshow.description}
                slides={toSlides(slideshow.slides, "partner-slide")}
            />

            {/* -------------------- 6 TARGET CUSTOMER SEGMENTS (BEYOND RIDERS) */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1864E8]">
                            {segments.eyebrow}
                        </p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                            <Headline
                                title={segments.title}
                                highlight={segments.highlight}
                                highlightClassName="text-[#1864E8]"
                            />
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            {segments.text}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {segments.items.map((seg, segIndex) => {
                            const Icon = iconFor(seg.icon);
                            return (
                                <div
                                    key={keyFor(seg, segIndex)}
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
                                            {seg.items.map((item, index) => (
                                                <li
                                                    key={keyFor(item, index)}
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
                                {programs.eyebrow}
                            </p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                                <Headline
                                    title={programs.title}
                                    highlight={programs.highlight}
                                    highlightClassName="text-[#1864E8]"
                                />
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                                {programs.text}
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
                                <span>{programs.insuranceTab}</span>
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
                                <span>{programs.maintenanceTab}</span>
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
                                            <span>{insurance.badge}</span>
                                        </span>
                                        <h3 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
                                            {insurance.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                            {insurance.text}
                                        </p>
                                    </div>

                                    <div className="lg:col-span-5">
                                        <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-6">
                                            <p className="text-xs font-bold uppercase tracking-wider text-sky-300">
                                                {insurance.discountLabel}
                                            </p>
                                            <p className="mt-2 text-3xl font-black text-white sm:text-4xl">
                                                {insurance.discountValue}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-300">
                                                {insurance.discountText}
                                            </p>
                                            <div className="mt-4 border-t border-white/10 pt-4 text-xs text-slate-300">
                                                <p className="font-semibold text-white">
                                                    {insurance.valueAddedIntro}
                                                </p>
                                                <p className="mt-1 text-slate-300">
                                                    {insurance.valueAddedText}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 8 Proposed Insurance Product Lines (A - H) */}
                            <div>
                                <h3 className="text-lg font-black text-slate-950 sm:text-xl">
                                    {insurance.productsTitle}
                                </h3>
                                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                                    {insurance.productsText}
                                </p>

                                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {insurance.products.map((prod, prodIndex) => (
                                        <div
                                            key={keyFor(prod, prodIndex)}
                                            className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EBF3FE] text-xs font-black text-[#1864E8]">
                                                        {prod.code}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                                                        {insurance.productBadge}
                                                    </span>
                                                </div>
                                                <h4 className="mt-4 text-sm font-bold text-slate-950">
                                                    {prod.title}
                                                </h4>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {prod.target}
                                                </p>
                                                <ul className="mt-3.5 space-y-1.5 border-t border-slate-100 pt-3">
                                                    {prod.coverage.map((c, index) => (
                                                        <li
                                                            key={keyFor(c, index)}
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
                                            <span>{maintenance.badge}</span>
                                        </span>
                                        <h3 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
                                            {maintenance.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                            {maintenance.text}
                                        </p>
                                    </div>

                                    <div className="lg:col-span-6 grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-5">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                                                {maintenance.partsLabel}
                                            </p>
                                            <p className="mt-2 text-2xl font-black text-white sm:text-3xl">
                                                {maintenance.partsValue}
                                            </p>
                                            <p className="mt-1.5 text-xs text-slate-300">
                                                {maintenance.partsText}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-5">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                                                {maintenance.garageLabel}
                                            </p>
                                            <p className="mt-2 text-2xl font-black text-white sm:text-3xl">
                                                {maintenance.garageValue}
                                            </p>
                                            <p className="mt-1.5 text-xs text-slate-300">
                                                {maintenance.garageText}
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
                                            {maintenance.partsList.badge}
                                        </span>
                                        <Store
                                            size={18}
                                            className="text-slate-400"
                                        />
                                    </div>
                                    <h4 className="mt-4 text-base font-bold text-slate-950">
                                        {maintenance.partsList.title}
                                    </h4>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {maintenance.partsList.text}
                                    </p>
                                    <ul className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                                        {maintenance.partsList.items.map((item, index) => (
                                            <li
                                                key={keyFor(item, index)}
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
                                            {maintenance.garageList.badge}
                                        </span>
                                        <Wrench
                                            size={18}
                                            className="text-slate-400"
                                        />
                                    </div>
                                    <h4 className="mt-4 text-base font-bold text-slate-950">
                                        {maintenance.garageList.title}
                                    </h4>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {maintenance.garageList.text}
                                    </p>
                                    <ul className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                                        {maintenance.garageList.items.map((item, index) => (
                                            <li
                                                key={keyFor(item, index)}
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
                                                {maintenance.fleetList.badge}
                                            </span>
                                            <Truck
                                                size={18}
                                                className="text-slate-400"
                                            />
                                        </div>
                                        <h4 className="mt-4 text-base font-bold text-slate-950">
                                            {maintenance.fleetList.title}
                                        </h4>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {maintenance.fleetList.text}
                                        </p>
                                        <ul className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                                            {maintenance.fleetList.items.map(
                                                (item, index) => (
                                                    <li
                                                        key={keyFor(item, index)}
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
                                        {maintenance.fleetList.footnote}
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
                            src={operationsImage}
                            alt={operations.imageAlt}
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
                                {operations.eyebrow}
                            </span>

                            <h2 className="mt-5 text-3xl font-black leading-[1.08] tracking-tight text-[#050B17] sm:text-4xl lg:text-[2.85rem]">
                                <Headline
                                    title={operations.title}
                                    highlight={operations.highlight}
                                    highlightClassName="text-[#1864E8]"
                                />
                            </h2>

                            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 sm:text-[17px]">
                                {operations.text}
                            </p>

                            <ul className="mt-6 space-y-3">
                                {operations.points.map((point, index) => (
                                    <li
                                        key={keyFor(point, index)}
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
                                    href={operations.primaryCta.href}
                                    prefetch
                                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#0B3B8C] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#00289a] active:scale-[0.98]"
                                >
                                    <span>{operations.primaryCta.label}</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    href={operations.secondaryCta.href}
                                    prefetch
                                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white/95 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-2xs transition-colors hover:border-slate-400 hover:bg-slate-50"
                                >
                                    {operations.secondaryCta.label}
                                </Link>
                            </div>
                        </div>

                        <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-100 shadow-lg lg:hidden">
                            <img
                                src={operationsImage}
                                alt={operations.imageAlt}
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
                                {responsibility.eyebrow}
                            </p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                                <Headline
                                    title={responsibility.title}
                                    highlight={responsibility.highlight}
                                    highlightClassName="text-[#1864E8]"
                                />
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
                                            {responsibility.partnerTitle}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {responsibility.partnerSubtitle}
                                        </p>
                                    </div>
                                </div>
                                <ul className="mt-5 space-y-3">
                                    {responsibility.partnerItems.map((item, index) => (
                                        <li
                                            key={keyFor(item, index)}
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
                                            {responsibility.ravuTitle}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {responsibility.ravuSubtitle}
                                        </p>
                                    </div>
                                </div>
                                <ul className="mt-5 space-y-3">
                                    {responsibility.ravuItems.map((item, index) => (
                                        <li
                                            key={keyFor(item, index)}
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
                                    <span>{pilot.badge}</span>
                                </span>
                                <h3 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
                                    {pilot.title}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                    {pilot.text}
                                </p>

                                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                                    {pilot.stats.map((stat, index) => (
                                        <div key={keyFor(stat, index)}>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                                                {stat.label}
                                            </p>
                                            <p className="mt-1 text-lg font-black text-white sm:text-xl">
                                                {stat.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-5 rounded-2xl border border-white/15 bg-white/[0.06] p-6">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-sky-300">
                                    {pilot.objectivesTitle}
                                </h4>
                                <ul className="mt-4 space-y-2.5 text-xs text-slate-200">
                                    {pilot.objectives.map((goal, index) => (
                                        <li
                                            key={keyFor(goal, index)}
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
                                {roadmap.eyebrow}
                            </p>
                            <h3 className="mt-2 text-2xl font-black text-slate-950">
                                <Lines text={roadmap.title} />
                            </h3>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                {roadmap.items.map((item, index) => (
                                    <div
                                        key={keyFor(item, index)}
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
                                    <span>{contact.badge}</span>
                                </span>
                                <h3 className="mt-4 text-xl font-black text-slate-950">
                                    {contact.title}
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                                    &ldquo;{contact.quote}&rdquo;
                                </p>

                                <div className="mt-5 space-y-2.5 border-t border-slate-200/80 pt-4 text-xs text-slate-700">
                                    <p className="font-bold text-slate-950">
                                        {contact.person}
                                    </p>
                                    <p className="flex items-center gap-2 text-slate-600">
                                        <MapPin
                                            size={14}
                                            className="text-[#1864E8]"
                                        />
                                        <span>{contact.location}</span>
                                    </p>
                                    <p className="flex items-center gap-2 text-slate-600">
                                        <Mail
                                            size={14}
                                            className="text-[#1864E8]"
                                        />
                                        <a
                                            href={`mailto:${contact.email}`}
                                            className="font-semibold text-[#1864E8] hover:underline"
                                        >
                                            {contact.email}
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href={contact.primaryCta.href}
                                    prefetch
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#0B3B8C] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#00289a]"
                                >
                                    <span>{contact.primaryCta.label}</span>
                                    <ArrowRight size={14} />
                                </Link>
                                <a
                                    href={`mailto:${contact.email}?subject=${encodeURIComponent(contact.emailSubject)}`}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
                                >
                                    <Mail size={13} />
                                    <span>{contact.emailLabel}</span>
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
