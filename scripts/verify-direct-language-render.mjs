import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {transform} from './patch-site-localization-v202.mjs';
import {localizeRenderSources} from './localize-render-sources.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const portal=fs.readFileSync('portal.html','utf8');
const declarations=portal.slice(portal.indexOf('const UI_TRANSLATIONS ='),portal.indexOf('      function applyTranslations('));
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setContent(transform(`<html lang="en"><body><div id="label"></div><div id="content"></div><div id="m2A4Sheet"></div><select id="m2ReportLanguage"><option value="fr">FR</option></select><script>${declarations};function applyTranslations(){};const i18nObserver=new MutationObserver(()=>{});</script></body></html>`));
 await page.addScriptTag({content:localizeRenderSources(`window.renderFixture=function(){document.getElementById('label').textContent='Raf Ölçüleri';document.getElementById('content').innerHTML='<label>Proje Adı<input value="Ortak Çizim"></label><span translate="no">Ortak Çizim</span><button>Ölçüleri Düzenle</button>';document.getElementById('m2A4Sheet').innerHTML='<b>Ölçüleri Düzenle</b>';};`)});
 for(const language of ['en','fr','tr','en']){
  const result=await page.evaluate(language=>{document.documentElement.lang=language;renderFixture();return {label:document.getElementById('label').textContent,button:document.querySelector('#content button').textContent,name:document.querySelector('#content input').value,protected:document.querySelector('[translate=no]').textContent,report:document.querySelector('#m2A4Sheet b').textContent};},language);
  assert.equal(result.label,await page.evaluate(l=>rafexTranslateText('Raf Ölçüleri',l),language));
  assert.equal(result.button,await page.evaluate(l=>rafexTranslateText('Ölçüleri Düzenle',l),language));
  assert.equal(result.name,'Ortak Çizim');assert.equal(result.protected,'Ortak Çizim');assert.equal(result.report,'Modifier les cotes');
 }
 await page.waitForTimeout(100);
 const mutations=await page.evaluate(async()=>{let count=0;const observer=new MutationObserver(records=>count+=records.length);observer.observe(document.body,{childList:true,subtree:true,characterData:true});for(let i=0;i<100;i++)renderFixture();await new Promise(r=>setTimeout(r,100));observer.disconnect();return count;});
 assert.equal(mutations,0);assert.deepEqual(errors,[]);
 console.log('PASS: immediate EN/FR/TR rendering; 100 identical renders cause zero DOM mutations; user names and independent PDF language preserved.');
}finally{await browser.close();}
