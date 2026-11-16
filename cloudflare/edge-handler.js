import { BUILD_META } from "./build-meta.js";

const SESSION_COOKIE = "ravu_session";
const PROFILE_COOKIE = "ravu_last_profile";
const PARTNERS_COOKIE = "ravu_registered_partners";
const OAUTH_STATE_COOKIE = "ravu_google_oauth_state";
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

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
    "/super-admin": {
        component: "Website/SuperAdminDashboard",
        title: "Super Admin CMS — RAVU",
        description: "RAVU Super Admin Content Management System.",
        defaultUser: {
            id: 1,
            name: "Jux (Super Admin)",
            email: "jux@ravu.com",
            role: "super_admin",
        },
    },
    "/admin": {
        component: "Website/SuperAdminDashboard",
        title: "Super Admin CMS — RAVU",
        description: "RAVU Super Admin Content Management System.",
        defaultUser: {
            id: 1,
            name: "Jux (Super Admin)",
            email: "jux@ravu.com",
            role: "super_admin",
        },
    },
    "/partner-dashboard": {
        component: "Website/PartnerDashboard",
        title: "Partner Dashboard — RAVU",
        description: "RAVU Business Partner Portal & Member Verification.",
        defaultUser: {
            id: 2,
            name: "Chid (TotalEnergies Partner)",
            email: "chid@total.com",
            role: "partner",
            category: "Fuel & Energy Station",
            phone: "+255 754 200 100",
        },
    },
    "/partner-portal": {
        component: "Website/PartnerDashboard",
        title: "Partner Dashboard — RAVU",
        description: "RAVU Business Partner Portal & Member Verification.",
        defaultUser: {
            id: 2,
            name: "Chid (TotalEnergies Partner)",
            email: "chid@total.com",
            role: "partner",
            category: "Fuel & Energy Station",
            phone: "+255 754 200 100",
        },
    },
};

function parseCookies(cookieHeader) {
    const out = {};
    if (!cookieHeader) return out;
    for (const part of cookieHeader.split(";")) {
        const idx = part.indexOf("=");
        if (idx === -1) continue;
        const key = part.slice(0, idx).trim();
        const rawVal = part.slice(idx + 1).trim();
        try {
            out[key] = decodeURIComponent(rawVal);
        } catch {
            out[key] = rawVal;
        }
    }
    return out;
}

function readJsonCookie(cookies, name) {
    const raw = cookies[name];
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        try {
            return JSON.parse(atob(raw));
        } catch {
            return null;
        }
    }
}

function serializeCookie(name, value, options = {}) {
    const encoded = encodeURIComponent(
        typeof value === "string" ? value : JSON.stringify(value),
    );
    const parts = [`${name}=${encoded}`];
    parts.push(`Path=${options.path || "/"}`);
    if (options.maxAge !== undefined) {
        parts.push(`Max-Age=${options.maxAge}`);
    }
    if (options.httpOnly !== false) {
        parts.push("HttpOnly");
    }
    parts.push(`SameSite=${options.sameSite || "Lax"}`);
    if (options.secure) {
        parts.push("Secure");
    }
    return parts.join("; ");
}

function expireCookie(name, secure = false) {
    return serializeCookie(name, "", {
        maxAge: 0,
        httpOnly: true,
        secure,
    });
}

function buildRememberedProfile(user, provider = "password") {
    if (!user || !user.email) return null;
    return {
        name: String(user.name || ""),
        email: String(user.email),
        avatar: user.avatar || null,
        role: user.role || "partner",
        provider: provider === "google" ? "google" : "password",
        last_login_at: new Date().toISOString(),
    };
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

async function parseRequestBody(request) {
    const contentType = (request.headers.get("content-type") || "").toLowerCase();
    try {
        if (contentType.includes("application/json")) {
            return (await request.json()) || {};
        }
        if (
            contentType.includes("application/x-www-form-urlencoded") ||
            contentType.includes("multipart/form-data")
        ) {
            const formData = await request.formData();
            const obj = {};
            for (const [k, v] of formData.entries()) {
                obj[k] = v;
            }
            return obj;
        }
        const text = await request.text();
        return text ? JSON.parse(text) : {};
    } catch {
        return {};
    }
}

async function sha256Hex(input) {
    const bytes = new TextEncoder().encode(String(input));
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

function buildSharedProps(cookies, env, overrides = {}) {
    const sessionUser = readJsonCookie(cookies, SESSION_COOKIE);
    const rememberedProfile = readJsonCookie(cookies, PROFILE_COOKIE);
    const googleEnabled = Boolean(
        env?.GOOGLE_CLIENT_ID && env?.GOOGLE_CLIENT_SECRET,
    );

    return {
        errors: overrides.errors || {},
        auth: {
            user:
                overrides.user !== undefined
                    ? overrides.user
                    : sessionUser || null,
            rememberedProfile:
                overrides.rememberedProfile !== undefined
                    ? overrides.rememberedProfile
                    : rememberedProfile || null,
            googleEnabled,
        },
        flash: {
            success: overrides.flashSuccess || null,
            error: overrides.flashError || null,
        },
    };
}

async function findD1UserByEmail(env, email) {
    if (!env?.DB) return null;
    try {
        const row = await env.DB.prepare(
            "SELECT id, name, email, password, role, category, phone, avatar FROM users WHERE lower(email) = ? LIMIT 1",
        )
            .bind(email)
            .first();
        return row || null;
    } catch {
        return null;
    }
}

async function insertD1User(env, user) {
    if (!env?.DB) return null;
    try {
        const now = new Date().toISOString();
        const result = await env.DB.prepare(
            "INSERT INTO users (name, email, password, role, category, phone, avatar, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
            .bind(
                user.name,
                user.email,
                user.passwordHash,
                user.role || "partner",
                user.category || "Business Partner",
                user.phone || "",
                user.avatar || null,
                now,
                now,
                now,
            )
            .run();
        return result?.meta?.last_row_id || null;
    } catch {
        return null;
    }
}

async function handleLogin(request, env, cookies, isSecure) {
    const body = await parseRequestBody(request);
    const email = String(body.email || "")
        .trim()
        .toLowerCase();
    const password = String(body.password || "");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return createInertiaOrHtmlResponse(request, {
            component: "Website/Login",
            url: "/login",
            meta: ROUTE_MAP["/login"],
            props: buildSharedProps(cookies, env, {
                errors: { email: "Please enter a valid email address." },
            }),
        });
    }

    if (!password) {
        return createInertiaOrHtmlResponse(request, {
            component: "Website/Login",
            url: "/login",
            meta: ROUTE_MAP["/login"],
            props: buildSharedProps(cookies, env, {
                errors: { password: "The password field is required." },
            }),
        });
    }

    const passwordHash = await sha256Hex(password);
    let authenticatedUser = null;

    // 1. Check optional Cloudflare D1 database if bound
    const dbUser = await findD1UserByEmail(env, email);
    if (
        dbUser &&
        (dbUser.password === passwordHash || dbUser.password === password)
    ) {
        const role =
            dbUser.role ||
            (email === "jux@ravu.com" ? "super_admin" : "partner");
        if (!["super_admin", "partner"].includes(role)) {
            return createInertiaOrHtmlResponse(request, {
                component: "Website/Login",
                url: "/login",
                meta: ROUTE_MAP["/login"],
                props: buildSharedProps(cookies, env, {
                    errors: {
                        email: "Web portal access is restricted to RAVU Partners and Super Admins. Riders use the RAVU mobile app.",
                    },
                }),
            });
        }
        authenticatedUser = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role,
            category: dbUser.category || "Business Partner",
            phone: dbUser.phone || "",
            avatar: dbUser.avatar || null,
        };
    }

    // 2. Built-in Super Admin account (jux@ravu.com / password)
    if (!authenticatedUser && email === "jux@ravu.com" && password === "password") {
        authenticatedUser = {
            id: 1,
            name: "Jux (Super Admin)",
            email: "jux@ravu.com",
            role: "super_admin",
        };
    }

    // 3. Built-in Partner accounts (chid@total.com or partner@ravu.com / password)
    if (
        !authenticatedUser &&
        ["chid@total.com", "partner@ravu.com"].includes(email) &&
        password === "password"
    ) {
        authenticatedUser = {
            id: 2,
            name: "Chid (TotalEnergies Partner)",
            email,
            role: "partner",
            category: "Fuel & Energy Station",
            phone: "+255 754 200 100",
        };
    }

    // 4. Cookie-registered partners fallback
    if (!authenticatedUser) {
        const registeredPartners =
            readJsonCookie(cookies, PARTNERS_COOKIE) || {};
        const partnerRecord = registeredPartners[email];
        if (
            partnerRecord &&
            (partnerRecord.passwordHash === passwordHash ||
                partnerRecord.password === password)
        ) {
            authenticatedUser = {
                id: partnerRecord.id || 101,
                name: partnerRecord.name,
                email: partnerRecord.email,
                role: "partner",
                category: partnerRecord.category || "Business Partner",
                phone: partnerRecord.phone || "",
            };
        }
    }

    if (!authenticatedUser) {
        return createInertiaOrHtmlResponse(request, {
            component: "Website/Login",
            url: "/login",
            meta: ROUTE_MAP["/login"],
            props: buildSharedProps(cookies, env, {
                errors: {
                    email: "Invalid email or password. Only registered RAVU Partners and Super Admins can sign in here.",
                },
            }),
        });
    }

    const rememberedProfile = buildRememberedProfile(
        authenticatedUser,
        "password",
    );
    const setCookies = [
        serializeCookie(SESSION_COOKIE, authenticatedUser, {
            maxAge: THIRTY_DAYS_SECONDS,
            httpOnly: true,
            secure: isSecure,
        }),
        serializeCookie(PROFILE_COOKIE, rememberedProfile, {
            maxAge: THIRTY_DAYS_SECONDS,
            httpOnly: true,
            secure: isSecure,
        }),
    ];

    const isSuperAdmin = authenticatedUser.role === "super_admin";
    const targetUrl = isSuperAdmin ? "/super-admin" : "/partner-dashboard";
    const targetComponent = isSuperAdmin
        ? "Website/SuperAdminDashboard"
        : "Website/PartnerDashboard";

    return createInertiaOrHtmlResponse(request, {
        component: targetComponent,
        url: targetUrl,
        meta: ROUTE_MAP[targetUrl],
        cookies: setCookies,
        props: buildSharedProps(cookies, env, {
            user: authenticatedUser,
            rememberedProfile,
            flashSuccess: isSuperAdmin
                ? "Welcome back, Super Admin!"
                : "Welcome back to your Partner Dashboard!",
        }),
    });
}

async function handleRegister(request, env, cookies, isSecure) {
    const body = await parseRequestBody(request);
    const name = String(body.name || "").trim();
    const email = String(body.email || "")
        .trim()
        .toLowerCase();
    const phone = String(body.phone || "").trim();
    const category =
        String(body.category || "").trim() || "Fuel & Energy Station";
    const password = String(body.password || "");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name) {
        return createInertiaOrHtmlResponse(request, {
            component: "Website/Register",
            url: "/register",
            meta: ROUTE_MAP["/register"],
            props: buildSharedProps(cookies, env, {
                errors: { name: "Please enter your organization name." },
            }),
        });
    }
    if (!email || !emailRegex.test(email)) {
        return createInertiaOrHtmlResponse(request, {
            component: "Website/Register",
            url: "/register",
            meta: ROUTE_MAP["/register"],
            props: buildSharedProps(cookies, env, {
                errors: { email: "Please enter a valid business email." },
            }),
        });
    }
    if (email === "jux@ravu.com") {
        return createInertiaOrHtmlResponse(request, {
            component: "Website/Register",
            url: "/register",
            meta: ROUTE_MAP["/register"],
            props: buildSharedProps(cookies, env, {
                errors: {
                    email: "This email is reserved for the Super Admin account. Please sign in directly.",
                },
            }),
        });
    }
    if (password.length < 6) {
        return createInertiaOrHtmlResponse(request, {
            component: "Website/Register",
            url: "/register",
            meta: ROUTE_MAP["/register"],
            props: buildSharedProps(cookies, env, {
                errors: {
                    password: "The password must be at least 6 characters.",
                },
            }),
        });
    }

    const existingDbUser = await findD1UserByEmail(env, email);
    if (existingDbUser) {
        return createInertiaOrHtmlResponse(request, {
            component: "Website/Register",
            url: "/register",
            meta: ROUTE_MAP["/register"],
            props: buildSharedProps(cookies, env, {
                errors: {
                    email: "A partner account with this email already exists. Please sign in instead.",
                },
            }),
        });
    }

    const passwordHash = await sha256Hex(password);
    const dbId = await insertD1User(env, {
        name,
        email,
        phone,
        category,
        passwordHash,
        role: "partner",
    });

    const userId = dbId || Math.floor(100 + Math.random() * 900);
    const registeredPartners = readJsonCookie(cookies, PARTNERS_COOKIE) || {};
    registeredPartners[email] = {
        id: userId,
        name,
        email,
        phone,
        category,
        passwordHash,
        role: "partner",
    };

    const authenticatedUser = {
        id: userId,
        name,
        email,
        phone,
        category,
        role: "partner",
    };

    const rememberedProfile = buildRememberedProfile(
        authenticatedUser,
        "password",
    );

    const setCookies = [
        serializeCookie(PARTNERS_COOKIE, registeredPartners, {
            maxAge: THIRTY_DAYS_SECONDS,
            httpOnly: true,
            secure: isSecure,
        }),
        serializeCookie(SESSION_COOKIE, authenticatedUser, {
            maxAge: THIRTY_DAYS_SECONDS,
            httpOnly: true,
            secure: isSecure,
        }),
        serializeCookie(PROFILE_COOKIE, rememberedProfile, {
            maxAge: THIRTY_DAYS_SECONDS,
            httpOnly: true,
            secure: isSecure,
        }),
    ];

    return createInertiaOrHtmlResponse(request, {
        component: "Website/PartnerDashboard",
        url: "/partner-dashboard",
        meta: ROUTE_MAP["/partner-dashboard"],
        cookies: setCookies,
        props: buildSharedProps(cookies, env, {
            user: authenticatedUser,
            rememberedProfile,
            flashSuccess:
                "Partner account created! Welcome to your RAVU Partner Dashboard.",
        }),
    });
}

function handleLogout(request, env, cookies, isSecure) {
    const setCookies = [expireCookie(SESSION_COOKIE, isSecure)];
    return createInertiaOrHtmlResponse(request, {
        component: "Website/Login",
        url: "/login",
        meta: ROUTE_MAP["/login"],
        cookies: setCookies,
        props: buildSharedProps(cookies, env, {
            user: null,
            flashSuccess: "You have been signed out.",
        }),
    });
}

function handleForgetProfile(request, env, cookies, isSecure) {
    const setCookies = [expireCookie(PROFILE_COOKIE, isSecure)];
    return createInertiaOrHtmlResponse(request, {
        component: "Website/Login",
        url: "/login",
        meta: ROUTE_MAP["/login"],
        cookies: setCookies,
        props: buildSharedProps(cookies, env, {
            rememberedProfile: null,
        }),
    });
}

function handleGoogleRedirect(request, env, cookies, isSecure) {
    const url = new URL(request.url);
    const clientId = env?.GOOGLE_CLIENT_ID;
    const clientSecret = env?.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return createInertiaOrHtmlResponse(request, {
            component: "Website/Login",
            url: "/login",
            meta: ROUTE_MAP["/login"],
            props: buildSharedProps(cookies, env, {
                errors: {
                    email: "Google sign-in is not configured yet. Please use your email and password.",
                },
            }),
        });
    }

    const stateBytes = new Uint8Array(20);
    crypto.getRandomValues(stateBytes);
    const state = Array.from(stateBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    const redirectUri =
        env?.GOOGLE_REDIRECT_URI || `${url.origin}/auth/google/callback`;
    const remembered = readJsonCookie(cookies, PROFILE_COOKIE);
    const hint = url.searchParams.get("login_hint") || remembered?.email;

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state,
        access_type: "online",
        include_granted_scopes: "true",
    });

    if (hint && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hint)) {
        params.set("login_hint", hint);
    } else {
        params.set("prompt", "select_account");
    }

    const headers = new Headers({
        Location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    });
    headers.append(
        "Set-Cookie",
        serializeCookie(OAUTH_STATE_COOKIE, state, {
            maxAge: 600,
            httpOnly: true,
            secure: isSecure,
        }),
    );

    return new Response(null, { status: 302, headers });
}

async function handleGoogleCallback(request, env, cookies, isSecure) {
    const url = new URL(request.url);
    const expectedState = cookies[OAUTH_STATE_COOKIE];
    const returnedState = url.searchParams.get("state");
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    const fail = (message) =>
        createInertiaOrHtmlResponse(request, {
            component: "Website/Login",
            url: "/login",
            meta: ROUTE_MAP["/login"],
            cookies: [expireCookie(OAUTH_STATE_COOKIE, isSecure)],
            props: buildSharedProps(cookies, env, {
                errors: { email: message },
            }),
        });

    if (error) {
        return fail(
            error === "access_denied"
                ? "Google sign-in was cancelled."
                : "Google sign-in failed. Please try again.",
        );
    }
    if (!expectedState || expectedState !== returnedState || !code) {
        return fail("Your Google sign-in session expired. Please try again.");
    }

    const redirectUri =
        env?.GOOGLE_REDIRECT_URI || `${url.origin}/auth/google/callback`;

    try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: env.GOOGLE_CLIENT_ID,
                client_secret: env.GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
            return fail("Could not verify your Google account. Please try again.");
        }

        const profileRes = await fetch(
            "https://openidconnect.googleapis.com/v1/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                },
            },
        );
        const profile = await profileRes.json();
        if (!profileRes.ok || !profile.email || !profile.email_verified) {
            return fail("Your Google account email is not verified.");
        }

        const email = String(profile.email).toLowerCase();
        const name = String(profile.name || email);
        const avatar = profile.picture || null;
        const isAdminEmail = ["ravu.limited@gmail.com", "jux@ravu.com"].includes(
            email,
        );
        const role = isAdminEmail ? "super_admin" : "partner";

        const authenticatedUser = {
            id: Math.floor(100 + Math.random() * 900),
            name,
            email,
            avatar,
            role,
        };
        const rememberedProfile = buildRememberedProfile(
            authenticatedUser,
            "google",
        );

        const targetUrl =
            role === "super_admin" ? "/super-admin" : "/partner-dashboard";
        const headers = new Headers({ Location: targetUrl });
        headers.append(
            "Set-Cookie",
            expireCookie(OAUTH_STATE_COOKIE, isSecure),
        );
        headers.append(
            "Set-Cookie",
            serializeCookie(SESSION_COOKIE, authenticatedUser, {
                maxAge: THIRTY_DAYS_SECONDS,
                httpOnly: true,
                secure: isSecure,
            }),
        );
        headers.append(
            "Set-Cookie",
            serializeCookie(PROFILE_COOKIE, rememberedProfile, {
                maxAge: THIRTY_DAYS_SECONDS,
                httpOnly: true,
                secure: isSecure,
            }),
        );

        return new Response(null, { status: 302, headers });
    } catch {
        return fail(
            "Unable to reach Google right now. Please use your email and password.",
        );
    }
}

export async function handleEdgeRequest(request, env = {}) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const isSecure = url.protocol === "https:";
    const cookies = parseCookies(request.headers.get("Cookie") || "");

    // Normalize trailing slash except for "/"
    const pathname =
        url.pathname.length > 1
            ? url.pathname.replace(/\/+$/, "")
            : url.pathname;
    const fullUrl = pathname + url.search;

    if (method === "POST") {
        if (pathname === "/login") {
            return handleLogin(request, env, cookies, isSecure);
        }
        if (pathname === "/register") {
            return handleRegister(request, env, cookies, isSecure);
        }
        if (pathname === "/logout") {
            return handleLogout(request, env, cookies, isSecure);
        }
        if (pathname === "/login/forget-profile") {
            return handleForgetProfile(request, env, cookies, isSecure);
        }
    }

    if (method === "GET" || method === "HEAD") {
        if (pathname === "/auth/google/redirect") {
            return handleGoogleRedirect(request, env, cookies, isSecure);
        }
        if (pathname === "/auth/google/callback") {
            return handleGoogleCallback(request, env, cookies, isSecure);
        }

        const route = ROUTE_MAP[pathname] || ROUTE_MAP["/"];
        const sessionUser = readJsonCookie(cookies, SESSION_COOKIE);
        const resolvedUser = sessionUser || route.defaultUser || null;

        return createInertiaOrHtmlResponse(request, {
            component: route.component,
            url: ROUTE_MAP[pathname] ? fullUrl : "/",
            meta: route,
            props: buildSharedProps(cookies, env, {
                user: resolvedUser,
            }),
        });
    }

    return new Response("Method Not Allowed", { status: 405 });
}
