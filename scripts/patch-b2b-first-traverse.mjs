import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "client/b2b-viewer.entry.js");
let source = fs.readFileSync(file, "utf8");
const oldLine = '      const firstLevelHeight=this.palletHeightAt(0)+this.options.palletTraverseGap+this.options.traverseHeight;';
const newLine = '      const firstLevelHeight=this.options.firstPalletPosition === "traverse" ? this.options.firstFloorGap + this.options.traverseHeight : this.palletHeightAt(0)+this.options.palletTraverseGap+this.options.traverseHeight;';
if (source.includes(oldLine)) source = source.replace(oldLine, newLine);
else if (!source.includes(newLine)) throw new Error("B2B Z+TRAVERS ölçü satırı bulunamadı.");
fs.writeFileSync(file, source);
