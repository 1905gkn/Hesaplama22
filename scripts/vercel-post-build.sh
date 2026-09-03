#!/usr/bin/env bash
set -euo pipefail

node scripts/patch-mekik-common-latest-context-v1.mjs
node scripts/patch-mekik-viewer-stability-v1.mjs
node scripts/patch-mekik-front-glb-v2.mjs
node scripts/patch-common-mekik-front-glb-v1.mjs
node scripts/patch-remove-legacy-mekik-front-runtime-v1.mjs
node scripts/patch-common-system-isolation-v1.mjs
node scripts/patch-common-mekik-view-colors-v1.mjs
node scripts/patch-heavy-viewers-on-demand-v1.mjs
node scripts/patch-uniform-system-banner-v95.mjs
node scripts/patch-common-layout-theme-v96.mjs
node scripts/patch-dist-version-badge-position-v1.mjs
node scripts/verify-uniform-system-banner-v95.mjs
node scripts/emit-static-index-v1.mjs

