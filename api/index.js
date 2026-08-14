import worker from "../dist/server/index.js";

const LEGACY_API_ORIGIN = "https://rafex-configurator.rafex-3908.chatgpt.site";

async function proxyApi(request) {
  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, LEGACY_API_ORIGIN);
  const headers = new Headers(request.headers);
  headers.set("host", target.host);

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

  return fetch(target, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
    duplex: request.body ? "half" : undefined,
  });
}

export default {
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path.startsWith("/api/")) return proxyApi(request);
    return worker.fetch(request, {});
  },
};
