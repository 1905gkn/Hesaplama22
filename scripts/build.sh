#!/usr/bin/env bash
set -euo pipefail

project_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
dist_root="$project_root/dist"

mkdir -p "$dist_root/server" "$dist_root/.openai/drizzle"
cp "$project_root/worker/index.js" "$dist_root/server/index.js"
cp "$project_root/.openai/hosting.json" "$dist_root/.openai/hosting.json"
cp "$project_root/drizzle/"*.sql "$dist_root/.openai/drizzle/"

viewer_source="$project_root/client/b2b-viewer.entry.js"
patched_viewer="$dist_root/b2b-viewer.patched.entry.js"
viewer_bundle="$dist_root/b2b-viewer.js"

node - "$viewer_source" "$patched_viewer" <<'NODE'
const fs = require('node:fs');
const sourcePath = process.argv[2];
const outputPath = process.argv[3];
let source = fs.readFileSync(sourcePath, 'utf8');

// Çift sıra yönü artık kaynak 3D üreticisinde uygulanıyor.
if (!source.includes('row.scale.y=-1')) throw new Error('B2B çift sıra yönü kaynakta bulunamadı.');



source = source.replace('const ASSET_VERSION = "b2b-centered-upright-thickness-517";', 'const ASSET_VERSION = "b2b-centered-upright-thickness-517";');
fs.writeFileSync(outputPath, source);
NODE

"$project_root/node_modules/.bin/esbuild" "$patched_viewer" \
  --bundle \
  --format=iife \
  --minify \
  --target=es2022 \
  --outfile="$viewer_bundle"

node - "$project_root/portal.html" "$project_root/assets/mekik-corridor-front.png" "$project_root/assets/ray-side.png" "$project_root/assets/travers-side.png" "$project_root/assets/ayak-side.png" "$project_root/assets/paletli-side.png" "$project_root/assets/ayak2-front.png" "$project_root/assets/pallet-definition.png" "$project_root/assets/b2b-takim.glb" "$project_root/assets/b2b-palet.glb" "$project_root/assets/b2b-travers.glb" "$project_root/assets/b2b-ayak.glb" "$project_root/assets/b2b-sac-arabag.glb" "$viewer_bundle" "$project_root/client/b2b-visual-fixes.js" "$project_root/client/b2b-report-3d.js" "$project_root/node_modules/three/examples/jsm/libs/draco/gltf/draco_decoder.js" "$project_root/node_modules/three/examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js" "$project_root/node_modules/three/examples/jsm/libs/draco/gltf/draco_decoder.wasm" "$dist_root/server/index.js" <<'NODE'
const fs = require('node:fs');
const portalPath = process.argv[2];
const corridorFrontPath = process.argv[3];
const rayPath = process.argv[4], traversPath = process.argv[5], ayakPath = process.argv[6], paletliPath = process.argv[7];
const ayak2FrontPath = process.argv[8];
const palletDefinitionPath = process.argv[9];
const b2bTakimPath = process.argv[10];
const b2bPaletPath = process.argv[11];
const b2bTraversPath = process.argv[12];
const b2bAyakPath = process.argv[13];
const b2bStraightTiePath = process.argv[14];
const b2bViewerPath = process.argv[15];
const b2bVisualFixesPath = process.argv[16];
const b2bReport3dPath = process.argv[17];
const dracoDecoderPath = process.argv[18];
const dracoWasmWrapperPath = process.argv[19];
const dracoDecoderWasmPath = process.argv[20];
const workerPath = process.argv[21];
const corridorFrontBase64 = fs.readFileSync(corridorFrontPath).toString('base64');
const ayak2FrontBase64 = fs.readFileSync(ayak2FrontPath).toString('base64');
const b2bBuildVersion = (process.env.VERCEL_GIT_COMMIT_SHA || "local").slice(0, 7);
const b2bBuildTime = new Date().toISOString();
const b2bVisualFixes = fs.readFileSync(b2bVisualFixesPath, 'utf8')
  .replaceAll('__B2B_BUILD_VERSION__', b2bBuildVersion)
  .replaceAll('__B2B_BUILD_TIME__', b2bBuildTime);
const b2bReport3d = fs.readFileSync(b2bReport3dPath, 'utf8');
let portalSource = fs.readFileSync(portalPath, 'utf8')
  .replaceAll('__MEKIK_CORRIDOR_FRONT_BASE64__', corridorFrontBase64)
  .replaceAll('__M2_RAY_SIDE_BASE64__', fs.readFileSync(rayPath).toString('base64'))
  .replaceAll('__M2_TRAVERS_SIDE_BASE64__', fs.readFileSync(traversPath).toString('base64'))
  .replaceAll('__M2_AYAK_SIDE_BASE64__', fs.readFileSync(ayakPath).toString('base64'))
  .replaceAll('__M2_PALETLI_SIDE_BASE64__', fs.readFileSync(paletliPath).toString('base64'))
  .replaceAll('__M2_AYAK2_FRONT_BASE64__', ayak2FrontBase64)
  .replaceAll('__M2_PALLET_DEFINITION_BASE64__', fs.readFileSync(palletDefinitionPath).toString('base64'))
  .replaceAll('b2b-double-row-side-ties-367', 'b2b-centered-upright-thickness-517');
portalSource = portalSource.replace(/<\/body>\s*<\/html>\s*$/i, `<script data-rafex-b2b-visual-fixes="back-to-back-reference-v2">\n${b2bVisualFixes}\n</script>\n<script data-rafex-b2b-report-3d="front-side-capture-v5">\n${b2bReport3d}\n</script>\n</body>\n</html>`);
if (!portalSource.includes('data-rafex-b2b-visual-fixes="back-to-back-reference-v2"') || !portalSource.includes('data-rafex-b2b-report-3d="front-side-capture-v5"')) {
  throw new Error('B2B 3D görünüş betikleri portala eklenemedi.');
}
const unresolvedAsset = portalSource.match(/__[A-Z0-9_]+_BASE64__/);
if (unresolvedAsset) {
  throw new Error(`Çözümlenmemiş görsel yer tutucusu: ${unresolvedAsset[0]}`);
}
const portalBase64 = Buffer.from(portalSource).toString('base64');
const workerSource = fs.readFileSync(workerPath, 'utf8');
const nextSource = workerSource
  .replace(
    /^const HTML_BASE64\s*=\s*"[^"]*";/m,
    `const HTML_BASE64 = "${portalBase64}";`,
  )
  .replaceAll('__B2B_TAKIM_BASE64__', fs.readFileSync(b2bTakimPath).toString('base64'))
  .replaceAll('__B2B_PALET_BASE64__', fs.readFileSync(b2bPaletPath).toString('base64'))
  .replaceAll('__B2B_TRAVERS_BASE64__', fs.readFileSync(b2bTraversPath).toString('base64'))
  .replaceAll('__B2B_AYAK_BASE64__', fs.readFileSync(b2bAyakPath).toString('base64'))
  .replaceAll('__B2B_STRAIGHT_TIE_BASE64__', fs.readFileSync(b2bStraightTiePath).toString('base64'))
  .replaceAll('__B2B_VIEWER_BASE64__', fs.readFileSync(b2bViewerPath).toString('base64'))
  .replaceAll('__DRACO_DECODER_BASE64__', fs.readFileSync(dracoDecoderPath).toString('base64'))
  .replaceAll('__DRACO_WASM_WRAPPER_BASE64__', fs.readFileSync(dracoWasmWrapperPath).toString('base64'))
  .replaceAll('__DRACO_DECODER_WASM_BASE64__', fs.readFileSync(dracoDecoderWasmPath).toString('base64'))
  .replaceAll('__M2_AYAK2_FRONT_BASE64__', ayak2FrontBase64);
if (nextSource === workerSource) {
  throw new Error('worker/index.js içinde HTML_BASE64 bulunamadı.');
}
fs.writeFileSync(workerPath, nextSource);
NODE

echo "Built $dist_root"
