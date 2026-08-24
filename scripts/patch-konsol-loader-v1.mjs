import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('HTML_BASE64 not found for Konsol loader');
let html = Buffer.from(match[2], 'base64').toString('utf8');

html = html.replace(/<script data-rafex-konsol-viewer-loader="v1"[^>]*><\/script>/g, '');
const loader = '<script data-rafex-konsol-viewer-loader="v1" defer src="/konsol-viewer.js?v=konsol-v1"></script>';
if (!html.includes('/konsol-viewer.js?v=konsol-v1')) html = html.replace('</head>', `${loader}\n</head>`);
if (!html.includes('/konsol-viewer.js?v=konsol-v1')) throw new Error('Konsol viewer loader HTML içine eklenemedi.');

const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Konsol Kollu viewer loader aktif.');
