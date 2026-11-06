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
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import WebsiteLayout from "../../Components/WebsiteLayout";
import logoImg from "../../../imgs/Logo.png";

export default function Login({ flash }) {
    const [visible, setVisible] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: true,
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

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
                            Welcome back
                        </h1>
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                            Enter your email and password to sign in.
                        </p>
                    </div>

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
