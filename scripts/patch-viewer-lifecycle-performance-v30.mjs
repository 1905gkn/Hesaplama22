import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function patchFile(rel, apply) {
  const p = path.join(root, rel);
  let src = fs.readFileSync(p, "utf8");
  const next = apply(src);
  if (next === src) {
    console.log(`v30: ${rel} zaten guncel.`);
    return;
  }
  fs.writeFileSync(p, next);
  console.log(`v30: ${rel} guncellendi.`);
}

patchFile("client/b2b-viewer.entry.js", (src) => {
  if (src.includes("__rafexLifecycleV30")) return src;

  src = src.replace(
    "    this.onResize = this.onResize.bind(this);\n    this.animate = this.animate.bind(this);",
    "    this.onResize = this.onResize.bind(this);\n    this.animate = this.animate.bind(this);\n    this.animationFrame = null;\n    this.__rafexLifecycleV30 = true;"
  );

  src = src.replace(
    "    requestAnimationFrame(this.animate);",
    "    this.animationFrame = requestAnimationFrame(this.animate);"
  );

  src = src.replace(
`  animate() {
    if (this.destroyed) return;
    this.controls.update();
    this.dimensionLabels.forEach((object)=>{object.getWorldPosition(this.dimensionWorldPosition);const ratio=clamp(this.camera.position.distanceTo(this.dimensionWorldPosition)/12000,1,2.65),base=object.userData.baseScale;object.scale.set(base.x*ratio,base.y*ratio,1);});
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  destroy() {
    this.destroyed = true;
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
  }`,
`  animate() {
    if (this.destroyed) return;
    this.controls.update();
    this.dimensionLabels.forEach((object)=>{object.getWorldPosition(this.dimensionWorldPosition);const ratio=clamp(this.camera.position.distanceTo(this.dimensionWorldPosition)/12000,1,2.65),base=object.userData.baseScale;object.scale.set(base.x*ratio,base.y*ratio,1);});
    this.renderer.render(this.scene, this.camera);
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.animationFrame != null) { cancelAnimationFrame(this.animationFrame); this.animationFrame = null; }
    this.resizeObserver?.disconnect?.();
    this.controls?.dispose?.();
    const geometries = new Set(), materials = new Set(), textures = new Set();
    const collectMaterial = (material) => {
      if (!material || materials.has(material)) return;
      materials.add(material);
      Object.values(material).forEach((value) => { if (value?.isTexture) textures.add(value); });
    };
    this.scene?.traverse?.((object) => {
      if (object.geometry?.dispose) geometries.add(object.geometry);
      if (Array.isArray(object.material)) object.material.forEach(collectMaterial); else collectMaterial(object.material);
    });
    textures.forEach((texture) => { try { texture.dispose(); } catch {} });
    materials.forEach((material) => { try { material.dispose(); } catch {} });
    geometries.forEach((geometry) => { try { geometry.dispose(); } catch {} });
    this.dimensionLabels.length = 0;
    this.content?.clear?.();
    this.renderer?.renderLists?.dispose?.();
    this.renderer?.dispose?.();
    this.models = null;
    this.frame = null;
  }`
  );

  if (!src.includes("this.animationFrame = requestAnimationFrame(this.animate);") || !src.includes("const geometries = new Set(), materials = new Set(), textures = new Set();")) {
    throw new Error("v30: B2B lifecycle patch uygulanamadi.");
  }
  return src;
});

patchFile("client/mr-viewer.entry.js", (src) => {
  if (src.includes("__rafexLifecycleV30")) return src;

  src = src.replace(
    "    this.onResize = this.onResize.bind(this);\n    this.animate = this.animate.bind(this);",
    "    this.onResize = this.onResize.bind(this);\n    this.animate = this.animate.bind(this);\n    this.animationFrame = null;\n    this.__rafexLifecycleV30 = true;"
  );

  src = src.replace(
`  animate() { if (!this.destroyed) { this.controls.update(); this.renderer.render(this.scene, this.camera); requestAnimationFrame(this.animate); } }
  destroy() { this.destroyed = true; this.loadToken += 1; this.disposeDimensions(); this.canvas.removeEventListener("click", this.onCanvasClick); this.canvas.removeEventListener("pointermove", this.onCanvasPointerMove); this.resizeObserver.disconnect(); this.controls.dispose(); this.ground.geometry.dispose(); this.ground.material.dispose(); this.renderer.dispose(); }`,
`  animate() { if (!this.destroyed) { this.controls.update(); this.renderer.render(this.scene, this.camera); this.animationFrame = requestAnimationFrame(this.animate); } }
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.loadToken += 1;
    if (this.animationFrame != null) { cancelAnimationFrame(this.animationFrame); this.animationFrame = null; }
    this.disposeDimensions();
    this.canvas.removeEventListener("click", this.onCanvasClick);
    this.canvas.removeEventListener("pointermove", this.onCanvasPointerMove);
    this.resizeObserver?.disconnect?.();
    this.controls?.dispose?.();
    const geometries = new Set(), materials = new Set(), textures = new Set();
    const collectMaterial = (material) => {
      if (!material || materials.has(material)) return;
      materials.add(material);
      Object.values(material).forEach((value) => { if (value?.isTexture) textures.add(value); });
    };
    this.scene?.traverse?.((object) => {
      if (object.geometry?.dispose) geometries.add(object.geometry);
      if (Array.isArray(object.material)) object.material.forEach(collectMaterial); else collectMaterial(object.material);
    });
    textures.forEach((texture) => { try { texture.dispose(); } catch {} });
    materials.forEach((material) => { try { material.dispose(); } catch {} });
    geometries.forEach((geometry) => { try { geometry.dispose(); } catch {} });
    this.dimensionLabels.length = 0;
    this.root?.clear?.();
    this.renderer?.renderLists?.dispose?.();
    this.renderer?.dispose?.();
  }`
  );

  if (!src.includes("this.animationFrame = requestAnimationFrame(this.animate);") || !src.includes("const geometries = new Set(), materials = new Set(), textures = new Set();")) {
    throw new Error("v30: MR lifecycle patch uygulanamadi.");
  }
  return src;
});

// Serbest Cizim bilgi penceresi MR icin ana MR viewer'i bozmadan tek modulu
// offscreen render edip resim olarak alabilsin.
patchFile("client/mr-viewer.entry.js", (src) => {
  if (src.includes("captureMRModuleView")) return src;
  const anchor = "let active = null;\nwindow.RafexMRViewer = {";
  if (!src.includes(anchor)) throw new Error("v30: MR capture ekleme noktasi bulunamadi.");
  const helper = `async function captureMRModuleView(config = {}, settings = {}) {\n  const width = Math.max(520, Math.round(Number(settings.width) || 1280));\n  const height = Math.max(420, Math.round(Number(settings.height) || 820));\n  const host = document.createElement(\"div\");\n  host.style.cssText = \"position:fixed;left:-100000px;top:0;width:\" + width + \"px;height:\" + height + \"px;pointer-events:none;opacity:0;overflow:hidden\";\n  const canvas = document.createElement(\"canvas\");\n  canvas.style.width = \"100%\"; canvas.style.height = \"100%\"; canvas.style.display = \"block\";\n  host.appendChild(canvas); document.body.appendChild(host);\n  let viewer = null;\n  try {\n    const moduleConfig = { ...config, modules:1, dimensions:{ levels:false, markers:false, width:false, depth:false } };\n    viewer = new MRViewer(canvas, { config:moduleConfig });\n    await new Promise((resolve, reject) => {\n      let settled = false;\n      const finish = (fn, value) => { if (settled) return; settled = true; clearTimeout(timer); fn(value); };\n      const timer = setTimeout(() => finish(reject, new Error(\"MR modül görüntüsü zaman aşımına uğradı.\")), 8000);\n      canvas.addEventListener(\"mr-viewer-ready\", () => finish(resolve), { once:true });\n      canvas.addEventListener(\"mr-viewer-error\", (event) => finish(reject, new Error(event.detail?.message || \"MR modülü oluşturulamadı.\")), { once:true });\n    });\n    viewer.setView(settings.view || \"perspective\");\n    viewer.controls.update();\n    viewer.renderer.render(viewer.scene, viewer.camera);\n    await new Promise((resolve) => requestAnimationFrame(() => { viewer?.renderer?.render?.(viewer.scene, viewer.camera); resolve(); }));\n    return canvas.toDataURL(\"image/png\");\n  } finally {\n    try { viewer?.destroy?.(); } catch {}\n    host.remove();\n  }\n}\n\n`;
  src = src.replace(anchor, helper + anchor);
  const apiNeedle = "  setAutoRotate(enabled) { active?.setAutoRotate(enabled); },\n  destroy() { active?.destroy(); active = null; },\n};";
  const apiReplacement = "  setAutoRotate(enabled) { active?.setAutoRotate(enabled); },\n  captureView(config, settings) { return captureMRModuleView(config, settings); },\n  destroy() { active?.destroy(); active = null; },\n};";
  if (!src.includes(apiNeedle)) throw new Error("v30: MR capture API ekleme noktasi bulunamadi.");
  src = src.replace(apiNeedle, apiReplacement);
  if (!src.includes("captureView(config, settings)")) throw new Error("v30: MR capture API eklenemedi.");
  return src;
});

console.log("v30: 3D viewer RAF iptali + geometry/material/texture/listener temizligi aktif.");
