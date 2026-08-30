import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const MAIN_URL = "/mekik-son-hali.glb";
const TRAVERSE_URL = "/mekik-travers.glb";
const SOURCE = {
  minX: 41.3586,
  maxX: 1591.3586,
  minZ: -6036.79,
  maxZ: -36.79,
  traverseCenterZ: (-3794.79 - 3531.79) / 2,
};
const LEGACY_GEOMETRY_SELECTOR = [
  ".m2-front-load",
  ".m2-front-traverse-set",
  ".m2-front-upright",
  ".m2-section-seismic-brace",
].join(",");

let templatesPromise;
let renderToken = 0;
let activeRenderer = null;
let refreshFrame = 0;

function loadTemplates() {
  if (templatesPromise) return templatesPromise;
  const draco = new DRACOLoader();
  draco.setDecoderPath("/draco/");
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  templatesPromise = Promise.all([
    loader.loadAsync(MAIN_URL),
    loader.loadAsync(TRAVERSE_URL),
  ]).finally(() => draco.dispose());
  return templatesPromise;
}

function drawingValues() {
  let drawing = window.m2LastDrawing || {};
  try {
    if (typeof m2LastDrawing !== "undefined" && m2LastDrawing) drawing = m2LastDrawing;
  } catch {}
  const read = (id, fallback) => {
    const value = Number(document.getElementById(id)?.value);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  };
  const bays = Math.max(1, Math.min(12, Number(drawing.bays) || read("m2Bays", 4)));
  const levels = Math.max(1, Math.min(15, Number(drawing.levels) || read("m2Levels", 4)));
  const palW = Math.max(600, Number(drawing.palW) || read("m2PalW", 1200));
  const levelH = Math.max(380, Number(drawing.levelH) || read("m2LevelSpacing", 1580));
  const loadHeight = Math.max(300, Number(drawing.palletHeight) || read("m2LevelH", levelH - 380));
  const firstRail = Math.max(0, Number(drawing.firstRailHeight) || read("m2FirstLevelHeight", 430));
  const frameHeight = firstRail + (levels - 1) * levelH + loadHeight / 2;
  const bayPitch = palW + 150;
  return { bays, levels, palW, levelH, loadHeight, firstRail, frameHeight, bayPitch };
}

function isMekikScreen() {
  try {
    return typeof m2ActiveModule !== "undefined" && m2ActiveModule === "mekik2";
  } catch {
    return false;
  }
}

function forEachMaterial(node, transform) {
  const source = Array.isArray(node.material) ? node.material : [node.material];
  const materials = source.filter(Boolean).map((material) => transform(material.clone()));
  node.material = Array.isArray(node.material) ? materials : materials[0];
}

function makeGalvanized(material) {
  if (material.color) material.color.set("#7f8b90");
  material.roughness = 0.6;
  material.metalness = 0.3;
  material.side = THREE.DoubleSide;
  material.transparent = false;
  material.opacity = 1;
  material.depthWrite = true;
  material.needsUpdate = true;
  return material;
}

function makeYellow(material) {
  if (material.color) material.color.set("#f2c500");
  material.roughness = 0.54;
  material.metalness = 0.22;
  material.side = THREE.DoubleSide;
  material.transparent = false;
  material.opacity = 1;
  material.depthWrite = true;
  material.needsUpdate = true;
  return material;
}

function cleanStructuralModel(scene) {
  scene.traverse((node) => {
    if (!node.isMesh) return;
    const name = String(node.name || "").toLocaleUpperCase("tr-TR");
    if (/MEK[I\u0130]K TRAVERS MONTA|RAY STANDART|PALET|KUTU|BRAKET|TESB[I\u0130]T|SCREW|NUT/.test(name)) {
      node.visible = false;
      return;
    }
    node.visible = true;
    node.castShadow = false;
    node.receiveShadow = false;
    forEachMaterial(node, makeGalvanized);
  });
  return scene;
}

function prepareTraverse(scene) {
  scene.traverse((node) => {
    if (!node.isMesh) return;
    node.visible = true;
    node.castShadow = false;
    node.receiveShadow = false;
    forEachMaterial(node, makeYellow);
  });
  return scene;
}

function visibleObjectBounds(root) {
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3();
  const partBounds = new THREE.Box3();
  root.traverse((node) => {
    if (!node.isMesh || !node.visible || !node.geometry) return;
    if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
    if (!node.geometry.boundingBox) return;
    partBounds.copy(node.geometry.boundingBox).applyMatrix4(node.matrixWorld);
    bounds.union(partBounds);
  });
  return bounds.isEmpty() ? new THREE.Box3().setFromObject(root) : bounds;
}

function addLoad(scene, bay, level, values) {
  const palletHeight = Math.min(166, values.loadHeight);
  const boxHeight = Math.max(0, values.loadHeight - palletHeight);
  const x = bay * values.bayPitch + values.bayPitch / 2;
  const rail = values.firstRail + level * values.levelH;
  const pallet = new THREE.Mesh(
    new THREE.BoxGeometry(values.palW, 720, palletHeight),
    new THREE.MeshStandardMaterial({ color: "#b97934", roughness: 0.78, metalness: 0.03 }),
  );
  pallet.position.set(x, 6120, -(rail + palletHeight / 2));
  scene.add(pallet);
  if (boxHeight > 0) {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(values.palW, 700, boxHeight),
      new THREE.MeshStandardMaterial({ color: "#d8a34d", roughness: 0.82, metalness: 0.02 }),
    );
    box.position.set(x, 6090, -(rail + palletHeight + boxHeight / 2));
    scene.add(box);
  }
}

function unionClientRect(nodes, fallbackRect) {
  const rects = nodes
    .map((node) => node.getBoundingClientRect())
    .filter((rect) => rect.width > 0.5 && rect.height > 0.5);
  if (!rects.length) return fallbackRect;
  return rects.reduce((result, rect) => ({
    left: Math.min(result.left, rect.left),
    top: Math.min(result.top, rect.top),
    right: Math.max(result.right, rect.right),
    bottom: Math.max(result.bottom, rect.bottom),
    width: 0,
    height: 0,
  }), {
    left: rects[0].left,
    top: rects[0].top,
    right: rects[0].right,
    bottom: rects[0].bottom,
    width: 0,
    height: 0,
  });
}

function overlayBounds(svg, shell) {
  const shellRect = shell.getBoundingClientRect();
  const fallback = {
    left: shellRect.left + shellRect.width * 0.11,
    right: shellRect.left + shellRect.width * 0.75,
    top: shellRect.top + shellRect.height * 0.07,
    bottom: shellRect.top + shellRect.height * 0.91,
  };
  const nodes = [...svg.querySelectorAll(LEGACY_GEOMETRY_SELECTOR)];
  const rect = unionClientRect(nodes, fallback);
  return {
    left: Math.max(0, rect.left - shellRect.left),
    right: Math.min(shellRect.width, rect.right - shellRect.left),
    top: Math.max(0, rect.top - shellRect.top),
    bottom: Math.min(shellRect.height, rect.bottom - shellRect.top),
  };
}

function hideLegacyGeometry(svg) {
  svg.querySelectorAll(LEGACY_GEOMETRY_SELECTOR).forEach((node) => {
    if (!node.hasAttribute("data-m2-glb-old-visibility")) {
      node.setAttribute("data-m2-glb-old-visibility", node.style.visibility || "");
    }
    node.style.visibility = "hidden";
  });
  svg.setAttribute("data-m2-glb-overlay", "true");
}

function restoreLegacyGeometry(svg) {
  svg.querySelectorAll("[data-m2-glb-old-visibility]").forEach((node) => {
    node.style.visibility = node.getAttribute("data-m2-glb-old-visibility") || "";
    node.removeAttribute("data-m2-glb-old-visibility");
  });
  svg.removeAttribute("data-m2-glb-overlay");
}

function styleShell(shell, canvas, svg) {
  shell.style.position = "relative";
  shell.style.display = "block";
  shell.style.width = "100%";
  shell.style.maxWidth = "100%";
  shell.style.lineHeight = "0";
  shell.style.overflow = "hidden";

  svg.style.position = "relative";
  svg.style.zIndex = "1";
  svg.style.display = "block";
  svg.style.width = "100%";
  svg.style.maxWidth = "100%";

  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.zIndex = "2";
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.background = "transparent";
}

function installShell(stage) {
  const existing = stage.querySelector(":scope > .m2-glb-front-shell");
  if (existing) {
    const canvas = existing.querySelector(":scope > .m2-glb-front-canvas");
    const svg = existing.querySelector(":scope > svg");
    if (canvas && svg) {
      styleShell(existing, canvas, svg);
      return { shell: existing, canvas, svg };
    }
    existing.remove();
  }

  const svg = stage.querySelector(":scope > svg");
  if (!svg) return null;
  const shell = document.createElement("div");
  shell.className = "m2-glb-front-shell";
  const canvas = document.createElement("canvas");
  canvas.className = "m2-glb-front-canvas";
  canvas.setAttribute("aria-label", "Mekik GLB front view");
  svg.classList.add("m2-glb-front-overlay");
  shell.append(svg, canvas);
  stage.append(shell);
  styleShell(shell, canvas, svg);
  return { shell, canvas, svg };
}

function disposeRenderer() {
  if (!activeRenderer) return;
  activeRenderer.dispose();
  activeRenderer = null;
}

function removeShell() {
  const stage = document.getElementById("m2Front");
  const shell = stage?.querySelector(":scope > .m2-glb-front-shell");
  if (!shell) return;
  const svg = shell.querySelector(":scope > svg");
  if (svg) {
    restoreLegacyGeometry(svg);
    svg.classList.remove("m2-glb-front-overlay");
    stage.insertBefore(svg, shell);
  }
  shell.remove();
}

function renderKey(values, shell) {
  const rect = shell.getBoundingClientRect();
  return [
    values.bays,
    values.levels,
    values.palW,
    values.levelH,
    values.loadHeight,
    values.firstRail,
    Math.round(rect.width),
    Math.round(rect.height),
  ].join("|");
}

async function renderFront(stage, force = false) {
  const shellParts = installShell(stage);
  if (!shellParts) return;
  const { shell, canvas, svg } = shellParts;
  const values = drawingValues();
  const key = renderKey(values, shell);
  if (!force && (shell.dataset.glbPending === key || shell.dataset.glbRenderKey === key)) return;
  shell.dataset.glbPending = key;

  const token = ++renderToken;
  const [mainGltf, traverseGltf] = await loadTemplates();
  if (token !== renderToken || !canvas.isConnected || !isMekikScreen()) return;

  const width = Math.max(320, Math.round(shell.getBoundingClientRect().width || shell.clientWidth || 640));
  const height = Math.max(240, Math.round(shell.getBoundingClientRect().height || shell.clientHeight || 400));
  const target = overlayBounds(svg, shell);

  disposeRenderer();
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  activeRenderer = renderer;
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setSize(width, height, false);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x4e5a55, 1.55));
  scene.add(new THREE.AmbientLight(0xffffff, 0.48));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.15);
  keyLight.position.set(-3500, 9000, -7000);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xfff4ca, 1.0);
  fillLight.position.set(5000, 8500, 1000);
  scene.add(fillLight);

  const rack = new THREE.Group();
  const sourceWidth = SOURCE.maxX - SOURCE.minX;
  const xScale = values.bayPitch / sourceWidth;
  const zScale = values.frameHeight / (SOURCE.maxZ - SOURCE.minZ);
  for (let bay = 0; bay < values.bays; bay += 1) {
    const structural = cleanStructuralModel(mainGltf.scene.clone(true));
    structural.scale.set(xScale, 1, zScale);
    structural.position.set(bay * values.bayPitch - SOURCE.minX * xScale, 0, -SOURCE.maxZ * zScale);
    rack.add(structural);
    for (let level = 0; level < values.levels; level += 1) {
      const traverse = prepareTraverse(traverseGltf.scene.clone(true));
      traverse.scale.set(xScale, 1, 1);
      const rail = values.firstRail + level * values.levelH;
      traverse.position.set(
        bay * values.bayPitch - SOURCE.minX * xScale,
        0,
        -rail - SOURCE.traverseCenterZ,
      );
      rack.add(traverse);
      addLoad(rack, bay, level, values);
    }
  }
  scene.add(rack);
  rack.updateMatrixWorld(true);

  const rackBounds = visibleObjectBounds(rack);
  const rackSize = rackBounds.getSize(new THREE.Vector3());
  const rackCenter = rackBounds.getCenter(new THREE.Vector3());
  const worldUpMin = -rackBounds.max.z;
  const worldUpMax = -rackBounds.min.z;
  const worldHeight = Math.max(1, worldUpMax - worldUpMin);
  const targetWidth = Math.max(20, target.right - target.left);
  const targetHeight = Math.max(20, target.bottom - target.top);
  const worldPerPixel = Math.max(rackSize.x / targetWidth, worldHeight / targetHeight) * 1.015;
  const frustumWidth = width * worldPerPixel;
  const frustumHeight = height * worldPerPixel;
  const renderedHeight = worldHeight / worldPerPixel;
  const desiredCenterX = (target.left + target.right) / 2;
  const desiredCenterY = Math.min(target.bottom - renderedHeight / 2, (target.top + target.bottom) / 2);
  const worldCenterUp = (worldUpMin + worldUpMax) / 2;
  const cameraCenterX = rackCenter.x - (desiredCenterX - width / 2) * worldPerPixel;
  const cameraCenterUp = worldCenterUp + (desiredCenterY - height / 2) * worldPerPixel;
  const camera = new THREE.OrthographicCamera(
    -frustumWidth / 2,
    frustumWidth / 2,
    frustumHeight / 2,
    -frustumHeight / 2,
    1,
    100000,
  );
  const depthDistance = Math.max(8000, rackSize.y * 5, worldHeight * 1.8);
  camera.position.set(cameraCenterX, rackBounds.max.y + depthDistance, -cameraCenterUp);
  camera.up.set(0, 0, -1);
  camera.lookAt(cameraCenterX, rackCenter.y, -cameraCenterUp);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);

  hideLegacyGeometry(svg);
  shell.dataset.glbSource = "mekikson2.glb|MEKIKTRAVERS.glb";
  shell.dataset.glbLayout = "full-size-overlay-v2";
  shell.dataset.glbReady = "true";
  shell.dataset.glbRenderKey = key;
  delete shell.dataset.glbPending;
}

function refresh(force = false) {
  if (!isMekikScreen()) {
    ++renderToken;
    disposeRenderer();
    removeShell();
    return;
  }
  const stage = document.getElementById("m2Front");
  if (!stage || (!stage.querySelector(":scope > svg") && !stage.querySelector(":scope > .m2-glb-front-shell"))) return;
  renderFront(stage, force).catch((error) => {
    const shell = stage.querySelector(":scope > .m2-glb-front-shell");
    if (shell) delete shell.dataset.glbPending;
    console.error("Mekik GLB front view failed", error);
  });
}

function scheduleRefresh(force = false) {
  if (refreshFrame) cancelAnimationFrame(refreshFrame);
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = 0;
    refresh(force);
  });
}

const observer = new MutationObserver(() => scheduleRefresh(false));
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener("resize", () => scheduleRefresh(true));
window.addEventListener("orientationchange", () => scheduleRefresh(true));
queueMicrotask(() => scheduleRefresh(true));
