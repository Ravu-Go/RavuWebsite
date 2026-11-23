import { Link } from "@inertiajs/react";
import {
    Activity,
    ArrowUpRight,
    BadgeCheck,
    Building2,
    CheckCircle2,
    Clock,
    Download,
    ExternalLink,
    Filter,
    LayoutDashboard,
    LogOut,
    MapPin,
    Menu,
    Percent,
    Phone,
    Plus,
    QrCode,
    Save,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
    Tag,
    Trash2,
    TrendingUp,
    Users,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import logoImg from "../../../imgs/Logo.png";

const INITIAL_OFFERS = [
    {
        id: "off-1",
        title: "20% Off Comprehensive Motorcycle, Bajaj & Private Car Insurance",
        category: "Insurance & Protection",
        discount: "20% OFF",
        redemptions: 412,
        conversion: "92%",
        branches: "All 4 Stations",
        status: "Active",
    },
    {
        id: "off-2",
        title: "15%–25% Off Genuine Spare Parts, Tires, Batteries & Lubricants",
        category: "Spare Parts & Garages",
        discount: "20% OFF",
        redemptions: 189,
        conversion: "84%",
        branches: "Kariakoo & Kinondoni",
        status: "Active",
    },
    {
        id: "off-3",
        title: "10%–20% Off Routine Garage Servicing, Brakes, Suspension & Diagnostics",
        category: "Workshop Service",
        discount: "15% OFF",
        redemptions: 94,
        conversion: "78%",
        branches: "Mbezi Service Bay",
        status: "Active",
    },
    {
        id: "off-4",
        title: "TZS 150/L Fuel Cashback & Fleet Bulk Maintenance Package",
        category: "Fuel & Lubricants",
        discount: "8% OFF",
        redemptions: 67,
        conversion: "88%",
        branches: "All 4 Stations",
        status: "Active",
    },
];

const INITIAL_REDEMPTIONS = [
    {
        id: "TX-9041",
        memberId: "RAVU-TZ-88241",
        riderName: "Juma Mwakasege",
        vehicle: "Boxer BM 150 • MC 482 DKL",
        offer: "TZS 150/L Fuel Cashback",
        branch: "Kariakoo Main Station",
        time: "8 mins ago",
        saved: "TZS 2,400",
    },
    {
        id: "TX-9040",
        memberId: "RAVU-TZ-77109",
        riderName: "Kelvin Massawe",
        vehicle: "TVS HLX 150 • MC 910 TZA",
        offer: "20% Off Synthetic Engine Oil",
        branch: "Kinondoni Hub",
        time: "34 mins ago",
        saved: "TZS 6,500",
    },
    {
        id: "TX-9039",
        memberId: "RAVU-TZ-64012",
        riderName: "Baraka Nyerere",
        vehicle: "Haojue KA 150 • MC 214 Dar",
        offer: "TZS 150/L Fuel Cashback",
        branch: "Kariakoo Main Station",
        time: "1 hour ago",
        saved: "TZS 1,800",
    },
    {
        id: "TX-9038",
        memberId: "RAVU-TZ-51904",
        riderName: "Salum Abdallah",
        vehicle: "Boxer BM 125 • MC 773 EFG",
        offer: "Free Safety & Brake Inspection",
        branch: "Mbezi Service Bay",
        time: "3 hours ago",
        saved: "TZS 10,000",
    },
    {
        id: "TX-9037",
        memberId: "RAVU-TZ-39218",
        riderName: "Hassan Mwinyi",
        vehicle: "TVS HLX 125 • MC 601 KLM",
        offer: "15% Off Chain & Sprocket Kit",
        branch: "Posta Express Station",
        time: "5 hours ago",
        saved: "TZS 8,200",
    },
];

const INITIAL_BRANCHES = [
    {
        id: "br-1",
        name: "Kariakoo Main Station",
        city: "Ilala, Dar es Salaam",
        address: "Uhuru Street / Msimbazi Junction",
        manager: "Chidambaram M.",
        phone: "+255 754 200 100",
        redemptions: 342,
        share: 45,
        status: "Online",
    },
    {
        id: "br-2",
        name: "Kinondoni Service Hub",
        city: "Kinondoni, Dar es Salaam",
        address: "Kawawa Road, Near Morocco",
        manager: "Neema Tarimo",
        phone: "+255 754 200 104",
        redemptions: 218,
        share: 29,
        status: "Online",
    },
    {
        id: "br-3",
        name: "Mbezi Luis Service Bay",
        city: "Ubungo, Dar es Salaam",
        address: "Morogoro Road, Magufuli Terminal",
        manager: "Dickson Lyimo",
        phone: "+255 754 200 109",
        redemptions: 124,
        share: 16,
        status: "Online",
    },
    {
        id: "br-4",
        name: "Posta Express Station",
        city: "CBD, Dar es Salaam",
        address: "Samora Avenue",
        manager: "Farida Kassim",
        phone: "+255 754 200 112",
        redemptions: 78,
        share: 10,
        status: "Online",
    },
];

const SAMPLE_MEMBERS = {
    "RAVU-TZ-88241": {
        code: "RAVU-TZ-88241",
        name: "Juma Mwakasege",
        tier: "Gold Rider Member",
        vehicle: "Boxer BM 150 • MC 482 DKL",
        joined: "Jan 2026",
        totalTrips: "1,420 Rides",
        status: "Eligible for Partner Benefits",
    },
    "RAVU-TZ-77109": {
        code: "RAVU-TZ-77109",
        name: "Kelvin Massawe",
        tier: "Platinum Rider Member",
        vehicle: "TVS HLX 150 • MC 910 TZA",
        joined: "Nov 2025",
        totalTrips: "2,190 Rides",
        status: "Eligible for Partner Benefits",
    },
    "RAVU-TZ-64012": {
        code: "RAVU-TZ-64012",
        name: "Baraka Nyerere",
        tier: "Verified Rider Member",
        vehicle: "Haojue KA 150 • MC 214 DAR",
        joined: "Mar 2026",
        totalTrips: "840 Rides",
        status: "Eligible for Partner Benefits",
    },
};

export default function PartnerDashboard({ auth, flash }) {
    const partner = auth?.user || {
        name: "Chid (TotalEnergies Partner)",
        email: "chid@total.com",
        role: "partner",
        category: "Fuel & Energy Station",
        phone: "+255 754 200 100",
    };

    const [activeTab, setActiveTab] = useState("overview"); // overview | verify | offers | branches | settings
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [offers, setOffers] = useState(INITIAL_OFFERS);
    const [redemptions, setRedemptions] = useState(INITIAL_REDEMPTIONS);
    const [branches, setBranches] = useState(INITIAL_BRANCHES);
    const [searchQuery, setSearchQuery] = useState("");
    const [branchFilter, setBranchFilter] = useState("All Branches");

    // Member ID verification state
    const [memberCode, setMemberCode] = useState("RAVU-TZ-88241");
    const [selectedOfferId, setSelectedOfferId] = useState(INITIAL_OFFERS[0].id);
    const [selectedBranchName, setSelectedBranchName] = useState(
        INITIAL_BRANCHES[0].name,
    );
    const [verifiedMember, setVerifiedMember] = useState(
        SAMPLE_MEMBERS["RAVU-TZ-88241"],
    );

    // New offer state
    const [newOfferTitle, setNewOfferTitle] = useState("");
    const [newOfferDiscount, setNewOfferDiscount] = useState("");
    const [newOfferCategory, setNewOfferCategory] =
        useState("Fuel & Lubricants");
    const [newOfferBranches, setNewOfferBranches] =
        useState("All 4 Stations");

    // New branch state
    const [newBranchName, setNewBranchName] = useState("");
    const [newBranchCity, setNewBranchCity] = useState("");
    const [newBranchAddress, setNewBranchAddress] = useState("");
    const [newBranchManager, setNewBranchManager] = useState("");

    // Editable profile state
    const [profileForm, setProfileForm] = useState({
        name: partner.name || "Chid (TotalEnergies Partner)",
        email: partner.email || "chid@total.com",
        phone: partner.phone || "+255 754 200 100",
        category: partner.category || "Fuel & Energy Station",
        tinNumber: "TIN-104-892-310",
        headquarters: "Uhuru Street, Kariakoo, Dar es Salaam",
        autoApproveRedemptions: true,
        smsReceipts: true,
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    const filteredRedemptions = useMemo(() => {
        return redemptions.filter((tx) => {
            const matchesBranch =
                branchFilter === "All Branches" || tx.branch === branchFilter;
            const matchesSearch =
                !searchQuery ||
                tx.riderName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                tx.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.offer.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesBranch && matchesSearch;
        });
    }, [redemptions, branchFilter, searchQuery]);

    const handleVerifyMember = (e) => {
        if (e) e.preventDefault();
        if (!memberCode.trim()) return;

        const cleanCode = memberCode.trim().toUpperCase();
        const found = SAMPLE_MEMBERS[cleanCode] || {
            code: cleanCode,
            name: "Verified RAVU Rider",
            tier: "Active Gold Rider",
            vehicle: "Boxer BM 150 • MC 482 DKL",
            joined: "Feb 2026",
            totalTrips: "960 Rides",
            status: "Eligible for Partner Benefits",
        };
        setVerifiedMember(found);
        toast.success(`Verified Member ID: ${cleanCode}`);
    };

    const handleRecordRedemption = () => {
        if (!verifiedMember) return;
        const chosenOffer =
            offers.find((o) => o.id === selectedOfferId) || offers[0];

        const newTx = {
            id: `TX-${Math.floor(9042 + Math.random() * 900)}`,
            memberId: verifiedMember.code,
            riderName: verifiedMember.name,
            vehicle: verifiedMember.vehicle,
            offer: chosenOffer.title,
            branch: selectedBranchName,
            time: "Just now",
            saved: chosenOffer.discount,
        };

        setRedemptions([newTx, ...redemptions]);
        setOffers(
            offers.map((o) =>
                o.id === chosenOffer.id
                    ? { ...o, redemptions: o.redemptions + 1 }
                    : o,
            ),
        );
        toast.success(
            `Redemption recorded for ${verifiedMember.name} (${verifiedMember.code})!`,
        );
    };

    const handleAddOffer = (e) => {
        e.preventDefault();
        if (!newOfferTitle.trim() || !newOfferDiscount.trim()) {
            toast.error("Please enter both offer title and discount badge.");
            return;
        }
        const created = {
            id: `off-${Date.now()}`,
            title: newOfferTitle.trim(),
            discount: newOfferDiscount.trim().toUpperCase(),
            category: newOfferCategory,
            branches: newOfferBranches,
            conversion: "85%",
            redemptions: 0,
            status: "Active",
        };
        setOffers([created, ...offers]);
        setNewOfferTitle("");
        setNewOfferDiscount("");
        toast.success("New partner benefit published to RAVU members!");
    };

    const toggleOfferStatus = (id) => {
        setOffers(
            offers.map((o) =>
                o.id === id
                    ? {
                          ...o,
                          status: o.status === "Active" ? "Paused" : "Active",
                      }
                    : o,
            ),
        );
        toast.success("Updated offer status.");
    };

    const deleteOffer = (id) => {
        setOffers(offers.filter((o) => o.id !== id));
        toast.success("Removed partner offer.");
    };

    const handleAddBranch = (e) => {
        e.preventDefault();
        if (!newBranchName.trim() || !newBranchCity.trim()) {
            toast.error("Please enter branch name and city.");
            return;
        }
        const created = {
            id: `br-${Date.now()}`,
            name: newBranchName.trim(),
            city: newBranchCity.trim(),
            address: newBranchAddress.trim() || "Main Commercial Road",
            manager: newBranchManager.trim() || profileForm.name,
            phone: profileForm.phone,
            redemptions: 0,
            share: 5,
            status: "Online",
        };
        setBranches([created, ...branches]);
        setNewBranchName("");
        setNewBranchCity("");
        setNewBranchAddress("");
        setNewBranchManager("");
        toast.success("Added new partner branch location!");
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        toast.success("Partner organization profile updated!");
    };

    const NAV_ITEMS = [
        { id: "overview", label: "Partner Overview", icon: LayoutDashboard },
        {
            id: "verify",
            label: "Verify Member ID",
            icon: QrCode,
            badge: "Live",
        },
        {
            id: "offers",
            label: "Member Benefits & Offers",
            icon: Tag,
            badge: offers.length,
        },
        {
            id: "branches",
            label: "Branches & Stations",
            icon: MapPin,
            badge: branches.length,
        },
        { id: "settings", label: "Partner Profile", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen w-full bg-[#F8FAFC] text-slate-800 font-sans">
            {/* =========================================================
                SIDEBAR NAVIGATION
               ========================================================= */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col bg-[#050B17] text-slate-300 transition-transform duration-200 lg:static lg:translate-x-0 ${
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-18 items-center justify-between border-b border-white/10 px-6">
                    <Link href="/" className="flex items-center gap-3">
                        <img
                            src={logoImg}
                            alt="RAVU"
                            className="h-9 w-9 rounded-full object-cover ring-2 ring-white/15"
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-black tracking-tight text-white">
                                    Ravu
                                </span>
                                <span className="rounded-md bg-emerald-500/20 border border-emerald-400/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                                    Partner
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                Business Partner Portal
                            </p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Partner Org Card */}
                <div className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00289a] text-white font-black text-sm">
                            {profileForm.name?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-white">
                                {profileForm.name}
                            </p>
                            <p className="truncate text-[11px] text-emerald-400 flex items-center gap-1">
                                <BadgeCheck size={12} />
                                <span>Verified Tier-1 Partner</span>
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="mt-5 flex-1 space-y-1 px-3 overflow-y-auto">
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Partner Operations
                    </p>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setMobileMenuOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                                    active
                                        ? "bg-[#00289a] text-white shadow-sm"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <Icon size={17} />
                                    <span>{item.label}</span>
                                </span>
                                {item.badge !== undefined && (
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                            active
                                                ? "bg-white/20 text-white"
                                                : "bg-white/10 text-slate-300"
                                        }`}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="border-t border-white/10 p-4 space-y-2.5">
                    <Link
                        href="/"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                        <ExternalLink size={14} />
                        <span>Back to RAVU Website</span>
                    </Link>

                    <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-400">
                        <span className="truncate max-w-[175px]">
                            {profileForm.email}
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                            title="Sign out"
                        >
                            <LogOut size={13} />
                            <span>Sign out</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* =========================================================
                MAIN FLUID WORKSPACE (FULL AVAILABLE WIDTH)
               ========================================================= */}
            <div className="flex flex-1 flex-col min-w-0 w-full">
                {/* Top Action Bar */}
                <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-5 backdrop-blur-xs sm:px-8 lg:px-10">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
                        >
                            <Menu size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                                    {
                                        NAV_ITEMS.find(
                                            (i) => i.id === activeTab,
                                        )?.label
                                    }
                                </h1>
                                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <span>4 Branches Active</span>
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                {profileForm.name} • {profileForm.category}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setActiveTab("offers")}
                            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                        >
                            <Plus size={15} />
                            <span>New Member Offer</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("verify")}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#00289a] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#001f78] transition-all cursor-pointer"
                        >
                            <QrCode size={15} />
                            <span>Verify Member ID</span>
                        </button>
                    </div>
                </header>

                {/* Full-Width Main Content Container */}
                <main className="flex-1 w-full p-5 sm:p-8 lg:px-10 lg:py-8 space-y-6">
                    {/* =====================================================
                        TAB 1: PARTNER OVERVIEW (FULL WIDTH)
                       ===================================================== */}
                    {activeTab === "overview" && (
                        <>
                            {/* KPI Cards Row — 4 Full-Width Columns */}
                            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                                {[
                                    {
                                        label: "Total Member Redemptions",
                                        value: (
                                            redemptions.length + 757
                                        ).toLocaleString(),
                                        change: "+18.4% vs last month",
                                        icon: Users,
                                    },
                                    {
                                        label: "Active Member Offers",
                                        value: offers.filter(
                                            (o) => o.status === "Active",
                                        ).length,
                                        change: `Across ${branches.length} partner stations`,
                                        icon: Percent,
                                    },
                                    {
                                        label: "Repeat RAVU Riders",
                                        value: "86.2%",
                                        change: "1,140 unique riders served",
                                        icon: TrendingUp,
                                    },
                                    {
                                        label: "Member Value Generated",
                                        value: "TZS 4.8M",
                                        change: "Total rider savings this quarter",
                                        icon: ShieldCheck,
                                    },
                                ].map((kpi) => {
                                    const Icon = kpi.icon;
                                    return (
                                        <div
                                            key={kpi.label}
                                            className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    {kpi.label}
                                                </span>
                                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00289a]/10 text-[#00289a]">
                                                    <Icon size={19} />
                                                </span>
                                            </div>
                                            <div className="mt-4">
                                                <p className="text-3xl font-black tracking-tight text-slate-950">
                                                    {kpi.value}
                                                </p>
                                                <p className="mt-1 text-xs font-semibold text-emerald-600">
                                                    {kpi.change}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Full-Width 12-Column Split: Redemptions Table (8 cols) + Quick Verify & Branch Breakdown (4 cols) */}
                            <div className="grid gap-6 xl:grid-cols-12">
                                {/* Left 8 Cols: Live Redemptions Table */}
                                <div className="xl:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                                        <div>
                                            <h2 className="text-base font-black text-slate-950">
                                                Live Member Redemptions
                                            </h2>
                                            <p className="text-xs text-slate-500">
                                                Real-time log of verified RAVU
                                                riders redeeming benefits across
                                                your stations.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <div className="relative">
                                                <Search
                                                    size={14}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) =>
                                                        setSearchQuery(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Search rider or ID..."
                                                    className="rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-[#00289a] focus:bg-white focus:outline-none"
                                                />
                                            </div>

                                            <select
                                                value={branchFilter}
                                                onChange={(e) =>
                                                    setBranchFilter(
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                                            >
                                                <option>All Branches</option>
                                                {branches.map((b) => (
                                                    <option
                                                        key={b.id}
                                                        value={b.name}
                                                    >
                                                        {b.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-4 overflow-x-auto flex-1">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                    <th className="pb-3 pr-4">
                                                        Tx / Member ID
                                                    </th>
                                                    <th className="pb-3 pr-4">
                                                        Rider &amp; Motorcycle
                                                    </th>
                                                    <th className="pb-3 pr-4">
                                                        Redeemed Benefit
                                                    </th>
                                                    <th className="pb-3 pr-4">
                                                        Station Branch
                                                    </th>
                                                    <th className="pb-3 pr-4">
                                                        Time
                                                    </th>
                                                    <th className="pb-3 text-right">
                                                        Discount Applied
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredRedemptions.map(
                                                    (tx) => (
                                                        <tr
                                                            key={tx.id}
                                                            className="hover:bg-slate-50/70 transition-colors"
                                                        >
                                                            <td className="py-3.5 pr-4">
                                                                <div className="font-mono font-bold text-[#00289a]">
                                                                    {
                                                                        tx.memberId
                                                                    }
                                                                </div>
                                                                <div className="text-[10px] text-slate-400">
                                                                    {tx.id}
                                                                </div>
                                                            </td>
                                                            <td className="py-3.5 pr-4">
                                                                <div className="font-bold text-slate-900">
                                                                    {
                                                                        tx.riderName
                                                                    }
                                                                </div>
                                                                <div className="text-[11px] text-slate-400">
                                                                    {tx.vehicle}
                                                                </div>
                                                            </td>
                                                            <td className="py-3.5 pr-4 font-semibold text-slate-700">
                                                                {tx.offer}
                                                            </td>
                                                            <td className="py-3.5 pr-4 text-slate-600">
                                                                {tx.branch}
                                                            </td>
                                                            <td className="py-3.5 pr-4 text-slate-400">
                                                                {tx.time}
                                                            </td>
                                                            <td className="py-3.5 text-right">
                                                                <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700">
                                                                    {tx.saved}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Right 4 Cols: Instant Verification + Branch Performance */}
                                <div className="xl:col-span-4 space-y-6">
                                    {/* Quick Verify Widget */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-[#00289a]">
                                            <Sparkles size={13} />
                                            <span>Instant POS Check</span>
                                        </div>
                                        <h3 className="mt-3 text-base font-black text-slate-950">
                                            Quick Rider ID Verification
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                            Enter a member&apos;s RAVU ID code
                                            to verify active membership and
                                            apply fuel or service discounts.
                                        </p>

                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                setActiveTab("verify");
                                                handleVerifyMember(e);
                                            }}
                                            className="mt-4 space-y-3"
                                        >
                                            <input
                                                type="text"
                                                value={memberCode}
                                                onChange={(e) =>
                                                    setMemberCode(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. RAVU-TZ-88241"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-[#00289a] focus:bg-white focus:outline-none"
                                            />
                                            <button
                                                type="submit"
                                                className="w-full rounded-xl bg-[#00289a] py-2.5 px-4 text-xs font-bold text-white hover:bg-[#001f78] transition-colors cursor-pointer"
                                            >
                                                Verify Member &amp; Redeem →
                                            </button>
                                        </form>
                                    </div>

                                    {/* Branch Performance Breakdown */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-black text-slate-950">
                                                Redemptions by Station
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveTab("branches")
                                                }
                                                className="text-xs font-bold text-[#00289a] hover:underline cursor-pointer"
                                            >
                                                Manage ({branches.length})
                                            </button>
                                        </div>

                                        <div className="space-y-3.5">
                                            {branches.map((b) => (
                                                <div key={b.id}>
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="font-bold text-slate-800">
                                                            {b.name}
                                                        </span>
                                                        <span className="font-semibold text-slate-500">
                                                            {b.redemptions}{" "}
                                                            riders ({b.share}%)
                                                        </span>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className="h-full rounded-full bg-[#00289a]"
                                                            style={{
                                                                width: `${b.share}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* =====================================================
                        TAB 2: VERIFY MEMBER ID (FULL WIDTH 12-COLUMN SPLIT)
                       ===================================================== */}
                    {activeTab === "verify" && (
                        <div className="grid gap-6 xl:grid-cols-12">
                            {/* Left 7 Cols: Verification Terminal & Digital Member Card */}
                            <div className="xl:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-950">
                                            RAVU Member &amp; Rider ID Terminal
                                        </h2>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Validate a rider&apos;s digital RAVU
                                            ID card before applying fuel, spare
                                            parts, or workshop discounts.
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                                        <ShieldCheck size={14} />
                                        <span>Live Verification</span>
                                    </span>
                                </div>

                                <form
                                    onSubmit={handleVerifyMember}
                                    className="mt-5 flex flex-col sm:flex-row gap-3"
                                >
                                    <div className="relative flex-1">
                                        <Search
                                            size={16}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                        <input
                                            type="text"
                                            value={memberCode}
                                            onChange={(e) =>
                                                setMemberCode(e.target.value)
                                            }
                                            placeholder="Enter RAVU ID (e.g. RAVU-TZ-88241)"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-10 pr-4 text-sm font-mono font-bold text-slate-900 focus:border-[#00289a] focus:bg-white focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-[#00289a] px-6 py-3 text-xs font-bold text-white hover:bg-[#001f78] transition-colors cursor-pointer"
                                    >
                                        Verify Member ID
                                    </button>
                                </form>

                                {/* Quick Sample Member IDs */}
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span className="text-[11px] font-semibold text-slate-400">
                                        Quick lookup sample IDs:
                                    </span>
                                    {Object.keys(SAMPLE_MEMBERS).map((code) => (
                                        <button
                                            key={code}
                                            type="button"
                                            onClick={() => {
                                                setMemberCode(code);
                                                setVerifiedMember(
                                                    SAMPLE_MEMBERS[code],
                                                );
                                            }}
                                            className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold transition-colors cursor-pointer ${
                                                verifiedMember?.code === code
                                                    ? "border-[#00289a] bg-[#00289a]/10 text-[#00289a]"
                                                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                                            }`}
                                        >
                                            {code}
                                        </button>
                                    ))}
                                </div>

                                {verifiedMember && (
                                    <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 space-y-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3.5">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                                <div>
                                                    <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                                                        {verifiedMember.status}
                                                    </span>
                                                    <h3 className="mt-1 text-lg font-black text-slate-950">
                                                        {verifiedMember.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-600">
                                                        ID:{" "}
                                                        <strong className="font-mono text-slate-900">
                                                            {
                                                                verifiedMember.code
                                                            }
                                                        </strong>{" "}
                                                        •{" "}
                                                        {verifiedMember.vehicle}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:text-right gap-3 bg-white/80 rounded-xl p-3 border border-emerald-200/70">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-slate-400">
                                                        Member Tier
                                                    </p>
                                                    <p className="text-xs font-bold text-slate-900">
                                                        {verifiedMember.tier}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-slate-400">
                                                        Completed Trips
                                                    </p>
                                                    <p className="text-xs font-bold text-[#00289a]">
                                                        {
                                                            verifiedMember.totalTrips
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-emerald-200/80 grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                    Select Partner Benefit
                                                </label>
                                                <select
                                                    value={selectedOfferId}
                                                    onChange={(e) =>
                                                        setSelectedOfferId(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                                                >
                                                    {offers.map((o) => (
                                                        <option
                                                            key={o.id}
                                                            value={o.id}
                                                        >
                                                            {o.title} (
                                                            {o.discount})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                    Redeeming Station / Branch
                                                </label>
                                                <select
                                                    value={selectedBranchName}
                                                    onChange={(e) =>
                                                        setSelectedBranchName(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                                                >
                                                    {branches.map((b) => (
                                                        <option
                                                            key={b.id}
                                                            value={b.name}
                                                        >
                                                            {b.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleRecordRedemption}
                                            className="w-full rounded-xl bg-emerald-600 py-3 px-5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                                        >
                                            Confirm &amp; Record Benefit
                                            Redemption
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Right 5 Cols: Recent POS Redemptions Feed */}
                            <div className="xl:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col justify-between">
                                <div>
                                    <h3 className="text-base font-black text-slate-950">
                                        Recent Station Verifications
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Latest member IDs verified and redeemed
                                        across your branches today.
                                    </p>

                                    <div className="mt-5 space-y-3">
                                        {redemptions.slice(0, 5).map((tx) => (
                                            <div
                                                key={tx.id}
                                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-bold text-[#00289a]">
                                                            {tx.memberId}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-900 truncate">
                                                            {tx.riderName}
                                                        </span>
                                                    </div>
                                                    <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                                                        {tx.offer} • {tx.branch}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                                        {tx.saved}
                                                    </span>
                                                    <p className="mt-0.5 text-[10px] text-slate-400">
                                                        {tx.time}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
                                    <p className="text-xs font-bold text-slate-900">
                                        POS &amp; Attendant Verification Tip
                                    </p>
                                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                                        Station attendants can verify any RAVU
                                        rider in under 5 seconds by entering the
                                        member&apos;s `RAVU-TZ` ID displayed in
                                        their mobile app.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =====================================================
                        TAB 3: MEMBER BENEFITS & OFFERS (FULL WIDTH 12-COL)
                       ===================================================== */}
                    {activeTab === "offers" && (
                        <div className="grid gap-6 xl:grid-cols-12">
                            {/* Left 8 Cols: 2-Column Grid of Offers */}
                            <div className="xl:col-span-8 space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {offers.map((offer) => (
                                        <div
                                            key={offer.id}
                                            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="rounded-lg bg-[#00289a]/10 px-3 py-1 text-xs font-black text-[#00289a]">
                                                        {offer.discount}
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                            offer.status ===
                                                            "Active"
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : "bg-amber-50 text-amber-700"
                                                        }`}
                                                    >
                                                        {offer.status}
                                                    </span>
                                                </div>

                                                <h3 className="mt-3 text-base font-black text-slate-950 leading-snug">
                                                    {offer.title}
                                                </h3>
                                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                                    {offer.category} •{" "}
                                                    {offer.branches}
                                                </p>
                                            </div>

                                            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <div className="text-xs text-slate-500">
                                                    <strong className="font-black text-slate-900">
                                                        {offer.redemptions}
                                                    </strong>{" "}
                                                    redemptions (
                                                    {offer.conversion})
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleOfferStatus(
                                                                offer.id,
                                                            )
                                                        }
                                                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                                    >
                                                        {offer.status ===
                                                        "Active"
                                                            ? "Pause"
                                                            : "Activate"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteOffer(
                                                                offer.id,
                                                            )
                                                        }
                                                        className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
                                                        title="Delete offer"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right 4 Cols: Publish New Benefit Form */}
                            <div className="xl:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs h-fit">
                                <h3 className="text-base font-black text-slate-950">
                                    Publish New Member Benefit
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Create an exclusive discount or service
                                    benefit for verified RAVU riders.
                                </p>

                                <form
                                    onSubmit={handleAddOffer}
                                    className="mt-5 space-y-4"
                                >
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Offer Headline
                                        </label>
                                        <input
                                            type="text"
                                            value={newOfferTitle}
                                            onChange={(e) =>
                                                setNewOfferTitle(e.target.value)
                                            }
                                            placeholder="e.g. 15% Off Brake Pads & Installation"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#00289a] focus:bg-white focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Discount Badge
                                        </label>
                                        <input
                                            type="text"
                                            value={newOfferDiscount}
                                            onChange={(e) =>
                                                setNewOfferDiscount(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. 15% OFF or TZS 2,000 OFF"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#00289a] focus:bg-white focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Partner Sector
                                        </label>
                                        <select
                                            value={newOfferCategory}
                                            onChange={(e) =>
                                                setNewOfferCategory(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900"
                                        >
                                            <option>Fuel & Lubricants</option>
                                            <option>
                                                Spare Parts & Garages
                                            </option>
                                            <option>Workshop Service</option>
                                            <option>
                                                Insurance & Financial
                                            </option>
                                            <option>Healthcare & Safety</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Eligible Branches
                                        </label>
                                        <select
                                            value={newOfferBranches}
                                            onChange={(e) =>
                                                setNewOfferBranches(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900"
                                        >
                                            <option>All 4 Stations</option>
                                            {branches.map((b) => (
                                                <option
                                                    key={b.id}
                                                    value={b.name}
                                                >
                                                    {b.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00289a] py-3 px-4 text-xs font-bold text-white hover:bg-[#001f78] transition-colors cursor-pointer"
                                    >
                                        <Plus size={15} />
                                        <span>Publish Benefit to RAVU App</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* =====================================================
                        TAB 4: BRANCHES & STATIONS (FULL WIDTH 12-COL)
                       ===================================================== */}
                    {activeTab === "branches" && (
                        <div className="grid gap-6 xl:grid-cols-12">
                            <div className="xl:col-span-8 grid gap-4 md:grid-cols-2">
                                {branches.map((b) => (
                                    <div
                                        key={b.id}
                                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    <span>{b.status}</span>
                                                </span>
                                                <span className="text-xs font-bold text-[#00289a]">
                                                    {b.redemptions} redemptions
                                                </span>
                                            </div>
                                            <h3 className="mt-3 text-base font-black text-slate-950">
                                                {b.name}
                                            </h3>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {b.address} • {b.city}
                                            </p>
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                                            <span>
                                                Manager:{" "}
                                                <strong className="text-slate-900">
                                                    {b.manager}
                                                </strong>
                                            </span>
                                            <span className="font-mono text-[11px] text-slate-500">
                                                {b.phone}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="xl:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs h-fit">
                                <h3 className="text-base font-black text-slate-950">
                                    Add Partner Branch / Station
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Register an additional service point where
                                    RAVU members can redeem benefits.
                                </p>

                                <form
                                    onSubmit={handleAddBranch}
                                    className="mt-5 space-y-4"
                                >
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Branch / Station Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newBranchName}
                                            onChange={(e) =>
                                                setNewBranchName(e.target.value)
                                            }
                                            placeholder="e.g. Tegeta Service Station"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            District &amp; City
                                        </label>
                                        <input
                                            type="text"
                                            value={newBranchCity}
                                            onChange={(e) =>
                                                setNewBranchCity(e.target.value)
                                            }
                                            placeholder="e.g. Kinondoni, Dar es Salaam"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Street / Road Address
                                        </label>
                                        <input
                                            type="text"
                                            value={newBranchAddress}
                                            onChange={(e) =>
                                                setNewBranchAddress(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. Bagamoyo Road"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Branch Manager
                                        </label>
                                        <input
                                            type="text"
                                            value={newBranchManager}
                                            onChange={(e) =>
                                                setNewBranchManager(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. Musa Кибондо"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00289a] py-3 px-4 text-xs font-bold text-white hover:bg-[#001f78] transition-colors cursor-pointer"
                                    >
                                        <Plus size={15} />
                                        <span>Add Branch Location</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* =====================================================
                        TAB 5: PARTNER PROFILE & SETTINGS (FULL WIDTH 12-COL)
                       ===================================================== */}
                    {activeTab === "settings" && (
                        <div className="grid gap-6 xl:grid-cols-12">
                            {/* Left 7 Cols: Editable Partner Organization Profile */}
                            <form
                                onSubmit={handleSaveProfile}
                                className="xl:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5"
                            >
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-950">
                                            Partner Organization Profile
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Update your business details,
                                            contact information, and RAVU
                                            listing metadata.
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#00289a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#001f78] transition-colors cursor-pointer"
                                    >
                                        <Save size={14} />
                                        <span>Save Profile</span>
                                    </button>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Organization Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) =>
                                                setProfileForm({
                                                    ...profileForm,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Partner Account Email
                                        </label>
                                        <input
                                            type="email"
                                            value={profileForm.email}
                                            onChange={(e) =>
                                                setProfileForm({
                                                    ...profileForm,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Primary Support Phone
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.phone}
                                            onChange={(e) =>
                                                setProfileForm({
                                                    ...profileForm,
                                                    phone: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Business Sector
                                        </label>
                                        <select
                                            value={profileForm.category}
                                            onChange={(e) =>
                                                setProfileForm({
                                                    ...profileForm,
                                                    category: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                                        >
                                            <option>
                                                Fuel &amp; Energy Station
                                            </option>
                                            <option>
                                                Spare Parts &amp; Garage
                                                Workshop
                                            </option>
                                            <option>
                                                Insurance &amp; Financial
                                                Services
                                            </option>
                                            <option>
                                                Healthcare &amp; Medical
                                                Provider
                                            </option>
                                            <option>
                                                Retail &amp; Merchant Partner
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            TIN / Business Registration
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.tinNumber}
                                            onChange={(e) =>
                                                setProfileForm({
                                                    ...profileForm,
                                                    tinNumber: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Headquarters Address
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.headquarters}
                                            onChange={(e) =>
                                                setProfileForm({
                                                    ...profileForm,
                                                    headquarters:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                                        />
                                    </div>
                                </div>
                            </form>

                            {/* Right 5 Cols: Partner Verification & Preferences */}
                            <div className="xl:col-span-5 space-y-6">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                            <BadgeCheck size={22} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                                Ecosystem Verification
                                            </span>
                                            <h3 className="text-base font-black text-slate-950">
                                                Verified Tier-1 Partner
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="text-xs leading-relaxed text-slate-500">
                                        Your organization is verified in the
                                        RAVU Mobility Ecosystem. All active
                                        offers are visible to riders inside the
                                        RAVU mobile app.
                                    </p>
                                    <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex items-center justify-between text-xs">
                                        <span className="font-semibold text-slate-500">
                                            Partner Merchant ID
                                        </span>
                                        <span className="font-mono font-bold text-[#00289a]">
                                            RAVU-PRT-0042
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                                    <h3 className="text-sm font-black text-slate-950">
                                        POS &amp; Redemption Preferences
                                    </h3>
                                    <label className="flex items-center justify-between gap-3 cursor-pointer">
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">
                                                Instant Redemption Approval
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                Allow branch attendants to
                                                confirm valid Member IDs
                                                immediately.
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={
                                                profileForm.autoApproveRedemptions
                                            }
                                            onChange={(e) =>
                                                setProfileForm({
                                                    ...profileForm,
                                                    autoApproveRedemptions:
                                                        e.target.checked,
                                                })
                                            }
                                            className="h-4 w-4 rounded border-slate-300 text-[#00289a]"
                                        />
                                    </label>
                                    <label className="flex items-center justify-between gap-3 cursor-pointer pt-2 border-t border-slate-100">
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">
                                                SMS Redemption Summary
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                Send daily station redemption
                                                totals to branch managers.
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={profileForm.smsReceipts}
                                            onChange={(e) =>
                                                setProfileForm({
                                                    ...profileForm,
                                                    smsReceipts:
                                                        e.target.checked,
                                                })
                                            }
                                            className="h-4 w-4 rounded border-slate-300 text-[#00289a]"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
