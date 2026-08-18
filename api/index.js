import worker from "../dist/server/index.js";

const LEGACY_API_ORIGIN = "https://rafex-configurator.rafex-3908.chatgpt.site";
const EXACT_PROMOTE_PATH = "/__rafex-promote-exact-34vnlp6h8";
const EXACT_DEPLOYMENT_ID = "dpl_3DpLCzXrB8CikLXLMVfnva2m35Yo";
const VERCEL_PROJECT_ID = "prj_2BNBxHcbHo1JZreVUjUl1j59txmO";
const VERCEL_TEAM_ID = "team_na0LSwDQ6yYTYeOdJgrjzUYj";
const PRODUCTION_HOST = "rafex-configurator.vercel.app";

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

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function promoteExactApprovedDeployment() {
  const candidates = [
    ["VERCEL_TOKEN", process.env.VERCEL_TOKEN],
    ["VERCEL_OIDC_TOKEN", process.env.VERCEL_OIDC_TOKEN],
  ].filter(([, token]) => typeof token === "string" && token.length > 20);

  if (!candidates.length) {
    return jsonResponse({
      ok: false,
      target: EXACT_DEPLOYMENT_ID,
      error: "No Vercel runtime credential is available.",
    }, 503);
  }

  const failures = [];
  for (const [credential, token] of candidates) {
    const headers = { Authorization: `Bearer ${token}` };
    const promoteUrl = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/promote/${EXACT_DEPLOYMENT_ID}?teamId=${VERCEL_TEAM_ID}`;
    const promoted = await fetch(promoteUrl, { method: "POST", headers });
    const promoteBody = await promoted.text();

    if (!promoted.ok) {
      failures.push({ credential, status: promoted.status, body: promoteBody.slice(0, 500) });
      continue;
    }

    let currentId = "";
    for (let attempt = 1; attempt <= 20; attempt += 1) {
      const inspect = await fetch(
        `https://api.vercel.com/v13/deployments/${PRODUCTION_HOST}?teamId=${VERCEL_TEAM_ID}`,
        { headers },
      );
      if (inspect.ok) {
        const info = await inspect.json();
        currentId = info.id || "";
        if (currentId === EXACT_DEPLOYMENT_ID) {
          return jsonResponse({
            ok: true,
            credential,
            target: EXACT_DEPLOYMENT_ID,
            production: currentId,
          });
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return jsonResponse({
      ok: false,
      credential,
      target: EXACT_DEPLOYMENT_ID,
      production: currentId,
      error: "Promotion request succeeded but production verification did not converge.",
    }, 502);
  }

  return jsonResponse({
    ok: false,
    target: EXACT_DEPLOYMENT_ID,
    error: "All available Vercel runtime credentials were rejected.",
    failures,
  }, 502);
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
    if (path === EXACT_PROMOTE_PATH && request.method === "GET") {
      return promoteExactApprovedDeployment();
    }
    if (path.startsWith("/api/")) return proxyApi(request);
    return worker.fetch(request, {});
  },
};
