// Mekik ana ekraninda mevcut on gorunusu koru ve eski portal on gorunumunu
// ayrica "On Gorunum 2" olarak sun. Three.js/GLB render etmez.

const FRONT_STAGE_ID = "m2Front";
const FRONT2_STAGE_ID = "m2Front2";
const FRONT2_TAB = "front2";
const SHELL_SELECTOR = ":scope > .m2-glb-front-shell";
const LEGACY_SELECTOR = ".m2-front-upright,.m2-front-traverse-set";
const RASTER_UPRIGHT_SELECTOR = ".m2-front-upright--ayak2-glb";
const RESTORE_MARKER = "native-front-restore-v100";
const FRONT2_MARKER = "legacy-drive-in-front-v1";
const SVG_NS = "http://www.w3.org/2000/svg";

let restoring = false;
let scheduled = false;

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
  if (restoring) return;
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

function currentMekikDrawing() {
  try {
    if (typeof m2ActiveModule !== "undefined" && m2ActiveModule !== "mekik2") return null;
    if (typeof m2LastDrawing !== "undefined" && m2LastDrawing) return m2LastDrawing;
  } catch {}
  return null;
}

function fmtLegacy(value) {
  const n = Math.round(Number(value) || 0);
  try { return n.toLocaleString("tr-TR"); } catch { return String(n); }
}

function legacyDimLine(x1, y1, x2, y2) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="m2-front2-dimension"/><line x1="${x1 - 4}" y1="${y1}" x2="${x1 + 4}" y2="${y1}" class="m2-front2-dimension"/><line x1="${x2 - 4}" y1="${y2}" x2="${x2 + 4}" y2="${y2}" class="m2-front2-dimension"/>`;
}

function legacyFrontSvg(drawing) {
  const bays = Math.max(1, Math.round(Number(drawing?.bays) || 1));
  const levels = Math.max(1, Math.round(Number(drawing?.levels) || 1));
  const visibleBays = Math.min(bays, 3);
  const visibleLevels = Math.min(levels, 6);
  const totalWidth = Math.max(1, Number(drawing?.totalWidth) || 1);
  const levelH = Math.max(1, Number(drawing?.levelH) || 1);
  const x0 = 82;
  const y0 = 55;
  const w = 610;
  const h = 385;
  const colW = w / visibleBays;
  const rowH = h / visibleLevels;

  let svg = `<svg viewBox="0 0 760 500" role="img" aria-label="Mekik raf önden görünüşü" data-rafex-front2="${FRONT2_MARKER}"><style>.m2-front2-label{fill:#111827;font:800 12px Arial}.m2-front2-dim{fill:#64748b;font:700 9px Arial}.m2-front2-upright{stroke:#4b5565;stroke-width:9}.m2-front2-beam{stroke:#e73e3e;stroke-width:9}.m2-front2-load{fill:#e9f3ff;stroke:#2587ee;stroke-width:1.2}.m2-front2-pallet-base{fill:#d99b18;stroke:#b77d08;stroke-width:1}.m2-front2-dimension{stroke:#64748b;stroke-width:1}</style><text x="380" y="25" text-anchor="middle" class="m2-front2-label">VUE DE FACE (Önden Görünüş)</text>`;

  for (let c = 0; c <= visibleBays; c++) {
    const x = x0 + c * colW;
    svg += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + h}" class="m2-front2-upright"/>`;
  }

  for (let level = 0; level < visibleLevels; level++) {
    const beamY = y0 + h - level * rowH;
    svg += `<line x1="${x0}" y1="${beamY}" x2="${x0 + w}" y2="${beamY}" class="m2-front2-beam"/>`;
    for (let c = 0; c < visibleBays; c++) {
      const px = x0 + c * colW + colW * 0.14;
      const py = beamY - rowH * 0.72;
      svg += `<rect x="${px}" y="${py}" width="${colW * 0.72}" height="${rowH * 0.57}" rx="2" class="m2-front2-load"/><rect x="${px - 3}" y="${beamY - 9}" width="${colW * 0.78}" height="9" class="m2-front2-pallet-base"/>`;
    }
  }

  svg += `<line x1="${x0}" y1="${y0}" x2="${x0 + w}" y2="${y0}" class="m2-front2-beam"/>${legacyDimLine(48, y0, 48, y0 + h)}<text x="36" y="${y0 + h / 2}" transform="rotate(-90 36 ${y0 + h / 2})" text-anchor="middle" class="m2-front2-dim">${fmtLegacy(levels * levelH)} mm</text>${legacyDimLine(x0, 466, x0 + w, 466)}<text x="${x0 + w / 2}" y="486" text-anchor="middle" class="m2-front2-dim">${fmtLegacy(totalWidth)} mm · ${fmtLegacy(bays)} göz</text></svg>`;
  return svg;
}

function renderFront2() {
  const stage = document.getElementById(FRONT2_STAGE_ID);
  const drawing = currentMekikDrawing();
  if (!stage || !drawing) return;
  const signature = [drawing.bays, drawing.levels, drawing.totalWidth, drawing.levelH].join("|");
  if (stage.dataset.signature === signature && stage.querySelector(`[data-rafex-front2="${FRONT2_MARKER}"]`)) return;
  stage.innerHTML = legacyFrontSvg(drawing);
  stage.dataset.signature = signature;
  stage.dataset.source = "rafex-drive-in-legacy-front";
}

function showFront2() {
  renderFront2();
  document.querySelectorAll("[data-m2-view]").forEach((view) => {
    view.hidden = view.dataset.m2View !== FRONT2_TAB;
  });
  document.querySelectorAll("[data-m2-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.m2Tab === FRONT2_TAB);
  });
}

function removeFront2() {
  document.querySelector('[data-m2-tab="front2"][data-rafex-front2-tab]')?.remove();
  document.querySelector('[data-m2-view="front2"][data-rafex-front2-view]')?.remove();
}

function ensureFront2() {
  let active = false;
  try { active = typeof m2ActiveModule === "undefined" || m2ActiveModule === "mekik2"; } catch { active = true; }
  if (!active) {
    removeFront2();
    return;
  }

  const frontButton = document.querySelector('[data-m2-tab="front"]');
  const frontView = document.querySelector('[data-m2-view="front"]');
  if (!frontButton || !frontView) return;

  let button = document.querySelector('[data-m2-tab="front2"][data-rafex-front2-tab]');
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.dataset.m2Tab = FRONT2_TAB;
    button.dataset.rafexFront2Tab = "1";
    button.textContent = "Ön Görünüm 2";
    button.addEventListener("click", showFront2);
    frontButton.insertAdjacentElement("afterend", button);
  }

  let view = document.querySelector('[data-m2-view="front2"][data-rafex-front2-view]');
  if (!view) {
    view = document.createElement("div");
    view.className = "m2-view";
    view.dataset.m2View = FRONT2_TAB;
    view.dataset.rafexFront2View = "1";
    view.hidden = true;
    view.innerHTML = `<header><h3>Ön Görünüm 2</h3><span>Eski Rafex Drive-In görünümü</span></header><div class="m2-canvas" id="${FRONT2_STAGE_ID}" data-source="rafex-drive-in-legacy-front"></div>`;
    frontView.insertAdjacentElement("afterend", view);
  }
  renderFront2();
}

function scheduleRestore() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    restoreNativeFront();
    ensureFront2();
  });
}

const observer = new MutationObserver(scheduleRestore);
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener("resize", scheduleRestore);
queueMicrotask(scheduleRestore);
