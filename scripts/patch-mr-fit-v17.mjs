import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const viewerPath = path.join(root, "client", "mr-viewer.entry.js");
const portalPath = path.join(root, "portal.html");

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`MR v17: ${label} bulunamadi`);
  return source.replace(from, to);
}

let viewer = fs.readFileSync(viewerPath, "utf8");

viewer = replaceRequired(
  viewer,
  'const task = loader.loadAsync(`${PARTS[key]}?v=mr-assembly-4`).finally(() => draco.dispose());',
  'const task = loader.loadAsync(`${PARTS[key]}?v=mr-assembly-5`).finally(() => draco.dispose());',
  "MR GLB cache"
);

viewer = replaceRequired(
  viewer,
  `        // MR ayak-toplama GLB baglanti mantigi: travers iki 60 mm ayagin merkez eksenine oturur.
        // Boylece travers kulaklari ayak govdesinin icine 30'ar mm girer ve iki ucta ayni baglanti elde edilir.
        const beamLength = width + uprightWidth;
        const moduleX = module * framePitch + uprightWidth / 2;`,
  `        // MR ayak-toplama GLB montaji: travers kulaklari ayaga gercekten takilsin diye
        // GLB'nin tam boyunu iki ayagin dis yuzlerine kadar uzat. Raf ic boslugu yine width'tir.
        const beamOverlap = uprightWidth;
        const beamLength = width + beamOverlap * 2;
        const moduleX = module * framePitch + uprightWidth;`,
  "travers ayak oturmasi"
);

viewer = replaceRequired(
  viewer,
  `            beam.scale.set(beamLength / traverse.size.x, traverseHeight / traverse.size.y, 1);
            if (side === "front") {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + beamLength, levelY, beamDepth);
            } else {
              beam.position.set(moduleX, levelY, Math.max(0, depth - beamDepth));
            }`,
  `            beam.scale.set(beamLength / traverse.size.x, traverseHeight / traverse.size.y, 1);
            if (side === "front") {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width + beamOverlap, levelY, beamDepth);
            } else {
              beam.position.set(moduleX - beamOverlap, levelY, Math.max(0, depth - beamDepth));
            }`,
  "travers boyu ve konumu"
);

viewer = replaceRequired(
  viewer,
  `              shelf.scale.set(pieceWidth / tray.size.x, 1, depth / tray.size.z);
              shelf.rotation.x = Math.PI;
              shelf.position.set(moduleX + cursor, levelY + traverseHeight + tray.size.y - 50, depth);`,
  `              // Tava: onden 10 mm, arkadan 10 mm kisalt ve 10 mm yukari kaldir.
              const trayDepth = Math.max(1, depth - 20);
              shelf.scale.set(pieceWidth / tray.size.x, 1, trayDepth / tray.size.z);
              shelf.rotation.x = Math.PI;
              shelf.position.set(moduleX + cursor, levelY + traverseHeight + tray.size.y - 40, depth - 10);`,
  "tava derinligi ve kotu"
);

fs.writeFileSync(viewerPath, viewer);

let portal = fs.readFileSync(portalPath, "utf8");
portal = portal.replace(/\/mr-viewer\.js\?v=mr-system-16/g, "/mr-viewer.js?v=mr-system-17");
fs.writeFileSync(portalPath, portal);

console.log("MR v17: traversler ayaga tam oturtuldu; tavalar 10+10 mm kisaltildi ve 10 mm yukari alindi.");
