const fs = require('node:fs');

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`${label} bulunamadı.`);
  return source.replace(from, to);
}

const buildPath = 'scripts/build.sh';
let build = fs.readFileSync(buildPath, 'utf8');

build = replaceRequired(
  build,
  'const ASSET_VERSION = "b2b-accessories-601";',
  'const ASSET_VERSION = "b2b-accessories-602";',
  'B2B aksesuar yerlesim surumu',
);

// swapXY sonrasinda local eksende scale uygulamak hedef X/Y olculerini bozuyordu.
// Donmus modeli bir dis gruba alip scale'i rafin dunya X/Y eksenlerinde uygula.
build = replaceRequired(
  build,
  '    const size = bounds.getSize(new THREE.Vector3());\n    oriented.position.sub(bounds.min);\n    const sx = targetSize.x / Math.max(1, size.x);\n    const sy = targetSize.y / Math.max(1, size.y);\n    const sz = targetSize.z / Math.max(1, size.z);\n    oriented.scale.set(sx, sy, -sz);\n    oriented.updateMatrixWorld(true);\n    bounds = new THREE.Box3().setFromObject(oriented);\n    oriented.position.x -= bounds.min.x;\n    oriented.position.y -= bounds.min.y;\n    oriented.position.z -= bounds.max.z;\n    return oriented;',
  '    const size = bounds.getSize(new THREE.Vector3());\n    oriented.position.x -= bounds.min.x;\n    oriented.position.y -= bounds.min.y;\n    oriented.position.z -= bounds.min.z;\n    oriented.updateMatrixWorld(true);\n    const scaled = new THREE.Group();\n    scaled.add(oriented);\n    const sx = targetSize.x / Math.max(1, size.x);\n    const sy = targetSize.y / Math.max(1, size.y);\n    const sz = targetSize.z / Math.max(1, size.z);\n    scaled.scale.set(sx, sy, -sz);\n    scaled.updateMatrixWorld(true);\n    bounds = new THREE.Box3().setFromObject(scaled);\n    scaled.position.x -= bounds.min.x;\n    scaled.position.y -= bounds.min.y;\n    scaled.position.z -= bounds.max.z;\n    return scaled;',
  'Donmus aksesuarin dunya ekseninde olceklenmesi',
);

// Gercek on/arka travers geometri kutularindan derinlik merkezini hesapla.
build = replaceRequired(
  build,
  '    return group;\n  }\n\n  trayPiecePlan(clearWidth, requestedWidth) {',
  '    return group;\n  }\n\n  accessoryTraverseSpan(section, humanLevel) {\n    const front = section.getObjectByName("B2B Travers K" + humanLevel + " Ön");\n    const back = section.getObjectByName("B2B Travers K" + humanLevel + " Arka");\n    if (!front || !back) return null;\n    section.updateMatrixWorld(true);\n    const frontBox = new THREE.Box3().setFromObject(front);\n    const backBox = new THREE.Box3().setFromObject(back);\n    const frontCenter = frontBox.getCenter(new THREE.Vector3());\n    const backCenter = backBox.getCenter(new THREE.Vector3());\n    const nearBox = frontCenter.y <= backCenter.y ? frontBox : backBox;\n    const farBox = frontCenter.y <= backCenter.y ? backBox : frontBox;\n    const nearCenterY = frontCenter.y <= backCenter.y ? frontCenter.y : backCenter.y;\n    const farCenterY = frontCenter.y <= backCenter.y ? backCenter.y : frontCenter.y;\n    return {\n      centerY: (nearCenterY + farCenterY) / 2,\n      centerDepth: Math.max(1, farCenterY - nearCenterY),\n      outerStartY: nearBox.min.y,\n      outerEndY: farBox.max.y,\n      outerDepth: Math.max(1, farBox.max.y - nearBox.min.y),\n      innerStartY: nearBox.max.y,\n      innerEndY: farBox.min.y,\n    };\n  }\n\n  centerAccessoryBetweenTraverses(object, section, humanLevel, requestedDepth = null) {\n    const span = this.accessoryTraverseSpan(section, humanLevel);\n    if (!span) return null;\n    object.updateMatrixWorld(true);\n    let bounds = new THREE.Box3().setFromObject(object);\n    const currentDepth = Math.max(1, bounds.max.y - bounds.min.y);\n    const targetDepth = Math.max(1, Number(requestedDepth) || span.outerDepth);\n    if (Math.abs(currentDepth - targetDepth) > 0.01) {\n      object.scale.y *= targetDepth / currentDepth;\n      object.updateMatrixWorld(true);\n      bounds = new THREE.Box3().setFromObject(object);\n    }\n    const objectCenterY = bounds.getCenter(new THREE.Vector3()).y;\n    object.position.y += span.centerY - objectCenterY;\n    return span;\n  }\n\n  trayPiecePlan(clearWidth, requestedWidth) {',
  'Travers geometri merkez yardimcilari',
);

// H traversin tamamini on ve arka traversin gercek dis yuzleri arasina oturt.
build = replaceRequired(
  build,
  '          h.position.set(clearLeft + 50 * sectionScale, betweenStartY, -this.traverseBottom(level));\n          section.add(h);',
  '          h.position.set(clearLeft + 50 * sectionScale, 0, -this.traverseBottom(level));\n          this.centerAccessoryBetweenTraverses(h, section, humanLevel, null);\n          section.add(h);',
  'H travers gercek travers merkezine yerlestirme',
);

// Tava 200/250/150/100/75 eninde kalir, derinligi fiziksel olarak tam 1100 mm olur
// ve gercek on/arka travers merkezinin tam ortasina gelir.
build = replaceRequired(
  build,
  '            tray.position.set(clearLeft + cursor, betweenStartY, -(this.traverseBottom(level) + 65));\n            section.add(tray);',
  '            tray.position.set(clearLeft + cursor, 0, -(this.traverseBottom(level) + 65));\n            this.centerAccessoryBetweenTraverses(tray, section, humanLevel, 1100);\n            section.add(tray);',
  'Tava gercek travers merkezine yerlestirme',
);

fs.writeFileSync(buildPath, build);
console.log('H travers ve tavalar gercek travers geometri kutularinin arasina kilitlendi.');
