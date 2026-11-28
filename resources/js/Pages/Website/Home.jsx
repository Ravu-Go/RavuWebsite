import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import EcosystemSlideshow from "../../Components/EcosystemSlideshow";
import ViewportVideo from "../../Components/ViewportVideo";
import headerVideo from "../../../imgs/Header.mp4";
import headerPoster from "../../../imgs/Header.jpg";
import { StoreButtons } from "../../Components/sections";
import {
    Headline,
    keyFor,
    resolveMedia,
    toSlides,
    useSiteContent,
} from "../../content";
import { iconFor } from "../../content/icons";
import { MapPin } from "lucide-react";

export default function Home() {
    const { seo, hero, features, slideshow, appShowcase } =
        useSiteContent("home");

    return (
        <WebsiteLayout seo={seo}>
            {/* ---------------------------------------------------------- HERO */}
            <section className="relative overflow-hidden bg-white pt-12 pb-10 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16">
                <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
                    {/* Eyebrow */}
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {hero.eyebrow}
                    </p>

                    {/* Centered Headline */}
                    <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                        <Headline
                            title={hero.title}
                            highlight={hero.highlight}
                            highlightClassName="text-[#1864E8]"
                        />
                    </h1>

                    {/* Centered Subhead */}
                    <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                        {hero.text}
                    </p>

                    {/* Centered App Store Buttons */}
                    <div className="mt-8 flex justify-center">
                        <StoreButtons />
                    </div>

                    {/* Where RAVU is live (no stock avatars: they were placeholder faces) */}
                    {hero.socialProof && (
                        <p className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-1.5 text-balance text-xs font-medium text-slate-600 sm:max-w-none">
                            <MapPin
                                size={14}
                                className="shrink-0 text-[#1864E8]"
                                aria-hidden="true"
                            />
                            {hero.socialProof}
                        </p>
                    )}
                </div>

                {/* Edge-to-Edge Full-Width Header Video */}
                <div className="relative mt-10 w-full sm:mt-14">
                    <ViewportVideo
                        src={headerVideo}
                        poster={headerPoster}
                        className="h-auto w-full object-contain select-none"
                    />
                </div>
            </section>

            {/* ------------------------------------------- 3 FEATURES STRIP */}
            <section className="border-t border-b border-slate-100 bg-white py-10 sm:py-14">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-y-0 sm:divide-x sm:divide-slate-200/80">
                        {features.map((feature, index) => {
                            const Icon = iconFor(feature.icon);
                            return (
                                <div
                                    key={keyFor(feature, index)}
                                    className="flex items-center gap-4 py-4 sm:py-0 sm:px-6 first:pl-0 last:pr-0"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-[#1864E8]">
                                        <Icon
                                            size={20}
                                            className={
                                                feature.icon === "Zap"
                                                    ? "fill-[#1864E8]"
                                                    : undefined
                                            }
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-0.5 max-w-[210px] text-xs leading-relaxed text-slate-500">
                                            {feature.text}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ----------------------- INTERACTIVE ECOSYSTEM SLIDESHOW */}
            <EcosystemSlideshow
                eyebrow={slideshow.eyebrow}
                title={slideshow.title}
                highlight={slideshow.highlight}
                description={slideshow.description}
                slides={toSlides(slideshow.slides, "home-slide")}
            />

            {/* --------------------------------- THE RAVU APP (MAP SCREEN) */}
            <section className="overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                        {/* Map Phone Image on the Left */}
                        <div className="flex justify-center lg:col-span-6">
                            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
                                <img
                                    src={resolveMedia(appShowcase.image)}
                                    alt={appShowcase.imageAlt}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-auto w-full select-none drop-shadow-xl"
                                />
                            </div>
                        </div>

                        {/* Text & Store Badges on the Right */}
                        <div className="lg:col-span-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                {appShowcase.eyebrow}
                            </p>
                            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.1]">
                                <Headline
                                    title={appShowcase.title}
                                    highlight={appShowcase.highlight}
                                    highlightClassName="text-[#1864E8]"
                                />
                            </h2>
                            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
                                {appShowcase.text}
                            </p>
                            <div className="mt-8">
                                <StoreButtons />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ----------------------- PILOT STATUS & STATS (CITY SKYLINE) */}
            <CommunitySection />
        </WebsiteLayout>
    );
}
