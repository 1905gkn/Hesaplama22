#!/usr/bin/env bash
set -euo pipefail

project_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
runtime="$project_root/scripts/.build-runtime.sh"
trap 'rm -f "$runtime"' EXIT
cp "$project_root/scripts/build.sh" "$runtime"

node - "$runtime" <<'NODE'
const fs = require('node:fs');
const path = process.argv[2];
let source = fs.readFileSync(path, 'utf8');
const fixes = [
  ['stop.name = `Palet Dayama K${humanLevel}`;', 'stop.name = "Palet Dayama K" + humanLevel;'],
  ['h.name = `H Travers K${humanLevel}`;', 'h.name = "H Travers K" + humanLevel;'],
  ['tray.name = `Tava K${humanLevel}-${pieceIndex + 1} · ${pieceWidth} mm`;', 'tray.name = "Tava K" + humanLevel + "-" + (pieceIndex + 1) + " · " + pieceWidth + " mm";'],
];
for (const [from, to] of fixes) {
  if (!source.includes(from)) throw new Error(`Aksesuar build satırı bulunamadı: ${from}`);
  source = source.replace(from, to);
}
fs.writeFileSync(path, source);
NODE

bash "$runtime"
