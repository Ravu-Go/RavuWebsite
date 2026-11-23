import { Link } from "@inertiajs/react";
import { Check } from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import EcosystemSlideshow from "../../Components/EcosystemSlideshow";
import { AppPromo, FeatureStrip, Hero } from "../../Components/sections";
import {
    Headline,
    keyFor,
    resolveMedia,
    toSlides,
    useSiteContent,
} from "../../content";
import { iconFor } from "../../content/icons";

export default function Benefits() {
    const { seo, hero, features, slideshow, areas } = useSiteContent("benefits");

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
                media={resolveMedia(hero.image)}
                mediaAlt={hero.imageAlt}
                layout="split"
            />

            {/* ------------------------------------------- 3 PILLARS STRIP */}
            <FeatureStrip items={features} />

            {/* ------------------------------------------------ BENEFITS SLIDESHOW */}
            <EcosystemSlideshow
                eyebrow={slideshow.eyebrow}
                title={slideshow.title}
                highlight={slideshow.highlight}
                description={slideshow.description}
                slides={toSlides(slideshow.slides, "ben-slide")}
            />

            {/* ------------------------------------------------ BENEFIT CARDS */}
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1864E8]">
                            {areas.eyebrow}
                        </p>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                            <Headline
                                title={areas.title}
                                highlight={areas.highlight}
                                highlightClassName="text-[#1864E8]"
                            />
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            {areas.text}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2">
                        {areas.items.map((area, index) => {
                            const Icon = iconFor(area.icon);
                            return (
                                <div
                                    key={keyFor(area, index)}
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
                                            {area.bullets.map((b, bulletIndex) => (
                                                <li
                                                    key={keyFor(b, bulletIndex)}
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
