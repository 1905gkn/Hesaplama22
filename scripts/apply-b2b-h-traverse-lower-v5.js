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
  'B2B H travers 50 mm alt kot surumu',
);

// V3'teki H travers yonunu aynen koru. Sadece son oturma konumundan 50 mm asagi indir.
build = replaceRequired(
  build,
  '          this.seatAccessoryOnTraverses(h, hSpan, 0.71);\n          section.add(h);',
  '          this.seatAccessoryOnTraverses(h, hSpan, 0.71);\n          h.position.z += 50;\n          section.add(h);',
  'H travers 50 mm asagi kaydirma',
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

console.log('H travers yonu korunarak 50 mm asagi indirildi. Tava ve diger aksesuar yerlesimleri degistirilmedi.');
