import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const sourcePath = path.join(root, "client/mekik-front-viewer.entry.js");
const bundlePath = path.join(root, "dist/mekik-front-viewer.v95.js");
const esbuild = path.join(root, "node_modules/.bin/esbuild");

if (!fs.existsSync(workerPath)) throw new Error("v95: dist/server/index.js bulunamadi");
if (!fs.existsSync(sourcePath)) throw new Error("v95: Mekik viewer source bulunamadi");

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
const boot = '<meta data-rafex-mekik-real-glb-front="v95"><script defer src="/mekik-front-viewer.js?v=v95"></script>';
html = html.slice(0, headClose) + boot + html.slice(headClose);

if (html.includes('data-rafex-mekik-glb-front="v94"')) throw new Error("v95: eski v94 SVG override temizlenemedi");
if (!html.includes('data-rafex-mekik-real-glb-front="v95"')) throw new Error("v95: HTML marker eksik");

const encodedHtml = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(htmlMatch[0], `${htmlMatch[1]}${htmlMatch[2]}${encodedHtml}${htmlMatch[2]}`);

worker = worker.replace(/const\s+MEKIK_FRONT_VIEWER_V95_BASE64\s*=\s*["'][A-Za-z0-9+/=]+["'];?\s*/g, "");
const htmlConstAt = worker.indexOf("const HTML_BASE64");
if (htmlConstAt < 0) throw new Error("v95: HTML const konumu bulunamadi");
worker = worker.slice(0, htmlConstAt) + `const MEKIK_FRONT_VIEWER_V95_BASE64 = "${viewerBase64}";\n` + worker.slice(htmlConstAt);

worker = worker.replace(/\s*if\s*\(path\s*===\s*"\/mekik-front-viewer\.js"\)\s*return\s+binary\(MEKIK_FRONT_VIEWER_V95_BASE64,\s*"text\/javascript; charset=utf-8"\);/g, "");
const routeAnchor = '    if (path === "/b2b-viewer.js")';
const routeAt = worker.indexOf(routeAnchor);
if (routeAt < 0) throw new Error("v95: viewer route anchor bulunamadi");
const route = '    if (path === "/mekik-front-viewer.js")\n      return binary(MEKIK_FRONT_VIEWER_V95_BASE64, "text/javascript; charset=utf-8");\n';
worker = worker.slice(0, routeAt) + route + worker.slice(routeAt);

for (const required of ['MEKIK_FRONT_VIEWER_V95_BASE64','path === "/mekik-front-viewer.js"']) {
  if (!worker.includes(required)) throw new Error(`v95: eksik ${required}`);
}
const hm = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
const hh = hm ? Buffer.from(hm[2], "base64").toString("utf8") : "";
if (!hh.includes('data-rafex-mekik-real-glb-front="v95"')) throw new Error("v95: marker worker icinde bulunamadi");

fs.writeFileSync(workerPath, worker);
execFileSync(process.execPath, ["--check", workerPath], { stdio:"inherit" });
console.log("v95: Mekik ana Önden Görünüş gerçek Three.js GLB renderer aktif; eski v94 2D projeksiyon kaldırıldı.");
