import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const MAIN_URL = "/mekik-son-hali.glb";
const UPRIGHT_SELECTOR = ".m2-front-upright";
const TRAVERS_SELECTOR = ".m2-front-traverse-set";
const LEGACY_GEOMETRY_SELECTOR = [UPRIGHT_SELECTOR, TRAVERS_SELECTOR].join(",");

// Kullanıcının 30.08.2026 tarihinde paylaştığı Draco'suz Mekik 3 GLB'lerinden
// doğrulanan exact node adları. Runtime'da production'da zaten bulunan aynı
// Mekik GLB geometrisi bu node isimleriyle ayrıştırılır.
const AYAK_PROFILE_NAME = /HR 100 5500 D1050 MONTAJ - HR 100 AYAK 5500 -12\.001/i;
const AYAK_FOOT_NAME = /HR 100 5500 D1050 MONTAJ - HRTD100-14\.001/i;
const TRAVERS_GROUP_NAME = /MEKIK TRAVERS MONTA L1500-14/i;
const TRAVERS_PROFILE_NAME = /MEKIK TRAVERS 40X80X2 PROFIL-1\.001/i;
const TRAVERS_CONNECTOR_NAME = /CC100 KONNEKTÖR-[12]\.001/i;
const TRAVERS_BRACKET_NAME = /AynalamaAynalamaRAFEX MEKİK\s+BRAKET YENİ R3-9\.001|AynalamaRAFEX MEKİK\s+BRAKET YENİ R3-11\.001/i;

let assetsPromise;
let renderToken = 0;
let activeRenderer = null;
let refreshFrame = 0;

function isMekikScreen() {
  try {
    if (typeof m2ActiveModule === "undefined") return false;
    return m2ActiveModule === "mekik" || m2ActiveModule === "mekik2";
  } catch {
    return false;
  }
}

function cloneMeshWorld(node) {
  const mesh = node.clone();
  if (node.geometry) mesh.geometry = node.geometry;
  const materials = Array.isArray(node.material) ? node.material : [node.material];
  const cloned = materials.filter(Boolean).map((material) => {
    const next = material.clone();
    next.side = THREE.DoubleSide;
    next.needsUpdate = true;
    return next;
  });
  mesh.material = Array.isArray(node.material) ? cloned : cloned[0];
  mesh.matrix.copy(node.matrixWorld);
  mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
  mesh.matrixAutoUpdate = true;
  mesh.frustumCulled = false;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}

function nodeLabel(node) {
  const lineage = [];
  let current = node;
  while (current) {
    if (current.name) lineage.push(current.name);
    current = current.parent;
  }
  return lineage.join(" | ");
}

function buildTemplate(scene, predicate, label) {
  scene.updateMatrixWorld(true);
  const group = new THREE.Group();
  scene.traverse((node) => {
    if (!node.isMesh) return;
    const lineage = nodeLabel(node);
    if (!predicate(node.name || "", lineage)) return;
    group.add(cloneMeshWorld(node));
  });
  if (!group.children.length) throw new Error(`Mekik ${label} exact GLB parcalari bulunamadi`);
  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group);
  group.position.x -= box.min.x;
  group.position.z -= box.min.z;
  group.updateMatrixWorld(true);
  const size = new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3());
  group.userData.baseWidth = Math.max(0.001, size.x);
  group.userData.baseHeight = Math.max(0.001, size.z);
  return group;
}

function loadAssets() {
  if (assetsPromise) return assetsPromise;
  const draco = new DRACOLoader();
  draco.setDecoderPath("/draco/");
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  assetsPromise = loader.loadAsync(MAIN_URL).then((gltf) => {
    // mekik 3ayak.glb = HR100 profil + HRTD100 taban/takim parcasi.
    const ayak = buildTemplate(
      gltf.scene,
      (name) => AYAK_PROFILE_NAME.test(name) || AYAK_FOOT_NAME.test(name),
      "ayak",
    );

    // mekik 3travers.glb = 40x80 profil + iki CC100 + iki sari braket.
    const travers = buildTemplate(
      gltf.scene,
      (name, lineage) => {
        if (TRAVERS_BRACKET_NAME.test(name)) return true;
        return TRAVERS_GROUP_NAME.test(lineage)
          && (TRAVERS_PROFILE_NAME.test(name) || TRAVERS_CONNECTOR_NAME.test(name));
      },
      "travers",
    );
    return { ayak, travers };
  }).finally(() => draco.dispose());
  return assetsPromise;
}

function styleShell(shell, canvas, svg) {
  shell.style.position = "relative";
  shell.style.display = "block";
  shell.style.width = "100%";
  shell.style.maxWidth = "100%";
  shell.style.lineHeight = "0";
  shell.style.overflow = "hidden";
  svg.style.position = "relative";
  svg.style.zIndex = "3";
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
  canvas.setAttribute("aria-label", "Mekik 3 GLB component front view");
  svg.classList.add("m2-glb-front-overlay");
  shell.append(svg, canvas);
  stage.append(shell);
  styleShell(shell, canvas, svg);
  return { shell, canvas, svg };
}

function legacyRects(svg, selector, shellRect) {
  return [...svg.querySelectorAll(selector)]
    .map((node) => node.getBoundingClientRect())
    .filter((rect) => rect.width > 0.5 && rect.height > 0.5)
    .map((rect) => ({ x: rect.left - shellRect.left, z: rect.top - shellRect.top, width: rect.width, height: rect.height }));
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

function addTemplate(scene, template, rect, depth = 0) {
  const item = template.clone(true);
  const bw = Math.max(0.001, template.userData.baseWidth || 1);
  const bh = Math.max(0.001, template.userData.baseHeight || 1);
  item.scale.set(rect.width / bw, 1, rect.height / bh);
  item.position.set(rect.x, depth, rect.z);
  scene.add(item);
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

function renderKey(shell, svg) {
  const rect = shell.getBoundingClientRect();
  return [Math.round(rect.width), Math.round(rect.height), svg.querySelectorAll(UPRIGHT_SELECTOR).length, svg.querySelectorAll(TRAVERS_SELECTOR).length].join("|");
}

async function renderFront(stage, force = false) {
  const parts = installShell(stage);
  if (!parts) return;
  const { shell, canvas, svg } = parts;
  const key = renderKey(shell, svg);
  if (!force && (shell.dataset.glbPending === key || shell.dataset.glbRenderKey === key)) return;
  shell.dataset.glbPending = key;

  restoreLegacyGeometry(svg);
  const shellRect = shell.getBoundingClientRect();
  const uprightRects = legacyRects(svg, UPRIGHT_SELECTOR, shellRect);
  const traversRects = legacyRects(svg, TRAVERS_SELECTOR, shellRect);
  if (!uprightRects.length || !traversRects.length) {
    delete shell.dataset.glbPending;
    return;
  }

  const token = ++renderToken;
  const assets = await loadAssets();
  if (token !== renderToken || !canvas.isConnected || !isMekikScreen()) return;

  const width = Math.max(320, Math.round(shellRect.width || shell.clientWidth || 640));
  const height = Math.max(240, Math.round(shellRect.height || shell.clientHeight || 400));
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
  scene.add(new THREE.HemisphereLight(0xffffff, 0x66716c, 2.0));
  scene.add(new THREE.AmbientLight(0xffffff, 0.72));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
  keyLight.position.set(-500, 2500, -1000);
  scene.add(keyLight);
  const fill = new THREE.DirectionalLight(0xffffff, 0.9);
  fill.position.set(width + 500, 1800, height / 2);
  scene.add(fill);

  uprightRects.forEach((rect) => addTemplate(scene, assets.ayak, rect, 0));
  traversRects.forEach((rect) => addTemplate(scene, assets.travers, rect, 2));

  const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 10000);
  camera.position.set(width / 2, 3000, height / 2);
  camera.up.set(0, 0, -1);
  camera.lookAt(width / 2, 0, height / 2);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);

  hideLegacyGeometry(svg);
  shell.dataset.glbSource = "mekik 3ayak.glb + mekik 3travers.glb exact node map";
  shell.dataset.glbLayout = "mekik3-exact-components-v99";
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
    console.error("Mekik 3 exact component front view failed", error);
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
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["transform", "d", "x", "y", "width", "height", "style", "class"] });
window.addEventListener("resize", () => scheduleRefresh(true));
window.addEventListener("orientationchange", () => scheduleRefresh(true));
queueMicrotask(() => scheduleRefresh(true));
