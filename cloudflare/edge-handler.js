import { BUILD_META } from "./build-meta.js";

/**
 * Cloudflare edge fallback — used only when the Laravel backend
 * (BACKEND_URL) is not configured or not reachable.
 *
 * Public marketing pages are rendered from the bundled default content so the
 * site stays up. Anything that needs an account (sign-in, registration, the
 * partner portal, partner review and the Super Admin CMS) is never handled
 * here: authentication lives exclusively in Laravel. Visitors are sent to the
 * sign-in page with a "temporarily unavailable" notice instead.
 */

const UNAVAILABLE =
    "Sign-in and partner registration are temporarily unavailable. Please try again shortly.";

// Cookies set by the former edge demo-auth implementation; cleared on sight.
const LEGACY_COOKIES = ["ravu_session", "ravu_registered_partners", "ravu_google_oauth_state"];

const ACCOUNT_PREFIXES = [
    "/super-admin",
    "/admin",
    "/partner-dashboard",
    "/partner-portal",
    "/partner-management",
    "/partner/",
    "/auth/",
    "/email/",
    "/password/",
    "/logout",
];

const ROUTE_MAP = {
    "/": {
        component: "Website/Home",
        title: "RAVU — Move further together | Mobility Ecosystem Tanzania",
        description:
            "RAVU is a membership-based mobility ecosystem connecting people, businesses, services and technology to make mobility work better.",
    },
    "/about-ravu": {
        component: "Website/AboutRavu",
        title: "About RAVU — Connected Mobility Ecosystem",
        description:
            "RAVU is building a membership-based mobility ecosystem around the riders, drivers, owners, partners and communities.",
    },
    "/for-riders": {
        component: "Website/ForRiders",
        title: "For Riders & Drivers — RAVU App & Membership",
        description:
            "The RAVU app is the starting point for riders and drivers to access membership, support and partner benefits.",
    },
    "/membership": {
        component: "Website/Membership",
        title: "RAVU Membership — Join. Save. Earn.",
        description:
            "A RAVU membership connects you to a growing ecosystem of support, benefits and community built around your mobility journey.",
    },
    "/benefits": {
        component: "Website/Benefits",
        title: "Member Benefits — RAVU Ecosystem",
        description:
            "Discover savings, financial access, protection, maintenance and community support through RAVU membership.",
    },
    "/partners": {
        component: "Website/Partners",
        title: "Partner With RAVU — Commercial & Ecosystem Partnerships",
        description:
            "Connect your organisation with an active mobility community across hospitality, insurance, banking, workshops and technology.",
    },
    "/how-it-works": {
        component: "Website/How_It_Works",
        title: "How RAVU Works — Step-by-Step Guide",
        description:
            "A clear route into a connected mobility ecosystem for members and organisations.",
    },
    "/support": {
        component: "Website/Support",
        title: "Help & Support — RAVU",
        description:
            "Find answers to common questions about RAVU membership, the mobile app, and partnering with our ecosystem.",
    },
    "/login": {
        component: "Website/Login",
        title: "Sign In — RAVU Partner & Admin Portal",
        description:
            "Sign in to your RAVU Partner Dashboard or Super Admin CMS.",
    },
    "/register": {
        component: "Website/Register",
        title: "Register as a Partner — RAVU",
        description:
            "Create your RAVU Partner Portal account to connect your business with verified riders and drivers across Tanzania.",
    },
};

function parseCookies(cookieHeader) {
    const out = {};
    for (const part of String(cookieHeader || "").split(";")) {
        const index = part.indexOf("=");
        if (index === -1) continue;
        const key = part.slice(0, index).trim();
        if (key) out[key] = part.slice(index + 1).trim();
    }
    return out;
}

function expireLegacyCookies(cookies, isSecure) {
    return LEGACY_COOKIES.filter((name) => name in cookies).map(
        (name) =>
            `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${isSecure ? "; Secure" : ""}`,
    );
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderHtmlDocument(page, meta = {}) {
    const title = meta.title || "RAVU — A membership-based mobility ecosystem";
    const description =
        meta.description ||
        "RAVU is a membership-based mobility ecosystem connecting people, businesses, services and technology to make mobility work better.";
    const pageJson = escapeHtml(JSON.stringify(page));

    const cssLinks = (BUILD_META.cssFiles || [])
        .map(
            (css) =>
                `    <link rel="stylesheet" href="/build/${css.replace(/^\/+/, "")}">`,
        )
        .join("\n");

    const jsSrc = `/build/${(BUILD_META.jsFile || "assets/app.js").replace(/^\/+/, "")}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>${escapeHtml(title)}</title>
    <meta inertia name="description" content="${escapeHtml(description)}">
    <meta name="theme-color" content="#020617">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900&display=swap" rel="stylesheet">
${cssLinks}
    <script type="module" src="${jsSrc}"></script>
</head>
<body class="antialiased">
    <div id="app" data-page="${pageJson}"></div>
</body>
</html>`;
}

function createInertiaOrHtmlResponse(
    request,
    {
        component,
        props,
        url,
        meta,
        status = 200,
        cookies = [],
    },
) {
    const page = {
        component,
        props: {
            errors: {},
            ...props,
        },
        url,
        version: BUILD_META.version || "ravu-cf-v1",
    };

    const isInertia =
        request.headers.get("X-Inertia") === "true" ||
        request.headers.get("x-inertia") === "true";

    const headers = new Headers();
    for (const c of cookies) {
        headers.append("Set-Cookie", c);
    }

    if (isInertia) {
        headers.set("Content-Type", "application/json; charset=utf-8");
        headers.set("X-Inertia", "true");
        headers.set("Vary", "X-Inertia");
        return new Response(JSON.stringify(page), { status, headers });
    }

    headers.set("Content-Type", "text/html; charset=utf-8");
    headers.set("Vary", "X-Inertia");
    return new Response(renderHtmlDocument(page, meta), { status, headers });
}

function isAccountPath(pathname) {
    return ACCOUNT_PREFIXES.some(
        (prefix) => pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`),
    );
}

function sharedProps({ errors = {}, flashError = null } = {}) {
    return {
        errors,
        auth: { user: null, rememberedProfile: null, googleEnabled: false },
        flash: { success: null, error: flashError },
        categories: [],
        policyLinks: { terms: "#terms", privacy: "#privacy" },
    };
}

export async function handleEdgeRequest(request) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const isSecure = url.protocol === "https:";
    const cookies = expireLegacyCookies(
        parseCookies(request.headers.get("Cookie") || ""),
        isSecure,
    );

    const pathname =
        url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;

    // Form submissions need the backend; answer with a friendly error on the form's page.
    if (method !== "GET" && method !== "HEAD") {
        const key = pathname === "/register" ? "/register" : "/login";
        return createInertiaOrHtmlResponse(request, {
            component: ROUTE_MAP[key].component,
            url: key,
            meta: ROUTE_MAP[key],
            props: sharedProps({ errors: { email: UNAVAILABLE } }),
            cookies,
        });
    }

    if (isAccountPath(pathname)) {
        const headers = new Headers({ Location: "/login" });
        for (const c of cookies) headers.append("Set-Cookie", c);
        return new Response(null, { status: 302, headers });
    }

    const route = ROUTE_MAP[pathname];
    const isAuthPage = pathname === "/login" || pathname === "/register";

    return createInertiaOrHtmlResponse(request, {
        component: (route || ROUTE_MAP["/"]).component,
        url: route ? pathname + url.search : "/",
        meta: route || ROUTE_MAP["/"],
        props: sharedProps({ flashError: isAuthPage ? UNAVAILABLE : null }),
        status: route ? 200 : 404,
        cookies,
    });
}
