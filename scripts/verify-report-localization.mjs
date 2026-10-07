import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
const portal=fs.readFileSync(process.argv[2] || 'portal.html','utf8');
const declarations=portal.slice(portal.indexOf('const UI_TRANSLATIONS ='),portal.indexOf('      function applyTranslations('));
const dictStart=portal.indexOf('function m2ReportDictionary('),dictEnd=portal.indexOf('      function m2CorporateUsedTypes()',dictStart);
const dictionary=portal.slice(dictStart,dictEnd);
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const runtime=fs.readFileSync('client/site-localization.js','utf8').replace('/* TRANSLATION_ROWS */ []',fs.readFileSync('client/site-translations.json','utf8'));
 const report=fs.readFileSync('client/report-localization.js','utf8');
 await page.setContent(`<html lang="tr"><body><select id="m2ReportLanguage"><option value="en">English</option><option value="tr">Türkçe</option><option value="fr">Français</option></select><div id="m2CorporatePreview"></div><script>let appLanguage='tr';${declarations};${dictionary};function applyTranslations(){};const i18nObserver=new MutationObserver(()=>{});function m2BuildCorporatePages(){const t=m2ReportDictionary(document.getElementById('m2ReportLanguage').value);return '<section class="m2-corporate-cover"><h1>Özel Depo Projesi</h1></section><h2>'+t.bom+'</h2><p>Blok Açıklamaları</p><p>Çizim Notu</p><p>Çizimler 3D olduğu için perspektiften dolayı görsel yanılmalar olabilir.</p><p>UAKS ayak koruma</p><p>Bu raf tipine bağlı</p><p>APKCC · kaynaklı</p><p>120 mm · galvaniz</p><svg><text>4 KAT</text></svg>';};function m2RenderCorporateReport(){document.getElementById('m2CorporatePreview').innerHTML=m2BuildCorporatePages();};</script><script>${runtime}</script><script>${report}</script></body></html>`);
 const english=await page.evaluate(()=>m2BuildCorporatePages());
 for(const expected of ['BILL OF MATERIALS','Block Descriptions','Drawing Note','visual distortions','UAKS upright protector','Assigned to this rack type','welded','galvanised','4 LEVELS'])assert(english.includes(expected),expected);
 assert(english.includes('Özel Depo Projesi'),'Project name preserved');
 for(const tr of ['Çizim Notu','Blok Açıklamaları','kaynaklı','galvaniz','ayak koruma'])assert(!english.includes(tr),'Untranslated '+tr);
 await page.evaluate(()=>{document.getElementById('m2ReportLanguage').value='tr';m2RenderCorporateReport();});
 assert((await page.locator('#m2CorporatePreview').innerText()).includes('Çizim Notu'));
 await page.evaluate(()=>{document.getElementById('m2ReportLanguage').value='en';m2RenderCorporateReport();});
 assert((await page.locator('#m2CorporatePreview').innerText()).includes('Drawing Note'));
 assert.deepEqual(errors,[]);
 for(const m of portal.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))new vm.Script(m[1]);
 console.log('PASS: English report HTML before print, product descriptions, SVG captions, EN/TR switching and preserved project name.');
}finally{await browser.close();}
