import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const PARTS = { upright: "/mr-ayak-top.glb", traverse: "/mr-zs-travers.glb", tray: "/mr-tava.glb" };
const FINISHES = {
  ral5010: { color: 0x004f7c, metalness: 0.42, roughness: 0.32 },
  pgv: { color: 0xb7bec1, metalness: 0.82, roughness: 0.28 },
  ral1007: { color: 0xe5a100, metalness: 0.34, roughness: 0.3 },
  ral2004: { color: 0xe25303, metalness: 0.34, roughness: 0.3 },
};
const cache = new Map();

function loadPart(key) {
  if (cache.has(key)) return cache.get(key);
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath("/draco/");
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);
  const task = loader.loadAsync(`${PARTS[key]}?v=mr-assembly-2`).finally(() => draco.dispose());
  cache.set(key, task);
  return task;
}

function finishMaterials(object) {
  object.traverse((part) => {
    if (!part.isMesh) return;
    part.castShadow = true;
    part.receiveShadow = true;
    if (part.material) part.material = Array.isArray(part.material)
      ? part.material.map((material) => material.clone())
      : part.material.clone();
  });
  return object;
}

function applyFinish(object, finishKey) {
  const finish = FINISHES[finishKey];
  if (!finish) return;
  object.traverse((part) => {
    if (!part.isMesh || !part.material) return;
    const materials = Array.isArray(part.material) ? part.material : [part.material];
    materials.forEach((material) => {
      if (material.color) material.color.setHex(finish.color);
      if ("metalness" in material) material.metalness = finish.metalness;
      if ("roughness" in material) material.roughness = finish.roughness;
      material.needsUpdate = true;
    });
  });
}

function normalizedPart(scene, kind) {
  const wrapper = new THREE.Group();
  const object = finishMaterials(scene.clone(true));
  const basis = kind === "upright"
    ? new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, -1, 0))
    : new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -1, 0));
  object.applyMatrix4(basis);
  wrapper.add(object);
  wrapper.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(wrapper);
  object.position.sub(box.min);
  wrapper.updateMatrixWorld(true);
  const size = new THREE.Vector3();
  new THREE.Box3().setFromObject(wrapper).getSize(size);
  return { object: wrapper, size };
}

function bounded(value, fallback, min, max) { return Math.min(max, Math.max(min, Number(value) || fallback)); }

class MRViewer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.view = "perspective";
    this.destroyed = false;
    this.loadToken = 0;
    this.config = this.cleanConfig(options.config);
    this.bounds = new THREE.Box3();
    this.size = new THREE.Vector3(2400, 3300, 800);
    this.center = new THREE.Vector3(1200, 1650, 400);
    this.onResize = this.onResize.bind(this);
    this.animate = this.animate.bind(this);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf4f6f3);
    this.camera = new THREE.PerspectiveCamera(32, 1, 1, 200000);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 50;
    this.controls.maxDistance = 100000;
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x526258, 2.5));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(7000, 11000, 9000);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff2df, 1.1);
    fill.position.set(-7000, 3500, 4000);
    this.scene.add(fill);
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.grid = new THREE.GridHelper(12000, 48, 0xcbd5cf, 0xe3e9e5);
    this.grid.material.opacity = 0.52;
    this.grid.material.transparent = true;
    this.scene.add(this.grid);
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(canvas);
    this.onResize();
    this.build(this.config);
    this.animate();
  }

  cleanConfig(config = {}) {
    const levels = Math.round(bounded(config.levels, 4, 1, 15));
    return {
      modules: Math.round(bounded(config.modules, 1, 1, 50)), levels,
      width: bounded(config.width, 2400, 300, 6000),
      depth: bounded(config.depth, 800, 300, 2500),
      height: bounded(config.height, Math.max(1200, levels * 800 + 100), 600, 12000),
      uprightFinish: ["ral5010", "pgv"].includes(config.uprightFinish) ? config.uprightFinish : "ral5010",
      traverseFinish: ["ral1007", "ral2004"].includes(config.traverseFinish) ? config.traverseFinish : "ral1007",
    };
  }

  async build(config = {}) {
    this.config = this.cleanConfig(config);
    const token = ++this.loadToken;
    this.canvas.dispatchEvent(new CustomEvent("mr-viewer-loading", { detail: { label: "MR rafı" } }));
    try {
      const [uprightGLB, traverseGLB, trayGLB] = await Promise.all([loadPart("upright"), loadPart("traverse"), loadPart("tray")]);
      if (this.destroyed || token !== this.loadToken) return;
      const upright = normalizedPart(uprightGLB.scene, "upright");
      const traverse = normalizedPart(traverseGLB.scene, "traverse");
      const tray = normalizedPart(trayGLB.scene, "tray");
      applyFinish(upright.object, this.config.uprightFinish);
      applyFinish(traverse.object, this.config.traverseFinish);
      this.root.clear();
      const { modules, levels, width, depth, height } = this.config;
      const levelGap = height / levels;
      const uprightHeight = height + levelGap / 2;
      const uprightScale = new THREE.Vector3(1, uprightHeight / upright.size.y, depth / upright.size.z);
      for (let frame = 0; frame <= modules; frame += 1) {
        const instance = upright.object.clone(true);
        instance.scale.copy(uprightScale);
        instance.position.x = frame * width - upright.size.x / 2;
        this.root.add(instance);
      }
      const beamDepth = Math.max(1, traverse.size.z);
      const trayColumns = Math.max(1, Math.round(width / 300));
      const trayWidth = width / trayColumns;
      for (let module = 0; module < modules; module += 1) {
        const moduleX = module * width;
        for (let level = 1; level <= levels; level += 1) {
          const levelY = level * levelGap;
          for (const z of [0, Math.max(0, depth - beamDepth)]) {
            const beam = traverse.object.clone(true);
            beam.scale.set(width / traverse.size.x, 1, 1);
            beam.position.set(moduleX, levelY - traverse.size.y, z);
            this.root.add(beam);
          }
          for (let column = 0; column < trayColumns; column += 1) {
            const shelf = tray.object.clone(true);
            shelf.scale.set(trayWidth / tray.size.x, 1, depth / tray.size.z);
            shelf.position.set(moduleX + column * trayWidth, levelY, 0);
            this.root.add(shelf);
          }
        }
      }
      this.root.updateMatrixWorld(true);
      this.bounds.setFromObject(this.root);
      this.bounds.getCenter(this.center);
      this.root.position.x -= this.center.x;
      this.root.position.z -= this.center.z;
      this.root.position.y -= this.bounds.min.y;
      this.root.updateMatrixWorld(true);
      this.bounds.setFromObject(this.root);
      this.bounds.getCenter(this.center);
      this.bounds.getSize(this.size);
      const gridSize = Math.max(1800, this.size.x, this.size.z) * 2.2;
      this.grid.scale.setScalar(gridSize / 12000);
      this.setView(this.view);
      const detail = { label: `${modules} modül · ${levels} kat`, config: this.config };
      this.canvas.dispatchEvent(new CustomEvent("mr-viewer-model", { detail }));
      this.canvas.dispatchEvent(new CustomEvent("mr-viewer-ready", { detail }));
    } catch (error) {
      if (token !== this.loadToken) return;
      this.canvas.dispatchEvent(new CustomEvent("mr-viewer-error", { detail: { message: error?.message || "MR rafı oluşturulamadı." } }));
    }
  }

  setConfiguration(config) { return this.build({ ...this.config, ...config }); }
  setView(view = "perspective") {
    this.view = ["front", "side", "top", "perspective"].includes(view) ? view : "perspective";
    const target = this.center.clone();
    target.y = Math.max(this.size.y * 0.45, target.y);
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const displayHeight = this.view === "top" ? this.size.z : this.size.y;
    const fitHeight = Math.max(50, displayHeight) / (2 * Math.tan(vFov / 2));
    const horizontal = this.view === "side" ? this.size.z : this.size.x;
    const fitWidth = Math.max(50, horizontal) / (2 * Math.tan(vFov / 2) * Math.max(this.camera.aspect, 0.25));
    const distance = Math.max(fitHeight, fitWidth, 200) * 1.3;
    const direction = this.view === "front" ? new THREE.Vector3(0, 0, 1)
      : this.view === "side" ? new THREE.Vector3(1, 0, 0)
      : this.view === "top" ? new THREE.Vector3(0, 1, 0.001)
      : new THREE.Vector3(1.15, 0.72, 1.15).normalize();
    this.controls.target.copy(target);
    this.camera.position.copy(target).add(direction.multiplyScalar(distance));
    this.camera.near = Math.max(1, distance / 1000);
    this.camera.far = Math.max(100000, distance * 25);
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }
  setAutoRotate(enabled) { this.controls.autoRotate = Boolean(enabled); this.controls.autoRotateSpeed = 0.75; }
  onResize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
  animate() { if (!this.destroyed) { this.controls.update(); this.renderer.render(this.scene, this.camera); requestAnimationFrame(this.animate); } }
  destroy() { this.destroyed = true; this.loadToken += 1; this.resizeObserver.disconnect(); this.controls.dispose(); this.renderer.dispose(); }
}

let active = null;
window.RafexMRViewer = {
  mount(canvas, options) { if (!(canvas instanceof HTMLCanvasElement)) throw new Error("MR 3D alanı bulunamadı."); active?.destroy(); active = new MRViewer(canvas, options); return active; },
  setConfiguration(config) { return active?.setConfiguration(config); },
  setView(view) { active?.setView(view); },
  setAutoRotate(enabled) { active?.setAutoRotate(enabled); },
  destroy() { active?.destroy(); active = null; },
};
window.dispatchEvent(new CustomEvent("rafex-mr-viewer-ready"));
