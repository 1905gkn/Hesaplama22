import fs from "node:fs";
import path from "node:path";

const viewerPath = path.join(process.cwd(), "client", "mr-viewer.entry.js");
let viewer = fs.readFileSync(viewerPath, "utf8");

const oldBlock = `              // Leave 10 mm clearance at the front and back and lift the tray 10 mm.
              const trayDepth = Math.max(1, depth - 20);
              shelf.scale.set(pieceWidth / tray.size.x, 1, trayDepth / tray.size.z);
              shelf.rotation.x = Math.PI;
              shelf.position.set(moduleX + cursor, levelY + traverseHeight + tray.size.y - 40, depth - 10);`;

const newBlock = `              // MR tava: onden 15 mm, arkadan 10 mm bosluk; tava 10 mm yukarida.
              const trayDepth = Math.max(1, depth - 25);
              shelf.scale.set(pieceWidth / tray.size.x, 1, trayDepth / tray.size.z);
              shelf.rotation.x = Math.PI;
              shelf.position.set(moduleX + cursor, levelY + traverseHeight + tray.size.y - 40, depth - 10);`;

if (!viewer.includes(newBlock)) {
  if (!viewer.includes(oldBlock)) throw new Error("MR v19: 10+10 mm tava blogu bulunamadi");
  viewer = viewer.replace(oldBlock, newBlock);
}

fs.writeFileSync(viewerPath, viewer);
console.log("MR v19: tava boslugu on 15 mm / arka 10 mm, yukseklik +10 mm olarak kilitlendi.");
