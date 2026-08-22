import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const viewerPath = path.join(root, "client", "mr-viewer.entry.js");
const portalPath = path.join(root, "portal.html");

let viewer = fs.readFileSync(viewerPath, "utf8");

const wrong = `            if (side === "front") {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width, levelY, beamDepth);
            } else {
              beam.position.set(moduleX, levelY, Math.max(0, depth - beamDepth));
            }`;

const corrected = `            // ZS travers profili rafın içine bakmalı. Ön ve arka traversi
            // kaynak GLB'nin yönüne göre birbirine bakacak şekilde aynala.
            if (side === "front") {
              beam.position.set(moduleX, levelY, 0);
            } else {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width, levelY, depth);
            }`;

if (viewer.includes(wrong)) {
  viewer = viewer.replace(wrong, corrected);
  fs.writeFileSync(viewerPath, viewer);
  console.log("MR v18: travers yönleri düzeltildi.");
} else if (viewer.includes(corrected)) {
  console.log("MR v18: travers yönleri zaten doğru.");
} else {
  throw new Error("MR v18: travers yerleşim bloğu bulunamadı.");
}

// Yeni geometri eski tarayıcı önbelleğiyle karışmasın.
if (fs.existsSync(portalPath)) {
  let portal = fs.readFileSync(portalPath, "utf8");
  const next = portal.replace(/\/mr-viewer\.js\?v=mr-system-\d+/g, "/mr-viewer.js?v=mr-system-18");
  if (next !== portal) {
    fs.writeFileSync(portalPath, next);
    console.log("MR v18: viewer cache sürümü yükseltildi.");
  }
}
