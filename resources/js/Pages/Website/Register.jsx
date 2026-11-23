import { Link, router, useForm } from "@inertiajs/react";
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    Eye,
    EyeOff,
    HelpCircle,
    Lock,
    Mail,
    Phone,
    Shield,
    Sparkles,
    Tag,
    Wrench,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import WebsiteLayout from "../../Components/WebsiteLayout";
import logoImg from "../../../imgs/Logo.png";

const DEFAULT_CATEGORIES = [
    { id: 4, name: "Spare Parts Dealers" },
    { id: 2, name: "Motorcycle Workshops (Boda Boda & Bajaj)" },
    { id: 3, name: "Vehicle Workshops & Garages" },
    { id: 1, name: "Fuel & Energy Stations" },
    { id: 5, name: "Insurance Providers & Brokers" },
    { id: 7, name: "Vehicle Dealerships & Fleets" },
    { id: 6, name: "Financial & Micro-credit Services" },
    { id: 10, name: "Other Commercial Services" },
];

export default function Register({ categories = [], policyLinks = {} }) {
    const [visible, setVisible] = useState(false);
    const availableCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

    const { data, setData, post, processing, errors } = useForm({
        business_name: "",
        category_id: "",
        name: "",
        position: "",
        email: "",
        phone: "",
        preferred_communication: "whatsapp",
        password: "",
        password_confirmation: "",
        terms: true,
        privacy: true,
    });

    const submit = (event) => {
        event.preventDefault();
        post("/register", {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                const hasErrors =
                    page?.props?.errors &&
                    Object.keys(page.props.errors).length > 0;
                if (!hasErrors) {
                    toast.success("Account created! Opening your partner portal…");
                    router.visit("/partner-dashboard");
                }
            },
            onError: (errs) => {
                const first = Object.values(errs || {})[0];
                if (first) {
                    toast.error(first);
                } else {
                    toast.error("Please check the form fields.");
                }
            },
        });
    };

    return (
        <WebsiteLayout>
            <section className="min-h-[calc(100vh-120px)] bg-slate-50 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-12">
                    {/* Left Column / Brand Hero */}
                    <aside className="relative flex flex-col justify-between overflow-hidden bg-[#050B17] p-8 text-white sm:p-10 lg:col-span-5">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 opacity-40"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle at 10% 5%, #1864E8 0%, transparent 60%)",
                            }}
                        />

                        <div className="relative">
                            <Link href="/" className="inline-flex items-center gap-2.5">
                                <img
                                    src={logoImg}
                                    alt="RAVU"
                                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                                />
                                <span className="text-xl font-black tracking-tight">RAVU</span>
                            </Link>

                            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-300">
                                <Building2 size={14} /> Partner Network
                            </div>

                            <h1 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
                                Connect your business with RAVU members.
                            </h1>

                            <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                                Register your business to start accepting thousands of verified riders, drivers, and fleet operators looking for trusted spare parts, garages, fuel, and services across Tanzania.
                            </p>

                            <div className="mt-7 space-y-3.5 border-t border-white/10 pt-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                                        <Tag size={15} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">Offer Member Discounts</p>
                                        <p className="text-[11px] text-slate-300">Set custom member discounts (e.g. 5%–20%) to drive high-volume repeat mobility traffic.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                                        <Shield size={15} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">Attach TIN & Business License</p>
                                        <p className="text-[11px] text-slate-300">Complete verification privately inside your portal at your own pace.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                                        <Sparkles size={15} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">Direct App Listing</p>
                                        <p className="text-[11px] text-slate-300">Your workshop or store will be featured directly on the RAVU Rider & Driver mobile app.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                            <p className="text-xs text-slate-300">
                                Already registered as a RAVU Partner?{" "}
                                <Link
                                    href="/login"
                                    className="font-black text-sky-400 underline hover:text-sky-300"
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </aside>

                    {/* Right Column / Registration Form */}
                    <div className="p-6 sm:p-10 lg:col-span-7">
                        <div>
                            <span className="text-xs font-black uppercase tracking-wider text-[#1864E8]">
                                Fast & Easy Registration
                            </span>
                            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                                Create your Partner Account
                            </h2>
                            <p className="mt-1.5 text-xs text-slate-600 sm:text-sm">
                                Register now to access your Partner Portal where you can upload verification documents, set your business location, and specify member discounts.
                            </p>
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
                                <p className="font-bold">Please check the following details:</p>
                                <ul className="mt-1.5 list-disc space-y-1 pl-4">
                                    {Object.values(errors).map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-6 space-y-4">
                            {/* Business Info Section */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                                <p className="text-xs font-black uppercase tracking-wider text-slate-700">
                                    1. Your Business Details
                                </p>
                                <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
                                    <Field label="Business / Company Name" error={errors.business_name} className="sm:col-span-2">
                                        <div className="relative">
                                            <Building2 className={iconClass} size={16} />
                                            <input
                                                type="text"
                                                placeholder="e.g. Dar City Spare Parts & Garage Ltd"
                                                value={data.business_name}
                                                onChange={(e) => setData("business_name", e.target.value)}
                                                className={`${inputClass} pl-10`}
                                                required
                                            />
                                        </div>
                                    </Field>

                                    <Field label="Business Category" error={errors.category_id} className="sm:col-span-2">
                                        <select
                                            value={data.category_id}
                                            onChange={(e) => setData("category_id", e.target.value)}
                                            className={inputClass}
                                            required
                                        >
                                            <option value="">Select your business type…</option>
                                            {availableCategories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>
                            </div>

                            {/* Contact Person Section */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                                <p className="text-xs font-black uppercase tracking-wider text-slate-700">
                                    2. Representative Contact Details
                                </p>
                                <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
                                    <Field label="Contact Person Full Name" error={errors.name}>
                                        <input
                                            type="text"
                                            autoComplete="name"
                                            placeholder="e.g. Saleh Juma"
                                            value={data.name}
                                            onChange={(e) => setData("name", e.target.value)}
                                            className={inputClass}
                                            required
                                        />
                                    </Field>

                                    <Field label="Position / Role" error={errors.position}>
                                        <input
                                            type="text"
                                            placeholder="e.g. Managing Director / Owner"
                                            value={data.position}
                                            onChange={(e) => setData("position", e.target.value)}
                                            className={inputClass}
                                            required
                                        />
                                    </Field>

                                    <Field label="Business Email" error={errors.email}>
                                        <div className="relative">
                                            <Mail className={iconClass} size={16} />
                                            <input
                                                type="email"
                                                autoComplete="email"
                                                placeholder="sales@company.co.tz"
                                                value={data.email}
                                                onChange={(e) => setData("email", e.target.value)}
                                                className={`${inputClass} pl-10`}
                                                required
                                            />
                                        </div>
                                    </Field>

                                    <Field label="Phone / WhatsApp Number" error={errors.phone}>
                                        <div className="relative">
                                            <Phone className={iconClass} size={16} />
                                            <input
                                                type="tel"
                                                autoComplete="tel"
                                                placeholder="+255 7XX XXX XXX"
                                                value={data.phone}
                                                onChange={(e) => setData("phone", e.target.value)}
                                                className={`${inputClass} pl-10`}
                                                required
                                            />
                                        </div>
                                    </Field>
                                </div>
                            </div>

                            {/* Password Section */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                                <p className="text-xs font-black uppercase tracking-wider text-slate-700">
                                    3. Portal Security
                                </p>
                                <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
                                    <Field label="Password" error={errors.password}>
                                        <div className="relative">
                                            <Lock className={iconClass} size={16} />
                                            <input
                                                type={visible ? "text" : "password"}
                                                autoComplete="new-password"
                                                placeholder="Minimum 8 characters"
                                                value={data.password}
                                                onChange={(e) => setData("password", e.target.value)}
                                                className={`${inputClass} pl-10 pr-10`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setVisible((value) => !value)}
                                                aria-label={visible ? "Hide password" : "Show password"}
                                                className="absolute inset-y-0 right-3 text-slate-400 hover:text-slate-600"
                                            >
                                                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </Field>

                                    <Field label="Confirm Password" error={errors.password_confirmation}>
                                        <input
                                            type={visible ? "text" : "password"}
                                            autoComplete="new-password"
                                            placeholder="Repeat password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData("password_confirmation", e.target.value)}
                                            className={inputClass}
                                            required
                                        />
                                    </Field>
                                </div>
                            </div>

                            {/* Terms Agreement */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.terms}
                                        onChange={(e) =>
                                            setData((prev) => ({
                                                ...prev,
                                                terms: e.target.checked,
                                                privacy: e.target.checked,
                                            }))
                                        }
                                        className="mt-0.5 h-4 w-4 rounded accent-[#1864E8]"
                                        required
                                    />
                                    <span>
                                        I agree to the{" "}
                                        {policyLinks.terms ? (
                                            <a
                                                href={policyLinks.terms}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-bold text-[#1864E8] underline"
                                            >
                                                RAVU Partner Terms
                                            </a>
                                        ) : (
                                            <strong className="text-[#1864E8]">RAVU Partner Terms</strong>
                                        )}{" "}
                                        and{" "}
                                        {policyLinks.privacy ? (
                                            <a
                                                href={policyLinks.privacy}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-bold text-[#1864E8] underline"
                                            >
                                                Privacy Guidelines
                                            </a>
                                        ) : (
                                            <strong className="text-[#1864E8]">Privacy Guidelines</strong>
                                        )}
                                        .
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1864E8] px-5 py-3.5 text-sm font-black text-white shadow-md shadow-[#1864E8]/20 transition-all hover:bg-[#00289a] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? "Creating Account…" : "Create Partner Account & Open Portal"}
                                <ArrowRight size={16} />
                            </button>
                        </form>

                        <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>Instant portal access — attach TIN, license, location, and discounts next.</span>
                        </div>
                    </div>
                </div>
            </section>
        </WebsiteLayout>
    );
}

const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#1864E8] focus:bg-white focus:ring-2 focus:ring-[#1864E8]/15";
const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400";

function Field({ label, error, className = "", children }) {
    return (
        <label className={`block text-[11px] font-bold uppercase tracking-wider text-slate-700 ${className}`}>
            {label}
            {children}
            {error && (
                <span className="mt-1 block text-xs font-semibold normal-case text-rose-600">
                    {error}
                </span>
            )}
        </label>
    );
}
