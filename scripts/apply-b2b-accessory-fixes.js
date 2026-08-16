const fs = require('node:fs');

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`${label} bulunamadı.`);
  return source.replace(from, to);
}

const buildPath = 'scripts/build.sh';
let build = fs.readFileSync(buildPath, 'utf8');

build = replaceRequired(
  build,
  'const ASSET_VERSION = "b2b-accessories-599";',
  'const ASSET_VERSION = "b2b-accessories-600";',
  'B2B aksesuar asset sürümü',
);

const nameFixes = [
  ['stop.name = `Palet Dayama K${humanLevel}`;', 'stop.name = "Palet Dayama K" + humanLevel;'],
  ['h.name = `H Travers K${humanLevel}`;', 'h.name = "H Travers K" + humanLevel;'],
  ['tray.name = `Tava K${humanLevel}-${pieceIndex + 1} · ${pieceWidth} mm`;', 'tray.name = "Tava K" + humanLevel + "-" + (pieceIndex + 1) + " · " + pieceWidth + " mm";'],
];
for (const [from, to] of nameFixes) build = replaceRequired(build, from, to, `Aksesuar isim satırı: ${from}`);

build = replaceRequired(
  build,
  '    for(let rowIndex=0;rowIndex<rowCount;rowIndex+=1){\n      const row=new THREE.Group();row.name=`B2B ${rowIndex+1}. sıra`;',
  '    for(let rowIndex=0;rowIndex<rowCount;rowIndex+=1){\n      this.accessoryRowIndex=rowIndex;\n      const row=new THREE.Group();row.name=`B2B ${rowIndex+1}. sıra`;',
  'B2B sıra indeksi',
);

build = replaceRequired(
  build,
  '    const depthInner = Math.max(100, frameDepth - 30);',
  '    const sourceBetweenDepth = 1060.4;\n    const betweenDepth = sourceBetweenDepth * depthScale;\n    const betweenCenterY = ((SOURCE_TRAVERSE_FRONT_OFFSET + SOURCE_TRAVERSE_BACK_OFFSET) / 2) * depthScale;\n    const betweenStartY = betweenCenterY - betweenDepth / 2;',
  'Travers arası aksesuar derinliği',
);

build = replaceRequired(
  build,
  '          const stop = this.accessoryModel(this.models.palletStop, { x:clearWidth, y:163 * depthScale, z:90 }, false);',
  '          if (this.options.rowType === "double" && this.accessoryRowIndex !== 0) return;\n          const stopDepth = this.options.rowType === "double"\n            ? Math.max(163 * depthScale, this.options.rowGap + 60 * depthScale)\n            : 163 * depthScale;\n          const stop = this.accessoryModel(this.models.palletStop, { x:clearWidth, y:stopDepth, z:90 }, false);',
  'Çift sıra palet dayama adedi',
);

build = replaceRequired(
  build,
  '          stop.position.set(clearLeft - 4 * sectionScale, 42 * depthScale, -(supportTop + 40));',
  '          const stopY = this.options.rowType === "double" ? frameDepth - 30 * depthScale : 42 * depthScale;\n          stop.position.set(clearLeft - 4 * sectionScale, stopY, -(supportTop + 40));',
  'Çift sıra palet dayama orta konumu',
);

build = replaceRequired(
  build,
  '          const h = this.accessoryModel(this.models.hTraverse, { x:targetX, y:depthInner, z:89 }, true);',
  '          const h = this.accessoryModel(this.models.hTraverse, { x:targetX, y:betweenDepth, z:89 }, true);',
  'H travers boyu',
);

build = replaceRequired(
  build,
  '          h.position.set(clearLeft + 50 * sectionScale, 162 * depthScale, -this.traverseBottom(level));',
  '          h.position.set(clearLeft + 50 * sectionScale, betweenStartY, -this.traverseBottom(level));',
  'H travers travers arası konumu',
);

build = replaceRequired(
  build,
  '            const tray = this.accessoryModel(this.models.tray, { x:pieceWidth, y:depthInner, z:45 }, true);',
  '            const tray = this.accessoryModel(this.models.tray, { x:pieceWidth, y:betweenDepth, z:45 }, true);',
  'Tava sabit boyu',
);

build = replaceRequired(
  build,
  '            tray.position.set(clearLeft + cursor, 176 * depthScale, -(this.traverseBottom(level) + 65));',
  '            tray.position.set(clearLeft + cursor, betweenStartY, -(this.traverseBottom(level) + 65));',
  'Tava travers arası konumu',
);

build = replaceRequired(
  build,
  '    const full = Math.floor(width / trayWidth);\n    const remainder = width - full * trayWidth;\n    const pieces = Array.from({ length:full }, () => trayWidth);\n    if (remainder >= 50) pieces.push(remainder);\n    return pieces;',
  '    const pieces = [];\n    let remaining = width;\n    while (remaining >= trayWidth) {\n      pieces.push(trayWidth);\n      remaining -= trayWidth;\n    }\n    if (remaining >= 50) pieces.push(remaining);\n    return pieces;',
  'Tava parça formülü',
);

fs.writeFileSync(buildPath, build);

const uiPath = 'client/b2b-accessories.js';
let ui = fs.readFileSync(uiPath, 'utf8');
ui = replaceRequired(
  ui,
  "  const VERSION = 'b2b-accessories-v1';",
  "  const VERSION = 'b2b-accessories-v2';",
  'Aksesuar arayüz sürümü',
);
ui = replaceRequired(
  ui,
  '    const full = Math.floor(width / tray);\n    const remainder = width - full * tray;\n    const pieces = full > 0 ? [{ width: tray, count: full }] : [];\n    if (remainder >= 50) pieces.push({ width: remainder, count: 1 });\n    return { clearWidth: width, trayWidth: tray, full, remainder, pieces, ignoredRemainder: remainder > 0 && remainder < 50 ? remainder : 0 };',
  '    const pieces = [];\n    let remaining = width;\n    let full = 0;\n    while (remaining >= tray) { full += 1; remaining -= tray; }\n    if (full > 0) pieces.push({ width: tray, count: full });\n    const remainder = remaining;\n    if (remainder >= 50) pieces.push({ width: remainder, count: 1 });\n    return { clearWidth: width, trayWidth: tray, full, remainder, pieces, ignoredRemainder: remainder > 0 && remainder < 50 ? remainder : 0 };',
  'Tava arayüz parça formülü',
);
fs.writeFileSync(uiPath, ui);

console.log('B2B aksesuar yerleşimi, tava formülü ve çift sıra palet dayama düzeltmeleri uygulandı.');
