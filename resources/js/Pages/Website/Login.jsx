import { Link, router, useForm } from "@inertiajs/react";
import {
    AlertCircle,
    ArrowRight,
    Eye,
    EyeOff,
    Lock,
    Mail,
    ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import WebsiteLayout from "../../Components/WebsiteLayout";
import logoImg from "../../../imgs/Logo.png";

function GoogleIcon({ size = 16 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
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
    );
}

function timeAgo(iso) {
    if (!iso) return null;
    const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (Number.isNaN(seconds)) return null;
    if (seconds < 60) return "just now";
    const units = [
        ["year", 31536000],
        ["month", 2592000],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
    ];
    for (const [unit, size] of units) {
        const value = Math.floor(seconds / size);
        if (value >= 1) return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
    }
    return null;
}

function Avatar({ profile }) {
    const [broken, setBroken] = useState(false);
    const initial = (profile.name || profile.email || "?")
        .charAt(0)
        .toUpperCase();

    if (profile.avatar && !broken) {
        return (
            <img
                src={profile.avatar}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setBroken(true)}
                className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white shadow-xs"
            />
        );
    }

    return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00289a] text-base font-black text-white ring-2 ring-white shadow-xs">
            {initial}
        </div>
    );
}

export default function Login({ flash, auth }) {
    const remembered = auth?.rememberedProfile || null;
    const googleEnabled = Boolean(auth?.googleEnabled);

    const [visible, setVisible] = useState(false);
    const passwordRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: remembered?.email || "",
        password: "",
        remember: true,
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    // Returning password users only need to type their password.
    useEffect(() => {
        if (remembered?.email && remembered.provider === "password") {
            passwordRef.current?.focus();
        }
    }, [remembered?.email, remembered?.provider]);

    const googleHref = remembered?.email
        ? `/auth/google/redirect?login_hint=${encodeURIComponent(remembered.email)}`
        : "/auth/google/redirect";

    const handleForgetProfile = () => {
        router.post(
            "/login/forget-profile",
            {},
            {
                preserveScroll: true,
                onSuccess: () => setData("email", ""),
            },
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/login", {
            preserveScroll: true,
            onSuccess: (page) => {
                const hasErrors =
                    page?.props?.errors &&
                    Object.keys(page.props.errors).length > 0;
                if (!hasErrors && page?.component === "Website/Login") {
                    const role = page?.props?.auth?.user?.role;
                    const isAdmin =
                        role === "super_admin" ||
                        data.email.trim().toLowerCase() === "jux@ravu.com";
                    router.visit(
                        isAdmin ? "/super-admin" : "/partner-dashboard",
                    );
                }
            },
            onError: () => {
                reset("password");
            },
        });
    };

    const firstName = remembered?.name?.split(/[\s(]/)[0] || "";
    const lastSeen = timeAgo(remembered?.last_login_at);

    return (
        <WebsiteLayout>
            <section className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/70">
                <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-lg shadow-slate-900/5">
                    {/* Brand Header */}
                    <div className="text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-90"
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

                        <h1 className="mt-5 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                            {remembered
                                ? `Welcome back${firstName ? `, ${firstName}` : ""}`
                                : "Welcome back"}
                        </h1>
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                            {remembered
                                ? "Pick up where you left off."
                                : "Enter your email and password to sign in."}
                        </p>
                    </div>

                    {/* Remembered profile from the previous login */}
                    {remembered && (
                        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
                            <div className="flex items-center gap-3">
                                <Avatar profile={remembered} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-slate-950">
                                        {remembered.name || remembered.email}
                                    </p>
                                    <p className="truncate text-xs text-slate-500">
                                        {remembered.email}
                                    </p>
                                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                                        {remembered.provider === "google" ? (
                                            <GoogleIcon size={11} />
                                        ) : (
                                            <Lock size={11} />
                                        )}
                                        <span>
                                            {remembered.provider === "google"
                                                ? "Signed in with Google"
                                                : "Signed in with password"}
                                            {lastSeen ? ` · ${lastSeen}` : ""}
                                        </span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleForgetProfile}
                                    className="shrink-0 text-[11px] font-semibold text-slate-500 hover:text-[#00289a] hover:underline cursor-pointer"
                                >
                                    Not you?
                                </button>
                            </div>

                            {remembered.provider === "google" &&
                                googleEnabled && (
                                    <a
                                        href={googleHref}
                                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00289a] py-2.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-[#001f78] transition-colors"
                                    >
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                                            <GoogleIcon size={13} />
                                        </span>
                                        <span>
                                            Continue as {firstName || "you"}
                                        </span>
                                    </a>
                                )}
                        </div>
                    )}

                    {/* Validation Error Banner */}
                    {errors.email && (
                        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-semibold text-rose-700">
                            <AlertCircle
                                size={15}
                                className="mt-0.5 shrink-0"
                            />
                            <span>{errors.email}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="login-email"
                                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                            >
                                Email Address
                            </label>
                            <div className="relative mt-1.5">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <Mail size={16} />
                                </div>
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    placeholder="name@company.com"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pr-4 pl-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#00289a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00289a]/15 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="login-password"
                                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                >
                                    Password
                                </label>
                                <Link
                                    href="/support"
                                    className="text-[11px] font-semibold text-[#00289a] hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative mt-1.5">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <Lock size={16} />
                                </div>
                                <input
                                    id="login-password"
                                    ref={passwordRef}
                                    type={visible ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pr-10 pl-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#00289a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00289a]/15 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setVisible(!visible)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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

                        <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-[#00289a] focus:ring-[#00289a]"
                                />
                                <span>Keep me signed in</span>
                            </label>
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                <ShieldCheck size={13} />
                                Encrypted
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#00289a] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-[#001f78] active:scale-[0.99] disabled:opacity-60 cursor-pointer transition-all duration-150 group"
                        >
                            <span>
                                {processing
                                    ? "Signing in..."
                                    : "Sign in to RAVU"}
                            </span>
                            <ArrowRight
                                size={16}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </button>
                    </form>

                    {/* Google sign-in (full page redirect, not an Inertia visit) */}
                    {googleEnabled && (
                        <>
                            <div className="relative my-6 text-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100" />
                                </div>
                                <span className="relative bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Or
                                </span>
                            </div>

                            <a
                                href={googleHref}
                                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                            >
                                <GoogleIcon />
                                <span>Continue with Google</span>
                            </a>
                        </>
                    )}

                    {/* Partner Registration Link */}
                    <div className="mt-7 pt-5 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-600">
                            Don&apos;t have a Partner account yet?{" "}
                            <Link
                                href="/register"
                                className="font-bold text-[#00289a] hover:underline"
                            >
                                Register as a Partner
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </WebsiteLayout>
    );
}
