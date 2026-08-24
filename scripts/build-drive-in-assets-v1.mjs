import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { build } from "esbuild";

const root = process.cwd();
const sourceDir = path.join(root, "assets", "drive-in-src");
const distDir = path.join(root, "dist");
const driveDir = path.join(distDir, "drive-in");
const workerPath = path.join(distDir, "server", "index.js");
fs.mkdirSync(driveDir, { recursive: true });

function decodeChunks(prefix, outputName) {
  const files = fs.readdirSync(sourceDir)
    .filter((name) => new RegExp(`^${prefix}\\.\\d+$`).test(name))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  if (!files.length) throw new Error(`Drive In asset parçaları bulunamadı: ${prefix}`);
  const encoded = files.map((name) => fs.readFileSync(path.join(sourceDir, name), "utf8").trim()).join("");
  const compressed = Buffer.from(encoded, "base64");
  const binary = zlib.gunzipSync(compressed);
  if (binary.length < 20 || binary.subarray(0, 4).toString("ascii") !== "glTF") throw new Error(`Drive In GLB geçersiz: ${prefix}`);
  const output = path.join(driveDir, outputName);
  fs.writeFileSync(output, binary);
  return output;
}

const ayakPath = decodeChunks("drive-in-ayak-top", "drive-in-ayak-top.glb");
const montajPath = decodeChunks("drive-in-montaj-lite", "drive-in-montaj.glb");
const rayPath = decodeChunks("drive-in-ray", "drive-in-ray.glb");
const viewerPath = path.join(distDir, "drive-in-viewer.js");

await build({
  entryPoints: [path.join(root, "client", "drive-in-viewer.entry.js")],
  bundle: true,
  format: "iife",
  minify: true,
  target: "es2022",
  outfile: viewerPath,
});

let worker = fs.readFileSync(workerPath, "utf8");
if (!worker.includes("const DRIVE_IN_VIEWER_BASE64 =")) {
  const anchor = "const DRACO_DECODER_BASE64 = ";
  const index = worker.indexOf(anchor);
  if (index < 0) throw new Error("Drive In worker sabit ekleme noktası bulunamadı.");
  const constants = [
    `const DRIVE_IN_AYAK_BASE64 = "${fs.readFileSync(ayakPath).toString("base64")}";`,
    `const DRIVE_IN_MONTAJ_BASE64 = "${fs.readFileSync(montajPath).toString("base64")}";`,
    `const DRIVE_IN_RAY_BASE64 = "${fs.readFileSync(rayPath).toString("base64")}";`,
    `const DRIVE_IN_VIEWER_BASE64 = "${fs.readFileSync(viewerPath).toString("base64")}";`,
  ].join("\n") + "\n";
  worker = worker.slice(0, index) + constants + worker.slice(index);
}

if (!worker.includes('path === "/drive-in-viewer.js"')) {
  const route = '    if (path === "/b2b-viewer.js")';
  if (!worker.includes(route)) throw new Error("Drive In worker route ekleme noktası bulunamadı.");
  const routes = `    if (path === "/drive-in/drive-in-ayak-top.glb") return binary(DRIVE_IN_AYAK_BASE64, "model/gltf-binary");\n    if (path === "/drive-in/drive-in-montaj.glb") return binary(DRIVE_IN_MONTAJ_BASE64, "model/gltf-binary");\n    if (path === "/drive-in/drive-in-ray.glb") return binary(DRIVE_IN_RAY_BASE64, "model/gltf-binary");\n    if (path === "/drive-in-viewer.js") return new Response(Uint8Array.from(atob(DRIVE_IN_VIEWER_BASE64),(c)=>c.charCodeAt(0)),{headers:{"content-type":"text/javascript; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});\n`;
  worker = worker.replace(route, routes + route);
}

fs.writeFileSync(workerPath, worker);
for (const required of ["DRIVE_IN_AYAK_BASE64", "DRIVE_IN_MONTAJ_BASE64", "DRIVE_IN_RAY_BASE64", "DRIVE_IN_VIEWER_BASE64", 'path === "/drive-in-viewer.js"']) {
  if (!worker.includes(required)) throw new Error(`Drive In build doğrulaması eksik: ${required}`);
}
console.log("Drive In v1: kullanıcının üç GLB kaynağı hazırlandı, viewer bundle ve worker route'ları eklendi.");
