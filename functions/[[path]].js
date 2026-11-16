import { handleEdgeRequest } from "../cloudflare/edge-handler.js";

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

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    if (env?.ASSETS && isStaticAssetPath(url.pathname)) {
        return env.ASSETS.fetch(request);
    }

    return handleEdgeRequest(request, env, context);
}
