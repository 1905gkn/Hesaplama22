import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {transform} from './patch-drawing-catalog-v158.mjs';
import {transform as cleanup} from './patch-common-ui-v161.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
let html=transform(fs.readFileSync(process.argv[2]||'outputs/production-v157-final.html','utf8').replace('if(registry&&(current||[]).length)name=appendedName();','if(registry)name=appendedName();'));
if(process.argv.includes('--ui-cleanup'))html=cleanup(html);
const clean=html.includes('data-common-ui="v161"');
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
 await page.goto('https://rafex-configurator.vercel.app');await page.locator('#nav button[data-page="free"]').click();
 await page.locator('#rafexNewProjectV133').waitFor();await page.addStyleTag({content:'html body #app #page #b2b3DLoading{display:none!important;pointer-events:none!important}'});
 await page.locator('#rafexAuthorityProjectName').fill('Depo A');await page.locator('#rafexNewProjectV133').click();
 await page.waitForFunction(()=>document.querySelector('#rafexProjectNumberV134 span')?.textContent==='1'&&!window.rafexProjectSavingV133);
 assert.equal(records.length,1);assert.equal(historyWrites,0);
 if(clean){
  for(const selector of ['#m2AutoFillControls','#rafexIndependentProjectInfoV133','#rafexProjectStartStatusV157','#m2SavedTypesPanel button[onclick="m2RefreshSavedRackTypes()"]','#m2SavedTypesPanel button[onclick="m2AddSelectedSavedRack()"]'])assert.equal(await page.locator(selector).isVisible(),false,selector);
  assert(await page.locator('#m2SavedTypesPanel button[onclick="m2DeleteAllSavedRackTypes()"]').isVisible(),'Delete remains available');
 }
 const drawing=await page.evaluate(()=>m2B2BRecordV108(b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()})));
 await page.evaluate(d=>{window.rafexProjectTypesV133=[{id:11,name:'E',__rafexSystem:'b2b',drawing:d},{id:12,name:'B',__rafexSystem:'b2b',drawing:{...d,totalWidth:9999}}];window.rafexUnifiedCatalogSync();m2RenderSavedRackTypes();},drawing);
 const enter=page.locator('#rafexOpenLayoutScreen'),back=page.locator('#rafexBackToRackTypes');
 await enter.click();await back.waitFor({state:'visible'});
 if(clean)assert(await page.locator('#m2AutoFillControls').isVisible(),'Extension remains available on layout screen');
 assert.equal(records.length,1);assert.equal(records[0].rackTypes.length,2);assert.equal(updates,1);assert.equal(historyWrites,0);
 const snapshot=structuredClone(records[0].rackTypes);
 await back.click();await enter.click();await back.waitFor({state:'visible'});assert.equal(records.length,1);assert.equal(updates,2);
 await back.click();fail=true;await enter.click();await page.waitForFunction(()=>document.querySelector('#rafexProjectStartStatusV157').textContent.includes('Test kayıt hatası'));
 assert(await enter.isVisible());assert.equal(await page.locator('#rafexProjectNumberV134 span').textContent(),'1');assert.deepEqual(records[0].rackTypes,snapshot);
 if(clean)assert(await page.locator('#rafexProjectStartStatusV157').isVisible(),'Save errors must remain visible');
 fail=false;await enter.click();await back.waitFor({state:'visible'});await back.click();
 await page.locator('#rafexAuthorityProjectName').fill('Depo B');await page.locator('#rafexNewProjectV133').click();
 await page.waitForFunction(()=>document.querySelector('#rafexProjectNumberV134 span')?.textContent==='2'&&!window.rafexProjectSavingV133);
 await page.locator('#rafexProjectImportV155 summary').click();await page.locator('#rafexProjectImportV155 option[value="1"]').waitFor({state:'attached'});
 assert.doesNotMatch(await page.locator('#rafexProjectImportV155 select').textContent(),/HISTORY ONLY/);
 await page.locator('#rafexProjectImportV155 select').selectOption('1');await page.locator('#rafexProjectImportV155 input[value="0"]').check();await page.locator('#rafexProjectImportV155 [data-copy]').click();
 assert.equal(await page.evaluate(()=>window.rafexProjectTypesV133.length),1);assert.equal(await page.evaluate(()=>window.rafexProjectTypesV133[0].name),'A');assert.equal(await page.evaluate(()=>m2LayoutState.racks.length),0);
 const copied=await page.evaluate(()=>structuredClone(window.rafexProjectTypesV133[0].drawing));delete copied.rafexGlobalTypeLetter;delete drawing.rafexGlobalTypeLetter;assert.deepEqual(copied,drawing);
 assert.equal(await page.locator('#rafexTypeProjectSaveV156').count(),0);assert.equal(await page.locator('#rafexSavedProjectsV156').count(),0);
 assert.deepEqual(records[0].rackTypes,snapshot);assert.equal(historyWrites,0);assert.deepEqual(errors,[]);
 if(clean){
  for(const width of [1664,600]){
   await page.setViewportSize({width,height:1114});
   const summary=await page.locator('#rafexProjectImportV155 summary').boundingBox(),panel=await page.locator('#rafexProjectImportV155 .project-import-panel').boundingBox();
   assert(Math.abs(summary.width-panel.width)<1,'Open panel matches summary width');assert(Math.abs(summary.x-panel.x)<1,'Open panel aligns with summary');
  }
  await page.setViewportSize({width:1664,height:1114});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'outputs/common-ui-v161.png'});
  console.log('PASS v161: requested controls hidden, errors retained, picker widths equal at desktop/mobile.');
 }
 console.log('PASS: independent sequential numbering; every layout transition saves same record; failure keeps types and screen; selected-only full-detail copying; zero history writes; no extra save or open UI.');
}finally{await browser.close();}


