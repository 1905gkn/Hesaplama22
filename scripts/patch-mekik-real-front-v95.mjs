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

if (!fs.existsSync(workerPath)) throw new Error("v96: dist/server/index.js bulunamadi");
if (!fs.existsSync(sourcePath)) throw new Error("v96: Mekik viewer source bulunamadi");

async function buildExactGlb() {
  const encodedParts = [];
  for (const name of ["part-00", "part-01", "part-02"]) {
    const response = await fetch(`${exactAssetRoot}/${name}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`v96: exact GLB parcasi indirilemedi ${name}: ${response.status}`);
    encodedParts.push((await response.text()).trim());
  }
  const encoded = encodedParts.join("");
  const compressed = Buffer.from(encoded, "base64");
  if (compressed[0] !== 0x1f || compressed[1] !== 0x8b) throw new Error("v96: exact asset gzip degil");

  let glb;
  try {
    glb = zlib.gunzipSync(compressed);
  } catch (error) {
    if (error?.code !== "Z_BUF_ERROR") throw error;
    glb = zlib.gunzipSync(compressed, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
    console.log("v96: gzip footer eksik; Z_SYNC_FLUSH ile payload kurtarildi");
  }

  if (glb.length < 12 || glb.subarray(0, 4).toString("ascii") !== "glTF") {
    throw new Error(`v96: exact GLB imzasi gecersiz: ${glb.subarray(0,4).toString("hex")}`);
  }
  const version = glb.readUInt32LE(4);
  const declaredLength = glb.readUInt32LE(8);
  if (version !== 2) throw new Error(`v96: GLB version beklenmiyor: ${version}`);
  if (declaredLength !== glb.length) {
    throw new Error(`v96: exact GLB eksik: declared=${declaredLength} actual=${glb.length}`);
  }

  fs.writeFileSync(exactGlbPath, glb);
  const hash = crypto.createHash("sha256").update(glb).digest("hex");
  console.log(`v96: exact Mekik GLB dogrulandi: ${glb.length} bytes sha256=${hash}`);
  return glb;
}

const exactGlb = await buildExactGlb();
const exactGlbBase64 = exactGlb.toString("base64");

execFileSync(esbuild, [sourcePath, "--bundle", "--format=iife", "--minify", "--target=es2022", `--outfile=${bundlePath}`], { stdio:"inherit" });
const viewerBase64 = fs.readFileSync(bundlePath).toString("base64");
let worker = fs.readFileSync(workerPath, "utf8");

const htmlMatch = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!htmlMatch) throw new Error("v96: HTML_BASE64 bulunamadi");
let html = Buffer.from(htmlMatch[3], "base64").toString("utf8");
html = html
  .replace(/<script\s+data-rafex-mekik-main-front="v93">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<script\s+data-rafex-mekik-glb-front="v94">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<meta\s+data-rafex-mekik-real-glb-front="[^"]*"[^>]*>\s*/g, "")
  .replace(/<script\s+defer\s+src="\/mekik-front-viewer\.js[^\"]*"><\/script>\s*/g, "");
const headClose = html.indexOf("</head>");
if (headClose < 0) throw new Error("v96: </head> bulunamadi");
html = html.slice(0, headClose) + '<meta data-rafex-mekik-real-glb-front="v96-exact"><script defer src="/mekik-front-viewer.js?v=v96-exact"></script>' + html.slice(headClose);
if (html.includes('data-rafex-mekik-glb-front="v94"')) throw new Error("v96: eski v94 SVG override temizlenemedi");
worker = worker.replace(htmlMatch[0], `${htmlMatch[1]}${htmlMatch[2]}${Buffer.from(html, "utf8").toString("base64")}${htmlMatch[2]}`);

worker = worker.replace(/const\s+MEKIK_FRONT_VIEWER_V95_BASE64\s*=\s*["'][A-Za-z0-9+/=]+["'];?\s*/g, "");
worker = worker.replace(/const\s+MEKIKSON2_EXACT_GLB_BASE64\s*=\s*["'][A-Za-z0-9+/=]+["'];?\s*/g, "");
const htmlConstAt = worker.indexOf("const HTML_BASE64");
if (htmlConstAt < 0) throw new Error("v96: HTML const konumu bulunamadi");
worker = worker.slice(0, htmlConstAt) + `const MEKIK_FRONT_VIEWER_V95_BASE64 = "${viewerBase64}";\nconst MEKIKSON2_EXACT_GLB_BASE64 = "${exactGlbBase64}";\n` + worker.slice(htmlConstAt);

worker = worker.replace(/\s*if\s*\(path\s*===\s*"\/mekik-front-viewer\.js"\)\s*return\s+binary\(MEKIK_FRONT_VIEWER_V95_BASE64,\s*"text\/javascript; charset=utf-8"\);/g, "");
worker = worker.replace(/\s*if\s*\(path\s*===\s*"\/mekikson2\.glb"\)\s*return\s+binary\(MEKIKSON2_EXACT_GLB_BASE64,\s*"model\/gltf-binary"\);/g, "");
const routeAnchor = '    if (path === "/b2b-viewer.js")';
const routeAt = worker.indexOf(routeAnchor);
if (routeAt < 0) throw new Error("v96: viewer route anchor bulunamadi");
const routes = '    if (path === "/mekik-front-viewer.js")\n      return binary(MEKIK_FRONT_VIEWER_V95_BASE64, "text/javascript; charset=utf-8");\n    if (path === "/mekikson2.glb")\n      return binary(MEKIKSON2_EXACT_GLB_BASE64, "model/gltf-binary");\n';
worker = worker.slice(0, routeAt) + routes + worker.slice(routeAt);

for (const required of ['MEKIKSON2_EXACT_GLB_BASE64','path === "/mekikson2.glb"','data-rafex-mekik-real-glb-front']) {
  if (!worker.includes(required)) throw new Error(`v96: eksik ${required}`);
}
fs.writeFileSync(workerPath, worker);
execFileSync(process.execPath, ["--check", workerPath], { stdio:"inherit" });
console.log("v96-exact: Mekik ön görünüş exact yüklenen GLB ile hazır; B2B/üst/yan görünüş değiştirilmedi.");
