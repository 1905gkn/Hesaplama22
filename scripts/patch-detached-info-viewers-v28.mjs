import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function patch(rel, apply) {
  const file = path.join(root, rel);
  let source = fs.readFileSync(file, "utf8");
  const next = apply(source);
  if (next === source) {
    console.log(`Info 3D v28: ${rel} zaten guncel.`);
    return;
  }
  fs.writeFileSync(file, next);
  console.log(`Info 3D v28: ${rel} guncellendi.`);
}

patch("client/b2b-viewer.entry.js", (source) => {
  if (source.includes("createDetached(canvas, options)")) return source;
  const needle = `  captureViews(options, settings) {\n    return captureB2BViews(options, settings);\n  },\n};`;
  const replacement = `  captureViews(options, settings) {\n    return captureB2BViews(options, settings);\n  },\n  createDetached(canvas, options) {\n    if (!(canvas instanceof HTMLCanvasElement)) throw new Error("B2B bilgi 3D tuvali bulunamadı.");\n    return new B2BViewer(canvas, options || {});\n  },\n};`;
  if (!source.includes(needle)) throw new Error("Info 3D v28: B2B API ekleme noktasi bulunamadi.");
  source = source.replace(needle, replacement);
  if (!source.includes("createDetached(canvas, options)")) throw new Error("Info 3D v28: B2B createDetached eklenemedi.");
  return source;
});

patch("client/mr-viewer.entry.js", (source) => {
  if (source.includes("createDetached(canvas, config)")) return source;
  const needle = `  captureView(config, settings) { return captureMRModuleView(config, settings); },\n  destroy() { active?.destroy(); active = null; },`;
  const replacement = `  captureView(config, settings) { return captureMRModuleView(config, settings); },\n  createDetached(canvas, config) {\n    if (!(canvas instanceof HTMLCanvasElement)) throw new Error("MR bilgi 3D tuvali bulunamadı.");\n    return new MRViewer(canvas, { config: config || {} });\n  },\n  destroy() { active?.destroy(); active = null; },`;
  if (!source.includes(needle)) throw new Error("Info 3D v28: MR API ekleme noktasi bulunamadi.");
  source = source.replace(needle, replacement);
  if (!source.includes("createDetached(canvas, config)")) throw new Error("Info 3D v28: MR createDetached eklenemedi.");
  return source;
});

console.log("Info 3D v28: B2B ve MR bilgi pencereleri ana 3D sahneyi bozmadan bagimsiz viewer acabilir.");
