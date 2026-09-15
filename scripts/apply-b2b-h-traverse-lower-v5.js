const fs = require('node:fs');

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`${label} bulunamadi.`);
  return source.replace(from, to);
}

const buildPath = 'scripts/build.sh';
let build = fs.readFileSync(buildPath, 'utf8');

build = replaceRequired(
  build,
  'const ASSET_VERSION = "b2b-accessories-604";',
  'const ASSET_VERSION = "b2b-accessories-606";',
  'asset version',
);

build = replaceRequired(
  build,
  '          this.seatAccessoryOnTraverses(h, hSpan, 0.71);\n          section.add(h);',
  '          this.seatAccessoryOnTraverses(h, hSpan, 0.71);\n          h.position.z += 50;\n          section.add(h);',
  'H traverse offset',
);

build = replaceRequired(
  build,
  '            this.seatAccessoryOnTraverses(tray, traySpan, 0.14);\n            section.add(tray);',
  '            if (traySpan) {\n              tray.updateMatrixWorld(true);\n              const trayBounds = new THREE.Box3().setFromObject(tray);\n              tray.position.z += traySpan.seatZ + 17 + 50 - trayBounds.max.z;\n            }\n            section.add(tray);',
  'tray offset',
);

fs.writeFileSync(buildPath, build);

const uiPath = 'client/b2b-accessories.js';
let ui = fs.readFileSync(uiPath, 'utf8');
ui = replaceRequired(
  ui,
  "  const VERSION = 'b2b-accessories-v5';",
  "  const VERSION = 'b2b-accessories-v7';",
  'ui version',
);
fs.writeFileSync(uiPath, ui);

build = build.replace('            if (traySpan) tray.position.y += 11;\n', '');
fs.writeFileSync(buildPath, build);
console.log('H traverse offset retained; tray centered and seated on the beam using its 17 mm folded edge.');
