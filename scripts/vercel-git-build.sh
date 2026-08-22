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

# Saved rack type selection must not trigger a full free-layout SVG rerender.
node scripts/patch-saved-rack-type-click-performance-v20.mjs

# Mekik code must stay in the main application script, before later repair runtimes.
node scripts/patch-runtime-insertion-order-v22.mjs

# MR final source authority: keep the independent upright-height / upright-axis traverse
# placement, B2B-style ground, profile catalogue and the 3D in-canvas measurement dialogs.
node scripts/patch-mr-safe-v13.mjs
node scripts/patch-mr-b2b-controls-v17.mjs

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

# Base two-column PDF geometry.
node scripts/patch-pdf-two-column-slots-v10.mjs

# Absolute final authority: Uzatma Mesafesi remains visible at a fixed position,
# active for B2B and disabled for Mekik. PDF keeps at most two half-page cards;
# Mekik uses equal front/side views stacked vertically inside its half.
node scripts/patch-final-pdf-halves-extension-v11.mjs

# Some report paths omit the Mekik card entirely. This pass creates any missing used
# Mekik type card before the native-detail restoration below.
node scripts/patch-force-mekik-pdf-card-v12.mjs

# Absolute final Mekik visual authority: use the detailed native Mekik front/side
# projection, scale it down to fit the half-page slot, and restore the green detail labels.
node scripts/patch-mekik-native-front-details-v13.mjs

# Restore missing Serbest Cizim B2B cards and establish the generic two-half container.
node scripts/patch-final-pdf-two-halves-v14.mjs

# Previous Excel-layout pass; final v16 below removes fixed left/right assumptions.
node scripts/patch-pdf-excel-sketch-layout-v15.mjs

# Type-driven layout: side does not matter.
node scripts/patch-pdf-type-layout-v16.mjs

# Repair empty B2B shells by locating the richer rendered card.
node scripts/patch-pdf-b2b-rich-card-v17.mjs

# Legacy card-reparenting pass retained for compatibility with old reports.
node scripts/patch-pdf-excel-layout-v18.mjs

# Absolute final PDF authority: do not infer cards from already-mutated DOM. Rebuild
# technical type pages directly from the racks actually used in Serbest Cizim.
# Every page has exactly two 50% slots; order decides left/right, not system type.
# Mekik = front over side. B2B = one full-height front/technical view.
node scripts/patch-pdf-direct-type-pages-v19.mjs

# User-facing final authority: restore the exact B2B Kesit Yer Belirleme capture
# after v19 rebuilds pages; keep Mekik front/side separate; make product arrows
# reliable and keep Uzatma Mesafesi fixed above the disclosures.
node scripts/patch-final-user-repairs-v20.mjs

# Fail the deployment if any generated inline browser runtime has invalid syntax.
node scripts/verify-inline-runtime-syntax-v21.mjs

grep -q "mode==='front'&&typeof m2SharedScaleReportSvg" scripts/patch-pdf-direct-type-pages-v19.mjs
grep -q "m2LayoutState.racks.filter" scripts/patch-pdf-direct-type-pages-v19.mjs
! grep -q "rafex-v19-detail-chip" scripts/patch-pdf-direct-type-pages-v19.mjs
grep -q "rafexRenderSelectedB2BSections" client/b2b-section-positioner-v5.js
grep -q 'data-rafex-final-user-repairs="v20"' scripts/patch-final-user-repairs-v20.mjs
echo "Production chain verified: technical Mekik front section + direct used-rack PDF type pages + two 50% slots + B2B front-only + saved-rack click performance fix + MR B2B-style controls."
