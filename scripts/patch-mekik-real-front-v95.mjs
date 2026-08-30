import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const sourcePath = path.join(root, "client/mekik-front-viewer.entry.js");
const bundlePath = path.join(root, "dist/mekik-front-viewer.v95.js");
const exactGlbPath = path.join(root, "dist/mekikson2.glb");
const esbuild = path.join(root, "node_modules/.bin/esbuild");
const exactAssetCommit = "86b7da0ae24dd594fdccf8c81d6113c83bd736f6";
const exactAssetRoot = `https://raw.githubusercontent.com/1905gkn/Hesaplama22/${exactAssetCommit}/assets/mekik-v96/front`;

if (!fs.existsSync(workerPath)) throw new Error("v95: dist/server/index.js bulunamadi");
if (!fs.existsSync(sourcePath)) throw new Error("v95: Mekik viewer source bulunamadi");

async function buildExactGlb() {
  const chunks = [];
  for (const name of ["part-00", "part-01", "part-02"]) {
    const response = await fetch(`${exactAssetRoot}/${name}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`v95: exact GLB parcasi indirilemedi ${name}: ${response.status}`);
    chunks.push((await response.text()).trim());
  }
  const compressed = Buffer.from(chunks.join(""), "base64");
  const glb = zlib.gunzipSync(compressed);
  if (glb.subarray(0, 4).toString("ascii") !== "glTF") throw new Error("v95: exact GLB glTF imzasi gecersiz");
  fs.writeFileSync(exactGlbPath, glb);
  const hash = crypto.createHash("sha256").update(glb).digest("hex");
  console.log(`v95: exact Mekik GLB hazir: ${glb.length} bytes sha256=${hash}`);
  return glb;
}

const exactGlb = await buildExactGlb();
const exactGlbBase64 = exactGlb.toString("base64");

execFileSync(esbuild, [sourcePath, "--bundle", "--format=iife", "--minify", "--target=es2022", `--outfile=${bundlePath}`], { stdio:"inherit" });
const viewer = fs.readFileSync(bundlePath);
const viewerBase64 = viewer.toString("base64");
let worker = fs.readFileSync(workerPath, "utf8");

const htmlMatch = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!htmlMatch) throw new Error("v95: HTML_BASE64 bulunamadi");
let html = Buffer.from(htmlMatch[3], "base64").toString("utf8");

html = html
  .replace(/<script\s+data-rafex-mekik-main-front="v93">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<script\s+data-rafex-mekik-glb-front="v94">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<meta\s+data-rafex-mekik-real-glb-front="v95"[^>]*>\s*/g, "")
  .replace(/<script\s+defer\s+src="\/mekik-front-viewer\.js\?v=v95"><\/script>\s*/g, "");

const headClose = html.indexOf("</head>");
if (headClose < 0) throw new Error("v95: </head> bulunamadi");
const boot = '<meta data-rafex-mekik-real-glb-front="v95-exact-mekikson2"><script defer src="/mekik-front-viewer.js?v=v95-exact"></script>';
html = html.slice(0, headClose) + boot + html.slice(headClose);

if (html.includes('data-rafex-mekik-glb-front="v94"')) throw new Error("v95: eski v94 SVG override temizlenemedi");
if (!html.includes('data-rafex-mekik-real-glb-front="v95-exact-mekikson2"')) throw new Error("v95: HTML marker eksik");

const encodedHtml = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(htmlMatch[0], `${htmlMatch[1]}${htmlMatch[2]}${encodedHtml}${htmlMatch[2]}`);

worker = worker.replace(/const\s+MEKIK_FRONT_VIEWER_V95_BASE64\s*=\s*["'][A-Za-z0-9+/=]+["'];?\s*/g, "");
worker = worker.replace(/const\s+MEKIKSON2_EXACT_GLB_BASE64\s*=\s*["'][A-Za-z0-9+/=]+["'];?\s*/g, "");
const htmlConstAt = worker.indexOf("const HTML_BASE64");
if (htmlConstAt < 0) throw new Error("v95: HTML const konumu bulunamadi");
worker = worker.slice(0, htmlConstAt) + `const MEKIK_FRONT_VIEWER_V95_BASE64 = "${viewerBase64}";\nconst MEKIKSON2_EXACT_GLB_BASE64 = "${exactGlbBase64}";\n` + worker.slice(htmlConstAt);

worker = worker.replace(/\s*if\s*\(path\s*===\s*"\/mekik-front-viewer\.js"\)\s*return\s+binary\(MEKIK_FRONT_VIEWER_V95_BASE64,\s*"text\/javascript; charset=utf-8"\);/g, "");
worker = worker.replace(/\s*if\s*\(path\s*===\s*"\/mekikson2\.glb"\)[\s\S]*?;\s*(?=if\s*\(|const\s|$)/g, "");
const routeAnchor = '    if (path === "/b2b-viewer.js")';
const routeAt = worker.indexOf(routeAnchor);
if (routeAt < 0) throw new Error("v95: viewer route anchor bulunamadi");
const route = '    if (path === "/mekik-front-viewer.js")\n      return binary(MEKIK_FRONT_VIEWER_V95_BASE64, "text/javascript; charset=utf-8");\n    if (path === "/mekikson2.glb")\n      return binary(MEKIKSON2_EXACT_GLB_BASE64, "model/gltf-binary");\n';
worker = worker.slice(0, routeAt) + route + worker.slice(routeAt);

for (const required of ['MEKIK_FRONT_VIEWER_V95_BASE64','MEKIKSON2_EXACT_GLB_BASE64','path === "/mekik-front-viewer.js"','path === "/mekikson2.glb"']) {
  if (!worker.includes(required)) throw new Error(`v95: eksik ${required}`);
}
const hm = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
const hh = hm ? Buffer.from(hm[2], "base64").toString("utf8") : "";
if (!hh.includes('data-rafex-mekik-real-glb-front="v95-exact-mekikson2"')) throw new Error("v95: marker worker icinde bulunamadi");

fs.writeFileSync(workerPath, worker);
execFileSync(process.execPath, ["--check", workerPath], { stdio:"inherit" });
console.log("v95: Mekik ön görünüş artık exact mekikson2 GLB kaynağını kullanıyor; B2B/üst/yan görünüşe dokunulmadı.");
