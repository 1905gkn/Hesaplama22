#!/usr/bin/env bash
set -euo pipefail

project_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$project_root"

# Reproduce the exact prebuilt preparation used for the approved 34vnlp6h8 deployment.
sed -i "s/b2b-accessories-v2/b2b-accessories-v1/" client/b2b-accessories.js

cp scripts/apply-b2b-accessory-fixes.js /tmp/apply-b2b-accessory-fixes.cjs
node /tmp/apply-b2b-accessory-fixes.cjs

cp scripts/apply-b2b-accessory-placement-v2.js /tmp/apply-b2b-accessory-placement-v2.cjs
node /tmp/apply-b2b-accessory-placement-v2.cjs

cp scripts/apply-b2b-accessory-fit-v3.js /tmp/apply-b2b-accessory-fit-v3.cjs
node /tmp/apply-b2b-accessory-fit-v3.cjs

cp scripts/apply-b2b-h-traverse-lower-v5.js /tmp/apply-b2b-h-traverse-lower-v5.cjs
node /tmp/apply-b2b-h-traverse-lower-v5.cjs

node scripts/patch-customize-accessories-source.mjs
node scripts/patch-tunnel-tray-level-fix.mjs
node scripts/patch-tunnel-level-click-cleanup.mjs
node scripts/patch-b2b-tunnel-accessory-source-v5.mjs
node scripts/patch-user-request-20260821-v8-source.mjs
node scripts/patch-between-measure-source.mjs
node scripts/patch-manual-distance-no-pin-v34.mjs
node scripts/patch-free-layout-drag-start-performance.mjs
node scripts/patch-free-layout-staged-report-performance.mjs
node scripts/patch-free-layout-staged-fast-v2.mjs
node scripts/patch-free-layout-geometry-cache-v27.mjs
node scripts/patch-free-layout-dom-table-v28.mjs
node scripts/patch-free-layout-runtime-tables-v29.mjs
node scripts/patch-free-layout-live-frame-v31.mjs
node scripts/patch-mobile-responsive.mjs
node scripts/patch-mobile-desktop-view-v30.mjs
node scripts/patch-foot-priority-fixed-sidebar.mjs
node scripts/patch-ui-runtime-stability.mjs
node scripts/patch-login-home-sidebar.mjs
node scripts/patch-saved-rack-type-click-performance-v20.mjs
node scripts/patch-runtime-insertion-order-v22.mjs
node scripts/patch-mr-773a-followup-v1.mjs
node scripts/patch-mr-tray-clearance-v19.mjs
node scripts/patch-mr-saved-types-v18.mjs
node scripts/patch-mr-save-api-v20.mjs
node scripts/patch-b2b-physical-width-v23.mjs
node scripts/patch-mr-free-extension-v35.mjs source
node scripts/patch-free-layout-mekik-gap-stability-v36.mjs
node scripts/patch-free-layout-group-drag-v68.mjs
node scripts/patch-free-layout-shared-foot-drag-v69.mjs
grep -q 'function m2PerfLiveNearestRackGap(rack)' portal.html
grep -q 'm2PerfLiveRackDistanceGuide(rack)' portal.html
node scripts/patch-viewer-lifecycle-performance-v30.mjs

grep -q 'const trayDepth = Math.max(1, depth - 25);' client/mr-viewer.entry.js
grep -q 'data-rafex-mr-v18="1"' portal.html
grep -q 'm2ActiveModule="mr"' portal.html
grep -q 'm2ActiveModule === "mr" ? "/api/b2b-types"' portal.html
grep -q 'const B2B_PHYSICAL_FOOT_WIDTH = 60;' portal.html
grep -q 'footWidth: B2B_PHYSICAL_FOOT_WIDTH' portal.html
grep -q 'Manual distance changes must not pin guide visibility' portal.html
grep -q 'const m2PerfGeometryTable = new Map();' portal.html
grep -q 'm2PerfCollisionCandidates(a).some' portal.html
grep -q 'const m2PerfRackDomTable = new Map();' portal.html
grep -q 'm2PerfRenderSingleRackDragFrame()' portal.html
grep -q 'const m2LayoutRuntimeCache = {' portal.html
grep -q 'm2PerfWallGeometryTable()' portal.html
grep -q 'm2PerfBlockingSymbols().some' portal.html
grep -q 'function m2ScheduleLiveRackDrag(svg,event)' portal.html
grep -q 'const m2PerfGroupDragVersion="v68";' portal.html
grep -q 'window.rafexFreeGroupDragV68' portal.html
grep -q 'const m2PerfSharedFootDragVersion="v69";' portal.html
grep -q 'm2PerfTranslateSharedFeet(drag,movingIds,dx,dy)' portal.html
! grep -q 'now-drag.perfLastGuideAt<64' portal.html
grep -q 'data-rafex-mobile-desktop-view="v30"' portal.html
grep -q '__rafexLifecycleV30' client/b2b-viewer.entry.js
grep -q '__rafexLifecycleV30' client/mr-viewer.entry.js

bash scripts/build.sh
node scripts/build-drive-in-assets-v1.mjs
node scripts/inject-b2b-section-positioner.mjs
node scripts/inject-user-20260819.mjs
node scripts/patch-customize-recovery.mjs
node scripts/patch-current-ux-20260819.mjs
node scripts/patch-customize-ground-k1-final.mjs
node scripts/patch-final-live-controls.mjs
node scripts/patch-ground-pallet-stop-tunnel-stop3d.mjs
node scripts/patch-unified-free-drawing.mjs
node scripts/patch-unified-free-drawing-safety.mjs
node scripts/patch-unified-free-drawing-catalog.mjs
node scripts/patch-unified-free-system-controls.mjs
node scripts/patch-unified-section-positioner.mjs
node scripts/patch-native-system-pdf-router.mjs
node scripts/patch-mekik-output-halves.mjs
node scripts/patch-free-system-page-isolation.mjs
node scripts/patch-final-free-pdf-ux-v1.mjs
node scripts/patch-restore-native-output-and-free-ux-v2.mjs
node scripts/patch-free-copy-info-edge-v3.mjs
node scripts/patch-final-products-mekik-layout-v4.mjs
node scripts/patch-user-request-20260821-v5.mjs
node scripts/patch-user-request-20260821-v6.mjs
node scripts/patch-mekik-report-slot-v7.mjs
node scripts/patch-user-request-20260821-v8-final.mjs
node scripts/patch-user-request-20260821-v8-click-final.mjs
node scripts/patch-serbest-block-freeze-v9.mjs
node scripts/patch-pdf-two-column-slots-v10.mjs
node scripts/patch-final-pdf-halves-extension-v11.mjs
node scripts/patch-force-mekik-pdf-card-v12.mjs
node scripts/patch-mekik-native-front-details-v13.mjs
node scripts/patch-final-pdf-two-halves-v14.mjs
node scripts/patch-pdf-excel-sketch-layout-v15.mjs
node scripts/patch-pdf-type-layout-v16.mjs
node scripts/patch-pdf-b2b-rich-card-v17.mjs
node scripts/patch-pdf-excel-layout-v18.mjs
node scripts/patch-pdf-direct-type-pages-v19.mjs
node scripts/patch-final-user-repairs-v20.mjs
node scripts/patch-manual-free-output-v32.mjs
node scripts/patch-mr-free-extension-v35.mjs runtime
node scripts/patch-cad-import-v56.mjs
node scripts/patch-final-product-disclosure-toggle-v24.mjs
node scripts/patch-horizontal-products-savebar-v25.mjs
node scripts/patch-drive-in-mekik-v1.mjs
node scripts/patch-common-drawing-independent-v44.mjs
node scripts/patch-common-project-name-v87.mjs

grep -q 'data-rafex-cad-import="v56"' dist/server/index.js || node -e "const fs=require('fs'),s=fs.readFileSync('dist/server/index.js','utf8'),m=s.match(/const\\s+HTML_BASE64\\s*=\\s*([\\\"\\x27])([A-Za-z0-9+/=]+)\\1/);if(!m||!Buffer.from(m[2],'base64').toString('utf8').includes('data-rafex-cad-import=\\\"v56\\\"'))process.exit(1)"
grep -q 'data-rafex-product-toggle="v24"' dist/server/index.js || node -e "const fs=require('fs'),s=fs.readFileSync('dist/server/index.js','utf8'),m=s.match(/const\\s+HTML_BASE64\\s*=\\s*([\\\"\\x27])([A-Za-z0-9+/=]+)\\1/);if(!m||!Buffer.from(m[2],'base64').toString('utf8').includes('data-rafex-product-toggle=\\\"v24\\\"'))process.exit(1)"
grep -q 'data-rafex-horizontal-products-savebar="v25"' dist/server/index.js || node -e "const fs=require('fs'),s=fs.readFileSync('dist/server/index.js','utf8'),m=s.match(/const\\s+HTML_BASE64\\s*=\\s*([\\\"\\x27])([A-Za-z0-9+/=]+)\\1/);if(!m||!Buffer.from(m[2],'base64').toString('utf8').includes('data-rafex-horizontal-products-savebar=\\\"v25\\\"'))process.exit(1)"
grep -q 'data-rafex-drive-in-mekik="v1"' dist/server/index.js || node -e "const fs=require('fs'),s=fs.readFileSync('dist/server/index.js','utf8'),m=s.match(/const\\s+HTML_BASE64\\s*=\\s*([\\\"\\x27])([A-Za-z0-9+/=]+)\\1/);if(!m||!Buffer.from(m[2],'base64').toString('utf8').includes('data-rafex-drive-in-mekik=\\\"v1\\\"'))process.exit(1)"
grep -q 'data-rafex-common-independent="v44"' dist/server/index.js || node -e "const fs=require('fs'),s=fs.readFileSync('dist/server/index.js','utf8'),m=s.match(/const\\s+HTML_BASE64\\s*=\\s*([\\\"\\x27])([A-Za-z0-9+/=]+)\\1/);if(!m||!Buffer.from(m[2],'base64').toString('utf8').includes('data-rafex-common-independent=\\\"v44\\\"'))process.exit(1)"
grep -q 'data-rafex-common-project-name="v87"' dist/server/index.js || node -e "const fs=require('fs'),s=fs.readFileSync('dist/server/index.js','utf8'),m=s.match(/const\\s+HTML_BASE64\\s*=\\s*([\\\"\\x27])([A-Za-z0-9+/=]+)\\1/);if(!m||!Buffer.from(m[2],'base64').toString('utf8').includes('data-rafex-common-project-name=\\\"v87\\\"'))process.exit(1)"
node -e "const fs=require('fs'),s=fs.readFileSync('dist/server/index.js','utf8'),m=s.match(/const\\s+HTML_BASE64\\s*=\\s*([\"\x27])([A-Za-z0-9+/=]+)\\1/);if(!m||!Buffer.from(m[2],'base64').toString('utf8').includes('function m2PerfLiveNearestRackGap(rack)'))process.exit(1)"
node -e "const fs=require('fs'),s=fs.readFileSync('dist/server/index.js','utf8'),m=s.match(/const\\s+HTML_BASE64\\s*=\\s*([\"\x27])([A-Za-z0-9+/=]+)\\1/);if(!m)process.exit(1);const h=Buffer.from(m[2],'base64').toString('utf8');if(/data-rafex-free-layout-stop3d|data-rafex-b2b-3d-module-pause|data-rafex-b2b-3d-add-hook|rafexPauseB2B3DIfUserAdd/.test(h))process.exit(1)"

# Konsol v2 + kullanicinin son ayak profili / mesafe / serbest yerlesim / PDF istekleri
# verify adiminda en son yetki olarak uygulanir ve inline JS sozdizimi denetlenir.
node scripts/verify-inline-runtime-syntax-v21.mjs

grep -q "mode==='front'&&typeof m2SharedScaleReportSvg" scripts/patch-pdf-direct-type-pages-v19.mjs
grep -q "m2LayoutState.racks.filter" scripts/patch-pdf-direct-type-pages-v19.mjs
! grep -q "rafex-v19-detail-chip" scripts/patch-pdf-direct-type-pages-v19.mjs
grep -q "rafexRenderSelectedB2BSections" client/b2b-section-positioner-v5.js
grep -q 'data-rafex-final-user-repairs="v20"' scripts/patch-final-user-repairs-v20.mjs
grep -q 'data-rafex-manual-free-output="v32"' scripts/patch-manual-free-output-v32.mjs
grep -q 'sectionWidth=config.modules\*config.width' portal.html
grep -q 'data-rafex-mr-free-extension="v35"' dist/server/index.js || node -e "const fs=require('fs'),s=fs.readFileSync('dist/server/index.js','utf8'),m=s.match(/const\\s+HTML_BASE64\\s*=\\s*([\"\x27])([A-Za-z0-9+/=]+)\\1/);if(!m||!Buffer.from(m[2],'base64').toString('utf8').includes('data-rafex-mr-free-extension=\"v35\"'))process.exit(1)"
echo "Production chain verified: mevcut sistemler + Drive In + Konsol Kollu v3 aktif; Serbest Cizim 3D otomatik kapatma kapali."
