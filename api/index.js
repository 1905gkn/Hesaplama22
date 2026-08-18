import worker from "../dist/server/index.js";

const LEGACY_API_ORIGIN = "https://rafex-configurator.rafex-3908.chatgpt.site";

function upstreamCookies(headers) {
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const combined = headers.get("set-cookie");
  if (!combined) return [];
  return combined.split(/,(?=\s*[^;,\s]+=)/g);
}

function normalizedResponseHeaders(upstream) {
  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  const cacheControl = upstream.headers.get("cache-control");
  const location = upstream.headers.get("location");

  if (contentType) headers.set("content-type", contentType);
  if (cacheControl) headers.set("cache-control", cacheControl);
  if (location) headers.set("location", location);

  // Only the app session belongs on the Vercel host. Cloudflare cookies from
  // the legacy chatgpt.site origin have a different Domain and must not leak
  // through this reverse proxy.
  for (const cookie of upstreamCookies(upstream.headers)) {
    if (/^\s*rafex_session=/i.test(cookie)) {
      headers.append("set-cookie", cookie.trim());
    }
  }

  return headers;
}

async function proxyApi(request) {
  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, LEGACY_API_ORIGIN);
  const headers = new Headers(request.headers);
  headers.set("host", target.host);
  headers.set("accept-encoding", "identity");

  // The legacy worker rejects state-changing requests when Origin does not
  // match its own origin. Requests arriving through Vercel naturally carry
  // the Vercel origin, so normalize browser security headers before proxying.
  if (headers.has("origin")) headers.set("origin", target.origin);
  if (headers.has("referer")) {
    try {
      const referer = new URL(headers.get("referer"));
      headers.set(
        "referer",
        new URL(referer.pathname + referer.search, LEGACY_API_ORIGIN).toString(),
      );
    } catch {
      headers.delete("referer");
    }
  }

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
    duplex: request.body ? "half" : undefined,
  });

  // Node's fetch can transparently decode an upstream response while leaving
  // transport headers such as content-encoding/content-length behind. Passing
  // that Response through verbatim can make browsers reject an otherwise-200
  // API call as `TypeError: Failed to fetch`. Rebuild the small API response
  // body and forward only headers that are valid for the Vercel origin.
  const body = request.method === "HEAD" ? null : await upstream.arrayBuffer();
  return new Response(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: normalizedResponseHeaders(upstream),
  });
}

export default {
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path.startsWith("/api/")) return proxyApi(request);
    return worker.fetch(request, {});
  },
};
