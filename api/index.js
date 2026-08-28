import worker from "../dist/server/index.js";

const LEGACY_API_ORIGIN = "https://rafex-configurator.rafex-3908.chatgpt.site";
const PROJECT_CACHE_TTL_MS = 2000;
const projectCache = new Map();
const projectInflight = new Map();

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

  for (const cookie of upstreamCookies(upstream.headers)) {
    if (/^\s*rafex_session=/i.test(cookie)) headers.append("set-cookie", cookie.trim());
  }

  return headers;
}

function normalizedRequestHeaders(request, target) {
  const headers = new Headers(request.headers);
  headers.set("host", target.host);
  headers.set("accept-encoding", "identity");

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
  return headers;
}

function sessionKey(request) {
  return [
    request.headers.get("authorization") || "",
    request.headers.get("cookie") || "",
  ].join("|");
}

async function upstreamFetch(request, pathname = null, init = {}) {
  const incoming = new URL(request.url);
  const target = new URL(pathname || incoming.pathname + incoming.search, LEGACY_API_ORIGIN);
  const method = init.method || request.method;
  const headers = normalizedRequestHeaders(request, target);
  return fetch(target, {
    method,
    headers,
    body:
      method === "GET" || method === "HEAD"
        ? undefined
        : init.body !== undefined
          ? init.body
          : request.body,
    redirect: "manual",
    duplex:
      method === "GET" || method === "HEAD"
        ? undefined
        : init.body !== undefined || request.body
          ? "half"
          : undefined,
  });
}

function low(value) {
  return String(value || "").toLocaleLowerCase("tr-TR").trim();
}

function systemOf(value) {
  const drawing = value?.drawing || value?.rack || value || {};
  const raw = low(
    value?.system ||
      value?.rafexSystem ||
      value?.__rafexSystem ||
      drawing?.rafexSystem ||
      drawing?.__rafexSystem,
  );
  if (raw) return raw === "mekik" ? "mekik2" : raw;
  if (
    drawing?.b2b?.mr === true ||
    drawing?.plan?.mr === true ||
    low(drawing?.systemType) === "mr"
  ) return "mr";
  if (drawing?.b2bLayout || drawing?.b2b) return "b2b";
  if (drawing?.plan || low(drawing?.systemType) === "fifo" || low(drawing?.systemType) === "filo") return "mekik2";
  return "";
}

function projectSystems(project) {
  const payload = project?.payload || {};
  const values = [];
  if (Array.isArray(payload?.layout?.racks)) values.push(...payload.layout.racks);
  if (Array.isArray(payload?.state?.layout?.racks)) values.push(...payload.state.layout.racks);
  if (Array.isArray(payload?.common?.layoutState?.racks)) values.push(...payload.common.layoutState.racks);
  if (Array.isArray(payload?.compactCommon?.definitions)) values.push(...payload.compactCommon.definitions);
  if (Array.isArray(payload?.definitions)) values.push(...payload.definitions);
  if (Array.isArray(payload?.rackTypes)) values.push(...payload.rackTypes);
  return [...new Set(values.map(systemOf).filter(Boolean))];
}

function isCommonProject(project) {
  const moduleName = low(project?.module).replace(/[\s_-]+/g, "");
  if (["ortak", "common", "commondrawing", "ortakcizim"].includes(moduleName)) return true;
  if (project?.payload?.commonDrawing === true || project?.payload?.schema === "rafex-common-v3") return true;
  return projectSystems(project).length > 1;
}

function projectSummary(project) {
  const systems = projectSystems(project);
  const common = isCommonProject(project);
  return {
    id: project?.id,
    serial_no: project?.serial_no,
    project_name: project?.project_name || "",
    module: common ? "ortak" : project?.module || "",
    stored_module: project?.module || "",
    effective_module: common ? "ortak" : project?.module || "",
    is_common: common,
    systems,
    created_at: project?.created_at || project?.createdAt || null,
    updated_at: project?.updated_at || project?.updatedAt || null,
  };
}

async function readProjects(request, force = false) {
  const key = sessionKey(request);
  const cached = projectCache.get(key);
  if (!force && cached && Date.now() - cached.at < PROJECT_CACHE_TTL_MS) return cached.value;
  if (!force && projectInflight.has(key)) return projectInflight.get(key);

  const task = (async () => {
    const upstream = await upstreamFetch(request, "/api/projects", { method: "GET" });
    const text = await upstream.text();
    let value;
    try {
      value = text ? JSON.parse(text) : { projects: [] };
    } catch {
      throw new Error(`Proje listesi okunamadı (${upstream.status}).`);
    }
    if (!upstream.ok) {
      const message = value?.error || value?.message || `Proje listesi alınamadı (${upstream.status}).`;
      throw new Error(message);
    }
    projectCache.set(key, { at: Date.now(), value });
    return value;
  })();

  projectInflight.set(key, task);
  try {
    return await task;
  } finally {
    projectInflight.delete(key);
  }
}

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store",
      "x-rafex-api": "project-index-v90",
    },
  });
}

async function projectSummaryRoute(request) {
  try {
    const result = await readProjects(request);
    return jsonResponse({ projects: (result?.projects || []).map(projectSummary) });
  } catch (error) {
    return jsonResponse({ error: error?.message || "Projeler getirilemedi." }, 502);
  }
}

async function projectDetailRoute(request, key) {
  try {
    const result = await readProjects(request);
    const wanted = decodeURIComponent(key || "").trim();
    const wantedNumber = Number(wanted);
    const wantedPadded = Number.isFinite(wantedNumber)
      ? String(wantedNumber).padStart(4, "0")
      : wanted;
    const project = (result?.projects || []).find((item) => {
      const serial = String(item?.serial_no ?? "").padStart(4, "0");
      return (
        Number(item?.id) === wantedNumber ||
        Number(item?.serial_no) === wantedNumber ||
        serial === wantedPadded
      );
    });
    if (!project) return jsonResponse({ error: "Proje bulunamadı." }, 404);
    const normalized = isCommonProject(project) ? { ...project, module: "ortak" } : project;
    return jsonResponse({ project: normalized, summary: projectSummary(project) });
  } catch (error) {
    return jsonResponse({ error: error?.message || "Proje getirilemedi." }, 502);
  }
}

function invalidateProjectCache(request) {
  projectCache.delete(sessionKey(request));
}

async function proxyApi(request) {
  const upstream = await upstreamFetch(request);
  const headers = normalizedResponseHeaders(upstream);
  headers.set("x-rafex-api", "stream-proxy-v90");

  // Upstream identity encoding is requested, so the body can be streamed
  // directly instead of being copied into a second ArrayBuffer in memory.
  return new Response(request.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "GET" && path === "/api/projects/summary") {
      return projectSummaryRoute(request);
    }
    if (request.method === "GET" && path.startsWith("/api/project-detail/")) {
      return projectDetailRoute(request, path.slice("/api/project-detail/".length));
    }
    if (path.startsWith("/api/")) {
      const response = await proxyApi(request);
      if (
        path === "/api/projects" &&
        !["GET", "HEAD"].includes(request.method.toUpperCase())
      ) invalidateProjectCache(request);
      return response;
    }
    return worker.fetch(request, {});
  },
};
