import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { transform } from './patch-site-localization-v202.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const portal = fs.readFileSync('portal.html', 'utf8');
const patchedReport = transform(portal);
assert(!patchedReport.includes('<article><h3>${t.extraTitle}</h3><p>${t.extraText}</p></article>'));
assert(patchedReport.includes('<article class="rafex-drawing-note-footer">'));
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
 await page.evaluate(() => {
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.id='perfDrawing';
   for(let i=0;i<10000;i++)svg.appendChild(document.createElementNS(svg.namespaceURI,'path'));
   const caption=document.createElementNS(svg.namespaceURI,'text'); caption.textContent='Kat sayısı'; svg.appendChild(caption);
   document.body.appendChild(svg);
 });
 await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,100)));
 await page.evaluate(()=>document.documentElement.lang='en');
 await page.waitForFunction(()=>document.querySelector('#label').textContent==='Edit Dimensions');
 await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,100)));
 const cost=await page.evaluate(async()=>{
   const before={...rafexTranslationStats};
   const svg=document.getElementById('perfDrawing');
   for(let i=0;i<100;i++)svg.setAttribute('title','Ölçüleri Düzenle');
   svg.querySelector('text').firstChild.nodeValue='Ölçüleri Düzenle';
   await new Promise(resolve=>setTimeout(resolve,120));
   return Object.fromEntries(Object.entries(rafexTranslationStats).map(([k,v])=>[k,v-before[k]]));
 });
 assert.equal(cost.subtreeScans,0,'tooltip/text change must not scan 10000 SVG paths');
 assert.equal(cost.attributeChecks,1,'100 tooltip writes must coalesce');
 assert.equal(cost.textChecks,1,'only the changed caption is checked');
 const idle=await page.evaluate(async()=>{const a=JSON.stringify(rafexTranslationStats);await new Promise(r=>setTimeout(r,150));return a===JSON.stringify(rafexTranslationStats);});
 assert(idle,'no idle translation polling');
 console.log('PASS: 10000 SVG paths, 100 tooltip writes: '+JSON.stringify(cost)+'; idle work zero.');
 await page.evaluate(()=>{
   document.querySelector('#m2ReportLanguage').appendChild(new Option('TR','tr'));
   document.querySelector('#m2ReportLanguage').value='tr';
   document.documentElement.lang='tr';
 });
 await page.waitForFunction(()=>document.querySelector('#label').textContent==='Ölçüleri Düzenle');
 await page.waitForTimeout(100);
 const turkishIdle=await page.evaluate(async()=>{
   const before=JSON.stringify(rafexTranslationStats);
   const svg=document.getElementById('perfDrawing');
   for(let i=0;i<100;i++)svg.setAttribute('title','Kat sayısı');
   svg.querySelector('text').firstChild.nodeValue='Kat sayısı';
   await new Promise(resolve=>setTimeout(resolve,100));
   return before===JSON.stringify(rafexTranslationStats);
 });
 assert(turkishIdle,'Turkish site/output must not schedule translation work for drawing mutations');
 console.log('PASS: Turkish drawing updates schedule zero translation work.');
 const rows=JSON.parse(fs.readFileSync('client/site-translations.json','utf8'));
 const dynamicCases = [
  ['Son sürüm · 9cbbca9','Latest version · 9cbbca9','Dernière version · 9cbbca9'],
  ['Yüklenme: 24.09.2026 17:33:22','Loaded: 24.09.2026 17:33:22','Chargement: 24.09.2026 17:33:22'],
  ['Kapalı Notları Göster (2)','Show Closed Notes (2)','Afficher les notes clôturées (2)'],
  ['1. ÖNERİ · HR90.80.2,0 · Ly 1,200 · 11,190 kg','1. RECOMMENDATION · HR90.80.2,0 · Ly 1,200 · 11,190 kg','1. RECOMMANDATION · HR90.80.2,0 · Ly 1,200 · 11,190 kg'],
  ['2.700 mm travers için: 13 × 200 mm + 1 × 100 mm.','For a 2.700 mm beam: 13 × 200 mm + 1 × 100 mm.','Pour une lisse de 2.700 mm : 13 × 200 mm + 1 × 100 mm.'],
  ['1. Alanı Aç','Open Area 1','Ouvrir la zone 1'],
  ['4. kenar','Edge 4','Côté 4'],
  ['1. Alan · B2B ÜRÜNLERİ','Area 1 · B2B COMPONENTS','Zone 1 · COMPOSANTS B2B'],
  ['KESİT A · B2B · ÖNDEN GÖRÜNÜŞ · 3D İLE AYNI MODÜL','SECTION A · B2B · FRONT VIEW · SAME MODULE AS IN 3D','COUPE A · B2B · VUE DE FACE · MÊME MODULE QU’EN 3D'],
  ['1 BÖLÜM · HER BÖLÜM 2,700 mm','1 BAY · EACH BAY 2,700 mm','1 TRAVÉE · CHAQUE TRAVÉE 2,700 mm']
 ];
 for(const [tr,en,fr] of dynamicCases) {
   assert.deepEqual(await page.evaluate(tr=>[rafexTranslateText(tr,'en'),rafexTranslateText(tr,'fr')],tr),[en,fr],tr);
 }
 for(const [tr,en,fr] of rows.filter(r=>r[0].length>=2)) {
  const actual=await page.evaluate(([tr])=>[rafexTranslateText(tr,'en'),rafexTranslateText(tr,'fr')],[tr]);
  assert.deepEqual(actual,[en,fr],tr);
 }
 assert.deepEqual(errors,[]);
 console.log(`PASS: ${rows.length} site entries; EN/FR/TR switching; dynamic text updates; protected input/name; independent report language; idempotent patch; no browser errors.`);
} finally { await browser.close(); }
