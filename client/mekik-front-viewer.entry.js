// Mekik ana ekraninda eski portalin native SVG on gorunusunu koru.
// Bu dosya bilerek Three.js/GLB render etmez. Sadece daha once kurulmus
// GLB overlay kalintilarini #m2Front icinden temizler.

const FRONT_STAGE_ID = "m2Front";
const SHELL_SELECTOR = ":scope > .m2-glb-front-shell";
const LEGACY_SELECTOR = ".m2-front-upright,.m2-front-traverse-set";
const RESTORE_MARKER = "native-front-restore-v100";

let restoring = false;
let scheduled = false;

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
        svg.querySelectorAll(LEGACY_SELECTOR).forEach((node) => {
          node.style.removeProperty("visibility");
        });
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
      svg.querySelectorAll(LEGACY_SELECTOR).forEach((node) => {
        node.style.removeProperty("visibility");
      });
      svg.removeAttribute("data-m2-glb-overlay");
      svg.classList.remove("m2-glb-front-overlay");
      svg.dataset.rafexMekikFront = RESTORE_MARKER;
    }

    stage.querySelectorAll(":scope > .m2-glb-front-canvas").forEach((node) => node.remove());
    stage.dataset.rafexMekikFront = RESTORE_MARKER;
  } finally {
    restoring = false;
  }
}

function scheduleRestore() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    restoreNativeFront();
  });
}

const observer = new MutationObserver(scheduleRestore);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

window.addEventListener("resize", scheduleRestore);
queueMicrotask(scheduleRestore);
