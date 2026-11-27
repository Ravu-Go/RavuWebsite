<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\IpUtils;
use Symfony\Component\HttpFoundation\Response;

/**
 * Use the visitor's real IP when the request reached Laravel through the hosting proxy.
 *
 * On staging every request arrives from the Dokploy proxy (e.g. 10.0.1.4), so all
 * visitors looked like one address: per-IP rate limits (registration, sign-in) were
 * shared by everyone, and activity logs showed the proxy instead of the visitor.
 *
 * Only when the direct peer is on a private network (the proxy, which bootstrap/app.php
 * trusts) is the visitor IP taken from the Cloudflare worker's CF-Original-IP header,
 * else CF-Connecting-IP, and handed to Laravel's trusted-proxy handling as the
 * X-Forwarded-For client. REMOTE_ADDR stays the proxy, so X-Forwarded-Proto/Host/Port
 * from it are still trusted (https URLs). Requests from anywhere else are untouched.
 */
class ResolveClientIp
{
    public const PROXY_NETWORKS = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', 'fc00::/7'];

    private const CLIENT_IP_HEADERS = ['CF-Original-IP', 'CF-Connecting-IP'];

    public function handle(Request $request, Closure $next): Response
    {
        $peer = (string) $request->server('REMOTE_ADDR');

        if ($peer !== '' && IpUtils::checkIp($peer, self::PROXY_NETWORKS)) {
            foreach (self::CLIENT_IP_HEADERS as $header) {
                $ip = trim((string) $request->headers->get($header));
                if ($ip !== '' && filter_var($ip, FILTER_VALIDATE_IP)) {
                    $request->headers->set('X-Forwarded-For', $ip);
                    $request->headers->remove('Forwarded');
                    break;
                }
            }
        }

        return $next($request);
    }
}
