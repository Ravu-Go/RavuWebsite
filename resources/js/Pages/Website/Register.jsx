import { Link, router, useForm } from "@inertiajs/react";
import { Eye, EyeOff, LocateFixed, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import WebsiteLayout from "../../Components/WebsiteLayout";
import logoImg from "../../../imgs/Logo.png";

// Used only when the server sends no categories; sent by name, never by id.
const DEFAULT_CATEGORIES = [
    "Spare Parts Dealers",
    "Motorcycle Workshops (Boda Boda & Bajaj)",
    "Vehicle Workshops & Garages",
    "Fuel & Energy Stations",
    "Insurance Providers & Brokers",
    "Vehicle Dealerships & Fleets",
    "Financial & Micro-credit Services",
    "Other Commercial Services",
].map((name) => ({ id: null, name }));

const REGISTRATION_STEPS = [
    // Matches the RAVU app's partner record: name, category, address, phone and location.
    { title: "Business", fields: ["business_name", "category_id", "address", "business_phone", "latitude", "longitude"] },
    { title: "Contact", fields: ["name", "position", "email", "phone"] },
    { title: "Account", fields: ["password", "password_confirmation", "terms", "privacy"] },
];

export default function Register({ categories = [], policyLinks = {} }) {
    const [visible, setVisible] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const stepPanelRef = useRef(null);
    const stepHeadingRef = useRef(null);
    const previousStepRef = useRef(activeStep);
    const availableCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
    const [locating, setLocating] = useState(false);
    const [locationError, setLocationError] = useState("");

    useEffect(() => {
        if (previousStepRef.current !== activeStep) {
            stepHeadingRef.current?.focus();
            previousStepRef.current = activeStep;
        }
    }, [activeStep]);

    const { data, setData, post, processing, errors } = useForm({
        business_name: "",
        category_id: "",
        address: "",
        business_phone: "",
        latitude: "",
        longitude: "",
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

    const validateCurrentStep = () => {
        const fields = stepPanelRef.current?.querySelectorAll("input, select, textarea");
        const invalidField = Array.from(fields || []).find(
            (field) => !field.checkValidity(),
        );

        if (invalidField) {
            invalidField.reportValidity();
            return false;
        }

        return true;
    };

    const continueToNextStep = () => {
        if (validateCurrentStep()) {
            setActiveStep((currentStep) => Math.min(currentStep + 1, REGISTRATION_STEPS.length - 1));
        }
    };

    const pinLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Your browser cannot share its location.");
            return;
        }
        setLocating(true);
        setLocationError("");
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setData((prev) => ({
                    ...prev,
                    latitude: coords.latitude.toFixed(7),
                    longitude: coords.longitude.toFixed(7),
                }));
                setLocating(false);
            },
            () => {
                setLocationError("Could not get your location. You can skip this step.");
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    const clearLocation = () => setData((prev) => ({ ...prev, latitude: "", longitude: "" }));

    const handleSubmit = (event) => {
        if (activeStep < REGISTRATION_STEPS.length - 1) {
            event.preventDefault();
            continueToNextStep();
            return;
        }

        if (!validateCurrentStep()) {
            event.preventDefault();
            return;
        }

        submit(event);
    };

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
                const errorStep = REGISTRATION_STEPS.findIndex((step) =>
                    step.fields.some((field) => errs?.[field]),
                );
                if (errorStep !== -1) {
                    setActiveStep(errorStep);
                }

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
            <section className="min-h-[calc(100vh-120px)] bg-slate-50 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
                    <div className="text-center">
                        <img
                            src={logoImg}
                            alt="RAVU"
                            className="mx-auto h-12 w-12 rounded-full object-cover"
                        />
                        <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                            Create your Partner Account
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Register your business to join the RAVU partner network.
                        </p>
                    </div>

                    <div className="mt-8">
                        <div className="mb-6">
                            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                                <span>Step {activeStep + 1} of {REGISTRATION_STEPS.length}</span>
                                <span>{REGISTRATION_STEPS[activeStep].title}</span>
                            </div>
                            <div
                                role="progressbar"
                                aria-label={`Registration progress: ${REGISTRATION_STEPS[activeStep].title}`}
                                aria-valuemin={1}
                                aria-valuemax={REGISTRATION_STEPS.length}
                                aria-valuenow={activeStep + 1}
                                className="h-2 overflow-hidden rounded-full bg-slate-100"
                            >
                                <div
                                    className="h-full rounded-full bg-[#1864E8] transition-[width]"
                                    style={{ width: `${((activeStep + 1) / REGISTRATION_STEPS.length) * 100}%` }}
                                />
                            </div>
                            <ol className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                                {REGISTRATION_STEPS.map((step, index) => (
                                    <li
                                        key={step.title}
                                        aria-current={index === activeStep ? "step" : undefined}
                                        className={index === activeStep ? "font-semibold text-[#1864E8]" : "text-slate-400"}
                                    >
                                        {step.title}
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="grid gap-y-4">
                            <section
                                ref={stepPanelRef}
                                aria-labelledby="registration-step-heading"
                                className="grid gap-x-6 gap-y-4 sm:col-span-2 sm:grid-cols-2"
                            >
                                <div className="sm:col-span-2">
                                    <h2
                                        id="registration-step-heading"
                                        ref={stepHeadingRef}
                                        tabIndex={-1}
                                        className="text-lg font-bold text-slate-900"
                                    >
                                        {activeStep === 0 && "Tell us about your business"}
                                        {activeStep === 1 && "How can we contact you?"}
                                        {activeStep === 2 && "Secure your account"}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {activeStep === 0 && "Your business name, category and where members can find you."}
                                        {activeStep === 1 && "Enter the details of your main contact person."}
                                        {activeStep === 2 && "Set a password and accept our policies to finish."}
                                    </p>
                                </div>

                                {activeStep === 0 && (
                                    <>
                                        <Field label="Business / Company Name" error={errors.business_name} className="sm:col-span-2">
                                            <input
                                                type="text"
                                                autoComplete="organization"
                                                placeholder="Business name"
                                                value={data.business_name}
                                                onChange={(e) => setData("business_name", e.target.value)}
                                                className={inputClass}
                                                required
                                            />
                                        </Field>

                                        <Field label="Business Category" error={errors.category_id} className="sm:col-span-2">
                                            <input
                                                type="text"
                                                list="business-category-options"
                                                autoComplete="off"
                                                placeholder="Choose a category or type your own"
                                                value={
                                                    availableCategories.find(
                                                        (category) => String(category.id) === String(data.category_id),
                                                    )?.name || data.category_id
                                                }
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const selectedCategory = availableCategories.find(
                                                        (category) => category.name.toLowerCase() === value.trim().toLowerCase(),
                                                    );
                                                    setData("category_id", selectedCategory?.id ? String(selectedCategory.id) : value);
                                                }}
                                                className={inputClass}
                                                required
                                            />
                                            <datalist id="business-category-options">
                                                {availableCategories.map((category) => (
                                                    <option key={category.id ?? category.name} value={category.name} />
                                                ))}
                                            </datalist>
                                            <span className="mt-1 block text-xs text-slate-500">
                                                Choose a suggestion or type your business category.
                                            </span>
                                        </Field>

                                        <Field label="Business Address" error={errors.address} className="sm:col-span-2">
                                            <input
                                                type="text"
                                                autoComplete="street-address"
                                                placeholder="Street, area and city, e.g. Morogoro Rd, Kariakoo, Dar es Salaam"
                                                value={data.address}
                                                onChange={(e) => setData("address", e.target.value)}
                                                className={inputClass}
                                                maxLength={255}
                                                required
                                            />
                                        </Field>

                                        <Field label="Business Phone (optional)" error={errors.business_phone} className="sm:col-span-2">
                                            <input
                                                type="tel"
                                                autoComplete="tel"
                                                placeholder="+255 7XX XXX XXX"
                                                value={data.business_phone}
                                                onChange={(e) => setData("business_phone", e.target.value)}
                                                className={inputClass}
                                            />
                                            <span className="mt-1 block text-xs text-slate-500">
                                                The number members call. Leave blank to use the contact person&apos;s number.
                                            </span>
                                        </Field>

                                        <div className="sm:col-span-2">
                                            <span className="text-xs font-semibold text-slate-700">Map Location (optional)</span>
                                            {data.latitude && data.longitude ? (
                                                <div className="mt-1.5 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
                                                    <span className="flex items-center gap-2">
                                                        <MapPin size={16} className="text-[#1864E8]" />
                                                        {data.latitude}, {data.longitude}
                                                    </span>
                                                    <button type="button" onClick={clearLocation} className="text-xs font-semibold text-slate-500 hover:text-rose-600">
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={pinLocation}
                                                    disabled={locating}
                                                    className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-[#1864E8] hover:text-[#1864E8] disabled:opacity-60"
                                                >
                                                    <LocateFixed size={16} />
                                                    {locating ? "Getting your location…" : "Use my current location"}
                                                </button>
                                            )}
                                            <span className="mt-1 block text-xs text-slate-500">
                                                Helps riders find you on the map. Only do this while you are at the business.
                                            </span>
                                            {(locationError || errors.latitude || errors.longitude) && (
                                                <span className="mt-1 block text-xs text-rose-600">
                                                    {locationError || errors.latitude || errors.longitude}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}

                                {activeStep === 1 && (
                                    <>
                                        <Field label="Contact Person Full Name" error={errors.name}>
                                            <input
                                                type="text"
                                                autoComplete="name"
                                                placeholder="Full name"
                                                value={data.name}
                                                onChange={(e) => setData("name", e.target.value)}
                                                className={inputClass}
                                                required
                                            />
                                        </Field>

                                        <Field label="Position / Role" error={errors.position}>
                                            <input
                                                type="text"
                                                autoComplete="organization-title"
                                                placeholder="e.g. Owner"
                                                value={data.position}
                                                onChange={(e) => setData("position", e.target.value)}
                                                className={inputClass}
                                            />
                                        </Field>

                                        <Field label="Business Email" error={errors.email} className="sm:col-span-2">
                                            <input
                                                type="email"
                                                autoComplete="email"
                                                placeholder="you@company.co.tz"
                                                value={data.email}
                                                onChange={(e) => setData("email", e.target.value)}
                                                className={inputClass}
                                                required
                                            />
                                        </Field>

                                        <Field label="Mobile / WhatsApp Number" error={errors.phone} className="sm:col-span-2">
                                            <input
                                                type="tel"
                                                autoComplete="tel"
                                                placeholder="0712 345 678"
                                                value={data.phone}
                                                onChange={(e) => setData("phone", e.target.value)}
                                                className={inputClass}
                                                required
                                            />
                                            <span className="mt-1 block text-xs text-slate-500">
                                                A Tanzanian mobile number. Each RAVU account needs its own number.
                                            </span>
                                        </Field>
                                    </>
                                )}

                                {activeStep === 2 && (
                                    <>
                                        <Field label="Password" error={errors.password} className="sm:col-span-2">
                                            <div className="relative">
                                                <input
                                                    type={visible ? "text" : "password"}
                                                    autoComplete="new-password"
                                                    placeholder="Minimum 8 characters"
                                                    value={data.password}
                                                    onChange={(e) => setData("password", e.target.value)}
                                                    className={`${inputClass} pr-10`}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setVisible((value) => !value)}
                                                    aria-label={visible ? "Hide password" : "Show password"}
                                                    className="absolute inset-y-0 right-3 my-auto h-fit text-slate-400 hover:text-slate-600"
                                                >
                                                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </Field>

                                        <Field label="Confirm Password" error={errors.password_confirmation} className="sm:col-span-2">
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

                                        <div className="sm:col-span-2">
                                            <label className="flex cursor-pointer items-start gap-2.5 text-xs text-slate-600">
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
                                                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-[#1864E8]"
                                                    required
                                                />
                                                <span>
                                                    I agree to the{" "}
                                                    {policyLinks.terms ? (
                                                        <a
                                                            href={policyLinks.terms}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="font-semibold text-[#1864E8] underline"
                                                        >
                                                            Terms
                                                        </a>
                                                    ) : (
                                                        <strong className="text-[#1864E8]">Terms</strong>
                                                    )}{" "}
                                                    and{" "}
                                                    {policyLinks.privacy ? (
                                                        <a
                                                            href={policyLinks.privacy}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="font-semibold text-[#1864E8] underline"
                                                        >
                                                            Privacy Policy
                                                        </a>
                                                    ) : (
                                                        <strong className="text-[#1864E8]">Privacy Policy</strong>
                                                    )}
                                                    .
                                                </span>
                                            </label>
                                            {errors.terms && <span className="mt-1 block text-xs text-rose-600">{errors.terms}</span>}
                                            {errors.privacy && <span className="mt-1 block text-xs text-rose-600">{errors.privacy}</span>}
                                        </div>
                                    </>
                                )}
                            </section>

                            <div className="mt-2 flex gap-3">
                                {activeStep > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveStep((currentStep) => currentStep - 1)}
                                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                    >
                                        Back
                                    </button>
                                )}
                                {activeStep < REGISTRATION_STEPS.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={continueToNextStep}
                                        className="ml-auto w-full rounded-xl bg-[#1864E8] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b4bc4] sm:w-auto"
                                    >
                                        Continue
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="ml-auto w-full rounded-xl bg-[#1864E8] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b4bc4] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                    >
                                        {processing ? "Creating Account…" : "Create Account"}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-500">
                        Already registered?{" "}
                        <Link href="/login" className="font-semibold text-[#1864E8] hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </section>
        </WebsiteLayout>
    );
}

const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#1864E8] focus:ring-2 focus:ring-[#1864E8]/15";

function Field({ label, error, className = "", children }) {
    return (
        <label className={`block ${className}`}>
            <span className="text-xs font-semibold text-slate-700">{label}</span>
            {children}
            {error && (
                <span className="mt-1 block text-xs text-rose-600">{error}</span>
            )}
        </label>
    );
}
