import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ASSET_VERSION = "drive-in-front-v3";
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
let sharedModelsPromise = null;

function cloneAndFit(source, target) {
  const clone = source.clone(true);
  clone.traverse((part) => {
    if (!part.isMesh) return;
    part.castShadow = false;
    part.receiveShadow = false;
  });
  clone.updateMatrixWorld(true);
  let bounds = new THREE.Box3().setFromObject(clone);
  const size = bounds.getSize(new THREE.Vector3());
  clone.scale.multiply(new THREE.Vector3(
    target.x / Math.max(1, size.x),
    target.y / Math.max(1, size.y),
    target.z / Math.max(1, size.z),
  ));
  clone.updateMatrixWorld(true);
  bounds = new THREE.Box3().setFromObject(clone);
  clone.position.sub(bounds.getCenter(new THREE.Vector3()));
  return clone;
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
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.screenSpacePanning = true;
    this.controls.zoomSpeed = 0.75;
    this.controls.panSpeed = 0.7;
    this.controls.minZoom = 0.55;
    this.controls.maxZoom = 6;
    this.controls.addEventListener("change", () => this.renderScene());

    this.resizeObserver = new ResizeObserver(() => this.scheduleResize());
    this.resizeObserver.observe(canvas.parentElement || canvas);
    this.scheduleResize(true);
    this.load();
  }

  normalize(next = {}) {
    const palletHeight = clamp(Number(next.palletHeight) || 1200, 300, 3000);
    const firstLevelHeight = clamp(Number(next.firstLevelHeight) || 430, 0, 5000);
    return {
      bays: clamp(Math.round(Number(next.bays) || 1), 1, 50),
      levels: clamp(Math.round(Number(next.levels) || 4), 1, 15),
      palletWidth: clamp(Number(next.palletWidth) || 800, 300, 3000),
      palletDepth: clamp(Number(next.palletDepth) || 1200, 300, 3000),
      palletHeight,
      firstLevelHeight,
      levelSpacing: clamp(Number(next.levelSpacing) || Math.max(1580, palletHeight + 380), palletHeight + 80, 5000),
    };
  }

  configKey(value = this.config) {
    return [value.bays, value.levels, value.palletWidth, value.palletDepth, value.palletHeight, value.firstLevelHeight, value.levelSpacing].join("|");
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

  addPart(source, target, position) {
    const part = cloneAndFit(source, target);
    part.position.copy(position);
    this.root.add(part);
    return part;
  }

  rebuild() {
    this.root.clear();
    const c = this.config;
    const uprightWidth = 100;
    const bayClear = Math.max(950, c.palletWidth + 150);
    const bayPitch = bayClear + uprightWidth;
    const rackWidth = c.bays * bayPitch + uprightWidth;
    const rackHeight = c.firstLevelHeight + Math.max(0, c.levels - 1) * c.levelSpacing + c.palletHeight + 220;
    const depth = Math.max(900, c.palletDepth);

    for (let i = 0; i <= c.bays; i += 1) {
      this.addPart(this.models.ayak, new THREE.Vector3(uprightWidth, depth, rackHeight), new THREE.Vector3(i * bayPitch, 0, rackHeight / 2));
    }

    for (let level = 0; level < c.levels; level += 1) {
      const supportZ = c.firstLevelHeight + level * c.levelSpacing;
      for (let bay = 0; bay < c.bays; bay += 1) {
        const left = bay * bayPitch + uprightWidth;
        const right = left + bayClear;
        const centerX = (left + right) / 2;
        this.addPart(this.models.ray, new THREE.Vector3(135, depth, 145), new THREE.Vector3(left + 75, 0, supportZ));
        this.addPart(this.models.ray, new THREE.Vector3(135, depth, 145), new THREE.Vector3(right - 75, 0, supportZ));
        this.addPart(this.models.konsol, new THREE.Vector3(150, 220, 170), new THREE.Vector3(left + 75, -depth / 2 + 120, supportZ));
        this.addPart(this.models.konsol, new THREE.Vector3(150, 220, 170), new THREE.Vector3(right - 75, -depth / 2 + 120, supportZ));
        this.addPart(this.models.palet, new THREE.Vector3(Math.min(c.palletWidth, bayClear - 180), Math.min(c.palletDepth, depth - 80), c.palletHeight), new THREE.Vector3(centerX, 0, supportZ + c.palletHeight / 2 + 90));
      }
      this.addPart(this.models.arabag, new THREE.Vector3(rackWidth - uprightWidth, depth, 110), new THREE.Vector3(rackWidth / 2, 0, supportZ + 80));
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
