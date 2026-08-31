import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const dist = path.join(root, "dist");
const workerPath = path.join(dist, "server/index.js");
const assetRoot = path.join(root, "assets/mekik-front-src");

const assets = [
  ["mekik-front-ayak.glb.gz", "mekik-front-ayak.glb"],
  ["mekik-front-travers.glb.gz", "mekik-front-travers.glb"],
  ["mekik-front-palet.glb.gz", "mekik-front-palet.glb"],
  ["mekik-front-reference.glb.gz", "mekik-front-reference.glb"],
];

for (const [sourceName, outputName] of assets) {
  const sourcePath = path.join(assetRoot, sourceName);
  const outputPath = path.join(dist, outputName);
  const compressed = fs.readFileSync(sourcePath);
  const glb = zlib.gunzipSync(compressed);
  fs.writeFileSync(outputPath, glb);
  if (glb.length < 12 || glb.toString("ascii", 0, 4) !== "glTF") {
    throw new Error(`Mekik static asset gecersiz: ${outputName}`);
  }
}

const viewerPath = path.join(dist, "mekik-front-viewer.js");
if (!fs.existsSync(viewerPath) || fs.statSync(viewerPath).size < 1000) {
  throw new Error("Mekik static viewer bulunamadi.");
}

let worker = fs.readFileSync(workerPath, "utf8");
const beforeBytes = Buffer.byteLength(worker);

worker = worker
  .replace(/\/\* RAFEX_MEKIK_FRONT_GLB_V2_CONSTANTS_START \*\/[\s\S]*?\/\* RAFEX_MEKIK_FRONT_GLB_V2_CONSTANTS_END \*\/\s*/g, "")
  .replace(/\s*\/\* RAFEX_MEKIK_FRONT_GLB_V2_ROUTES_START \*\/[\s\S]*?\/\* RAFEX_MEKIK_FRONT_GLB_V2_ROUTES_END \*\/\s*/g, "\n");

for (const forbidden of [
  "RAFEX_MEKIK_FRONT_AYAK_GZIP_BASE64",
  "RAFEX_MEKIK_FRONT_REFERENCE_GZIP_BASE64",
  "RAFEX_MEKIK_FRONT_VIEWER_BASE64",
]) {
  if (worker.includes(forbidden)) throw new Error(`Mekik server payload temizlenemedi: ${forbidden}`);
}

const afterBytes = Buffer.byteLength(worker);
const savedBytes = beforeBytes - afterBytes;
if (savedBytes < 5_000_000) {
  throw new Error(`Mekik server payload beklenenden az kuculdu: ${savedBytes} byte`);
}

fs.writeFileSync(workerPath, worker);
console.log(`Mekik GLB payloadlari static CDN'e tasindi. Server bundle ${savedBytes} byte kuculdu.`);
