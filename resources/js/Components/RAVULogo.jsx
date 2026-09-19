/**
 * RAVU wordmark.
 *
 * The mark is a heavy italic "R" paired with a bold, tightly-tracked
 * "RAVU" wordmark. The mark keeps the site's established blue accent,
 * which the reference document directs us to preserve.
 */
export default function RAVULogo({
    variant = "dark",
    className = "",
    markSize = "md",
    showWordmark = true,
}) {
    const isLight = variant === "light";

    const sizes = {
        sm: { mark: "h-8 w-8 text-sm", word: "text-base" },
        md: { mark: "h-9 w-9 text-base", word: "text-lg" },
        lg: { mark: "h-11 w-11 text-lg", word: "text-xl" },
    }[markSize];

    return (
        <span
            className={`inline-flex items-center gap-2.5 ${className}`}
            aria-hidden="true"
        >
            <span
                className={`grid shrink-0 place-items-center rounded-md ${sizes.mark} font-black italic leading-none ${
                    isLight
                        ? "bg-white text-spare-700"
                        : "bg-spare-700 text-white"
                }`}
            >
                R
            </span>
            {showWordmark && (
                <span
                    className={`font-black leading-none tracking-[0.06em] ${sizes.word
                        } ${isLight ? "text-white" : "text-ink-950"}`}
                >
                    RAVU
                </span>
            )}
        </span>
    );
}
