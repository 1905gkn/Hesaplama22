const fs = require('node:fs');

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`${label} bulunamadı.`);
  return source.replace(from, to);
}

const viewerPath = 'client/b2b-viewer.entry.js';
let viewer = fs.readFileSync(viewerPath, 'utf8');
viewer = replaceRequired(
  viewer,
  '    for(let rowIndex=0;rowIndex<rowCount;rowIndex+=1){\n      const row=new THREE.Group();row.name=`B2B ${rowIndex+1}. sıra`;',
  '    for(let rowIndex=0;rowIndex<rowCount;rowIndex+=1){\n      this.accessoryRowIndex=rowIndex;\n      const row=new THREE.Group();row.name=`B2B ${rowIndex+1}. sıra`;',
  'B2B sıra indeksi',
);
fs.writeFileSync(viewerPath, viewer);

const buildPath = 'scripts/build.sh';
let build = fs.readFileSync(buildPath, 'utf8');

build = replaceRequired(
  build,
  'const ASSET_VERSION = "b2b-accessories-599";',
  'const ASSET_VERSION = "b2b-accessories-601";',
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
  '  accessoryModel(source, targetSize, swapXY = false) {',
  '  accessoryModel(source, targetSize, swapXY = false, rotate180 = false) {',
  'Aksesuar model yön parametresi',
);
build = replaceRequired(
  build,
  '    if (swapXY) oriented.rotation.z = -Math.PI / 2;',
  '    if (swapXY) oriented.rotation.z = -Math.PI / 2;\n    if (rotate180) oriented.rotation.z += Math.PI;',
  'Aksesuar 180 derece yönü',
);

build = replaceRequired(
  build,
  '    return oriented;\n  }\n\n  trayPiecePlan(clearWidth, requestedWidth) {',
  `    return oriented;
  }

  doubleRowPalletStopModel(source, targetX, rowGap, targetZ = 90) {
    const raw = source.clone(true);
    raw.updateMatrixWorld(true);
    const group = new THREE.Group();
    const gap = Math.max(0, Number(rowGap) || 0);
    const profileDepth = Math.min(80, gap);
    const sideDepth = Math.max(0, (gap - profileDepth) / 2);
    const sourceWidth = 2700;
    const sx = targetX / sourceWidth;
    let profilePart = null;
    const lugParts = [];

    raw.traverse((part) => {
      if (!part.isMesh || !part.geometry) return;
      const name = (part.name || "").toLocaleUpperCase("tr-TR");
      if (name.includes("TC PROFIL")) profilePart = part;
      else if (name.includes("L PARCA")) lugParts.push(part);
    });

    if (!profilePart) return this.accessoryModel(source, { x:targetX, y:gap, z:targetZ }, false);

    const cloneMaterials = (part) => {
      const materials = Array.isArray(part.material) ? part.material : [part.material];
      const adjusted = materials.map((base) => {
        const material = base.clone();
        material.metalness = Math.max(.18, Number(material.metalness) || 0);
        material.roughness = Math.max(.42, Number(material.roughness) || 0);
        return material;
      });
      return Array.isArray(part.material) ? adjusted : adjusted[0];
    };

    const addMappedMesh = (part, yFrom, yTo) => {
      const targetDepth = Math.max(0, yTo - yFrom);
      if (targetDepth <= .01) return;
      const geometry = part.geometry.clone();
      geometry.applyMatrix4(part.matrixWorld);
      geometry.computeBoundingBox();
      const bounds = geometry.boundingBox;
      const sourceDepth = Math.max(1, bounds.max.y - bounds.min.y);
      const sourceHeight = Math.max(1, bounds.max.z - bounds.min.z);
      geometry.translate(0, -bounds.min.y, -bounds.min.z);
      geometry.scale(sx, targetDepth / sourceDepth, -targetZ / sourceHeight);
      geometry.translate(0, yFrom, 0);
      const mesh = new THREE.Mesh(geometry, cloneMaterials(part));
      mesh.name = part.name || "Palet Dayama Parçası";
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    };

    addMappedMesh(profilePart, sideDepth, sideDepth + profileDepth);
    lugParts.forEach((part) => {
      addMappedMesh(part, 0, sideDepth);
      addMappedMesh(part, sideDepth + profileDepth, gap);
    });
    return group;
  }

  trayPiecePlan(clearWidth, requestedWidth) {`,
  'Çift sıra palet dayama model yöntemi',
);

build = replaceRequired(
  build,
  '          ...(item.type === "tray" ? { width: [200,250,300].includes(Number(item.width)) ? Number(item.width) : 300 } : {}),',
  '          ...(item.type === "tray" ? { width: [200,250].includes(Number(item.width)) ? Number(item.width) : 250 } : {}),',
  'Tava normalize ölçüleri',
);

build = replaceRequired(
  build,
  '    const depthInner = Math.max(100, frameDepth - 30);',
  '    const betweenDepth = 1100;\n    const betweenCenterY = ((SOURCE_TRAVERSE_FRONT_OFFSET + SOURCE_TRAVERSE_BACK_OFFSET) / 2) * depthScale;\n    const betweenStartY = betweenCenterY - betweenDepth / 2;',
  'Travers arası aksesuar derinliği',
);

build = replaceRequired(
  build,
  '          const stop = this.accessoryModel(this.models.palletStop, { x:clearWidth, y:163 * depthScale, z:90 }, false);',
  '          if (this.options.rowType === "double" && this.accessoryRowIndex !== 0) return;\n          const doubleRowStop = this.options.rowType === "double";\n          const stop = doubleRowStop\n            ? this.doubleRowPalletStopModel(this.models.palletStop, clearWidth, this.options.rowGap, 90)\n            : this.accessoryModel(this.models.palletStop, { x:clearWidth, y:163 * depthScale, z:90 }, false);',
  'Çift sıra palet dayama adedi ve modeli',
);

build = replaceRequired(
  build,
  '          stop.position.set(clearLeft - 4 * sectionScale, 42 * depthScale, -(supportTop + 40));',
  '          const stopY = doubleRowStop ? frameDepth : 42 * depthScale;\n          stop.position.set(clearLeft - 4 * sectionScale, stopY, -(supportTop + 40));',
  'Çift sıra palet dayama orta konumu',
);

build = replaceRequired(
  build,
  '          const h = this.accessoryModel(this.models.hTraverse, { x:targetX, y:depthInner, z:89 }, true);',
  '          const h = this.accessoryModel(this.models.hTraverse, { x:targetX, y:betweenDepth, z:89 }, true, true);',
  'H travers boyu ve kanca yönü',
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
  'Tava 1100 mm sabit boyu',
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
  '    const fillerWidths = [150,100,75];\n    let bestPieces = [];\n    let bestFilled = -1;\n    const maxPrimary = Math.floor(width / trayWidth);\n    for (let primary = maxPrimary; primary >= 0; primary -= 1) {\n      const remainder = width - primary * trayWidth;\n      for (let n150 = Math.floor(remainder / 150); n150 >= 0; n150 -= 1) {\n        const after150 = remainder - n150 * 150;\n        for (let n100 = Math.floor(after150 / 100); n100 >= 0; n100 -= 1) {\n          const after100 = after150 - n100 * 100;\n          const n75 = Math.floor(after100 / 75);\n          const filled = primary * trayWidth + n150 * 150 + n100 * 100 + n75 * 75;\n          if (filled > bestFilled) {\n            bestFilled = filled;\n            bestPieces = [\n              ...Array.from({ length:primary }, () => trayWidth),\n              ...Array.from({ length:n150 }, () => 150),\n              ...Array.from({ length:n100 }, () => 100),\n              ...Array.from({ length:n75 }, () => 75),\n            ];\n          }\n        }\n      }\n      if (bestFilled === width) break;\n    }\n    return bestPieces;',
  'Tava standart parça formülü',
);

fs.writeFileSync(buildPath, build);

const uiPath = 'client/b2b-accessories.js';
let ui = fs.readFileSync(uiPath, 'utf8');
ui = replaceRequired(
  ui,
  "  const VERSION = 'b2b-accessories-v1';",
  "  const VERSION = 'b2b-accessories-v3';",
  'Aksesuar arayüz sürümü',
);

const uiWidthFixes = [
  ["    ...(item.type === 'tray' ? { width: [200,250,300].includes(Number(item.width)) ? Number(item.width) : 300 } : {}),", "    ...(item.type === 'tray' ? { width: [200,250].includes(Number(item.width)) ? Number(item.width) : 250 } : {}),"],
  ["    const tray = [200,250,300].includes(Number(trayWidth)) ? Number(trayWidth) : 300;", "    const tray = [200,250].includes(Number(trayWidth)) ? Number(trayWidth) : 250;"],
  ["        const width = [200,250,300].includes(Number(item.width)) ? Number(item.width) : 300;", "        const width = [200,250].includes(Number(item.width)) ? Number(item.width) : 250;"],
  ["${[200,250,300].map((w) => `<button type=\"button\" class=\"${width === w ? 'active' : ''}\" onclick=\"rafexAccessorySetTrayWidth(${index},${w})\">${w} mm</button>`).join('')}", "${[200,250].map((w) => `<button type=\"button\" class=\"${width === w ? 'active' : ''}\" onclick=\"rafexAccessorySetTrayWidth(${index},${w})\">${w} mm</button>`).join('')}"],
  ["if (existing < 0) accessories.push({ type, levels: [], ...(type === 'tray' ? { width: 300 } : {}) });", "if (existing < 0) accessories.push({ type, levels: [], ...(type === 'tray' ? { width: 250 } : {}) });"],
  ["    item.width = [200,250,300].includes(Number(width)) ? Number(width) : 300; render(); notify();", "    item.width = [200,250].includes(Number(width)) ? Number(width) : 250; render(); notify();"],
  ["...(item.type === 'tray' ? { width:[200,250,300].includes(Number(item.width))?Number(item.width):300 } : {})", "...(item.type === 'tray' ? { width:[200,250].includes(Number(item.width))?Number(item.width):250 } : {})"],
];
for (const [from, to] of uiWidthFixes) ui = replaceRequired(ui, from, to, `Tava arayüz ölçüsü: ${from}`);

ui = replaceRequired(
  ui,
  '    const full = Math.floor(width / tray);\n    const remainder = width - full * tray;\n    const pieces = full > 0 ? [{ width: tray, count: full }] : [];\n    if (remainder >= 50) pieces.push({ width: remainder, count: 1 });\n    return { clearWidth: width, trayWidth: tray, full, remainder, pieces, ignoredRemainder: remainder > 0 && remainder < 50 ? remainder : 0 };',
  '    let bestPieces = [];\n    let bestFilled = -1;\n    const maxPrimary = Math.floor(width / tray);\n    for (let primary = maxPrimary; primary >= 0; primary -= 1) {\n      const remainder = width - primary * tray;\n      for (let n150 = Math.floor(remainder / 150); n150 >= 0; n150 -= 1) {\n        const after150 = remainder - n150 * 150;\n        for (let n100 = Math.floor(after150 / 100); n100 >= 0; n100 -= 1) {\n          const after100 = after150 - n100 * 100;\n          const n75 = Math.floor(after100 / 75);\n          const filled = primary * tray + n150 * 150 + n100 * 100 + n75 * 75;\n          if (filled > bestFilled) {\n            bestFilled = filled;\n            bestPieces = [\n              ...Array.from({ length:primary }, () => tray),\n              ...Array.from({ length:n150 }, () => 150),\n              ...Array.from({ length:n100 }, () => 100),\n              ...Array.from({ length:n75 }, () => 75),\n            ];\n          }\n        }\n      }\n      if (bestFilled === width) break;\n    }\n    const counts = new Map();\n    bestPieces.forEach((piece) => counts.set(piece, (counts.get(piece) || 0) + 1));\n    const pieces = [...counts.entries()].map(([pieceWidth, count]) => ({ width:pieceWidth, count }));\n    const full = bestPieces.filter((piece) => piece === tray).length;\n    const remainder = Math.max(0, width - bestFilled);\n    return { clearWidth: width, trayWidth: tray, full, remainder, pieces, ignoredRemainder: remainder };',
  'Tava arayüz standart parça formülü',
);
ui = replaceRequired(
  ui,
  '${plan.ignoredRemainder ? ` · kalan ${plan.ignoredRemainder} mm (&lt;50 mm) için tava eklenmez` : \'\'}',
  '${plan.ignoredRemainder ? ` · kalan ${plan.ignoredRemainder} mm standart ölçülerle doldurulamıyor` : \'\'}',
  'Tava arayüz kalan metni',
);
fs.writeFileSync(uiPath, ui);

console.log('B2B palet dayama merkezi, H travers yönü ve standart tava yerleşimi düzeltmeleri uygulandı.');
