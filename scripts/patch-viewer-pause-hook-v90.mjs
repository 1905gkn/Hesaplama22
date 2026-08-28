import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "scripts/patch-viewer-lifecycle-performance-v30.mjs");
let source = fs.readFileSync(file, "utf8");
const hook = 'await import("./patch-viewer-pause-v90.mjs");';
if (!source.includes(hook)) source += `\n${hook}\n`;
fs.writeFileSync(file, source);
console.log("v90: viewer lifecycle sonuna pause hook baglandi.");
