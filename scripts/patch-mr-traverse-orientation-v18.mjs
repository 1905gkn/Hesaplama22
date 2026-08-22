import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const viewerPath = path.join(root, "client", "mr-viewer.entry.js");
const portalPath = path.join(root, "portal.html");

let viewer = fs.readFileSync(viewerPath, "utf8");

// v16 ayak ekseni yamasindan sonraki production kaynak.
const wrongAxis = `            beam.scale.set(beamLength / traverse.size.x, traverseHeight / traverse.size.y, 1);
            if (side === "front") {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + beamLength, levelY, beamDepth);
            } else {
              beam.position.set(moduleX, levelY, Math.max(0, depth - beamDepth));
            }`;

// Eski kaynak icin geriye donuk destek.
const wrongLegacy = `            beam.scale.set(width / traverse.size.x, traverseHeight / traverse.size.y, 1);
            if (side === "front") {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width, levelY, beamDepth);
            } else {
              beam.position.set(moduleX, levelY, Math.max(0, depth - beamDepth));
            }`;

const correctedAxis = `            beam.scale.set(beamLength / traverse.size.x, traverseHeight / traverse.size.y, 1);
            // ZS traverslerin braket/kanca yuzu disari degil raf icine bakar.
            // On travers kaynak yonunde, arka travers 180 derece cevrilmis olarak karsilikli durur.
            if (side === "front") {
              beam.position.set(moduleX, levelY, 0);
            } else {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + beamLength, levelY, depth);
            }`;

const correctedLegacy = `            beam.scale.set(width / traverse.size.x, traverseHeight / traverse.size.y, 1);
            // ZS traverslerin braket/kanca yuzu disari degil raf icine bakar.
            // On travers kaynak yonunde, arka travers 180 derece cevrilmis olarak karsilikli durur.
            if (side === "front") {
              beam.position.set(moduleX, levelY, 0);
            } else {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width, levelY, depth);
            }`;

if (viewer.includes(wrongAxis)) {
  viewer = viewer.replace(wrongAxis, correctedAxis);
  fs.writeFileSync(viewerPath, viewer);
  console.log("MR v18: travers yonleri ayak eksenlerinde duzeltildi.");
} else if (viewer.includes(wrongLegacy)) {
  viewer = viewer.replace(wrongLegacy, correctedLegacy);
  fs.writeFileSync(viewerPath, viewer);
  console.log("MR v18: travers yonleri eski kaynakta duzeltildi.");
} else if (viewer.includes(correctedAxis) || viewer.includes(correctedLegacy)) {
  console.log("MR v18: travers yonleri zaten dogru.");
} else {
  throw new Error("MR v18: travers yerlesim blogu bulunamadi.");
}

// Yeni geometri eski tarayici onbellegiyle karismasin.
if (fs.existsSync(portalPath)) {
  let portal = fs.readFileSync(portalPath, "utf8");
  const next = portal.replace(/\/mr-viewer\.js\?v=mr-system-\d+/g, "/mr-viewer.js?v=mr-system-18");
  if (next !== portal) {
    fs.writeFileSync(portalPath, next);
    console.log("MR v18: viewer cache surumu yukseltilidi.");
  }
}
