import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ASSET_VERSION = "drive-in-front-v11";
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
let sharedModelsPromise = null;
const sourceMetrics = new WeakMap();
const technicalMaterials = {
  ayak: new THREE.MeshStandardMaterial({ color: 0x68757f, metalness: 0.62, roughness: 0.38 }),
  ray: new THREE.MeshStandardMaterial({ color: 0xd6a11f, metalness: 0.42, roughness: 0.34 }),
  konsol: new THREE.MeshStandardMaterial({ color: 0xb96e18, metalness: 0.38, roughness: 0.4 }),
  arabag: new THREE.MeshStandardMaterial({ color: 0x465963, metalness: 0.58, roughness: 0.4 }),
  palet: new THREE.MeshStandardMaterial({ color: 0x9a6028, metalness: 0.04, roughness: 0.94 }),
  yuk: new THREE.MeshStandardMaterial({ color: 0xc58b47, metalness: 0, roughness: 0.94 }),
};
const loadBoxGeometry = new THREE.BoxGeometry(1, 1, 1);

function metricsOf(source) {
  let metrics = sourceMetrics.get(source);
  if (metrics) return metrics;
  source.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(source);
  metrics = {
    center: bounds.getCenter(new THREE.Vector3()),
    size: bounds.getSize(new THREE.Vector3()),
  };
  sourceMetrics.set(source, metrics);
  return metrics;
}

function cloneAtPhysicalScale(source, scale, material, orientation = {}) {
  const clone = source.clone(true);
  clone.traverse((part) => {
    if (!part.isMesh) return;
    part.castShadow = false;
    part.receiveShadow = false;
    part.material = material;
  });
  const center = metricsOf(source).center;
  clone.scale.copy(scale);
  clone.position.set(-center.x * scale.x, -center.y * scale.y, -center.z * scale.z);
  const oriented = new THREE.Group();
  oriented.rotation.y = orientation.rotateY === false ? 0 : Math.PI;
  oriented.rotation.z = orientation.rotationZ || 0;
  oriented.add(clone);
  return oriented;
}

class DriveInFrontViewer {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.config = this.normalize(config);
    this.destroyed = false;
    this.models = null;
    this.root = new THREE.Group();
    this.lastWidth = 0;
    this.lastHeight = 0;
    this.resizeFrame = 0;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = false;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.scene.add(this.root);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x7d8781, 2.6));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(-4000, 6500, 9000);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 1.35);
    fill.position.set(5000, -4500, 3500);
    this.scene.add(fill);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 100000);
    this.camera.up.set(0, 0, 1);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableRotate = false;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.screenSpacePanning = true;
    this.controls.addEventListener("change", () => this.renderScene());

    this.resizeObserver = new ResizeObserver(() => this.scheduleResize());
    this.resizeObserver.observe(canvas.parentElement || canvas);
    this.scheduleResize(true);
    this.load();
  }

  normalize(next = {}) {
    const palletHeight = clamp(Number(next.palletHeight) || 1200, 300, 3000);
    const firstLevelHeight = clamp(Number(next.firstLevelHeight) || 430, 0, 5000);
    const palletDepth = clamp(Number(next.palletDepth) || 800, 300, 3000);
    const depthPallets = clamp(Math.round(Number(next.depthPallets) || 5), 1, 60);
    const systemType = String(next.systemType || "fifo").toLowerCase() === "filo" ? "filo" : "fifo";
    const firstPalletGap = clamp(Number(next.firstPalletGap) || 200, 0, 2000);
    const palletGap = clamp(Number(next.palletGap) || 50, 0, 2000);
    const gapCount = Math.max(0, depthPallets - 1);
    const specialGapCount = systemType === "filo" ? Math.min(1, gapCount) : Math.min(2, gapCount);
    const railLength = depthPallets * palletDepth + specialGapCount * firstPalletGap + (gapCount - specialGapCount) * palletGap;
    return {
      bays: clamp(Math.round(Number(next.bays) || 1), 1, 50),
      levels: clamp(Math.round(Number(next.levels) || 4), 1, 15),
      palletWidth: clamp(Number(next.palletWidth) || 1200, 300, 3000),
      palletDepth,
      palletHeight,
      depthPallets,
      systemType,
      firstPalletGap,
      palletGap,
      railLength,
      firstLevelHeight,
      levelSpacing: clamp(Number(next.levelSpacing) || Math.max(1580, palletHeight + 380), palletHeight + 80, 5000),
    };
  }

  configKey(value = this.config) {
    return [value.bays, value.levels, value.depthPallets, value.palletWidth, value.palletDepth, value.palletHeight, value.firstLevelHeight, value.levelSpacing, value.systemType, value.firstPalletGap, value.palletGap].join("|");
  }

  emit(name, detail = {}) { this.canvas.dispatchEvent(new CustomEvent(name, { detail })); }

  async load() {
    this.emit("drive-in-loading");
    try {
      if (!sharedModelsPromise) {
        const draco = new DRACOLoader();
        draco.setDecoderPath("/draco/");
        draco.setDecoderConfig({ type: "wasm" });
        const loader = new GLTFLoader();
        loader.setDRACOLoader(draco);
        loader.setMeshoptDecoder(MeshoptDecoder);
        const source = (name) => `/drive-in/${name}.glb?v=${ASSET_VERSION}`;
        sharedModelsPromise = Promise.all([
          loader.loadAsync(source("drive-in-ayak-top")),
          loader.loadAsync(source("drive-in-ray")),
          loader.loadAsync(source("drive-in-konsol")),
          loader.loadAsync(source("drive-in-arabag")),
          loader.loadAsync(source("drive-in-palet")),
        ]).finally(() => draco.dispose());
      }
      const [ayak, ray, konsol, arabag, palet] = await sharedModelsPromise;
      if (this.destroyed) return;
      this.models = { ayak: ayak.scene, ray: ray.scene, konsol: konsol.scene, arabag: arabag.scene, palet: palet.scene };
      this.rebuild();
      this.emit("drive-in-ready", { sources: ["DRIVE IN AYAK TOP", "DRIVE IN RAY BÜKÜMLÜ", "KONSOL", "ARABAĞ DRIVEIN", "DRIVE IN PALET"] });
    } catch (error) {
      sharedModelsPromise = null;
      console.error("Drive In GLB yükleme hatası", error);
      this.emit("drive-in-error", { message: error?.message || "Drive In GLB yüklenemedi" });
    }
  }

  update(next = {}) {
    const normalized = this.normalize({ ...this.config, ...next });
    if (this.configKey(normalized) === this.configKey(this.config)) return;
    this.config = normalized;
    if (this.models) this.rebuild();
  }

  addPart(source, scale, position, material, orientation) {
    const holder = new THREE.Group();
    holder.position.copy(position);
    holder.add(cloneAtPhysicalScale(source, scale, material, orientation));
    this.root.add(holder);
    return holder;
  }

  addLoadBox(size, position) {
    const mesh = new THREE.Mesh(loadBoxGeometry, technicalMaterials.yuk);
    mesh.scale.copy(size);
    mesh.position.copy(position);
    this.root.add(mesh);
    return mesh;
  }

  rebuild() {
    this.root.clear();
    this.visualPalletBottomZ = [];
    const c = this.config;
    const uprightWidth = 90;
    const bayClear = c.palletWidth + 150;
    const bayPitch = bayClear + uprightWidth;
    const rackWidth = c.bays * bayClear + (c.bays + 1) * uprightWidth;
    const rackHeight = c.firstLevelHeight + Math.max(0, c.levels - 1) * c.levelSpacing + c.palletHeight + 220;
    const depth = Math.max(c.palletDepth, c.railLength);
    const ayakSize = metricsOf(this.models.ayak).size;
    const raySize = metricsOf(this.models.ray).size;
    const konsolSize = metricsOf(this.models.konsol).size;
    const arabagSize = metricsOf(this.models.arabag).size;
    const paletSize = metricsOf(this.models.palet).size;
    const ayakScale = new THREE.Vector3(uprightWidth / ayakSize.x, 1, rackHeight / ayakSize.z);
    const rayScale = new THREE.Vector3(1, depth / raySize.y, 150 / raySize.z);
    const konsolUniform = Math.min((bayClear + uprightWidth) / konsolSize.x, 1.05);
    const konsolScale = new THREE.Vector3(konsolUniform, konsolUniform, konsolUniform);
    const konsolHeight = konsolSize.z * konsolUniform;
    const arabagScale = new THREE.Vector3(uprightWidth / arabagSize.x, 1, 1);
    // Yeni palet kaynağının planı 800 × 1200 mm'dir. Kaynağın X ekseni raf
    // derinliğine, Y ekseni ön görünüş genişliğine çevrilir. Fiziksel palet
    // kalınlığı 150 mm'de tutulur; formdaki yükseklik üstteki yük kutusudur.
    const paletDepthScale = c.palletDepth / paletSize.x;
    const paletWidthScale = c.palletWidth / paletSize.y;
    const palletThickness = 150;
    const paletThicknessScale = palletThickness / paletSize.z;
    const paletScale = new THREE.Vector3(paletDepthScale, paletWidthScale, paletThicknessScale);
    const frontY = depth / 2;

    for (let i = 0; i <= c.bays; i += 1) {
      const x = uprightWidth / 2 + i * bayPitch;
      this.addPart(this.models.ayak, ayakScale, new THREE.Vector3(x, frontY - ayakSize.y / 2, rackHeight / 2), technicalMaterials.ayak);
    }

    for (let level = 0; level < c.levels; level += 1) {
      const supportZ = c.firstLevelHeight + level * c.levelSpacing;
      // Formdaki ilk kat ve kat aralığı değerleri taşıma üst kotunu belirtir.
      const supportTopZ = supportZ;
      for (let bay = 0; bay < c.bays; bay += 1) {
        const left = uprightWidth + bay * bayPitch;
        const right = left + bayClear;
        const centerX = (left + right) / 2;
        this.addPart(this.models.ray, rayScale, new THREE.Vector3(left + raySize.x / 2, 0, supportTopZ - 75), technicalMaterials.ray);
        this.addPart(this.models.ray, rayScale, new THREE.Vector3(right - raySize.x / 2, 0, supportTopZ - 75), technicalMaterials.ray);
        this.addPart(this.models.konsol, konsolScale, new THREE.Vector3(centerX, frontY - konsolSize.y * konsolUniform / 2, supportTopZ - konsolHeight / 2), technicalMaterials.konsol);
        const palletSeatZ = supportTopZ - palletThickness;
        const palletPart=this.addPart(this.models.palet, paletScale, new THREE.Vector3(centerX, frontY - c.palletDepth / 2 - 40, palletSeatZ + palletThickness / 2), technicalMaterials.palet, { rotateY: false, rotationZ: -Math.PI / 2 });
        if(bay===0){palletPart.updateMatrixWorld(true);this.visualPalletBottomZ[level]=new THREE.Box3().setFromObject(palletPart).min.z;}
        this.addLoadBox(
          new THREE.Vector3(c.palletWidth * 0.94, c.palletDepth * 0.94, c.palletHeight),
          new THREE.Vector3(centerX, frontY - c.palletDepth / 2 - 40, palletSeatZ + palletThickness + c.palletHeight / 2),
        );
      }
      for (let i = 0; i <= c.bays; i += 1) {
        const x = uprightWidth / 2 + i * bayPitch;
        this.addPart(this.models.arabag, arabagScale, new THREE.Vector3(x, frontY - ayakSize.y - arabagSize.y / 2, supportZ + arabagSize.z / 2), technicalMaterials.arabag);
      }
    }
    this.fitCamera();
    this.renderScene();
  }

  fitCamera() {
    const bounds = new THREE.Box3().setFromObject(this.root);
    if (bounds.isEmpty()) return;
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const width = this.lastWidth || Math.max(1, Math.round(this.canvas.getBoundingClientRect().width));
    const height = this.lastHeight || Math.max(1, Math.round(this.canvas.getBoundingClientRect().height));
    const aspect = Math.max(0.3, width / Math.max(1, height));
    let halfW = size.x * 0.6;
    let halfH = size.z * 0.62;
    if (halfW / halfH < aspect) halfW = halfH * aspect; else halfH = halfW / aspect;
    // Teknik kot ve toplam yükseklik ölçülerine iki yanda sabit okuma alanı bırak.
    halfW *= 1.22;
    halfH *= 1.22;
    this.camera.left = -halfW;
    this.camera.right = halfW;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.position.set(center.x, center.y + Math.max(10000, size.y * 3), center.z);
    this.camera.near = 1;
    this.camera.far = Math.max(100000, size.y * 10 + 10000);
    this.controls.target.copy(center);
    this.camera.lookAt(center);
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
    this.controls.update();
    this.camera.updateMatrixWorld();
    const project = (x, z) => {
      const point = new THREE.Vector3(x, center.y, z).project(this.camera);
      return { x: (point.x + 1) * width / 2, y: (1 - point.y) * height / 2 };
    };
    const lowerLeft = project(bounds.min.x, bounds.min.z);
    const upperRight = project(bounds.max.x, bounds.max.z);
    const rackWidth = this.config.bays * (this.config.palletWidth + 150) + (this.config.bays + 1) * 90;
    const rackEdgeA = project(0, 0).x;
    const rackEdgeB = project(rackWidth, 0).x;
    this.emit("drive-in-layout", {
      left: Math.min(rackEdgeA, rackEdgeB),
      right: Math.max(rackEdgeA, rackEdgeB),
      top: Math.min(lowerLeft.y, upperRight.y),
      bottom: Math.max(lowerLeft.y, upperRight.y),
      groundY: project(0, bounds.min.z).y,
      supportYs: Array.from({ length: this.config.levels }, (_, level) => (
        project(0, Number.isFinite(this.visualPalletBottomZ?.[level])?this.visualPalletBottomZ[level]:this.config.firstLevelHeight + level * this.config.levelSpacing).y
      )),
      uprightTopY: project(0, bounds.max.z).y,
      width,
      height,
    });
  }

  scheduleResize(force = false) {
    if (this.destroyed) return;
    if (force && this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
    if (this.resizeFrame && !force) return;
    this.resizeFrame = requestAnimationFrame(() => { this.resizeFrame = 0; this.resize(force); });
  }

  resize(force = false) {
    if (this.destroyed) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (!force && width === this.lastWidth && height === this.lastHeight) return;
    this.lastWidth = width;
    this.lastHeight = height;
    this.renderer.setSize(width, height, false);
    if (this.models) this.fitCamera();
    this.renderScene();
  }

  renderScene() { if (!this.destroyed) this.renderer.render(this.scene, this.camera); }
  render() { this.renderScene(); }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
    this.resizeObserver?.disconnect?.();
    this.controls?.dispose?.();
    this.root.clear();
    this.renderer?.renderLists?.dispose?.();
    this.renderer?.dispose?.();
  }
}

let active = null;
window.RafexDriveInViewer = {
  mount(canvas, config = {}) {
    if (active && active.canvas === canvas && !active.destroyed) { active.update(config); return active; }
    if (active) active.destroy();
    active = new DriveInFrontViewer(canvas, config);
    return active;
  },
  update(config = {}) { active?.update?.(config); },
  destroy() { active?.destroy?.(); active = null; },
};
window.dispatchEvent(new Event("rafex-drive-in-viewer-ready"));

