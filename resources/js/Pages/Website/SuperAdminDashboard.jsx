import { Link } from "@inertiajs/react";
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    ArrowUpRight,
    Bell,
    BookOpen,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Copy,
    Download,
    Edit3,
    ExternalLink,
    Eye,
    FileText,
    Filter,
    Globe,
    HelpCircle,
    Home,
    Image as ImageIcon,
    Layers,
    LayoutDashboard,
    Link2,
    Lock,
    LogOut,
    Mail,
    Menu,
    MessageSquare,
    Monitor,
    MoreVertical,
    Navigation as NavigationIcon,
    Palette,
    Plus,
    RefreshCw,
    RotateCcw,
    Save,
    Search,
    Settings,
    Shield,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Trash2,
    TrendingUp,
    Upload,
    UserCheck,
    Users,
    X,
    Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import footerBg from "../../../imgs/Footer.jpg";
import fundRepairShopImg from "../../../imgs/fundRepairShop.jpg";
import headerImg from "../../../imgs/Header.jpg";
import logoImg from "../../../imgs/Logo.png";
import mapImg from "../../../imgs/map.jpg";
import memberPlusPartnersImg from "../../../imgs/memberPlusPartners.jpg";
import ravuRiderIdImg from "../../../imgs/ravuRiderID.jpg";
import riderImg from "../../../imgs/rider.jpg";
import supportImg from "../../../imgs/support.jpg";

const STORAGE_KEY = "ravu_cms_content_v1";

/**
 * Default comprehensive CMS state representing the entire RAVU website content.
 */
const INITIAL_CMS_DATA = {
    meta: {
        lastUpdated: "2026-11-06T11:15:00Z",
        version: "2.4.0",
        status: "Published",
        environment: "Production",
    },
    global: {
        siteName: "Ravu",
        tagline: "People. Partners. A Stronger Mobility Ecosystem.",
        primaryColor: "#00289a",
        accentColor: "#1864E8",
        appStoreUrl: "#app-store",
        googlePlayUrl: "#google-play",
        contactEmail: "support@ravu.co.tz",
        contactPhone: "+255 712 345 678",
        headquarters: "Dar es Salaam, Tanzania",
        navigation: {
            ctaPrimaryLabel: "Get the RAVU App",
            ctaPrimaryHref: "/for-riders",
            ctaSecondaryLabel: "Partner",
            ctaSecondaryHref: "/partners",
            desktopLinks: [
                { id: "nav-1", label: "Ride", href: "/for-riders", visible: true },
                { id: "nav-2", label: "Business", href: "/partners", visible: true },
                { id: "nav-3", label: "Membership", href: "/membership", visible: true },
                { id: "nav-4", label: "About", href: "/about-ravu", visible: true },
                { id: "nav-5", label: "Support", href: "/support", visible: true },
            ],
        },
        communityBanner: {
            eyebrow: "A GROWING COMMUNITY",
            titleLine1: "More people.",
            titleLine2: "Stronger communities.",
            description:
                "RAVU connects riders, drivers, businesses and communities to create more value and opportunities across Tanzania.",
            stats: [
                { id: "stat-1", value: "100K+", label: "Riders" },
                { id: "stat-2", value: "10K+", label: "Drivers" },
                { id: "stat-3", value: "50+", label: "Cities & towns" },
                { id: "stat-4", value: "100+", label: "Business partners" },
            ],
        },
        footer: {
            copyright: "RAVU. All rights reserved.",
            socials: [
                { id: "soc-1", platform: "Instagram", url: "https://instagram.com", active: true },
                { id: "soc-2", platform: "X (Twitter)", url: "https://x.com", active: true },
                { id: "soc-3", platform: "Facebook", url: "https://facebook.com", active: true },
                { id: "soc-4", platform: "LinkedIn", url: "https://linkedin.com", active: true },
                { id: "soc-5", platform: "YouTube", url: "https://youtube.com", active: true },
            ],
            columns: {
                explore: [
                    { label: "About RAVU", href: "/about-ravu" },
                    { label: "For Riders", href: "/for-riders" },
                    { label: "Membership", href: "/membership" },
                    { label: "Benefits", href: "/benefits" },
                    { label: "How it works", href: "/how-it-works" },
                    { label: "Get the RAVU App", href: "/for-riders" },
                ],
                business: [
                    { label: "Partners", href: "/partners" },
                    { label: "Drive with RAVU", href: "/for-riders" },
                    { label: "Business Solutions", href: "/partners" },
                ],
                support: [
                    { label: "Help Centre", href: "/support" },
                    { label: "Contact Us", href: "/support" },
                    { label: "Safety", href: "/about-ravu" },
                    { label: "FAQs", href: "/support" },
                ],
            },
        },
    },
    pages: {
        home: {
            id: "home",
            title: "Home Page",
            slug: "/",
            status: "Published",
            seoTitle: "RAVU — Move further together | Mobility Ecosystem Tanzania",
            seoDescription:
                "A smarter way to get around. Ride, share and access more value — all in one app, across Tanzania.",
            hero: {
                eyebrow: "MOBILITY, CONNECTED",
                headlinePart1: "Move further",
                headlineHighlight: "together.",
                description:
                    "A smarter way to get around. Ride, share and access more value — all in one app, across Tanzania.",
                socialProofText: "People moving together across Tanzania",
                heroImage: "Header.jpg",
            },
            featuresStrip: [
                {
                    id: "feat-1",
                    icon: "Zap",
                    title: "Get moving",
                    description: "Reliable rides, whenever you need them.",
                },
                {
                    id: "feat-2",
                    icon: "Users",
                    title: "More value",
                    description: "Exclusive member benefits and savings.",
                },
                {
                    id: "feat-3",
                    icon: "ShieldCheck",
                    title: "Feel safe",
                    description: "Trusted drivers and a safer journey.",
                },
            ],
            appShowcase: {
                eyebrow: "THE RAVU APP",
                headlinePart1: "Your journey",
                headlineHighlight: "in one app.",
                description:
                    "Book rides, track your trip, access member benefits, find nearby services and more — all in one place.",
                showcaseImage: "map.png",
            },
        },
        about: {
            id: "about",
            title: "About RAVU",
            slug: "/about-ravu",
            status: "Published",
            seoTitle: "About RAVU — Connected Mobility Ecosystem",
            seoDescription:
                "RAVU is building a membership-based mobility ecosystem around the riders, drivers, owners, partners and communities.",
            hero: {
                eyebrow: "About RAVU",
                headline: "Mobility works better when its people are connected.",
                description:
                    "RAVU is building a membership-based mobility ecosystem around the riders, drivers, owners, partners and communities who keep movement happening.",
                primaryCta: "Partner With RAVU",
                secondaryCta: "Explore Membership",
            },
            purpose: {
                eyebrow: "Our purpose",
                title: "Opportunity and support, closer to the road.",
                description:
                    "RAVU is designed to bring connected services, trusted relationships and practical progress to the mobility economy starting with the people at its centre.",
                vision: "A stronger, more connected mobility ecosystem where people can participate and grow.",
                mission:
                    "Connect mobility communities with relevant benefits, trusted partners, practical services and digital tools.",
            },
            values: [
                {
                    id: "val-1",
                    title: "Trust",
                    description:
                        "Clear, responsible relationships at every point in the ecosystem.",
                },
                {
                    id: "val-2",
                    title: "Community",
                    description:
                        "Mobility is people first, and progress works better together.",
                },
                {
                    id: "val-3",
                    title: "Inclusion",
                    description:
                        "A platform designed to grow with the people who keep movement happening.",
                },
            ],
        },
        forRiders: {
            id: "forRiders",
            title: "For Riders & Drivers",
            slug: "/for-riders",
            status: "Published",
            seoTitle: "For Riders & Drivers — RAVU App & Membership",
            seoDescription:
                "The RAVU app is the starting point for riders and drivers to access membership, support and partner benefits.",
            hero: {
                eyebrow: "For Riders & Drivers",
                headline: "Built around the people on the road.",
                description:
                    "Riders and drivers are at the heart of RAVU. Join through the RAVU mobile app to access membership, practical support and community benefits.",
                primaryCta: "Get the RAVU App",
                secondaryCta: "Explore Membership",
            },
            supportAreas: [
                {
                    id: "sup-1",
                    title: "Membership access",
                    description:
                        "Connect with benefits and services as the RAVU ecosystem grows.",
                },
                {
                    id: "sup-2",
                    title: "Practical support",
                    description:
                        "Discover mobility-focused support designed around everyday operations.",
                },
                {
                    id: "sup-3",
                    title: "Community",
                    description: "Be part of a connected mobility community.",
                },
            ],
            journeySteps: [
                {
                    id: "rj-1",
                    title: "Download the app",
                    description:
                        "The RAVU app is the starting point for riders and drivers.",
                },
                {
                    id: "rj-2",
                    title: "Register in the app",
                    description:
                        "Complete your details where the operational experience lives.",
                },
                {
                    id: "rj-3",
                    title: "Access your membership",
                    description:
                        "Use membership access, services and support as they become available.",
                },
                {
                    id: "rj-4",
                    title: "Participate and grow",
                    description:
                        "Build connections and move forward with the wider ecosystem.",
                },
            ],
        },
        membership: {
            id: "membership",
            title: "Membership",
            slug: "/membership",
            status: "Published",
            seoTitle: "RAVU Membership — Join. Save. Earn.",
            seoDescription:
                "A RAVU membership connects you to a growing ecosystem of support, benefits and community built around your mobility journey.",
            hero: {
                eyebrow: "RAVU Membership",
                headline: "Membership that moves with you.",
                description:
                    "A RAVU membership connects you to a growing ecosystem of support, benefits and community built around your mobility journey.",
                primaryCta: "Register Interest",
                secondaryCta: "See Benefits",
            },
            highlights: [
                "Access to relevant benefits as they become available.",
                "Connection to ecosystem partners and services.",
                "A mobility community built around participation.",
                "Participation and progress within a growing ecosystem.",
            ],
        },
        benefits: {
            id: "benefits",
            title: "Member Benefits",
            slug: "/benefits",
            status: "Published",
            seoTitle: "Member Benefits — RAVU Ecosystem",
            seoDescription:
                "Discover savings, financial access, protection, maintenance and community support through RAVU membership.",
            hero: {
                eyebrow: "Member Benefits",
                headline: "Practical value around everyday mobility.",
                description:
                    "RAVU membership is designed to connect members with relevant savings, services, protection and community support.",
            },
            categories: [
                {
                    id: "ben-1",
                    title: "Savings & Financial Access",
                    description:
                        "Relevant opportunities and services as the ecosystem develops.",
                },
                {
                    id: "ben-2",
                    title: "Protection & Support",
                    description:
                        "Access to a broader support system around mobility.",
                },
                {
                    id: "ben-3",
                    title: "Maintenance & Operations",
                    description:
                        "Connections to workshops, spare parts and everyday vehicle support.",
                },
                {
                    id: "ben-4",
                    title: "Community & Growth",
                    description:
                        "Be part of an organized network that creates long-term opportunity.",
                },
            ],
        },
        partners: {
            id: "partners",
            title: "Partners & Business",
            slug: "/partners",
            status: "Published",
            seoTitle: "Partner With RAVU — Commercial & Ecosystem Partnerships",
            seoDescription:
                "Connect your organisation with an active mobility community across hospitality, insurance, banking, workshops and technology.",
            hero: {
                eyebrow: "Partner With RAVU",
                headline: "Build the mobility ecosystem with RAVU.",
                description:
                    "RAVU connects organisations to an active mobility community. Whether you provide protection, finance, services or technology, there is a place for you.",
            },
            sectors: [
                {
                    id: "sec-1",
                    title: "Hotels & Hospitality",
                    description: "Reach RAVU members and mobility customers.",
                },
                {
                    id: "sec-2",
                    title: "Insurance Providers",
                    description:
                        "Develop relevant protection solutions for mobility users.",
                },
                {
                    id: "sec-3",
                    title: "Banks & Financial Institutions",
                    description: "Reach an active mobility community.",
                },
                {
                    id: "sec-4",
                    title: "Workshops & Spare Parts",
                    description: "Become part of the RAVU service network.",
                },
                {
                    id: "sec-5",
                    title: "Businesses & Merchants",
                    description:
                        "Offer products, services and exclusive benefits to RAVU members.",
                },
                {
                    id: "sec-6",
                    title: "Technology Partners",
                    description:
                        "Build connected mobility solutions with RAVU.",
                },
            ],
        },
        howItWorks: {
            id: "howItWorks",
            title: "How It Works",
            slug: "/how-it-works",
            status: "Published",
            seoTitle: "How RAVU Works — Step-by-Step Guide",
            seoDescription:
                "A clear route into a connected mobility ecosystem for members and organisations.",
            hero: {
                eyebrow: "How It Works",
                headline: "Discover. Join. Connect. Grow.",
                description:
                    "A clear route into a connected mobility ecosystem — for members and for organisations.",
            },
            steps: [
                {
                    id: "hw-1",
                    title: "Discover RAVU",
                    description:
                        "Understand the membership ecosystem and where you fit.",
                },
                {
                    id: "hw-2",
                    title: "Register",
                    description:
                        "Share your interest in becoming part of RAVU.",
                },
                {
                    id: "hw-3",
                    title: "Become a member",
                    description:
                        "Complete verification through the RAVU app as it launches.",
                },
                {
                    id: "hw-4",
                    title: "Connect with partners",
                    description:
                        "Access certified workshops, insurers, banks and businesses.",
                },
                {
                    id: "hw-5",
                    title: "Access benefits",
                    description:
                        "Use member discounts and support on the road every day.",
                },
                {
                    id: "hw-6",
                    title: "Grow with RAVU",
                    description:
                        "Move forward with a stronger mobility journey.",
                },
            ],
        },
        support: {
            id: "support",
            title: "Support & FAQs",
            slug: "/support",
            status: "Published",
            seoTitle: "Help & Support — RAVU",
            seoDescription:
                "Find answers to common questions about RAVU membership, the mobile app, and partnering with our ecosystem.",
            hero: {
                eyebrow: "Support",
                headline: "Clear answers and guidance when you need it.",
                description:
                    "Find answers to common questions about RAVU, membership, the mobile app and partnership opportunities.",
            },
            faqs: [
                {
                    id: "faq-1",
                    question: "What is RAVU?",
                    answer: "RAVU is a membership-based mobility ecosystem connecting people, services and opportunity. It is built around the communities who keep movement happening, and grows outward to include the businesses, services and technology that support them.",
                    published: true,
                },
                {
                    id: "faq-2",
                    question: "Who can become a member?",
                    answer: "RAVU begins with boda boda riders and motorcycle owners, and is designed to grow with mobility communities more broadly. Membership processes are still being developed, and RAVU will communicate clearly as each stage becomes available.",
                    published: true,
                },
                {
                    id: "faq-3",
                    question: "How do I register?",
                    answer: "Use the registration page to share your interest. This does not yet create a full operational membership — it records your interest so RAVU can keep you informed as the membership journey becomes available. Riders and drivers will join and use RAVU primarily through the mobile app.",
                    published: true,
                },
                {
                    id: "faq-4",
                    question: "How can an organisation partner with RAVU?",
                    answer: "Organisations across hospitality, insurance, banking, workshops, spare parts, retail and technology can partner with RAVU. Visit the Partners page to explore opportunities and contact our partnerships team.",
                    published: true,
                },
            ],
        },
    },
    mediaLibrary: [
        {
            id: "med-1",
            name: "Logo.png",
            label: "Official Brand Emblem",
            usedIn: "Navigation, Footer, Login, Register",
            dimensions: "850 × 850 px",
            size: "367 KB",
            src: logoImg,
            alt: "RAVU circular brand emblem",
        },
        {
            id: "med-2",
            name: "Header.jpg",
            label: "Home Hero 5-Screen Showcase",
            usedIn: "Home Page (Full-Width Hero Stage)",
            dimensions: "1672 × 941 px",
            size: "1.87 MB",
            src: headerImg,
            alt: "Ravu Ride-Sharing App Journey",
        },
        {
            id: "med-3",
            name: "map.png",
            label: "Mobile App Map Mockup",
            usedIn: "Home Page (The RAVU App Section)",
            dimensions: "3368 × 4744 px",
            size: "3.84 MB",
            src: mapImg,
            alt: "Ravu mobile app interface showing map and destination search",
        },
        {
            id: "med-4",
            name: "Footer.jpg",
            label: "City Skyline & Blue Ribbons",
            usedIn: "Community & Stats Pre-Footer (All Pages)",
            dimensions: "1708 × 920 px",
            size: "2.03 MB",
            src: footerBg,
            alt: "Dar es Salaam city skyline at dusk with blue ribbons",
        },
        {
            id: "med-5",
            name: "rider.jpg",
            label: "RAVU Branded Motorcycle Rider",
            usedIn: "About RAVU, For Riders",
            dimensions: "1536 × 1024 px",
            size: "2.11 MB",
            src: riderImg,
            alt: "RAVU rider in branded kit on a motorcycle",
        },
        {
            id: "med-6",
            name: "ravuRiderID.jpg",
            label: "Verified Rider Digital ID Card",
            usedIn: "Membership Page",
            dimensions: "1122 × 1402 px",
            size: "1.98 MB",
            src: ravuRiderIdImg,
            alt: "RAVU verified member digital ID",
        },
        {
            id: "med-7",
            name: "fundRepairShop.jpg",
            label: "Partner Workshop & Service Network",
            usedIn: "Partners Page",
            dimensions: "1536 × 1024 px",
            size: "2.37 MB",
            src: fundRepairShopImg,
            alt: "RAVU partner workshop mechanic",
        },
        {
            id: "med-8",
            name: "support.jpg",
            label: "Customer & Member Support",
            usedIn: "Support Page",
            dimensions: "1023 × 1537 px",
            size: "1.93 MB",
            src: supportImg,
            alt: "RAVU support representative",
        },
        {
            id: "med-9",
            name: "memberPlusPartners.jpg",
            label: "Members & Partners Network",
            usedIn: "Ecosystem Media Pool",
            dimensions: "1536 × 1024 px",
            size: "2.58 MB",
            src: memberPlusPartnersImg,
            alt: "RAVU members and commercial partners",
        },
    ],
    submissions: [
        {
            id: "SUB-1042",
            name: "Juma Bakari",
            type: "Rider Membership",
            contact: "+255 714 892 103",
            city: "Dar es Salaam",
            status: "Verified",
            date: "2026-11-06",
            notes: "Boda boda operator in Kinondoni, 4 years experience.",
        },
        {
            id: "SUB-1041",
            name: "CRDB Microfinance Partner Team",
            type: "Commercial Partner",
            contact: "partnerships@crdbbank.co.tz",
            city: "Dar es Salaam",
            status: "In Review",
            date: "2026-11-05",
            notes: "Interested in rider asset financing integration.",
        },
        {
            id: "SUB-1040",
            name: "Amina Mohamed",
            type: "Driver Membership",
            contact: "+255 754 310 998",
            city: "Arusha",
            status: "Verified",
            date: "2026-11-05",
            notes: "Ravu Share driver applicant.",
        },
        {
            id: "SUB-1039",
            name: "Kariakoo Auto Spares Ltd",
            type: "Workshop & Parts Partner",
            contact: "info@kariakoospares.co.tz",
            city: "Dar es Salaam",
            status: "Verified",
            date: "2026-11-04",
            notes: "Offering 15% member discount on genuine OEM parts.",
        },
        {
            id: "SUB-1038",
            name: "Emmanuel Mwakasege",
            type: "Rider Membership",
            contact: "+255 789 441 200",
            city: "Mwanza",
            status: "Pending",
            date: "2026-11-03",
            notes: "Awaiting mobile app onboarding link.",
        },
        {
            id: "SUB-1037",
            name: "Zanzibar Serena Hospitality",
            type: "Hospitality Partner",
            contact: "concierge@serena.co.tz",
            city: "Zanzibar",
            status: "Contacted",
            date: "2026-11-02",
            notes: "Guest airport transfer partnership inquiry.",
        },
    ],
    activityLog: [
        {
            id: "act-1",
            action: "Updated Home Page Hero to Full-Width Stage",
            user: "Super Admin",
            time: "10 mins ago",
            category: "Page Edit",
        },
        {
            id: "act-2",
            action: "Unified Community Skyline Banner across all 8 pages",
            user: "Super Admin",
            time: "1 hour ago",
            category: "Global Layout",
        },
        {
            id: "act-3",
            action: "Synchronized Primary Brand Color (#00289a) with Logo.png",
            user: "Super Admin",
            time: "2 hours ago",
            category: "Theme & Brand",
        },
        {
            id: "act-4",
            action: "Approved Kariakoo Auto Spares Partner Listing",
            user: "Partner Ops",
            time: "Yesterday",
            category: "Partners",
        },
    ],
};

export default function SuperAdminDashboard({ auth, flash }) {
    const adminEmail = auth?.user?.email || "jux@ravu.com";

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);
    // Load persisted CMS state or fallback to initial
    const [cms, setCms] = useState(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = window.localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    return JSON.parse(saved);
                }
            } catch (e) {
                console.error("Failed to read CMS storage:", e);
            }
        }
        return INITIAL_CMS_DATA;
    });

    // Primary navigation tabs in sidebar
    const [activeSection, setActiveSection] = useState("overview"); // overview | pages | navigation | community | faqs | media | submissions | settings
    const [selectedPageKey, setSelectedPageKey] = useState("home");
    const [searchQuery, setSearchQuery] = useState("");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showLivePreview, setShowLivePreview] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [submissionFilter, setSubmissionFilter] = useState("All");

    // New FAQ modal / inline state
    const [newFaqQuestion, setNewFaqQuestion] = useState("");
    const [newFaqAnswer, setNewFaqAnswer] = useState("");

    // New Nav Link state
    const [newNavLabel, setNewNavLabel] = useState("");
    const [newNavHref, setNewNavHref] = useState("");

    // Save to localStorage
    const handleSaveChanges = () => {
        const updated = {
            ...cms,
            meta: {
                ...cms.meta,
                lastUpdated: new Date().toISOString(),
            },
            activityLog: [
                {
                    id: `act-${Date.now()}`,
                    action: `Published content updates (${activeSection})`,
                    user: "Super Admin",
                    time: "Just now",
                    category: "CMS Publish",
                },
                ...cms.activityLog.slice(0, 14),
            ],
        };
        setCms(updated);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        setHasUnsavedChanges(false);
        toast.success("All website content changes published!", {
            style: {
                background: "#050B17",
                color: "#fff",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 600,
            },
        });
    };

    // Reset to factory defaults
    const handleResetDefaults = () => {
        if (
            typeof window !== "undefined" &&
            window.confirm(
                "Reset all website CMS content back to the default baseline?",
            )
        ) {
            setCms(INITIAL_CMS_DATA);
            window.localStorage.removeItem(STORAGE_KEY);
            setHasUnsavedChanges(false);
            toast.success("Restored default website content.");
        }
    };

    // Export JSON configuration
    const handleExportJson = () => {
        const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(cms, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute(
            "download",
            `ravu-website-cms-${new Date().toISOString().slice(0, 10)}.json`,
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success("Exported full CMS content JSON.");
    };

    // Helper to update nested state cleanly and mark dirty
    const updateCms = (updater) => {
        setCms((prev) => {
            const next =
                typeof updater === "function" ? updater(prev) : updater;
            return next;
        });
        setHasUnsavedChanges(true);
    };

    // Helper for updating a specific page
    const updatePageField = (pageKey, sectionKey, field, value) => {
        updateCms((prev) => ({
            ...prev,
            pages: {
                ...prev.pages,
                [pageKey]: {
                    ...prev.pages[pageKey],
                    [sectionKey]:
                        field === null
                            ? value
                            : {
                                  ...prev.pages[pageKey][sectionKey],
                                  [field]: value,
                              },
                },
            },
        }));
    };

    // Filtered submissions
    const filteredSubmissions = useMemo(() => {
        return cms.submissions.filter((sub) => {
            const matchesFilter =
                submissionFilter === "All" ||
                sub.status === submissionFilter ||
                sub.type.includes(submissionFilter);
            const matchesSearch =
                !searchQuery ||
                sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.id.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [cms.submissions, submissionFilter, searchQuery]);

    const currentPage = cms.pages[selectedPageKey];

    const SIDEBAR_ITEMS = [
        {
            id: "overview",
            label: "Dashboard Overview",
            icon: LayoutDashboard,
            badge: null,
        },
        {
            id: "pages",
            label: "Page Content Editor",
            icon: FileText,
            badge: Object.keys(cms.pages).length,
        },
        {
            id: "navigation",
            label: "Header & Footer",
            icon: NavigationIcon,
            badge: null,
        },
        {
            id: "community",
            label: "Community & Stats",
            icon: TrendingUp,
            badge: "4 KPIs",
        },
        {
            id: "faqs",
            label: "Support & FAQ Manager",
            icon: HelpCircle,
            badge: cms.pages.support.faqs.length,
        },
        {
            id: "media",
            label: "Media & Brand Assets",
            icon: ImageIcon,
            badge: cms.mediaLibrary.length,
        },
        {
            id: "submissions",
            label: "Member & Partner Leads",
            icon: Users,
            badge: cms.submissions.length,
        },
        {
            id: "settings",
            label: "Global & SEO Settings",
            icon: Settings,
            badge: null,
        },
    ];

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
            {/* =========================================================
                SIDEBAR NAVIGATION
               ========================================================= */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#050B17] text-slate-300 transition-transform duration-200 lg:static lg:translate-x-0 ${
                    mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Brand Header */}
                <div className="flex h-18 items-center justify-between border-b border-white/10 px-6">
                    <Link
                        href="/"
                        className="flex items-center gap-3 group"
                    >
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
                                <span className="rounded-md bg-[#00289a] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                    CMS
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                Super Admin Console
                            </p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMobileSidebarOpen(false)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Quick Live Status */}
                <div className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-semibold text-white">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Production Live
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                            v{cms.meta.version}
                        </span>
                    </div>
                </div>

                {/* Main Menu Items */}
                <nav className="mt-5 flex-1 space-y-1 px-3 overflow-y-auto">
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Content Management
                    </p>
                    {SIDEBAR_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    setActiveSection(item.id);
                                    setMobileSidebarOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                                    active
                                        ? "bg-[#00289a] text-white shadow-sm"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <Icon
                                        size={17}
                                        className={
                                            active
                                                ? "text-white"
                                                : "text-slate-400"
                                        }
                                    />
                                    <span>{item.label}</span>
                                </span>
                                {item.badge !== null && (
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                            active
                                                ? "bg-white/20 text-white"
                                                : "bg-white/5 text-slate-400"
                                        }`}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    {/* Direct Page Jump Shortcuts */}
                    <div className="pt-6">
                        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                            Quick Page Jump
                        </p>
                        <div className="space-y-0.5">
                            {Object.values(cms.pages).map((pg) => (
                                <button
                                    key={pg.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedPageKey(pg.id);
                                        setActiveSection("pages");
                                        setMobileSidebarOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-colors ${
                                        activeSection === "pages" &&
                                        selectedPageKey === pg.id
                                            ? "bg-white/10 font-bold text-white"
                                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                    }`}
                                >
                                    <span className="truncate">{pg.title}</span>
                                    <span className="font-mono text-[10px] text-slate-500">
                                        {pg.slug}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Bottom User / Exit */}
                <div className="border-t border-white/10 p-4 space-y-2">
                    <Link
                        href="/"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 px-3 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                        <ExternalLink size={14} />
                        <span>View Live Website</span>
                    </Link>
                    <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-sky-400" />
                            <span>{adminEmail}</span>
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-slate-400 hover:text-white cursor-pointer"
                            title="Sign out"
                        >
                            <LogOut size={14} />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* =========================================================
                MAIN WORKSPACE AREA
               ========================================================= */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Top Action Bar */}
                <header className="sticky top-0 z-30 flex h-18 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur-xs sm:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileSidebarOpen(true)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
                        >
                            <Menu size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-base font-black tracking-tight text-slate-950 sm:text-lg">
                                    {SIDEBAR_ITEMS.find(
                                        (i) => i.id === activeSection,
                                    )?.label || "Super Admin Dashboard"}
                                </h1>
                                {hasUnsavedChanges ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        Unsaved Edits
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                        <Check size={12} />
                                        Synced
                                    </span>
                                )}
                            </div>
                            <p className="hidden text-xs text-slate-500 sm:block">
                                Manage all copy, imagery, statistics, FAQs, and
                                navigation across the RAVU platform.
                            </p>
                        </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() =>
                                setShowLivePreview((prev) => !prev)
                            }
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                                showLivePreview
                                    ? "border-[#00289a] bg-[#00289a]/10 text-[#00289a]"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            <Eye size={15} />
                            <span className="hidden sm:inline">
                                {showLivePreview
                                    ? "Hide Preview"
                                    : "Live Preview"}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleExportJson}
                            className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            title="Export CMS JSON"
                        >
                            <Download size={15} />
                            <span>Export JSON</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleResetDefaults}
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                            title="Reset to default content"
                        >
                            <RotateCcw size={14} />
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveChanges}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00289a] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#001f78] active:scale-[0.98] transition-all"
                        >
                            <Save size={15} />
                            <span>Publish Changes</span>
                        </button>
                    </div>
                </header>

                {/* Main Content Body + Optional Split Live Preview */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-8">
                    <div
                        className={`mx-auto max-w-7xl grid gap-8 ${
                            showLivePreview
                                ? "xl:grid-cols-[1.2fr_0.8fr]"
                                : "grid-cols-1"
                        }`}
                    >
                        {/* Primary Editor Column */}
                        <div className="space-y-8 min-w-0">
                            {/* =================================================
                                1. OVERVIEW TAB
                               ================================================= */}
                            {activeSection === "overview" && (
                                <>
                                    {/* Top Welcome Banner */}
                                    <div className="relative overflow-hidden rounded-2xl bg-[#061023] p-6 text-white shadow-sm sm:p-8">
                                        <div className="pointer-events-none absolute inset-0 opacity-35">
                                            <img
                                                src={footerBg}
                                                alt=""
                                                className="h-full w-full object-cover object-right-top"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#061023] via-[#061023]/80 to-transparent" />
                                        </div>
                                        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                                            <div>
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-300">
                                                    <Sparkles size={12} />
                                                    RAVU Content Management System
                                                </span>
                                                <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                                                    Control every page, section &amp; metric.
                                                </h2>
                                                <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-300 sm:text-sm">
                                                    Edit headlines, store links, FAQs, partner categories, and community statistics across all 8 website pages from a single unified workspace.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-3 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPageKey("home");
                                                        setActiveSection("pages");
                                                    }}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-[#1864E8] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-600 transition-colors"
                                                >
                                                    <Edit3 size={14} />
                                                    <span>Edit Home Page</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveSection("community")
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition-colors"
                                                >
                                                    <TrendingUp size={14} />
                                                    <span>Update Stats</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4 KPI Summary Cards */}
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-slate-500">
                                                    Managed Website Pages
                                                </span>
                                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#00289a]">
                                                    <Layers size={18} />
                                                </span>
                                            </div>
                                            <p className="mt-3 text-3xl font-black text-slate-950">
                                                {Object.keys(cms.pages).length}
                                            </p>
                                            <p className="mt-1 text-xs text-emerald-600 font-semibold">
                                                100% Published &amp; Active
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-slate-500">
                                                    Public Rider Stat
                                                </span>
                                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1864E8]">
                                                    <Users size={18} />
                                                </span>
                                            </div>
                                            <p className="mt-3 text-3xl font-black text-slate-950">
                                                {cms.global.communityBanner.stats[0]?.value}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Displayed on Community Banner
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-slate-500">
                                                    Member &amp; Partner Leads
                                                </span>
                                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                                    <UserCheck size={18} />
                                                </span>
                                            </div>
                                            <p className="mt-3 text-3xl font-black text-slate-950">
                                                {cms.submissions.length}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {
                                                    cms.submissions.filter(
                                                        (s) =>
                                                            s.status ===
                                                            "Verified",
                                                    ).length
                                                }{" "}
                                                verified registrations
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-slate-500">
                                                    Media Assets &amp; FAQs
                                                </span>
                                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                                    <ImageIcon size={18} />
                                                </span>
                                            </div>
                                            <p className="mt-3 text-3xl font-black text-slate-950">
                                                {cms.mediaLibrary.length} /{" "}
                                                {cms.pages.support.faqs.length}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Images &amp; Published FAQs
                                            </p>
                                        </div>
                                    </div>

                                    {/* All Website Pages Quick Matrix */}
                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                            <div>
                                                <h3 className="text-base font-bold text-slate-950">
                                                    Website Pages Directory
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Select any page below to customize its hero, copy, cards, and SEO metadata.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveSection("pages")
                                                }
                                                className="text-xs font-bold text-[#00289a] hover:underline"
                                            >
                                                Open Page Editor →
                                            </button>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                            {Object.values(cms.pages).map(
                                                (page) => (
                                                    <div
                                                        key={page.id}
                                                        className="group flex flex-col justify-between rounded-xl border border-slate-200/80 p-4 hover:border-[#00289a] hover:shadow-xs transition-all"
                                                    >
                                                        <div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-mono text-[11px] font-semibold text-slate-400">
                                                                    {page.slug}
                                                                </span>
                                                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                                                    {page.status}
                                                                </span>
                                                            </div>
                                                            <h4 className="mt-2 text-sm font-bold text-slate-950 group-hover:text-[#00289a]">
                                                                {page.title}
                                                            </h4>
                                                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                                                {
                                                                    page.hero
                                                                        .description
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedPageKey(
                                                                        page.id,
                                                                    );
                                                                    setActiveSection(
                                                                        "pages",
                                                                    );
                                                                }}
                                                                className="inline-flex items-center gap-1 text-xs font-bold text-[#00289a] hover:underline"
                                                            >
                                                                <Edit3
                                                                    size={12}
                                                                />
                                                                <span>
                                                                    Edit Content
                                                                </span>
                                                            </button>
                                                            <Link
                                                                href={page.slug}
                                                                className="text-slate-400 hover:text-slate-700"
                                                                title="View live page"
                                                            >
                                                                <ExternalLink
                                                                    size={13}
                                                                />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom Grid: Recent Activity + Recent Submissions */}
                                    <div className="grid gap-6 lg:grid-cols-2">
                                        {/* Activity Log */}
                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                            <h3 className="text-base font-bold text-slate-950">
                                                Recent CMS Activity
                                            </h3>
                                            <div className="mt-4 space-y-3">
                                                {cms.activityLog.map((log) => (
                                                    <div
                                                        key={log.id}
                                                        className="flex items-start justify-between gap-3 rounded-xl bg-slate-50/80 p-3 text-xs"
                                                    >
                                                        <div className="flex items-start gap-2.5">
                                                            <Activity
                                                                size={15}
                                                                className="mt-0.5 shrink-0 text-[#00289a]"
                                                            />
                                                            <div>
                                                                <p className="font-semibold text-slate-900">
                                                                    {log.action}
                                                                </p>
                                                                <p className="mt-0.5 text-[11px] text-slate-500">
                                                                    {log.user} ·{" "}
                                                                    {
                                                                        log.category
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="shrink-0 text-[11px] text-slate-400">
                                                            {log.time}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Recent Leads */}
                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base font-bold text-slate-950">
                                                    Latest Member &amp; Partner Inquiries
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveSection(
                                                            "submissions",
                                                        )
                                                    }
                                                    className="text-xs font-bold text-[#00289a] hover:underline"
                                                >
                                                    View All →
                                                </button>
                                            </div>
                                            <div className="mt-4 divide-y divide-slate-100">
                                                {cms.submissions
                                                    .slice(0, 4)
                                                    .map((sub) => (
                                                        <div
                                                            key={sub.id}
                                                            className="flex items-center justify-between py-3 text-xs"
                                                        >
                                                            <div>
                                                                <p className="font-bold text-slate-900">
                                                                    {sub.name}
                                                                </p>
                                                                <p className="text-[11px] text-slate-500">
                                                                    {sub.type} ·{" "}
                                                                    {sub.city}
                                                                </p>
                                                            </div>
                                                            <span
                                                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                                    sub.status ===
                                                                    "Verified"
                                                                        ? "bg-emerald-50 text-emerald-700"
                                                                        : sub.status ===
                                                                            "In Review"
                                                                          ? "bg-blue-50 text-blue-700"
                                                                          : "bg-amber-50 text-amber-700"
                                                                }`}
                                                            >
                                                                {sub.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* =================================================
                                2. PAGE CONTENT EDITOR TAB
                               ================================================= */}
                            {activeSection === "pages" && currentPage && (
                                <div className="space-y-6">
                                    {/* Page Selector Pills */}
                                    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs">
                                        {Object.values(cms.pages).map((pg) => (
                                            <button
                                                key={pg.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedPageKey(pg.id)
                                                }
                                                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                                                    selectedPageKey === pg.id
                                                        ? "bg-[#00289a] text-white shadow-xs"
                                                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                                                }`}
                                            >
                                                {pg.title}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Page Metadata & SEO Bar */}
                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-lg font-black text-slate-950">
                                                        Editing:{" "}
                                                        {currentPage.title}
                                                    </h2>
                                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                                                        {currentPage.slug}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    Configure SEO metadata and hero banner content for this page.
                                                </p>
                                            </div>
                                            <Link
                                                href={currentPage.slug}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                            >
                                                <ExternalLink size={13} />
                                                <span>Open Live Page</span>
                                            </Link>
                                        </div>

                                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                    SEO Page Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={currentPage.seoTitle}
                                                    onChange={(e) =>
                                                        updateCms((prev) => ({
                                                            ...prev,
                                                            pages: {
                                                                ...prev.pages,
                                                                [selectedPageKey]:
                                                                    {
                                                                        ...prev
                                                                            .pages[
                                                                            selectedPageKey
                                                                        ],
                                                                        seoTitle:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    },
                                                            },
                                                        }))
                                                    }
                                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-[#00289a] focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                    Publish Status
                                                </label>
                                                <select
                                                    value={currentPage.status}
                                                    onChange={(e) =>
                                                        updateCms((prev) => ({
                                                            ...prev,
                                                            pages: {
                                                                ...prev.pages,
                                                                [selectedPageKey]:
                                                                    {
                                                                        ...prev
                                                                            .pages[
                                                                            selectedPageKey
                                                                        ],
                                                                        status: e
                                                                            .target
                                                                            .value,
                                                                    },
                                                            },
                                                        }))
                                                    }
                                                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#00289a] focus:outline-none"
                                                >
                                                    <option value="Published">
                                                        Published (Live)
                                                    </option>
                                                    <option value="Draft">
                                                        Draft
                                                    </option>
                                                    <option value="Maintenance">
                                                        Maintenance
                                                    </option>
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                    Meta Description
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={
                                                        currentPage.seoDescription
                                                    }
                                                    onChange={(e) =>
                                                        updateCms((prev) => ({
                                                            ...prev,
                                                            pages: {
                                                                ...prev.pages,
                                                                [selectedPageKey]:
                                                                    {
                                                                        ...prev
                                                                            .pages[
                                                                            selectedPageKey
                                                                        ],
                                                                        seoDescription:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    },
                                                            },
                                                        }))
                                                    }
                                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-[#00289a] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hero Section Editor (Universal for all pages) */}
                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                        <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
                                            Hero Section Content
                                        </h3>
                                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                    Eyebrow Text
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        currentPage.hero
                                                            .eyebrow || ""
                                                    }
                                                    onChange={(e) =>
                                                        updatePageField(
                                                            selectedPageKey,
                                                            "hero",
                                                            "eyebrow",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-[#00289a] focus:outline-none"
                                                />
                                            </div>

                                            {selectedPageKey === "home" ? (
                                                <>
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                            Headline (Main)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                currentPage.hero
                                                                    .headlinePart1
                                                            }
                                                            onChange={(e) =>
                                                                updatePageField(
                                                                    "home",
                                                                    "hero",
                                                                    "headlinePart1",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-900 focus:border-[#00289a] focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-[#1864E8]">
                                                            Headline (Blue Highlight)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                currentPage.hero
                                                                    .headlineHighlight
                                                            }
                                                            onChange={(e) =>
                                                                updatePageField(
                                                                    "home",
                                                                    "hero",
                                                                    "headlineHighlight",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="mt-1.5 w-full rounded-xl border border-blue-200 bg-blue-50/30 px-3.5 py-2 text-sm font-bold text-[#1864E8] focus:border-[#00289a] focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                            Community Social Proof Label
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                currentPage.hero
                                                                    .socialProofText
                                                            }
                                                            onChange={(e) =>
                                                                updatePageField(
                                                                    "home",
                                                                    "hero",
                                                                    "socialProofText",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-[#00289a] focus:outline-none"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                        Main Headline
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            currentPage.hero
                                                                .headline || ""
                                                        }
                                                        onChange={(e) =>
                                                            updatePageField(
                                                                selectedPageKey,
                                                                "hero",
                                                                "headline",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-900 focus:border-[#00289a] focus:outline-none"
                                                    />
                                                </div>
                                            )}

                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                    Hero Subtitle / Description
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={
                                                        currentPage.hero
                                                            .description || ""
                                                    }
                                                    onChange={(e) =>
                                                        updatePageField(
                                                            selectedPageKey,
                                                            "hero",
                                                            "description",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-[#00289a] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* HOME PAGE SPECIFIC: 3 Features Strip + App Showcase */}
                                    {selectedPageKey === "home" && (
                                        <>
                                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                                <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
                                                    Home 3-Feature Strip (Get moving · More value · Feel safe)
                                                </h3>
                                                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                                    {cms.pages.home.featuresStrip.map(
                                                        (feat, idx) => (
                                                            <div
                                                                key={feat.id}
                                                                className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50"
                                                            >
                                                                <span className="inline-block rounded-md bg-[#EBF3FE] px-2 py-0.5 text-[10px] font-bold text-[#1864E8]">
                                                                    Feature 0
                                                                    {idx + 1}
                                                                </span>
                                                                <div>
                                                                    <label className="block text-[11px] font-bold text-slate-600">
                                                                        Title
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            feat.title
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            const updated =
                                                                                [
                                                                                    ...cms
                                                                                        .pages
                                                                                        .home
                                                                                        .featuresStrip,
                                                                                ];
                                                                            updated[
                                                                                idx
                                                                            ] =
                                                                                {
                                                                                    ...feat,
                                                                                    title: e
                                                                                        .target
                                                                                        .value,
                                                                                };
                                                                            updatePageField(
                                                                                "home",
                                                                                "featuresStrip",
                                                                                null,
                                                                                updated,
                                                                            );
                                                                        }}
                                                                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[11px] font-bold text-slate-600">
                                                                        Description
                                                                    </label>
                                                                    <textarea
                                                                        rows={2}
                                                                        value={
                                                                            feat.description
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            const updated =
                                                                                [
                                                                                    ...cms
                                                                                        .pages
                                                                                        .home
                                                                                        .featuresStrip,
                                                                                ];
                                                                            updated[
                                                                                idx
                                                                            ] =
                                                                                {
                                                                                    ...feat,
                                                                                    description:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                };
                                                                            updatePageField(
                                                                                "home",
                                                                                "featuresStrip",
                                                                                null,
                                                                                updated,
                                                                            );
                                                                        }}
                                                                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                                <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
                                                    &ldquo;The RAVU App&rdquo; Map Showcase Section
                                                </h3>
                                                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                            Eyebrow
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                cms.pages.home
                                                                    .appShowcase
                                                                    .eyebrow
                                                            }
                                                            onChange={(e) =>
                                                                updatePageField(
                                                                    "home",
                                                                    "appShowcase",
                                                                    "eyebrow",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                            Headline Line 1
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                cms.pages.home
                                                                    .appShowcase
                                                                    .headlinePart1
                                                            }
                                                            onChange={(e) =>
                                                                updatePageField(
                                                                    "home",
                                                                    "appShowcase",
                                                                    "headlinePart1",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-900"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-[#1864E8]">
                                                            Headline Blue Highlight
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                cms.pages.home
                                                                    .appShowcase
                                                                    .headlineHighlight
                                                            }
                                                            onChange={(e) =>
                                                                updatePageField(
                                                                    "home",
                                                                    "appShowcase",
                                                                    "headlineHighlight",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="mt-1.5 w-full rounded-xl border border-blue-200 bg-blue-50/30 px-3.5 py-2 text-sm font-bold text-[#1864E8]"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-3">
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                            App Section Description
                                                        </label>
                                                        <textarea
                                                            rows={2}
                                                            value={
                                                                cms.pages.home
                                                                    .appShowcase
                                                                    .description
                                                            }
                                                            onChange={(e) =>
                                                                updatePageField(
                                                                    "home",
                                                                    "appShowcase",
                                                                    "description",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* DYNAMIC CARDS / STEPS EDITOR FOR OTHER PAGES */}
                                    {selectedPageKey === "about" && (
                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                            <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
                                                Core Values Cards
                                            </h3>
                                            <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                                {cms.pages.about.values.map(
                                                    (val, idx) => (
                                                        <div
                                                            key={val.id}
                                                            className="rounded-xl border border-slate-200 p-4 space-y-2.5 bg-slate-50/50"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={
                                                                    val.title
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const next =
                                                                        [
                                                                            ...cms
                                                                                .pages
                                                                                .about
                                                                                .values,
                                                                        ];
                                                                    next[idx] =
                                                                        {
                                                                            ...val,
                                                                            title: e
                                                                                .target
                                                                                .value,
                                                                        };
                                                                    updatePageField(
                                                                        "about",
                                                                        "values",
                                                                        null,
                                                                        next,
                                                                    );
                                                                }}
                                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                                                            />
                                                            <textarea
                                                                rows={3}
                                                                value={
                                                                    val.description
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const next =
                                                                        [
                                                                            ...cms
                                                                                .pages
                                                                                .about
                                                                                .values,
                                                                        ];
                                                                    next[idx] =
                                                                        {
                                                                            ...val,
                                                                            description:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        };
                                                                    updatePageField(
                                                                        "about",
                                                                        "values",
                                                                        null,
                                                                        next,
                                                                    );
                                                                }}
                                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {selectedPageKey === "partners" && (
                                        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                            <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
                                                Partner Sectors (6 Categories)
                                            </h3>
                                            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                {cms.pages.partners.sectors.map(
                                                    (sec, idx) => (
                                                        <div
                                                            key={sec.id}
                                                            className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50/50"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={
                                                                    sec.title
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const next =
                                                                        [
                                                                            ...cms
                                                                                .pages
                                                                                .partners
                                                                                .sectors,
                                                                        ];
                                                                    next[idx] =
                                                                        {
                                                                            ...sec,
                                                                            title: e
                                                                                .target
                                                                                .value,
                                                                        };
                                                                    updatePageField(
                                                                        "partners",
                                                                        "sectors",
                                                                        null,
                                                                        next,
                                                                    );
                                                                }}
                                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                                                            />
                                                            <textarea
                                                                rows={2}
                                                                value={
                                                                    sec.description
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const next =
                                                                        [
                                                                            ...cms
                                                                                .pages
                                                                                .partners
                                                                                .sectors,
                                                                        ];
                                                                    next[idx] =
                                                                        {
                                                                            ...sec,
                                                                            description:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        };
                                                                    updatePageField(
                                                                        "partners",
                                                                        "sectors",
                                                                        null,
                                                                        next,
                                                                    );
                                                                }}
                                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* =================================================
                                3. HEADER & FOOTER NAVIGATION TAB
                               ================================================= */}
                            {activeSection === "navigation" && (
                                <div className="space-y-6">
                                    {/* Top Navbar Manager */}
                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                        <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
                                            Primary Header Navigation Links
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Manage the links displayed in the top navigation bar across all pages.
                                        </p>

                                        <div className="mt-4 space-y-2.5">
                                            {cms.global.navigation.desktopLinks.map(
                                                (navItem, index) => (
                                                    <div
                                                        key={navItem.id}
                                                        className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                                                    >
                                                        <span className="font-mono text-xs font-bold text-slate-400 w-6">
                                                            0{index + 1}
                                                        </span>
                                                        <input
                                                            type="text"
                                                            value={
                                                                navItem.label
                                                            }
                                                            onChange={(e) => {
                                                                const list = [
                                                                    ...cms
                                                                        .global
                                                                        .navigation
                                                                        .desktopLinks,
                                                                ];
                                                                list[index] = {
                                                                    ...navItem,
                                                                    label: e
                                                                        .target
                                                                        .value,
                                                                };
                                                                updateCms(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        global: {
                                                                            ...prev.global,
                                                                            navigation:
                                                                                {
                                                                                    ...prev
                                                                                        .global
                                                                                        .navigation,
                                                                                    desktopLinks:
                                                                                        list,
                                                                                },
                                                                        },
                                                                    }),
                                                                );
                                                            }}
                                                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                                                            placeholder="Label"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={navItem.href}
                                                            onChange={(e) => {
                                                                const list = [
                                                                    ...cms
                                                                        .global
                                                                        .navigation
                                                                        .desktopLinks,
                                                                ];
                                                                list[index] = {
                                                                    ...navItem,
                                                                    href: e
                                                                        .target
                                                                        .value,
                                                                };
                                                                updateCms(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        global: {
                                                                            ...prev.global,
                                                                            navigation:
                                                                                {
                                                                                    ...prev
                                                                                        .global
                                                                                        .navigation,
                                                                                    desktopLinks:
                                                                                        list,
                                                                                },
                                                                        },
                                                                    }),
                                                                );
                                                            }}
                                                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-600"
                                                            placeholder="/route"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const list =
                                                                    cms.global.navigation.desktopLinks.filter(
                                                                        (i) =>
                                                                            i.id !==
                                                                            navItem.id,
                                                                    );
                                                                updateCms(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        global: {
                                                                            ...prev.global,
                                                                            navigation:
                                                                                {
                                                                                    ...prev
                                                                                        .global
                                                                                        .navigation,
                                                                                    desktopLinks:
                                                                                        list,
                                                                                },
                                                                        },
                                                                    }),
                                                                );
                                                            }}
                                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                                            title="Remove link"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        {/* Add New Nav Link */}
                                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                                            <input
                                                type="text"
                                                placeholder="New Link Label (e.g. Benefits)"
                                                value={newNavLabel}
                                                onChange={(e) =>
                                                    setNewNavLabel(
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                                            />
                                            <input
                                                type="text"
                                                placeholder="URL Path (e.g. /benefits)"
                                                value={newNavHref}
                                                onChange={(e) =>
                                                    setNewNavHref(
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs text-slate-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        !newNavLabel.trim() ||
                                                        !newNavHref.trim()
                                                    )
                                                        return;
                                                    updateCms((prev) => ({
                                                        ...prev,
                                                        global: {
                                                            ...prev.global,
                                                            navigation: {
                                                                ...prev.global
                                                                    .navigation,
                                                                desktopLinks: [
                                                                    ...prev
                                                                        .global
                                                                        .navigation
                                                                        .desktopLinks,
                                                                    {
                                                                        id: `nav-${Date.now()}`,
                                                                        label: newNavLabel.trim(),
                                                                        href: newNavHref.trim(),
                                                                        visible: true,
                                                                    },
                                                                ],
                                                            },
                                                        },
                                                    }));
                                                    setNewNavLabel("");
                                                    setNewNavHref("");
                                                    toast.success(
                                                        "Added navigation link.",
                                                    );
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                                            >
                                                <Plus size={14} />
                                                <span>Add Link</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Footer Socials & Tagline */}
                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                        <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
                                            Global Footer &amp; Social Channels
                                        </h3>
                                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                    Footer Brand Tagline
                                                </label>
                                                <input
                                                    type="text"
                                                    value={cms.global.tagline}
                                                    onChange={(e) =>
                                                        updateCms((prev) => ({
                                                            ...prev,
                                                            global: {
                                                                ...prev.global,
                                                                tagline:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        }))
                                                    }
                                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                    Copyright Notice
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        cms.global.footer
                                                            .copyright
                                                    }
                                                    onChange={(e) =>
                                                        updateCms((prev) => ({
                                                            ...prev,
                                                            global: {
                                                                ...prev.global,
                                                                footer: {
                                                                    ...prev
                                                                        .global
                                                                        .footer,
                                                                    copyright:
                                                                        e.target
                                                                            .value,
                                                                },
                                                            },
                                                        }))
                                                    }
                                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                                                Social Media Links
                                            </label>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {cms.global.footer.socials.map(
                                                    (soc, idx) => (
                                                        <div
                                                            key={soc.id}
                                                            className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5"
                                                        >
                                                            <span className="w-24 text-xs font-bold text-slate-700">
                                                                {soc.platform}
                                                            </span>
                                                            <input
                                                                type="text"
                                                                value={soc.url}
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const next =
                                                                        [
                                                                            ...cms
                                                                                .global
                                                                                .footer
                                                                                .socials,
                                                                        ];
                                                                    next[idx] =
                                                                        {
                                                                            ...soc,
                                                                            url: e
                                                                                .target
                                                                                .value,
                                                                        };
                                                                    updateCms(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            global: {
                                                                                ...prev.global,
                                                                                footer: {
                                                                                    ...prev
                                                                                        .global
                                                                                        .footer,
                                                                                    socials:
                                                                                        next,
                                                                                },
                                                                            },
                                                                        }),
                                                                    );
                                                                }}
                                                                className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600"
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                4. COMMUNITY BANNER & STATS TAB
                               ================================================= */}
                            {activeSection === "community" && (
                                <div className="space-y-6">
                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                        <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
                                            Shared City Skyline Banner &amp; Community KPIs
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-500">
                                            This section appears directly above the footer across all 8 marketing pages.
                                        </p>

                                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                    Eyebrow
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        cms.global
                                                            .communityBanner
                                                            .eyebrow
                                                    }
                                                    onChange={(e) =>
                                                        updateCms((prev) => ({
                                                            ...prev,
                                                            global: {
                                                                ...prev.global,
                                                                communityBanner:
                                                                    {
                                                                        ...prev
                                                                            .global
                                                                            .communityBanner,
                                                                        eyebrow:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    },
                                                            },
                                                        }))
                                                    }
                                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                    Heading Line 1
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        cms.global
                                                            .communityBanner
                                                            .titleLine1
                                                    }
                                                    onChange={(e) =>
                                                        updateCms((prev) => ({
                                                            ...prev,
                                                            global: {
                                                                ...prev.global,
                                                                communityBanner:
                                                                    {
                                                                        ...prev
                                                                            .global
                                                                            .communityBanner,
                                                                        titleLine1:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    },
                                                            },
                                                        }))
                                                    }
                                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                    Heading Line 2
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        cms.global
                                                            .communityBanner
                                                            .titleLine2
                                                    }
                                                    onChange={(e) =>
                                                        updateCms((prev) => ({
                                                            ...prev,
                                                            global: {
                                                                ...prev.global,
                                                                communityBanner:
                                                                    {
                                                                        ...prev
                                                                            .global
                                                                            .communityBanner,
                                                                        titleLine2:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    },
                                                            },
                                                        }))
                                                    }
                                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-900"
                                                />
                                            </div>
                                            <div className="sm:col-span-3">
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                    Description Copy
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={
                                                        cms.global
                                                            .communityBanner
                                                            .description
                                                    }
                                                    onChange={(e) =>
                                                        updateCms((prev) => ({
                                                            ...prev,
                                                            global: {
                                                                ...prev.global,
                                                                communityBanner:
                                                                    {
                                                                        ...prev
                                                                            .global
                                                                            .communityBanner,
                                                                        description:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    },
                                                            },
                                                        }))
                                                    }
                                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900"
                                                />
                                            </div>
                                        </div>

                                        {/* 4 Counter Editors */}
                                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            {cms.global.communityBanner.stats.map(
                                                (stat, idx) => (
                                                    <div
                                                        key={stat.id}
                                                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5"
                                                    >
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#00289a]">
                                                            Metric 0{idx + 1}
                                                        </span>
                                                        <div>
                                                            <label className="block text-[11px] font-semibold text-slate-500">
                                                                Number / Value
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    stat.value
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const next =
                                                                        [
                                                                            ...cms
                                                                                .global
                                                                                .communityBanner
                                                                                .stats,
                                                                        ];
                                                                    next[idx] =
                                                                        {
                                                                            ...stat,
                                                                            value: e
                                                                                .target
                                                                                .value,
                                                                        };
                                                                    updateCms(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            global: {
                                                                                ...prev.global,
                                                                                communityBanner:
                                                                                    {
                                                                                        ...prev
                                                                                            .global
                                                                                            .communityBanner,
                                                                                        stats: next,
                                                                                    },
                                                                            },
                                                                        }),
                                                                    );
                                                                }}
                                                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-lg font-black text-slate-950"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] font-semibold text-slate-500">
                                                                Label
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    stat.label
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const next =
                                                                        [
                                                                            ...cms
                                                                                .global
                                                                                .communityBanner
                                                                                .stats,
                                                                        ];
                                                                    next[idx] =
                                                                        {
                                                                            ...stat,
                                                                            label: e
                                                                                .target
                                                                                .value,
                                                                        };
                                                                    updateCms(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            global: {
                                                                                ...prev.global,
                                                                                communityBanner:
                                                                                    {
                                                                                        ...prev
                                                                                            .global
                                                                                            .communityBanner,
                                                                                        stats: next,
                                                                                    },
                                                                            },
                                                                        }),
                                                                    );
                                                                }}
                                                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                                                            />
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                5. SUPPORT & FAQ MANAGER TAB
                               ================================================= */}
                            {activeSection === "faqs" && (
                                <div className="space-y-6">
                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                        <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
                                            Frequently Asked Questions Manager
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Add, edit, or remove FAQ items displayed on the Support page.
                                        </p>

                                        <div className="mt-5 space-y-4">
                                            {cms.pages.support.faqs.map(
                                                (faq, idx) => (
                                                    <div
                                                        key={faq.id}
                                                        className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="rounded-md bg-[#00289a]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#00289a]">
                                                                Q0{idx + 1}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const next =
                                                                        cms.pages.support.faqs.filter(
                                                                            (
                                                                                f,
                                                                            ) =>
                                                                                f.id !==
                                                                                faq.id,
                                                                        );
                                                                    updatePageField(
                                                                        "support",
                                                                        "faqs",
                                                                        null,
                                                                        next,
                                                                    );
                                                                    toast.success(
                                                                        "Removed FAQ item.",
                                                                    );
                                                                }}
                                                                className="text-slate-400 hover:text-rose-600"
                                                            >
                                                                <Trash2
                                                                    size={15}
                                                                />
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={faq.question}
                                                            onChange={(e) => {
                                                                const next = [
                                                                    ...cms.pages
                                                                        .support
                                                                        .faqs,
                                                                ];
                                                                next[idx] = {
                                                                    ...faq,
                                                                    question:
                                                                        e.target
                                                                            .value,
                                                                };
                                                                updatePageField(
                                                                    "support",
                                                                    "faqs",
                                                                    null,
                                                                    next,
                                                                );
                                                            }}
                                                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-950"
                                                        />
                                                        <textarea
                                                            rows={3}
                                                            value={faq.answer}
                                                            onChange={(e) => {
                                                                const next = [
                                                                    ...cms.pages
                                                                        .support
                                                                        .faqs,
                                                                ];
                                                                next[idx] = {
                                                                    ...faq,
                                                                    answer: e
                                                                        .target
                                                                        .value,
                                                                };
                                                                updatePageField(
                                                                    "support",
                                                                    "faqs",
                                                                    null,
                                                                    next,
                                                                );
                                                            }}
                                                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs leading-relaxed text-slate-700"
                                                        />
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        {/* Add New FAQ */}
                                        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/40 p-5 space-y-3">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                                + Add New FAQ Item
                                            </h4>
                                            <input
                                                type="text"
                                                placeholder="Enter question (e.g. When will the RAVU app be available?)"
                                                value={newFaqQuestion}
                                                onChange={(e) =>
                                                    setNewFaqQuestion(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900"
                                            />
                                            <textarea
                                                rows={2}
                                                placeholder="Enter detailed answer..."
                                                value={newFaqAnswer}
                                                onChange={(e) =>
                                                    setNewFaqAnswer(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        !newFaqQuestion.trim() ||
                                                        !newFaqAnswer.trim()
                                                    )
                                                        return;
                                                    const next = [
                                                        ...cms.pages.support
                                                            .faqs,
                                                        {
                                                            id: `faq-${Date.now()}`,
                                                            question:
                                                                newFaqQuestion.trim(),
                                                            answer: newFaqAnswer.trim(),
                                                            published: true,
                                                        },
                                                    ];
                                                    updatePageField(
                                                        "support",
                                                        "faqs",
                                                        null,
                                                        next,
                                                    );
                                                    setNewFaqQuestion("");
                                                    setNewFaqAnswer("");
                                                    toast.success(
                                                        "New FAQ added!",
                                                    );
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#00289a] px-4 py-2 text-xs font-bold text-white hover:bg-[#001f78]"
                                            >
                                                <Plus size={14} />
                                                <span>Add FAQ to Support Page</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                6. MEDIA LIBRARY & BRAND ASSETS TAB
                               ================================================= */}
                            {activeSection === "media" && (
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-950">
                                                Website Media &amp; Brand Assets Library
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Manage alt text, inspect image resolutions, and review where each asset is deployed.
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                            {cms.mediaLibrary.length} Active Assets
                                        </span>
                                    </div>

                                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {cms.mediaLibrary.map((asset, idx) => (
                                            <div
                                                key={asset.id}
                                                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 flex items-center justify-center p-2">
                                                        <img
                                                            src={asset.src}
                                                            alt={asset.alt}
                                                            className="max-h-full max-w-full object-contain"
                                                        />
                                                        <span className="absolute top-2.5 right-2.5 rounded-md bg-black/70 px-2 py-0.5 font-mono text-[10px] font-semibold text-white backdrop-blur-xs">
                                                            {asset.size}
                                                        </span>
                                                    </div>
                                                    <div className="p-4">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-sm font-bold text-slate-950">
                                                                {asset.label}
                                                            </h4>
                                                            <span className="font-mono text-[10px] text-slate-400">
                                                                {asset.name}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-[11px] font-medium text-[#00289a]">
                                                            Used in:{" "}
                                                            {asset.usedIn}
                                                        </p>
                                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                                            Resolution:{" "}
                                                            {asset.dimensions}
                                                        </p>

                                                        <div className="mt-3">
                                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                                Accessibility Alt Text
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    asset.alt
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const next =
                                                                        [
                                                                            ...cms.mediaLibrary,
                                                                        ];
                                                                    next[idx] =
                                                                        {
                                                                            ...asset,
                                                                            alt: e
                                                                                .target
                                                                                .value,
                                                                        };
                                                                    updateCms(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            mediaLibrary:
                                                                                next,
                                                                        }),
                                                                    );
                                                                }}
                                                                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                7. SUBMISSIONS & LEADS MANAGER TAB
                               ================================================= */}
                            {activeSection === "submissions" && (
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-950">
                                                Member Registrations &amp; Partner Inquiries
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Review and manage interest registrations from riders, drivers, and commercial partners.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="relative">
                                                <Search
                                                    size={14}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Search name, city..."
                                                    value={searchQuery}
                                                    onChange={(e) =>
                                                        setSearchQuery(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="rounded-xl border border-slate-200 py-1.5 pr-3 pl-8 text-xs text-slate-900 focus:border-[#00289a] focus:outline-none"
                                                />
                                            </div>
                                            <select
                                                value={submissionFilter}
                                                onChange={(e) =>
                                                    setSubmissionFilter(
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                                            >
                                                <option value="All">
                                                    All Statuses
                                                </option>
                                                <option value="Verified">
                                                    Verified
                                                </option>
                                                <option value="In Review">
                                                    In Review
                                                </option>
                                                <option value="Pending">
                                                    Pending
                                                </option>
                                                <option value="Contacted">
                                                    Contacted
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-4 overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                    <th className="py-3 px-3">
                                                        ID
                                                    </th>
                                                    <th className="py-3 px-3">
                                                        Applicant / Organisation
                                                    </th>
                                                    <th className="py-3 px-3">
                                                        Category
                                                    </th>
                                                    <th className="py-3 px-3">
                                                        City
                                                    </th>
                                                    <th className="py-3 px-3">
                                                        Status
                                                    </th>
                                                    <th className="py-3 px-3 text-right">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-xs">
                                                {filteredSubmissions.map(
                                                    (sub) => (
                                                        <tr
                                                            key={sub.id}
                                                            className="hover:bg-slate-50/80"
                                                        >
                                                            <td className="py-3.5 px-3 font-mono font-semibold text-slate-500">
                                                                {sub.id}
                                                            </td>
                                                            <td className="py-3.5 px-3">
                                                                <p className="font-bold text-slate-950">
                                                                    {sub.name}
                                                                </p>
                                                                <p className="text-[11px] text-slate-500">
                                                                    {
                                                                        sub.contact
                                                                    }
                                                                </p>
                                                            </td>
                                                            <td className="py-3.5 px-3 font-medium text-slate-700">
                                                                {sub.type}
                                                            </td>
                                                            <td className="py-3.5 px-3 text-slate-600">
                                                                {sub.city}
                                                            </td>
                                                            <td className="py-3.5 px-3">
                                                                <select
                                                                    value={
                                                                        sub.status
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const next =
                                                                            cms.submissions.map(
                                                                                (
                                                                                    item,
                                                                                ) =>
                                                                                    item.id ===
                                                                                    sub.id
                                                                                        ? {
                                                                                              ...item,
                                                                                              status: e
                                                                                                  .target
                                                                                                  .value,
                                                                                          }
                                                                                        : item,
                                                                            );
                                                                        updateCms(
                                                                            (
                                                                                prev,
                                                                            ) => ({
                                                                                ...prev,
                                                                                submissions:
                                                                                    next,
                                                                            }),
                                                                        );
                                                                        toast.success(
                                                                            `Updated ${sub.name} status to ${e.target.value}`,
                                                                        );
                                                                    }}
                                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold border-0 cursor-pointer ${
                                                                        sub.status ===
                                                                        "Verified"
                                                                            ? "bg-emerald-50 text-emerald-700"
                                                                            : sub.status ===
                                                                                "In Review"
                                                                              ? "bg-blue-50 text-blue-700"
                                                                              : "bg-amber-50 text-amber-700"
                                                                    }`}
                                                                >
                                                                    <option value="Verified">
                                                                        Verified
                                                                    </option>
                                                                    <option value="In Review">
                                                                        In Review
                                                                    </option>
                                                                    <option value="Contacted">
                                                                        Contacted
                                                                    </option>
                                                                    <option value="Pending">
                                                                        Pending
                                                                    </option>
                                                                </select>
                                                            </td>
                                                            <td className="py-3.5 px-3 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const next =
                                                                            cms.submissions.filter(
                                                                                (
                                                                                    i,
                                                                                ) =>
                                                                                    i.id !==
                                                                                    sub.id,
                                                                            );
                                                                        updateCms(
                                                                            (
                                                                                prev,
                                                                            ) => ({
                                                                                ...prev,
                                                                                submissions:
                                                                                    next,
                                                                            }),
                                                                        );
                                                                        toast.success(
                                                                            "Archived entry.",
                                                                        );
                                                                    }}
                                                                    className="text-slate-400 hover:text-rose-600 p-1"
                                                                    title="Delete entry"
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                8. GLOBAL & SEO SETTINGS TAB
                               ================================================= */}
                            {activeSection === "settings" && (
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
                                    <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
                                        Brand Identity, Store Links &amp; Contact Settings
                                    </h3>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                Site Brand Name
                                            </label>
                                            <input
                                                type="text"
                                                value={cms.global.siteName}
                                                onChange={(e) =>
                                                    updateCms((prev) => ({
                                                        ...prev,
                                                        global: {
                                                            ...prev.global,
                                                            siteName:
                                                                e.target.value,
                                                        },
                                                    }))
                                                }
                                                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                Headquarters Location
                                            </label>
                                            <input
                                                type="text"
                                                value={cms.global.headquarters}
                                                onChange={(e) =>
                                                    updateCms((prev) => ({
                                                        ...prev,
                                                        global: {
                                                            ...prev.global,
                                                            headquarters:
                                                                e.target.value,
                                                        },
                                                    }))
                                                }
                                                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                Apple App Store Download Link
                                            </label>
                                            <input
                                                type="text"
                                                value={cms.global.appStoreUrl}
                                                onChange={(e) =>
                                                    updateCms((prev) => ({
                                                        ...prev,
                                                        global: {
                                                            ...prev.global,
                                                            appStoreUrl:
                                                                e.target.value,
                                                        },
                                                    }))
                                                }
                                                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 font-mono text-xs text-slate-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                Google Play Store Download Link
                                            </label>
                                            <input
                                                type="text"
                                                value={cms.global.googlePlayUrl}
                                                onChange={(e) =>
                                                    updateCms((prev) => ({
                                                        ...prev,
                                                        global: {
                                                            ...prev.global,
                                                            googlePlayUrl:
                                                                e.target.value,
                                                        },
                                                    }))
                                                }
                                                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 font-mono text-xs text-slate-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                Primary Brand Color (Logo Match)
                                            </label>
                                            <div className="mt-1.5 flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={
                                                        cms.global.primaryColor
                                                    }
                                                    onChange={(e) =>
                                                        updateCms((prev) => ({
                                                            ...prev,
                                                            global: {
                                                                ...prev.global,
                                                                primaryColor:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        }))
                                                    }
                                                    className="h-9 w-12 rounded cursor-pointer border border-slate-200"
                                                />
                                                <input
                                                    type="text"
                                                    value={
                                                        cms.global.primaryColor
                                                    }
                                                    onChange={(e) =>
                                                        updateCms((prev) => ({
                                                            ...prev,
                                                            global: {
                                                                ...prev.global,
                                                                primaryColor:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        }))
                                                    }
                                                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs text-slate-800"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                                Support Contact Email
                                            </label>
                                            <input
                                                type="email"
                                                value={cms.global.contactEmail}
                                                onChange={(e) =>
                                                    updateCms((prev) => ({
                                                        ...prev,
                                                        global: {
                                                            ...prev.global,
                                                            contactEmail:
                                                                e.target.value,
                                                        },
                                                    }))
                                                }
                                                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* =====================================================
                            LIVE INTERACTIVE PREVIEW PANEL (WHEN TOGGLED ON)
                           ===================================================== */}
                        {showLivePreview && (
                            <div className="space-y-4">
                                <div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                    {/* Browser Mockup Top Bar */}
                                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-2.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                        </div>
                                        <span className="rounded-md bg-white px-3 py-0.5 font-mono text-[11px] text-slate-500 shadow-2xs">
                                            ravu.co.tz
                                            {currentPage?.slug || "/"}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#00289a]">
                                            Live Preview
                                        </span>
                                    </div>

                                    {/* Mini Live Render of Home / Selected Content */}
                                    <div className="max-h-[calc(100vh-12rem)] overflow-y-auto bg-white">
                                        {/* Mini Navbar */}
                                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                                            <div className="flex items-center gap-1.5">
                                                <img
                                                    src={logoImg}
                                                    alt=""
                                                    className="h-5 w-5 rounded-full"
                                                />
                                                <span className="text-xs font-black text-slate-950">
                                                    {cms.global.siteName}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                                                {cms.global.navigation.desktopLinks.map(
                                                    (l) => (
                                                        <span key={l.id}>
                                                            {l.label}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                            <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[9px] font-bold text-white">
                                                {
                                                    cms.global.navigation
                                                        .ctaPrimaryLabel
                                                }
                                            </span>
                                        </div>

                                        {/* Mini Hero Render */}
                                        <div className="px-5 pt-6 pb-4 text-center">
                                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                                {cms.pages.home.hero.eyebrow}
                                            </p>
                                            <h4 className="mt-1.5 text-xl font-black text-slate-950">
                                                {
                                                    cms.pages.home.hero
                                                        .headlinePart1
                                                }{" "}
                                                <span className="text-[#1864E8]">
                                                    {
                                                        cms.pages.home.hero
                                                            .headlineHighlight
                                                    }
                                                </span>
                                            </h4>
                                            <p className="mx-auto mt-1.5 max-w-xs text-[11px] leading-relaxed text-slate-500">
                                                {
                                                    cms.pages.home.hero
                                                        .description
                                                }
                                            </p>
                                        </div>

                                        <img
                                            src={headerImg}
                                            alt=""
                                            className="w-full h-auto"
                                        />

                                        {/* Mini 3 Features */}
                                        <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 py-3 px-2 text-center">
                                            {cms.pages.home.featuresStrip.map(
                                                (f) => (
                                                    <div
                                                        key={f.id}
                                                        className="px-1.5"
                                                    >
                                                        <p className="text-[10px] font-bold text-slate-900">
                                                            {f.title}
                                                        </p>
                                                        <p className="text-[9px] text-slate-500 line-clamp-2">
                                                            {f.description}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        {/* Mini Community Banner */}
                                        <div className="relative bg-[#061023] p-5 text-white overflow-hidden">
                                            <img
                                                src={footerBg}
                                                alt=""
                                                className="absolute inset-0 h-full w-full object-cover opacity-50"
                                            />
                                            <div className="relative">
                                                <p className="text-[8px] font-bold uppercase tracking-widest text-sky-400">
                                                    {
                                                        cms.global
                                                            .communityBanner
                                                            .eyebrow
                                                    }
                                                </p>
                                                <p className="mt-1 text-sm font-black leading-tight">
                                                    {
                                                        cms.global
                                                            .communityBanner
                                                            .titleLine1
                                                    }
                                                    <br />
                                                    {
                                                        cms.global
                                                            .communityBanner
                                                            .titleLine2
                                                    }
                                                </p>
                                                <div className="mt-4 grid grid-cols-4 gap-2 border-t border-white/15 pt-3">
                                                    {cms.global.communityBanner.stats.map(
                                                        (s) => (
                                                            <div key={s.id}>
                                                                <p className="text-xs font-black">
                                                                    {s.value}
                                                                </p>
                                                                <p className="text-[8px] text-slate-300">
                                                                    {s.label}
                                                                </p>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

