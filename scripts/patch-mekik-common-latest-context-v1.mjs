import fs from "node:fs";

const target = "client/mekik-front-viewer.entry.js";
let source = fs.readFileSync(target, "utf8");

const oldGate = `  if (activePage) return activePage === "mekik2" || activePage === "mekik";`;
const newGate = `  if (activePage) {\n    const commonMekik = activePage === "free"\n      && page.classList.contains("rafex-free-drawing-page")\n      && (
        String(page.dataset?.rafexFreeContextSystem || "") === "mekik2"
        || document.querySelector('input[name="rafexUnifiedSystem"][value="mekik2"]:checked')
      );\n    return activePage === "mekik2" || activePage === "mekik" || commonMekik;\n  }`;

if (!source.includes(oldGate)) {
  if (source.includes('const commonMekik = activePage === "free"')) {
    console.log("Mekik common latest context v1 already present.");
    process.exit(0);
  }
  throw new Error("Mekik common latest context v1: isMekikFront active-page gate bulunamadi.");
}

source = source.replace(oldGate, newGate);
fs.writeFileSync(target, source);

for (const required of [
  'activePage === "free"',
  'rafex-free-drawing-page',
  'rafexFreeContextSystem',
  'rafexUnifiedSystem',
  'activePage === "mekik2" || activePage === "mekik" || commonMekik'
]) {
  if (!source.includes(required)) throw new Error(`Mekik common latest context v1 dogrulama eksigi: ${required}`);
}

console.log("Mekik common latest context v1: Ortak Cizim Mekik, standalone Mekik ile ayni travers/renk/yan bosluk/on gorunus runtime'ina baglandi.");
