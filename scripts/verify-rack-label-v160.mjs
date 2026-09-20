import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {transform as baseTransform} from './patch-drawing-catalog-v158.mjs';
import {transform as labels} from './patch-rack-label-v160.mjs';
const transform=html=>labels(baseTransform(html));
const {chromium}=createRequire(import.meta.url)(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
let html=transform(fs.readFileSync(process.argv[2]||'outputs/production-v157-final.html','utf8').replace('if(registry&&(current||[]).length)name=appendedName();','if(registry)name=appendedName();'));
html=html.replace(/const system=\['konsol','konsol-kollu','cantilever'\][^\n]+;/,fs.readFileSync('scripts/patch-unified-free-drawing-catalog.mjs','utf8').split('\n').filter(line=>line.includes('const savedSystem=')||line.includes('const system=savedSystem')).join('\n'));
assert.equal(transform(html),html);
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
fs.writeFileSync('outputs/drawing-catalog-v158.html',html);
const browser=await chromium.launch({channel:'msedge',headless:true});
let records=[],historyWrites=0,updates=0,fail=false;
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{
  const path=new URL(r.request().url()).pathname,method=r.request().method();
  if(path==='/')return r.fulfill({contentType:'text/html',body:html});
  if(path==='/api/drawing-projects'&&method==='POST'){
   const b=r.request().postDataJSON();let project=records.find(p=>p.uuid===b.uuid);
   if(!project){project={...b,id:records.length+1,revision:0,rackTypes:[]};records.push(project);}
   return r.fulfill({json:{project}});
  }
  if(path.match(/\/api\/drawing-projects\/\d+\/types/)){
   if(fail)return r.fulfill({status:503,json:{error:'Test kayıt hatası'}});
   const p=records.find(p=>p.id===Number(path.split('/')[3])),b=r.request().postDataJSON();
   assert.equal(b.revision,p.revision);p.rackTypes=b.rackTypes;p.revision++;updates++;
   return r.fulfill({json:{revision:p.revision}});
  }
  if(path==='/api/drawing-projects')return r.fulfill({json:{projects:records}});
  if(path==='/api/projects'){if(method!=='GET')historyWrites++;return r.fulfill({json:{projects:[{id:999,serial_no:999,project_name:'HISTORY ONLY',payload:{rackTypes:[]}}]}});}
  if(path==='/api/bootstrap')return r.fulfill({json:{needsSetup:false}});
  if(path==='/api/me')return r.fulfill({json:{user:{id:1,fullName:'Test',username:'test',role:'super',defaultLanguage:'tr',allowed_modules:['free','b2b','mr','drive','mekik2','konsol']}}});
  if(path.startsWith('/api/'))return r.fulfill({json:{rows:[],types:[],rackTypes:[],projects:[],settings:{}}});
  return r.fulfill({contentType:'application/javascript',body:''});
 });
 await page.goto('https://rafex-configurator.vercel.app');
 await page.locator('#nav button[data-page="mekik2"]').click();
 const mekik=await page.evaluate(()=>structuredClone(m2LastDrawing));
 await page.locator('#nav button[data-page="free"]').click();
 await page.locator('#rafexAuthorityProjectName').fill('Cross system');await page.locator('#rafexNewProjectV133').click();
 await page.waitForFunction(()=>!window.rafexProjectSavingV133);
 for(const system of ['mekik2','drive']){
  await page.locator('#rafexUnifiedSystemPicker input[value="'+system+'"]').check({force:true});
  await page.waitForTimeout(350);
  const result=await page.evaluate(({mekik,system})=>{
   const d=structuredClone(mekik);d.rafexSystem=system;if(system==='drive')d.systemType='drive';
   window.rafexProjectTypesV133=window.rafexMergeRackCatalog([],[{id:321,name:'E',drawing:d,__rafexSnapshot:d,__rafexSystem:system,__rafexSystemLabel:system==='drive'?'Drive-In':'Mekik'}]).entries;
   window.rafexUnifiedCatalogSync();m2RenderSavedRackTypes();m2SelectedSavedType=0;
   m2LayoutState.racks=[];m2LayoutState.closed=true;m2LayoutState.points=[{x:0,y:0},{x:2000,y:0},{x:2000,y:1200},{x:0,y:1200}];window.rafexSelectedCatalogKey=system+":321";m2AddSelectedSavedRack();m2RenderLayout();
   const r=m2LayoutState.racks[0];
   return {system,active:m2ActiveModule,rack:r&&{rafexSystem:r.rafexSystem,layoutView:r.layoutView,konsol:r.konsol,systemType:r.systemType,b2b:r.b2b,width:r.widthMm,depth:r.depthMm},html:document.querySelector('#m2LayoutSvg [data-rack]')?.innerHTML.slice(0,220)};
  },{mekik,system});assert(result.rack,system+' must add a rack');assert.equal(result.rack.rafexSystem,system);assert.equal(result.rack.layoutView,null,system+' must not attach foreign layout');assert.equal(result.rack.konsol,undefined);assert.equal(result.rack.width,mekik.totalWidth);assert.equal(result.rack.depth,mekik.railLength);await page.waitForTimeout(100);assert.equal(await page.locator('#m2LayoutSvg [data-rafex-konsol-plan]').count(),0);assert.equal(await page.locator('#m2LayoutSvg .rafex-plan-pallet-v143').count(),mekik.bays*mekik.depth);await page.waitForTimeout(180);
  await page.locator('#rafexOpenLayoutScreen').click();await page.locator('#rafexBackToRackTypes').waitFor({state:'visible'});await page.waitForTimeout(100);
  const read=()=>page.evaluate(()=>{
   const group=document.querySelector('#m2LayoutSvg [data-rack]'),mark=group.querySelector('.rafex-rack-label-v160');
   return {html:mark?.innerHTML,text:[...mark?.querySelectorAll('text')||[]].map(n=>n.textContent),fonts:[...mark?.querySelectorAll('text')||[]].map(n=>parseFloat(n.getAttribute('font-size'))*Math.hypot(n.getScreenCTM().a,n.getScreenCTM().b)),legacy:[...group.querySelectorAll('.m2-rack-nameplate,.m2-rack-pallet-count,.rafex-single-line-letter-v58')].filter(n=>getComputedStyle(n).display!=='none').length};
  });
  const before=await read();assert.deepEqual(before.text,['A',system==='drive'?'Drive-In':'Mekik']);assert.equal(before.legacy,0);assert(before.fonts.every(f=>f<=12.1));
  await page.locator('body').press('Escape');await page.waitForTimeout(100);assert.deepEqual(await read(),before,'Esc must not change the label');
  await page.evaluate(()=>{m2LayoutState.selected=m2LayoutState.racks[0].id;m2PerfRefreshStaticSelectionUi(m2LayoutState.selected);});await page.waitForTimeout(100);assert.deepEqual(await read(),before,'Selecting must not change the label');
  await page.locator('#m2LayoutSvg [data-rack]').first().screenshot({path:'outputs/label-'+system+'.png'});await page.locator('#rafexBackToRackTypes').click();console.log('PASS '+system+': only A + system, 12/10 px, identical selected and Esc labels');
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}








