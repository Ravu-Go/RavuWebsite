import { Head, usePage } from "@inertiajs/react";
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
    seo,
}) {
    const previewing = usePage().props.site?.preview === true;

    return (
        <div className="flex min-h-screen flex-col bg-white text-ink-700">
            {seo?.title && (
                <Head>
                    <title>{seo.title}</title>
                    {seo.description && (
                        <meta
                            head-key="description"
                            name="description"
                            content={seo.description}
                        />
                    )}
                </Head>
            )}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink-950 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
            >
                Skip to content
            </a>
            {previewing && (
                <div className="sticky top-0 z-[60] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-amber-400 px-4 py-2 text-center text-xs font-bold text-amber-950">
                    <span>Preview mode — you are seeing unpublished drafts.</span>
                    <a href="/super-admin" className="underline">
                        Back to CMS
                    </a>
                    <a href="/super-admin/preview-exit" className="underline">
                        Exit preview
                    </a>
                </div>
            )}
            <Navigation transparent={transparentNav} onDark={onDarkNav} />
            <main id="main-content" className="flex-1 flex flex-col">
                {children}
            </main>
            {!hideFooter && <Footer />}
        </div>
    );
}
