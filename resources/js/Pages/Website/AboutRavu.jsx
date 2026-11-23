import { Link } from "@inertiajs/react";
import { ArrowRight, Award, Check, MapPin } from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import {
    EcosystemSection,
    FeatureStrip,
} from "../../Components/sections";
import {
    Headline,
    keyFor,
    resolveMedia,
    useSiteContent,
} from "../../content";
import { iconFor } from "../../content/icons";

export default function AboutRavu() {
    const { seo, hero, values, purpose, vision, leadership } =
        useSiteContent("about");
    const heroImage = resolveMedia(hero.image);

    return (
        <WebsiteLayout seo={seo}>
            {/* ---------------------------------------------------------- HERO */}
            <section className="relative overflow-hidden bg-white">
                <div className="relative flex items-center lg:min-h-[560px] xl:min-h-[600px]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none hidden select-none lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-[64%] xl:w-[62%]"
                    >
                        <img
                            src={heroImage}
                            alt={hero.imageAlt}
                            fetchPriority="high"
                            decoding="async"
                            className="h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-y-0 left-0 w-44 xl:w-56 bg-gradient-to-r from-white via-white/85 to-transparent" />
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
                        <div className="max-w-xl lg:max-w-[540px]">
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

            {/* ------------------------------------------- 3 VALUES STRIP */}
            <FeatureStrip items={values} />

            {/* ------------------------------------------------------- PURPOSE */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {purpose.eyebrow}
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                            <Headline
                                title={purpose.title}
                                highlight={purpose.highlight}
                                highlightClassName="text-[#1864E8]"
                            />
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            {purpose.text}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-3">
                        {purpose.cards.map((card, index) => {
                            const Icon = iconFor(card.icon);
                            return (
                                <div
                                    key={keyFor(card, index)}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md sm:p-7"
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
            </section>

            {/* -------------------- LONG-TERM STRATEGIC VISION & LEADERSHIP */}
            <section className="border-t border-slate-100 bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1864E8]">
                                {vision.eyebrow}
                            </p>
                            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                                <Headline
                                    title={vision.title}
                                    highlight={vision.highlight}
                                    highlightClassName="text-[#1864E8]"
                                />
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                                {vision.text}
                            </p>

                            <ul className="mt-6 space-y-3">
                                {vision.pillars.map((point, index) => (
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
                        </div>

                        {/* Founder & CEO Executive Perspective Card */}
                        <div className="lg:col-span-6">
                            <div className="rounded-3xl bg-[#050B17] p-8 text-white shadow-xl sm:p-10">
                                <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-300">
                                    <Award size={13} />
                                    <span>{leadership.badge}</span>
                                </span>

                                <blockquote className="mt-6 space-y-4">
                                    {leadership.quotes.map((quote, index) => (
                                        <p
                                            key={keyFor(quote, index)}
                                            className={
                                                index === 0
                                                    ? "text-lg font-bold leading-snug text-white sm:text-xl"
                                                    : "text-sm leading-relaxed text-slate-300"
                                            }
                                        >
                                            &ldquo;{quote}&rdquo;
                                        </p>
                                    ))}
                                </blockquote>

                                <div className="mt-7 border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-base font-black text-white">
                                            {leadership.name}
                                        </p>
                                        <p className="text-xs font-semibold text-sky-300">
                                            {leadership.role}
                                        </p>
                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                            <MapPin size={12} />
                                            <span>{leadership.location}</span>
                                            {leadership.email && (
                                                <>
                                                    <span>•</span>
                                                    <a
                                                        href={`mailto:${leadership.email}`}
                                                        className="text-sky-300 hover:underline"
                                                    >
                                                        {leadership.email}
                                                    </a>
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    <Link
                                        href={leadership.cta.href}
                                        prefetch
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#1864E8] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0B3B8C] self-start sm:self-auto"
                                    >
                                        <span>{leadership.cta.label}</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------- ECOSYSTEM */}
            <EcosystemSection />

            <CommunitySection />
        </WebsiteLayout>
    );
}
