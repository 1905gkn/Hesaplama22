#!/usr/bin/env bash
set -euo pipefail

node scripts/patch-mekik-common-latest-context-v1.mjs
node scripts/patch-mekik-viewer-stability-v1.mjs
node scripts/patch-mekik-front-glb-v2.mjs
node scripts/patch-common-mekik-front-glb-v1.mjs
node scripts/patch-common-no-project-name-v91.mjs
node scripts/patch-remove-legacy-mekik-front-runtime-v1.mjs
node scripts/patch-common-system-isolation-v1.mjs
node scripts/patch-common-mekik-view-colors-v1.mjs
node scripts/patch-heavy-viewers-on-demand-v1.mjs
node scripts/patch-dist-version-badge-position-v1.mjs

