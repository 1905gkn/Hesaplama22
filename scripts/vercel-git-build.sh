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

# Put the requested accessory controls inside the actual Modülü Özelleştir modal
# after the legacy source patches and before dist is built.
node scripts/patch-customize-accessories-source.mjs

# Tunnel tray geometry/rule and remove the duplicate pointerdown level handler
# before portal.html is embedded into the production server artifact.
node scripts/patch-tunnel-tray-level-fix.mjs
node scripts/patch-tunnel-level-click-cleanup.mjs

# Add editable rack-to-rack measurement at source level before final packaging.
node scripts/patch-between-measure-source.mjs

# Keep free-layout dragging responsive without changing placement rules:
# capture undo before movement starts and queue the selection render.
node scripts/patch-free-layout-drag-start-performance.mjs

# A newly added rack is staged/free until first drop. Do not build the heavy
# report preview during that short placement phase; refresh normally after drop.
node scripts/patch-free-layout-staged-report-performance.mjs

# Treat the entire staged/free placement interval as interactive and queue the
# first add render, so expensive normalization/product/report work waits for drop.
node scripts/patch-free-layout-staged-fast-v2.mjs

# Optimize the full configurator for phone-sized screens before the production build.
node scripts/patch-mobile-responsive.mjs

# Keep the navigation full-height and fixed, and prefer 2,0 mm in Ayak calculation.
node scripts/patch-foot-priority-fixed-sidebar.mjs

# Make Customize controls resilient and prevent background section rendering
# from stealing/destroying the active 3D viewer.
node scripts/patch-ui-runtime-stability.mjs

# Final navigation rule: keep the left app menu fixed on Home and every signed-in
# page, but never show it on the password/login screen.
node scripts/patch-login-home-sidebar.mjs

bash scripts/build.sh

# The historical CLI/prebuilt deploy injected this after vercel build and then
# copied dist/server/index.js into the prebuilt function. During a native Git
# build Vercel packages dist only after buildCommand exits, so injecting here
# produces the same packaged server artifact.
node scripts/inject-b2b-section-positioner.mjs

# Apply the current user-requested production UX rules after the final section
# locator exists in dist: persistent seismic placement, seismic metadata/BOM
# and explicit perspective angle readouts.
node scripts/inject-user-20260819.mjs

# The V3 injector duplicated the already-working Customize controller and could
# override native modal/preview/apply state. Strip that duplicate layer from the
# final artifact and keep only the native Customize flow plus small safe sync fixes.
node scripts/patch-customize-recovery.mjs

# Final pass after all injectors: requested 50/10/100 section defaults, real
# front-view button sizing and resilient Customize accessory/pallet preview.
node scripts/patch-current-ux-20260819.mjs

# Keep final functional rules, but DO NOT inject the aggressive performance wrapper.
# That wrapper replaced the viewer animation loop and wrapped multiple Customize
# functions, which could stack with the existing runtime and cause severe UI lag.
# The final controls below preserve Arasi Olc, single-click accessory levels and K1.
node scripts/patch-customize-ground-k1-final.mjs
node scripts/patch-final-live-controls.mjs

# Latest UX/performance rule: Palet Dayama may also be placed on the ground only
# when the rack starts from ground; remove the obsolete tunnel input; and stop the
# main 3D viewer as soon as the free-layout workspace is interacted with.
node scripts/patch-ground-pallet-stop-tunnel-stop3d.mjs

echo "Production chain verified: ground pallet stop + no tunnel input + free-layout 3D stop + prior controls."
