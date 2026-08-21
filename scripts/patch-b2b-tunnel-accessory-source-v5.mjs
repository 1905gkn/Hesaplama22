import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const viewerPath = path.join(root, "client", "b2b-viewer.entry.js");
const accessoriesPath = path.join(root, "client", "b2b-accessories.js");

let viewer = fs.readFileSync(viewerPath, "utf8");
let accessories = fs.readFileSync(accessoriesPath, "utf8");

// Tunnel: 0..tunnelHeight araliginda kalan HER traversi kaldir.
viewer = viewer.replaceAll(
  'if (this.options.tunnelHeight > 0 && this.traverseTop(level) <= this.options.tunnelHeight) continue;',
  'if (this.options.tunnelHeight > 0 && this.traverseBottom(level) < this.options.tunnelHeight) continue;'
);

if (!viewer.includes('this.traverseBottom(level) < this.options.tunnelHeight')) {
  throw new Error('Tunnel travers alt-kot filtresi viewer kaynaginda uygulanamadi.');
}

// Aksesuarlar: ZEMIN Palet Dayama gercek level 0 olarak calissin, zeminde ve +250 mm'de iki adet olsun.
// Ayrica H Travers/Tava/Palet Dayama en ust K seviyesinde de cizilebilsin.
const oldLevelBlock = `          const level = Math.max(0, Math.min(14, Math.round(Number(humanLevel) || 1) - 1));\n          const maxTraverse = this.options.firstPalletPosition === 'traverse' ? this.options.levels : Math.max(0, this.options.levels - 1);\n          if (level >= maxTraverse) return;\n          if (this.options.tunnelHeight > 0 && this.traverseTop(level) <= this.options.tunnelHeight) return;\n          const supportTop = this.traverseBottom(level) + this.options.traverseHeight;`;
const newLevelBlock = `          const numericLevel = Number(humanLevel);\n          if (accessory.type === 'palletStop' && numericLevel === 0 && this.models.palletStop) {\n            [0, 250].forEach((baseHeight, groundIndex) => {\n              const stop = this.accessoryModel(this.models.palletStop, { x:clearWidth, y:163 * depthScale, z:90 }, false);\n              stop.name = groundIndex === 0 ? 'Palet Dayama ZEMIN' : 'Palet Dayama ZEMIN +250';\n              stop.position.set(clearLeft - 4 * sectionScale, 42 * depthScale, -(baseHeight + 45));\n              section.add(stop);\n            });\n            return;\n          }\n          const level = Math.max(0, Math.min(14, Math.round(Number(humanLevel) || 1) - 1));\n          if (level >= this.options.levels) return;\n          if (this.options.tunnelHeight > 0 && this.traverseTop(level) <= this.options.tunnelHeight) return;\n          const supportTop = this.traverseBottom(level) + this.options.traverseHeight;`;

if (accessories.includes(oldLevelBlock)) {
  accessories = accessories.replace(oldLevelBlock, newLevelBlock);
} else if (!accessories.includes("Palet Dayama ZEMIN +250")) {
  throw new Error('Aksesuar level blogu beklenen yapida bulunamadi.');
}

if (!accessories.includes("Palet Dayama ZEMIN +250") || !accessories.includes('if (level >= this.options.levels) return;')) {
  throw new Error('Zemin Palet Dayama / en ust aksesuar seviyesi uygulanamadi.');
}

fs.writeFileSync(viewerPath, viewer);
fs.writeFileSync(accessoriesPath, accessories);
console.log('SOURCE v5: tunnel alt traversleri 0..tunnelHeight araliginda kaldirildi; Palet Dayama ZEMIN +250 ve en ust aksesuar seviyesi aktif.');
