import { Link, usePage } from "@inertiajs/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import RAVULogo from "./RAVULogo";

/**
 * Navigation data. All destinations are existing routes in routes/web.php.
 * "Get the RAVU App" points to /for-riders — the rider onboarding page —
 * matching the previous CTA destination (no dedicated app-download route exists).
 */
const menuGroups = [
    {
        title: "Discover",
        items: [
            { label: "Home", href: "/" },
            { label: "About RAVU", href: "/about-ravu" },
            { label: "How It Works", href: "/how-it-works" },
        ],
    },
    {
        title: "Rider Membership",
        items: [
            { label: "For Riders", href: "/for-riders" },
            { label: "Membership", href: "/membership" },
            { label: "Benefits", href: "/benefits" },
            { label: "Get the RAVU App", href: "/for-riders" },
        ],
    },
    {
        title: "Partnerships",
        items: [
            { label: "Partners", href: "/partners" },
            { label: "Partner With RAVU", href: "/partners" },
        ],
    },
    {
        title: "Help & Account",
        items: [
            { label: "Support", href: "/support" },
            { label: "Login", href: "/login" },
        ],
    },
];

/**
 * RAVU primary navigation.
 *
 * Minimal header: brand logo, one "Partner With RAVU" CTA and a hamburger
 * menu holding all remaining links, grouped by theme. The menu is available
 * at every viewport width so nothing is lost by removing inline links.
 */
export default function Navigation({
    transparent = false,
    onDark = false,
}) {
    const { url } = usePage();
    const reduceMotion = useReducedMotion();
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const currentPath = url.split("?")[0];

    useEffect(() => {
        const updateScrollState = () => setIsScrolled(window.scrollY > 8);
        updateScrollState();
        window.addEventListener("scroll", updateScrollState, { passive: true });
        return () => window.removeEventListener("scroll", updateScrollState);
    }, []);

    useEffect(() => {
        const closeOnEscape = (event) =>
            event.key === "Escape" && setIsOpen(false);
        document.addEventListener("keydown", closeOnEscape);
        return () => document.removeEventListener("keydown", closeOnEscape);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => setIsOpen(false), [currentPath]);

    const isActive = (href) =>
        href === "/" ? currentPath === "/" : currentPath.startsWith(href);

    const overMedia = transparent && !isScrolled && onDark;
    const headerClass = overMedia
        ? "border-transparent bg-transparent"
        : "border-ink-200/80 bg-white/95 shadow-[0_1px_0_0_rgba(10,13,12,0.04)] backdrop-blur";

    const toggleButton = (
        <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="ravu-navigation-menu"
            aria-label={
                isOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                overMedia
                    ? "text-white hover:bg-white/10"
                    : "text-ink-900 hover:bg-ink-100"
            }`}
        >
            {isOpen ? (
                <X size={22} aria-hidden="true" />
            ) : (
                <Menu size={22} aria-hidden="true" />
            )}
        </button>
    );

    return (
        <header
            className={`sticky top-0 z-50 border-b transition-colors duration-200 ${headerClass}`}
        >
            <nav
                className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:h-18 lg:px-10"
                aria-label="Primary navigation"
            >
                <Link
                    href="/"
                    aria-label="RAVU home"
                    onClick={() => setIsOpen(false)}
                    className="shrink-0 rounded-md"
                >
                    <RAVULogo variant={overMedia ? "light" : "dark"} />
                </Link>

                <div className="flex items-center gap-2.5">
                    <Link
                        href="/partners"
                        className={`hidden min-h-10 items-center rounded-lg px-4 text-[13px] font-bold transition-colors sm:inline-flex ${
                            overMedia
                                ? "bg-white text-ink-950 hover:bg-white/90"
                                : "bg-[#00289a] text-white hover:bg-[#001f78]"
                        }`}
                    >
                        Partner With RAVU
                    </Link>
                    {toggleButton}
                </div>
            </nav>
            <AnimatePresence initial={false}>
{isOpen && (
                     <motion.div
                         id="ravu-navigation-menu"
                         initial={
                             reduceMotion ? false : { opacity: 0, height: 0 }
                         }
                         animate={{ opacity: 1, height: "auto" }}
                         exit={
                             reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }
                         }
                         transition={{
                             duration: reduceMotion ? 0 : 0.2,
                             ease: [0.22, 1, 0.36, 1],
                         }}
                             className="overflow-hidden border-t border-ink-200 bg-white"
                         >
                             <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto px-5 pb-8 pt-4 sm:px-8">
                                 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                     {menuGroups.map((group) => (
                                         <div key={group.title}>
                                             <p
                                                 className={`mb-1.5 px-3.5 text-[11px] font-bold uppercase tracking-[0.14em] ${
                                                     overMedia
                                                         ? "text-white/60"
                                                         : "text-ink-400"
                                                 }`}
                                             >
                                                 {group.title}
                                             </p>
                                             <ul className="space-y-0.5">
                                                 {group.items.map((item) => {
                                                     const active = isActive(
                                                         item.href,
                                                     );
                                                     return (
                                                         <li key={item.label}>
                                                             <Link
                                                                 href={item.href}
                                                                 aria-current={
                                                                     active
                                                                         ? "page"
                                                                         : undefined
                                                                 }
                                                                 onClick={() =>
                                                                     setIsOpen(false)
                                                                 }
                                                                 className={`flex items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 text-[15px] font-semibold transition-colors ${
                                                                     active
                                                                         ? overMedia
                                                                             ? "bg-white/10 text-white"
                                                                             : "bg-ravu-50 text-ravu-800"
                                                                         : overMedia
                                                                           ? "text-white/80 hover:bg-white/10 hover:text-white"
                                                                           : "text-ink-800 hover:bg-ink-50 hover:text-ink-950"
                                                                 }`}
                                                             >
                                                                 {item.label}
                                                                 {active && (
                                                                     <span
                                                                         className="h-1.5 w-1.5 shrink-0 rounded-full bg-ravu-600"
                                                                         aria-hidden="true"
                                                                     />
                                                                 )}
                                                             </Link>
                                                         </li>
                                                     );
                                                 })}
                                             </ul>
                                         </div>
                                     ))}
                                 </div>

                                 <div className="mt-6 border-t border-ink-200 pt-5 sm:hidden">
                                     <Link
                                         href="/partners"
                                         onClick={() => setIsOpen(false)}
                                         className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-[#00289a] text-sm font-bold text-white transition-colors hover:bg-[#001f78]"
                                     >
                                         Partner With RAVU
                                         <ChevronRight
                                             size={16}
                                             aria-hidden="true"
                                         />
                                     </Link>
                                 </div>
                             </div>
                         </motion.div>
                 )}
            </AnimatePresence>
        </header>
    );
}
