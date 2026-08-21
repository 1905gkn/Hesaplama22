import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "worker/index.js");
let source = fs.readFileSync(workerPath, "utf8");

const oldHelper = `function insertBeforeLastScriptClose(htmlSource, scriptSource) {
  const marker = "</script>";
  const markerIndex = htmlSource.lastIndexOf(marker);
  if (markerIndex === -1) return htmlSource;`;

const newHelper = `function insertBeforeLastScriptClose(htmlSource, scriptSource) {
  const marker = "</script>";
  let markerIndex = htmlSource.lastIndexOf(marker);
  const firstRuntimePatch = htmlSource.search(/<script\\s+data-rafex-/i);
  if (firstRuntimePatch >= 0) {
    markerIndex = htmlSource.lastIndexOf(marker, firstRuntimePatch);
  }
  if (markerIndex === -1) return htmlSource;`;

if (source.includes(oldHelper)) {
  source = source.replace(oldHelper, newHelper);
} else if (!source.includes("const firstRuntimePatch = htmlSource.search")) {
  throw new Error("Runtime insertion order: hedef helper bulunamadi");
}

fs.writeFileSync(workerPath, source);
console.log("Runtime insertion order: Mekik ana uygulama betigine sabitlendi.");
