import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {transform} from './patch-layout-accessories-v165.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
const input=fs.readFileSync(process.argv[2]||'outputs/live-after-v164.html','utf8'),html=process.argv.includes('--live')?input:transform(input);
assert(html.includes('data-layout-accessories="v165"'));assert.equal(transform(html),html);
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1430,height:1114}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{
  const path=new URL(r.request().url()).pathname;
  if(path==='/')return r.fulfill({contentType:'text/html',body:html});
  if(path.startsWith('/runtime-assets/')&&r.request().url().includes(html.match(/data-rafex-common-single-line-letter="v58" src="([^"]+)"/)[1]))return r.fulfill({contentType:'application/javascript',body:fs.readFileSync('outputs/live-label-v164.js','utf8')});
  if(path==='/api/bootstrap')return r.fulfill({json:{needsSetup:false}});
  if(path==='/api/me')return r.fulfill({json:{user:{id:1,fullName:'Test',username:'test',role:'super',allowed_modules:['free','b2b','mekik2','mr','drive','konsol']}}});
  if(path==='/api/drawing-projects'&&r.request().method()==='POST')return r.fulfill({json:{project:{...r.request().postDataJSON(),id:1,revision:0,rackTypes:[]}}});
  if(path.startsWith('/api/'))return r.fulfill({json:{rows:[],types:[],projects:[],settings:{}}});
  return r.fulfill({contentType:'application/javascript',body:''});
 });
 await page.goto('https://rafex-configurator.vercel.app');await page.locator('#nav button[data-page="free"]').click();
 await page.locator('#rafexAuthorityProjectName').fill('Accessory test');await page.locator('#rafexNewProjectV133').click();
 await page.waitForFunction(()=>!window.rafexProjectSavingV133&&document.querySelector('#rafexProjectNumberV134 span')?.textContent==='1');
 await page.evaluate(()=>{
  m2LayoutState.points=[{x:0,y:0},{x:1800,y:0},{x:1800,y:1200},{x:0,y:1200}];m2LayoutState.closed=true;
  const d=m2B2BRecordV108(b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()}));m2AddRack(d,'A');
  const r=m2LayoutState.racks[0];r.x=200;r.y=200;r.freePlacement=false;r.staged=false;r.locked=true;m2RenderLayout();
 });
 const checks=await page.evaluate(()=>{
  const r=m2LayoutState.racks[0];r.b2b.tunnelHeight=3600;
  const s={id:500,type:'barrier',blocking:true,x:r.x+r.w*.3,y:r.y+r.h*.4,w:r.w*.2,h:r.h*.1,widthMm:500,depthMm:150};m2LayoutSymbols=[s];
  const inside=m2RackOverlapsBlockingSymbol(r),save=m2ProjectPlacementError();
  r.b2b.tunnelHeight=0;const normal=m2RackOverlapsBlockingSymbol(r);r.b2b.tunnelHeight=3600;
  s.type='column';const column=m2RackOverlapsBlockingSymbol(r);s.type='barrier';s.x=r.x-1;const partial=m2RackOverlapsBlockingSymbol(r);s.x=r.x+r.w*.3;
  m2LayoutState.selected=null;m2MultiSelect.rackIds=new Set();m2MultiSelect.symbolIds=new Set();m2SelectedSymbolId=s.id;m2DuplicateRack();
  const copies=m2LayoutSymbols.map(x=>({...x}));m2LayoutSymbols=[s];
  return {inside,save,normal,column,partial,copies};
 });
 assert.equal(checks.inside,false);assert.equal(checks.save,'');assert.equal(checks.normal,true);assert.equal(checks.column,true);assert.equal(checks.partial,true);
 assert.equal(checks.copies.length,2);assert.notEqual(checks.copies[0].id,checks.copies[1].id);assert.equal(checks.copies[1].x-checks.copies[0].x,18);assert.equal(checks.copies[1].type,'barrier');
 await page.evaluate(()=>{m2SelectedSymbolId=null;m2MultiSelect.symbolIds.clear();m2LayoutSymbols=[];m2OpenCustomizeModal(m2LayoutState.racks[0].id)});
 await page.locator('#m2CustomizeModal').waitFor({state:'visible'});
 await page.locator('#m2CustomizePalletHeight').fill('1800');
 await page.evaluate(()=>m2ApplyRackCustomization());
 const entry=await page.evaluate(()=>m2SavedRackTypes.find(e=>e.source==='custom'));
 assert(entry,'Custom type saved');assert.equal(entry.__rafexSystem,'b2b');assert.equal(entry.__rafexSystemLabel,'B2B');assert.equal(entry.drawing.rafexSystem,'b2b');
 await page.waitForFunction(()=>!!document.querySelector('#m2LayoutSvg .rafex-rack-label-v160'));
 const beforeLabel=await page.locator('#m2LayoutSvg .rafex-rack-label-v160').first().innerHTML();
 await page.evaluate(()=>{const r=m2LayoutState.racks[0];m2AddSeismicBrace('light',[r.id]);m2RenderLayout();});
 await page.waitForFunction(()=>!!document.querySelector('#m2LayoutSvg .rafex-rack-label-v160'));
 const labels=await page.evaluate(()=>({extra:[...document.querySelectorAll('.m2-b2b-seismic-brace .m2-b2b-plan-label')].map(n=>getComputedStyle(n).display),text:[...document.querySelectorAll('#m2LayoutSvg .rafex-rack-label-v160 text')].map(n=>n.textContent)}));
 assert(labels.extra.length>0);assert(labels.extra.every(x=>x==='none'));assert.equal(labels.text.length,1);
 assert.equal(await page.locator('#m2LayoutSvg .rafex-rack-label-v160').first().innerHTML(),beforeLabel);
 assert.deepEqual(errors,[]);console.log('PASS v165: barrier copy; tunnel save allowed; normal/column/partial collisions retained; customized B2B identity; seismic duplicate labels hidden.');
}finally{await browser.close()}
