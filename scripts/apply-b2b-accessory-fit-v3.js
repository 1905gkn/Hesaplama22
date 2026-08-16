const fs = require('node:fs');

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`${label} bulunamadı.`);
  return source.replace(from, to);
}

const buildPath = 'scripts/build.sh';
let build = fs.readFileSync(buildPath, 'utf8');

build = replaceRequired(
  build,
  'const ASSET_VERSION = "b2b-accessories-602";',
  'const ASSET_VERSION = "b2b-accessories-603";',
  'B2B aksesuar son oturma sürümü',
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
  '    const targetDepth = Math.max(1, Number(requestedDepth) || span.outerDepth);',
  '    const targetDepth = Math.max(1, Number(requestedDepth) || span.centerDepth);',
  'Aksesuar kanca merkezleri arası derinlik',
);

build = replaceRequired(
  build,
  '    object.position.y += span.centerY - objectCenterY;\n    return span;\n  }\n\n  trayPiecePlan(clearWidth, requestedWidth) {',
  '    object.position.y += span.centerY - objectCenterY;\n    return span;\n  }\n\n  seatAccessoryOnTraverses(object, span) {\n    if (!span) return;\n    object.updateMatrixWorld(true);\n    const bounds = new THREE.Box3().setFromObject(object);\n    object.position.z += span.seatZ - bounds.max.z;\n  }\n\n  trayPiecePlan(clearWidth, requestedWidth) {',
  'Aksesuar travers üstüne oturma yardımcısı',
);

build = replaceRequired(
  build,
  '          h.position.set(clearLeft + 50 * sectionScale, 0, -this.traverseBottom(level));\n          this.centerAccessoryBetweenTraverses(h, section, humanLevel, null);\n          section.add(h);',
  '          h.position.set(clearLeft + 50 * sectionScale, 0, -supportTop);\n          const hSpan = this.centerAccessoryBetweenTraverses(h, section, humanLevel, null);\n          this.seatAccessoryOnTraverses(h, hSpan);\n          section.add(h);',
  'H travers kancalarını travers üst kotuna oturtma',
);

build = replaceRequired(
  build,
  '            tray.position.set(clearLeft + cursor, 0, -(this.traverseBottom(level) + 65));\n            this.centerAccessoryBetweenTraverses(tray, section, humanLevel, 1100);\n            section.add(tray);',
  '            tray.position.set(clearLeft + cursor, 0, -supportTop);\n            const traySpan = this.centerAccessoryBetweenTraverses(tray, section, humanLevel, null);\n            this.seatAccessoryOnTraverses(tray, traySpan);\n            section.add(tray);',
  'Tavayı traverslerin gerçek üstüne ve merkezlerine oturtma',
);

fs.writeFileSync(buildPath, build);

const uiPath = 'client/b2b-accessories.js';
let ui = fs.readFileSync(uiPath, 'utf8');

ui = replaceRequired(
  ui,
  "  const VERSION = 'b2b-accessories-v3';",
  "  const VERSION = 'b2b-accessories-v4';",
  'Aksesuar arayüz final sürümü',
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
console.log('300 mm tava geri getirildi; tava ve H travers gerçek travers üst yüzeylerine kilitlendi.');
