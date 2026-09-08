import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('dist/server/index.js', 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('Common runtime cleanup: HTML_BASE64 bulunamadi');
const html = Buffer.from(match[2], 'base64').toString('utf8');
const count = (needle) => html.split(needle).length - 1;

if (count('data-rafex-common-save-only="v92"') !== 1) throw new Error('v92 save-only runtime tekil degil');
for (const legacy of [
  'data-rafex-common-save-mekik-front="v92"',
  'data-rafex-mekik-front="restored-v91"',
  'frontProjection',
]) {
  if (html.includes(legacy)) throw new Error(`Eski Mekik on gorunus otoritesi kaldi: ${legacy}`);
}
if (html.includes('<script data-rafex-common-system-isolation="v1">')) throw new Error('Eski ortak sistem gozlemcisi hala aktif');
if (count('window.RafexRuntimeAuthority=') !== 1) throw new Error('Ortak runtime otoritesi tekil degil');

const productRuntime = html.match(/<script data-rafex-final-products-mekik="v4">([\s\S]*?)<\/script>/)?.[1];
if (!productRuntime) throw new Error('Urun runtime v4 bulunamadi');
if (productRuntime.includes('[0,40,140,350]') || productRuntime.includes("document.addEventListener('click',schedule,true)")) {
  throw new Error('Urun listesinde eski global dortlu tetikleme kaldi');
}
for (const required of ['scheduleTimer', "closest?.('#page button", 'setTimeout(refreshProducts,40)']) {
  if (!productRuntime.includes(required)) throw new Error(`Urun debounce dogrulamasi eksik: ${required}`);
}

for (const [attr, version] of [
  ['data-rafex-pdf-two-column-slots', 'v10'],
  ['data-rafex-final-pdf-halves-extension', 'v11'],
  ['data-rafex-force-mekik-pdf', 'v12'],
  ['data-rafex-mekik-native-front-details', 'v13'],
  ['data-rafex-pdf-two-halves', 'v14'],
  ['data-rafex-pdf-excel-sketch', 'v15'],
  ['data-rafex-pdf-type-layout', 'v16'],
  ['data-rafex-pdf-b2b-rich-card', 'v17'],
  ['data-rafex-pdf-excel-layout', 'v18'],
]) {
  if (html.includes(`${attr}="${version}"`)) throw new Error(`Eski PDF katmani kaldi: ${version}`);
}
if (count('data-rafex-pdf-direct-types="v19"') !== 2) throw new Error('PDF v19 stil/script tekil degil');
if (count('data-rafex-final-user-repairs="v20"') !== 2) throw new Error('PDF v20 stil/script tekil degil');
for (const required of ['function buildB2BCard', 'function buildMekikCard', 'm2LayoutState.racks.filter', 'restoreSelectedB2B']) {
  if (!html.includes(required)) throw new Error(`B2B/Mekik PDF korumasi eksik: ${required}`);
}

for (const marker of [
  'data-rafex-common-save-only="v92"',
  'data-rafex-final-products-mekik="v4"',
  'data-rafex-pdf-direct-types="v19"',
  'data-rafex-final-user-repairs="v20"',
]) {
  const runtime = html.match(new RegExp(`<script ${marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}>([\\s\\S]*?)<\\/script>`))?.[1];
  if (!runtime) throw new Error(`Runtime bulunamadi: ${marker}`);
  new vm.Script(runtime, {filename: marker});
}

console.log('PASS: Ortak Cizim otoritesi tekil; eski Mekik/PDF katmanlari yok; urun tetikleme debounce; B2B ve Mekik PDF kartlari korunuyor.');
