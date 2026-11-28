import { Link } from "@inertiajs/react";
import { ArrowRight, MessageSquare } from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import ViewportVideo from "../../Components/ViewportVideo";
import CommunitySection from "../../Components/CommunitySection";
import {
    FAQAccordion,
    FeatureStrip,
} from "../../Components/sections";
import supportVideo from "../../../imgs/Headset.mp4";
import supportPoster from "../../../imgs/Headset-poster.jpg";

import { Headline, useSiteContent } from "../../content";

export default function Support() {
    const { seo, hero, features, faq, assist } = useSiteContent("support");

    return (
        <WebsiteLayout seo={seo}>
            {/* ---------------------------------------------------------- HERO */}
            <section className="relative overflow-hidden bg-white">
                <div className="relative flex items-center lg:min-h-[540px] xl:min-h-[580px]">
                    {/* Right-side blended background image on desktop */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none hidden select-none lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-[58%] xl:w-[56%]"
                    >
                        <ViewportVideo
                            src={supportVideo}
                            poster={supportPoster}
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
                            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                {hero.eyebrow}
                            </span>

                            {/* Stacked Bold Headline */}
                            <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-[#050B17] sm:text-5xl lg:text-[3.35rem]">
                                <Headline
                                    title={hero.title}
                                    highlight={hero.highlight}
                                    highlightClassName="text-[#1864E8]"
                                />
                            </h1>

                            {/* Body Copy */}
                            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-[17px]">
                                {hero.text}
                            </p>

                            {/* Primary & Secondary Action Buttons */}
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
                        <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg lg:hidden">
                            <ViewportVideo
                                src={supportVideo}
                                poster={supportPoster}
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
            <FeatureStrip items={features} />

            {/* ---------------------------------------------------- FAQ SECTION */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                {faq.eyebrow}
                            </p>
                            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                                <Headline
                                    title={faq.title}
                                    highlight={faq.highlight}
                                    highlightClassName="text-[#1864E8]"
                                />
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                                {faq.text}
                            </p>

                            <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                    <MessageSquare size={18} />
                                </div>
                                <h3 className="mt-4 text-base font-bold text-slate-950">
                                    {assist.title}
                                </h3>
                                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                                    {assist.text}
                                </p>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Link
                                        href={assist.primaryCta.href}
                                        prefetch
                                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800"
                                    >
                                        <span>{assist.primaryCta.label}</span>
                                        <ArrowRight size={13} />
                                    </Link>
                                    <Link
                                        href={assist.secondaryCta.href}
                                        prefetch
                                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                                    >
                                        {assist.secondaryCta.label}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <FAQAccordion items={faq.items} />
                        </div>
                    </div>
                </div>
            </section>

            <CommunitySection />
        </WebsiteLayout>
    );
}
