import { handleEdgeRequest } from "../cloudflare/edge-handler.js";

const SECURITY_HEADERS = {
    "x-content-type-options": "nosniff",
    "x-frame-options": "SAMEORIGIN",
    "referrer-policy": "strict-origin-when-cross-origin",
};

const STATIC_PREFIXES = ["/build/", "/assets/"];
const STATIC_FILES = new Set([
    "/favicon.png",
    "/favicon.ico",
    "/robots.txt",
    "/_headers",
    "/_redirects",
]);

function isStaticAssetPath(pathname) {
    if (STATIC_FILES.has(pathname)) return true;
    for (const prefix of STATIC_PREFIXES) {
        if (pathname.startsWith(prefix)) return true;
    }
    return false;
}

function withSecurityHeaders(response, extraHeaders = {}) {
    const res = new Response(response.body, response);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
        if (!res.headers.has(k)) res.headers.set(k, v);
    }
    for (const [k, v] of Object.entries(extraHeaders)) {
        res.headers.set(k, v);
    }
    return res;
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // 1. Static Vite build assets & root static files — serve from Cloudflare edge.
        if (env?.ASSETS && isStaticAssetPath(url.pathname)) {
            const assetRequest = url.pathname.startsWith("/build/")
                ? new Request(
                      new URL(
                          url.pathname.replace(/^\/build/, "") || "/",
                          url.origin,
                      ),
                      request,
                  )
                : request;

            // Try exact path first (for dist/ layout where /build/* exists), then stripped /build prefix (for public/build layout)
            let asset = await env.ASSETS.fetch(request);
            if (asset.status === 404 && url.pathname.startsWith("/build/")) {
                asset = await env.ASSETS.fetch(assetRequest);
            }

            if (asset.status !== 404) {
                const cacheHeader = url.pathname.startsWith("/build/assets/")
                    ? { "cache-control": "public, max-age=31536000, immutable" }
                    : {};
                return withSecurityHeaders(asset, cacheHeader);
            }
        }

        // 2. If BACKEND_URL is explicitly configured, proxy dynamic requests to the PHP origin
        //    with automatic fallback to the built-in Cloudflare Edge Inertia handler.
        if (env?.BACKEND_URL) {
            try {
                const originUrl = new URL(
                    url.pathname + url.search,
                    env.BACKEND_URL,
                );
                const originRequest = new Request(originUrl, request);
                originRequest.headers.delete("cf-connecting-ip-note");
                originRequest.headers.set(
                    "cf-original-ip",
                    request.headers.get("cf-connecting-ip") ?? "",
                );
                const response = await fetch(originRequest);
                if (response.status < 500) {
                    const res = new Response(response.body, response);
                    res.headers.delete("set-cookie-noop");
                    return withSecurityHeaders(res);
                }
            } catch {
                // Fall through to native Cloudflare Edge Inertia handler
            }
        }

        // 3. Built-in Cloudflare Edge Inertia + Auth + D1/Cookie handler (zero-origin ready)
        const edgeResponse = await handleEdgeRequest(request, env, ctx);
        return withSecurityHeaders(edgeResponse);
    },
};
