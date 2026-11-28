import { Link } from "@inertiajs/react";
import { ArrowRight, Check, UsersRound } from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import EcosystemSlideshow from "../../Components/EcosystemSlideshow";
import { FeatureStrip } from "../../Components/sections";
import {
    Headline,
    keyFor,
    resolveMedia,
    toSlides,
    useSiteContent,
} from "../../content";
import { iconFor } from "../../content/icons";

export default function Membership() {
    const { seo, hero, features, slideshow, categories, meaning, journey, pilot } =
        useSiteContent("membership");
    const heroImage = resolveMedia(hero.image);

    return (
        <WebsiteLayout seo={seo}>
            {/* ------------------------------------------------------------ HERO */}
            <section className="relative overflow-hidden bg-white">
                <div className="relative flex items-center lg:min-h-[560px] xl:min-h-[600px]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none hidden select-none lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-[58%] xl:w-[56%]"
                    >
                        <img
                            src={heroImage}
                            alt={hero.imageAlt}
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
                            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
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

                        <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-100 shadow-lg lg:hidden">
                            <img
                                src={heroImage}
                                alt={hero.imageAlt}
                                fetchPriority="high"
                                decoding="async"
                                className="h-auto w-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ------------------------------------------- 3 PILLARS STRIP */}
            <FeatureStrip items={features} />

            {/* -------------------------------------------------- MEMBERSHIP SLIDESHOW */}
            <EcosystemSlideshow
                eyebrow={slideshow.eyebrow}
                title={slideshow.title}
                highlight={slideshow.highlight}
                description={slideshow.description}
                slides={toSlides(slideshow.slides, "mem-slide")}
            />

            {/* -------------------------------------------------- WHO CAN JOIN */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1864E8]">
                            {categories.eyebrow}
                        </p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                            <Headline
                                title={categories.title}
                                highlight={categories.highlight}
                                highlightClassName="text-[#1864E8]"
                            />
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            {categories.text}
                        </p>
                    </div>

                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {categories.items.map((cat, index) => {
                            const Icon = iconFor(cat.icon);
                            return (
                                <div
                                    key={keyFor(cat, index)}
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
                                {meaning.eyebrow}
                            </p>
                            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                                <Headline
                                    title={meaning.title}
                                    highlight={meaning.highlight}
                                    highlightClassName="text-[#1864E8]"
                                />
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                                {meaning.text}
                            </p>

                            <ul className="mt-6 space-y-3.5">
                                {meaning.items.map((item, index) => (
                                    <li
                                        key={keyFor(item, index)}
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
                            {meaning.cards.map((card, index) => {
                                const Icon = iconFor(card.icon);
                                return (
                                    <div
                                        key={keyFor(card, index)}
                                        className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-7"
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                            <Icon size={20} />
                                        </div>
                                        <h3 className="mt-5 text-lg font-bold text-slate-950">
                                            {card.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                            {card.text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* -------------------------------------------------- MEMBER JOURNEY */}
            <section className="border-t border-slate-100 bg-slate-50/50 py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {journey.eyebrow}
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                            <Headline
                                title={journey.title}
                                highlight={journey.highlight}
                                highlightClassName="text-[#1864E8]"
                            />
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            {journey.text}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {journey.steps.map((step, index) => (
                            <div
                                key={keyFor(step, index)}
                                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md sm:p-7"
                            >
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EBF3FE] text-xs font-black text-[#1864E8]">
                                    {String(index + 1).padStart(2, "0")}
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
                                        {pilot.title}
                                    </h3>
                                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                                        {pilot.badge}
                                    </span>
                                </div>
                                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                                    {pilot.text}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={pilot.cta.href}
                            prefetch
                            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800"
                        >
                            <span>{pilot.cta.label}</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            <CommunitySection />
        </WebsiteLayout>
    );
}
