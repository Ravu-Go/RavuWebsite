import { usePage } from "@inertiajs/react";
import { Fragment, useMemo } from "react";
import global from "../../content/global.json";
import home from "../../content/home.json";
import about from "../../content/about.json";
import forRiders from "../../content/forRiders.json";
import membership from "../../content/membership.json";
import benefits from "../../content/benefits.json";
import partners from "../../content/partners.json";
import howItWorks from "../../content/howItWorks.json";
import support from "../../content/support.json";

/**
 * Default website content. These JSON files are the single source of truth
 * for the site's copy: Laravel seeds/merges from the same files, the Super
 * Admin editor derives its form schema from them, and the static Cloudflare
 * fallback renders them directly.
 */
export const CONTENT_DEFAULTS = {
    global,
    home,
    about,
    forRiders,
    membership,
    benefits,
    partners,
    howItWorks,
    support,
};

const isPlainObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Lay stored content over the defaults so every field the page expects is
 * present. Mirrors App\Services\SiteContentService::conform() in lenient mode.
 */
export function conformContent(value, fallback) {
    if (isPlainObject(fallback)) {
        const source = isPlainObject(value) ? value : {};
        const result = {};
        for (const key of Object.keys(fallback)) {
            result[key] = conformContent(source[key], fallback[key]);
        }
        return result;
    }
    if (Array.isArray(fallback)) {
        if (!Array.isArray(value)) return fallback;
        const template = fallback[0];
        if (template === undefined) return value;
        return value.map((item) => conformContent(item, template));
    }
    if (typeof fallback === "string") {
        return typeof value === "string" ? value : fallback;
    }
    if (typeof fallback === "number") {
        return typeof value === "number" ? value : fallback;
    }
    if (typeof fallback === "boolean") {
        return typeof value === "boolean" ? value : fallback;
    }
    return value ?? fallback;
}

/**
 * Read the published content for a page (or "global") from Inertia props,
 * falling back to the bundled defaults when the server sent none.
 */
export function useSiteContent(key) {
    const { props } = usePage();
    const fromServer =
        key === "global" ? props.site?.global : props.content;

    return useMemo(
        () => conformContent(fromServer, CONTENT_DEFAULTS[key]),
        [fromServer, key],
    );
}

/* -------------------------------------------------------------------------- */
/* Media                                                                      */
/* -------------------------------------------------------------------------- */

const bundledImages = import.meta.glob(
    "../../imgs/*.{jpg,jpeg,webp,JPG}",
    { eager: true, import: "default" },
);
const bundledPngs = import.meta.glob(
    ["../../imgs/welcom.png", "../../imgs/Logo.png", "../../imgs/map.png"],
    { eager: true, import: "default" },
);

/** Built-in images that ship with the site, keyed by filename. */
export const BUNDLED_MEDIA = Object.fromEntries(
    Object.entries({ ...bundledImages, ...bundledPngs }).map(([path, url]) => [
        path.split("/").pop(),
        url,
    ]),
);

// 480px previews of the built-in images, used by the admin media library and pickers
// so they don't download every full-size photo. Regenerate after adding an image:
//   sips -Z 480 -s format jpeg -s formatOptions 72 resources/imgs/<file>.jpg --out resources/imgs/thumbs/<file>.jpg
const bundledThumbs = import.meta.glob("../../imgs/thumbs/*", {
    eager: true,
    import: "default",
});
const BUNDLED_THUMBS = Object.fromEntries(
    Object.entries(bundledThumbs).map(([path, url]) => [path.split("/").pop(), url]),
);

/** A small preview URL for a media value; falls back to the full image. */
export function thumbFor(value) {
    return BUNDLED_THUMBS[value] || resolveMedia(value);
}

/**
 * Turn a stored media value into a URL. Values are either a bundled filename
 * ("rider.jpg"), an uploaded file path ("/storage/site-media/x.jpg") or an
 * absolute URL.
 */
export function resolveMedia(value) {
    if (!value || typeof value !== "string") return undefined;
    if (/^(https?:)?\/\//.test(value) || value.startsWith("/")) return value;
    return BUNDLED_MEDIA[value];
}

/* -------------------------------------------------------------------------- */
/* Text helpers                                                               */
/* -------------------------------------------------------------------------- */

/** Render text where "\n" becomes a line break. */
export function Lines({ text }) {
    if (!text) return null;
    const parts = String(text).split("\n");
    return parts.map((part, index) => (
        <Fragment key={index}>
            {part}
            {index < parts.length - 1 && <br />}
        </Fragment>
    ));
}

/** Headline with an optional highlighted tail, e.g. "Pay less to keep <span>your vehicle on the road.</span>". */
export function Headline({ title, highlight, highlightClassName }) {
    return (
        <>
            <Lines text={title} />
            {highlight && (
                <>
                    {title && !String(title).endsWith("\n") ? " " : null}
                    <span className={highlightClassName}>{highlight}</span>
                </>
            )}
        </>
    );
}

/** Stable React keys for content lists that have no ids. */
export const keyFor = (item, index) =>
    `${index}-${typeof item === "string" ? item : item?.title || item?.label || item?.question || ""}`;

/** Map slideshow content to the props EcosystemSlideshow expects. */
export const toSlides = (slides = [], prefix = "slide") =>
    slides.map((slide, index) => ({
        ...slide,
        id: `${prefix}-${index}`,
        image: resolveMedia(slide.image),
    }));
