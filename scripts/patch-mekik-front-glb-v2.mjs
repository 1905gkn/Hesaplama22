import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const viewerSource = path.join(root, "client/mekik-front-viewer.entry.js");
const viewerBundle = path.join(root, "dist/mekik-front-viewer.js");
const assetRoot = path.join(root, "assets/mekik-front-src");

execFileSync(path.join(root, "node_modules/.bin/esbuild"), [
  viewerSource,
  "--bundle",
  "--format=iife",
  "--minify",
  "--target=es2022",
  `--outfile=${viewerBundle}`,
], { stdio: "inherit" });

const readBase64 = (name) => fs.readFileSync(path.join(assetRoot, name)).toString("base64");
const ayakGzip = readBase64("mekik-front-ayak.glb.gz");
const traversGzip = readBase64("mekik-front-travers.glb.gz");
const paletGzip = readBase64("mekik-front-palet.glb.gz");
const referenceGzip = readBase64("mekik-front-reference.glb.gz");
const viewerBase64 = fs.readFileSync(viewerBundle).toString("base64");

let worker = fs.readFileSync(workerPath, "utf8");
worker = worker
  .replace(/\/\* RAFEX_MEKIK_FRONT_GLB_V2_CONSTANTS_START \*\/[\s\S]*?\/\* RAFEX_MEKIK_FRONT_GLB_V2_CONSTANTS_END \*\/\s*/g, "")
  .replace(/\s*\/\* RAFEX_MEKIK_FRONT_GLB_V2_ROUTES_START \*\/[\s\S]*?\/\* RAFEX_MEKIK_FRONT_GLB_V2_ROUTES_END \*\/\s*/g, "\n");

const htmlMatch = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!htmlMatch) throw new Error("Mekik front GLB v2: HTML_BASE64 bulunamadi.");
let html = Buffer.from(htmlMatch[2], "base64").toString("utf8");

html = html
  .replace(/<style\s+data-rafex-mekik-front-visual-clear="v1">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-mekik-front-visual-clear="v1">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<style\s+data-rafex-mekik-front-glb="v2">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-mekik-front-glb="v2"[^>]*><\/script>\s*/g, "");

const frontRuntime = String.raw`<style data-rafex-mekik-front-glb="v2">
#m2Front[data-rafex-mekik-front-glb="v2"]{position:relative!important;overflow:hidden!important;background:#f7faf8!important;min-height:520px!important}
#m2Front[data-rafex-mekik-front-glb="v2"]>.rafex-mekik-front-glb-canvas-v2{display:block!important;width:100%!important;height:100%!important;min-height:520px!important;touch-action:none}
#m2Front[data-rafex-mekik-front-glb="v2"]>.rafex-mekik-front-status-v2{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3;padding:10px 14px;border-radius:8px;background:#173c2d;color:#fff;font:800 13px/1.25 Arial,sans-serif;box-shadow:0 8px 24px rgba(20,43,34,.18)}
#m2Front[data-rafex-mekik-front-glb="v2"]>.rafex-mekik-front-status-v2[data-state="error"]{background:#8d2020}
#m2Front[data-rafex-mekik-front-glb="v2"]>.rafex-mekik-front-info-v2{position:absolute;left:12px;bottom:12px;z-index:2;padding:7px 10px;border:1px solid rgba(23,60,45,.22);border-radius:7px;background:rgba(255,255,255,.9);color:#173c2d;font:900 12px/1.2 Arial,sans-serif;box-shadow:0 5px 16px rgba(20,43,34,.1);pointer-events:none}
@media(max-width:760px){#m2Front[data-rafex-mekik-front-glb="v2"],#m2Front[data-rafex-mekik-front-glb="v2"]>.rafex-mekik-front-glb-canvas-v2{min-height:400px!important}}
</style>
<script data-rafex-mekik-front-glb="v2" src="/mekik-front-viewer.js?v=mekik-front-glb-v20"></script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Mekik front GLB v2: </body> bulunamadi.");
html = html.slice(0, bodyEnd) + frontRuntime + "\n" + html.slice(bodyEnd);

if (html.includes('data-rafex-mekik-front-visual-clear="v1"')) throw new Error("Mekik front GLB v2: eski temizleme runtime'i kaldi.");
if (!html.includes('data-rafex-mekik-front-glb="v2"')) throw new Error("Mekik front GLB v2: runtime eklenemedi.");

const encodedHtml = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(htmlMatch[0], `const HTML_BASE64 =\n  "${encodedHtml}";`);

const constants = `/* RAFEX_MEKIK_FRONT_GLB_V2_CONSTANTS_START */\nconst RAFEX_MEKIK_FRONT_AYAK_GZIP_BASE64 = "${ayakGzip}";\nconst RAFEX_MEKIK_FRONT_TRAVERS_GZIP_BASE64 = "${traversGzip}";\nconst RAFEX_MEKIK_FRONT_PALET_GZIP_BASE64 = "${paletGzip}";\nconst RAFEX_MEKIK_FRONT_REFERENCE_GZIP_BASE64 = "${referenceGzip}";\nconst RAFEX_MEKIK_FRONT_VIEWER_BASE64 = "${viewerBase64}";\n/* RAFEX_MEKIK_FRONT_GLB_V2_CONSTANTS_END */\n`;
const htmlIndex = worker.indexOf("const HTML_BASE64");
if (htmlIndex < 0) throw new Error("Mekik front GLB v2: sabit ekleme noktasi bulunamadi.");
worker = worker.slice(0, htmlIndex) + constants + worker.slice(htmlIndex);

const routeAnchor = '    if (path === "/b2b-viewer.js")';
if (!worker.includes(routeAnchor)) throw new Error("Mekik front GLB v2: route ekleme noktasi bulunamadi.");
const routes = `    /* RAFEX_MEKIK_FRONT_GLB_V2_ROUTES_START */\n    if (path === "/mekik-front-ayak.glb") return new Response(Uint8Array.from(atob(RAFEX_MEKIK_FRONT_AYAK_GZIP_BASE64),(c)=>c.charCodeAt(0)),{headers:{"content-type":"model/gltf-binary","content-encoding":"gzip","cache-control":"public, max-age=31536000, immutable","x-content-type-options":"nosniff"}});\n    if (path === "/mekik-front-travers.glb") return new Response(Uint8Array.from(atob(RAFEX_MEKIK_FRONT_TRAVERS_GZIP_BASE64),(c)=>c.charCodeAt(0)),{headers:{"content-type":"model/gltf-binary","content-encoding":"gzip","cache-control":"public, max-age=31536000, immutable","x-content-type-options":"nosniff"}});\n    if (path === "/mekik-front-palet.glb") return new Response(Uint8Array.from(atob(RAFEX_MEKIK_FRONT_PALET_GZIP_BASE64),(c)=>c.charCodeAt(0)),{headers:{"content-type":"model/gltf-binary","content-encoding":"gzip","cache-control":"public, max-age=31536000, immutable","x-content-type-options":"nosniff"}});\n    if (path === "/mekik-front-reference.glb") return new Response(Uint8Array.from(atob(RAFEX_MEKIK_FRONT_REFERENCE_GZIP_BASE64),(c)=>c.charCodeAt(0)),{headers:{"content-type":"model/gltf-binary","content-encoding":"gzip","cache-control":"public, max-age=31536000, immutable","x-content-type-options":"nosniff"}});\n    if (path === "/mekik-front-viewer.js") return new Response(Uint8Array.from(atob(RAFEX_MEKIK_FRONT_VIEWER_BASE64),(c)=>c.charCodeAt(0)),{headers:{"content-type":"text/javascript; charset=utf-8","cache-control":"public, max-age=31536000, immutable","x-content-type-options":"nosniff"}});\n    /* RAFEX_MEKIK_FRONT_GLB_V2_ROUTES_END */\n`;
worker = worker.replace(routeAnchor, routes + routeAnchor);

for (const marker of [
  "RAFEX_MEKIK_FRONT_GLB_V2_CONSTANTS_START",
  "RAFEX_MEKIK_FRONT_GLB_V2_ROUTES_START",
  "RAFEX_MEKIK_FRONT_REFERENCE_GZIP_BASE64",
  "RAFEX_MEKIK_FRONT_PALET_GZIP_BASE64",
  "/mekik-front-viewer.js",
]) {
  if (!worker.includes(marker)) throw new Error(`Mekik front GLB v2: ${marker} eklenemedi.`);
}

fs.writeFileSync(workerPath, worker);
console.log("Mekik front GLB v2: tam montaj referansi + dinamik ayak/travers renderer yalniz Mekik on gorunusune eklendi.");
