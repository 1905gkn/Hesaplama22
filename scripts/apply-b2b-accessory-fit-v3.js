const fs = require('node:fs');

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`${label} bulunamadı.`);
  return source.replace(from, to);
}

function replaceBlockRequired(source, startNeedle, endNeedle, replacement, label) {
  const start = source.indexOf(startNeedle);
  if (start < 0) throw new Error(`${label} başlangıcı bulunamadı.`);
  const end = source.indexOf(endNeedle, start);
  if (end < 0) throw new Error(`${label} sonu bulunamadı.`);
  return source.slice(0, start) + replacement + source.slice(end);
}

const buildPath = 'scripts/build.sh';
let build = fs.readFileSync(buildPath, 'utf8');

build = replaceRequired(
  build,
  'const ASSET_VERSION = "b2b-accessories-602";',
  'const ASSET_VERSION = "b2b-accessories-604";',
  'B2B aksesuar referans GLB sürümü',
);

build = replaceRequired(
  build,
  '          ...(item.type === "tray" ? { width: [200,250].includes(Number(item.width)) ? Number(item.width) : 250 } : {}),',
  '          ...(item.type === "tray" ? { width: [200,250,300].includes(Number(item.width)) ? Number(item.width) : 300 } : {}),',
  '300 mm tava normalize ölçüsü',
);

build = replaceRequired(
  build,
  '      innerStartY: nearBox.max.y,\n      innerEndY: farBox.min.y,\n    };',
  '      innerStartY: nearBox.max.y,\n      innerEndY: farBox.min.y,\n      seatZ: (nearBox.min.z + farBox.min.z) / 2,\n    };',
  'Travers üst oturma kotu',
);

build = replaceRequired(
  build,
  '  accessoryModel(source, targetSize, swapXY = false, rotate180 = false) {',
  '  accessoryModel(source, targetSize, swapXY = false, rotate180 = false, flipUpsideDown = false) {',
  'Aksesuar ters çevirme parametresi',
);
build = replaceRequired(
  build,
  '    if (rotate180) oriented.rotation.z += Math.PI;',
  '    if (rotate180) oriented.rotation.z += Math.PI;\n    if (flipUpsideDown) oriented.rotation.x += Math.PI;',
  'H travers dikey 180 derece dönüşü',
);

build = replaceRequired(
  build,
  '    const targetDepth = Math.max(1, Number(requestedDepth) || span.outerDepth);',
  '    const targetDepth = Math.max(1, Number(requestedDepth) || span.centerDepth);',
  'Aksesuar merkezleme tabanı',
);

build = replaceRequired(
  build,
  '    object.position.y += span.centerY - objectCenterY;\n    return span;\n  }\n\n  trayPiecePlan(clearWidth, requestedWidth) {',
  '    object.position.y += span.centerY - objectCenterY;\n    return span;\n  }\n\n  seatAccessoryOnTraverses(object, span, overlapRatio = 0) {\n    if (!span) return;\n    object.updateMatrixWorld(true);\n    const bounds = new THREE.Box3().setFromObject(object);\n    const overlap = Math.max(0, Number(this.options.traverseHeight) || 0) * Math.max(0, Number(overlapRatio) || 0);\n    object.position.z += (span.seatZ + overlap) - bounds.max.z;\n  }\n\n  trayPiecePlan(clearWidth, requestedWidth) {',
  'Aksesuar travers referans oturma yardımcısı',
);

const finalTrayPlan = `  trayPiecePlan(clearWidth, requestedWidth) {
    const width = Math.max(0, Math.round(Number(clearWidth) || 0));
    const primaryWidth = [200,250,300].includes(Number(requestedWidth)) ? Number(requestedWidth) : 300;
    const standardWidths = [300,250,200,150,100,75];
    const maxPrimary = Math.floor(width / primaryWidth);
    let best = null;

    const better = (candidate, current) => {
      if (!current) return true;
      if (candidate.filled !== current.filled) return candidate.filled > current.filled;
      if (candidate.primaryCount !== current.primaryCount) return candidate.primaryCount > current.primaryCount;
      if (candidate.pieces.length !== current.pieces.length) return candidate.pieces.length < current.pieces.length;
      const a = [...candidate.tail].sort((x,y) => y-x);
      const b = [...current.tail].sort((x,y) => y-x);
      for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
        const av = a[i] || 0, bv = b[i] || 0;
        if (av !== bv) return av > bv;
      }
      return false;
    };

    const bestTail = (capacity) => {
      let tailBest = { filled:0, pieces:[] };
      const walk = (remaining, startIndex, picked, filled) => {
        if (filled > tailBest.filled || (filled === tailBest.filled && (picked.length < tailBest.pieces.length || (picked.length === tailBest.pieces.length && picked.join(',') > tailBest.pieces.join(','))))) {
          tailBest = { filled, pieces:[...picked] };
        }
        for (let i = startIndex; i < standardWidths.length; i += 1) {
          const piece = standardWidths[i];
          if (piece > remaining) continue;
          picked.push(piece);
          walk(remaining - piece, i, picked, filled + piece);
          picked.pop();
        }
      };
      walk(capacity, 0, [], 0);
      return tailBest;
    };

    for (let primaryCount = maxPrimary; primaryCount >= 0; primaryCount -= 1) {
      const primaryFilled = primaryCount * primaryWidth;
      const capacity = width - primaryFilled;
      const tail = bestTail(capacity);
      const pieces = [
        ...Array.from({ length:primaryCount }, () => primaryWidth),
        ...tail.pieces,
      ];
      const candidate = { primaryCount, tail:tail.pieces, pieces, filled:primaryFilled + tail.filled };
      if (better(candidate, best)) best = candidate;
      if (best?.filled === width && best.primaryCount === maxPrimary) break;
    }
    return best?.pieces || [];
  }

`;
build = replaceBlockRequired(
  build,
  '  trayPiecePlan(clearWidth, requestedWidth) {',
  '  addAccessories(section, sectionScale, depthScale) {',
  finalTrayPlan,
  'Tava uzun son parça planı',
);

build = replaceRequired(
  build,
  '          const h = this.accessoryModel(this.models.hTraverse, { x:targetX, y:betweenDepth, z:89 }, true, true);',
  '          const h = this.accessoryModel(this.models.hTraverse, { x:targetX, y:betweenDepth, z:89 }, true, false, true);',
  'H travers referans GLB yönü',
);

build = replaceRequired(
  build,
  '          h.position.set(clearLeft + 50 * sectionScale, 0, -this.traverseBottom(level));\n          this.centerAccessoryBetweenTraverses(h, section, humanLevel, null);\n          section.add(h);',
  '          h.position.set(clearLeft + 50 * sectionScale, 0, -supportTop);\n          const hReferenceSpan = this.accessoryTraverseSpan(section, humanLevel);\n          const hTargetDepth = hReferenceSpan ? hReferenceSpan.outerDepth + 16 : null;\n          const hSpan = this.centerAccessoryBetweenTraverses(h, section, humanLevel, hTargetDepth);\n          if (hSpan) h.position.y += 2;\n          this.seatAccessoryOnTraverses(h, hSpan, 0.71);\n          section.add(h);',
  'H travers referans GLB kanca oturması',
);

build = replaceRequired(
  build,
  '            tray.position.set(clearLeft + cursor, 0, -(this.traverseBottom(level) + 65));\n            this.centerAccessoryBetweenTraverses(tray, section, humanLevel, 1100);\n            section.add(tray);',
  '            tray.position.set(clearLeft + cursor, 0, -supportTop);\n            const trayReferenceSpan = this.accessoryTraverseSpan(section, humanLevel);\n            const trayTargetDepth = trayReferenceSpan ? trayReferenceSpan.outerDepth + 7 : null;\n            const traySpan = this.centerAccessoryBetweenTraverses(tray, section, humanLevel, trayTargetDepth);\n            if (traySpan) tray.position.y += 11;\n            this.seatAccessoryOnTraverses(tray, traySpan, 0.14);\n            section.add(tray);',
  'Tava referans GLB travers oturması',
);

fs.writeFileSync(buildPath, build);

const uiPath = 'client/b2b-accessories.js';
let ui = fs.readFileSync(uiPath, 'utf8');

ui = replaceRequired(
  ui,
  "  const VERSION = 'b2b-accessories-v3';",
  "  const VERSION = 'b2b-accessories-v5';",
  'Aksesuar arayüz referans GLB sürümü',
);

ui = ui.replaceAll(
  '[200,250].includes(Number(item.width)) ? Number(item.width) : 250',
  '[200,250,300].includes(Number(item.width)) ? Number(item.width) : 300',
);
ui = ui.replaceAll(
  '[200,250].includes(Number(trayWidth)) ? Number(trayWidth) : 250',
  '[200,250,300].includes(Number(trayWidth)) ? Number(trayWidth) : 300',
);
ui = ui.replaceAll(
  '[200,250].includes(Number(width)) ? Number(width) : 250',
  '[200,250,300].includes(Number(width)) ? Number(width) : 300',
);
ui = ui.replaceAll('${[200,250].map((w) =>', '${[200,250,300].map((w) =>');
ui = ui.replaceAll("type === 'tray' ? { width: 250 }", "type === 'tray' ? { width: 300 }");

const uiTrayPlan = `  const trayPlan = (clearWidth, trayWidth) => {
    const width = Math.max(0, Math.round(Number(clearWidth) || 0));
    const primary = [200,250,300].includes(Number(trayWidth)) ? Number(trayWidth) : 300;
    const standards = [300,250,200,150,100,75];
    const maxPrimary = Math.floor(width / primary);
    let best = null;

    const tailPlan = (capacity) => {
      let result = { filled:0, pieces:[] };
      const walk = (remaining, startIndex, picked, filled) => {
        if (filled > result.filled || (filled === result.filled && (picked.length < result.pieces.length || (picked.length === result.pieces.length && picked.join(',') > result.pieces.join(','))))) result = { filled, pieces:[...picked] };
        for (let i = startIndex; i < standards.length; i += 1) {
          const piece = standards[i];
          if (piece > remaining) continue;
          picked.push(piece); walk(remaining - piece, i, picked, filled + piece); picked.pop();
        }
      };
      walk(capacity, 0, [], 0);
      return result;
    };

    for (let primaryCount = maxPrimary; primaryCount >= 0; primaryCount -= 1) {
      const tail = tailPlan(width - primaryCount * primary);
      const flat = [...Array.from({length:primaryCount},()=>primary), ...tail.pieces];
      const filled = flat.reduce((sum,piece)=>sum+piece,0);
      const candidate = { primaryCount, flat, tail:tail.pieces, filled };
      if (!best || filled > best.filled || (filled === best.filled && (primaryCount > best.primaryCount || (primaryCount === best.primaryCount && flat.length < best.flat.length)))) best = candidate;
      if (best?.filled === width && best.primaryCount === maxPrimary) break;
    }

    const counts = new Map();
    (best?.flat || []).forEach((piece) => counts.set(piece, (counts.get(piece) || 0) + 1));
    const pieces = [...counts.entries()].sort((a,b)=>b[0]-a[0]).map(([pieceWidth,count])=>({width:pieceWidth,count}));
    const filled = best?.filled || 0;
    return { clearWidth:width, trayWidth:primary, full:(best?.flat || []).filter((piece)=>piece===primary).length, remainder:Math.max(0,width-filled), pieces, ignoredRemainder:Math.max(0,width-filled) };
  };

`;
ui = replaceBlockRequired(
  ui,
  '  const trayPlan = (clearWidth, trayWidth) => {',
  '  function style() {',
  uiTrayPlan,
  'Tava arayüz uzun son parça planı',
);

ui = replaceRequired(
  ui,
  '  installViewerAccessoryPlacementFix();\n  setTimeout(render, 0);',
  '  setTimeout(render, 0);',
  'Eski runtime aksesuar yerleşim override devre dışı',
);
ui = replaceRequired(
  ui,
  '    installHooks();\n    installViewerAccessoryPlacementFix();',
  '    installHooks();',
  'Viewer ready eski runtime yerleşim override devre dışı',
);

fs.writeFileSync(uiPath, ui);
console.log('Referans GLB yerleşimi uygulandı: H travers ters çevrildi, kancalar travers üstüne indirildi, tavalar referans derinlik/kota oturdu ve son tava parçası mümkün olduğunca uzun tutuldu.');
