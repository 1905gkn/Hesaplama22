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
node scripts/patch-dist-version-badge-position-v1.mjs

# The worker contains the exact final HTML/PWA shell after all production
# patches. Export that same shell as real files so Vercel can serve the app,
# service worker, icons and logo from its static CDN instead of invoking the
# catch-all serverless function for every page load and asset request.
node <<'NODE'
const fs = require('node:fs');
const source = fs.readFileSync('dist/server/index.js', 'utf8');

function capture(regex, label) {
  const match = source.match(regex);
  if (!match) throw new Error(`${label} not found in dist/server/index.js`);
  return match;
}

const htmlMatch = capture(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/, 'HTML_BASE64');
fs.writeFileSync('dist/index.html', Buffer.from(htmlMatch[2], 'base64'));

const swMatch = capture(/const\s+SERVICE_WORKER\s*=\s*`([\s\S]*?)`;/, 'SERVICE_WORKER');
fs.writeFileSync('dist/service-worker.js', swMatch[1]);

for (const [name, file] of [
  ['RAFEX_LOGO_BASE64', 'rafex-logo.png'],
  ['APP_ICON_192_BASE64', 'app-icon-192.png'],
  ['APP_ICON_512_BASE64', 'app-icon-512.png'],
]) {
  const match = capture(new RegExp(`const\\s+${name}\\s*=\\s*(["'])([A-Za-z0-9+/=]+)\\1`), name);
  fs.writeFileSync(`dist/${file}`, Buffer.from(match[2], 'base64'));
}

const manifest = {
  name: 'Rafex Configurator',
  short_name: 'Rafex',
  description: 'Raf sistemleri hesaplama ve proje yönetim uygulaması',
  lang: 'tr',
  id: '/',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'any',
  background_color: '#f2f4f1',
  theme_color: '#173c2d',
  categories: ['business', 'productivity'],
  icons: [
    { src: '/app-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/app-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
};
fs.writeFileSync('dist/manifest.webmanifest', JSON.stringify(manifest));

for (const file of [
  'dist/index.html',
  'dist/service-worker.js',
  'dist/manifest.webmanifest',
  'dist/rafex-logo.png',
  'dist/app-icon-192.png',
  'dist/app-icon-512.png',
]) {
  if (!fs.statSync(file).size) throw new Error(`${file} is empty`);
}
NODE
