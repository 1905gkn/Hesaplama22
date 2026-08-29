import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const VERSION = "mekik-real-front-v95";
let sharedModelsPromise = null;
let activeViewer = null;
let hookInstalled = false;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const num = (v, fallback) => Number.isFinite(Number(v)) ? Number(v) : fallback;
const elNum = (id, fallback) => {
  const el = document.getElementById(id);
  return el ? num(el.value, fallback) : fallback;
};
const fmt = (v) => {
  try { return Math.round(num(v, 0)).toLocaleString("tr-TR"); }
  catch { return String(Math.round(num(v, 0))); }
};

function currentDrawing() {
  let d = {};
  try { if (typeof m2LastDrawing !== "undefined" && m2LastDrawing) d = m2LastDrawing; } catch {}
  const bays = clamp(Math.round(num(d.bays, elNum("m2Bays", 4))), 1, 20);
  const levels = clamp(Math.round(num(d.levels, elNum("m2Levels", 4))), 1, 15);
  const palW = clamp(num(d.palW, elNum("m2PalW", 1200)), 600, 2000);
  const side = clamp(num(d.sideClearance, num(d.sideGap, elNum("m2SideGap", 75))), 0, 500);
  const column = Math.max(palW + side * 2, num(d.columnSpacing, palW + side * 2));
  const first = clamp(num(d.firstRailHeight, elNum("m2FirstRail", 430)), 0, 4000);
  const levelH = clamp(num(d.levelH, elNum("m2LevelH", 1580)), 380, 5000);
  const palletH = clamp(num(d.palletHeight, elNum("m2PalletHeight", 1200)), 300, 3000);
  const rackH = Math.max(first + Math.max(0, levels - 1) * levelH + palletH / 2, num(d.totalRackHeight, num(d.sideUprightHeight, 0)));
  const totalW = Math.max(column * bays + 100, num(d.totalWidth, 0));
  return { bays, levels, palW, side, column, first, levelH, palletH, rackH, totalW };
}

function loadModels() {
  if (sharedModelsPromise) return sharedModelsPromise;
  const draco = new DRACOLoader();
  draco.setDecoderPath("/draco/");
  draco.setDecoderConfig({ type: "wasm" });
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);
  sharedModelsPromise = Promise.all([
    loader.loadAsync(`/b2b-ayak.glb?v=${VERSION}`),
    loader.loadAsync(`/b2b-travers.glb?v=${VERSION}`),
    loader.loadAsync(`/b2b-palet.glb?v=${VERSION}`),
  ]).finally(() => draco.dispose());
  return sharedModelsPromise;
}

function cloneMaterials(root, kind) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = false;
    o.receiveShadow = false;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    const next = list.map((source) => {
      const m = source?.clone ? source.clone() : new THREE.MeshStandardMaterial();
      const name = `${o.name || ""} ${m.name || ""}`.toLocaleUpperCase("tr-TR");
      if (kind === "steel") {
        m.color.setHex(0xaeb8bd);
        m.metalness = 0.62;
        m.roughness = 0.32;
      } else if (kind === "yellow") {
        m.color.setHex(0xf2c500);
        m.metalness = 0.28;
        m.roughness = 0.43;
      } else {
        m.color.setHex(name.includes("KUTU") ? 0xd7a44f : 0xa96b2d);
        m.metalness = 0.02;
        m.roughness = name.includes("KUTU") ? 0.78 : 0.9;
      }
      return m;
    });
    o.material = Array.isArray(o.material) ? next : next[0];
  });
  return root;
}

function oriented(source, kind) {
  const root = new THREE.Group();
  const raw = cloneMaterials(source.clone(true), kind);
  root.add(raw);
  root.rotation.x = Math.PI / 2;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  root.position.x -= box.min.x;
  root.position.y -= box.min.y;
  root.position.z -= (box.min.z + box.max.z) / 2;
  root.updateMatrixWorld(true);
  return root;
}

function sizeOf(object) {
  object.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
}

class MekikFrontViewer {
  constructor(host) {
    this.host = host;
    this.disposed = false;
    this.models = null;
    this.lastKey = "";
    this.onResize = this.onResize.bind(this);
    this.setupDom();
    this.setupScene();
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(host);
    this.load();
  }

  setupDom() {
    this.host.innerHTML = "";
    this.host.classList.add("rafex-mekik-real-front-v95");
    this.host.style.position = "relative";
    this.host.style.minHeight = "500px";
    this.host.style.overflow = "hidden";
    this.host.style.background = "#fff";
    this.canvas = document.createElement("canvas");
    this.canvas.dataset.rafexMekikRealFront = "v95";
    Object.assign(this.canvas.style, { width:"100%", height:"500px", display:"block", background:"#fff" });
    this.host.appendChild(this.canvas);
    this.overlay = document.createElement("div");
    Object.assign(this.overlay.style, { position:"absolute", inset:"0", pointerEvents:"none" });
    this.host.appendChild(this.overlay);
    this.status = document.createElement("div");
    this.status.textContent = "GLB yükleniyor…";
    Object.assign(this.status.style, { position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", padding:"8px 12px", borderRadius:"8px", background:"#173c2d", color:"#fff", font:"700 11px Arial" });
    this.host.appendChild(this.status);
  }

  setupScene() {
    this.renderer = new THREE.WebGLRenderer({ canvas:this.canvas, antialias:true, alpha:false, powerPreference:"high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setClearColor(0xffffff, 1);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 100000);
    this.camera.up.set(0, 1, 0);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x75828a, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 3.1);
    key.position.set(-3500, 9000, 10000);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffefd7, 1.45);
    fill.position.set(7000, 3500, 4500);
    this.scene.add(fill);
    this.content = new THREE.Group();
    this.scene.add(this.content);
  }

  async load() {
    try {
      const [foot, traverse, pallet] = await loadModels();
      if (this.disposed) return;
      this.models = { foot:foot.scene, traverse:traverse.scene, pallet:pallet.scene };
      this.status?.remove();
      this.update(true);
    } catch (error) {
      console.error("Mekik gerçek GLB ön görünüş yükleme hatası", error);
      if (this.status) this.status.textContent = "GLB yüklenemedi";
    }
  }

  clear() {
    while (this.content.children.length) this.content.remove(this.content.children[0]);
  }

  buildFrame(spec) {
    const base = oriented(this.models.foot, "steel");
    const src = sizeOf(base);
    base.scale.set(1, spec.rackH / Math.max(1, src.y), 1);
    base.updateMatrixWorld(true);
    return base;
  }

  buildTraverse(length) {
    const base = oriented(this.models.traverse, "yellow");
    const src = sizeOf(base);
    base.scale.set(length / Math.max(1, src.x), 80 / Math.max(1, src.y), 1);
    base.updateMatrixWorld(true);
    return base;
  }

  buildLoad(spec) {
    const base = oriented(this.models.pallet, "load");
    const src = sizeOf(base);
    base.scale.set(spec.palW / Math.max(1, src.x), spec.palletH / Math.max(1, src.y), Math.min(1.15, 1200 / Math.max(1, src.z)));
    base.updateMatrixWorld(true);
    return base;
  }

  update(force = false) {
    if (!this.models || this.disposed) return;
    const spec = currentDrawing();
    const key = JSON.stringify(spec);
    if (!force && key === this.lastKey) { this.render(); return; }
    this.lastKey = key;
    this.clear();

    const frameProbe = this.buildFrame(spec);
    const frameSize = sizeOf(frameProbe);
    const footW = clamp(frameSize.x, 60, 180);
    const depth = Math.max(500, frameSize.z);
    const pitch = spec.column;
    const rackWidth = spec.bays * pitch + footW;

    for (let c = 0; c <= spec.bays; c += 1) {
      const frame = c === 0 ? frameProbe : this.buildFrame(spec);
      frame.name = `Mekik Ayak ${c + 1} · gerçek GLB`;
      frame.position.x = c * pitch;
      this.content.add(frame);
    }

    for (let level = 0; level < spec.levels; level += 1) {
      const supportY = spec.first + level * spec.levelH;
      for (let bay = 0; bay < spec.bays; bay += 1) {
        const beam = this.buildTraverse(Math.max(200, pitch - footW * 0.35));
        beam.name = `Mekik Travers K${level + 1}-${bay + 1} · gerçek GLB`;
        beam.position.set(bay * pitch + footW * 0.18, supportY, depth * 0.34);
        this.content.add(beam);

        const load = this.buildLoad(spec);
        const loadSize = sizeOf(load);
        load.name = `Mekik Palet K${level + 1}-${bay + 1} · gerçek GLB`;
        load.position.set(bay * pitch + (pitch - spec.palW) / 2, supportY + 80, -loadSize.z * 0.08);
        this.content.add(load);
      }
    }

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(Math.max(2000, rackWidth * 1.35), Math.max(1600, depth * 1.6)),
      new THREE.MeshStandardMaterial({ color:0xf7f8f7, roughness:0.98, metalness:0 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(rackWidth / 2, -2, 0);
    this.content.add(floor);

    this.content.updateMatrixWorld(true);
    this.fit(spec, rackWidth, depth);
    this.renderOverlay(spec);
    this.render();
  }

  fit(spec, rackWidth, depth) {
    const rect = this.host.getBoundingClientRect();
    const aspect = Math.max(0.5, rect.width / Math.max(1, rect.height || 500));
    const padX = rackWidth * 0.14 + 500;
    const padY = spec.rackH * 0.12 + 300;
    const needW = rackWidth + padX * 2;
    const needH = spec.rackH + padY * 2;
    let halfH = needH / 2;
    let halfW = halfH * aspect;
    if (halfW * 2 < needW) { halfW = needW / 2; halfH = halfW / aspect; }
    this.camera.left = -halfW;
    this.camera.right = halfW;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.near = 1;
    this.camera.far = 100000;
    this.camera.position.set(rackWidth / 2, spec.rackH / 2, Math.max(10000, depth * 5));
    this.camera.lookAt(rackWidth / 2, spec.rackH / 2, 0);
    this.camera.updateProjectionMatrix();
  }

  renderOverlay(spec) {
    const plotBottom = 448, plotH = 365;
    let dims = "", prev = 0;
    for (let i = 0; i < spec.levels; i += 1) {
      const z = i === 0 ? spec.first : spec.first + i * spec.levelH;
      const y = plotBottom - (z / Math.max(1, spec.rackH)) * plotH;
      const py = plotBottom - (prev / Math.max(1, spec.rackH)) * plotH;
      const label = i === 0 ? `ZEMİN · ${fmt(spec.first)} mm` : `K${i} · ${fmt(spec.levelH)} mm`;
      dims += `<g class="rf95dim"><line x1="139" y1="${py}" x2="139" y2="${y}"/><path d="M134 ${py-7}L139 ${py}L144 ${py-7}M134 ${y+7}L139 ${y}L144 ${y+7}"/><line class="w" x1="139" y1="${y}" x2="171" y2="${y}"/><text x="126" y="${(py+y)/2+4}" text-anchor="end">${label}</text></g>`;
      prev = z;
    }
    this.overlay.innerHTML = `<svg viewBox="0 0 760 500" preserveAspectRatio="none" style="width:100%;height:100%;display:block">
      <style>.rf95t{font:900 12px Arial;fill:#173c2d}.rf95s{font:900 10px Arial;fill:#173c2d}.rf95chip{fill:#173c2d}.rf95chiptext{font:900 10px Arial;fill:#fff}.rf95yellow{fill:#fff4b2;stroke:#d4a900}.rf95dim{stroke:#d4aa00;stroke-width:1.4;fill:none}.rf95dim .w{stroke-dasharray:4 4}.rf95dim text{stroke:none;fill:#173c2d;font:900 9px Arial}</style>
      <text x="38" y="139" class="rf95t">KOT ARALIKLARI</text>
      <text x="380" y="22" text-anchor="middle" class="rf95s">YAN BOŞLUK · ${fmt(spec.side)} + ${fmt(spec.side)} mm</text>
      <rect x="278" y="31" width="204" height="23" rx="12" class="rf95chip"/><text x="380" y="47" text-anchor="middle" class="rf95chiptext">KOLON ARALIĞI · ${fmt(spec.column)} mm</text>
      <rect x="319" y="59" width="122" height="19" rx="9" class="rf95yellow"/><text x="380" y="72" text-anchor="middle" class="rf95s">PALET · ${fmt(spec.palW)} mm</text>
      ${dims}
      <rect x="618" y="233" width="118" height="50" rx="9" class="rf95chip"/><text x="677" y="251" text-anchor="middle" class="rf95chiptext">AYAK UZUNLUĞU</text><text x="677" y="272" text-anchor="middle" style="font:900 16px Arial;fill:#fff">${fmt(spec.rackH)} mm</text>
    </svg>`;
  }

  onResize() {
    if (this.disposed) return;
    const rect = this.host.getBoundingClientRect();
    const w = Math.max(320, Math.round(rect.width));
    const h = Math.max(420, Math.round(rect.height || 500));
    this.renderer.setSize(w, h, false);
    if (this.models) this.update(true);
  }

  render() { if (!this.disposed) this.renderer.render(this.scene, this.camera); }
  destroy() {
    this.disposed = true;
    this.resizeObserver?.disconnect();
    this.renderer?.dispose();
    this.host?.classList.remove("rafex-mekik-real-front-v95");
  }
}

function mount() {
  const host = document.getElementById("m2Front");
  if (!host) return;
  if (activeViewer && activeViewer.host !== host) { activeViewer.destroy(); activeViewer = null; }
  if (!activeViewer || activeViewer.disposed || !host.querySelector('canvas[data-rafex-mekik-real-front="v95"]')) {
    activeViewer?.destroy();
    activeViewer = new MekikFrontViewer(host);
  } else activeViewer.update();
}

function installHook(attempt = 0) {
  if (hookInstalled) return;
  const native = window.drawMekik2;
  if (typeof native === "function" && !native.__rafexRealGlbFrontV95) {
    const wrapped = function(...args) {
      const result = native.apply(this, args);
      requestAnimationFrame(() => mount());
      return result;
    };
    wrapped.__rafexRealGlbFrontV95 = true;
    window.drawMekik2 = wrapped;
    hookInstalled = true;
    requestAnimationFrame(() => mount());
    return;
  }
  if (attempt < 30) setTimeout(() => installHook(attempt + 1), 100);
}

window.RafexMekikRealFrontV95 = { mount, update:() => activeViewer?.update(true), destroy:() => activeViewer?.destroy() };
installHook();
