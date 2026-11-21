import { Link } from "@inertiajs/react";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import logoImg from "../../imgs/Logo.png";

const EXPLORE_LINKS = [
    { label: "About RAVU", href: "/about-ravu" },
    { label: "For Riders", href: "/for-riders" },
    { label: "Membership", href: "/membership" },
    { label: "Benefits", href: "/benefits" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Get the RAVU App", href: "/for-riders" },
];

const BUSINESS_LINKS = [
    { label: "Partners", href: "/partners" },
    { label: "Drive with RAVU", href: "/for-riders" },
    { label: "Business Solutions", href: "/partners" },
];

const SUPPORT_LINKS = [
    { label: "Help Centre", href: "/support" },
    { label: "Contact Us", href: "/support" },
    { label: "Safety", href: "/about-ravu" },
    { label: "FAQs", href: "/support" },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-[#050B17] text-slate-400 border-t border-white/5">
            <div className="mx-auto max-w-7xl px-5 pt-14 pb-10 sm:px-8 lg:px-10 lg:pt-16 lg:pb-12">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                    {/* Brand column */}
                    <div className="lg:col-span-5">
                        <Link
                            href="/"
                            prefetch="click"
                            aria-label="RAVU home"
                            className="inline-flex items-center gap-2.5"
                        >
                            <img
                                src={logoImg}
                                alt="RAVU"
                                loading="lazy"
                                decoding="async"
                                className="h-8 w-8 rounded-full object-cover"
                            />
                            <span className="text-xl font-bold tracking-tight text-white">
                                Ravu
                            </span>
                        </Link>

                        <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-400">
                            &ldquo;Building a trusted ecosystem that delivers
                            mobility, opportunity, protection, and prosperity
                            for every rider.&rdquo;
                            <br />
                            <span className="mt-1.5 inline-block text-slate-500">
                                RAVU Ltd • Dar es Salaam, Tanzania •{" "}
                                <a
                                    href="mailto:nyindo@posteo.de"
                                    className="text-sky-400 hover:underline"
                                >
                                    nyindo@posteo.de
                                </a>
                            </span>
                        </p>

                        {/* Social icons */}
                        <div className="mt-6 flex items-center gap-4 text-slate-400">
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Instagram"
                                className="transition-colors hover:text-white"
                            >
                                <Instagram size={18} />
                            </a>
                            <a
                                href="https://x.com"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="X"
                                className="transition-colors hover:text-white"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                >
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Facebook"
                                className="transition-colors hover:text-white"
                            >
                                <Facebook size={18} />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="LinkedIn"
                                className="transition-colors hover:text-white"
                            >
                                <Linkedin size={18} />
                            </a>
                            <a
                                href="https://youtube.com"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="YouTube"
                                className="transition-colors hover:text-white"
                            >
                                <Youtube size={19} />
                            </a>
                        </div>
                    </div>

                    {/* Explore */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xs font-semibold tracking-wider text-white">
                            Explore
                        </h3>
                        <ul className="mt-4 space-y-2.5 text-xs">
                            {EXPLORE_LINKS.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        prefetch="click"
                                        className="transition-colors hover:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Business */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xs font-semibold tracking-wider text-white">
                            Business
                        </h3>
                        <ul className="mt-4 space-y-2.5 text-xs">
                            {BUSINESS_LINKS.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        prefetch="click"
                                        className="transition-colors hover:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="lg:col-span-3">
                        <h3 className="text-xs font-semibold tracking-wider text-white">
                            Support
                        </h3>
                        <ul className="mt-4 space-y-2.5 text-xs">
                            {SUPPORT_LINKS.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        prefetch="click"
                                        className="transition-colors hover:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom line */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-[11px] text-slate-500 sm:flex-row">
                    <p>&copy; {year} RAVU. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/support" className="transition-colors hover:text-slate-300">
                            Terms
                        </Link>
                        <Link href="/support" className="transition-colors hover:text-slate-300">
                            Privacy
                        </Link>
                        <Link href="/support" className="transition-colors hover:text-slate-300">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
