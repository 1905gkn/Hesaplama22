#!/usr/bin/env bash
set -euo pipefail

project_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
dist_root="$project_root/dist"

rm -rf "$dist_root"
mkdir -p "$dist_root/server" "$dist_root/.openai/drizzle"
cp "$project_root/worker/index.js" "$dist_root/server/index.js"
cp "$project_root/.openai/hosting.json" "$dist_root/.openai/hosting.json"
cp "$project_root/drizzle/"*.sql "$dist_root/.openai/drizzle/"

node - "$project_root/portal.html" "$dist_root/server/index.js" <<'NODE'
const fs = require('node:fs');
const portalPath = process.argv[2];
const workerPath = process.argv[3];
const portalBase64 = fs.readFileSync(portalPath).toString('base64');
const workerSource = fs.readFileSync(workerPath, 'utf8');
const nextSource = workerSource.replace(
  /^const HTML_BASE64\s*=\s*"[^"]*";/m,
  `const HTML_BASE64 = "${portalBase64}";`,
);
if (nextSource === workerSource) {
  throw new Error('worker/index.js içinde HTML_BASE64 bulunamadı.');
}
fs.writeFileSync(workerPath, nextSource);
NODE

echo "Built $dist_root"
