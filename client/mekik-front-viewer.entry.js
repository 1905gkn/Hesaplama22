import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const ASSET_VERSION = "mekik-front-glb-v32";
const REFERENCE_BAY_PITCH = 1450;
const REFERENCE_UPRIGHT_WIDTH = 100;
const EURO_PALLET_VISUAL_HEIGHT = 140;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

let sharedModelsPromise = null;
let mekikFootColorChoice = "ral5010";
let mekikTraverseColorChoice = "ral1007";
let mekikSideClearanceChoice = 75;

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
  const page = document.getElementById("page");
  if (!page) return false;

  const title = String(document.getElementById("pageTitle")?.textContent || "")
    .trim()
    .toLocaleLowerCase("tr-TR");
  const module = String(page.dataset?.m2Module || "");

  // Sayfa değişiminde global modül kısa süre eski değerde kalabiliyor.
  // Görünen Mekik başlığı ve güncel DOM modülü bu yüzden önceliklidir.
  if (title === "mekik") return true;
  if (page.classList.contains("b2b-mode") || page.classList.contains("drive-in-mode")) return false;
  if (module === "mekik2") return true;
  if (title || module) return false;

  try {
    return typeof m2ActiveModule !== "undefined" && String(m2ActiveModule) === "mekik2";
  } catch (_) {
    return false;
  }
}

function readConfig() {
  const drawing = activeDrawing();
  const colorValue = (className, fallback) => {
    const nodes = Array.from(document.querySelectorAll(`.${className}`));
    const visible = nodes.filter((node) => node.isConnected && node.getClientRects().length > 0);
    return String((visible.at(-1) || nodes.at(-1))?.value || fallback);
  };
  const footColor = colorValue("rafex-mekik-foot-color", drawing?.mekikFootColor || mekikFootColorChoice);
  const traverseColor = colorValue("rafex-mekik-traverse-color", drawing?.mekikTraverseColor || mekikTraverseColorChoice);
  const traverseChoice = colorValue("rafex-mekik-traverse-select", "ST37|50×50×1,5");
  const traverseMatch = traverseChoice.match(/(\d+)\s*[×xX]\s*(\d+)/);
  const traverseHeight = Math.max(1, Number(traverseMatch?.[2]) || 50);
  const sideClearance = numberFromAny([], colorValue("rafex-mekik-side-clearance", drawing?.mekikSideClearance ?? mekikSideClearanceChoice), 0, 1000);
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
  const bayPitch = palletWidth + sideClearance * 2;
  return {
    bays,
    levels,
    palletWidth,
    palletDepth,
    palletHeight,
    firstLevelHeight,
    levelSpacing,
    footType,
    footColor,
    traverseColor,
    traverseHeight,
    sideClearance,
    uprightHeight,
    bayPitch,
    totalWidth: bays * bayPitch + footType,
  };
}

const MEKIK_FINISH_COLORS = {
  ral5010: 0x004f7c,
  pgv: 0xa8b0b3,
  ral1007: 0xe5be01,
  ral2004: 0xf44611,
};

function finishMaterial(key, type) {
  const galvanized = key === "pgv";
  return new THREE.MeshStandardMaterial({
    color: MEKIK_FINISH_COLORS[key] ?? (type === "foot" ? MEKIK_FINISH_COLORS.ral5010 : MEKIK_FINISH_COLORS.ral1007),
    metalness: galvanized ? 0.7 : 0.34,
    roughness: galvanized ? 0.32 : 0.46,
  });
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
  const normalizedProfileBounds = type === "traverse" && profile
    ? new THREE.Box3().setFromObject(profile)
    : normalizedBounds;
  return {
    root,
    size: normalizedBounds.getSize(new THREE.Vector3()),
    topOffset: normalizedBounds.max.z,
    profileBottomOffset: normalizedProfileBounds.min.z,
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
    const displayScale = Number(window.devicePixelRatio) || 1;
    this.renderer.setPixelRatio(clamp(displayScale * 1.5, 2, 2.5));
    this.renderer.domElement.style.imageRendering = "auto";
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
    return [config.bays, config.levels, config.palletWidth, config.palletDepth, config.palletHeight, config.firstLevelHeight, config.levelSpacing, config.footType, config.footColor, config.traverseColor, config.traverseHeight, config.sideClearance, config.uprightHeight].join("|");
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
    const uprightMaterial = finishMaterial(config.footColor, "foot");
    const traverseMaterial = finishMaterial(config.traverseColor, "traverse");

    for (let index = 0; index <= config.bays; index += 1) {
      const upright = this.models.upright.root.clone(true);
      upright.name = `Mekik Ayak ${index + 1}`;
      upright.traverse((part) => { if (part.isMesh) part.material = uprightMaterial; });
      upright.scale.set(uprightScaleX, 1, uprightScaleZ);
      upright.position.set(index * config.bayPitch, 0, 0);
      this.root.add(upright);
    }

    const traverseScaleX = config.bayPitch / REFERENCE_BAY_PITCH;
    const traverseFrontY = Math.max(8, this.models.upright.size.y * 0.5 + 2);
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
        traverse.traverse((part) => { if (part.isMesh) part.material = traverseMaterial; });
        traverse.scale.set(traverseScaleX, 1, 1);
        traverse.position.set(bayCenterX, traverseFrontY, supportZ);
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
    let halfWidth = Math.max(700, size.x * 0.82);
    let halfHeight = Math.max(700, size.z * 0.75);
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
    const rackEdgeA = point(0, 0).x;
    const rackEdgeB = point(config.bays * config.bayPitch, 0).x;
    const rackLeft = Math.min(rackEdgeA, rackEdgeB);
    const rackRight = Math.max(rackEdgeA, rackEdgeB);
    const fallbackBounds = (minZ, maxZ) => new THREE.Box3(
      new THREE.Vector3(0, 0, minZ),
      new THREE.Vector3(0, 0, maxZ),
    );
    const boundsFor = (name, minZ, maxZ) => {
      const object = this.root.getObjectByName(name);
      return object ? new THREE.Box3().setFromObject(object) : fallbackBounds(minZ, maxZ);
    };
    const uprightBounds = boundsFor("Mekik Ayak 1", 0, config.uprightHeight);
    // Ölçü zincirinin sıfırı, ilk ayağın sahnede gerçekten başladığı alt noktadır.
    const groundZ = uprightBounds.min.z;
    const uprightTopZ = uprightBounds.max.z;
    const traverseBounds = Array.from({ length: config.levels }, (_, level) => {
      const supportZ = config.firstLevelHeight + level * config.levelSpacing;
      return boundsFor(`Mekik Travers G1 K${level + 1}`, supportZ - config.traverseHeight, supportZ);
    });
    // Teknik kotlar yalnız formdaki mühendislik ölçülerinden üretilir.
    // GLB montaj/ofset değerleri ölçü zincirine kesinlikle eklenmez.
    const palletContactZ = (level) => (
      config.firstLevelHeight
      + level * config.levelSpacing
    );
    const floorY = point(0, groundZ).y;
    const topY = point(0, uprightTopZ).y;
    const leftX = Math.max(108, rackLeft - Math.min(34, width * 0.035));
    const innerRightX = Math.min(width - 76, rackRight + Math.min(30, width * 0.03));
    const rightX = Math.min(width - 36, rackRight + Math.min(68, width * 0.065));
    const originPoint = point(0, groundZ);
    const lineParts = [];
    const labelParts = [];

    const verticalDimension = (x, z1, z2, label, side = "left") => {
      const a = point(0, z1), b = point(0, z2);
      lineParts.push(`<line x1="${x}" y1="${a.y}" x2="${x}" y2="${b.y}" class="dim-main" marker-start="url(#mekik-arrow)" marker-end="url(#mekik-arrow)"/>`);
      const guideTarget = side === "left" ? rackLeft : rackRight;
      lineParts.push(`<line x1="${x}" y1="${a.y}" x2="${guideTarget}" y2="${a.y}" class="dim-guide"/>`);
      lineParts.push(`<line x1="${x}" y1="${b.y}" x2="${guideTarget}" y2="${b.y}" class="dim-guide"/>`);
      const middleY = (a.y + b.y) / 2;
      if (side === "inside" || side === "outside") {
        const labelX = side === "inside" ? x - 8 : x + 8;
        labelParts.push(`<text x="${labelX}" y="${middleY}" text-anchor="middle" class="dim-text dim-vertical-text" transform="rotate(-90 ${labelX} ${middleY})">${label}</text>`);
      } else {
        const textX = side === "left" ? x - 9 : x + 9;
        const anchor = side === "left" ? "end" : "start";
        labelParts.push(`<text x="${textX}" y="${middleY + 4}" text-anchor="${anchor}" class="dim-text">${label}</text>`);
      }
    };

    const firstPalletBottom = palletContactZ(0);
    const groundHeight = Math.max(0, firstPalletBottom - groundZ);
    verticalDimension(leftX, groundZ, firstPalletBottom, `ZEMİN · ${fmt(groundHeight)} mm`);
    for (let level = 1; level < config.levels; level += 1) {
      const from = palletContactZ(level - 1);
      const to = palletContactZ(level) - config.traverseHeight;
      const clearLevelHeight = Math.max(0, to - from);
      verticalDimension(leftX, from, to, `K${level} · ${fmt(clearLevelHeight)} mm`);
    }
    const topPalletBottom = palletContactZ(config.levels - 1);
    verticalDimension(innerRightX, groundZ, topPalletBottom, `SON PALET YÜKSEKLİĞİ · ${fmt(topPalletBottom - groundZ)} mm`, "inside");
    verticalDimension(rightX, groundZ, uprightTopZ, `AYAK UZUNLUĞU · ${fmt(uprightTopZ - groundZ)} mm`, "outside");
    dimensions.innerHTML = `
      <defs>
        <marker id="mekik-arrow" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto-start-reverse">
          <path d="M0,2.5 L5,0 L5,5 Z" fill="#d7a900"/>
        </marker>
      </defs>
      <style>
        .dim-main{stroke:#d7a900;stroke-width:1.35}
        .dim-guide{stroke:#d7a900;stroke-width:.9;stroke-dasharray:3 3;opacity:.8}
        .dim-text{fill:#073c30;font:800 9px Arial,sans-serif}
        .dim-vertical-text{font-size:8px;letter-spacing:.15px}
        .dim-column-text{fill:#fff;font:900 7.5px Arial,sans-serif}
        .dim-title{fill:#073c30;font:900 11px Arial,sans-serif}
        .dim-chip{fill:#073c30}
        .dim-chip-text{fill:#fff;font:900 9px Arial,sans-serif}
        .dim-warm{fill:#fff1b8;stroke:#d7a900;stroke-width:1}
        .dim-warm-text{fill:#3e3511;font:900 9px Arial,sans-serif}
        .dim-origin-dot{fill:#d7a900;stroke:#073c30;stroke-width:1}
      </style>
      <circle cx="${originPoint.x}" cy="${originPoint.y}" r="3.2" class="dim-origin-dot"/>
      <text x="${Math.max(14, leftX - 112)}" y="${Math.max(92, topY + 18)}" class="dim-title">KOT ARALIKLARI</text>
      ${lineParts.join("")}
      ${labelParts.join("")}
      <rect x="${rackLeft}" y="25" width="144" height="18" rx="9" class="dim-chip"/>
      <text x="${rackLeft + 72}" y="37" text-anchor="middle" class="dim-column-text">KOLON ARALIĞI · ${fmt(config.bayPitch)} mm</text>
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

function ensureMekikColorSelectors() {
  if (!isMekikFront()) return;
  if (!document.getElementById("rafex-mekik-color-style")) {
    const style = document.createElement("style");
    style.id = "rafex-mekik-color-style";
    style.textContent = `
      .rafex-mekik-color-row{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .rafex-mekik-color-row .input-field{min-width:0}
      .rafex-mekik-color-row select{width:100%}
    `;
    document.head.appendChild(style);
  }

  const drawing = activeDrawing();
  if (["ral5010", "pgv"].includes(String(drawing?.mekikFootColor))) mekikFootColorChoice = String(drawing.mekikFootColor);
  if (["ral1007", "ral2004"].includes(String(drawing?.mekikTraverseColor))) mekikTraverseColorChoice = String(drawing.mekikTraverseColor);

  for (const projectInput of document.querySelectorAll('[id="m2ProjectName"]')) {
    const projectLabel = projectInput.closest("label");
    const form = projectInput.closest(".m2-form");
    if (!projectLabel || !form) continue;
    let row = form.querySelector(".rafex-mekik-color-row");
    if (!row) {
      row = document.createElement("div");
      row.className = "rafex-mekik-color-row";
      row.innerHTML = `
        <label class="input-field">Ayak rengi
          <select class="classic-choice rafex-mekik-foot-color">
            <option value="ral5010">RAL 5010</option>
            <option value="pgv">PGV</option>
          </select>
        </label>
        <label class="input-field">Travers rengi
          <select class="classic-choice rafex-mekik-traverse-color">
            <option value="ral1007">RAL 1007</option>
            <option value="ral2004">RAL 2004</option>
          </select>
        </label>
      `;
      projectLabel.insertAdjacentElement("afterend", row);
      row.querySelector(".rafex-mekik-foot-color")?.addEventListener("change", (event) => {
        mekikFootColorChoice = event.currentTarget.value;
        const current = activeDrawing();
        if (current) current.mekikFootColor = mekikFootColorChoice;
        scheduleMount();
      });
      row.querySelector(".rafex-mekik-traverse-color")?.addEventListener("change", (event) => {
        mekikTraverseColorChoice = event.currentTarget.value;
        const current = activeDrawing();
        if (current) current.mekikTraverseColor = mekikTraverseColorChoice;
        scheduleMount();
      });
    }
    const footSelect = row.querySelector(".rafex-mekik-foot-color");
    const traverseSelect = row.querySelector(".rafex-mekik-traverse-color");
    if (footSelect && footSelect.value !== mekikFootColorChoice) footSelect.value = mekikFootColorChoice;
    if (traverseSelect && traverseSelect.value !== mekikTraverseColorChoice) traverseSelect.value = mekikTraverseColorChoice;
    const current = activeDrawing();
    if (current) {
      current.mekikFootColor = mekikFootColorChoice;
      current.mekikTraverseColor = mekikTraverseColorChoice;
    }
  }
}


function ensureMekikSideClearance() {
  if (!isMekikFront()) return;
  if (!document.getElementById("rafex-mekik-side-clearance-style")) {
    const style = document.createElement("style");
    style.id = "rafex-mekik-side-clearance-style";
    style.textContent = `
      .rafex-mekik-side-clearance-section label{display:grid;grid-template-columns:minmax(0,1fr) 110px;align-items:center;gap:12px;margin-top:10px;font-weight:800}
      .rafex-mekik-side-clearance-section input{width:100%;box-sizing:border-box}
      .rafex-mekik-side-clearance-formula{display:block;margin-top:8px;color:#5d5120;font-weight:800}
    `;
    document.head.appendChild(style);
  }

  const drawing = activeDrawing();
  const saved = Number(drawing?.mekikSideClearance);
  if (Number.isFinite(saved)) mekikSideClearanceChoice = clamp(saved, 0, 1000);

  for (const modal of document.querySelectorAll('[id="m2SpacingModal"]')) {
    const sections = modal.querySelector(".m2-spacing-sections");
    if (!sections) continue;
    let section = sections.querySelector(".rafex-mekik-side-clearance-section");
    if (!section) {
      section = document.createElement("section");
      section.className = "m2-spacing-section rafex-mekik-side-clearance-section";
      section.innerHTML = `
        <b>Yan boşluk</b>
        <small>Paletin solunda ve sağında ayrı ayrı uygulanır.</small>
        <label>Yan boşluk (mm)
          <input class="rafex-mekik-side-clearance" type="number" min="0" max="1000" step="5" value="75" inputmode="numeric">
        </label>
        <small class="rafex-mekik-side-clearance-formula"></small>
      `;
      sections.appendChild(section);
      section.querySelector(".rafex-mekik-side-clearance")?.addEventListener("input", (event) => {
        const value = clamp(Number(event.currentTarget.value) || 0, 0, 1000);
        mekikSideClearanceChoice = value;
        const current = activeDrawing();
        if (current) current.mekikSideClearance = value;
        scheduleMount();
      });
    }

    const input = section.querySelector(".rafex-mekik-side-clearance");
    if (input && document.activeElement !== input && Number(input.value) !== mekikSideClearanceChoice) {
      input.value = String(mekikSideClearanceChoice);
    }
    const palletWidth = numberFrom("m2PalW", Number(drawing?.palW) || 1200, 600, 1800);
    const columnSpacing = palletWidth + mekikSideClearanceChoice * 2;
    const formula = `${new Intl.NumberFormat("tr-TR").format(palletWidth)} + (${new Intl.NumberFormat("tr-TR").format(mekikSideClearanceChoice)} × 2) = ${new Intl.NumberFormat("tr-TR").format(columnSpacing)} mm kolon aralığı`;
    const formulaNode = section.querySelector(".rafex-mekik-side-clearance-formula");
    if (formulaNode && formulaNode.textContent !== formula) formulaNode.textContent = formula;
  }

  if (drawing) drawing.mekikSideClearance = mekikSideClearanceChoice;
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
    info.style.display = "none";
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
  ensureMekikColorSelectors();
  ensureMekikSideClearance();
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
