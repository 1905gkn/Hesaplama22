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

console.log("v30: 3D viewer RAF iptali + geometry/material/texture/listener temizligi aktif.");
