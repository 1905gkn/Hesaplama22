import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const MODELS = {
  module: { url: "/mr-modul.glb", label: "MR Modül" },
  upright: { url: "/mr-ayak-top.glb", label: "MR Ayak Toplama" },
  traverse: { url: "/mr-zs-travers.glb", label: "ZS Travers" },
  tray: { url: "/mr-tava.glb", label: "Tava" },
};
const cache = new Map();

function loadModel(key) {
  if (!MODELS[key]) return Promise.reject(new Error("MR modeli bulunamadı."));
  if (cache.has(key)) return cache.get(key);
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath("/draco/");
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);
  const task = loader.loadAsync(`${MODELS[key].url}?v=mr-1`).finally(() => draco.dispose());
  cache.set(key, task);
  return task;
}

class MRViewer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.modelKey = options.model || "module";
    this.view = "perspective";
    this.destroyed = false;
    this.loadToken = 0;
    this.bounds = new THREE.Box3();
    this.size = new THREE.Vector3();
    this.center = new THREE.Vector3();
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
    this.setModel(this.modelKey);
    this.animate();
  }

  async setModel(key) {
    if (!MODELS[key]) return;
    this.modelKey = key;
    const token = ++this.loadToken;
    this.canvas.dispatchEvent(new CustomEvent("mr-viewer-loading", { detail: { key, label: MODELS[key].label } }));
    try {
      const gltf = await loadModel(key);
      if (this.destroyed || token !== this.loadToken) return;
      this.root.clear();
      const object = gltf.scene.clone(true);
      object.traverse((part) => {
        if (!part.isMesh) return;
        part.castShadow = true;
        part.receiveShadow = true;
        if (part.material) part.material = Array.isArray(part.material) ? part.material.map((item) => item.clone()) : part.material.clone();
      });
      this.root.add(object);
      this.root.updateMatrixWorld(true);
      this.bounds.setFromObject(this.root);
      this.bounds.getCenter(this.center);
      this.bounds.getSize(this.size);
      this.root.position.x -= this.center.x;
      this.root.position.y -= this.bounds.min.y;
      this.root.position.z -= this.center.z;
      this.root.updateMatrixWorld(true);
      this.bounds.setFromObject(this.root);
      this.bounds.getCenter(this.center);
      this.bounds.getSize(this.size);
      const gridSize = Math.max(1800, this.size.x, this.size.z) * 2.2;
      this.grid.scale.setScalar(gridSize / 12000);
      this.setView(this.view);
      this.canvas.dispatchEvent(new CustomEvent("mr-viewer-model", { detail: { key, label: MODELS[key].label } }));
      this.canvas.dispatchEvent(new CustomEvent("mr-viewer-ready", { detail: { key, label: MODELS[key].label } }));
    } catch (error) {
      if (token !== this.loadToken) return;
      this.canvas.dispatchEvent(new CustomEvent("mr-viewer-error", { detail: { message: error?.message || "MR modeli yüklenemedi." } }));
    }
  }

  setView(view = "perspective") {
    this.view = ["front", "side", "top", "perspective"].includes(view) ? view : "perspective";
    const target = this.center.clone();
    target.y = Math.max(this.size.y * 0.45, target.y);
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const fitHeight = Math.max(50, this.size.y) / (2 * Math.tan(vFov / 2));
    const horizontal = this.view === "side" ? this.size.z : this.size.x;
    const fitWidth = Math.max(50, horizontal) / (2 * Math.tan(vFov / 2) * Math.max(this.camera.aspect, 0.25));
    const distance = Math.max(fitHeight, fitWidth, 200) * 1.28;
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

  setAutoRotate(enabled) {
    this.controls.autoRotate = Boolean(enabled);
    this.controls.autoRotateSpeed = 0.75;
  }

  onResize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    if (this.destroyed) return;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  destroy() {
    this.destroyed = true;
    this.loadToken += 1;
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
  }
}

let active = null;
window.RafexMRViewer = {
  mount(canvas, options) {
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error("MR 3D alanı bulunamadı.");
    active?.destroy();
    active = new MRViewer(canvas, options);
    return active;
  },
  setModel(key) { return active?.setModel(key); },
  setView(view) { active?.setView(view); },
  setAutoRotate(enabled) { active?.setAutoRotate(enabled); },
  destroy() { active?.destroy(); active = null; },
};
window.dispatchEvent(new CustomEvent("rafex-mr-viewer-ready"));
