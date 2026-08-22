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

# Free-layout geometry table: cache unchanged rack/symbol bounds and, only during an
# active drag, use an exact broad-phase spatial grid before the existing collision
# formula. Live distance/collision rules and final AABB tests stay unchanged.
node scripts/patch-free-layout-geometry-cache-v27.mjs

# One-rack drag is the dominant remaining cost even with one rack on the floor.
# Keep collision/distance calculations live, but keep DOM/SVG nodes in lookup tables
# and move only the active rack plus its live guide layer instead of rebuilding all SVG.
node scripts/patch-free-layout-dom-table-v28.mjs

# Central runtime tables: walls, columns, blocking accessories, distance dependencies,
# DOM registry, dirty queue and frame cache. These remove repeated topology scans while
# preserving the exact live distance/collision formulas.
node scripts/patch-free-layout-runtime-tables-v29.mjs

# Preserve live wall/rack/column collision behavior, but coalesce raw pointer events
# into one calculation per animation frame and update the expensive guide SVG at 64 ms.
node scripts/patch-free-layout-live-frame-v31.mjs

node scripts/patch-mobile-responsive.mjs
# Mobile phones should open the exact desktop/web layout instead of the stacked mobile UI.
# Use a 1366px layout viewport scaled to fit, with pinch zoom preserved.
node scripts/patch-mobile-desktop-view-v30.mjs
node scripts/patch-foot-priority-fixed-sidebar.mjs
node scripts/patch-ui-runtime-stability.mjs
node scripts/patch-login-home-sidebar.mjs

# Saved rack type selection must not trigger a full free-layout SVG rerender.
node scripts/patch-saved-rack-type-click-performance-v20.mjs

# Mekik code must stay in the main application script, before later repair runtimes.
node scripts/patch-runtime-insertion-order-v22.mjs

# MR baseline is 773a73f. Apply the approved follow-up, then the current MR fixes.
node scripts/patch-mr-773a-followup-v1.mjs
node scripts/patch-mr-tray-clearance-v19.mjs
node scripts/patch-mr-saved-types-v18.mjs
node scripts/patch-mr-save-api-v20.mjs

# B2B front-direction physical width is independent from HR90/100/120/127/140
# profile family: every upright occupies 60 mm. Joined modules share one upright.
node scripts/patch-b2b-physical-width-v23.mjs

# Destroy every active 3D render loop cleanly before Serbest interaction: cancel RAF,
# disconnect observers/listeners and release viewer-owned GPU resources.
node scripts/patch-viewer-lifecycle-performance-v30.mjs

grep -q 'const trayDepth = Math.max(1, depth - 25);' client/mr-viewer.entry.js
grep -q 'data-rafex-mr-v18="1"' portal.html
grep -q 'm2ActiveModule="mr"' portal.html
grep -q 'm2ActiveModule === "mr" ? "/api/b2b-types"' portal.html
grep -q 'const B2B_PHYSICAL_FOOT_WIDTH = 60;' portal.html
grep -q 'footWidth: B2B_PHYSICAL_FOOT_WIDTH' portal.html
grep -q 'const m2PerfGeometryTable = new Map();' portal.html
grep -q 'm2PerfCollisionCandidates(a).some' portal.html
grep -q 'const m2PerfRackDomTable = new Map();' portal.html
grep -q 'm2PerfRenderSingleRackDragFrame()' portal.html
grep -q 'const m2LayoutRuntimeCache = {' portal.html
grep -q 'm2PerfWallGeometryTable()' portal.html
grep -q 'm2PerfBlockingSymbols().some' portal.html
grep -q 'function m2ScheduleLiveRackDrag(svg,event)' portal.html
grep -q 'now-drag.perfLastGuideAt<64' portal.html
grep -q 'data-rafex-mobile-desktop-view="v30"' portal.html
grep -q '__rafexLifecycleV30' client/b2b-viewer.entry.js
grep -q '__rafexLifecycleV30' client/mr-viewer.entry.js

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
echo "Production chain verified: live Serbest Cizim collision preserved + pointer events coalesced to one live calculation per frame + guide SVG throttled to 64 ms + geometry/cache/DOM/runtime tables v27-v29 + mobile desktop viewport v30 + 3D lifecycle cleanup v30 + technical Mekik front section + direct used-rack PDF type pages + two 50% slots + B2B front-only + saved-rack click performance fix + MR saved-types v18 + MR tray clearance v19 + MR save API v20 + B2B physical upright width 60 mm."
