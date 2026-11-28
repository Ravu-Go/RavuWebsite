import { Link } from "@inertiajs/react";
import { Facebook, Globe, Instagram, Linkedin, Youtube } from "lucide-react";
import { keyFor, useSiteContent } from "../content";
import logoImg from "../../imgs/Logo.png";

/** Only real profile links: a bare "https://instagram.com" is a placeholder, not a page. */
function isProfileUrl(social) {
    try {
        return new URL(social.url).pathname.replace(/\/+$/, "") !== "";
    } catch {
        return false;
    }
}

function SocialIcon({ platform }) {
    switch (String(platform).toLowerCase()) {
        case "instagram":
            return <Instagram size={18} />;
        case "facebook":
            return <Facebook size={18} />;
        case "linkedin":
            return <Linkedin size={18} />;
        case "youtube":
            return <Youtube size={19} />;
        case "x":
        case "x (twitter)":
        case "twitter":
            return (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            );
        default:
            return <Globe size={18} />;
    }
}

export default function Footer() {
    const year = new Date().getFullYear();
    const { brand, footer } = useSiteContent("global");

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
                                {brand.siteName}
                            </span>
                        </Link>

                        <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-400">
                            &ldquo;{brand.footerQuote}&rdquo;
                            <br />
                            <span className="mt-1.5 inline-block text-slate-500">
                                {brand.companyLine}
                                {brand.contactEmail && (
                                    <>
                                        {" "}•{" "}
                                        <a
                                            href={`mailto:${brand.contactEmail}`}
                                            className="text-sky-400 hover:underline"
                                        >
                                            {brand.contactEmail}
                                        </a>
                                    </>
                                )}
                            </span>
                        </p>

                        {/* Social icons */}
                        <div className="mt-6 flex items-center gap-4 text-slate-400">
                            {footer.socials.filter(isProfileUrl).map((social, index) => (
                                <a
                                    key={keyFor(social.platform, index)}
                                    href={social.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={social.platform}
                                    className="transition-colors hover:text-white"
                                >
                                    <SocialIcon platform={social.platform} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {footer.columns.map((column, index) => (
                        <div
                            key={keyFor(column, index)}
                            className={
                                index === footer.columns.length - 1
                                    ? "lg:col-span-3"
                                    : "lg:col-span-2"
                            }
                        >
                            <h3 className="text-xs font-semibold tracking-wider text-white">
                                {column.title}
                            </h3>
                            <ul className="mt-4 space-y-2.5 text-xs">
                                {column.links.map((link, linkIndex) => (
                                    <li key={keyFor(link, linkIndex)}>
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
                    ))}
                </div>

                {/* Bottom line */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-[11px] text-slate-500 sm:flex-row">
                    <p>&copy; {year} {brand.copyright}</p>
                    <div className="flex items-center gap-6">
                        {footer.legalLinks.map((link, index) => (
                            <Link
                                key={keyFor(link, index)}
                                href={link.href}
                                className="transition-colors hover:text-slate-300"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
