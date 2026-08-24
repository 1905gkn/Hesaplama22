import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const ASSET_VERSION = "drive-in-front-v1";
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
let sharedModelsPromise = null;

function materialFor(name, source) {
  const upper = String(name || "").toLocaleUpperCase("tr-TR");
  const material = source?.clone?.() || new THREE.MeshStandardMaterial();
  if (upper.includes("PALET")) {
    material.color?.setHex?.(0xc7924a);
    material.metalness = 0.02;
    material.roughness = 0.9;
  } else if (upper.includes("RAY")) {
    material.color?.setHex?.(0xe5bd00);
    material.metalness = 0.42;
    material.roughness = 0.48;
  } else {
    material.color?.setHex?.(0xaeb8bd);
    material.metalness = 0.55;
    material.roughness = 0.4;
  }
  return material;
}

function prepareClone(source) {
  const clone = source.clone(true);
  clone.traverse((part) => {
    if (!part.isMesh) return;
    const materials = Array.isArray(part.material) ? part.material : [part.material];
    const changed = materials.map((material) => materialFor(part.name || source.name, material));
    part.material = Array.isArray(part.material) ? changed : changed[0];
    part.castShadow = true;
    part.receiveShadow = true;
  });
  return clone;
}

function fitClone(source, target, center = true) {
  const clone = prepareClone(source);
  clone.updateMatrixWorld(true);
  let bounds = new THREE.Box3().setFromObject(clone);
  const size = bounds.getSize(new THREE.Vector3());
  const sx = target.x / Math.max(1, size.x);
  const sy = target.y / Math.max(1, size.y);
  const sz = target.z / Math.max(1, size.z);
  clone.scale.multiply(new THREE.Vector3(sx, sy, sz));
  clone.updateMatrixWorld(true);
  bounds = new THREE.Box3().setFromObject(clone);
  const c = bounds.getCenter(new THREE.Vector3());
  if (center) clone.position.sub(c);
  return clone;
}

function firstMesh(root, includes) {
  let match = null;
  root.traverse((object) => {
    if (match || !object.isMesh) return;
    const name = String(object.name || "").toLocaleUpperCase("tr-TR");
    if (!includes || includes.some((token) => name.includes(token))) match = object;
  });
  return match || root;
}

class DriveInFrontViewer {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.config = this.normalize(config);
    this.destroyed = false;
    this.models = null;
    this.root = new THREE.Group();

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.scene.add(this.root);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x596066, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 3.4);
    key.position.set(-4500, 7000, 9000);
    key.castShadow = true;
    this.scene.add(key);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 100000);
    this.camera.up.set(0, 0, 1);

    this.resizeObserver = new ResizeObserver(() => this.render());
    this.resizeObserver.observe(canvas.parentElement || canvas);
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

  emit(name, detail = {}) {
    this.canvas.dispatchEvent(new CustomEvent(name, { detail }));
  }

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
          loader.loadAsync(source("drive-in-montaj")),
          loader.loadAsync(source("drive-in-ray")),
        ]).finally(() => draco.dispose());
      }
      const [ayak, montaj, ray] = await sharedModelsPromise;
      if (this.destroyed) return;
      this.models = {
        ayak: ayak.scene.clone(true),
        montaj: montaj.scene.clone(true),
        ray: ray.scene.clone(true),
      };
      this.rebuild();
      this.emit("drive-in-ready", { sources: ["DRIVE IN AYAK TOP", "DRIVE IN RAF MONTAJ", "DRIVE IN RAY BÜKÜMLÜ"] });
    } catch (error) {
      sharedModelsPromise = null;
      console.error("Drive In GLB yükleme hatası", error);
      this.emit("drive-in-error", { message: error?.message || "Drive In GLB yüklenemedi" });
    }
  }

  update(next = {}) {
    this.config = this.normalize({ ...this.config, ...next });
    if (this.models) this.rebuild();
  }

  addBox(size, position, color, metalness = 0.4, roughness = 0.5) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      new THREE.MeshStandardMaterial({ color, metalness, roughness }),
    );
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.root.add(mesh);
    return mesh;
  }

  rebuild() {
    while (this.root.children.length) this.root.remove(this.root.children[0]);
    const c = this.config;
    const uprightWidth = 100;
    const sideGap = 120;
    const bayClear = Math.max(950, c.palletWidth + 150);
    const bayPitch = bayClear + uprightWidth;
    const rackWidth = c.bays * bayPitch + uprightWidth;
    const rackHeight = c.firstLevelHeight + Math.max(0, c.levels - 1) * c.levelSpacing + c.palletHeight * 0.55;
    const depth = Math.max(900, c.palletDepth);

    // Ana dikmeler ön görünüşte gerçek Drive-In ayak geometrisini taşıyan iskelet olarak çizilir.
    for (let i = 0; i <= c.bays; i += 1) {
      const x = i * bayPitch;
      this.addBox(new THREE.Vector3(uprightWidth, 110, rackHeight), new THREE.Vector3(x, 0, rackHeight / 2), 0xaeb8bd, 0.62, 0.38);
      const ayakPart = fitClone(firstMesh(this.models.ayak, ["HRTD", "DİAGONEL", "DIAGONEL"]), new THREE.Vector3(150, 150, 170));
      ayakPart.position.set(x, -10, Math.max(90, rackHeight - 120));
      this.root.add(ayakPart);
    }

    const palletSource = firstMesh(this.models.montaj, ["PALET"]);
    const braceSource = firstMesh(this.models.montaj, ["ARA BAG", "ARA BAĞ"]);
    const raySource = firstMesh(this.models.ray, ["RAY"]);

    for (let level = 0; level < c.levels; level += 1) {
      const supportZ = c.firstLevelHeight + level * c.levelSpacing;
      for (let bay = 0; bay < c.bays; bay += 1) {
        const left = bay * bayPitch + uprightWidth;
        const centerX = left + bayClear / 2;

        // Raylar derinliğine uzar; önden bakışta kullanıcı tarafından verilen bükümlü ray kesiti görünür.
        const leftRay = fitClone(raySource, new THREE.Vector3(145, depth, 165));
        leftRay.position.set(left + 85, 0, supportZ);
        this.root.add(leftRay);
        const rightRay = fitClone(raySource, new THREE.Vector3(145, depth, 165));
        rightRay.position.set(left + bayClear - 85, 0, supportZ);
        this.root.add(rightRay);

        const pallet = fitClone(palletSource, new THREE.Vector3(Math.min(c.palletWidth, bayClear - 180), Math.min(c.palletDepth, depth - 80), c.palletHeight));
        pallet.position.set(centerX, 0, supportZ + c.palletHeight / 2 + 90);
        this.root.add(pallet);
      }

      const tie = fitClone(braceSource, new THREE.Vector3(90, depth, 150));
      tie.position.set(rackWidth - uprightWidth / 2, 0, supportZ + 75);
      this.root.add(tie);
    }

    this.addBox(new THREE.Vector3(rackWidth + 300, 18, 18), new THREE.Vector3(rackWidth / 2, 0, 0), 0x25313a, 0.1, 0.8);
    this.fitCamera();
    this.render();
  }

  fitCamera() {
    const bounds = new THREE.Box3().setFromObject(this.root);
    if (bounds.isEmpty()) return;
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const rect = this.canvas.getBoundingClientRect();
    const aspect = Math.max(0.3, (rect.width || 1) / Math.max(1, rect.height || 1));
    const pad = 1.16;
    let halfW = size.x * pad / 2;
    let halfH = size.z * pad / 2;
    if (halfW / halfH < aspect) halfW = halfH * aspect;
    else halfH = halfW / aspect;
    this.camera.left = -halfW;
    this.camera.right = halfW;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.near = 1;
    this.camera.far = Math.max(100000, size.y * 10 + 10000);
    this.camera.position.set(center.x, center.y + Math.max(10000, size.y * 3), center.z);
    this.camera.lookAt(center.x, center.y, center.z);
    this.camera.updateProjectionMatrix();
  }

  render() {
    if (this.destroyed) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    this.renderer.setSize(width, height, false);
    this.fitCamera();
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.resizeObserver?.disconnect?.();
    const geometries = new Set(), materials = new Set(), textures = new Set();
    const collect = (material) => {
      if (!material || materials.has(material)) return;
      materials.add(material);
      Object.values(material).forEach((value) => { if (value?.isTexture) textures.add(value); });
    };
    this.scene?.traverse?.((object) => {
      if (object.geometry?.dispose) geometries.add(object.geometry);
      if (Array.isArray(object.material)) object.material.forEach(collect); else collect(object.material);
    });
    textures.forEach((texture) => { try { texture.dispose(); } catch {} });
    materials.forEach((material) => { try { material.dispose(); } catch {} });
    geometries.forEach((geometry) => { try { geometry.dispose(); } catch {} });
    this.renderer?.renderLists?.dispose?.();
    this.renderer?.dispose?.();
  }
}

let active = null;
window.RafexDriveInViewer = {
  mount(canvas, config = {}) {
    if (active) active.destroy();
    active = new DriveInFrontViewer(canvas, config);
    return active;
  },
  update(config = {}) { active?.update?.(config); },
  destroy() { active?.destroy?.(); active = null; },
};
window.dispatchEvent(new Event("rafex-drive-in-viewer-ready"));
