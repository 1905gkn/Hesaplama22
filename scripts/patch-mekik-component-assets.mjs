import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const ayakPayloadPath = path.join(root, "assets/mekik-front-ayak.glb.br.b64");
const traversPayloadPath = path.join(root, "assets/mekik-front-travers.glb.br.b64");
const ayakOut = path.join(root, "dist/mekik-front-ayak.glb");
const traversOut = path.join(root, "dist/mekik-front-travers.glb");

if (!fs.existsSync(workerPath)) throw new Error("Mekik component assets: dist/server/index.js bulunamadi");

const decode = (payloadPath) => zlib.brotliDecompressSync(Buffer.from(fs.readFileSync(payloadPath, "utf8").trim(), "base64"));
const ayak = decode(ayakPayloadPath);
const travers = decode(traversPayloadPath);
fs.writeFileSync(ayakOut, ayak);
fs.writeFileSync(traversOut, travers);

let worker = fs.readFileSync(workerPath, "utf8");
worker = worker
  .replace(/const\s+MEKIK_FRONT_AYAK_BASE64\s*=\s*["'][A-Za-z0-9+/=]+["'];?\s*/g, "")
  .replace(/const\s+MEKIK_FRONT_TRAVERS_BASE64\s*=\s*["'][A-Za-z0-9+/=]+["'];?\s*/g, "")
  .replace(/\s*if\s*\(path\s*===\s*"\/mekik-front-ayak\.glb"\)\s*return\s+binary\(MEKIK_FRONT_AYAK_BASE64,\s*"model\/gltf-binary"\);/g, "")
  .replace(/\s*if\s*\(path\s*===\s*"\/mekik-front-travers\.glb"\)\s*return\s+binary\(MEKIK_FRONT_TRAVERS_BASE64,\s*"model\/gltf-binary"\);/g, "");

const htmlAt = worker.indexOf("const HTML_BASE64");
if (htmlAt < 0) throw new Error("Mekik component assets: HTML_BASE64 bulunamadi");
const constants = `const MEKIK_FRONT_AYAK_BASE64 = "${ayak.toString("base64")}";\nconst MEKIK_FRONT_TRAVERS_BASE64 = "${travers.toString("base64")}";\n`;
worker = worker.slice(0, htmlAt) + constants + worker.slice(htmlAt);

const routeAnchor = '    if (path === "/b2b-viewer.js")';
const routeAt = worker.indexOf(routeAnchor);
if (routeAt < 0) throw new Error("Mekik component assets: route anchor bulunamadi");
const routes = '    if (path === "/mekik-front-ayak.glb") return binary(MEKIK_FRONT_AYAK_BASE64, "model/gltf-binary");\n    if (path === "/mekik-front-travers.glb") return binary(MEKIK_FRONT_TRAVERS_BASE64, "model/gltf-binary");\n';
worker = worker.slice(0, routeAt) + routes + worker.slice(routeAt);

fs.writeFileSync(workerPath, worker);
console.log(`Mekik component assets aktif: ayak=${ayak.length} byte, travers=${travers.length} byte.`);
