import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "client", "mekik-front-viewer.entry.js");
let source = fs.readFileSync(target, "utf8");

const marker = "RAFEX_COMMON_MEKIK_FIRST_LEVEL_REALISM_V1";
if (source.includes(marker)) {
  console.log("Common Mekik first-level realism patch already applied.");
  process.exit(0);
}

const before = `    const bracketTopOffset = this.models.traverse.topOffset;
    for (let level = 0; level < config.levels; level += 1) {
      const supportZ = config.firstLevelHeight + level * config.levelSpacing;`;
const after = `    // ${marker}: İlk kat yüksekliği taşıyıcı/palet alt kotudur. GLB braketinin
    // görsel üst sınırı bu mühendislik kotuna ikinci kez eklenmemelidir.
    for (let level = 0; level < config.levels; level += 1) {
      const supportZ = config.firstLevelHeight + level * config.levelSpacing;`;

if (!source.includes(before)) throw new Error("Mekik seviye yerleşim başlangıcı bulunamadı.");
source = source.replace(before, after);

const palletBefore = `        pallet.position.set(bayCenterX, 0, supportZ + bracketTopOffset);
        this.root.add(pallet);
        if (bay === 0) this.visualPalletBottomZ[level] = pallet.position.z;

        if (boxHeight > 0) {
          const box = new THREE.Mesh(new THREE.BoxGeometry(config.palletWidth, config.palletDepth, boxHeight), boxMaterial);
          box.name = \`Mekik Kutu G\${bay + 1} K\${level + 1}\`;
          box.castShadow = false;
          box.receiveShadow = false;
          box.position.set(bayCenterX, 0, supportZ + bracketTopOffset + palletBodyHeight + boxHeight / 2);`;
const palletAfter = `        pallet.position.set(bayCenterX, 0, supportZ);
        this.root.add(pallet);
        if (bay === 0) this.visualPalletBottomZ[level] = supportZ;

        if (boxHeight > 0) {
          const box = new THREE.Mesh(new THREE.BoxGeometry(config.palletWidth, config.palletDepth, boxHeight), boxMaterial);
          box.name = \`Mekik Kutu G\${bay + 1} K\${level + 1}\`;
          box.castShadow = false;
          box.receiveShadow = false;
          box.position.set(bayCenterX, 0, supportZ + palletBodyHeight + boxHeight / 2);`;

if (!source.includes(palletBefore)) throw new Error("Mekik palet/braket ofset bloğu bulunamadı.");
source = source.replace(palletBefore, palletAfter);

fs.writeFileSync(target, source);
console.log("Common Mekik first-level visual ratio aligned with engineering elevations.");
