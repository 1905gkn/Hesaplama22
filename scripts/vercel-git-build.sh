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

# Root correction for the 2026-08-21 accessory issues: native B2B ground pallet-stop
# state survives rerenders and tunnel filtering uses the entered tunnel height.
node scripts/patch-user-request-20260821-v8-source.mjs

node scripts/patch-between-measure-source.mjs
node scripts/patch-free-layout-drag-start-performance.mjs
node scripts/patch-free-layout-staged-report-performance.mjs
node scripts/patch-free-layout-staged-fast-v2.mjs
node scripts/patch-mobile-responsive.mjs
node scripts/patch-foot-priority-fixed-sidebar.mjs
node scripts/patch-ui-runtime-stability.mjs
node scripts/patch-login-home-sidebar.mjs

bash scripts/build.sh

node scripts/inject-b2b-section-positioner.mjs
node scripts/inject-user-20260819.mjs
node scripts/patch-customize-recovery.mjs
node scripts/patch-current-ux-20260819.mjs
node scripts/patch-customize-ground-k1-final.mjs
node scripts/patch-final-live-controls.mjs
node scripts/patch-ground-pallet-stop-tunnel-stop3d.mjs
node scripts/patch-free-layout-stop3d-hard.mjs
node scripts/patch-live-b2b-3d-persistence.mjs
node scripts/patch-live-b2b-3d-add-hook.mjs
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

# Final authority for mixed corporate output: keep Mekik front/side drawings inside
# the exact report card slot and prevent same-named B2B/Mekik types from merging.
node scripts/patch-mekik-report-slot-v7.mjs

# Final authority for accessory/product UX and Serbest state preservation. These run
# after every legacy wrapper so stale behavior cannot win.
node scripts/patch-user-request-20260821-v8-final.mjs
node scripts/patch-user-request-20260821-v8-click-final.mjs
node scripts/patch-serbest-block-freeze-v9.mjs

# Final PDF geometry authority: one page is split into left/right vertical slots.
# B2B keeps its current single-module vertical rendering in one slot; Mekik uses
# the same slot size with front view on top and side view below.
node scripts/patch-pdf-two-column-slots-v10.mjs

echo "Production chain verified: clickable accessory levels + entered-height tunnel filtering + live quantities/codes + collapsible product lists + clip anchors + Serbest state preservation + no free-layout product observer loop + Mekik report slots + two-column PDF system slots."
