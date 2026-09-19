import Navigation from "./Navigation";
import Footer from "./Footer";
import { usePage } from "@inertiajs/react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * The single RAVU page shell. Every website page renders inside this so the
 * navigation, footer and surface tokens stay identical across the site.
 */
export default function WebsiteLayout({
    children,
    transparentNav = false,
    onDarkNav = false,
}) {
    const { key } = usePage();
    const reduceMotion = useReducedMotion();

    return (
        <div className="flex min-h-screen flex-col bg-white text-ink-700">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink-950 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
            >
                Skip to content
            </a>
            <Navigation transparent={transparentNav} onDark={onDarkNav} />
            <main id="main-content" className="flex-1">
                <motion.div
                    initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -20 }}
                    transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                    key={key}
                >
                    {children}
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
