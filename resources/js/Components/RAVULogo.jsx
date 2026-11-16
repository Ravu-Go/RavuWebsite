import logoImg from "../../imgs/Logo.png";

/**
 * RAVU wordmark.
 * Uses the official circular brand emblem from Logo.png paired with the Ravu wordmark.
 */
export default function RAVULogo({
    variant = "dark",
    className = "",
    markSize = "md",
    showWordmark = true,
}) {
    const isLight = variant === "light";

    const sizes = {
        sm: { mark: "h-7 w-7", word: "text-lg" },
        md: { mark: "h-8 w-8", word: "text-xl" },
        lg: { mark: "h-10 w-10", word: "text-2xl" },
    }[markSize] || { mark: "h-8 w-8", word: "text-xl" };

    return (
        <span
            className={`inline-flex items-center gap-2.5 ${className}`}
            aria-hidden="true"
        >
            <img
                src={logoImg}
                alt="RAVU"
                className={`shrink-0 rounded-full object-cover ${sizes.mark}`}
            />
            {showWordmark && (
                <span
                    className={`font-bold tracking-tight leading-none ${sizes.word} ${
                        isLight ? "text-white" : "text-ink-950"
                    }`}
                >
                    Ravu
                </span>
            )}
        </span>
    );
}
