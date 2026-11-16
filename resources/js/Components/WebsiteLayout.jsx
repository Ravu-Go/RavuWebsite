import Navigation from "./Navigation";
import Footer from "./Footer";

/**
 * The single RAVU page shell. Every website page renders inside this so the
 * navigation, footer and surface tokens stay identical across the site.
 */
export default function WebsiteLayout({
    children,
    transparentNav = false,
    onDarkNav = false,
    hideFooter = false,
}) {
    return (
        <div className="flex min-h-screen flex-col bg-white text-ink-700">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink-950 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
            >
                Skip to content
            </a>
            <Navigation transparent={transparentNav} onDark={onDarkNav} />
            <main id="main-content" className="flex-1 flex flex-col">
                {children}
            </main>
            {!hideFooter && <Footer />}
        </div>
    );
}
