import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {manualRuntime} from './b2b-manual-height-v121.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
let html=fs.readFileSync(process.argv[2]||'outputs/live-after-v162.html','utf8');
if(!process.argv.includes('--live'))html=html.replace(/<script data-rafex-manual-height="v121">[\s\S]*?<\/script>/,manualRuntime.match(/<script data-rafex-manual-height="v121">[\s\S]*?<\/script>/)[0]);
assert(html.includes('rafexManualHeightNoticeV163'));
const source=fs.readFileSync('client/b2b-viewer.entry.js','utf8');
const method=source.slice(source.indexOf('  normalizeOptions('),source.indexOf('  update(next'));
const normalize=vm.runInNewContext('({'+method+'}).normalizeOptions',{clamp:(v,min,max)=>Math.max(min,Math.min(max,v))});
for(const h of [300,1200,1690,1700,1710,1800,1801,2000,2500,3000])assert.equal(normalize({palletHeight:h}).palletHeight,h);
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{
  const path=new URL(r.request().url()).pathname;
  if(path==='/')return r.fulfill({contentType:'text/html',body:html});
  if(path==='/api/bootstrap')return r.fulfill({json:{needsSetup:false}});
  if(path==='/api/me')return r.fulfill({json:{user:{id:1,fullName:'Test',username:'test',role:'super',allowed_modules:['free','b2b','mekik2']}}});
  if(path==='/api/drawing-projects'&&r.request().method()==='POST')return r.fulfill({json:{project:{...r.request().postDataJSON(),id:1,revision:0,rackTypes:[]}}});
  if(path.startsWith('/api/'))return r.fulfill({json:{rows:[],types:[],projects:[],settings:{}}});
  return r.fulfill({contentType:'application/javascript',body:''});
 });
 await page.goto('https://rafex-configurator.vercel.app');await page.locator('#nav button[data-page="free"]').click();
 await page.locator('#b2bPalletHeight').waitFor({state:'attached'});
 await page.locator('#rafexAuthorityProjectName').fill('Height test');await page.locator('#rafexNewProjectV133').click();
 await page.waitForFunction(()=>document.querySelector('#rafexProjectNumberV134 span')?.textContent==='1'&&!window.rafexProjectSavingV133);
 for(const height of [1200,1690,1700,1710,1800,1801,2000,2500,3000]){
  const result=await page.evaluate(h=>{
   const input=document.getElementById('b2bPalletHeight');input.value=h;b2bApplyInputs({target:input});
   const o=b2b3DOptions();return {o,p:window.rafexPhysicalLevelsV121(o)};
  },height);
  const normalized=normalize(result.o);assert.equal(normalized.palletHeight,height);
  assert.equal(result.p[0].bottom,height+200);
  assert.equal(result.p[1].bottom-result.p[0].bottom,height+200+result.p[0].beam);
 }
 const saved=await page.evaluate(()=>{
  const s=b2bReadInputState();s.manualLevelSpecs=Array.from({length:4},(_,i)=>({distance:i?1525:1400,palletHeight:1200,weight:3000,traverseType:'CC125'}));b2bApplySavedInputState(s);b2b3DOptions();return s.manualLevelSpecs;
 });
 assert(await page.locator('#b2bPalletHeight').evaluate(n=>n.readOnly));
 const notice=page.locator('#rafexManualHeightNoticeV163');assert(await notice.isVisible());
 await notice.click();await page.locator('#rafexManualHeightV121').waitFor({state:'visible'});
 await page.locator('#rafexManualHeightV121 [data-cancel]').click();
 assert.deepEqual(await page.evaluate(()=>b2bReadInputState().manualLevelSpecs),saved);
 await notice.click();await page.locator('#rafexManualHeightV121 [data-clear]').click();
 assert.equal(await page.locator('#b2bPalletHeight').evaluate(n=>n.readOnly),false);
 assert.equal(await notice.isVisible(),false);
 assert.deepEqual(await page.evaluate(()=>b2bReadInputState().manualLevelSpecs),[]);
 assert.deepEqual(errors,[]);
 console.log('PASS v163: 300–3000 viewer heights, automatic level spacing, manual mode notice/lock, cancel preserves records, explicit auto reset unlocks.');
}finally{await browser.close()}
