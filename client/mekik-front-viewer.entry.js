import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const ASSET_VERSION = "mekik-front-glb-v5";
const REFERENCE_BAY_PITCH = 1450;
const REFERENCE_UPRIGHT_WIDTH = 100;
const EURO_PALLET_VISUAL_HEIGHT = 140;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

let sharedModelsPromise = null;

function numberFrom(id, fallback, min, max) {
  const node = document.getElementById(id);
  const value = Number(node?.value);
  return clamp(Number.isFinite(value) ? value : fallback, min, max);
}

function activeDrawing() {
  try {
    return typeof m2LastDrawing !== "undefined" && m2LastDrawing ? m2LastDrawing : null;
  } catch (_) {
    return null;
  }
}

function isMekikFront() {
  try {
    if (typeof m2ActiveModule !== "undefined") return String(m2ActiveModule) === "mekik2";
  } catch (_) {}
  const page = document.getElementById("page");
  if (!page || page.classList.contains("b2b-mode") || page.classList.contains("drive-in-mode")) return false;
  const module = String(page.dataset?.m2Module || "");
  if (module) return module === "mekik2";
  return String(document.getElementById("pageTitle")?.textContent || "").trim().toLocaleLowerCase("tr-TR") === "mekik";
}

function readConfig() {
  const drawing = activeDrawing();
  const bays = Math.round(numberFrom("m2Bays", Number(drawing?.bays) || 4, 1, 50));
  const levels = Math.round(numberFrom("m2Levels", Number(drawing?.levels) || 4, 1, 15));
  const palletWidth = numberFrom("m2PalW", Number(drawing?.palW) || 1200, 600, 1800);
  const palletDepthChoice = document.getElementById("m2PalD")?.value;
  const palletDepth = palletDepthChoice === "other"
    ? numberFrom("m2PalDOther", Number(drawing?.palD) || 800, 1, 3000)
    : clamp(Number(palletDepthChoice) || Number(drawing?.palD) || 800, 1, 3000);
  const palletHeight = numberFrom("m2LevelH", Number(drawing?.palletHeight) || 1200, 300, 3000);
  const firstLevelHeight = numberFrom("m2FirstLevelHeight", Number(drawing?.firstRailHeight) || 430, 0, 5000);
  const requestedSpacing = numberFrom("m2LevelSpacing", Number(drawing?.levelH) || 1580, 380, 5000);
  const levelSpacing = Math.max(palletHeight + 80, requestedSpacing);
  const footType = clamp(Number(drawing?.footType) || numberFrom("m2FootType", 100, 60, 200), 60, 200);
  const uprightHeight = Math.max(150, Number(drawing?.sideUprightHeight) || firstLevelHeight + (levels - 1) * levelSpacing + palletHeight / 2);
  const bayPitch = palletWidth + 150 + footType;
  return {
    bays,
    levels,
    palletWidth,
    palletDepth,
    palletHeight,
    firstLevelHeight,
    levelSpacing,
    footType,
    uprightHeight,
    bayPitch,
    totalWidth: bays * bayPitch + footType,
  };
}

function materialFor(name) {
  const upper = String(name || "").toLocaleUpperCase("tr-TR");
  if (upper.includes("BRAKET") || upper.includes("KONNEKT")) {
    return new THREE.MeshStandardMaterial({ color: 0xf2c500, metalness: 0.42, roughness: 0.44 });
  }
  return new THREE.MeshStandardMaterial({ color: 0xb8c0bd, metalness: 0.7, roughness: 0.32 });
}

function prepareTemplate(scene, type) {
  const source = scene.clone(true);
  let profile = null;
  source.traverse((part) => {
    if (!part.isMesh) return;
    part.material = materialFor(part.name);
    part.castShadow = false;
    part.receiveShadow = false;
    part.frustumCulled = true;
    if (type === "traverse" && String(part.name || "").toLocaleUpperCase("tr-TR").includes("PROFIL")) profile = part;
  });
  source.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(source);
  const center = bounds.getCenter(new THREE.Vector3());
  let zeroZ = bounds.min.z;
  if (type === "traverse" && profile) zeroZ = new THREE.Box3().setFromObject(profile).max.z;
  source.position.add(new THREE.Vector3(-center.x, -center.y, -zeroZ));
  const root = new THREE.Group();
  root.add(source);
  root.updateMatrixWorld(true);
  const normalizedBounds = new THREE.Box3().setFromObject(root);
  return {
    root,
    size: normalizedBounds.getSize(new THREE.Vector3()),
    topOffset: normalizedBounds.max.z,
    source: type === "upright" ? "mekik 3ayak(2).glb" : "mekik 3travers(2).glb",
  };
}

function preparePalletTemplate(scene) {
  const source = scene.clone(true);
  source.scale.z = -1;
  source.traverse((part) => {
    if (!part.isMesh) return;
    const upper = String(part.name || "").toLocaleUpperCase("tr-TR");
    part.material = new THREE.MeshStandardMaterial({
      color: upper.includes("PALET") ? 0x9a6028 : 0xa96f35,
      metalness: 0.04,
      roughness: 0.94,
    });
    part.castShadow = false;
    part.receiveShadow = false;
    part.frustumCulled = true;
  });
  source.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(source);
  const center = bounds.getCenter(new THREE.Vector3());
  source.position.add(new THREE.Vector3(-center.x, -center.y, -bounds.min.z));
  const root = new THREE.Group();
  root.add(source);
  root.updateMatrixWorld(true);
  const normalizedBounds = new THREE.Box3().setFromObject(root);
  return {
    root,
    size: normalizedBounds.getSize(new THREE.Vector3()),
    source: "PALET (1).glb",
  };
}

async function loadModels() {
  if (!sharedModelsPromise) {
    const loader = new GLTFLoader();
    const source = (name) => `/mekik-front-${name}.glb?v=${ASSET_VERSION}`;
    sharedModelsPromise = Promise.all([
      loader.loadAsync(source("ayak")),
      loader.loadAsync(source("travers")),
      loader.loadAsync(source("palet")),
    ]).then(([upright, traverse, pallet]) => ({
      upright: prepareTemplate(upright.scene, "upright"),
      traverse: prepareTemplate(traverse.scene, "traverse"),
      pallet: preparePalletTemplate(pallet.scene),
    })).catch((error) => {
      sharedModelsPromise = null;
      throw error;
    });
  }
  return sharedModelsPromise;
}

class MekikFrontViewer {
  constructor(canvas, status) {
    this.canvas = canvas;
    this.status = status;
    this.config = readConfig();
    this.models = null;
    this.root = new THREE.Group();
    this.destroyed = false;
    this.pendingResize = 0;
    this.lastWidth = 0;
    this.lastHeight = 0;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf7faf8);
    this.scene.add(this.root);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x66716c, 2.45));
    const key = new THREE.DirectionalLight(0xffffff, 3.1);
    key.position.set(-4200, 7200, 9000);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff4cf, 1.25);
    fill.position.set(5200, 2800, 3200);
    this.scene.add(fill);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 100000);
    this.camera.up.set(0, 0, 1);

    this.resizeObserver = new ResizeObserver(() => this.scheduleResize());
    this.resizeObserver.observe(canvas.parentElement || canvas);
    this.load();
  }

  async load() {
    this.setStatus("GLB parçaları yükleniyor…", "loading");
    try {
      this.models = await loadModels();
      if (this.destroyed) return;
      this.rebuild();
      this.setStatus("", "ready");
    } catch (error) {
      console.error("Mekik ön görünüş GLB yükleme hatası", error);
      this.setStatus("Mekik ön görünüş GLB dosyaları yüklenemedi.", "error");
    }
  }

  setStatus(message, state) {
    if (!this.status) return;
    this.status.textContent = message;
    this.status.dataset.state = state;
    this.status.hidden = !message;
  }

  configKey(config = this.config) {
    return [config.bays, config.levels, config.palletWidth, config.palletDepth, config.palletHeight, config.firstLevelHeight, config.levelSpacing, config.footType, config.uprightHeight].join("|");
  }

  update() {
    const next = readConfig();
    if (this.configKey(next) === this.configKey()) return;
    this.config = next;
    if (this.models) this.rebuild();
  }

  clearRoot() {
    while (this.root.children.length) this.root.remove(this.root.children[0]);
  }

  rebuild() {
    this.clearRoot();
    const config = this.config;
    const uprightScaleX = config.footType / REFERENCE_UPRIGHT_WIDTH;
    const uprightScaleZ = config.uprightHeight / Math.max(1, this.models.upright.size.z);

    for (let index = 0; index <= config.bays; index += 1) {
      const upright = this.models.upright.root.clone(true);
      upright.name = `Mekik Ayak ${index + 1}`;
      upright.scale.set(uprightScaleX, 1, uprightScaleZ);
      upright.position.set(index * config.bayPitch, 0, 0);
      this.root.add(upright);
    }

    const traverseScaleX = config.bayPitch / REFERENCE_BAY_PITCH;
    const palletScaleX = config.palletWidth / Math.max(1, this.models.pallet.size.x);
    const palletScaleY = config.palletDepth / Math.max(1, this.models.pallet.size.y);
    const palletBodyHeight = EURO_PALLET_VISUAL_HEIGHT;
    const palletScaleZ = palletBodyHeight / Math.max(1, this.models.pallet.size.z);
    const boxHeight = Math.max(0, config.palletHeight - palletBodyHeight);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0x214f3b,
      metalness: 0.02,
      roughness: 0.86,
    });
    const bracketTopOffset = this.models.traverse.topOffset;
    for (let level = 0; level < config.levels; level += 1) {
      const supportZ = config.firstLevelHeight + level * config.levelSpacing;
      for (let bay = 0; bay < config.bays; bay += 1) {
        const bayCenterX = (bay + 0.5) * config.bayPitch;
        const traverse = this.models.traverse.root.clone(true);
        traverse.name = `Mekik Travers G${bay + 1} K${level + 1}`;
        traverse.scale.set(traverseScaleX, 1, 1);
        traverse.position.set(bayCenterX, 0, supportZ);
        this.root.add(traverse);

        const pallet = this.models.pallet.root.clone(true);
        pallet.name = `Mekik Paletli Yük G${bay + 1} K${level + 1}`;
        pallet.scale.set(palletScaleX, palletScaleY, palletScaleZ);
        pallet.position.set(bayCenterX, 0, supportZ + bracketTopOffset);
        this.root.add(pallet);

        if (boxHeight > 0) {
          const box = new THREE.Mesh(new THREE.BoxGeometry(config.palletWidth, config.palletDepth, boxHeight), boxMaterial);
          box.name = `Mekik Kutu G${bay + 1} K${level + 1}`;
          box.castShadow = false;
          box.receiveShadow = false;
          box.position.set(bayCenterX, 0, supportZ + bracketTopOffset + palletBodyHeight + boxHeight / 2);
          this.root.add(box);
        }
      }
    }

    const floorMaterial = new THREE.LineBasicMaterial({ color: 0x50605a, transparent: true, opacity: 0.5 });
    const floor = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-config.footType, 0, 0),
        new THREE.Vector3(config.bays * config.bayPitch + config.footType, 0, 0),
      ]),
      floorMaterial,
    );
    floor.name = "Mekik zemin çizgisi";
    this.root.add(floor);

    this.root.updateMatrixWorld(true);
    this.fit(true);
    this.render();
    this.canvas.dispatchEvent(new CustomEvent("rafex-mekik-front-ready", {
      detail: {
        sources: ["mekik 3tam(3).glb", this.models.upright.source, this.models.traverse.source, this.models.pallet.source],
        config: { ...config },
      },
    }));
  }

  bounds() {
    return new THREE.Box3().setFromObject(this.root);
  }

  fit(resetZoom = false) {
    if (!this.models || !this.root.children.length) return;
    const bounds = this.bounds();
    if (bounds.isEmpty()) return;
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const rect = this.canvas.getBoundingClientRect();
    const width = this.lastWidth || Math.max(1, Math.round(rect.width)) || 960;
    const height = this.lastHeight || Math.max(1, Math.round(rect.height)) || 620;
    const aspect = Math.max(0.3, width / Math.max(1, height));
    let halfWidth = Math.max(700, size.x * 0.58);
    let halfHeight = Math.max(700, size.z * 0.58);
    if (halfWidth / halfHeight < aspect) halfWidth = halfHeight * aspect;
    else halfHeight = halfWidth / aspect;
    this.camera.left = -halfWidth;
    this.camera.right = halfWidth;
    this.camera.top = halfHeight;
    this.camera.bottom = -halfHeight;
    this.camera.near = 1;
    this.camera.far = 100000;
    this.camera.position.set(center.x, center.y + 12000, center.z);
    this.camera.lookAt(center.x, center.y, center.z);
    if (resetZoom) this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
    updateZoomLabel(this.camera.zoom);
  }

  zoomBy(delta) {
    this.camera.zoom = clamp(this.camera.zoom * (1 + Number(delta || 0)), 0.45, 3.2);
    this.camera.updateProjectionMatrix();
    updateZoomLabel(this.camera.zoom);
    this.render();
  }

  scheduleResize() {
    if (this.pendingResize || this.destroyed) return;
    this.pendingResize = requestAnimationFrame(() => {
      this.pendingResize = 0;
      this.resize();
    });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || this.canvas.parentElement?.clientWidth || 960));
    const height = Math.max(1, Math.round(rect.height || this.canvas.parentElement?.clientHeight || 620));
    if (width === this.lastWidth && height === this.lastHeight) return;
    this.lastWidth = width;
    this.lastHeight = height;
    this.renderer.setSize(width, height, false);
    this.fit(false);
    this.render();
  }

  render() {
    if (!this.destroyed && this.models) this.renderer.render(this.scene, this.camera);
  }
}

let canvas = null;
let status = null;
let info = null;
let viewer = null;
let scheduled = 0;

function updateZoomLabel(zoom) {
  const label = document.getElementById("m2FrontZoomLabel");
  if (label) label.textContent = `${Math.round((Number(zoom) || 1) * 100)}%`;
}

function updateInfo(config) {
  if (!info) return;
  const formatter = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
  const text = `${formatter.format(config.bays)} göz × ${formatter.format(config.levels)} kat · ${formatter.format(config.totalWidth)} × ${formatter.format(config.uprightHeight)} mm`;
  if (info.textContent !== text) info.textContent = text;
}

function ensureElements() {
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "rafex-mekik-front-glb-canvas-v2";
    canvas.setAttribute("aria-label", "Gönderilen GLB parçalarıyla oluşturulan dinamik Mekik ön görünüşü");
  }
  if (!status) {
    status = document.createElement("div");
    status.className = "rafex-mekik-front-status-v2";
    status.setAttribute("role", "status");
  }
  if (!info) {
    info = document.createElement("div");
    info.className = "rafex-mekik-front-info-v2";
  }
}

function ensureMounted() {
  scheduled = 0;
  if (!isMekikFront()) return;
  const host = document.getElementById("m2Front");
  if (!host) return;
  ensureElements();
  if (canvas.parentElement !== host || status.parentElement !== host || info.parentElement !== host || host.childElementCount !== 3) {
    host.replaceChildren(canvas, status, info);
    host.dataset.rafexMekikFrontGlb = "v2";
  }
  if (!viewer) viewer = new MekikFrontViewer(canvas, status);
  else viewer.update();
  updateInfo(viewer.config);
  viewer.scheduleResize();
}

function scheduleMount() {
  if (scheduled) return;
  scheduled = requestAnimationFrame(ensureMounted);
}

const originalZoomView = window.m2ZoomView;
window.m2ZoomView = function rafexMekikFrontZoom(name, delta) {
  if (name === "front" && isMekikFront() && viewer) {
    viewer.zoomBy(delta);
    return;
  }
  return typeof originalZoomView === "function" ? originalZoomView.apply(this, arguments) : undefined;
};

const originalFitView = window.m2FitView;
window.m2FitView = function rafexMekikFrontFit(name) {
  if (name === "front" && isMekikFront() && viewer) {
    viewer.fit(true);
    viewer.render();
    return;
  }
  return typeof originalFitView === "function" ? originalFitView.apply(this, arguments) : undefined;
};

document.addEventListener("input", () => setTimeout(scheduleMount, 0), true);
document.addEventListener("change", () => setTimeout(scheduleMount, 0), true);
document.addEventListener("click", () => setTimeout(scheduleMount, 0), true);
window.addEventListener("hashchange", scheduleMount);
window.addEventListener("load", scheduleMount);

new MutationObserver(scheduleMount).observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["class", "data-m2-module", "hidden"],
});

window.rafexMekikFrontGlbV2 = {
  get viewer() { return viewer; },
  refresh: scheduleMount,
  referenceAsset: "/mekik-front-reference.glb",
  sourceFiles: ["mekik 3tam(3).glb", "mekik 3travers(2).glb", "mekik 3ayak(2).glb"],
};

scheduleMount();
