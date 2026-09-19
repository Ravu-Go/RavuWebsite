import { Link } from "@inertiajs/react";
import RAVULogo from "./RAVULogo";

const SITE_LINKS = [
    { label: "Home", href: "/" },
    { label: "About RAVU", href: "/about-ravu" },
    { label: "For Riders", href: "/for-riders" },
    { label: "Membership", href: "/membership" },
    { label: "Benefits", href: "/benefits" },
    { label: "Partners", href: "/partners" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Support", href: "/support" },
];

const ACCOUNT_LINKS = [
    { label: "Login", href: "/login" },
    { label: "Register Interest", href: "/register" },
];

/**
 * RAVU footer. Deliberately contains no invented contact details or social
 * links — those will be added when the approved channels exist.
 */
export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative overflow-hidden bg-ink-950 text-ink-400">
            <div
                aria-hidden="true"
                className="ravu-pattern-dark pointer-events-none absolute inset-0"
            />

            <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
                <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-14">
                    <div>
                        <Link
                            href="/"
                            aria-label="RAVU home"
                            className="inline-block rounded-md"
                        >
                            <RAVULogo variant="light" markSize="lg" />
                        </Link>
                        <p className="mt-5 max-w-sm text-sm leading-6 text-ink-400">
                            A membership-based mobility ecosystem for the
                            people and businesses who keep movement happening.
                        </p>
                        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-ravu-400">
                            Join. Save. Earn.
                        </p>
                    </div>

                    <nav aria-labelledby="footer-site-heading">
                        <h2
                            id="footer-site-heading"
                            className="text-xs font-bold uppercase tracking-[0.18em] text-white"
                        >
                            Explore
                        </h2>
                        <ul className="mt-5 grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-1">
                            {SITE_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="transition-colors hover:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <nav aria-labelledby="footer-account-heading">
                        <h2
                            id="footer-account-heading"
                            className="text-xs font-bold uppercase tracking-[0.18em] text-white"
                        >
                            Your RAVU
                        </h2>
                        <ul className="mt-5 space-y-3 text-sm">
                            {ACCOUNT_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="transition-colors hover:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href="/partners"
                                    className="transition-colors hover:text-white"
                                >
                                    Partner With RAVU
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/for-riders"
                                    className="transition-colors hover:text-white"
                                >
                                    Get the RAVU App
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="mt-12 flex-col gap-3 border-t border-white/10 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        &copy; {year} RAVU. Earn More. Spend Less. Drive Better.
                    </p>
                    <p>Together we drive better opportunities.</p>
                </div>
            </div>
        </footer>
    );
}
