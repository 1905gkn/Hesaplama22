#!/usr/bin/env bash
set -euo pipefail

node scripts/patch-common-no-project-name-v91.mjs
node scripts/patch-common-system-isolation-v1.mjs
node scripts/patch-common-mekik-view-colors-v1.mjs
node scripts/patch-dist-version-badge-position-v1.mjs
