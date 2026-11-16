import axios from "axios";

const STORAGE_KEYS = {
    SESSION: "ravu_cf_session_user_v1",
    PROFILE: "ravu_cf_remembered_profile_v1",
    PARTNERS: "ravu_cf_registered_partners_v1",
};

const ROUTE_COMPONENTS = {
    "/": "Website/Home",
    "/about-ravu": "Website/AboutRavu",
    "/for-riders": "Website/ForRiders",
    "/membership": "Website/Membership",
    "/benefits": "Website/Benefits",
    "/partners": "Website/Partners",
    "/how-it-works": "Website/How_It_Works",
    "/support": "Website/Support",
    "/login": "Website/Login",
    "/register": "Website/Register",
    "/super-admin": "Website/SuperAdminDashboard",
    "/admin": "Website/SuperAdminDashboard",
    "/partner-dashboard": "Website/PartnerDashboard",
    "/partner-portal": "Website/PartnerDashboard",
};

const DEFAULT_DASHBOARD_USERS = {
    "/super-admin": {
        id: 1,
        name: "Jux (Super Admin)",
        email: "jux@ravu.com",
        role: "super_admin",
    },
    "/admin": {
        id: 1,
        name: "Jux (Super Admin)",
        email: "jux@ravu.com",
        role: "super_admin",
    },
    "/partner-dashboard": {
        id: 2,
        name: "Chid (TotalEnergies Partner)",
        email: "chid@total.com",
        role: "partner",
        category: "Fuel & Energy Station",
        phone: "+255 754 200 100",
    },
    "/partner-portal": {
        id: 2,
        name: "Chid (TotalEnergies Partner)",
        email: "chid@total.com",
        role: "partner",
        category: "Fuel & Energy Station",
        phone: "+255 754 200 100",
    },
};

function readStorage(key, fallback = null) {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function writeStorage(key, value) {
    if (typeof window === "undefined") return;
    try {
        if (value === null || value === undefined) {
            window.localStorage.removeItem(key);
        } else {
            window.localStorage.setItem(key, JSON.stringify(value));
        }
    } catch {
        // Ignore storage quota errors
    }
}

function normalizePathname(rawUrl) {
    try {
        const parsed = new URL(
            rawUrl,
            typeof window !== "undefined"
                ? window.location.origin
                : "https://ravu.co.tz",
        );
        const clean =
            parsed.pathname.length > 1
                ? parsed.pathname.replace(/\/+$/, "")
                : parsed.pathname;
        return {
            pathname: clean,
            fullUrl: clean + parsed.search,
        };
    } catch {
        return { pathname: "/", fullUrl: "/" };
    }
}

function buildClientPageObject(rawUrl, overrides = {}) {
    const { pathname, fullUrl } = normalizePathname(rawUrl);
    const component = ROUTE_COMPONENTS[pathname] || "Website/Home";
    const sessionUser = readStorage(STORAGE_KEYS.SESSION, null);
    const rememberedProfile = readStorage(STORAGE_KEYS.PROFILE, null);
    const defaultUser = DEFAULT_DASHBOARD_USERS[pathname] || null;

    return {
        component: overrides.component || component,
        props: {
            errors: overrides.errors || {},
            auth: {
                user:
                    overrides.user !== undefined
                        ? overrides.user
                        : sessionUser || defaultUser,
                rememberedProfile:
                    overrides.rememberedProfile !== undefined
                        ? overrides.rememberedProfile
                        : rememberedProfile,
                googleEnabled: false,
            },
            flash: {
                success: overrides.flashSuccess || null,
                error: overrides.flashError || null,
            },
        },
        url: overrides.url || (ROUTE_COMPONENTS[pathname] ? fullUrl : "/"),
        version: "ravu-cf-v1",
    };
}

function parseConfigData(data) {
    if (!data) return {};
    if (typeof data === "object") return data;
    if (typeof data === "string") {
        try {
            return JSON.parse(data);
        } catch {
            const params = new URLSearchParams(data);
            return Object.fromEntries(params.entries());
        }
    }
    return {};
}

function handleClientAction(method, pathname, body) {
    if (method === "POST" && pathname === "/login") {
        const email = String(body.email || "")
            .trim()
            .toLowerCase();
        const password = String(body.password || "");

        let user = null;
        if (email === "jux@ravu.com" && password === "password") {
            user = {
                id: 1,
                name: "Jux (Super Admin)",
                email: "jux@ravu.com",
                role: "super_admin",
            };
        } else if (
            ["chid@total.com", "partner@ravu.com"].includes(email) &&
            password === "password"
        ) {
            user = {
                id: 2,
                name: "Chid (TotalEnergies Partner)",
                email,
                role: "partner",
                category: "Fuel & Energy Station",
                phone: "+255 754 200 100",
            };
        } else {
            const partners = readStorage(STORAGE_KEYS.PARTNERS, {});
            if (partners[email] && partners[email].password === password) {
                user = {
                    id: partners[email].id || 101,
                    name: partners[email].name,
                    email: partners[email].email,
                    role: "partner",
                    category: partners[email].category || "Business Partner",
                    phone: partners[email].phone || "",
                };
            }
        }

        if (!user) {
            return buildClientPageObject("/login", {
                component: "Website/Login",
                url: "/login",
                errors: {
                    email: "Invalid email or password. Only registered RAVU Partners and Super Admins can sign in here.",
                },
            });
        }

        const profile = {
            name: user.name,
            email: user.email,
            avatar: user.avatar || null,
            role: user.role,
            provider: "password",
            last_login_at: new Date().toISOString(),
        };
        writeStorage(STORAGE_KEYS.SESSION, user);
        writeStorage(STORAGE_KEYS.PROFILE, profile);

        const isAdmin = user.role === "super_admin";
        const targetUrl = isAdmin ? "/super-admin" : "/partner-dashboard";
        return buildClientPageObject(targetUrl, {
            user,
            rememberedProfile: profile,
            flashSuccess: isAdmin
                ? "Welcome back, Super Admin!"
                : "Welcome back to your Partner Dashboard!",
        });
    }

    if (method === "POST" && pathname === "/register") {
        const name = String(body.name || "").trim();
        const email = String(body.email || "")
            .trim()
            .toLowerCase();
        const phone = String(body.phone || "").trim();
        const category =
            String(body.category || "").trim() || "Fuel & Energy Station";
        const password = String(body.password || "");

        if (email === "jux@ravu.com") {
            return buildClientPageObject("/register", {
                component: "Website/Register",
                url: "/register",
                errors: {
                    email: "This email is reserved for the Super Admin account. Please sign in directly.",
                },
            });
        }
        if (password.length < 6) {
            return buildClientPageObject("/register", {
                component: "Website/Register",
                url: "/register",
                errors: {
                    password: "The password must be at least 6 characters.",
                },
            });
        }

        const partners = readStorage(STORAGE_KEYS.PARTNERS, {});
        const userId = Math.floor(100 + Math.random() * 900);
        partners[email] = {
            id: userId,
            name,
            email,
            phone,
            category,
            password,
            role: "partner",
        };
        writeStorage(STORAGE_KEYS.PARTNERS, partners);

        const user = {
            id: userId,
            name,
            email,
            phone,
            category,
            role: "partner",
        };
        const profile = {
            name: user.name,
            email: user.email,
            avatar: null,
            role: "partner",
            provider: "password",
            last_login_at: new Date().toISOString(),
        };
        writeStorage(STORAGE_KEYS.SESSION, user);
        writeStorage(STORAGE_KEYS.PROFILE, profile);

        return buildClientPageObject("/partner-dashboard", {
            user,
            rememberedProfile: profile,
            flashSuccess:
                "Partner account created! Welcome to your RAVU Partner Dashboard.",
        });
    }

    if (method === "POST" && pathname === "/logout") {
        writeStorage(STORAGE_KEYS.SESSION, null);
        return buildClientPageObject("/login", {
            user: null,
            flashSuccess: "You have been signed out.",
        });
    }

    if (method === "POST" && pathname === "/login/forget-profile") {
        writeStorage(STORAGE_KEYS.PROFILE, null);
        return buildClientPageObject("/login", {
            rememberedProfile: null,
        });
    }

    return buildClientPageObject(pathname);
}

/**
 * Ensures the initial `#app[data-page]` matches `window.location.pathname` when
 * served from a static Cloudflare Pages index.html fallback.
 */
export function ensureInitialInertiaPage() {
    if (typeof document === "undefined" || typeof window === "undefined") {
        return;
    }
    const el = document.getElementById("app");
    if (!el) return;

    const raw = el.getAttribute("data-page");
    let parsed = null;
    try {
        parsed = raw ? JSON.parse(raw) : null;
    } catch {
        parsed = null;
    }

    const currentLocation = window.location.pathname + window.location.search;
    if (!parsed || parsed.staticFallback === true) {
        const resolved = buildClientPageObject(currentLocation);
        el.setAttribute("data-page", JSON.stringify(resolved));
    }
}

/**
 * Installs an Axios interceptor so that if an Inertia visit hits a static-only
 * Cloudflare Pages deployment (where the server returns HTML without `x-inertia`
 * or 404/405 on POST), it resolves the Inertia page response client-side.
 */
export function installCloudflareSpaInterceptor() {
    axios.interceptors.response.use(
        (response) => {
            const reqHeaders = response?.config?.headers || {};
            const isInertiaReq =
                reqHeaders["X-Inertia"] ||
                reqHeaders["x-inertia"] ||
                reqHeaders?.get?.("X-Inertia") ||
                reqHeaders?.get?.("x-inertia");

            const hasInertiaRes = Boolean(
                response?.headers?.["x-inertia"] ||
                    response?.headers?.["X-Inertia"] ||
                    response?.headers?.get?.("x-inertia"),
            );

            if (isInertiaReq && !hasInertiaRes) {
                const method = (response.config.method || "get").toUpperCase();
                const { pathname } = normalizePathname(
                    response.config.url || "/",
                );
                const body = parseConfigData(response.config.data);
                const pageObj = handleClientAction(method, pathname, body);

                response.status = 200;
                response.headers["x-inertia"] = "true";
                response.headers["content-type"] = "application/json";
                response.data = JSON.stringify(pageObj);
            } else if (hasInertiaRes && typeof response?.data === "string") {
                // Sync server-authenticated user/profile into localStorage as backup
                try {
                    const parsed = JSON.parse(response.data);
                    if (parsed?.props?.auth?.user !== undefined) {
                        writeStorage(
                            STORAGE_KEYS.SESSION,
                            parsed.props.auth.user,
                        );
                    }
                    if (parsed?.props?.auth?.rememberedProfile !== undefined) {
                        writeStorage(
                            STORAGE_KEYS.PROFILE,
                            parsed.props.auth.rememberedProfile,
                        );
                    }
                } catch {
                    // Ignore parse error
                }
            }
            return response;
        },
        (error) => {
            const config = error?.config;
            const reqHeaders = config?.headers || {};
            const isInertiaReq =
                reqHeaders["X-Inertia"] ||
                reqHeaders["x-inertia"] ||
                reqHeaders?.get?.("X-Inertia") ||
                reqHeaders?.get?.("x-inertia");

            const status = error?.response?.status;
            if (
                isInertiaReq &&
                (!error.response ||
                    status === 404 ||
                    status === 405 ||
                    status === 403)
            ) {
                const method = (config.method || "get").toUpperCase();
                const { pathname } = normalizePathname(config.url || "/");
                const body = parseConfigData(config.data);
                const pageObj = handleClientAction(method, pathname, body);

                return Promise.resolve({
                    data: JSON.stringify(pageObj),
                    status: 200,
                    statusText: "OK",
                    headers: {
                        "x-inertia": "true",
                        "content-type": "application/json",
                    },
                    config,
                });
            }

            return Promise.reject(error);
        },
    );
}
