import { Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    ArrowRight,
    BadgePercent,
    Bell,
    Building2,
    Calculator,
    Check,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    FileText,
    LogOut,
    MapPin,
    QrCode,
    Search,
    Sparkles,
    Tag,
    UploadCloud,
    User,
} from "lucide-react";
import toast from "react-hot-toast";
import logoImg from "../../../imgs/Logo.png";

const STEPS = [
    { id: "business", label: "Business Profile", icon: Building2, desc: "Type of business & registration" },
    { id: "documents", label: "Attach Documents", icon: FileText, desc: "TIN certificate & business license" },
    { id: "location", label: "Business Location", icon: MapPin, desc: "Physical address & landmarks" },
    { id: "benefit", label: "Member Discount", icon: Tag, desc: "RAVU member discount & savings" },
    { id: "review", label: "Review & Submit", icon: CheckCircle2, desc: "Final check & submission" },
];

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

const DEFAULT_REQUIREMENTS = [
    {
        id: 1,
        document_type: "tin_certificate",
        label: "TRA TIN Certificate",
        description: "Taxpayer Identification Certificate issued by TRA for your business.",
        is_required: true,
        requires_expiry_date: false,
    },
    {
        id: 2,
        document_type: "business_license",
        label: "Valid Business License",
        description: "Current municipal or ministerial operating license.",
        is_required: true,
        requires_expiry_date: true,
    },
    {
        id: 3,
        document_type: "business_registration_certificate",
        label: "BRELA Registration Certificate",
        description: "Certificate of Incorporation or Business Name Registration Certificate.",
        is_required: false,
        requires_expiry_date: false,
    },
];

const BENEFIT_TYPES = [
    ["percentage_discount", "Percentage Discount (%) — Recommended"],
    ["fixed_discount", "Fixed Amount Discount (TZS)"],
    ["special_pricing", "Special Member Pricing"],
    ["free_service", "Free Inspection / Added Value Service"],
    ["priority_service", "Priority Service Queue for Members"],
    ["other", "Custom Member Benefit"],
];

const DISCOUNT_PRESETS = [5, 10, 15, 20, 25];

export default function PartnerDashboard({
    partner = {},
    application = {},
    contact = {},
    categories = [],
    requirements = [],
    documents = [],
    location = null,
    benefit = null,
    history = [],
    progress = {},
    canEdit = true,
    notifications = [],
}) {
    const { flash } = usePage().props;
    const [step, setStep] = useState(0);
    const [view, setView] = useState("application"); // 'application' | 'verifier' | 'preview' | 'account'

    // Mock verifier state for cashier / partner staff testing
    const [verifierQuery, setVerifierQuery] = useState("");
    const [verifiedMember, setVerifiedMember] = useState(null);

    // Dynamic categories & requirements fallback
    const allCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
    const allRequirements = requirements.length > 0 ? requirements : DEFAULT_REQUIREMENTS;

    // Forms
    const business = useForm({
        registered_name: partner.registered_name || "",
        trading_name: partner.trading_name || "",
        registration_number: partner.registration_number || "",
        tin_number: partner.tin_number || "",
        partner_category_id: partner.category_id || partner.partner_category_id || "",
        business_description: partner.business_description || "",
        year_established: partner.year_established || "",
        website: partner.website || "",
        social_links: { ...(partner.social_links || {}) },
    });

    // Keep forms in sync when the server returns fresh data after a save.
    // (useForm does not re-initialise automatically on Inertia page visits.)
    const businessSnapshot = JSON.stringify(partner);
    useEffect(() => {
        const fresh = JSON.parse(businessSnapshot);
        business.reset();
        business.setData({
            registered_name: fresh.registered_name || "",
            trading_name: fresh.trading_name || "",
            registration_number: fresh.registration_number || "",
            tin_number: fresh.tin_number || "",
            partner_category_id: fresh.category_id || fresh.partner_category_id || "",
            business_description: fresh.business_description || "",
            year_established: fresh.year_established || "",
            website: fresh.website || "",
            social_links: { ...(fresh.social_links || {}) },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessSnapshot]);

    const locationSnapshot = JSON.stringify({ location, contact });
    useEffect(() => {
        const { location: freshLocation, contact: freshContact } = JSON.parse(locationSnapshot);
        locationForm.reset();
        locationForm.setData({
            country: freshLocation?.country || "Tanzania",
            region: freshLocation?.region || "",
            district: freshLocation?.district || "",
            ward: freshLocation?.ward || "",
            physical_address: freshLocation?.physical_address || "",
            business_phone: freshLocation?.business_phone || freshContact.phone || "",
            operating_hours: freshLocation?.operating_hours || {},
            latitude: freshLocation?.latitude || "",
            longitude: freshLocation?.longitude || "",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationSnapshot]);

    const benefitSnapshot = JSON.stringify(benefit);
    useEffect(() => {
        const fresh = JSON.parse(benefitSnapshot);
        benefitForm.reset();
        benefitForm.setData({
            name: fresh?.name || "",
            description: fresh?.description || "",
            benefit_type: fresh?.benefit_type || "",
            discount_percentage: fresh?.discount_percentage || "",
            discount_amount: fresh?.discount_amount || "",
            currency: fresh?.currency || "TZS",
            products_or_services: fresh?.products_or_services || "",
            partner_location_id: fresh?.partner_location_id || location?.id || "",
            starts_at: fresh?.starts_at || "",
            expires_at: fresh?.expires_at || "",
            terms_and_conditions: fresh?.terms_and_conditions || "",
            redemption_instructions: fresh?.redemption_instructions || "",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [benefitSnapshot]);

    const documentForm = useForm({
        document_type: "",
        file: null,
        expires_at: "",
    });

    const locationForm = useForm({
        country: location?.country || "Tanzania",
        region: location?.region || "",
        district: location?.district || "",
        ward: location?.ward || "",
        physical_address: location?.physical_address || "",
        business_phone: location?.business_phone || contact.phone || "",
        operating_hours: location?.operating_hours || {},
        latitude: location?.latitude || "",
        longitude: location?.longitude || "",
    });

    const benefitForm = useForm({
        name: benefit?.name || "",
        description: benefit?.description || "",
        benefit_type: benefit?.benefit_type || "",
        discount_percentage: benefit?.discount_percentage || "",
        discount_amount: benefit?.discount_amount || "",
        currency: benefit?.currency || "TZS",
        products_or_services: benefit?.products_or_services || "",
        partner_location_id: benefit?.partner_location_id || location?.id || "",
        starts_at: benefit?.starts_at || "",
        expires_at: benefit?.expires_at || "",
        terms_and_conditions: benefit?.terms_and_conditions || "",
        redemption_instructions: benefit?.redemption_instructions || "",
    });

    const accountForm = useForm({
        name: contact.name || "",
        position: contact.position || "",
        phone: contact.phone || "",
        preferred_communication: contact.preferred_communication || "whatsapp",
    });

    // Helper functions
    const currentDocument = (type) => documents.find((item) => item.document_type === type);

    // A document counts only if it is uploaded and not rejected/expired/needs replacement.
    const validDocument = (type) => {
        const doc = currentDocument(type);
        return doc && !['rejected', 'expired', 'replacement_required'].includes(doc.status)
            ? doc
            : null;
    };

    const docStatusLabel = {
        pending_review: 'Uploaded · Awaiting RAVU review',
        approved: 'Verified by RAVU',
        rejected: 'Rejected · Please re-upload',
        replacement_required: 'Replacement requested by RAVU',
        expired: 'Expired · Please re-upload',
    };

    const isBusinessComplete = Boolean(
        progress?.business ??
        (business.data.registered_name &&
            business.data.registration_number &&
            business.data.tin_number &&
            business.data.business_description &&
            business.data.partner_category_id)
    );
    // Use the server-computed missing-documents list when available.
    const isDocsComplete = Boolean(
        progress?.documents ??
        (allRequirements.every(
            (req) => !req.is_required || validDocument(req.document_type)
        ))
    );
    const isLocationComplete = Boolean(
        progress?.location ??
        (location && locationForm.data.region &&
            locationForm.data.district &&
            locationForm.data.physical_address)
    );
    const isBenefitComplete = Boolean(
        progress?.benefit ??
        (benefit?.name &&
            (benefit.discount_percentage || benefit.discount_amount ||
                ['special_pricing', 'free_service', 'priority_service', 'other'].includes(benefit.benefit_type)))
    );

    const completedSteps = useMemo(
        () => [isBusinessComplete, isDocsComplete, isLocationComplete, isBenefitComplete],
        [isBusinessComplete, isDocsComplete, isLocationComplete, isBenefitComplete]
    );

    const completionCount = completedSteps.filter(Boolean).length;
    const completionPercent = Math.round((completionCount / 4) * 100);

    useEffect(() => {
        const firstIncomplete = completedSteps.findIndex((complete) => !complete);
        setStep(firstIncomplete === -1 ? 4 : firstIncomplete);
        // Opening the portal should begin at the first unfinished requirement.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(completedSteps)]);

    const applicationLabels = {
        draft: "Draft Application (In Progress)",
        submitted: "Submitted to RAVU (Under Review)",
        under_review: "Under Review by Partner Team",
        action_required: "Action Required / Clarification Needed",
        approved: "Approved & Verified Partner",
        rejected: "Application Rejected",
        suspended: "Partnership Suspended",
    };

    const currentStatus = application?.status || "draft";

    // Action handlers
    const saveBusiness = (event) => {
        event.preventDefault();
        business.patch("/partner/onboarding/business", {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Business profile saved successfully!");
                setStep(1);
            },
        });
    };

    const uploadDocument = (event) => {
        event.preventDefault();
        if (!documentForm.data.file) {
            toast.error("Please select a file to upload.");
            return;
        }
        documentForm.post("/partner/onboarding/documents", {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Document attached securely.");
                documentForm.reset("file", "expires_at");
            },
        });
    };

    const saveLocation = (event) => {
        event.preventDefault();
        locationForm.patch("/partner/onboarding/location", {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Business location saved.");
                setStep(3);
            },
        });
    };

    const saveBenefit = (event) => {
        event.preventDefault();
        benefitForm.post("/partner/onboarding/benefit", {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Member discount proposal saved.");
                setStep(4);
            },
        });
    };

    const submitApplication = () => {
        if (
            !window.confirm(
                "Submit this partner onboarding application to RAVU for verification? Our team will verify your TIN, license, and member discount proposal."
            )
        )
            return;

        router.post(
            "/partner/onboarding/submit",
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Application submitted to RAVU Partner Review Team!");
                    setStep(4);
                },
            }
        );
    };

    // Quick discount preset selector
    const handleSelectPreset = (pct) => {
        benefitForm.setData((prev) => ({
            ...prev,
            benefit_type: "percentage_discount",
            discount_percentage: String(pct),
        }));
    };

    // Live Member savings calculation example
    const calcDiscount = parseFloat(benefitForm.data.discount_percentage) || 0;
    const exampleAmount = 100000;
    const exampleSavings = Math.round(exampleAmount * (calcDiscount / 100));
    const exampleFinal = exampleAmount - exampleSavings;

    // Mock verifier handler
    const handleVerifyMember = (e) => {
        e.preventDefault();
        const q = verifierQuery.trim().toUpperCase();
        if (!q) return;

        if (q.includes("RAVU") || q.includes("TZ") || q.length >= 4) {
            setVerifiedMember({
                memberId: q.startsWith("RAVU-") ? q : `RAVU-TZ-2024-${q}`,
                name: "Hamisi Bakari Mrema",
                type: "Boda Boda Rider (Commercial)",
                status: "Active & Verified",
                discountEligible: true,
                discountRate: benefitForm.data.discount_percentage ? `${benefitForm.data.discount_percentage}% OFF` : "Partner offer pending",
                joinedDate: "March 2024",
                verifiedAt: new Date().toLocaleTimeString(),
            });
        } else {
            setVerifiedMember({
                memberId: q,
                status: "Invalid / Not Found",
                discountEligible: false,
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Top Navigation */}
            <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl">
                <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2.5">
                            <img
                                src={logoImg}
                                alt="RAVU"
                                width="40"
                                height="40"
                                className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200"
                            />
                            <span className="font-black tracking-tight text-slate-950">
                                RAVU <span className="font-semibold text-slate-400">Partner</span>
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-3 sm:flex">
                            <div className="text-right">
                                <p className="text-xs font-black text-slate-800">
                                    {contact.name || "Partner Representative"}
                                </p>
                                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Account owner
                                </p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#08152F] text-xs font-black text-white">
                                {(contact.name || partner.registered_name || "P").charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <Link
                            as="button"
                            method="post"
                            href="/logout"
                            aria-label="Sign out"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:w-auto sm:px-3"
                        >
                            <LogOut size={15} />
                            <span className="hidden text-xs font-black sm:ml-1.5 sm:inline">Sign out</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Workspace Header */}
            <section className="border-b border-slate-800 bg-[#08152F] text-white">
                <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-400">
                                Partner workspace
                            </p>
                            <h1 className="mt-2 max-w-3xl truncate text-2xl font-black tracking-tight text-white sm:text-3xl">
                                {partner.registered_name || business.data.registered_name || "Set up your business"}
                            </h1>
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                                <span>
                                    {partner.category_name ||
                                        allCategories.find((c) => String(c.id) === String(business.data.partner_category_id))?.name ||
                                        "Category not selected"}
                                </span>
                                <span className="text-slate-600">•</span>
                                <span>TIN {partner.tin_number || business.data.tin_number || "not provided"}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 lg:justify-end">
                            <div className="min-w-32">
                                <div className="flex items-end justify-between">
                                    <span className="text-xs font-bold text-slate-300">Profile setup</span>
                                    <span className="text-lg font-black text-white">{completionPercent}%</span>
                                </div>
                                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                    <div
                                        className="h-full rounded-full bg-sky-400 transition-[width] duration-300"
                                        style={{ width: `${completionPercent}%` }}
                                    />
                                </div>
                            </div>
                            <StatusPill status={currentStatus} label={applicationLabels[currentStatus] || currentStatus} />
                        </div>
                    </div>

                    {/* Navigation tabs */}
                    <nav aria-label="Partner portal sections" className="-mb-6 mt-6 flex gap-1 overflow-x-auto pb-0">
                        <TabButton
                            active={view === "application"}
                            onClick={() => setView("application")}
                            icon={Building2}
                            label="Setup"
                            badge={`${completionCount}/4`}
                        />
                        <TabButton
                            active={view === "verifier"}
                            onClick={() => setView("verifier")}
                            icon={QrCode}
                            label="Member verifier"
                        />
                        <TabButton
                            active={view === "preview"}
                            onClick={() => setView("preview")}
                            icon={Eye}
                            label="Listing preview"
                        />
                        <TabButton
                            active={view === "account"}
                            onClick={() => setView("account")}
                            icon={User}
                            label="Account"
                        />
                    </nav>
                </div>
            </section>

            {/* Main Content Area */}
            <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {flash?.success && (
                    <div
                        role="status"
                        className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 shadow-xs"
                    >
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                        <div>{flash.success}</div>
                    </div>
                )}

                {/* VIEW: ONBOARDING APPLICATION */}
                {view === "application" && (
                    <div className="grid items-start gap-6 lg:grid-cols-12">
                        {/* Left Sidebar Steps */}
                        <aside className="space-y-4 lg:col-span-3">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                        Onboarding Steps
                                    </h2>
                                    <span className="text-xs font-bold text-[#1864E8]">
                                        {completionCount} of 4 complete
                                    </span>
                                </div>

                                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-[#1864E8] transition-all duration-300"
                                        style={{ width: `${completionPercent}%` }}
                                    />
                                </div>

                                <div className="mt-5 space-y-2">
                                    {STEPS.map((s, idx) => {
                                        const done =
                                            idx === 4
                                                ? currentStatus !== "draft"
                                                : completedSteps[idx];
                                        const isCurrent = step === idx;
                                        const IconComponent = s.icon;

                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => setStep(idx)}
                                                className={`group flex w-full items-start gap-3.5 rounded-2xl p-3 text-left transition-all ${
                                                    isCurrent
                                                        ? "border border-blue-200 bg-blue-50/70 text-[#00289a] shadow-xs"
                                                        : "border border-transparent text-slate-600 hover:bg-slate-50"
                                                }`}
                                            >
                                                <div
                                                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors ${
                                                        done
                                                            ? "bg-emerald-600 text-white"
                                                            : isCurrent
                                                            ? "bg-[#1864E8] text-white"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {done ? <Check size={14} /> : idx + 1}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold leading-none text-slate-950">
                                                            {s.label}
                                                        </span>
                                                        {done && (
                                                            <span className="text-[10px] font-bold text-emerald-700">
                                                                Done
                                                            </span>
                                                        )}
                                                        {!done && !isCurrent && (
                                                            <span className="text-[10px] font-bold text-amber-600">
                                                                Incomplete
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-[11px] text-slate-500 leading-tight">
                                                        {s.desc}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Why RAVU Depends on Discounts Note */}
                            <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/80 via-blue-50/40 to-white p-5 shadow-xs">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1864E8] text-white">
                                        <BadgePercent size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black text-slate-950">
                                            Why Discounts Matter
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                            RAVU brings you thousands of active boda boda riders, Bajaj operators, and private drivers who exclusively choose partner garages and stores offering verified member discounts.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications / Feedback */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                                <div className="flex items-center gap-2">
                                    <Bell size={16} className="text-[#1864E8]" />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        Partner Team Updates
                                    </h3>
                                </div>
                                <div className="mt-3 space-y-2.5">
                                    {notifications.length === 0 ? (
                                        <p className="text-xs text-slate-500">
                                            No pending notifications. Review notices will appear here.
                                        </p>
                                    ) : (
                                        notifications.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-700"
                                            >
                                                <p className="font-bold text-slate-900">
                                                    {item.data?.subject || "Update from RAVU"}
                                                </p>
                                                <p className="mt-1 leading-relaxed text-slate-600">
                                                    {item.data?.message}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </aside>

                        {/* Right Form Container */}
                        <div className="min-w-0 space-y-6 lg:col-span-9">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
                                {/* Step Header */}
                                <div className="mb-6 border-b border-slate-100 pb-5">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1864E8]">
                                        <Building2 size={15} />
                                        Step {step + 1} of 5: {STEPS[step]?.label}
                                    </div>
                                    <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                                        {step === 0 && "1. What type of business do you conduct?"}
                                        {step === 1 && "2. Attach TIN & Business License Documents"}
                                        {step === 2 && "3. Where is your business located?"}
                                        {step === 3 && "4. How much discount will you give to RAVU members?"}
                                        {step === 4 && "5. Review & Submit to RAVU"}
                                    </h2>
                                    <p className="mt-1.5 text-xs text-slate-600 sm:text-sm">
                                        {step === 0 &&
                                            "State what business you conduct, your TRA TIN number, and legal business details."}
                                        {step === 1 &&
                                            "Upload your Tax Identification (TIN) Certificate and current operating Business License."}
                                        {step === 2 &&
                                            "Tell members where to find you: specify region, district, street, and prominent nearby landmarks."}
                                        {step === 3 &&
                                            "Since RAVU depends on member discounts, configure the percentage or fixed savings you offer to active riders."}
                                        {step === 4 &&
                                            "Review all submitted details and send your application to RAVU Partner Reviewers for verification."}
                                    </p>
                                </div>

                                {/* STEP 0: BUSINESS CONDUCTED & PROFILE */}
                                {step === 0 && (
                                    <form onSubmit={saveBusiness} className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field
                                                label="Registered Business Name"
                                                error={business.errors.registered_name}
                                                className="sm:col-span-2"
                                            >
                                                <input
                                                    type="text"
                                                    required
                                                    disabled={!canEdit}
                                                    placeholder="e.g. Dar Auto Spares & Garage Ltd"
                                                    value={business.data.registered_name}
                                                    onChange={(e) =>
                                                        business.setData("registered_name", e.target.value)
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>

                                            <Field
                                                label="Trading / Brand Name (If different)"
                                                error={business.errors.trading_name}
                                            >
                                                <input
                                                    type="text"
                                                    disabled={!canEdit}
                                                    placeholder="e.g. Dar Spares Mwenge"
                                                    value={business.data.trading_name}
                                                    onChange={(e) =>
                                                        business.setData("trading_name", e.target.value)
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>

                                            <Field
                                                label="Business Category (What do you conduct?)"
                                                error={business.errors.partner_category_id}
                                            >
                                                <select
                                                    required
                                                    disabled={!canEdit}
                                                    value={business.data.partner_category_id}
                                                    onChange={(e) =>
                                                        business.setData("partner_category_id", e.target.value)
                                                    }
                                                    className={inputClass}
                                                >
                                                    <option value="">Select business category…</option>
                                                    {allCategories.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </Field>

                                            <Field
                                                label="TIN Number (TRA Tax Identification)"
                                                error={business.errors.tin_number}
                                            >
                                                <input
                                                    type="text"
                                                    required
                                                    disabled={!canEdit}
                                                    placeholder="e.g. 123-456-789"
                                                    value={business.data.tin_number}
                                                    onChange={(e) =>
                                                        business.setData("tin_number", e.target.value)
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>

                                            <Field
                                                label="Business Registration / BRELA Number"
                                                error={business.errors.registration_number}
                                            >
                                                <input
                                                    type="text"
                                                    required
                                                    disabled={!canEdit}
                                                    placeholder="e.g. 523190"
                                                    value={business.data.registration_number}
                                                    onChange={(e) =>
                                                        business.setData("registration_number", e.target.value)
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>

                                            <Field
                                                label="Year Established"
                                                error={business.errors.year_established}
                                            >
                                                <input
                                                    type="number"
                                                    min="1950"
                                                    max={new Date().getFullYear()}
                                                    disabled={!canEdit}
                                                    placeholder="e.g. 2018"
                                                    value={business.data.year_established}
                                                    onChange={(e) =>
                                                        business.setData("year_established", e.target.value)
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>

                                            <Field
                                                label="Website / Social Page (Optional)"
                                                error={business.errors.website}
                                            >
                                                <input
                                                    type="url"
                                                    disabled={!canEdit}
                                                    placeholder="https://..."
                                                    value={business.data.website}
                                                    onChange={(e) =>
                                                        business.setData("website", e.target.value)
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>

                                            <Field
                                                label="Business Description & Products / Services Conducted"
                                                error={business.errors.business_description}
                                                className="sm:col-span-2"
                                            >
                                                <textarea
                                                    rows="4"
                                                    required
                                                    disabled={!canEdit}
                                                    placeholder="Describe what your business conducts (e.g. Motorcycle engine repair, genuine spare parts supply for Boxer, TVS, Haojue, Bajaj, vehicle tire alignment, brake pads, oils, full mechanical maintenance...)"
                                                    value={business.data.business_description}
                                                    onChange={(e) =>
                                                        business.setData("business_description", e.target.value)
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={business.processing || !canEdit}
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#1864E8] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md shadow-[#1864E8]/20 hover:bg-[#00289a] transition-all disabled:opacity-50"
                                            >
                                                {business.processing ? "Saving…" : "Save & Continue to Documents"}
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* STEP 1: ATTACH DOCUMENTS (TIN, BUSINESS LICENSE) */}
                                {step === 1 && (
                                    <div className="space-y-6">
                                        {/* Document checklist cards */}
                                        <div className="space-y-3.5">
                                            {allRequirements.map((req) => {
                                                const rawDoc = currentDocument(req.document_type);
                                                const doc = validDocument(req.document_type);
                                                const documentStatus = rawDoc?.status;
                                                return (
                                                    <div
                                                        key={req.id || req.document_type}
                                                        className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                                                            doc
                                                                ? "border-emerald-200 bg-emerald-50/40"
                                                                : "border-slate-200 bg-slate-50/50"
                                                        }`}
                                                    >
                                                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                                            <div className="flex items-start gap-3.5">
                                                                <div
                                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                                                        doc
                                                                            ? "bg-emerald-600 text-white"
                                                                            : "bg-slate-200 text-slate-600"
                                                                    }`}
                                                                >
                                                                    {doc ? (
                                                                        <Check size={18} />
                                                                    ) : (
                                                                        <FileText size={18} />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="text-sm font-black text-slate-950">
                                                                            {req.label}
                                                                        </h4>
                                                                        {req.is_required && (
                                                                            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                                                                Required
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="mt-0.5 text-xs text-slate-600">
                                                                        {req.description}
                                                                    </p>
                                                                    {doc && (
                                                                        <p className="mt-1.5 text-xs font-semibold text-emerald-800">
                                                                            Attached: {doc.original_filename}
                                                                            {doc.uploaded_at
                                                                                ? ` · Uploaded ${new Date(
                                                                                      doc.uploaded_at
                                                                                  ).toLocaleDateString()}`
                                                                                : ""}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2.5">
                                                                <span
                                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                                                        documentStatus === "approved"
                                                                            ? "bg-emerald-100 text-emerald-800"
                                                                            : doc
                                                                            ? "bg-blue-50 text-[#1864E8]"
                                                                            : "bg-amber-100 text-amber-900"
                                                                    }`}
                                                                >
                                                                    {documentStatus === "approved" ? (
                                                                        <CheckCircle2 size={13} />
                                                                    ) : (
                                                                        <Clock size={13} />
                                                                    )}
                                                                    {rawDoc
                                                                        ? (docStatusLabel[documentStatus] ||
                                                                            "Uploaded")
                                                                        : "Pending Upload"
                                                                    }
                                                                </span>

                                                                {doc?.download_url && (
                                                                    <a
                                                                        href={doc.download_url}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-[#1864E8] hover:bg-slate-50"
                                                                    >
                                                                        <Download size={13} /> View
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Uploader Box */}
                                        {canEdit && (
                                            <form
                                                onSubmit={uploadDocument}
                                                className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 sm:p-6"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <UploadCloud size={18} className="text-[#1864E8]" />
                                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                                        Attach a Document
                                                    </h4>
                                                </div>

                                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                    <Field
                                                        label="Select Document Type to Attach"
                                                        error={documentForm.errors.document_type}
                                                    >
                                                        <select
                                                            required
                                                            value={documentForm.data.document_type}
                                                            onChange={(e) =>
                                                                documentForm.setData(
                                                                    "document_type",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className={inputClass}
                                                        >
                                                            <option value="">Choose document type…</option>
                                                            {allRequirements.map((req) => (
                                                                <option
                                                                    key={req.document_type}
                                                                    value={req.document_type}
                                                                >
                                                                    {req.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </Field>

                                                    <Field
                                                        label="Document File (PDF, PNG, JPG; Max 10MB)"
                                                        error={documentForm.errors.file}
                                                    >
                                                        <input
                                                            type="file"
                                                            required
                                                            accept="application/pdf,image/jpeg,image/png"
                                                            onChange={(e) =>
                                                                documentForm.setData(
                                                                    "file",
                                                                    e.target.files?.[0] || null
                                                                )
                                                            }
                                                            className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-1 file:text-xs file:font-bold file:text-[#00289a]`}
                                                        />
                                                    </Field>

                                                    {allRequirements.find(
                                                        (r) =>
                                                            r.document_type ===
                                                            documentForm.data.document_type
                                                    )?.requires_expiry_date && (
                                                        <Field
                                                            label="Document Expiry Date"
                                                            error={documentForm.errors.expires_at}
                                                        >
                                                            <input
                                                                type="date"
                                                                min={new Date()
                                                                    .toISOString()
                                                                    .slice(0, 10)}
                                                                value={documentForm.data.expires_at}
                                                                onChange={(e) =>
                                                                    documentForm.setData(
                                                                        "expires_at",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className={inputClass}
                                                            />
                                                        </Field>
                                                    )}
                                                </div>

                                                <div className="mt-4 flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={documentForm.processing}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-[#1864E8] px-5 py-2.5 text-xs font-black text-white hover:bg-[#00289a] transition-all disabled:opacity-50"
                                                    >
                                                        <UploadCloud size={15} />
                                                        {documentForm.processing
                                                            ? "Uploading…"
                                                            : "Upload & Attach Document"}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setStep(0)}
                                                className="text-xs font-bold text-slate-500 hover:text-slate-800"
                                            >
                                                ← Back to Business Profile
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white hover:bg-slate-800"
                                            >
                                                Continue to Location <ArrowRight size={15} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: LOCATION DETAILS */}
                                {step === 2 && (
                                    <form onSubmit={saveLocation} className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field label="Country" error={locationForm.errors.country}>
                                                <input
                                                    type="text"
                                                    required
                                                    disabled
                                                    value={locationForm.data.country}
                                                    className={`${inputClass} bg-slate-100 opacity-75`}
                                                />
                                            </Field>

                                            <Field
                                                label="Region (Mkoa)"
                                                error={locationForm.errors.region}
                                            >
                                                <select
                                                    required
                                                    disabled={!canEdit}
                                                    value={locationForm.data.region}
                                                    onChange={(e) =>
                                                        locationForm.setData("region", e.target.value)
                                                    }
                                                    className={inputClass}
                                                >
                                                    <option value="Dar es Salaam">Dar es Salaam</option>
                                                    <option value="Arusha">Arusha</option>
                                                    <option value="Mwanza">Mwanza</option>
                                                    <option value="Dodoma">Dodoma</option>
                                                    <option value="Mbeya">Mbeya</option>
                                                    <option value="Morogoro">Morogoro</option>
                                                    <option value="Tanga">Tanga</option>
                                                    <option value="Kilimanjaro">Kilimanjaro</option>
                                                    <option value="Zanzibar">Zanzibar</option>
                                                    <option value="Other">Other Region in Tanzania</option>
                                                </select>
                                            </Field>

                                            <Field
                                                label="District (Wilaya)"
                                                error={locationForm.errors.district}
                                            >
                                                <input
                                                    type="text"
                                                    required
                                                    disabled={!canEdit}
                                                    placeholder="e.g. Kinondoni, Ilala, Temeke, Ubungo"
                                                    value={locationForm.data.district}
                                                    onChange={(e) =>
                                                        locationForm.setData("district", e.target.value)
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>

                                            <Field
                                                label="Ward / Area (Kata)"
                                                error={locationForm.errors.ward}
                                            >
                                                <input
                                                    type="text"
                                                    disabled={!canEdit}
                                                    placeholder="e.g. Mwenge, Kijitonyama, Kariakoo"
                                                    value={locationForm.data.ward}
                                                    onChange={(e) =>
                                                        locationForm.setData("ward", e.target.value)
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>

                                            <Field
                                                label="Street / Physical Address"
                                                error={locationForm.errors.physical_address}
                                                className="sm:col-span-2"
                                            >
                                                <textarea
                                                    rows="2"
                                                    required
                                                    disabled={!canEdit}
                                                    placeholder="e.g. Sam Nujoma Road, Plot 45B, Mwenge Commercial Area"
                                                    value={locationForm.data.physical_address}
                                                    onChange={(e) =>
                                                        locationForm.setData(
                                                            "physical_address",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>

                                            <Field
                                                label="Prominent Nearby Landmark (Crucial for Riders & Drivers)"
                                                className="sm:col-span-2"
                                            >
                                                <div className="relative">
                                                    <MapPin className={iconClass} size={16} />
                                                    <input
                                                        type="text"
                                                        disabled={!canEdit}
                                                        placeholder="e.g. Opposite Mlimani City Mall, Near Mwenge Roundabout"
                                                        value={
                                                            locationForm.data.operating_hours?.notes || ""
                                                        }
                                                        onChange={(e) =>
                                                            locationForm.setData("operating_hours", {
                                                                notes: e.target.value,
                                                            })
                                                        }
                                                        className={`${inputClass} pl-10`}
                                                    />
                                                </div>
                                            </Field>

                                            <Field
                                                label="Business Phone / Hotline for Riders"
                                                error={locationForm.errors.business_phone}
                                            >
                                                <input
                                                    type="tel"
                                                    disabled={!canEdit}
                                                    placeholder="+255 7XX XXX XXX"
                                                    value={locationForm.data.business_phone}
                                                    onChange={(e) =>
                                                        locationForm.setData(
                                                            "business_phone",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>

                                            <Field label="Opening Hours" error={locationForm.errors.operating_hours}>
                                                <input
                                                    type="text"
                                                    disabled={!canEdit}
                                                    placeholder="e.g. Mon–Sat: 8:00 AM – 6:30 PM"
                                                    value={locationForm.data.operating_hours?.hours || ""}
                                                    onChange={(e) =>
                                                        locationForm.setData("operating_hours", {
                                                            ...locationForm.data.operating_hours,
                                                            hours: e.target.value,
                                                        })
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="text-xs font-bold text-slate-500 hover:text-slate-800"
                                            >
                                                ← Back to Documents
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={locationForm.processing || !canEdit}
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#1864E8] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md shadow-[#1864E8]/20 hover:bg-[#00289a] transition-all disabled:opacity-50"
                                            >
                                                {locationForm.processing
                                                    ? "Saving…"
                                                    : "Save & Continue to Discounts"}
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* STEP 3: MEMBER DISCOUNT PROPOSAL (CORE RAVU VALUE) */}
                                {step === 3 && (
                                    <form onSubmit={saveBenefit} className="space-y-6">
                                        {/* Value proposition callout */}
                                        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/50 p-5">
                                            <div className="flex items-start gap-3.5">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#00289a] text-white shadow-xs">
                                                    <Tag size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-[#00289a]">
                                                        Set Your Exclusive Member Discount
                                                    </h3>
                                                    <p className="mt-1 text-xs leading-relaxed text-slate-700">
                                                        RAVU members look specifically for partners with discounts in the app. A competitive discount (e.g. 10%–20%) drives repeat visits, bulk parts purchases, and fleet contracts to your door.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Preset Buttons */}
                                        <div>
                                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                                                Select Recommended Discount Percentage:
                                            </label>
                                            <div className="mt-2.5 flex flex-wrap gap-2.5">
                                                {DISCOUNT_PRESETS.map((pct) => {
                                                    const selected =
                                                        benefitForm.data.benefit_type ===
                                                            "percentage_discount" &&
                                                        String(benefitForm.data.discount_percentage) ===
                                                            String(pct);
                                                    return (
                                                        <button
                                                            key={pct}
                                                            type="button"
                                                            disabled={!canEdit}
                                                            onClick={() => handleSelectPreset(pct)}
                                                            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
                                                                selected
                                                                    ? "bg-[#1864E8] text-white shadow-md shadow-[#1864E8]/25 scale-105"
                                                                    : "border border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50/50"
                                                            }`}
                                                        >
                                                            <Tag size={13} />
                                                            {pct}% OFF
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field
                                                label="Discount Type"
                                                error={benefitForm.errors.benefit_type}
                                            >
                                                <select
                                                    disabled={!canEdit}
                                                    value={benefitForm.data.benefit_type}
                                                    onChange={(e) =>
                                                        benefitForm.setData(
                                                            "benefit_type",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={inputClass}
                                                >
                                                    <option value="">Choose a benefit type…</option>
                                                    {BENEFIT_TYPES.map(([val, lbl]) => (
                                                        <option key={val} value={val}>
                                                            {lbl}
                                                        </option>
                                                    ))}
                                                </select>
                                            </Field>

                                            {benefitForm.data.benefit_type ===
                                                "percentage_discount" && (
                                                <Field
                                                    label="Discount Percentage (%)"
                                                    error={benefitForm.errors.discount_percentage}
                                                >
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="100"
                                                            step="0.5"
                                                            required
                                                            disabled={!canEdit}
                                                            value={benefitForm.data.discount_percentage}
                                                            onChange={(e) =>
                                                                benefitForm.setData(
                                                                    "discount_percentage",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className={`${inputClass} pr-10`}
                                                        />
                                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                                                            %
                                                        </span>
                                                    </div>
                                                </Field>
                                            )}

                                            {benefitForm.data.benefit_type === "fixed_discount" && (
                                                <Field
                                                    label="Fixed Discount Amount (TZS)"
                                                    error={benefitForm.errors.discount_amount}
                                                >
                                                    <input
                                                        type="number"
                                                        min="500"
                                                        step="500"
                                                        required
                                                        disabled={!canEdit}
                                                        placeholder="e.g. 10000"
                                                        value={benefitForm.data.discount_amount}
                                                        onChange={(e) =>
                                                            benefitForm.setData(
                                                                "discount_amount",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={inputClass}
                                                    />
                                                </Field>
                                            )}

                                            <Field
                                                label="Eligible Products or Services"
                                                error={benefitForm.errors.products_or_services}
                                                className="sm:col-span-2"
                                            >
                                                <input
                                                    type="text"
                                                    required
                                                    disabled={!canEdit}
                                                    placeholder="e.g. All motorcycle spare parts, engine oils, tires, brake pads & labor fees"
                                                    value={benefitForm.data.products_or_services}
                                                    onChange={(e) =>
                                                        benefitForm.setData(
                                                            "products_or_services",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>

                                            <Field
                                                label="Staff Member Verification Instructions"
                                                error={benefitForm.errors.redemption_instructions}
                                                className="sm:col-span-2"
                                            >
                                                <textarea
                                                    rows="2"
                                                    disabled={!canEdit}
                                                    placeholder="How your staff will verify members (e.g. Rider presents digital RAVU ID in app; cashier verifies active status before applying discount)"
                                                    value={benefitForm.data.redemption_instructions}
                                                    onChange={(e) =>
                                                        benefitForm.setData(
                                                            "redemption_instructions",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>
                                        </div>

                                        {/* Live Member Savings Calculator Preview */}
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                                                    <Calculator size={16} className="text-[#1864E8]" />
                                                    Live Member Savings Example
                                                </div>
                                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                                                    Instant App Preview
                                                </span>
                                            </div>

                                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                                <div className="rounded-xl bg-white p-3 border border-slate-200">
                                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                                        Original Price
                                                    </span>
                                                    <p className="mt-1 text-base font-black text-slate-800">
                                                        100,000 TZS
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-white p-3 border border-emerald-200">
                                                    <span className="text-[10px] font-bold uppercase text-emerald-600">
                                                        Member Saves ({calcDiscount}%)
                                                    </span>
                                                    <p className="mt-1 text-base font-black text-emerald-600">
                                                        -{exampleSavings.toLocaleString()} TZS
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-blue-50 p-3 border border-blue-200">
                                                    <span className="text-[10px] font-bold uppercase text-[#00289a]">
                                                        Member Pays You
                                                    </span>
                                                    <p className="mt-1 text-base font-black text-[#00289a]">
                                                        {exampleFinal.toLocaleString()} TZS
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="mt-2.5 text-[11px] text-slate-500">
                                                By offering {calcDiscount}% savings, you secure guaranteed, repeat rider business over non-partner competitors.
                                            </p>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="text-xs font-bold text-slate-500 hover:text-slate-800"
                                            >
                                                ← Back to Location
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={benefitForm.processing || !canEdit}
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#1864E8] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md shadow-[#1864E8]/20 hover:bg-[#00289a] transition-all disabled:opacity-50"
                                            >
                                                {benefitForm.processing
                                                    ? "Saving…"
                                                    : "Save & Continue to Review"}
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* STEP 4: REVIEW & SUBMIT */}
                                {step === 4 && (
                                    <div className="space-y-6">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                                            <SummaryRow
                                                title="1. Business Conducted"
                                                complete={isBusinessComplete}
                                                onEdit={() => setStep(0)}
                                            >
                                                <p className="font-bold text-slate-900">
                                                    {business.data.registered_name || "Not provided"}
                                                </p>
                                                <p className="text-xs text-slate-600">
                                                    Category:{" "}
                                                    {allCategories.find(
                                                        (c) =>
                                                            String(c.id) ===
                                                            String(business.data.partner_category_id)
                                                    )?.name || "Not selected"}{" "}
                                                    · TIN: {business.data.tin_number || "Not provided"} ·
                                                    BRELA:{" "}
                                                    {business.data.registration_number || "Not provided"}
                                                </p>
                                                <p className="text-xs text-slate-500 line-clamp-2">
                                                    {business.data.business_description}
                                                </p>
                                            </SummaryRow>

                                            <SummaryRow
                                                title="2. Verification Documents"
                                                complete={isDocsComplete}
                                                onEdit={() => setStep(1)}
                                            >
                                                <div className="space-y-1">
                                                    {allRequirements.map((req) => {
                                                        const doc = validDocument(req.document_type);
                                                        return (
                                                            <div
                                                                key={req.document_type}
                                                                className="flex items-center justify-between text-xs"
                                                            >
                                                                <span className="font-medium text-slate-700">
                                                                    {req.label}:
                                                                </span>
                                                                <span
                                                                    className={`font-bold ${
                                                                        doc
                                                                            ? "text-emerald-700"
                                                                            : req.is_required
                                                                            ? "text-rose-600"
                                                                            : "text-slate-400"
                                                                    }`}
                                                                >
                                                                    {doc
                                                                        ? `Attached (${doc.original_filename})`
                                                                        : req.is_required
                                                                        ? "Required / Missing"
                                                                        : "Optional / Not attached"}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </SummaryRow>

                                            <SummaryRow
                                                title="3. Location & Landmarks"
                                                complete={isLocationComplete}
                                                onEdit={() => setStep(2)}
                                            >
                                                <p className="font-bold text-slate-900">
                                                    {locationForm.data.physical_address || "Address not provided"}
                                                </p>
                                                <p className="text-xs text-slate-600">
                                                    {locationForm.data.district},{" "}
                                                    {locationForm.data.region}
                                                    {locationForm.data.operating_hours?.notes
                                                        ? ` · ${locationForm.data.operating_hours.notes}`
                                                        : ""}
                                                </p>
                                            </SummaryRow>

                                            <SummaryRow
                                                title="4. Member Discount Proposal"
                                                complete={isBenefitComplete}
                                                onEdit={() => setStep(3)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                                                        {benefitForm.data.benefit_type === "fixed_discount"
                                                            ? `${benefitForm.data.discount_amount} TZS OFF`
                                                            : benefitForm.data.discount_percentage
                                                            ? `${benefitForm.data.discount_percentage}% OFF`
                                                            : benefitForm.data.benefit_type
                                                                .replaceAll("_", " ")}
                                                    </span>
                                                    <span className="font-bold text-slate-900 text-xs">
                                                        {benefitForm.data.name}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1">
                                                    Eligible: {benefitForm.data.products_or_services}
                                                </p>
                                            </SummaryRow>
                                        </div>

                                        {/* Submit Action — only when every step is complete */}
                                        {canEdit && currentStatus === "draft" && completionCount === 4 && (
                                            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 text-center">
                                                <h3 className="text-base font-black text-slate-950">
                                                    Ready to submit your application?
                                                </h3>
                                                <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-slate-600">
                                                    Once submitted, RAVU's Partner Operations Team will verify your TIN, business license, and member discount proposal within 24 to 48 hours.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={submitApplication}
                                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1864E8] px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-[#1864E8]/25 hover:bg-[#00289a] transition-all"
                                                >
                                                    <CheckCircle2 size={18} />
                                                    Submit Application to RAVU
                                                </button>
                                            </div>
                                        )}

                                        {canEdit && currentStatus === "draft" && completionCount < 4 && (
                                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                                                <h3 className="flex items-center gap-2 text-sm font-black text-amber-900">
                                                    <AlertCircle size={16} />
                                                    Finish these steps before submitting:
                                                </h3>
                                                <ul className="mt-2.5 grid gap-1.5 pl-1 text-xs font-semibold text-amber-900 sm:grid-cols-2">
                                                    {STEPS.slice(0, 4)
                                                        .map((s, idx) => ({ ...s, idx }))
                                                        .filter((s) => !completedSteps[s.idx])
                                                        .map((s) => (
                                                            <li key={s.id} className="flex items-center gap-1.5">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                                {s.label}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setStep(s.idx)}
                                                                    className="ml-1 underline"
                                                                >
                                                                    Go
                                                                </button>
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                        )}

                                        {currentStatus !== "draft" && (
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                                    Application Status Timeline
                                                </h4>
                                                <div className="mt-3 space-y-2 text-xs text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                        <span>
                                                            Application submitted on{" "}
                                                            {application.submitted_at
                                                                ? new Date(
                                                                      application.submitted_at
                                                                  ).toLocaleString()
                                                                : "Today"}
                                                        </span>
                                                    </div>
                                                    <p className="pl-4 text-slate-500">
                                                        Status:{" "}
                                                        <strong>
                                                            {applicationLabels[currentStatus] || currentStatus}
                                                        </strong>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: MEMBER VERIFIER (CASHIER TOOL) */}
                {view === "verifier" && (
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#00289a] text-white">
                                    <QrCode size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-950">
                                        Member ID & QR Code Verifier
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                                        Use this cashier tool to check whether a visiting rider, driver, or fleet customer is an active RAVU member entitled to your {benefitForm.data.discount_percentage || "agreed"}% discount.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleVerifyMember} className="mt-6 flex gap-3">
                                <div className="relative flex-1">
                                    <Search className={iconClass} size={18} />
                                    <input
                                        type="text"
                                        placeholder="Enter RAVU Member ID (e.g. RAVU-TZ-2024-8841 or phone number)"
                                        value={verifierQuery}
                                        onChange={(e) => setVerifierQuery(e.target.value)}
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#1864E8] px-5 py-2.5 text-xs font-black text-white hover:bg-[#00289a] transition-all"
                                >
                                    Verify Member
                                </button>
                            </form>

                            {/* Verification Result Card */}
                            {verifiedMember && (
                                <div
                                    className={`mt-6 rounded-2xl border p-5 transition-all ${
                                        verifiedMember.discountEligible
                                            ? "border-emerald-200 bg-emerald-50/50"
                                            : "border-rose-200 bg-rose-50/50"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {verifiedMember.discountEligible ? (
                                                <CheckCircle2 size={20} className="text-emerald-600" />
                                            ) : (
                                                <AlertCircle size={20} className="text-rose-600" />
                                            )}
                                            <span className="font-black text-sm text-slate-950">
                                                {verifiedMember.discountEligible
                                                    ? "Active RAVU Member Verified"
                                                    : "Member Record Not Found"}
                                            </span>
                                        </div>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-black ${
                                                verifiedMember.discountEligible
                                                    ? "bg-emerald-600 text-white"
                                                    : "bg-rose-600 text-white"
                                            }`}
                                        >
                                            {verifiedMember.status}
                                        </span>
                                    </div>

                                    {verifiedMember.discountEligible && (
                                        <div className="mt-4 grid gap-3 border-t border-emerald-200/60 pt-4 sm:grid-cols-3 text-xs">
                                            <div>
                                                <span className="text-slate-500 uppercase text-[10px] font-bold">
                                                    Member Name
                                                </span>
                                                <p className="font-bold text-slate-900 mt-0.5">
                                                    {verifiedMember.name}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 uppercase text-[10px] font-bold">
                                                    ID / Category
                                                </span>
                                                <p className="font-bold text-slate-900 mt-0.5">
                                                    {verifiedMember.memberId}
                                                </p>
                                                <p className="text-[11px] text-slate-600">
                                                    {verifiedMember.type}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 uppercase text-[10px] font-bold">
                                                    Apply Partner Discount
                                                </span>
                                                <p className="font-black text-[#00289a] mt-0.5 text-sm">
                                                    {verifiedMember.discountRate}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-6 border-t border-slate-100 pt-5 text-xs text-slate-500">
                                <p className="font-bold text-slate-700">How verification works at your counter:</p>
                                <ol className="mt-2 list-decimal space-y-1 pl-4">
                                    <li>Customer tells cashier they are a RAVU member.</li>
                                    <li>Cashier asks to see the digital RAVU ID card in their RAVU mobile app.</li>
                                    <li>Cashier types or scans the Member ID above to confirm active status.</li>
                                    <li>Apply the agreed {benefitForm.data.discount_percentage || "member"}% discount to their final receipt.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: RIDER APP PREVIEW */}
                {view === "preview" && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                            <div className="flex items-center gap-2">
                                <Sparkles size={18} className="text-[#1864E8]" />
                                <h2 className="text-lg font-black text-slate-950">
                                    How your business appears in the RAVU Rider & Driver Mobile App
                                </h2>
                            </div>
                            <p className="mt-1 text-xs text-slate-600">
                                Preview the details members will see after your partner application is approved.
                            </p>

                            {/* Mobile App Card Mockup */}
                            <div className="mt-6 mx-auto max-w-sm rounded-3xl border-4 border-slate-900 bg-slate-900 p-2 shadow-2xl">
                                <div className="rounded-2xl bg-white p-4 text-slate-900">
                                    {/* App Header */}
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="text-[11px] font-black text-slate-800">
                                                RAVU Mobility App
                                            </span>
                                        </div>
                                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1864E8]">
                                            {locationForm.data.region || "Location pending"}
                                        </span>
                                    </div>

                                    {/* Partner Card */}
                                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                                        <div className="relative h-28 bg-gradient-to-br from-[#00289a] to-blue-700 p-3 text-white flex flex-col justify-between">
                                            <div className="flex items-center justify-between">
                                                <span className="rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                                    {allCategories.find(
                                                        (c) =>
                                                            String(c.id) ===
                                                            String(business.data.partner_category_id)
                                                    )?.name || "Spare Parts & Workshop"}
                                                </span>
                                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900">
                                                    {currentStatus === "approved" ? "Verified Partner" : "Application preview"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="inline-block rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-black text-slate-950 shadow-sm">
                                                    {benefitForm.data.discount_percentage ? `${benefitForm.data.discount_percentage}% OFF FOR RAVU MEMBERS` : "Member offer preview"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3.5 space-y-2">
                                            <h4 className="font-black text-sm text-slate-950">
                                                {business.data.registered_name || "Your business name"}
                                            </h4>
                                            <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                                <MapPin size={13} className="text-[#1864E8] shrink-0" />
                                                <span className="truncate">
                                                    {locationForm.data.physical_address || "Business address not added"}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 line-clamp-2">
                                                {business.data.business_description || "Your business description will appear here."}
                                            </p>

                                            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                                                <span className="text-[10px] font-bold text-slate-500">
                                                    {locationForm.data.operating_hours?.hours || "Opening hours not added"}
                                                </span>
                                                <span className="rounded-lg bg-[#1864E8] px-3 py-1 text-[11px] font-black text-white">
                                                    Get Directions
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: ACCOUNT & CONTACTS */}
                {view === "account" && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                            <h2 className="text-xl font-black text-slate-950">
                                Partner Account Contact Details
                            </h2>
                            <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                                Primary representative contact details for official notifications and verification updates.
                            </p>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    accountForm.patch("/partner/account", {
                                        preserveScroll: true,
                                        onSuccess: () => toast.success("Contact details updated."),
                                    });
                                }}
                                className="mt-6 space-y-4"
                            >
                                <Field label="Full Name" error={accountForm.errors.name}>
                                    <input
                                        type="text"
                                        required
                                        value={accountForm.data.name}
                                        onChange={(e) => accountForm.setData("name", e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label="Position / Role" error={accountForm.errors.position}>
                                    <input
                                        type="text"
                                        required
                                        value={accountForm.data.position}
                                        onChange={(e) => accountForm.setData("position", e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label="Business Email">
                                    <input
                                        type="email"
                                        disabled
                                        value={contact.email || "email@company.com"}
                                        className={`${inputClass} bg-slate-100 opacity-60`}
                                    />
                                </Field>

                                <Field label="Phone / WhatsApp" error={accountForm.errors.phone}>
                                    <input
                                        type="tel"
                                        required
                                        value={accountForm.data.phone}
                                        onChange={(e) => accountForm.setData("phone", e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={accountForm.processing}
                                        className="rounded-xl bg-[#1864E8] px-6 py-2.5 text-xs font-black text-white hover:bg-[#00289a]"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Subcomponents
const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-colors focus:border-[#1864E8] focus:bg-white focus:ring-2 focus:ring-[#1864E8]/15 disabled:opacity-60";
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

function StatusPill({ status, label }) {
    const isApproved = status === "approved" || status === "verified";
    const isAction = status === "action_required" || status === "rejected";

    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black ${
                isApproved
                    ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-200"
                    : isAction
                    ? "border-amber-400/30 bg-amber-400/15 text-amber-200"
                    : "border-sky-400/30 bg-sky-400/15 text-sky-200"
            }`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {label}
        </span>
    );
}

function TabButton({ active, onClick, icon: Icon, label, badge }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative inline-flex shrink-0 items-center gap-2 px-4 pb-4 pt-2 text-xs font-black transition-colors ${
                active
                    ? "text-white after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-sky-400"
                    : "text-slate-400 hover:text-white"
            }`}
        >
            <Icon size={14} />
            <span>{label}</span>
            {badge && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/10 text-sky-300" : "bg-white/5 text-slate-400"}`}>
                    {badge}
                </span>
            )}
        </button>
    );
}

function SummaryRow({ title, complete, onEdit, children }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {title}
                </h4>
                <div className="flex items-center gap-3">
                    {complete ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 size={14} /> Complete
                        </span>
                    ) : (
                        <span className="text-xs font-bold text-amber-700">Incomplete</span>
                    )}
                    <button
                        type="button"
                        onClick={onEdit}
                        className="text-xs font-bold text-[#1864E8] underline hover:text-[#00289a]"
                    >
                        Edit
                    </button>
                </div>
            </div>
            <div className="mt-2.5 space-y-1">{children}</div>
        </div>
    );
}
