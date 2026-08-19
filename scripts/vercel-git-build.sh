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

echo "Approved 34vnlp6h8 prebuilt chain reproduced in dist with current B2B UX fixes."
