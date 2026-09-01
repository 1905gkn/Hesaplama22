import fs from "node:fs";

const target = "client/mekik-front-viewer.entry.js";
let source = fs.readFileSync(target, "utf8");

const oldBurst = `function scheduleMountBurst() {\n  scheduleMount();\n  requestAnimationFrame(() => requestAnimationFrame(scheduleMount));\n  setTimeout(scheduleMount, 60);\n  setTimeout(scheduleMount, 260);\n}`;
const newBurst = `let mountTimer = 0;\nfunction scheduleMountBurst() {\n  scheduleMount();\n  clearTimeout(mountTimer);\n  mountTimer = setTimeout(scheduleMount, 90);\n}`;
if (!source.includes(oldBurst) && !source.includes("let mountTimer = 0;")) throw new Error("Mekik stability v1: scheduleMountBurst bulunamadi.");
source = source.replace(oldBurst, newBurst);

const oldEvents = `document.addEventListener("input", () => setTimeout(scheduleMountBurst, 0), true);\ndocument.addEventListener("change", () => setTimeout(scheduleMountBurst, 0), true);\ndocument.addEventListener("click", () => setTimeout(scheduleMountBurst, 0), true);\nwindow.addEventListener("hashchange", scheduleMountBurst);\nwindow.addEventListener("load", scheduleMountBurst);`;
const newEvents = `const relevantInput = (event) => {\n  const target = event.target;\n  if (!target || !target.closest) return false;\n  return !!target.closest(\"#page .m2-form,#page .m2-side-clearance-section,#page .m2-traverse-placeholder,#page [data-m2-view]\");\n};\ndocument.addEventListener("input", (event) => { if (isMekikFront() && relevantInput(event)) scheduleMountBurst(); }, true);\ndocument.addEventListener("change", (event) => { if (isMekikFront() && relevantInput(event)) scheduleMountBurst(); }, true);\ndocument.addEventListener("click", (event) => {\n  if (!isMekikFront()) return;\n  if (event.target?.closest?.('[data-m2-view="front"],.rafex-mekik-traverse-manual')) scheduleMountBurst();\n}, true);\nwindow.addEventListener("hashchange", scheduleMountBurst);\nwindow.addEventListener("load", scheduleMountBurst);`;
if (!source.includes(oldEvents) && !source.includes("const relevantInput = (event) =>")) throw new Error("Mekik stability v1: event bloğu bulunamadi.");
source = source.replace(oldEvents, newEvents);

const oldObserver = `new MutationObserver(scheduleMount).observe(document.documentElement, {\n  childList: true,\n  subtree: true,\n  attributes: true,\n  attributeFilter: ["class", "data-m2-module", "hidden"],\n});`;
const newObserver = `const mountObserver = new MutationObserver((mutations) => {\n  if (!isMekikFront()) return;\n  const relevant = mutations.some((mutation) => {\n    if (mutation.type === "attributes") {\n      const target = mutation.target;\n      return target?.id === "page" || target?.id === "m2Front" || target?.matches?.('[data-m2-view="front"]');\n    }\n    return Array.from(mutation.addedNodes || []).some((node) =>\n      node?.nodeType === 1 && (node.id === "m2Front" || node.querySelector?.("#m2Front"))\n    );\n  });\n  if (relevant) scheduleMount();\n});\nconst pageRoot = document.getElementById("page") || document.body;\nif (pageRoot) mountObserver.observe(pageRoot, {\n  childList: true,\n  subtree: true,\n  attributes: true,\n  attributeFilter: ["class", "data-m2-module", "data-rafex-free-context-system", "hidden"],\n});`;
if (!source.includes(oldObserver) && !source.includes("const mountObserver = new MutationObserver")) throw new Error("Mekik stability v1: observer bloğu bulunamadi.");
source = source.replace(oldObserver, newObserver);

const oldReplace = `  if (canvas.parentElement !== host || status.parentElement !== host || info.parentElement !== host || dimensions.parentElement !== host || host.childElementCount !== 4) {\n    host.replaceChildren(canvas, status, info, dimensions);\n    host.dataset.rafexMekikFrontGlb = "v2";\n  }`;
const newReplace = `  const missingCore = canvas.parentElement !== host || status.parentElement !== host || dimensions.parentElement !== host;\n  if (missingCore) {\n    const previousMinHeight = host.style.minHeight;\n    host.style.minHeight = Math.max(520, Math.round(host.getBoundingClientRect().height || 0)) + "px";\n    host.replaceChildren(canvas, status, info, dimensions);\n    host.dataset.rafexMekikFrontGlb = "v2";\n    requestAnimationFrame(() => { host.style.minHeight = previousMinHeight; });\n  } else {\n    host.dataset.rafexMekikFrontGlb = "v2";\n  }`;
if (!source.includes(oldReplace) && !source.includes("const missingCore =")) throw new Error("Mekik stability v1: replaceChildren bloğu bulunamadi.");
source = source.replace(oldReplace, newReplace);

fs.writeFileSync(target, source);
console.log("Mekik viewer stability v1: mount burst daraltildi, observer kapsamlandi, gereksiz host resetleri durduruldu.");
