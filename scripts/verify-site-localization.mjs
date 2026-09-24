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
const navSource = fs.readFileSync('scripts/patch-free-nav-ortak-cizim-v39.mjs','utf8');
const navScript = navSource.match(/<script data-rafex-free-nav-ortak="v39">[\s\S]*?<\/script>/)[0];
const html = transform(`<html lang="tr"><body><button id="label">Ölçüleri Düzenle</button><span id="dynamic">Kat sayısı</span><input id="user" value="Ortak Çizim"><span translate="no">Ortak Çizim</span><select id="m2ReportLanguage"><option value="fr">FR</option></select><section id="m2A4Sheet"><b>Ölçüleri Düzenle</b></section><script>let appLanguage='tr';${declarations};function applyTranslations(){};const i18nObserver=new MutationObserver(()=>{});</script></body></html>`);
assert.equal(transform(html), html, 'patch must be idempotent');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
 const page = await browser.newPage();
 const errors=[]; page.on('pageerror', e=>errors.push(e.message));
 // Cap the legacy observer in the fixture so a regression fails instead of
 // permanently starving the renderer and hanging the test process.
 const boundedNav = navScript.replace('navObserver=new MutationObserver(apply);', 'navObserver=new MutationObserver(()=>{window.navChanges=(window.navChanges||0)+1;if(window.navChanges>80){navObserver.disconnect();window.navLoop=true;return;}apply();});');
 const integrated = transform(html.replace(/<script>\n\/\* site-localization-v202 \*\/[\s\S]*?<\/script>\n/, '').replace('<body>', '<body><nav id="nav"><button data-page="free"><i>01</i>Ortak Çizim</button></nav>'+boundedNav));
 const unfixed = integrated.replace("const LABEL=window.rafexTranslateText?.('Ortak Çizim',document.documentElement.lang)||'Ortak Çizim';",'');
 await page.setContent(unfixed);
 await page.evaluate(()=>document.documentElement.lang='en');
 await page.waitForFunction(()=>window.navLoop===true);
 console.log('REPRODUCED: legacy navigation exceeded 80 mutually-triggered observer updates.');
 await page.goto('about:blank');
 await page.setContent(integrated);
 await page.evaluate(()=>document.documentElement.lang='en');
 await page.waitForFunction(()=>document.querySelector('#label').textContent==='Edit Dimensions');
 await page.waitForFunction(()=>document.querySelector('#nav button').getAttribute('aria-label')==='Combined Layout');
 await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,350)));
 assert.equal(await page.evaluate(()=>!!window.navLoop),false,'legacy nav and translation must settle, not ping-pong');
 assert.equal(await page.locator('#m2A4Sheet b').textContent(), 'Modifier les cotes');
 assert.equal(await page.locator('#user').inputValue(),'Ortak Çizim');
 assert.equal(await page.locator('[translate=no]').textContent(),'Ortak Çizim');
 await page.evaluate(()=>document.querySelector('#dynamic').firstChild.nodeValue='Ölçüleri Düzenle');
 await page.waitForFunction(()=>document.querySelector('#dynamic').textContent==='Edit Dimensions');
 await page.evaluate(()=>document.documentElement.lang='fr');
 await page.waitForFunction(()=>document.querySelector('#dynamic').textContent==='Modifier les cotes');
 assert.equal(await page.locator('#nav button').getAttribute('aria-label'),'Implantation combinée');
 await page.evaluate(()=>document.documentElement.lang='tr');
 await page.waitForFunction(()=>document.querySelector('#dynamic').textContent==='Ölçüleri Düzenle');
 assert.equal(await page.locator('#nav button').getAttribute('aria-label'),'Ortak Çizim');
 const rows=JSON.parse(fs.readFileSync('client/site-translations.json','utf8'));
 for(const [tr,en,fr] of rows.filter(r=>r[0].length>=2)) {
  const actual=await page.evaluate(([tr])=>[rafexTranslateText(tr,'en'),rafexTranslateText(tr,'fr')],[tr]);
  assert.deepEqual(actual,[en,fr],tr);
 }
 assert.deepEqual(errors,[]);
 console.log(`PASS: ${rows.length} site entries; EN/FR/TR switching; dynamic text updates; protected input/name; independent report language; idempotent patch; no browser errors.`);
} finally { await browser.close(); }
