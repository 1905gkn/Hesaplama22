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

bash scripts/build.sh

# The historical CLI/prebuilt deploy injected this after vercel build and then
# copied dist/server/index.js into the prebuilt function. During a native Git
# build Vercel packages dist only after buildCommand exits, so injecting here
# produces the same packaged server artifact.
node scripts/inject-b2b-section-positioner.mjs

echo "Approved 34vnlp6h8 prebuilt chain reproduced in dist with mobile optimization."
