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
const normalizedCache = new Map();
const finishedCache = new Map();

function loadPart(key) {
  if (cache.has(key)) return cache.get(key);
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath("/draco/");
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);
  const task = loader.loadAsync(`${PARTS[key]}?v=mr-assembly-3`).finally(() => draco.dispose());
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

function loadNormalizedPart(kind) {
  if (normalizedCache.has(kind)) return normalizedCache.get(kind);
  const task = loadPart(kind).then((gltf) => normalizedPart(gltf.scene, kind));
  normalizedCache.set(kind, task);
  return task;
}

async function loadFinishedPart(kind, finishKey = "default") {
  const key = `${kind}:${finishKey}`;
  if (finishedCache.has(key)) return finishedCache.get(key);
  const task = loadNormalizedPart(kind).then((template) => {
    const object = finishMaterials(template.object.clone(true));
    if (finishKey !== "default") applyFinish(object, finishKey);
    return { object, size: template.size.clone() };
  });
  finishedCache.set(key, task);
  return task;
}

function bounded(value, fallback, min, max) { return Math.min(max, Math.max(min, Number(value) || fallback)); }

class MRViewer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.view = "perspective";
    this.destroyed = false;
    this.loadToken = 0;
    this.dimensionLabels = [];
    this.dimensionLayer = null;
    this.configSignature = "";
    this.config = this.cleanConfig(options.config);
    this.bounds = new THREE.Box3();
    this.size = new THREE.Vector3(2400, 3300, 800);
    this.center = new THREE.Vector3(1200, 1650, 400);
    this.onResize = this.onResize.bind(this);
    this.animate = this.animate.bind(this);
    this.onCanvasClick = this.onCanvasClick.bind(this);
    this.onCanvasPointerMove = this.onCanvasPointerMove.bind(this);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
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
    key.shadow.mapSize.set(1024, 1024);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff2df, 1.1);
    fill.position.set(-7000, 3500, 4000);
    this.scene.add(fill);
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0 })
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = -3;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
    this.grid = new THREE.GridHelper(12000, 48, 0xaab2b7, 0xdfe5e8);
    this.grid.material.opacity = 0.5;
    this.grid.material.transparent = true;
    this.grid.position.y = 1;
    this.scene.add(this.grid);
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.canvas.addEventListener("click", this.onCanvasClick);
    this.canvas.addEventListener("pointermove", this.onCanvasPointerMove);
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(canvas);
    this.onResize();
    this.build(this.config);
    this.animate();
  }

  cleanConfig(config = {}) {
    const levels = Math.round(bounded(config.levels, 4, 1, 15));
    const firstTraverse = bounded(config.firstTraverse, 200, 0, 5000);
    const levelGap = bounded(config.levelGap, 1000, 100, 5000);
    const topTraverse = firstTraverse + Math.max(0, levels - 1) * levelGap;
    const uprightType = config.uprightType === "MR60" ? "MR60" : "MR60";
    const uprightThickness = [1.5, 2].includes(Number(config.uprightThickness)) ? Number(config.uprightThickness) : 1.5;
    const traverseType = ["ZS35", "ZS55", "ZS65"].includes(config.traverseType) ? config.traverseType : "ZS65";
    const traverseThickness = [1.5, 2].includes(Number(config.traverseThickness)) ? Number(config.traverseThickness) : 1.5;
    const traverseHeight = { ZS35: 55, ZS55: 75, ZS65: 85 }[traverseType];
    return {
      modules: Math.round(bounded(config.modules, 1, 1, 50)), levels,
      width: bounded(config.width, 2400, 300, 6000),
      depth: bounded(config.depth, 800, 300, 2500),
      uprightType, uprightThickness, uprightWidth: 60,
      traverseType, traverseThickness, traverseHeight,
      firstTraverse, levelGap, height: topTraverse,
      uprightHeight: topTraverse + levelGap / 2,
      uprightFinish: ["ral5010", "pgv"].includes(config.uprightFinish) ? config.uprightFinish : "ral5010",
      traverseFinish: ["ral1007", "ral2004"].includes(config.traverseFinish) ? config.traverseFinish : "ral1007",
      accessories: Array.isArray(config.accessories) ? config.accessories.filter((item) => item?.type === "tray").map((item) => ({
        type: "tray",
        width: [200, 250, 300].includes(Number(item.width)) ? Number(item.width) : 300,
        levels: [...new Set((item.levels || []).map(Number).filter((level) => level >= 1 && level <= levels))],
      })) : [],
      dimensions: {
        levels: config.dimensions?.levels !== false,
        markers: config.dimensions?.markers !== false,
        width: config.dimensions?.width !== false,
        depth: config.dimensions?.depth !== false,
      },
      dimensionScale: bounded(config.dimensionScale, 1, .7, 1.5),
    };
  }

  trayPiecePlan(clearWidth, requestedWidth) {
    const width = Math.max(0, Math.round(Number(clearWidth) || 0));
    const trayWidth = [200, 250, 300].includes(Number(requestedWidth)) ? Number(requestedWidth) : 300;
    const full = Math.floor(width / trayWidth), remainder = width - full * trayWidth;
    return [...Array(full).fill(trayWidth), ...(remainder >= 50 ? [remainder] : [])];
  }

  async build(config = {}) {
    this.config = this.cleanConfig(config);
    const signature = JSON.stringify(this.config);
    if (signature === this.configSignature && this.root.children.length) return;
    const token = ++this.loadToken;
    this.canvas.dispatchEvent(new CustomEvent("mr-viewer-loading", { detail: { label: "MR rafı" } }));
    try {
      const [upright, traverse, tray] = await Promise.all([
        loadFinishedPart("upright", this.config.uprightFinish),
        loadFinishedPart("traverse", this.config.traverseFinish),
        loadFinishedPart("tray"),
      ]);
      if (this.destroyed || token !== this.loadToken) return;
      this.disposeDimensions();
      this.root.clear();
      const { modules, levels, width, depth, firstTraverse, levelGap, uprightHeight, uprightWidth, traverseHeight } = this.config;
      const levelYs = Array.from({ length: levels }, (_, index) => firstTraverse + index * levelGap);
      const framePitch = width + uprightWidth;
      const totalWidth = modules * width + (modules + 1) * uprightWidth;
      const uprightScale = new THREE.Vector3(uprightWidth / upright.size.x, uprightHeight / upright.size.y, depth / upright.size.z);
      for (let frame = 0; frame <= modules; frame += 1) {
        const instance = upright.object.clone(true);
        instance.scale.copy(uprightScale);
        instance.position.x = frame * framePitch;
        this.root.add(instance);
      }
      const beamDepth = Math.max(1, traverse.size.z);
      const trayAccessories = this.config.accessories.filter((item) => item.type === "tray");
      for (let module = 0; module < modules; module += 1) {
        const moduleX = module * framePitch + uprightWidth;
        for (let level = 1; level <= levels; level += 1) {
          const levelY = levelYs[level - 1];
          for (const side of ["front", "back"]) {
            const beam = traverse.object.clone(true);
            beam.scale.set(width / traverse.size.x, traverseHeight / traverse.size.y, 1);
            if (side === "front") {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width, levelY, beamDepth);
            } else {
              beam.position.set(moduleX, levelY, Math.max(0, depth - beamDepth));
            }
            this.root.add(beam);
          }
          trayAccessories.filter((item) => item.levels.includes(level)).forEach((accessory) => {
            let cursor = 0;
            this.trayPiecePlan(width, accessory.width).forEach((pieceWidth) => {
              const shelf = tray.object.clone(true);
              shelf.scale.set(pieceWidth / tray.size.x, 1, depth / tray.size.z);
              shelf.rotation.x = Math.PI;
              shelf.position.set(moduleX + cursor, levelY + traverseHeight + tray.size.y - 50, depth);
              this.root.add(shelf);
              cursor += pieceWidth;
            });
          });
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
      this.addDimensions(levelYs, totalWidth, depth, uprightHeight);
      const gridSize = Math.max(1800, this.size.x, this.size.z) * 2.2;
      this.grid.scale.setScalar(gridSize / 12000);
      this.ground.scale.set(gridSize, gridSize, 1);
      this.setView(this.view);
      this.configSignature = signature;
      const detail = { label: `${modules} modül · ${levels} kat`, config: this.config };
      this.canvas.dispatchEvent(new CustomEvent("mr-viewer-model", { detail }));
      this.canvas.dispatchEvent(new CustomEvent("mr-viewer-ready", { detail }));
    } catch (error) {
      if (token !== this.loadToken) return;
      this.canvas.dispatchEvent(new CustomEvent("mr-viewer-error", { detail: { message: error?.message || "MR rafı oluşturulamadı." } }));
    }
  }

  dimensionValue(value) { return `${Math.round(value).toLocaleString("tr-TR")} mm`; }
  dimensionMaterial() { return new THREE.LineBasicMaterial({ color:0x0b5477, depthTest:false, transparent:true, opacity:.95 }); }
  addDimensionLine(layer, points) {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), this.dimensionMaterial());
    line.renderOrder = 100; layer.add(line);
  }
  addDimensionPoint(layer, position) {
    const marker = new THREE.Mesh(new THREE.SphereGeometry(18, 10, 8), new THREE.MeshBasicMaterial({ color:0x0b5477, depthTest:false }));
    marker.position.copy(position); marker.renderOrder = 102; layer.add(marker);
  }
  addDimensionLabel(layer, x, y, z, text, width = 760, editKey = "") {
    const canvas = document.createElement("canvas"), scale = 3, labelHeight = 112;
    canvas.width = width * scale; canvas.height = labelHeight * scale;
    const context = canvas.getContext("2d"); context.scale(scale, scale); context.font = "900 48px Arial";
    context.fillStyle = "rgba(5,40,72,.96)"; context.beginPath(); context.roundRect(0, 0, width, labelHeight, 16); context.fill();
    context.strokeStyle = "#3e8fb2"; context.lineWidth = 4; context.stroke(); context.fillStyle = "#fff"; context.textAlign = "center"; context.textBaseline = "middle"; context.fillText(text, width / 2, labelHeight / 2, width - 30);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:texture, depthTest:false, transparent:true }));
    const factor = this.config.dimensionScale; sprite.position.set(x, y, z); sprite.scale.set(width * factor, labelHeight * factor, 1); sprite.renderOrder = 101; sprite.userData.mrEditKey = editKey; this.dimensionLabels.push(sprite); layer.add(sprite);
  }
  addVerticalDimension(layer, x, z, from, to, label, witnessX = 0, editKey = "") {
    const bottom = new THREE.Vector3(x, from, z), top = new THREE.Vector3(x, to, z), arrow = 55;
    this.addDimensionLine(layer, [bottom, top]); this.addDimensionLine(layer, [bottom, new THREE.Vector3(witnessX, from, z)]); this.addDimensionLine(layer, [top, new THREE.Vector3(witnessX, to, z)]);
    this.addDimensionLine(layer, [new THREE.Vector3(x-arrow, from+arrow, z), bottom, new THREE.Vector3(x+arrow, from+arrow, z)]); this.addDimensionLine(layer, [new THREE.Vector3(x-arrow, to-arrow, z), top, new THREE.Vector3(x+arrow, to-arrow, z)]);
    this.addDimensionPoint(layer, bottom); this.addDimensionPoint(layer, top); this.addDimensionLabel(layer, x-420, (from+to)/2, z, label, 700, editKey);
  }
  addDimensions(levelYs, totalWidth, depth, uprightHeight) {
    this.dimensionLabels = [];
    const layer = new THREE.Group(); layer.name = "MR 3D Ölçüler"; const z = depth + 180, x = -Math.max(260, totalWidth * .06);
    this.dimensionLayer = layer;
    if (this.config.dimensions.levels) levelYs.forEach((height, index) => {
      const from = index === 0 ? 0 : levelYs[index - 1], label = index === 0 ? `ZEMİN → K1 · ${this.dimensionValue(height)}` : `K${index} → K${index+1} · ${this.dimensionValue(height-from)}`;
      this.addVerticalDimension(layer, x, z, from, height, label, 0, index === 0 ? "firstTraverse" : "levelGap");
    });
    if (this.config.dimensions.markers) {
      const topTraverse = levelYs.at(-1) || 0; this.addVerticalDimension(layer, totalWidth+280, z, topTraverse, uprightHeight, `SON KAT ÜSTÜ · ${this.dimensionValue(uprightHeight-topTraverse)}`, totalWidth, "topTraverse");
      this.addDimensionLabel(layer, totalWidth+510, uprightHeight, z, `AYAK BOYU · ${this.dimensionValue(uprightHeight)}`, 760, "topTraverse");
    }
    if (this.config.dimensions.width) {
      const y = -90, left = new THREE.Vector3(0,y,z+220), right = new THREE.Vector3(totalWidth,y,z+220);
      this.addDimensionLine(layer,[left,right]);this.addDimensionLine(layer,[left,new THREE.Vector3(0,0,z)]);this.addDimensionLine(layer,[right,new THREE.Vector3(totalWidth,0,z)]);this.addDimensionPoint(layer,left);this.addDimensionPoint(layer,right);this.addDimensionLabel(layer,totalWidth/2,y,z+220,`TOPLAM GENİŞLİK · ${this.dimensionValue(totalWidth)}`,900,"width");
    }
    if (this.config.dimensions.depth) {
      const dx=totalWidth+620,y=0,front=new THREE.Vector3(dx,y,0),back=new THREE.Vector3(dx,y,depth);
      this.addDimensionLine(layer,[front,back]);this.addDimensionLine(layer,[new THREE.Vector3(totalWidth,y,0),front]);this.addDimensionLine(layer,[new THREE.Vector3(totalWidth,y,depth),back]);this.addDimensionPoint(layer,front);this.addDimensionPoint(layer,back);this.addDimensionLabel(layer,dx+350,y,depth/2,`DERİNLİK · ${this.dimensionValue(depth)}`,650,"depth");
    }
    this.root.add(layer);
  }

  disposeDimensions() {
    if (!this.dimensionLayer) return;
    this.dimensionLayer.traverse((part) => {
      part.geometry?.dispose?.();
      const materials = Array.isArray(part.material) ? part.material : part.material ? [part.material] : [];
      materials.forEach((material) => { material.map?.dispose?.(); material.dispose?.(); });
    });
    this.dimensionLayer.removeFromParent();
    this.dimensionLayer = null;
    this.dimensionLabels = [];
  }

  setConfiguration(config) { return this.build({ ...this.config, ...config }); }
  dimensionHit(event) {
    if (!this.dimensionLabels.length) return null;
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(this.dimensionLabels, false)[0]?.object || null;
  }
  onCanvasClick(event) {
    const label = this.dimensionHit(event);
    if (label?.userData?.mrEditKey) this.canvas.dispatchEvent(new CustomEvent("mr-viewer-measure-edit", { detail: { key: label.userData.mrEditKey } }));
  }
  onCanvasPointerMove(event) { this.canvas.style.cursor = this.dimensionHit(event) ? "pointer" : "grab"; }
  setView(view = "perspective") {
    this.view = ["front", "side", "top", "perspective"].includes(view) ? view : "perspective";
    const target = this.center.clone();
    target.y = Math.max(this.size.y * 0.45, target.y);
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const displayHeight = this.view === "top" ? this.size.z : this.size.y;
    const fitHeight = Math.max(50, displayHeight) / (2 * Math.tan(vFov / 2));
    const horizontal = this.view === "side" ? this.size.z : this.size.x;
    const fitWidth = Math.max(50, horizontal) / (2 * Math.tan(vFov / 2) * Math.max(this.camera.aspect, 0.25));
    const distance = Math.max(fitHeight, fitWidth, 200) * 1.55;
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
  destroy() { this.destroyed = true; this.loadToken += 1; this.disposeDimensions(); this.canvas.removeEventListener("click", this.onCanvasClick); this.canvas.removeEventListener("pointermove", this.onCanvasPointerMove); this.resizeObserver.disconnect(); this.controls.dispose(); this.ground.geometry.dispose(); this.ground.material.dispose(); this.renderer.dispose(); }
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
