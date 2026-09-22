import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {transform} from './patch-audit-fixes-v184.mjs';
import {transform as customize} from './patch-customize-ui-v178.mjs';
import {transform as regions} from './patch-regions-repeat-v179.mjs';
const html=transform(regions(customize(fs.readFileSync(process.argv[2]||'outputs/live-after-v170.html','utf8'))));
assert.equal(transform(html),html);
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
const {chromium}=createRequire(import.meta.url)(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1698,height:1114}});page.setDefaultTimeout(12000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{console.log('DIALOG',d.message());return d.accept()});
 let saved=null,catalogSaved=null;
 await page.route('**/*',r=>{
  const p=new URL(r.request().url()).pathname,method=r.request().method();
  if(p==='/')return r.fulfill({contentType:'text/html',body:html});
  if(p==='/api/bootstrap')return r.fulfill({json:{needsSetup:false}});
  if(p==='/api/me')return r.fulfill({json:{user:{id:1,fullName:'Test',username:'test',role:'super',allowed_modules:['free','b2b']}}});
  if(p.startsWith('/api/drawing-projects')&&['POST','PUT','PATCH'].includes(method)){if(method==='PUT')catalogSaved=r.request().postDataJSON();return r.fulfill({json:{project:{...r.request().postDataJSON(),id:48,revision:1,rackTypes:[]},revision:1}});}
  if(p==='/api/projects'&&method==='POST'){saved={...r.request().postDataJSON(),id:44,serial_no:44,project_name:'Audit test'};return r.fulfill({json:{serialNo:44,project:saved}});}
  if(p==='/api/projects')return r.fulfill({json:{projects:saved?[saved]:[]}});
  if(p.startsWith('/api/'))return r.fulfill({json:{rows:[],types:[],projects:[],settings:{}}});
  return r.fulfill({contentType:'application/javascript',body:''});
 });
 await page.goto('https://rafex-configurator.vercel.app');await page.locator('#nav button[data-page="free"]').click();
 await page.locator('#rafexAuthorityProjectName').fill('Audit test');await page.locator('#rafexNewProjectV133').click();
 await page.waitForFunction(()=>!window.rafexProjectSavingV133&&document.querySelector('#rafexProjectNumberV134 span')?.textContent==='48');
 await page.locator('#rafexOpenLayoutScreen').click();
 await page.waitForFunction(()=>document.getElementById('page').dataset.rafexWorkflowScreen==='layout');
 await page.evaluate(()=>{
  m2LayoutState.points=[{x:0,y:0},{x:5000,y:0},{x:5000,y:1200},{x:0,y:1200}];m2LayoutState.closed=true;
  const d=m2B2BRecordV108(b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()}));
  window.rafexProjectTypesV133=[{id:1,name:'A',drawing:structuredClone(d),__rafexSystem:'b2b',system:'b2b'}];
  m2AddRack(d,'A');const r=m2LayoutState.racks[0];Object.assign(r,{x:200,y:200,freePlacement:false,staged:false,locked:true,rafexCatalogKey:'b2b:1',rafexGlobalTypeLetter:'A'});m2LayoutState.selected=r.id;m2RenderLayout();
 });
 await page.locator('#rafexRepeatCountV179').fill('3');assert(await page.evaluate(()=>rafexRegionsV179.repeat()));
 assert.equal(await page.evaluate(()=>m2LayoutState.racks.length),4);
 await page.evaluate(()=>{window.RafexB2BViewer={destroy(){},mount(){},update(){},createDetached(){return {setView(){},update(){},destroy(){}}}};m2OpenCustomizeModal(m2LayoutState.racks.at(-1).id)});
 await page.locator('#m2CustomizeBlockName').fill('Denetim blok');
 await page.locator('#m2CustomizeName').fill('B');
 await page.locator('#rafexEditLevelsV178').click();await page.locator('#rafexManualHeightV121 [data-distance]').first().fill('1700');
 await page.locator('#rafexManualHeightV121 [data-save]').click();
 await page.evaluate(()=>m2ApplyRackCustomization());
 const result=await page.evaluate(()=>({racks:m2LayoutState.racks.map(r=>({name:r.typeName,key:r.rafexCatalogKey,letter:r.rafexGlobalTypeLetter})),types:window.rafexProjectTypesV133.map(t=>t.name)}));
 console.log('custom',result);assert.deepEqual(result.racks.map(r=>r.name),['A','A','A','B']);assert.deepEqual(result.types,['A','B']);
 await page.evaluate(()=>m2OpenCustomizeModal(m2LayoutState.racks.at(-1).id));assert.equal(await page.locator('#m2CustomizeName').inputValue(),'B');await page.evaluate(()=>m2ApplyRackCustomization());
 assert.deepEqual(await page.evaluate(()=>window.rafexProjectTypesV133.map(t=>t.name)),['A','B'],'unchanged save must not add a duplicate type');
 await page.locator('#rafexPickBlocksV145').click();
 await page.evaluate(()=>{const id=m2LayoutState.racks.at(-1).id;rafexIndividualSelectionV184.replace([id]);m2MultiSelect.rackIds=new Set([id]);m2LayoutState.selected=id;m2RenderLayout();m2DuplicateRack()});
 assert.equal(await page.evaluate(()=>m2LayoutState.racks.length),5);
 assert.equal(await page.evaluate(()=>m2MultiSelect.rackIds.size),1);
 await page.keyboard.press('Escape');
 await page.evaluate(()=>m2SaveProject());assert(saved);assert.equal(saved.payload.rackTypes.length,2);
 assert.equal(catalogSaved.rackTypes.length,2);
 assert.equal(saved.payload.projectIdentity.drawingCatalogId,48);
 await page.evaluate(record=>m2ApplyProjectRecord(record,false),saved);
 assert.equal(await page.evaluate(()=>window.rafexProjectIdentityV133.displayNumber),'48');
 assert.deepEqual(await page.evaluate(()=>window.rafexProjectTypesV133.map(t=>t.name)),['A','B']);
 assert.deepEqual(await page.evaluate(()=>m2LayoutState.racks.map(r=>r.typeName)),['A','A','A','B','B']);
 const summary=await page.evaluate(record=>({count:rafexHistoryPalletsV184(record.payload),detail:historyProjectBody(record,record.payload,{})}),saved);
 assert.equal(summary.count,60);assert(!summary.detail.includes('0 × 0 mm'));assert(summary.detail.includes('B2B'));
 const report=await page.evaluate(()=>{window.__rafexManualOutputBuild=true;try{return m2BuildCorporatePages()}finally{window.__rafexManualOutputBuild=false}});assert(!report.includes('Neden mekik sistemi?'));
 assert.equal(await page.evaluate(()=>rafexUniquePalletRowsV184([{name:'A',drawing:{palD:800}},{name:'A',drawing:{palD:800}},{name:'B',drawing:{palD:800}}]).length),2);
 console.log('page errors',errors);assert.deepEqual(errors,[]);
 console.log('PASS: customized identity/catalog, save/reopen, individual duplication, stable project number, 60 pallets, dimensions, system-specific report, deduplicated pallet rows.');
}finally{await browser.close()}
