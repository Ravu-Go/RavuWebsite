import { router } from "@inertiajs/react";
import {
    ArrowDown,
    ArrowUp,
    ChevronDown,
    ChevronRight,
    ImageIcon,
    Plus,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { BUNDLED_MEDIA, thumbFor } from "../../content";
import { ICON_NAMES, iconFor } from "../../content/icons";

/* ==========================================================================
   Schema-driven content editor.
   The page's default JSON is the schema: objects become field groups, lists
   become repeatable cards, and field names decide the input type.
   ========================================================================== */

const LABELS = {
    seo: "Search engine listing (SEO)",
    hero: "Hero (top of page)",
    eyebrow: "Eyebrow (small label above the title)",
    title: "Title",
    highlight: "Highlighted words (shown in blue)",
    text: "Body text",
    description: "Description",
    primaryCta: "Primary button",
    secondaryCta: "Secondary button",
    cta: "Button",
    label: "Label",
    href: "Link",
    ctaLabel: "Button label",
    ctaHref: "Button link",
    image: "Image",
    imageAlt: "Image description (alt text, for accessibility)",
    tabLabel: "Tab label",
    socialProof: "Social proof line",
    features: "Feature strip (3 highlights)",
    slideshow: "Image slideshow",
    slides: "Slides",
    bullets: "Bullet points",
    items: "Items",
    stats: "Statistics",
    faq: "FAQs",
    question: "Question",
    answer: "Answer",
    appLinks: "App store links",
    appStoreUrl: "Apple App Store link",
    googlePlayUrl: "Google Play link",
    menuGroups: "Expanded menu groups",
    links: "Links",
    legalLinks: "Legal links (bottom bar)",
    socials: "Social media profiles",
    platform: "Platform (Instagram, X, Facebook, LinkedIn, YouTube)",
    url: "Link",
    appPromo: "App promo section",
    ecosystem: "Ecosystem section",
    community: "Community & statistics banner",
    brand: "Brand & contact",
    navigation: "Navigation bar & menu",
    footer: "Footer",
};

const LONG_TEXT_KEYS = new Set([
    "text",
    "description",
    "answer",
    "footerQuote",
    "discountText",
    "valueAddedText",
    "productsText",
    "partsText",
    "garageText",
    "footnote",
    "quote",
]);

export const humanize = (key) =>
    LABELS[key] ||
    String(key)
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase());

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

export const clone = (value) => JSON.parse(JSON.stringify(value ?? null));

/** An empty item shaped like the template, used when adding to a list. */
function blankFrom(template) {
    if (Array.isArray(template)) return [];
    if (isObject(template)) {
        return Object.fromEntries(
            Object.entries(template).map(([k, v]) => [
                k,
                k === "icon" ? v : blankFrom(v),
            ]),
        );
    }
    if (typeof template === "number") return 0;
    if (typeof template === "boolean") return template;
    return "";
}

function setIn(obj, path, value) {
    if (path.length === 0) return value;
    const [head, ...rest] = path;
    const copy = Array.isArray(obj) ? [...obj] : { ...obj };
    copy[head] = setIn(obj?.[head], rest, value);
    return copy;
}

const itemTitle = (item, index) => {
    if (typeof item === "string") return item || `Item ${index + 1}`;
    return (
        item?.title ||
        item?.tabLabel ||
        item?.question ||
        item?.label ||
        item?.platform ||
        item?.value ||
        `Item ${index + 1}`
    );
};

/* -------------------------------------------------------------------------- */

export default function ContentEditor({
    value,
    schema,
    onChange,
    errors = {},
    media = [],
    mediaMaxKb,
}) {
    const [picker, setPicker] = useState(null); // { path }

    // Functional updates keep these callbacks stable, so memoised fields that did
    // not change skip re-rendering on every keystroke.
    const update = useCallback((path, next) => onChange((prev) => setIn(prev, path, next)), [onChange]);
    const openPicker = useCallback((path) => setPicker({ path }), []);

    return (
        <div className="space-y-3">
            {Object.keys(schema).map((key) => (
                <Section
                    key={key}
                    title={humanize(key)}
                    defaultOpen={key === "hero" || key === "brand"}
                    errorCount={countErrors(errors, `content.${key}`)}
                >
                    <Field
                        name={key}
                        path={[key]}
                        value={value?.[key]}
                        schema={schema[key]}
                        onChange={update}
                        errors={errors}
                        openPicker={openPicker}
                        bare
                    />
                </Section>
            ))}

            {picker && (
                <MediaPicker
                    media={media}
                    mediaMaxKb={mediaMaxKb}
                    onClose={() => setPicker(null)}
                    onPick={(val) => {
                        update(picker.path, val);
                        setPicker(null);
                    }}
                />
            )}
        </div>
    );
}

function countErrors(errors, prefix) {
    return Object.keys(errors).filter((k) => k === prefix || k.startsWith(`${prefix}.`)).length;
}

function Section({ title, children, defaultOpen = false, errorCount = 0 }) {
    const [open, setOpen] = useState(defaultOpen || errorCount > 0);
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50/70"
                aria-expanded={open}
            >
                <span className="flex items-center gap-2.5 text-[14px] font-semibold tracking-tight text-slate-900">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-md border transition ${open ? "border-[#00289a]/20 bg-[#00289a]/[0.06] text-[#00289a]" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                    {title}
                </span>
                {errorCount > 0 && (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/15">
                        {errorCount} to fix
                    </span>
                )}
            </button>
            {open && <div className="border-t border-slate-100 px-4 py-4">{children}</div>}
        </section>
    );
}

const sameField = (a, b) =>
    a.value === b.value &&
    a.schema === b.schema &&
    a.name === b.name &&
    a.errors === b.errors &&
    a.bare === b.bare &&
    a.hasHighlight === b.hasHighlight &&
    a.onChange === b.onChange &&
    a.openPicker === b.openPicker &&
    a.path.join(".") === b.path.join(".");

const Field = memo(function Field({ name, path, value, schema, hasHighlight = false, onChange, errors, openPicker, bare = false }) {
    // Decide input vs. textarea once, so a field never swaps element (and loses focus) mid-typing.
    const [startedLong] = useState(() => typeof value === "string" && (value.length > 90 || value.includes("\n")));
    const errorKey = `content.${path.join(".")}`;
    const error = errors[errorKey];

    if (isObject(schema)) {
        const body = (
            <div className="grid gap-4 md:grid-cols-2">
                {Object.keys(schema).map((key) => {
                    const child = schema[key];
                    const wide =
                        isObject(child) ||
                        Array.isArray(child) ||
                        LONG_TEXT_KEYS.has(key) ||
                        key === "title";
                    return (
                        <div key={key} className={wide ? "md:col-span-2" : ""}>
                            <Field
                                name={key}
                                path={[...path, key]}
                                value={value?.[key]}
                                schema={child}
                                hasHighlight={isObject(value) && "highlight" in value}
                                onChange={onChange}
                                errors={errors}
                                openPicker={openPicker}
                            />
                        </div>
                    );
                })}
            </div>
        );
        if (bare) return body;
        return (
            <fieldset className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                <legend className="px-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {humanize(name)}
                </legend>
                {body}
            </fieldset>
        );
    }

    if (Array.isArray(schema)) {
        return (
            <ListField
                name={name}
                path={path}
                value={Array.isArray(value) ? value : []}
                template={schema[0] ?? ""}
                onChange={onChange}
                errors={errors}
                openPicker={openPicker}
                bare={bare}
            />
        );
    }

    const label = humanize(name);
    const fieldId = `f-${path.join("-")}`;
    const common =
        "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none transition focus:border-[#00289a] focus:ring-4 focus:ring-[#00289a]/10 " +
        (error ? "border-rose-400" : "border-slate-200");

    let input;
    if (name === "icon") {
        const Icon = iconFor(value);
        input = (
            <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon size={18} />
                </span>
                <select id={fieldId} value={value || ""} onChange={(e) => onChange(path, e.target.value)} className={common}>
                    {ICON_NAMES.map((icon) => (
                        <option key={icon} value={icon}>
                            {icon}
                        </option>
                    ))}
                </select>
            </div>
        );
    } else if (name === "image") {
        const src = thumbFor(value);
        input = (
            <div className="flex items-center gap-3">
                <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    {src ? <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <ImageIcon size={20} className="text-slate-400" />}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-slate-500">{value || "No image selected"}</p>
                    <button
                        type="button"
                        onClick={() => openPicker(path)}
                        className="mt-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                        Choose image
                    </button>
                </div>
            </div>
        );
    } else if (typeof schema === "boolean") {
        input = (
            <label className="flex items-center gap-2 text-sm">
                <input id={fieldId} type="checkbox" checked={!!value} onChange={(e) => onChange(path, e.target.checked)} />
                {label}
            </label>
        );
    } else if (typeof schema === "number") {
        input = <input id={fieldId} type="number" value={value ?? 0} onChange={(e) => onChange(path, Number(e.target.value))} className={common} />;
    } else {
        const str = value ?? "";
        const multiline =
            LONG_TEXT_KEYS.has(name) ||
            startedLong ||
            String(schema).includes("\n") ||
            String(schema).length > 90 ||
            (name === "title" && hasHighlight);
        input = multiline ? (
            <textarea
                id={fieldId}
                value={str}
                onChange={(e) => onChange(path, e.target.value)}
                rows={LONG_TEXT_KEYS.has(name) ? 3 : 2}
                className={`${common} field-sizing-content min-h-[4.5rem] resize-y`}
            />
        ) : (
            <input id={fieldId} type="text" value={str} onChange={(e) => onChange(path, e.target.value)} className={common} />
        );
    }

    const hint =
        name === "title" && hasHighlight
            ? "Press Enter for a line break. The highlighted words follow the title."
            : /href$|url$/i.test(name)
              ? "Use /page for site pages, or a full https:// link."
              : null;

    return (
        <div>
            {typeof schema !== "boolean" && (
                <label htmlFor={fieldId} className="mb-1.5 block text-[12.5px] font-medium text-slate-600">
                    {label}
                </label>
            )}
            {input}
            {hint && !error && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
            {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
        </div>
    );
}, sameField);

function ListField({ name, path, value, template, onChange, errors, openPicker, bare }) {
    const isObjectList = isObject(template);
    const [openIndex, setOpenIndex] = useState(null);

    const move = (from, to) => {
        if (to < 0 || to >= value.length) return;
        const next = [...value];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        onChange(path, next);
        if (openIndex === from) setOpenIndex(to);
    };
    const remove = (index) => {
        if (!window.confirm(`Remove "${itemTitle(value[index], index)}"?`)) return;
        onChange(path, value.filter((_, i) => i !== index));
        setOpenIndex(null);
    };
    const add = () => {
        onChange(path, [...value, blankFrom(template)]);
        setOpenIndex(value.length);
    };

    const controls = (index) => (
        <div className="flex shrink-0 items-center gap-1">
            <IconButton label="Move up" onClick={() => move(index, index - 1)} disabled={index === 0}>
                <ArrowUp size={14} />
            </IconButton>
            <IconButton label="Move down" onClick={() => move(index, index + 1)} disabled={index === value.length - 1}>
                <ArrowDown size={14} />
            </IconButton>
            <IconButton label="Remove" onClick={() => remove(index)} danger>
                <Trash2 size={14} />
            </IconButton>
        </div>
    );

    return (
        <div>
            {!bare && <p className="mb-2 text-xs font-semibold text-slate-600">{humanize(name)}</p>}
            <div className="space-y-2">
                {value.map((item, index) => {
                    const itemPath = [...path, index];
                    const hasError = countErrors(errors, `content.${itemPath.join(".")}`) > 0;
                    if (!isObjectList) {
                        const err = errors[`content.${itemPath.join(".")}`];
                        return (
                            <div key={index}>
                                <div className="flex items-start gap-2">
                                    <textarea
                                        value={item ?? ""}
                                        rows={String(item ?? "").length > 80 ? 2 : 1}
                                        onChange={(e) => onChange(itemPath, e.target.value)}
                                        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${err ? "border-red-400" : "border-slate-300"}`}
                                        aria-label={`${humanize(name)} ${index + 1}`}
                                    />
                                    {controls(index)}
                                </div>
                                {err && <p className="mt-1 text-xs font-semibold text-red-600">{err}</p>}
                            </div>
                        );
                    }
                    const open = openIndex === index || hasError;
                    return (
                        <div key={index} className={`rounded-xl border bg-white ${hasError ? "border-red-300" : "border-slate-200"}`}>
                            <div className="flex items-center gap-2 px-3 py-2">
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(open ? null : index)}
                                    className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-semibold text-slate-800"
                                    aria-expanded={open}
                                >
                                    {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                    <span className="text-xs font-bold text-slate-400">{index + 1}.</span>
                                    <span className="truncate">{itemTitle(item, index)}</span>
                                </button>
                                {controls(index)}
                            </div>
                            {open && (
                                <div className="border-t border-slate-100 p-4">
                                    <Field
                                        name={name}
                                        path={itemPath}
                                        value={item}
                                        schema={template}
                                        onChange={onChange}
                                        errors={errors}
                                        openPicker={openPicker}
                                        bare
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <button
                type="button"
                onClick={add}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-blue-400 hover:text-blue-700"
            >
                <Plus size={14} /> Add {isObjectList ? "item" : "line"}
            </button>
        </div>
    );
}

function IconButton({ label, onClick, disabled, danger, children }) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            className={`rounded-md p-1.5 transition disabled:opacity-30 ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-500 hover:bg-slate-100"}`}
        >
            {children}
        </button>
    );
}

/* -------------------------------------------------------------------------- */
/* Media                                                                      */
/* -------------------------------------------------------------------------- */

export function MediaUploadButton({ mediaMaxKb = 5120, className = "" }) {
    const input = useRef(null);
    const [uploading, setUploading] = useState(false);

    const upload = (file) => {
        if (!file) return;
        if (file.size > mediaMaxKb * 1024) {
            toast.error(`Images must be smaller than ${Math.round(mediaMaxKb / 1024)} MB.`);
            return;
        }
        setUploading(true);
        router.post(
            "/super-admin/media",
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                onError: (errors) => toast.error(errors.file || "Upload failed."),
                onFinish: () => {
                    setUploading(false);
                    if (input.current) input.current.value = "";
                },
            },
        );
    };

    return (
        <>
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
            <button
                type="button"
                onClick={() => input.current?.click()}
                disabled={uploading}
                className={`inline-flex items-center gap-2 rounded-lg bg-[#00289a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#001f78] disabled:opacity-60 ${className}`}
            >
                <Upload size={14} /> {uploading ? "Uploading…" : "Upload image"}
            </button>
        </>
    );
}

function MediaPicker({ media, mediaMaxKb, onPick, onClose }) {
    const [query, setQuery] = useState("");
    const bundled = useMemo(
        () => Object.entries(BUNDLED_MEDIA).map(([name]) => ({ value: name, src: thumbFor(name), name })),
        [],
    );
    const uploaded = media.map((m) => ({ value: m.url, src: m.url, name: m.name }));
    const filter = (list) => list.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));

    return createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label="Choose an image">
            <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                    <h2 className="text-base font-black">Choose an image</h2>
                    <div className="flex items-center gap-2">
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search images" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
                        <MediaUploadButton mediaMaxKb={mediaMaxKb} />
                        <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close">
                            <X size={18} />
                        </button>
                    </div>
                </div>
                <div className="overflow-y-auto p-5">
                    {uploaded.length > 0 && (
                        <>
                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Uploaded</p>
                            <MediaGrid items={filter(uploaded)} onPick={onPick} />
                        </>
                    )}
                    <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">Built-in site images</p>
                    <MediaGrid items={filter(bundled)} onPick={onPick} />
                </div>
            </div>
        </div>,
        document.body,
    );
}

function MediaGrid({ items, onPick }) {
    if (!items.length) return <p className="text-sm text-slate-500">No images match.</p>;
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
                <button
                    key={item.value}
                    type="button"
                    onClick={() => onPick(item.value)}
                    className="group overflow-hidden rounded-xl border border-slate-200 text-left hover:border-blue-500 hover:ring-2 hover:ring-blue-100"
                >
                    <img src={item.src} alt="" loading="lazy" decoding="async" className="aspect-[4/3] w-full bg-slate-100 object-cover" />
                    <p className="truncate px-2 py-1.5 text-[11px] font-medium text-slate-600">{item.name}</p>
                </button>
            ))}
        </div>
    );
}
