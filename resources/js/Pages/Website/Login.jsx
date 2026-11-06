import { Link } from "@inertiajs/react";
import {
    ArrowRight,
    Eye,
    EyeOff,
    Info,
    Lock,
    Mail,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { useState } from "react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import logoImg from "../../../imgs/Logo.png";

export default function Login() {
    const [accountType, setAccountType] = useState("member"); // 'member' | 'partner'
    const [visible, setVisible] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    return (
        <WebsiteLayout>
            <div className="relative min-h-[calc(100vh-140px)] flex items-center justify-center py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40 overflow-hidden">
                {/* Ambient background glows */}
                <div
                    aria-hidden="true"
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-[#00289a]/8 rounded-full blur-3xl pointer-events-none"
                />
                <div
                    aria-hidden="true"
                    className="absolute -bottom-24 -right-24 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none"
                />

                <div className="relative w-full max-w-md">
                    {/* The Auth Card */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-slate-900/5 backdrop-blur-xs">
                        {/* Brand header */}
                        <div className="text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2.5 transition-transform hover:scale-105"
                            >
                                <img
                                    src={logoImg}
                                    alt="RAVU"
                                    className="h-10 w-10 rounded-full object-cover shadow-xs"
                                />
                                <span className="text-2xl font-black tracking-tight text-slate-950">
                                    Ravu
                                </span>
                            </Link>

                            <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                                Welcome back
                            </h1>
                            <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                                Sign in to access your RAVU mobility ecosystem
                                account.
                            </p>
                        </div>

                        {/* Account Type Toggle (Member vs Partner) */}
                        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
                            <button
                                type="button"
                                onClick={() => setAccountType("member")}
                                className={`rounded-lg py-2 transition-all ${
                                    accountType === "member"
                                        ? "bg-white text-slate-950 shadow-xs font-bold"
                                        : "hover:text-slate-900"
                                }`}
                            >
                                Member &amp; Rider
                            </button>
                            <button
                                type="button"
                                onClick={() => setAccountType("partner")}
                                className={`rounded-lg py-2 transition-all ${
                                    accountType === "partner"
                                        ? "bg-white text-slate-950 shadow-xs font-bold"
                                        : "hover:text-slate-900"
                                }`}
                            >
                                Partner &amp; Business
                            </button>
                        </div>

                        {/* Notice Banner */}
                        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-sky-100 bg-sky-50/70 p-3 text-sky-950">
                            <Info
                                size={16}
                                className="mt-0.5 shrink-0 text-[#00289a]"
                            />
                            <p className="text-[11px] leading-relaxed text-slate-600">
                                <strong className="font-semibold text-slate-900">
                                    Platform Preview:
                                </strong>{" "}
                                Live authentication will launch alongside the
                                official RAVU mobile app.
                            </p>
                        </div>

                        {/* Form */}
                        <form
                            className="mt-6 space-y-4"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            {/* Identifier input */}
                            <div>
                                <label
                                    htmlFor="login-identifier"
                                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                >
                                    {accountType === "member"
                                        ? "Phone number or email"
                                        : "Business email"}
                                </label>
                                <div className="relative mt-1.5">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        id="login-identifier"
                                        type="text"
                                        value={identifier}
                                        onChange={(e) =>
                                            setIdentifier(e.target.value)
                                        }
                                        placeholder={
                                            accountType === "member"
                                                ? "+255 712 345 678 or name@domain.com"
                                                : "partner@organization.com"
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00289a] focus:outline-none focus:ring-2 focus:ring-[#00289a]/20 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Password input */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="login-password"
                                        className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                    >
                                        Password
                                    </label>
                                    <a
                                        href="#forgot"
                                        className="text-[11px] font-semibold text-[#00289a] hover:underline"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative mt-1.5">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        id="login-password"
                                        type={visible ? "text" : "password"}
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="••••••••••••"
                                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00289a] focus:outline-none focus:ring-2 focus:ring-[#00289a]/20 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setVisible(!visible)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                                        aria-label={
                                            visible
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {visible ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-[#00289a] focus:ring-[#00289a]"
                                    />
                                    <span>Keep me signed in</span>
                                </label>
                                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                    <ShieldCheck size={13} />
                                    Encrypted
                                </span>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled
                                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#00289a] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-[#001f78] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 group"
                            >
                                <span>Sign in to RAVU</span>
                                <ArrowRight
                                    size={16}
                                    className="transition-transform group-hover:translate-x-0.5"
                                />
                            </button>
                        </form>

                        {/* Social / SSO preview */}
                        <div className="relative my-6 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100" />
                            </div>
                            <span className="relative bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Or continue with
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                >
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.66-.82 1.11-1.96.99-3.1-.96.04-2.16.65-2.84 1.45-.6.69-1.13 1.83-1 2.96 1.08.08 2.19-.53 2.85-1.31z" />
                                </svg>
                                <span>Apple</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                >
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                    />
                                </svg>
                                <span>Google</span>
                            </button>
                        </div>

                        {/* Switch to Register link */}
                        <div className="mt-7 text-center pt-5 border-t border-slate-100">
                            <p className="text-xs text-slate-600">
                                Don&apos;t have an account yet?{" "}
                                <Link
                                    href="/register"
                                    className="font-bold text-[#00289a] hover:underline"
                                >
                                    Register your interest
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Trust footer note */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                        <Sparkles size={14} className="text-[#00289a]" />
                        <span>One unified account for the entire RAVU ecosystem</span>
                    </div>
                </div>
            </div>
        </WebsiteLayout>
    );
}
