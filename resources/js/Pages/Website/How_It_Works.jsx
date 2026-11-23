import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import {
    AppPromo,
    EcosystemSection,
    FeatureStrip,
    Hero,
} from "../../Components/sections";

import { Headline, keyFor, useSiteContent } from "../../content";
import { iconFor } from "../../content/icons";

export default function HowItWorks() {
    const { seo, hero, features, steps, sides } = useSiteContent("howItWorks");

    return (
        <WebsiteLayout seo={seo}>
            {/* ---------------------------------------------------------- HERO */}
            <Hero
                eyebrow={hero.eyebrow}
                title={hero.title}
                highlight={hero.highlight}
                text={hero.text}
                primary={hero.primaryCta}
                secondary={hero.secondaryCta}
            />

            {/* ------------------------------------------- 3 PILLARS STRIP */}
            <FeatureStrip items={features} />

            {/* --------------------------------------------------- THE JOURNEY */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {steps.eyebrow}
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                            <Headline
                                title={steps.title}
                                highlight={steps.highlight}
                                highlightClassName="text-[#1864E8]"
                            />
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            {steps.text}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {steps.items.map((step, index) => (
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
                </div>
            </section>

            {/* ---------------------------------------------- MEMBERS AT CENTRE */}
            <section className="border-t border-slate-100 bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {sides.eyebrow}
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:leading-[1.1]">
                            <Headline
                                title={sides.title}
                                highlight={sides.highlight}
                                highlightClassName="text-[#1864E8]"
                            />
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-6 lg:grid-cols-2">
                        {sides.cards.map((card, index) => {
                            const Icon = iconFor(card.icon);
                            return (
                                <div
                                    key={keyFor(card, index)}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-2xs sm:p-8"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="mt-5 text-xl font-bold text-slate-950">
                                        {card.title}
                                    </h3>
                                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                                        {card.text}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <EcosystemSection />

            <AppPromo />

            <CommunitySection />
        </WebsiteLayout>
    );
}
