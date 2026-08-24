import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('HTML_BASE64 not found');

let html = Buffer.from(match[2], 'base64').toString('utf8');

// JavaScript \b treats the Turkish dotless "ı" as a non-word character.
// Because of that, "Ayak takımı" was not recognized as already renamed and
// the MutationObserver kept turning it into "Ayak takımı takımı ...".
const brokenGuard = "!/^Ayak (takımı|Profili)\\b/i.test(value)";
const fixedGuard = "!/^Ayak (?:takımı|Profili)(?=\\s|$)/i.test(value)";

if (!html.includes(brokenGuard)) {
  throw new Error('Mekik ayak adı tekrar döngüsü için beklenen v25 koruması bulunamadı.');
}

html = html.replace(brokenGuard, fixedGuard);
if (!html.includes(fixedGuard)) {
  throw new Error('Mekik ayak adı tekrar döngüsü düzeltmesi uygulanamadı.');
}

const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Mekik ayak adı tekrar döngüsü düzeltildi (v26).');
