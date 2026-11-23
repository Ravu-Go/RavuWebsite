import axios from "axios";

/**
 * Static-only fallback for a pure `dist/` upload to Cloudflare Pages.
 *
 * The real application is the Laravel backend (proxied by the Cloudflare
 * Worker via BACKEND_URL). This adapter only activates when the page was
 * bootstrapped from the static `dist/index.html` shell, i.e. no server is
 * answering. In that mode the public marketing pages render from their
 * bundled default content, and anything that needs an account (sign-in,
 * registration, partner portal, admin) shows a "temporarily unavailable"
 * message instead of pretending to work.
 *
 * It never fabricates users or sessions, and it never intercepts responses
 * from a real server.
 */

const PUBLIC_ROUTES = {
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
};

const UNAVAILABLE =
    "Sign-in and partner registration are temporarily unavailable. Please try again shortly.";

let staticMode = false;

function normalizePathname(rawUrl) {
    try {
        const parsed = new URL(
            rawUrl,
            typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost",
        );
        let pathname = parsed.pathname || "/";
        if (pathname.length > 1 && pathname.endsWith("/")) {
            pathname = pathname.slice(0, -1);
        }
        return { pathname, fullUrl: pathname + parsed.search };
    } catch {
        return { pathname: "/", fullUrl: "/" };
    }
}

function buildClientPageObject(rawUrl, { errors = {}, flashError = null } = {}) {
    const { pathname, fullUrl } = normalizePathname(rawUrl);
    const known = PUBLIC_ROUTES[pathname];
    // Account areas cannot work without the backend: send visitors to sign-in with a notice.
    const component = known || "Website/Login";
    const url = known ? fullUrl : "/login";
    const needsNotice = !known || component === "Website/Login" || component === "Website/Register";

    return {
        component,
        props: {
            errors,
            auth: { user: null, rememberedProfile: null, googleEnabled: false },
            flash: {
                success: null,
                error: flashError || (needsNotice ? UNAVAILABLE : null),
            },
            categories: [],
            policyLinks: { terms: "#terms", privacy: "#privacy" },
        },
        url,
        version: "ravu-cf-static",
    };
}

function handleClientAction(method, pathname) {
    if (method !== "GET") {
        const target = pathname === "/register" ? "/register" : "/login";
        return buildClientPageObject(target, { errors: { email: UNAVAILABLE } });
    }
    return buildClientPageObject(pathname);
}

/**
 * Ensures the initial `#app[data-page]` matches `window.location.pathname` when
 * served from the static Cloudflare Pages index.html fallback.
 */
export function ensureInitialInertiaPage() {
    if (typeof document === "undefined" || typeof window === "undefined") {
        return;
    }
    const el = document.getElementById("app");
    if (!el) return;

    let parsed = null;
    try {
        const raw = el.getAttribute("data-page");
        parsed = raw ? JSON.parse(raw) : null;
    } catch {
        parsed = null;
    }

    if (!parsed || parsed.staticFallback === true) {
        staticMode = true;
        const currentLocation = window.location.pathname + window.location.search;
        el.setAttribute("data-page", JSON.stringify(buildClientPageObject(currentLocation)));
    }
}

const isInertiaRequest = (config) => {
    const headers = config?.headers || {};
    return Boolean(
        headers["X-Inertia"] ||
            headers["x-inertia"] ||
            headers?.get?.("X-Inertia") ||
            headers?.get?.("x-inertia"),
    );
};

const fakeInertiaResponse = (config) => {
    const method = (config.method || "get").toUpperCase();
    const { pathname } = normalizePathname(config.url || "/");
    return {
        data: JSON.stringify(handleClientAction(method, pathname)),
        status: 200,
        statusText: "OK",
        headers: { "x-inertia": "true", "content-type": "application/json" },
        config,
    };
};

/**
 * In static mode only: resolve Inertia visits client-side when the static host
 * answers with plain HTML (no `x-inertia` header) or 404/405 for POSTs.
 */
export function installCloudflareSpaInterceptor() {
    axios.interceptors.response.use(
        (response) => {
            if (!staticMode || !isInertiaRequest(response?.config)) return response;
            const hasInertiaHeader = Boolean(
                response?.headers?.["x-inertia"] || response?.headers?.get?.("x-inertia"),
            );
            return hasInertiaHeader ? response : fakeInertiaResponse(response.config);
        },
        (error) => {
            const status = error?.response?.status;
            if (
                staticMode &&
                isInertiaRequest(error?.config) &&
                (!error.response || status === 404 || status === 405)
            ) {
                return Promise.resolve(fakeInertiaResponse(error.config));
            }
            return Promise.reject(error);
        },
    );
}
