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

const assets = [
  ["drive-in-v3-ayak-top", "drive-in-ayak-top.glb", "DRIVE_IN_AYAK_BASE64"],
  ["drive-in-v3-ray", "drive-in-ray.glb", "DRIVE_IN_RAY_BASE64"],
  ["drive-in-v3-konsol", "drive-in-konsol.glb", "DRIVE_IN_KONSOL_BASE64"],
  ["drive-in-v3-arabag", "drive-in-arabag.glb", "DRIVE_IN_ARABAG_BASE64"],
  ["drive-in-v3-palet", "drive-in-palet.glb", "DRIVE_IN_PALET_BASE64"],
  ["drive-in-v3-montaj-reference", "drive-in-montaj-reference.glb", "DRIVE_IN_MONTAJ_REFERENCE_BASE64"],
].map(([prefix, outputName, constant]) => ({ outputName, constant, path: decodeChunks(prefix, outputName) }));
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
    ...assets.map((asset) => `const ${asset.constant} = "${fs.readFileSync(asset.path).toString("base64")}";`),
    `const DRIVE_IN_VIEWER_BASE64 = "${fs.readFileSync(viewerPath).toString("base64")}";`,
  ].join("\n") + "\n";
  worker = worker.slice(0, index) + constants + worker.slice(index);
}

if (!worker.includes('path === "/drive-in-viewer.js"')) {
  const route = '    if (path === "/b2b-viewer.js")';
  if (!worker.includes(route)) throw new Error("Drive In worker route ekleme noktası bulunamadı.");
  const assetRoutes = assets.map((asset) => `    if (path === "/drive-in/${asset.outputName}") return binary(${asset.constant}, "model/gltf-binary");`).join("\n");
  const routes = `${assetRoutes}\n    if (path === "/drive-in-viewer.js") return new Response(Uint8Array.from(atob(DRIVE_IN_VIEWER_BASE64),(c)=>c.charCodeAt(0)),{headers:{"content-type":"text/javascript; charset=utf-8","cache-control":"public, max-age=31536000, immutable","x-content-type-options":"nosniff"}});\n`;
  worker = worker.replace(route, routes + route);
}

fs.writeFileSync(workerPath, worker);
for (const required of [...assets.map((asset) => asset.constant), "DRIVE_IN_VIEWER_BASE64", 'path === "/drive-in-viewer.js"']) {
  if (!worker.includes(required)) throw new Error(`Drive In build doğrulaması eksik: ${required}`);
}
console.log("Drive In v3: altı GLB kaynağı hazırlandı; beş modüler parça viewer için, büyük montaj referans doğrulama için servis ediliyor.");
