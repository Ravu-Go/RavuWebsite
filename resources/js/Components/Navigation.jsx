import { Link, usePage } from "@inertiajs/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import RAVULogo from "./RAVULogo";

const defaultItems = [
    { label: "Home", href: "/" },
    { label: "About RAVU", href: "/about-ravu" },
    { label: "For Riders", href: "/for-riders" },
    { label: "Membership", href: "/membership" },
    { label: "Benefits", href: "/benefits" },
    { label: "Partners", href: "/partners" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Support", href: "/support" },
];

/**
 * RAVU primary navigation.
 *
 * Two conversion paths only:
 *   - "Partner With RAVU" -> organisations
 *   - "Get the RAVU App"  -> riders / drivers (operational onboarding lives in the app)
 */
export default function Navigation({
    items = defaultItems,
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

    const NavLink = ({ item, mobile = false }) => {
        const active = isActive(item.href);

        if (mobile) {
            return (
                <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3.5 py-3 text-[15px] font-semibold transition-colors ${
                        active
                            ? "bg-ravu-50 text-ravu-800"
                            : "text-ink-800 hover:bg-ink-50"
                    }`}
                >
                    {item.label}
                    {active && (
                        <span
                            className="h-1.5 w-1.5 rounded-full bg-ravu-600"
                            aria-hidden="true"
                        />
                    )}
                </Link>
            );
        }

        return (
            <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-2 text-[13px] font-semibold transition-colors ${
                    overMedia
                        ? "text-white/80 hover:text-white"
                        : active
                          ? "text-ink-950"
                          : "text-ink-600 hover:text-ink-950"
                }`}
            >
                {item.label}
                {active && (
                    <span
                        className={`absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full ${
                            overMedia ? "bg-ravu-400" : "bg-ravu-600"
                        }`}
                        aria-hidden="true"
                    />
                )}
            </Link>
        );
    };

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

                <div className="hidden items-center gap-6 xl:flex">
                    {items.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                </div>

                <div className="hidden items-center gap-2.5 lg:flex">
                    <Link
                        href="/login"
                        className={`px-2 text-[13px] font-bold transition-colors ${
                            overMedia
                                ? "text-white/80 hover:text-white"
                                : "text-ink-600 hover:text-ink-950"
                        }`}
                    >
                        Login
                    </Link>
                    <Link
                        href="/partners"
                        className={`inline-flex min-h-10 items-center rounded-lg px-4 text-[13px] font-bold transition-colors ${
                            overMedia
                                ? "border border-white/30 text-white hover:bg-white/10"
                                : "border border-ink-200 text-ink-900 hover:border-ink-950 hover:bg-ink-50"
                        }`}
                    >
                        Partner With RAVU
                    </Link>
                    <Link
                        href="/for-riders"
                        className="inline-flex min-h-10 items-center rounded-lg bg-ravu-600 px-4 text-[13px] font-bold text-white transition-colors hover:bg-ravu-700"
                    >
                        Get the RAVU App
                    </Link>
                </div>

                <button
                    type="button"
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors lg:hidden ${
                        overMedia
                            ? "text-white hover:bg-white/10"
                            : "text-ink-900 hover:bg-ink-100"
                    }`}
                    aria-label={
                        isOpen ? "Close navigation menu" : "Open navigation menu"
                    }
                    aria-expanded={isOpen}
                    aria-controls="ravu-mobile-navigation"
                    onClick={() => setIsOpen((open) => !open)}
                >
                    {isOpen ? (
                        <X size={22} aria-hidden="true" />
                    ) : (
                        <Menu size={22} aria-hidden="true" />
                    )}
                </button>
            </nav>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        id="ravu-mobile-navigation"
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
                        className="overflow-hidden border-t border-ink-200 bg-white lg:hidden"
                    >
                        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto px-5 pb-6 pt-3 sm:px-8">
                            <div className="space-y-1">
                                {items.map((item) => (
                                    <NavLink
                                        key={item.href}
                                        item={item}
                                        mobile
                                    />
                                ))}
                            </div>
                            <div className="mt-5 grid gap-2.5 border-t border-ink-200 pt-5">
                                <Link
                                    href="/partners"
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex min-h-11 items-center justify-center rounded-lg border-ink-200 text-sm font-bold text-ink-900 transition-colors hover:bg-ink-50"
                                >
                                    Partner With RAVU
                                </Link>
                                <Link
                                    href="/for-riders"
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-ravu-600 text-sm font-bold text-white transition-colors hover:bg-ravu-700"
                                >
                                    Get the RAVU App
                                </Link>
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex min-h-11 items-center justify-center rounded-lg text-sm font-bold text-ink-600 transition-colors hover:text-ink-950"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
