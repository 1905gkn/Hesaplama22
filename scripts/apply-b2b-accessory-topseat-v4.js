const fs = require('node:fs');

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`${label} bulunamadı.`);
  return source.replace(from, to);
}

const buildPath = 'scripts/build.sh';
let build = fs.readFileSync(buildPath, 'utf8');

build = replaceRequired(
  build,
  'const ASSET_VERSION = "b2b-accessories-604";',
  'const ASSET_VERSION = "b2b-accessories-605";',
  'B2B aksesuar travers ustu temas surumu',
);

// H traversi dikey olarak ters cevirmek kancalar ile ana profil arasindaki
// iliskiyi bozuyordu. Referans GLB gibi yatay planda 180 derece dondur:
// ana profil travers ustunde, kancalar travers yanina/asagisina saracak.
build = replaceRequired(
  build,
  '          const h = this.accessoryModel(this.models.hTraverse, { x:targetX, y:betweenDepth, z:89 }, true, false, true);',
  '          const h = this.accessoryModel(this.models.hTraverse, { x:targetX, y:betweenDepth, z:89 }, true, true, false);',
  'H travers dogru kanca yonu',
);

// Buradaki sink degeri, tum objenin bounding box altini degil referans GLBdeki
// ana profil oturma duzlemini 2700luk traversin ust yuzeyine getirir.
build = replaceRequired(
  build,
  '  seatAccessoryOnTraverses(object, span, overlapRatio = 0) {\n    if (!span) return;\n    object.updateMatrixWorld(true);\n    const bounds = new THREE.Box3().setFromObject(object);\n    const overlap = Math.max(0, Number(this.options.traverseHeight) || 0) * Math.max(0, Number(overlapRatio) || 0);\n    object.position.z += (span.seatZ + overlap) - bounds.max.z;\n  }',
  '  seatAccessoryOnTraverses(object, span, sinkMm = 0) {\n    if (!span) return;\n    object.updateMatrixWorld(true);\n    const bounds = new THREE.Box3().setFromObject(object);\n    const sink = Math.max(0, Number(sinkMm) || 0);\n    object.position.z += (span.seatZ + sink) - bounds.max.z;\n  }',
  'Travers ustu model bazli oturma duzlemi',
);

// Referans montaj GLBde H travers kancasi ana profil oturma duzleminden yaklasik
// 84 mm asagi uzaniyor. Ana profil bu sayede sarı 2700luk traversin tam ustune oturur.
build = replaceRequired(
  build,
  '          this.seatAccessoryOnTraverses(h, hSpan, 0.71);',
  '          this.seatAccessoryOnTraverses(h, hSpan, 84);',
  'H travers ana profil travers ustu kotu',
);

// Tavanin katlanmis kenari referans GLBde oturma yuzeyinden yaklasik 17 mm asagi
// iniyor. Sac yuzeyi sarı traversin ustune otururken kenar asagi sarar.
build = replaceRequired(
  build,
  '            this.seatAccessoryOnTraverses(tray, traySpan, 0.14);',
  '            this.seatAccessoryOnTraverses(tray, traySpan, 17);',
  'Tava saci travers ustu kotu',
);

fs.writeFileSync(buildPath, build);

const uiPath = 'client/b2b-accessories.js';
let ui = fs.readFileSync(uiPath, 'utf8');
ui = replaceRequired(
  ui,
  "  const VERSION = 'b2b-accessories-v5';",
  "  const VERSION = 'b2b-accessories-v6';",
  'Aksesuar cache surumu',
);
fs.writeFileSync(uiPath, ui);

console.log('H travers ana profili ve tava saci 2700luk sarı traversin ust yuzeyine kilitlendi.');
