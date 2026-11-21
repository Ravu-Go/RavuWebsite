import { Link, useForm } from "@inertiajs/react";
import {
    AlertCircle,
    ArrowRight,
    Building2,
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Phone,
    Smartphone,
} from "lucide-react";
import { useState } from "react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import logoImg from "../../../imgs/Logo.png";

export default function Register() {
    const [visible, setVisible] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        phone: "",
        category: "Fuel & Energy Station",
        password: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/register");
    };

    return (
        <WebsiteLayout>
            <section className="min-h-[calc(100vh-120px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
                <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/5 grid lg:grid-cols-12">
                    {/* Left Brand & Partner Benefits Column */}
                    <div className="lg:col-span-5 bg-[#050B17] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 opacity-30"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle at 15% 15%, #00289a 0%, transparent 60%)",
                            }}
                        />

                        <div className="relative z-10">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2.5"
                            >
                                <img
                                    src={logoImg}
                                    alt="RAVU"
                                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white/15"
                                />
                                <span className="text-xl font-black tracking-tight text-white">
                                    Ravu
                                </span>
                            </Link>

                            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-300">
                                <Building2 size={13} />
                                <span>Partner Onboarding</span>
                            </div>

                            <h1 className="mt-4 text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white">
                                Partner with the RAVU mobility ecosystem.
                            </h1>

                            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-300">
                                Create your Partner Portal account to connect
                                your business with thousands of verified RAVU
                                riders and drivers across Tanzania.
                            </p>

                            <ul className="mt-7 space-y-3 border-t border-white/10 pt-6">
                                {[
                                    "Immediate access to your RAVU Partner Dashboard",
                                    "Publish exclusive discounts for verified RAVU riders",
                                    "Verify digital RAVU Member IDs at your branches",
                                    "Sign in anytime using your registered partner email",
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-2.5 text-xs text-slate-200"
                                    >
                                        <CheckCircle2
                                            size={15}
                                            className="mt-0.5 shrink-0 text-sky-400"
                                        />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="relative z-10 mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00289a] text-white">
                                    <Smartphone size={15} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">
                                        Are you a Rider or Driver?
                                    </p>
                                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                                        Rider membership registration takes
                                        place in the{" "}
                                        <Link
                                            href="/for-riders"
                                            className="font-semibold text-sky-300 hover:underline"
                                        >
                                            RAVU Mobile App
                                        </Link>
                                        .
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Partner Registration Form */}
                    <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
                        <div className="max-w-md w-full mx-auto">
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                                Create Partner Account
                            </h2>
                            <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                                Register your organization to access the RAVU
                                Partner Dashboard.
                            </p>

                            {(errors.email ||
                                errors.name ||
                                errors.password) && (
                                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-semibold text-rose-700">
                                    <AlertCircle
                                        size={15}
                                        className="mt-0.5 shrink-0"
                                    />
                                    <span>
                                        {errors.email ||
                                            errors.name ||
                                            errors.password}
                                    </span>
                                </div>
                            )}

                            <form
                                className="mt-6 space-y-4"
                                onSubmit={handleSubmit}
                            >
                                <div>
                                    <label
                                        htmlFor="register-name"
                                        className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                    >
                                        Organization / Business Name
                                    </label>
                                    <div className="relative mt-1.5">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                            <Building2 size={16} />
                                        </div>
                                        <input
                                            id="register-name"
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            placeholder="e.g. Kariakoo Auto Spares Ltd"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pr-4 pl-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#00289a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00289a]/15 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="register-email"
                                            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                        >
                                            Business Email
                                        </label>
                                        <div className="relative mt-1.5">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                                <Mail size={16} />
                                            </div>
                                            <input
                                                id="register-email"
                                                type="email"
                                                required
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="partner@company.co.tz"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pr-3 pl-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#00289a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00289a]/15 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="register-phone"
                                            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                        >
                                            Phone Number
                                        </label>
                                        <div className="relative mt-1.5">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                                <Phone size={16} />
                                            </div>
                                            <input
                                                id="register-phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        "phone",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="+255 712 345 678"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pr-3 pl-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#00289a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00289a]/15 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="register-category"
                                        className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                    >
                                        Business Sector
                                    </label>
                                    <select
                                        id="register-category"
                                        value={data.category}
                                        onChange={(e) =>
                                            setData("category", e.target.value)
                                        }
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-[#00289a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00289a]/15 transition-colors"
                                    >
                                        <option>
                                            Spare Parts Supplier &amp; Auto Retailer (10%–25% Member Discount)
                                        </option>
                                        <option>
                                            Mechanical Garage &amp; Vehicle Service Center (5%–20% Member Discount)
                                        </option>
                                        <option>
                                            Insurance Underwriter &amp; Protection Provider (20%+ Member Discount)
                                        </option>
                                        <option>
                                            Tire, Battery &amp; Lubricant Center
                                        </option>
                                        <option>
                                            Fuel &amp; Energy Station
                                        </option>
                                        <option>
                                            Commercial Fleet, Truck &amp; Bus Service Partner
                                        </option>
                                        <option>
                                            Healthcare &amp; Family Medical Provider
                                        </option>
                                        <option>
                                            Bank &amp; Financial Institution
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="register-password"
                                        className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                                    >
                                        Create Password (min. 6 characters)
                                    </label>
                                    <div className="relative mt-1.5">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            id="register-password"
                                            type={visible ? "text" : "password"}
                                            required
                                            minLength={6}
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="••••••••"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pr-10 pl-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#00289a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00289a]/15 transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setVisible(!visible)
                                            }
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

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#00289a] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-[#001f78] active:scale-[0.99] disabled:opacity-60 cursor-pointer transition-all duration-150 group"
                                >
                                    <span>
                                        {processing
                                            ? "Creating Partner Account..."
                                            : "Register & Open Partner Dashboard"}
                                    </span>
                                    <ArrowRight
                                        size={16}
                                        className="transition-transform group-hover:translate-x-0.5"
                                    />
                                </button>
                            </form>

                            <div className="mt-7 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                                <span>Already have a Partner or Admin account?</span>
                                <Link
                                    href="/login"
                                    className="font-bold text-[#00289a] hover:underline"
                                >
                                    Sign in here →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </WebsiteLayout>
    );
}
