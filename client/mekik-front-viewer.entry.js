import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const ASSET_VERSION = "mekik-front-glb-v19";
const REFERENCE_BAY_PITCH = 1450;
const REFERENCE_UPRIGHT_WIDTH = 100;
const EURO_PALLET_VISUAL_HEIGHT = 140;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

let sharedModelsPromise = null;

function liveField(id) {
  const nodes = Array.from(document.querySelectorAll(`[id="${id}"]`));
  if (!nodes.length) return null;
  const visible = nodes.filter((node) => node.isConnected && node.getClientRects().length > 0);
  return visible.at(-1) || nodes.at(-1);
}

function numberFrom(id, fallback, min, max) {
  const value = Number(liveField(id)?.value);
  return clamp(Number.isFinite(value) ? value : fallback, min, max);
}

function numberFromAny(ids, fallback, min, max) {
  for (const id of ids) {
    const value = Number(liveField(id)?.value);
    if (Number.isFinite(value)) return clamp(value, min, max);
  }
  return clamp(Number.isFinite(Number(fallback)) ? Number(fallback) : min, min, max);
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
  const palletDepthChoice = liveField("m2PalD")?.value;
  const palletDepth = palletDepthChoice === "other"
    ? numberFrom("m2PalDOther", Number(drawing?.palD) || 800, 1, 3000)
    : clamp(Number(palletDepthChoice) || Number(drawing?.palD) || 800, 1, 3000);
  const palletHeight = numberFrom("m2LevelH", Number(drawing?.palletHeight) || 1200, 300, 3000);
  const firstLevelHeight = numberFrom("m2FirstLevelHeight", Number(drawing?.firstRailHeight) || 430, 0, 5000);
  const requestedSpacing = numberFrom("m2LevelSpacing", Number(drawing?.levelH) || palletHeight + 380, 380, 5000);
  const levelSpacing = requestedSpacing;
  const footType = clamp(Number(drawing?.footType) || numberFrom("m2FootType", 100, 60, 200), 60, 200);
  const uprightHeight = Math.max(150, firstLevelHeight + (levels - 1) * levelSpacing + palletHeight / 2);
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
      color: 0xc58b47,
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
    let halfWidth = Math.max(700, size.x * 0.66);
    let halfHeight = Math.max(700, size.z * 0.64);
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

  renderDimensionOverlay() {
    if (!dimensions || !this.models || !this.lastWidth || !this.lastHeight) return;
    const config = this.config;
    const width = this.lastWidth;
    const height = this.lastHeight;
    dimensions.setAttribute("viewBox", `0 0 ${width} ${height}`);
    dimensions.setAttribute("width", String(width));
    dimensions.setAttribute("height", String(height));

    const point = (x, z) => {
      const projected = new THREE.Vector3(x, 0, z).project(this.camera);
      return { x: (projected.x + 1) * width / 2, y: (1 - projected.y) * height / 2 };
    };
    const fmt = (value) => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(Number(value) || 0));
    const rackLeft = point(0, 0).x;
    const rackRight = point(config.bays * config.bayPitch, 0).x;
    const floorY = point(0, 0).y;
    const topY = point(0, config.uprightHeight).y;
    const leftX = Math.max(62, rackLeft - Math.min(76, width * 0.09));
    const rightX = Math.min(width - 62, rackRight + Math.min(58, width * 0.07));
    const centerX = (rackLeft + rackRight) / 2;
    const sideClearance = Math.max(0, (config.bayPitch - config.palletWidth - config.footType) / 2);
    const lineParts = [];
    const labelParts = [];

    const verticalDimension = (x, z1, z2, label, side = "left") => {
      const a = point(0, z1), b = point(0, z2);
      lineParts.push(`<line x1="${x}" y1="${a.y}" x2="${x}" y2="${b.y}" class="dim-main" marker-start="url(#mekik-arrow)" marker-end="url(#mekik-arrow)"/>`);
      lineParts.push(`<line x1="${x}" y1="${a.y}" x2="${side === "left" ? rackLeft : rackRight}" y2="${a.y}" class="dim-guide"/>`);
      lineParts.push(`<line x1="${x}" y1="${b.y}" x2="${side === "left" ? rackLeft : rackRight}" y2="${b.y}" class="dim-guide"/>`);
      const textX = side === "left" ? x - 9 : x + 9;
      const anchor = side === "left" ? "end" : "start";
      labelParts.push(`<text x="${textX}" y="${(a.y + b.y) / 2 + 4}" text-anchor="${anchor}" class="dim-text">${label}</text>`);
    };

    verticalDimension(leftX, 0, config.firstLevelHeight, `ZEMİN · ${fmt(config.firstLevelHeight)} mm`);
    for (let level = 1; level < config.levels; level += 1) {
      const from = config.firstLevelHeight + (level - 1) * config.levelSpacing;
      const to = config.firstLevelHeight + level * config.levelSpacing;
      verticalDimension(leftX, from, to, `K${level} · ${fmt(config.levelSpacing)} mm`);
    }
    verticalDimension(rightX, 0, config.uprightHeight, "", "right");

    const cardX = Math.min(width - 128, rightX + 9);
    const cardY = Math.max(82, Math.min(height - 58, (topY + floorY) / 2 - 24));
    dimensions.innerHTML = `
      <defs>
        <marker id="mekik-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse">
          <path d="M0,4 L8,0 L8,8 Z" fill="#d7a900"/>
        </marker>
      </defs>
      <style>
        .dim-main{stroke:#d7a900;stroke-width:1.7}
        .dim-guide{stroke:#d7a900;stroke-width:1;stroke-dasharray:3 3;opacity:.8}
        .dim-text{fill:#073c30;font:800 11px Arial,sans-serif}
        .dim-title{fill:#073c30;font:900 13px Arial,sans-serif}
        .dim-chip{fill:#073c30}
        .dim-chip-text{fill:#fff;font:900 10px Arial,sans-serif}
        .dim-warm{fill:#fff1b8;stroke:#d7a900;stroke-width:1}
        .dim-warm-text{fill:#3e3511;font:900 10px Arial,sans-serif}
      </style>
      <text x="18" y="${Math.max(72, topY + 28)}" class="dim-title">KOT ARALIKLARI</text>
      ${lineParts.join("")}
      ${labelParts.join("")}
      <text x="${centerX}" y="18" text-anchor="middle" class="dim-warm-text">YAN BOŞLUK · ${fmt(sideClearance)} + ${fmt(sideClearance)} mm</text>
      <rect x="${centerX - 96}" y="25" width="192" height="23" rx="12" class="dim-chip"/>
      <text x="${centerX}" y="40" text-anchor="middle" class="dim-chip-text">KOLON ARALIĞI · ${fmt(config.bayPitch)} mm</text>
      <rect x="${centerX - 62}" y="53" width="124" height="21" rx="11" class="dim-warm"/>
      <text x="${centerX}" y="67" text-anchor="middle" class="dim-warm-text">PALET · ${fmt(config.palletWidth)} mm</text>
      <rect x="${cardX}" y="${cardY}" width="116" height="49" rx="10" class="dim-chip"/>
      <text x="${cardX + 58}" y="${cardY + 18}" text-anchor="middle" class="dim-chip-text">AYAK UZUNLUĞU</text>
      <text x="${cardX + 58}" y="${cardY + 37}" text-anchor="middle" style="fill:#fff;font:900 16px Arial,sans-serif">${fmt(config.uprightHeight)} mm</text>
    `;
  }

  render() {
    if (!this.destroyed && this.models) {
      this.renderer.render(this.scene, this.camera);
      this.renderDimensionOverlay();
    }
  }
}

let canvas = null;
let status = null;
let info = null;
let dimensions = null;
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

const MEKIK_TRAVERSE_CAPACITIES = [
  { grade: "ST37", profile: "50×50×1,5", capacity: 1047, kgPerMeter: 2.27 },
  { grade: "ST37", profile: "50×60×1,5", capacity: 1338, kgPerMeter: 2.5 },
  { grade: "ST37", profile: "50×70×1,5", capacity: 1652, kgPerMeter: 2.75 },
  { grade: "ST52", profile: "50×50×1,5", capacity: 1072, kgPerMeter: 2.27 },
  { grade: "ST52", profile: "50×60×1,5", capacity: 1643, kgPerMeter: 2.5 },
  { grade: "ST52", profile: "50×70×1,5", capacity: 2366, kgPerMeter: 2.75 },
];

function bestTraverseFor(load, grade) {
  return MEKIK_TRAVERSE_CAPACITIES
    .filter((item) => item.grade === grade && item.capacity >= load)
    .sort((a, b) => a.capacity - b.capacity)[0] || null;
}

function traverseValue(item) {
  return item ? `${item.grade}|${item.profile}` : "";
}

function traverseProfileHeight(item) {
  const match = String(item?.profile || "").match(/(\d+)\s*[×xX]\s*(\d+)/);
  return Math.max(1, Number(match?.[2]) || 50);
}

function syncMekikLevelSpacing(panel, selectedTraverse) {
  const levelInput = liveField("m2LevelSpacing");
  if (!levelInput) return;
  if (levelInput.dataset.rafexManualSpacing !== "ready") {
    levelInput.dataset.rafexManualSpacing = "ready";
    levelInput.addEventListener("input", (event) => {
      if (event.isTrusted) levelInput.dataset.rafexLevelSpacingManual = "1";
    });
  }

  const palletHeight = numberFrom("m2LevelH", 1200, 300, 3000);
  const railHeight = numberFrom("m2RailHeight", 170, 150, 170);
  const traverseHeight = traverseProfileHeight(selectedTraverse);
  const palletGap = railHeight + 70 + traverseHeight + 100;
  const automaticSpacing = palletHeight + palletGap;
  const previousAutomatic = Number(levelInput.dataset.rafexAutomaticSpacing);
  const current = Number(levelInput.value);
  const manuallyChanged = levelInput.dataset.rafexLevelSpacingManual === "1";
  if (!manuallyChanged || current === previousAutomatic) {
    const changed = current !== automaticSpacing;
    levelInput.value = String(automaticSpacing);
    levelInput.dataset.rafexLevelSpacingManual = "0";
    if (changed) levelInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
  levelInput.dataset.rafexAutomaticSpacing = String(automaticSpacing);

  const modal = levelInput.closest(".m2-spacing-modal");
  const footer = modal?.querySelector(".m2-spacing-dialog-foot span");
  if (footer) {
    footer.textContent = `Standart: ${palletHeight} + (${railHeight} ray + 70 + ${traverseHeight} travers + 100) = ${automaticSpacing} mm. Elle değiştirilebilir.`;
  }
}

function updateTraverseChoice(panel, keepSelection = false) {
  const select = panel.querySelector(".rafex-mekik-traverse-select");
  const formula = panel.querySelector(".rafex-mekik-traverse-formula");
  const manualButton = panel.querySelector(".rafex-mekik-traverse-manual");
  if (!select || !formula || !manualButton) return;

  const levels = Math.max(1, Math.round(numberFrom("m2Levels", 4, 1, 15)));
  const depth = Math.max(1, Math.round(numberFrom("m2Depth", 5, 1, 60)));
  const palletWeight = numberFrom("m2PalletWeight", 1000, 0, 10000);
  const drawing = activeDrawing();
  const footCount = Math.max(1, Math.round(Number(drawing?.plan?.feet?.length) || Number(drawing?.footCount) || 1));
  const system = String(liveField("m2System")?.value || "fifo").toLowerCase() === "filo" ? "filo" : "fifo";
  const hasExtra = String(liveField("m2Extra")?.value || "0") === "1";
  const divisor = Math.max(1,
    system === "fifo"
      ? (footCount * 2) - (hasExtra ? 1 : 2)
      : (footCount * 2) - (hasExtra ? 0 : 1)
  );
  document.querySelectorAll(".rafex-mekik-channel-traverse-count").forEach((node) => {
    node.textContent = `${new Intl.NumberFormat("tr-TR").format(divisor)} adet`;
  });
  const totalPalletLoad = palletWeight * depth * levels;
  const levelLoad = totalPalletLoad / levels;
  const load = levelLoad / divisor;
  document.querySelectorAll(".rafex-mekik-traverse-load-value").forEach((node) => {
    node.textContent = `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(load)} kg`;
  });
  const manual = manualButton.getAttribute("aria-pressed") === "true";
  formula.textContent = `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(totalPalletLoad)} ÷ ${levels} ÷ ${divisor} = ${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(load)} kg · ${system.toUpperCase()} · ${hasExtra ? "ekstra profil var" : "ekstra profil yok"}`;
  const previous = keepSelection ? select.value : "";
  const recommendations = ["ST37", "ST52"].map((grade) => bestTraverseFor(load, grade)).filter(Boolean);
  const choices = manual ? MEKIK_TRAVERSE_CAPACITIES : recommendations;

  select.replaceChildren();
  if (!load) {
    select.add(new Option("Yük girin", ""));
    select.disabled = true;
    return;
  }
  if (!choices.length) {
    select.add(new Option("Uygun profil yok", ""));
    select.disabled = true;
    return;
  }

  select.disabled = false;
  choices.forEach((item, index) => {
    const prefix = manual ? "" : `${index + 1}. ÖNERİ · `;
    select.add(new Option(`${prefix}${item.profile} ${item.grade}`, traverseValue(item)));
  });
  if (previous && choices.some((item) => traverseValue(item) === previous)) select.value = previous;

  const selected = choices.find((item) => traverseValue(item) === select.value) || choices[0];
  select.value = traverseValue(selected);
  syncMekikLevelSpacing(panel, selected);
}

function ensureTraverseCalculator() {
  if (!isMekikFront()) return;
  if (!document.getElementById("rafex-mekik-traverse-style")) {
    const style = document.createElement("style");
    style.id = "rafex-mekik-traverse-style";
    style.textContent = `
      .m2-traverse-placeholder.rafex-mekik-traverse-choice{display:block;padding:0;border:0;background:transparent}
      .rafex-mekik-traverse-choice>span{display:block;margin-bottom:6px}
      .rafex-mekik-traverse-choice .m2-foot-choice-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}
      .rafex-mekik-traverse-select{min-width:0}
      .rafex-mekik-traverse-formula{display:block;margin-top:8px;padding:7px 8px;border-radius:7px;background:#fff9d8;color:#5d5120;font:800 10px/1.35 Arial,sans-serif}
    `;
    document.head.appendChild(style);
  }

  document.querySelectorAll(".rafex-mekik-traverse-calc").forEach((node) => node.remove());
  for (const totalValue of document.querySelectorAll('[id="m2TotalPalletLoad"]')) {
    const totalMetric = totalValue.closest(".m2-metric");
    if (!totalMetric || totalMetric.parentElement?.querySelector(".rafex-mekik-channel-traverse-metric")) continue;
    const metric = document.createElement("div");
    metric.className = "m2-metric rafex-mekik-channel-traverse-metric";
    metric.innerHTML = '<small>KANALDAKİ TRAVERS ADEDİ</small><b class="rafex-mekik-channel-traverse-count">—</b>';
    const rowMate = totalMetric.nextElementSibling?.classList.contains("m2-metric") ? totalMetric.nextElementSibling : totalMetric;
    rowMate.insertAdjacentElement("afterend", metric);
    const loadMetric = document.createElement("div");
    loadMetric.className = "m2-metric rafex-mekik-traverse-load-metric";
    loadMetric.innerHTML = '<small>TRAVERS BAŞINA GELEN YÜK</small><b class="rafex-mekik-traverse-load-value">—</b>';
    metric.insertAdjacentElement("afterend", loadMetric);
  }
  for (const placeholder of document.querySelectorAll(".m2-traverse-placeholder")) {
    if (placeholder.dataset.rafexTraverseChoice === "ready") {
      updateTraverseChoice(placeholder, true);
      continue;
    }
    placeholder.dataset.rafexTraverseChoice = "ready";
    placeholder.classList.add("rafex-mekik-traverse-choice");
    placeholder.innerHTML = `
      <span>Önerilen Travers</span>
      <div class="m2-foot-choice-row">
        <select class="classic-choice rafex-mekik-traverse-select" aria-label="Önerilen Mekik traversi"></select>
        <button class="m2-foot-manual-button rafex-mekik-traverse-manual" type="button" aria-pressed="false">Manuel Seç</button>
      </div>
      <small class="rafex-mekik-traverse-formula"></small>
    `;
    const select = placeholder.querySelector(".rafex-mekik-traverse-select");
    const manualButton = placeholder.querySelector(".rafex-mekik-traverse-manual");
    select?.addEventListener("change", () => updateTraverseChoice(placeholder, true));
    manualButton?.addEventListener("click", () => {
      const manual = manualButton.getAttribute("aria-pressed") !== "true";
      manualButton.setAttribute("aria-pressed", String(manual));
      manualButton.textContent = manual ? "Öneriye Dön" : "Manuel Seç";
      updateTraverseChoice(placeholder, true);
    });
    updateTraverseChoice(placeholder);
  }
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
  if (!dimensions) {
    dimensions = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    dimensions.classList.add("rafex-mekik-front-dimensions-v2");
    dimensions.setAttribute("aria-label", "Mekik ön görünüş kot aralıkları ve ayak uzunluğu ölçüleri");
    dimensions.style.cssText = "position:absolute;inset:0;z-index:3;width:100%;height:100%;pointer-events:none;overflow:visible";
  }
}

function ensureMounted() {
  scheduled = 0;
  if (!isMekikFront()) return;
  ensureTraverseCalculator();
  const host = document.getElementById("m2Front");
  if (!host) return;
  ensureElements();
  if (canvas.parentElement !== host || status.parentElement !== host || info.parentElement !== host || dimensions.parentElement !== host || host.childElementCount !== 4) {
    host.replaceChildren(canvas, status, info, dimensions);
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
