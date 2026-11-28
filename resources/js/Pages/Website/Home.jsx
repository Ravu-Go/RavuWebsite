import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import StickyShowcase from "../../Components/StickyShowcase";
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
            <section className="relative overflow-hidden bg-white pt-14 pb-10 sm:pt-20 sm:pb-14 lg:pt-24 lg:pb-16">
                <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
                    {/* Eyebrow */}
                    {hero.eyebrow && (
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {hero.eyebrow}
                        </p>
                    )}

                    {/* Centered Headline */}
                    <h1 className="mx-auto mt-5 max-w-4xl text-[2.6rem] font-bold leading-[1.04] tracking-[-0.035em] text-slate-950 text-balance sm:text-6xl lg:text-[4.5rem]">
                        <Headline title={hero.title} highlight={hero.highlight} />
                    </h1>

                    {/* Centered Subhead */}
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 text-pretty sm:text-xl">
                        {hero.text}
                    </p>

                    {/* Centered App Store Buttons */}
                    <div className="mt-10 flex justify-center">
                        <StoreButtons />
                    </div>

                    {/* Where RAVU is live (no stock avatars: they were placeholder faces) */}
                    {hero.socialProof && (
                        <p className="mx-auto mt-6 max-w-xs text-balance text-xs font-medium text-slate-600 sm:max-w-none">
                            <MapPin
                                size={14}
                                className="-mt-0.5 mr-1 inline text-[#1864E8]"
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
            <StickyShowcase
                eyebrow={slideshow.eyebrow}
                title={[slideshow.title, slideshow.highlight].filter(Boolean).join(" ")}
                description={slideshow.description}
                slides={toSlides(slideshow.slides, "home-slide")}
            />

            {/* --------------------------------- THE RAVU APP (PHONE SCREENS) */}
            <section className="overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
                <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                    <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
                        {/* Phone screens: the larger half, bleeding slightly past the column */}
                        <div className="lg:col-span-7">
                            <img
                                src={resolveMedia(appShowcase.image)}
                                alt={appShowcase.imageAlt}
                                loading="lazy"
                                decoding="async"
                                className="mx-auto h-auto w-full max-w-2xl select-none drop-shadow-[0_30px_40px_rgba(15,23,42,0.18)] lg:max-w-none lg:w-[112%] lg:-ml-[6%]"
                            />
                        </div>

                        {/* Text & store badges */}
                        <div className="lg:col-span-5">
                            {appShowcase.eyebrow && (
                                <p className="text-sm font-medium text-[#1864E8]">
                                    {appShowcase.eyebrow}
                                </p>
                            )}
                            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 text-balance sm:text-4xl lg:text-5xl lg:leading-[1.04]">
                                <Headline
                                    title={appShowcase.title}
                                    highlight={appShowcase.highlight}
                                />
                            </h2>
                            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600 text-pretty sm:text-lg">
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
