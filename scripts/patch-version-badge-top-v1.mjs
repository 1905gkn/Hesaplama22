import fs from 'node:fs';

const target = 'dist/server/index.js';
if (!fs.existsSync(target)) {
  console.log('Legacy version badge generator disabled: dist not present.');
  process.exit(0);
}

let source = fs.readFileSync(target, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!match) throw new Error('Legacy version badge cleanup: HTML_BASE64 bulunamadi.');

let html = Buffer.from(match[2], 'base64').toString('utf8');

// Eski beyaz/sag-alt badge ureticisini tamamen devre disi birak.
html = html
  .replace(/<style\s+data-rafex-version-badge-top="v\d+">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script\s+data-rafex-version-badge-top="v\d+">[\s\S]*?<\/script>\s*/g, '')
  .replace(/<div\s+id="rafexVersionBadge"[^>]*>[\s\S]*?<\/div>\s*/g, '')
  .replace(/<span\s+id="rafexVersionBadge"[^>]*>[\s\S]*?<\/span>\s*/g, '')
  .replace(/<span\s+id="rafexBuildVersionBadge"[^>]*>[\s\S]*?<\/span>\s*/g, '');

const encoded = Buffer.from(html, 'utf8').toString('base64');
source = source.replace(match[0], `const HTML_BASE64 =\n  "${encoded}";`);
fs.writeFileSync(target, source);
console.log('Legacy version badge generator disabled; cleanup only.');
