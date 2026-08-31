import fs from "node:fs";
import path from "node:path";

const viewerPath = path.join(process.cwd(), "dist/mekik-front-viewer.js");
let source = fs.readFileSync(viewerPath, "utf8");

const oldSchedule = `function scheduleMount() {
  if (scheduled) return;
  scheduled = requestAnimationFrame(ensureMounted);
}

function scheduleMountBurst() {
  scheduleMount();`;
const newSchedule = `function scheduleMount() {
  if (!isMekikFront() || scheduled) return;
  scheduled = requestAnimationFrame(ensureMounted);
}

function scheduleMountBurst() {
  if (!isMekikFront()) return;
  scheduleMount();`;
if (!source.includes(oldSchedule)) throw new Error("Mekik viewer scope: schedule block bulunamadi");
source = source.replace(oldSchedule, newSchedule);

const oldListeners = `document.addEventListener("input", () => setTimeout(scheduleMountBurst, 0), true);
document.addEventListener("change", () => setTimeout(scheduleMountBurst, 0), true);
document.addEventListener("click", () => setTimeout(scheduleMountBurst, 0), true);
window.addEventListener("hashchange", scheduleMountBurst);
window.addEventListener("load", scheduleMountBurst);

new MutationObserver(scheduleMount).observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["class", "data-m2-module", "hidden"],
});`;
const newListeners = `const scheduleIfMekikFront = () => {
  if (!isMekikFront()) return;
  setTimeout(scheduleMountBurst, 0);
};
document.addEventListener("input", scheduleIfMekikFront, true);
document.addEventListener("change", scheduleIfMekikFront, true);
document.addEventListener("click", scheduleIfMekikFront, true);
window.addEventListener("hashchange", scheduleIfMekikFront);
window.addEventListener("load", scheduleIfMekikFront);

new MutationObserver(() => {
  if (isMekikFront()) scheduleMount();
}).observe(document.documentElement, {
  childList: true,
  subtree: true,
});`;
if (!source.includes(oldListeners)) throw new Error("Mekik viewer scope: listener block bulunamadi");
source = source.replace(oldListeners, newListeners);

for (const required of [
  "if (!isMekikFront() || scheduled) return;",
  "const scheduleIfMekikFront = () =>",
  "if (isMekikFront()) scheduleMount();",
]) {
  if (!source.includes(required)) throw new Error(`Mekik viewer scope dogrulama eksigi: ${required}`);
}

fs.writeFileSync(viewerPath, source);
console.log("Mekik viewer scope v1: global event/MutationObserver yukleri Mekik on gorunusune sinirlandi.");
