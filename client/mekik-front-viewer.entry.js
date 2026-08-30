// Yalniz ana Mekik modulu icin on gorunus restore katmani.
// B2B / MR / Drive-In / Konsol / Mekik 2 DOM'una kesinlikle dokunmaz.

const FRONT_STAGE_ID = "m2Front";
const SHELL_SELECTOR = ":scope > .m2-glb-front-shell";
const LEGACY_SELECTOR = ".m2-front-upright,.m2-front-traverse-set";
const RASTER_UPRIGHT_SELECTOR = ".m2-front-upright--ayak2-glb";
const RESTORE_MARKER = "native-front-restore-v101-mekik-only";
const SVG_NS = "http://www.w3.org/2000/svg";

let restoring = false;
let scheduled = false;

function isMainMekikActive() {
  try {
    return typeof m2ActiveModule !== "undefined" && m2ActiveModule === "mekik";
  } catch {
    return false;
  }
}

function num(node, name) {
  return Number(node?.getAttribute(name)) || 0;
}

function svgNode(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}

function replaceRasterUpright(group) {
  const image = group?.querySelector(":scope > image");
  if (!image) return false;

  const x = num(image, "x");
  const y = num(image, "y");
  const width = Math.max(1, num(image, "width"));
  const height = Math.max(1, num(image, "height"));
  const floorY = y + height;
  const postX = x + width / 2;
  const postBodyWidth = Math.max(54, width * 0.56);
  const postLeft = postX - postBodyWidth / 2;
  const footHeight = Math.max(58, Math.min(108, height * 0.018));
  const footWidth = Math.max(width, postBodyWidth * 1.72);
  const footLeft = postX - footWidth / 2;
  const holeTop = y + 74;
  const holeBottom = floorY - footHeight - 42;

  group.replaceChildren(
    svgNode("rect", { class: "m2-front-post", x: postLeft, y, width: postBodyWidth, height, rx: 8 }),
    svgNode("path", { class: "m2-front-post-edge", d: `M${postLeft + postBodyWidth * 0.22} ${y + 10}V${floorY - footHeight - 8}` }),
    svgNode("line", { class: "m2-front-post-holes", x1: postX, y1: holeTop, x2: postX, y2: Math.max(holeTop, holeBottom) }),
    svgNode("rect", { class: "m2-front-base", x: footLeft, y: floorY - footHeight, width: footWidth, height: footHeight, rx: 8 }),
    svgNode("circle", { class: "m2-front-bolt", cx: postX - footWidth * 0.28, cy: floorY - footHeight * 0.42, r: 10 }),
    svgNode("circle", { class: "m2-front-bolt", cx: postX + footWidth * 0.28, cy: floorY - footHeight * 0.42, r: 10 }),
  );
  group.classList.remove("m2-front-upright--ayak2-glb");
  group.classList.add("m2-front-upright--native");
  group.removeAttribute("data-glb-source");
  group.setAttribute("data-upright-source", "native-svg");
  group.setAttribute("data-projection", "front");
  return true;
}

function restoreNativeFront() {
  if (!isMainMekikActive() || restoring) return;

  const stage = document.getElementById(FRONT_STAGE_ID);
  if (!stage) return;

  restoring = true;
  try {
    const shell = stage.querySelector(SHELL_SELECTOR);
    if (shell) {
      const svg = shell.querySelector(":scope > svg");
      if (svg) {
        svg.querySelectorAll("[data-m2-glb-old-visibility]").forEach((node) => {
          node.style.visibility = node.getAttribute("data-m2-glb-old-visibility") || "";
          node.removeAttribute("data-m2-glb-old-visibility");
        });
        svg.querySelectorAll(LEGACY_SELECTOR).forEach((node) => node.style.removeProperty("visibility"));
        svg.removeAttribute("data-m2-glb-overlay");
        svg.classList.remove("m2-glb-front-overlay");
        stage.insertBefore(svg, shell);
      }
      shell.remove();
    }

    const svg = stage.querySelector(":scope > svg");
    if (svg) {
      svg.querySelectorAll("[data-m2-glb-old-visibility]").forEach((node) => {
        node.style.visibility = node.getAttribute("data-m2-glb-old-visibility") || "";
        node.removeAttribute("data-m2-glb-old-visibility");
      });
      svg.querySelectorAll(LEGACY_SELECTOR).forEach((node) => node.style.removeProperty("visibility"));
      svg.querySelectorAll(RASTER_UPRIGHT_SELECTOR).forEach(replaceRasterUpright);
      svg.removeAttribute("data-m2-glb-overlay");
      svg.classList.remove("m2-glb-front-overlay");
      svg.dataset.rafexMekikFront = RESTORE_MARKER;
      svg.dataset.rafexMekikUpright = "native-svg-no-ayak2-raster";
    }

    stage.querySelectorAll(":scope > .m2-glb-front-canvas").forEach((node) => node.remove());
    stage.dataset.rafexMekikFront = RESTORE_MARKER;
    stage.dataset.rafexMekikUpright = "native-svg-no-ayak2-raster";
  } finally {
    restoring = false;
  }
}

function scheduleRestore() {
  // Kritik izolasyon: Mekik disinda rAF dahi planlama.
  if (!isMainMekikActive() || scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    if (!isMainMekikActive()) return;
    restoreNativeFront();
  });
}

// SPA modul gecislerini yakalamak icin observer kalir; Mekik disinda hicbir DOM yazimi yapmaz.
const observer = new MutationObserver(() => {
  if (isMainMekikActive()) scheduleRestore();
});
observer.observe(document.documentElement, { childList: true, subtree: true });

window.addEventListener("resize", () => {
  if (isMainMekikActive()) scheduleRestore();
});
queueMicrotask(() => {
  if (isMainMekikActive()) scheduleRestore();
});
