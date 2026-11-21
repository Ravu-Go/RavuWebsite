import { Link, usePage } from "@inertiajs/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import RAVULogo from "./RAVULogo";

/**
 * Desktop primary navbar links matching the modern layout:
 * Ride, Business, About, Support
 */
const DESKTOP_NAV_LINKS = [
    { label: "Ride", href: "/for-riders" },
    { label: "Business", href: "/partners" },
    { label: "Membership", href: "/membership" },
    { label: "About", href: "/about-ravu" },
    { label: "Support", href: "/support" },
];

/**
 * Full expanded navigation groups for the overlay/hamburger menu
 */
const MENU_GROUPS = [
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
            { label: "Membership Plans", href: "/membership" },
            { label: "Member Benefits", href: "/benefits" },
        ],
    },
    {
        title: "Partnerships",
        items: [
            { label: "Partner Overview", href: "/partners" },
            { label: "Partner Portal", href: "/login" },
        ],
    },
    {
        title: "Account & Support",
        items: [
            { label: "Help & Support", href: "/support" },
            { label: "Sign in", href: "/login" },
            { label: "Register Interest", href: "/register" },
            { label: "Super Admin CMS", href: "/super-admin" },
        ],
    },
];

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
        let ticking = false;
        let previousScrolled = null;
        const updateScrollState = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                const nextScrolled = window.scrollY > 8;
                if (nextScrolled !== previousScrolled) {
                    previousScrolled = nextScrolled;
                    setIsScrolled(nextScrolled);
                }
                ticking = false;
            });
        };
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
        // Prevent background scrolling on mobile only to avoid desktop scrollbar layout shift
        if (isOpen && typeof window !== "undefined" && window.innerWidth < 768) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => setIsOpen(false), [currentPath]);

    const isActive = (href) =>
        href === "/" ? currentPath === "/" : currentPath.startsWith(href);

    const overMedia = transparent && !isScrolled && onDark && !isOpen;
    const headerClass = isOpen
        ? "border-slate-200 bg-white shadow-md"
        : overMedia
          ? "border-transparent bg-transparent"
          : "border-slate-100 bg-white/95 shadow-xs backdrop-blur-md";

    const toggleButton = (
        <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="ravu-navigation-menu"
            aria-label={
                isOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                overMedia
                    ? "text-white hover:bg-white/10"
                    : "text-slate-800 hover:bg-slate-100"
            }`}
        >
            {isOpen ? (
                <X size={20} aria-hidden="true" />
            ) : (
                <Menu size={20} aria-hidden="true" />
            )}
        </button>
    );

    return (
        <header
            className={`sticky top-0 z-50 border-b transition-colors duration-150 ${headerClass}`}
        >
            <nav
                className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:h-18 lg:px-10"
                aria-label="Primary navigation"
            >
                {/* Brand Logo */}
                <Link
                    href="/"
                    prefetch="click"
                    aria-label="RAVU home"
                    onClick={() => setIsOpen(false)}
                    className="shrink-0 rounded-md transition-opacity hover:opacity-90"
                >
                    <RAVULogo variant={overMedia ? "light" : "dark"} />
                </Link>

                {/* Desktop Center Links */}
                <div className="hidden md:flex items-center gap-7 lg:gap-9">
                    {DESKTOP_NAV_LINKS.map((link) => {
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                prefetch="click"
                                className={`relative py-1 text-sm font-semibold transition-colors ${
                                    active
                                        ? "text-slate-950 font-bold"
                                        : overMedia
                                          ? "text-white/80 hover:text-white"
                                          : "text-slate-600 hover:text-slate-950"
                                }`}
                            >
                                {link.label}
                                {active && (
                                    <span
                                        className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#00289a]"
                                        aria-hidden="true"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href="/login"
                        prefetch="click"
                        className={`hidden lg:inline-flex py-1.5 px-3 text-xs font-semibold rounded-full transition-colors ${
                            overMedia
                                ? "text-white/90 hover:text-white hover:bg-white/10"
                                : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                        }`}
                    >
                        Sign in
                    </Link>

                    <Link
                        href="/for-riders"
                        prefetch="click"
                        className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 active:scale-[0.98] transition-all"
                    >
                        <span>Get the RAVU App</span>
                        <ArrowRight size={13} />
                    </Link>

                    <Link
                        href="/partners"
                        prefetch="click"
                        className="hidden xl:inline-flex items-center rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-950 transition-colors"
                    >
                        Partner
                    </Link>

                    {toggleButton}
                </div>
            </nav>

            {/* Background Backdrop Overlay (closes menu on outside click) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="nav-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 top-16 lg:top-18 z-40 bg-slate-950/20 backdrop-blur-[2px]"
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Fast GPU-composited Overlay Menu (no page layout reflow) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="ravu-navigation-menu"
                        key="nav-menu"
                        initial={
                            reduceMotion ? false : { opacity: 0, y: -8 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                            reduceMotion
                                ? { opacity: 0 }
                                : { opacity: 0, y: -6 }
                        }
                        transition={{
                            duration: reduceMotion ? 0 : 0.16,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className="absolute top-full left-0 right-0 z-50 w-full border-b border-slate-200 bg-white shadow-2xl will-change-transform"
                    >
                        <div className="max-h-[calc(100dvh-5rem)] overflow-y-auto px-5 pb-8 pt-6 sm:px-8">
                            <div className="mx-auto max-w-7xl">
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    {MENU_GROUPS.map((group) => (
                                        <div key={group.title}>
                                            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
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
                                                                prefetch="click"
                                                                aria-current={
                                                                    active
                                                                        ? "page"
                                                                        : undefined
                                                                }
                                                                onClick={() =>
                                                                    setIsOpen(
                                                                        false,
                                                                    )
                                                                }
                                                                className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                                                                    active
                                                                        ? "bg-slate-100 text-slate-950 font-bold"
                                                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                                                                }`}
                                                            >
                                                                {item.label}
                                                                {active ? (
                                                                    <span
                                                                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00289a]"
                                                                        aria-hidden="true"
                                                                    />
                                                                ) : (
                                                                    <ChevronRight
                                                                        size={14}
                                                                        className="text-slate-300"
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

                                {/* Mobile action buttons in drawer */}
                                <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:hidden">
                                    <Link
                                        href="/for-riders"
                                        onClick={() => setIsOpen(false)}
                                        className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white shadow-xs hover:bg-slate-800"
                                    >
                                        <span>Get the RAVU App</span>
                                        <ArrowRight size={15} />
                                    </Link>
                                    <Link
                                        href="/partners"
                                        onClick={() => setIsOpen(false)}
                                        className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-900 hover:bg-slate-50"
                                    >
                                        Partner With RAVU
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
