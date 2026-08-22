import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const viewerPath = path.join(root, "client", "mr-viewer.entry.js");
const portalPath = path.join(root, "portal.html");

const originalTraverseScale = `            beam.scale.set(width / traverse.size.x, traverseHeight / traverse.size.y, 1);`;
const fittedTraverseScale = `            // Extend the ZS traverse to the upright centre lines so the GLB end
            // brackets engage the MR60 posts instead of stopping in the clear bay.
            const beamOverlap = uprightWidth / 2;
            beam.scale.set((width + beamOverlap * 2) / traverse.size.x, traverseHeight / traverse.size.y, 1);`;

const wrongTraverse = `            if (side === "front") {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width, levelY, beamDepth);
            } else {
              beam.position.set(moduleX, levelY, Math.max(0, depth - beamDepth));
            }`;

const previousCorrectTraverse = `            // 773a baseline follow-up: ZS travers end brackets must mount to the
            // MR Ayak Toplama GLB in the same handed orientation on both sides.
            if (side === "front") {
              beam.position.set(moduleX, levelY, 0);
            } else {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width, levelY, depth);
            }`;

const correctTraverse = `            // 773a baseline follow-up: ZS travers end brackets must mount to the
            // MR Ayak Toplama GLB in the same handed orientation on both sides.
            // The beam reaches the centre of each 60 mm upright (30 mm engagement per side).
            if (side === "front") {
              beam.position.set(moduleX - beamOverlap, levelY, 0);
            } else {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width + beamOverlap, levelY, depth);
            }`;

const originalTray = `              shelf.scale.set(pieceWidth / tray.size.x, 1, depth / tray.size.z);
              shelf.rotation.x = Math.PI;
              shelf.position.set(moduleX + cursor, levelY + traverseHeight + tray.size.y - 50, depth);`;

const fittedTray = `              // Leave 10 mm clearance at the front and back and lift the tray 10 mm.
              const trayDepth = Math.max(1, depth - 20);
              shelf.scale.set(pieceWidth / tray.size.x, 1, trayDepth / tray.size.z);
              shelf.rotation.x = Math.PI;
              shelf.position.set(moduleX + cursor, levelY + traverseHeight + tray.size.y - 40, depth - 10);`;

let viewer = fs.readFileSync(viewerPath, "utf8");

if (viewer.includes(originalTraverseScale)) {
  viewer = viewer.replace(originalTraverseScale, fittedTraverseScale);
} else if (!viewer.includes(fittedTraverseScale)) {
  throw new Error("MR 773a v2: beklenen travers olcekleme satiri bulunamadi.");
}

if (viewer.includes(wrongTraverse)) {
  viewer = viewer.replace(wrongTraverse, correctTraverse);
} else if (viewer.includes(previousCorrectTraverse)) {
  viewer = viewer.replace(previousCorrectTraverse, correctTraverse);
} else if (!viewer.includes(correctTraverse)) {
  throw new Error("MR 773a v2: beklenen travers yerlesim blogu bulunamadi.");
}

if (viewer.includes(originalTray)) {
  viewer = viewer.replace(originalTray, fittedTray);
} else if (!viewer.includes(fittedTray)) {
  throw new Error("MR 773a v2: beklenen tava yerlesim blogu bulunamadi.");
}

fs.writeFileSync(viewerPath, viewer);
console.log("MR 773a v2: traversler ayak merkezine 30 mm takilacak sekilde uzatildi ve montaj yonu korundu.");
console.log("MR 773a v2: tavalar onden/arkadan 10 mm kisaltildi ve 10 mm yukari alindi.");

let portal = fs.readFileSync(portalPath, "utf8");
const runtimeMarker = 'data-rafex-mr-773a-followup="v1"';

if (!portal.includes(runtimeMarker)) {
  const saveInsertPattern = /form\.insertAdjacentHTML\("afterend",`<div class="mr-rack-save">[\s\S]*?<\/div>`\);/;
  const saveMatch = portal.match(saveInsertPattern);
  if (!saveMatch) throw new Error("MR 773a v1: Rafı Kaydet blogu bulunamadi.");

  const relocateRuntime = `${saveMatch[0]}const mrSavePanel773a=page.querySelector(".mr-rack-save"),mrUprightTypeField773a=$("mrUprightType")?.closest(".mr-profile-field"),mrTraverseTypeField773a=$("mrTraverseType")?.closest(".mr-profile-field");if(mrSavePanel773a&&mrUprightTypeField773a&&mrTraverseTypeField773a){let mrProfileGrid773a=mrSavePanel773a.querySelector(".mr-save-profile-grid");if(!mrProfileGrid773a){mrProfileGrid773a=document.createElement("div");mrProfileGrid773a.className="mr-save-profile-grid";mrSavePanel773a.prepend(mrProfileGrid773a)}mrProfileGrid773a.append(mrUprightTypeField773a,mrTraverseTypeField773a)}`;
  portal = portal.replace(saveInsertPattern, relocateRuntime);

  const style = `\n    <style ${runtimeMarker}>.mr-save-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:2px}.mr-save-profile-grid .mr-profile-field{display:grid;gap:5px;color:#425148;font-size:9px;font-weight:800}.mr-save-profile-grid select{width:100%;min-height:40px;padding:9px 30px 9px 10px;border:1px solid #d8e1db;border-radius:8px;background:#f9fbf9;color:#173c2d;font:inherit;font-weight:850}.mr-save-profile-grid .mr-profile-field small{display:block;margin-top:0;color:#6b756f;font-size:8px;line-height:1.35}@media(max-width:520px){.mr-save-profile-grid{grid-template-columns:1fr}}</style>\n`;
  if (!portal.includes("</head>")) throw new Error("MR 773a v1: head kapanisi bulunamadi.");
  portal = portal.replace("</head>", `${style}</head>`);
}

portal = portal.replace(/\/mr-viewer\.js\?v=[^\"'`<\s]+/g, "/mr-viewer.js?v=mr-773a-followup-2");
fs.writeFileSync(portalPath, portal);
console.log("MR 773a v1: Ayak tipi ve Travers tipi Rafı Kaydet butonunun ustune tasindi.");
