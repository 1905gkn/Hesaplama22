import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const MAIN_URL = "/mekikson2.glb";
const LEGACY_GEOMETRY_SELECTOR = [
  ".m2-front-load",
  ".m2-front-traverse-set",
  ".m2-front-upright",
  ".m2-section-seismic-brace",
].join(",");

let templatePromise;
let renderToken = 0;
let activeRenderer = null;
let refreshFrame = 0;

function loadTemplate() {
  if (templatePromise) return templatePromise;
  const draco = new DRACOLoader();
  draco.setDecoderPath("/draco/");
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  templatePromise = loader.loadAsync(MAIN_URL).finally(() => draco.dispose());
  return templatePromise;
}

function isMekikScreen() {
  try {
    if (typeof m2ActiveModule === "undefined") return false;
    return m2ActiveModule === "mekik" || m2ActiveModule === "mekik2";
  } catch {
    return false;
  }
}

function objectBounds(root) {
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3();
  const part = new THREE.Box3();
  root.traverse((node) => {
    if (!node.isMesh || !node.visible || !node.geometry) return;
    if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
    if (!node.geometry.boundingBox) return;
    part.copy(node.geometry.boundingBox).applyMatrix4(node.matrixWorld);
    bounds.union(part);
  });
  return bounds.isEmpty() ? new THREE.Box3().setFromObject(root) : bounds;
}

function preserveModel(scene) {
  scene.traverse((node) => {
    if (!node.isMesh) return;
    node.visible = true;
    node.castShadow = false;
    node.receiveShadow = false;
    const source = Array.isArray(node.material) ? node.material : [node.material];
    const cloned = source.filter(Boolean).map((material) => {
      const next = material.clone();
      next.side = THREE.DoubleSide;
      next.needsUpdate = true;
      return next;
    });
    node.material = Array.isArray(node.material) ? cloned : cloned[0];
  });
  return scene;
}

function unionClientRect(nodes, fallbackRect) {
  const rects = nodes.map((node) => node.getBoundingClientRect()).filter((rect) => rect.width > 0.5 && rect.height > 0.5);
  if (!rects.length) return fallbackRect;
  return rects.reduce((result, rect) => ({
    left: Math.min(result.left, rect.left),
    top: Math.min(result.top, rect.top),
    right: Math.max(result.right, rect.right),
    bottom: Math.max(result.bottom, rect.bottom),
  }), { left: rects[0].left, top: rects[0].top, right: rects[0].right, bottom: rects[0].bottom });
}

function overlayBounds(svg, shell) {
  const shellRect = shell.getBoundingClientRect();
  const fallback = {
    left: shellRect.left + shellRect.width * 0.08,
    right: shellRect.left + shellRect.width * 0.78,
    top: shellRect.top + shellRect.height * 0.06,
    bottom: shellRect.top + shellRect.height * 0.91,
  };
  const rect = unionClientRect([...svg.querySelectorAll(LEGACY_GEOMETRY_SELECTOR)], fallback);
  return {
    left: Math.max(0, rect.left - shellRect.left),
    right: Math.min(shellRect.width, rect.right - shellRect.left),
    top: Math.max(0, rect.top - shellRect.top),
    bottom: Math.min(shellRect.height, rect.bottom - shellRect.top),
  };
}

function hideLegacyGeometry(svg) {
  svg.querySelectorAll(LEGACY_GEOMETRY_SELECTOR).forEach((node) => {
    if (!node.hasAttribute("data-m2-glb-old-visibility")) node.setAttribute("data-m2-glb-old-visibility", node.style.visibility || "");
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
  canvas.setAttribute("aria-label", "Mekik exact GLB front view");
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

function renderKey(shell) {
  const rect = shell.getBoundingClientRect();
  return [Math.round(rect.width), Math.round(rect.height)].join("|");
}

async function renderFront(stage, force = false) {
  const shellParts = installShell(stage);
  if (!shellParts) return;
  const { shell, canvas, svg } = shellParts;
  const key = renderKey(shell);
  if (!force && (shell.dataset.glbPending === key || shell.dataset.glbRenderKey === key)) return;
  shell.dataset.glbPending = key;

  const token = ++renderToken;
  const gltf = await loadTemplate();
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
  renderer.toneMappingExposure = 1.0;
  renderer.setSize(width, height, false);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x59635e, 1.8));
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(-5000, 12000, -7000);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
  fillLight.position.set(7000, 9000, 1500);
  scene.add(fillLight);

  const model = preserveModel(gltf.scene.clone(true));
  scene.add(model);
  model.updateMatrixWorld(true);

  const bounds = objectBounds(model);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const worldUpMin = -bounds.max.z;
  const worldUpMax = -bounds.min.z;
  const worldHeight = Math.max(1, worldUpMax - worldUpMin);
  const targetWidth = Math.max(20, target.right - target.left);
  const targetHeight = Math.max(20, target.bottom - target.top);
  const worldPerPixel = Math.max(size.x / targetWidth, worldHeight / targetHeight) * 1.02;
  const frustumWidth = width * worldPerPixel;
  const frustumHeight = height * worldPerPixel;
  const renderedHeight = worldHeight / worldPerPixel;
  const desiredCenterX = (target.left + target.right) / 2;
  const desiredCenterY = Math.min(target.bottom - renderedHeight / 2, (target.top + target.bottom) / 2);
  const worldCenterUp = (worldUpMin + worldUpMax) / 2;
  const cameraCenterX = center.x - (desiredCenterX - width / 2) * worldPerPixel;
  const cameraCenterUp = worldCenterUp + (desiredCenterY - height / 2) * worldPerPixel;
  const camera = new THREE.OrthographicCamera(-frustumWidth / 2, frustumWidth / 2, frustumHeight / 2, -frustumHeight / 2, 1, 100000);
  const cameraDistance = Math.max(12000, size.y * 4);
  camera.position.set(cameraCenterX, bounds.max.y + cameraDistance, -cameraCenterUp);
  camera.up.set(0, 0, -1);
  camera.lookAt(cameraCenterX, center.y, -cameraCenterUp);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);

  hideLegacyGeometry(svg);
  shell.dataset.glbSource = "mekikson2.glb";
  shell.dataset.glbLayout = "exact-upload-single-model-v6";
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
    console.error("Mekik exact GLB front view failed", error);
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
