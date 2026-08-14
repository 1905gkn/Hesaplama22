import worker from "../dist/server/index.js";

const LEGACY_API_ORIGIN = "https://rafex-configurator.rafex-3908.chatgpt.site";

async function proxyApi(request) {
  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, LEGACY_API_ORIGIN);
  const headers = new Headers(request.headers);
  headers.set("host", target.host);

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
