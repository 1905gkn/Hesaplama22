import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { transform } from './patch-site-localization-v202.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const portal = fs.readFileSync('portal.html', 'utf8');
const quoted = transform('<html><body><script>const printed="<body>Print</body>";</script></body></html>');
for (const match of quoted.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
const declarations = portal.slice(portal.indexOf('const UI_TRANSLATIONS ='), portal.indexOf('      function applyTranslations('));
const html = transform(`<html lang="tr"><body><button id="label">Ölçüleri Düzenle</button><span id="dynamic">Kat sayısı</span><input id="user" value="Ortak Çizim"><span translate="no">Ortak Çizim</span><select id="m2ReportLanguage"><option value="fr">FR</option></select><section id="m2A4Sheet"><b>Ölçüleri Düzenle</b></section><script>let appLanguage='tr';${declarations};function applyTranslations(){};const i18nObserver=new MutationObserver(()=>{});</script></body></html>`);
assert.equal(transform(html), html, 'patch must be idempotent');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
 const page = await browser.newPage();
 const errors=[]; page.on('pageerror', e=>errors.push(e.message));
 await page.setContent(html);
 await page.evaluate(()=>document.documentElement.lang='en');
 await page.waitForFunction(()=>document.querySelector('#label').textContent==='Edit Dimensions');
 assert.equal(await page.locator('#m2A4Sheet b').textContent(), 'Modifier les cotes');
 assert.equal(await page.locator('#user').inputValue(),'Ortak Çizim');
 assert.equal(await page.locator('[translate=no]').textContent(),'Ortak Çizim');
 await page.evaluate(()=>document.querySelector('#dynamic').firstChild.nodeValue='Ölçüleri Düzenle');
 await page.waitForFunction(()=>document.querySelector('#dynamic').textContent==='Edit Dimensions');
 await page.evaluate(()=>document.documentElement.lang='fr');
 await page.waitForFunction(()=>document.querySelector('#dynamic').textContent==='Modifier les cotes');
 await page.evaluate(()=>document.documentElement.lang='tr');
 await page.waitForFunction(()=>document.querySelector('#dynamic').textContent==='Ölçüleri Düzenle');
 const rows=JSON.parse(fs.readFileSync('client/site-translations.json','utf8'));
 for(const [tr,en,fr] of rows.filter(r=>r[0].length>=2)) {
  const actual=await page.evaluate(([tr])=>[rafexTranslateText(tr,'en'),rafexTranslateText(tr,'fr')],[tr]);
  assert.deepEqual(actual,[en,fr],tr);
 }
 assert.deepEqual(errors,[]);
 console.log(`PASS: ${rows.length} site entries; EN/FR/TR switching; dynamic text updates; protected input/name; independent report language; idempotent patch; no browser errors.`);
} finally { await browser.close(); }
