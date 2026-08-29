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

let templatesPromise;
let renderToken = 0;
let activeRenderer = null;

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

function cleanStructuralModel(scene) {
  scene.traverse((node) => {
    if (!node.isMesh) return;
    const name = String(node.name || "").toLocaleUpperCase("tr-TR");
    if (/MEKIK TRAVERS MONTA|RAY STANDART|PALET|KUTU|BRAKET|TESBİT|SCREW|NUT/.test(name)) {
      node.visible = false;
      return;
    }
    node.castShadow = false;
    node.receiveShadow = false;
    if (node.material) {
      node.material = node.material.clone();
      node.material.roughness = Math.max(.48, Number(node.material.roughness) || 0);
      node.material.metalness = Math.max(.15, Number(node.material.metalness) || 0);
    }
  });
  return scene;
}

function prepareTraverse(scene) {
  scene.traverse((node) => {
    if (!node.isMesh) return;
    node.material = node.material.clone();
    node.material.color.set("#f2c500");
    node.material.roughness = .56;
    node.material.metalness = .22;
  });
  return scene;
}

function addLoad(scene, bay, level, values) {
  const palletHeight = Math.min(166, values.loadHeight);
  const boxHeight = Math.max(0, values.loadHeight - palletHeight);
  const x = bay * values.bayPitch + values.bayPitch / 2;
  const rail = values.firstRail + level * values.levelH;
  const pallet = new THREE.Mesh(
    new THREE.BoxGeometry(values.palW, 720, palletHeight),
    new THREE.MeshStandardMaterial({ color: "#b97934", roughness: .78 }),
  );
  pallet.position.set(x, 6120, -(rail + palletHeight / 2));
  scene.add(pallet);
  if (boxHeight > 0) {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(values.palW, 700, boxHeight),
      new THREE.MeshStandardMaterial({ color: "#d8a34d", roughness: .82 }),
    );
    box.position.set(x, 6090, -(rail + palletHeight + boxHeight / 2));
    scene.add(box);
  }
}

function overlayBounds(svg, values) {
  const viewBox = svg.viewBox.baseVal;
  const uprights = [...svg.querySelectorAll(".m2-front-upright image")];
  if (!uprights.length) {
    return { viewBox, left: viewBox.width * .22, right: viewBox.width * .78, top: viewBox.height * .09, bottom: viewBox.height * .86 };
  }
  const numeric = (node, name) => Number(node.getAttribute(name)) || 0;
  const left = Math.min(...uprights.map((node) => numeric(node, "x")));
  const right = Math.max(...uprights.map((node) => numeric(node, "x") + numeric(node, "width")));
  const top = Math.min(...uprights.map((node) => numeric(node, "y")));
  const bottom = Math.max(...uprights.map((node) => numeric(node, "y") + numeric(node, "height")));
  return { viewBox, left, right, top, bottom, values };
}

function installShell(stage) {
  const svg = stage.querySelector(":scope > svg");
  if (!svg || stage.querySelector(":scope > .m2-glb-front-shell")) return null;
  const shell = document.createElement("div");
  shell.className = "m2-glb-front-shell";
  const canvas = document.createElement("canvas");
  canvas.className = "m2-glb-front-canvas";
  canvas.setAttribute("aria-label", "mekikson2 ve MEKIKTRAVERS GLB dosyalarından oluşturulan Mekik ön görünümü");
  svg.classList.add("m2-glb-front-overlay");
  shell.append(canvas, svg);
  stage.append(shell);
  return { shell, canvas, svg };
}

async function renderFront(stage) {
  const shellParts = installShell(stage);
  if (!shellParts) return;
  const { shell, canvas, svg } = shellParts;
  const token = ++renderToken;
  const values = drawingValues();
  const bounds = overlayBounds(svg, values);
  const [mainGltf, traverseGltf] = await loadTemplates();
  if (token !== renderToken || !canvas.isConnected) return;

  if (activeRenderer) activeRenderer.dispose();
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  activeRenderer = renderer;
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const width = Math.max(640, Math.round(shell.clientWidth || bounds.viewBox.width));
  const height = Math.max(400, Math.round(width * bounds.viewBox.height / bounds.viewBox.width));
  renderer.setSize(width, height, false);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x59635e, 2.25));
  const key = new THREE.DirectionalLight(0xffffff, 3.1);
  key.position.set(-3500, 9000, -7000);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xfff4ca, 1.55);
  fill.position.set(5000, 8500, 1000);
  scene.add(fill);

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

  const vb = bounds.viewBox;
  const targetWidth = Math.max(1, bounds.right - bounds.left);
  const targetHeight = Math.max(1, bounds.bottom - bounds.top);
  const worldWidth = values.bays * values.bayPitch;
  const frustumWidth = worldWidth * vb.width / targetWidth;
  const frustumHeight = values.frameHeight * vb.height / targetHeight;
  const targetCenterX = (bounds.left + bounds.right) / 2;
  const targetCenterY = (bounds.top + bounds.bottom) / 2;
  const worldCenterX = worldWidth / 2;
  const worldCenterUp = values.frameHeight / 2;
  const cameraCenterX = worldCenterX - (targetCenterX - vb.width / 2) * frustumWidth / vb.width;
  const cameraCenterUp = worldCenterUp - (vb.height / 2 - targetCenterY) * frustumHeight / vb.height;
  const camera = new THREE.OrthographicCamera(-frustumWidth / 2, frustumWidth / 2, frustumHeight / 2, -frustumHeight / 2, 1, 30000);
  camera.position.set(cameraCenterX, 11500, -cameraCenterUp);
  camera.up.set(0, 0, -1);
  camera.lookAt(cameraCenterX, 3500, -cameraCenterUp);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  shell.dataset.glbSource = "mekikson2.glb|MEKIKTRAVERS.glb";
  shell.dataset.glbReady = "true";
}

function refresh() {
  if (!isMekikScreen()) {
    if (activeRenderer) {
      activeRenderer.dispose();
      activeRenderer = null;
    }
    return;
  }
  const stage = document.getElementById("m2Front");
  if (!stage || !stage.querySelector(":scope > svg")) return;
  renderFront(stage).catch((error) => {
    console.error("Mekik GLB ön görünümü yüklenemedi", error);
  });
}

const observer = new MutationObserver(() => queueMicrotask(refresh));
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener("resize", () => setTimeout(refresh, 80));
queueMicrotask(refresh);
