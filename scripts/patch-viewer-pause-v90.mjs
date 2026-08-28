import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function patch(rel, apply) {
  const file = path.join(root, rel);
  const source = fs.readFileSync(file, "utf8");
  const next = apply(source);
  if (next === source) console.log(`v90: ${rel} viewer pause zaten aktif.`);
  else {
    fs.writeFileSync(file, next);
    console.log(`v90: ${rel} viewer pause eklendi.`);
  }
}

patch("client/b2b-viewer.entry.js", (source) => {
  if (source.includes("__rafexPauseV90")) return source;
  if (!source.includes("__rafexLifecycleV30")) throw new Error("v90: B2B lifecycle v30 once uygulanmali");

  source = source.replace(
    "    this.__rafexLifecycleV30 = true;",
    "    this.__rafexLifecycleV30 = true;\n    this.__rafexPauseV90 = true;\n    this.paused = false;",
  );

  const oldAnimate = `  animate() {
    if (this.destroyed) return;
    this.controls.update();
    this.dimensionLabels.forEach((object)=>{object.getWorldPosition(this.dimensionWorldPosition);const ratio=clamp(this.camera.position.distanceTo(this.dimensionWorldPosition)/12000,1,2.65),base=object.userData.baseScale;object.scale.set(base.x*ratio,base.y*ratio,1);});
    this.renderer.render(this.scene, this.camera);
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  destroy() {`;
  const newAnimate = `  animate() {
    if (this.destroyed) return;
    if (!this.paused) {
      this.controls.update();
      this.dimensionLabels.forEach((object)=>{object.getWorldPosition(this.dimensionWorldPosition);const ratio=clamp(this.camera.position.distanceTo(this.dimensionWorldPosition)/12000,1,2.65),base=object.userData.baseScale;object.scale.set(base.x*ratio,base.y*ratio,1);});
      this.renderer.render(this.scene, this.camera);
    }
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  setPaused(paused) {
    this.paused = Boolean(paused);
    if (!this.paused && !this.destroyed) { this.onResize(); this.controls.update(); this.renderer.render(this.scene, this.camera); }
  }

  destroy() {`;
  if (!source.includes(oldAnimate)) throw new Error("v90: B2B animate anchor bulunamadi");
  source = source.replace(oldAnimate, newAnimate);

  const oldApi = `  setAutoRotate(enabled) {
    active?.setAutoRotate(enabled);
  },
  setCameraAngles(azimuth, elevation) {`;
  const newApi = `  setAutoRotate(enabled) {
    active?.setAutoRotate(enabled);
  },
  setPaused(paused) {
    active?.setPaused(paused);
  },
  setCameraAngles(azimuth, elevation) {`;
  if (!source.includes(oldApi)) throw new Error("v90: B2B API anchor bulunamadi");
  source = source.replace(oldApi, newApi);
  if (!source.includes("setPaused(paused)")) throw new Error("v90: B2B pause API eklenemedi");
  return source;
});

patch("client/mr-viewer.entry.js", (source) => {
  if (source.includes("__rafexPauseV90")) return source;
  if (!source.includes("__rafexLifecycleV30")) throw new Error("v90: MR lifecycle v30 once uygulanmali");

  source = source.replace(
    "    this.__rafexLifecycleV30 = true;",
    "    this.__rafexLifecycleV30 = true;\n    this.__rafexPauseV90 = true;\n    this.paused = false;",
  );

  const oldAnimate = `  animate() { if (!this.destroyed) { this.controls.update(); this.renderer.render(this.scene, this.camera); this.animationFrame = requestAnimationFrame(this.animate); } }
  destroy() {`;
  const newAnimate = `  animate() { if (!this.destroyed) { if (!this.paused) { this.controls.update(); this.renderer.render(this.scene, this.camera); } this.animationFrame = requestAnimationFrame(this.animate); } }
  setPaused(paused) { this.paused = Boolean(paused); if (!this.paused && !this.destroyed) { this.onResize(); this.controls.update(); this.renderer.render(this.scene, this.camera); } }
  destroy() {`;
  if (!source.includes(oldAnimate)) throw new Error("v90: MR animate anchor bulunamadi");
  source = source.replace(oldAnimate, newAnimate);

  const oldApi = `  setAutoRotate(enabled) { active?.setAutoRotate(enabled); },
  destroy() { active?.destroy(); active = null; },`;
  const newApi = `  setAutoRotate(enabled) { active?.setAutoRotate(enabled); },
  setPaused(paused) { active?.setPaused(paused); },
  destroy() { active?.destroy(); active = null; },`;
  if (!source.includes(oldApi)) throw new Error("v90: MR API anchor bulunamadi");
  source = source.replace(oldApi, newApi);
  if (!source.includes("setPaused(paused)")) throw new Error("v90: MR pause API eklenemedi");
  return source;
});

console.log("v90: B2B ve MR 3D RAF donguleri Ortak Cizim'de istege bagli durdurulabilir.");
