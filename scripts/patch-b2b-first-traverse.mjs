import fs from "node:fs";
import path from "node:path";

const viewerFile = path.join(process.cwd(), "client/b2b-viewer.entry.js");
let source = fs.readFileSync(viewerFile, "utf8");
const oldLine = '      const firstLevelHeight=this.palletHeightAt(0)+this.options.palletTraverseGap+this.options.traverseHeight;';
const newLine = '      const firstLevelHeight=this.options.firstPalletPosition === "traverse" ? this.options.firstFloorGap + this.options.traverseHeight : this.palletHeightAt(0)+this.options.palletTraverseGap+this.options.traverseHeight;';
if (source.includes(oldLine)) source = source.replace(oldLine, newLine);
else if (!source.includes(newLine)) throw new Error("B2B Z+TRAVERS ölçü satırı bulunamadı.");
fs.writeFileSync(viewerFile, source);

// B2B viewer dosya adı aynı kaldığında tarayıcı eski bundle'ı cache'ten gösterebiliyor.
// Travers üstü ilk ölçü düzeltmesinin canlıda hemen görünmesi için sürüm parametresini sabit olarak yenile.
const portalFile = path.join(process.cwd(), "portal.html");
let portal = fs.readFileSync(portalFile, "utf8");
const viewerSrcPattern = /\/b2b-viewer\.js\?v=[^"']+/g;
const viewerSrc = "/b2b-viewer.js?v=b2b-first-traverse-340-20260819";
if (viewerSrcPattern.test(portal)) {
  portal = portal.replace(viewerSrcPattern, viewerSrc);
} else if (!portal.includes(viewerSrc)) {
  throw new Error("Portal B2B viewer script sürümü bulunamadı.");
}
fs.writeFileSync(portalFile, portal);
