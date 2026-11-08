import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createInterfaceTranslator} from '../client/translation-core-v542.mjs';
import {transform} from './patch-site-localization-v202.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
const rows=JSON.parse(fs.readFileSync('client/site-translations.json','utf8')),t=createInterfaceTranslator(rows);
const labels=['Raf Ekle','Seçim','Çizimden Yerleşim · DXF / PDF / Görsel','◯ Daire','⧉ Çizimden Kopyala','▣ Kolon','Kare / Dikdörtgen','En (mm)','Boy (mm)','Kaydet ve Ekle','Korumaları Sil','Müşteriyle Paylaş','ÖLÇÜ YAZISI','AÇI °','Sağa/Sola °','Yukarı/Aşağı °','Yatay açı: 50° · Yukarı/Aşağı: +10°','Raf tipi yok','Kayıtlı raf tipini seç; perspektif ve ölçü görünümünü raf tipine göre ayrı ayrı kaydet.','Taslak dosyasını içe aktar','Yeni çalışma olarak aç','Taslak dosyasını indir','Kaynak proje #470','size bir not atadı.'];
for(const s of labels)for(const lang of ['en','fr'])assert.notEqual(t(s,lang),s,s+' '+lang);
assert.equal(t('Yatay açı: 50° · Yukarı/Aşağı: +10°','fr'),'Angle horizontal: 50° · Haut/Bas: +10°');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const bootstrap='const UI_TRANSLATIONS={en:{},fr:{}};let applyTranslations,translatedUiText;const i18nObserver={disconnect(){}};const i18nOriginalText=new WeakMap(),i18nOriginalAttributes=new WeakMap();';
await page.setContent(transform('<html lang="tr"><body><div id="labels"></div><script>'+bootstrap+'</script></body></html>'));
await page.evaluate(labels=>{document.getElementById('labels').innerHTML=labels.map((s,i)=>'<button id="label'+i+'">'+s+'</button>').join('');},labels);
for(const lang of ['en','fr','tr']){await page.evaluate(lang=>document.documentElement.lang=lang,lang);await page.waitForTimeout(80);const actual=await page.locator('#labels button').allTextContents();assert.deepEqual(actual,labels.map(s=>t(s,lang)));}
await page.route('http://rafex.test/**',route=>route.fulfill({body:'<html><head></head><body><header></header><button id="fit">Tümünü sığdır</button><span translate="no">Emine GÜLAY</span></body></html>',contentType:'text/html; charset=utf-8'}));await page.goto('http://rafex.test/');
const customer=fs.readFileSync('client/customer-localization-v542.mjs','utf8').replace(/^import .*;\r?\n/gm,'').replace('export function','function');
const approval=fs.readFileSync('client/customer-approval-v451.mjs','utf8').replace('export function','function');
await page.addScriptTag({content:'const rows='+JSON.stringify(rows)+';'+createInterfaceTranslator.toString()+';'+customer+';window.locale=installCustomerLocalization();'+approval+';installCustomerApproval({request:async()=>({})});'});
for(const lang of ['en','fr','tr']){await page.locator('[data-language="'+lang+'"]').click();assert.equal(await page.locator('html').getAttribute('lang'),lang);assert.equal(await page.locator('#customerApprovalButton').textContent(),t('Onaylıyorum',lang));assert.equal(await page.locator('#fit').textContent(),t('Tümünü sığdır',lang));assert.equal(await page.locator('[data-language="'+lang+'"]').getAttribute('aria-pressed'),'true');assert.equal(await page.evaluate(()=>localStorage.getItem('rafexCustomerLanguage')),lang);}
assert.equal(await page.evaluate(()=>document.getElementById('customerApprovalButton').nextElementSibling.id),'customerLanguages545');
await page.setViewportSize({width:375,height:812});assert.equal(await page.locator('#customerLanguages545 button').count(),3);assert.deepEqual(errors,[]);
assert(!fs.readFileSync('scripts/reliable-drafts-v407.mjs','utf8').includes("['rafexNewProjectV133','rafexDraftSaveTopV407']"));
console.log('PASS: all marked labels, dynamic TR/EN/FR switching, customer flags, approval label, selection persistence and duplicate draft removal.');
}finally{await browser.close();}


