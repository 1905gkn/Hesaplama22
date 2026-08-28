import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function patch(rel, apply) {
  const file = path.join(root, rel);
  const source = fs.readFileSync(file, "utf8");
  const next = apply(source);
  if (next === source) console.log(`v101: ${rel} viewer pause zaten aktif.`);
  else {
    fs.writeFileSync(file, next);
    console.log(`v101: ${rel} viewer pause eklendi.`);
  }
}

function insertApiPause(source, apiName, mainCanvasIds) {
  const token = `window.${apiName} = {`;
  const start = source.indexOf(token);
  if (start < 0) throw new Error(`v101: ${apiName} API baslangici bulunamadi`);
  const end = source.indexOf("\n};", start);
  if (end < 0) throw new Error(`v101: ${apiName} API sonu bulunamadi`);
  const block = source.slice(start, end);
  if (block.includes("setPaused(paused)")) return source;
  const destroyAt = block.lastIndexOf("\n  destroy()");
  if (destroyAt < 0) throw new Error(`v101: ${apiName} destroy API anchor bulunamadi`);
  const ids = JSON.stringify(mainCanvasIds);
  const method = `\n  setPaused(paused) {\n    const canvasId = String(active?.canvas?.id || \"\");\n    if (!${ids}.includes(canvasId)) return;\n    active?.setPaused?.(paused);\n  },`;
  const absolute = start + destroyAt;
  return source.slice(0, absolute) + method + source.slice(absolute);
}

patch("client/b2b-viewer.entry.js", (input) => {
  let source = input;
  if (!source.includes("__rafexLifecycleV30")) throw new Error("v101: B2B lifecycle v30 once uygulanmali");

  if (!source.includes("__rafexPauseV101")) {
    const marker = "    this.__rafexLifecycleV30 = true;";
    if (!source.includes(marker)) throw new Error("v101: B2B constructor lifecycle anchor bulunamadi");
    source = source.replace(
      marker,
      `${marker}\n    this.__rafexPauseV101 = true;\n    this.paused = false;`,
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
    if (this.destroyed || this.paused) { this.animationFrame = null; return; }
    this.controls.update();
    this.dimensionLabels.forEach((object)=>{object.getWorldPosition(this.dimensionWorldPosition);const ratio=clamp(this.camera.position.distanceTo(this.dimensionWorldPosition)/12000,1,2.65),base=object.userData.baseScale;object.scale.set(base.x*ratio,base.y*ratio,1);});
    this.renderer.render(this.scene, this.camera);
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  setPaused(paused) {
    const next = Boolean(paused);
    if (next) {
      this.paused = true;
      if (this.animationFrame != null) cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
      return;
    }
    this.paused = false;
    requestAnimationFrame(() => {
      if (this.destroyed || this.paused) return;
      this.onResize();
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      if (this.animationFrame == null) this.animationFrame = requestAnimationFrame(this.animate);
    });
  }

  destroy() {`;
    if (!source.includes(oldAnimate)) throw new Error("v101: B2B animate anchor bulunamadi");
    source = source.replace(oldAnimate, newAnimate);
  }

  source = insertApiPause(source, "RafexB2BViewer", ["b2bMain3DCanvas"]);
  if (!source.includes("__rafexPauseV101") || !source.includes("active?.setPaused?.(paused)")) {
    throw new Error("v101: B2B pause API eklenemedi");
  }
  return source;
});

patch("client/mr-viewer.entry.js", (input) => {
  let source = input;
  if (!source.includes("__rafexLifecycleV30")) throw new Error("v101: MR lifecycle v30 once uygulanmali");

  if (!source.includes("__rafexPauseV101")) {
    const marker = "    this.__rafexLifecycleV30 = true;";
    if (!source.includes(marker)) throw new Error("v101: MR constructor lifecycle anchor bulunamadi");
    source = source.replace(
      marker,
      `${marker}\n    this.__rafexPauseV101 = true;\n    this.paused = false;`,
    );

    const oldAnimate = `  animate() { if (!this.destroyed) { this.controls.update(); this.renderer.render(this.scene, this.camera); this.animationFrame = requestAnimationFrame(this.animate); } }
  destroy() {`;
    const newAnimate = `  animate() { if (!this.destroyed && !this.paused) { this.controls.update(); this.renderer.render(this.scene, this.camera); this.animationFrame = requestAnimationFrame(this.animate); } else { this.animationFrame = null; } }
  setPaused(paused) {
    const next = Boolean(paused);
    if (next) {
      this.paused = true;
      if (this.animationFrame != null) cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
      return;
    }
    this.paused = false;
    requestAnimationFrame(() => {
      if (this.destroyed || this.paused) return;
      this.onResize();
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      if (this.animationFrame == null) this.animationFrame = requestAnimationFrame(this.animate);
    });
  }
  destroy() {`;
    if (!source.includes(oldAnimate)) throw new Error("v101: MR animate anchor bulunamadi");
    source = source.replace(oldAnimate, newAnimate);
  }

  source = insertApiPause(source, "RafexMRViewer", ["mrCanvas"]);
  if (!source.includes("__rafexPauseV101") || !source.includes("active?.setPaused?.(paused)")) {
    throw new Error("v101: MR pause API eklenemedi");
  }
  return source;
});

console.log("v101: B2B ve MR ana 3D RAF donguleri kapaliyken tamamen durur; modal 3D tuvallerine dokunulmaz.");
