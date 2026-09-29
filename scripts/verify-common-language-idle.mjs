import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {transform as localize} from './patch-site-localization-v202.mjs';
import {execFileSync} from 'node:child_process';
const injectRows=runtime=>runtime.replace('/* TRANSLATION_ROWS */ []',JSON.stringify(JSON.parse(fs.readFileSync('client/site-translations.json','utf8'))).replaceAll('<','\\u003c'));
function transform(html){
 const result=localize(html);
 return process.argv.includes('--previous') ? result.replace(injectRows(fs.readFileSync('client/site-localization.js','utf8')),()=>injectRows(execFileSync('git',['show','b8a7510:client/site-localization.js'],{encoding:'utf8'}))) : result;
}
const {chromium}=createRequire(import.meta.url)('playwright');
const portal=fs.readFileSync('portal.html','utf8');
const declarations=portal.slice(portal.indexOf('const UI_TRANSLATIONS ='),portal.indexOf('      function applyTranslations('));
const scripts=[['patch-uniform-system-banner-v95.mjs','data-rafex-uniform-system-banner'],['patch-common-b2b-input-card-v100.mjs','data-rafex-common-b2b-input']];
const runtimes=scripts.map(([file])=>{
 const source=fs.readFileSync('scripts/'+file,'utf8');
 return [...source.matchAll(/<script data-rafex-[^>]*>[\s\S]*?<\/script>/g)].map(m=>m[0]).join('\n');
}).join('\n');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 for(const language of ['tr','en','fr']) {
  const page=await browser.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setContent(transform(`<html lang="${language}"><body><main id="page" class="rafex-free-drawing-page b2b-mode" data-rafex-common-active="1" data-rafex-common-system="b2b"><section class="hero"></section><div id="rafexUnifiedSystemPicker"><input name="rafexUnifiedSystem" value="b2b" checked type="radio"></div><label>Proje Adı<input id="rafexCommonProjectName"></label><section class="b2b-input-card"><header class="b2b-input-head"><h3>Raf Ölçüleri</h3><span>Anında güncellenir</span></header><div class="b2b-input-body"></div></section></main><script>let appLanguage='${language}';${declarations};function applyTranslations(){};const i18nObserver=new MutationObserver(()=>{});</script>${runtimes}</body></html>`));
  await page.waitForTimeout(1500);
  const metrics=await page.evaluate(async()=>{
   let changes=0;const observer=new MutationObserver(rs=>changes+=rs.length);
   observer.observe(document.getElementById('page'),{childList:true,subtree:true,characterData:true});
   const before={...rafexTranslationStats};
   document.getElementById('rafexCommonProjectName').focus();
   await new Promise(r=>setTimeout(r,400));observer.disconnect();
   return {changes,scans:rafexTranslationStats.subtreeScans-before.subtreeScans,heading:document.querySelector('.hero').textContent,focus:document.activeElement.id};
  });
  console.log(language,JSON.stringify(metrics));
  if(!process.argv.includes('--repro'))assert.equal(metrics.changes,0,language+': idle Common view must not rewrite translated headings');
  assert.equal(metrics.focus,'rafexCommonProjectName');assert.deepEqual(errors,[]);
  await page.close();
 }
}finally{await browser.close();}
