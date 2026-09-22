import fs from 'node:fs';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import path from 'node:path';
import {transform} from './patch-mixed-layout-v186.mjs';
import {transform as clearanceTransform} from './patch-b2b-default-clearance-v187.mjs';
// All requests are intercepted. This verifier cannot save to a real account.
// Usage: RAFEX_PLAYWRIGHT_PATH=... node scripts/verify-mixed-layout-v186.mjs
//        --html=dist/index.html [--baseline] [--reopen] [--profile]
const {chromium}=createRequire(import.meta.url)(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
const fixture=process.argv.find(a=>a.startsWith('--html='))?.slice(7)||'outputs/live-v153.html';
const optimized=!process.argv.includes('--baseline');
const assetPath=url=>{const file=path.join(path.dirname(fixture),url);return fs.existsSync(file)?file:path.join(path.dirname(fixture),path.basename(url))};
let html=fs.readFileSync(fixture,'utf8');
fs.mkdirSync('outputs',{recursive:true});
if(optimized){
 html=html.replace(/<script([^>]*?) src="(\/runtime-assets\/[^" ]+)"[^>]*><\/script>/g,(_,attrs,url)=>'<script'+attrs+'>'+fs.readFileSync(assetPath(url),'utf8')+'</script>');
 html=transform(html);assert.equal(transform(html),html);
 html=clearanceTransform(html);assert.equal(clearanceTransform(html),html);
}
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){if(m[2].trim()&&!m[1].includes('application/')){try{new vm.Script(m[2])}catch(e){console.log('SYNTAX',m[1],e.stack);throw e}}}
const browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[],dialogs=[],requests=[];
let saved=null,revision=0,typeId=0;
try{
 const page=await browser.newPage({viewport:{width:1698,height:1114}});page.setDefaultTimeout(15000);
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{dialogs.push(d.message());await d.dismiss()});
 await page.route('**/*',r=>{
  const p=new URL(r.request().url()).pathname,method=r.request().method();
  if(p==='/')return r.fulfill({contentType:'text/html',body:html});
  if(p.startsWith('/runtime-assets/'))return r.fulfill({contentType:'application/javascript',body:fs.readFileSync(assetPath(p),'utf8')});
  if(p==='/api/bootstrap')return r.fulfill({json:{needsSetup:false}});
  if(p==='/api/me')return r.fulfill({json:{user:{id:1,fullName:'Offline Audit',username:'audit',role:'super',allowed_modules:['free','b2b','mekik2','drive','mr','konsol']}}});
  if(p.startsWith('/api/drawing-projects')&&['POST','PUT','PATCH'].includes(method)){requests.push({p,method});if(method==='PUT')revision++;return r.fulfill({json:{project:{...r.request().postDataJSON(),id:9001,revision,rackTypes:[]},revision}});}
  if(p==='/api/projects'&&method==='POST'){saved={...r.request().postDataJSON(),project_name:'Offline mixed audit',id:9001,serial_no:9001};return r.fulfill({json:{serialNo:9001,project:saved}});}
  if(p==='/api/projects')return r.fulfill({json:{projects:saved?[saved]:[]}});
  if(['/api/b2b-types','/api/mekik2-types','/api/mr-types','/api/rack-types'].includes(p)&&method==='POST'){
   const drawing=r.request().postDataJSON().drawing;return r.fulfill({json:{id:++typeId,name:String.fromCharCode(64+typeId),drawing}});
  }
  if(p.startsWith('/api/'))return r.fulfill({json:{rows:[],types:[],rackTypes:[],projects:[],settings:{}}});
  return r.fulfill({contentType:'application/javascript',body:''});
 });
 await page.goto('https://rafex-offline.test/');
 await page.locator('#nav button[data-page="free"]').click();
 await page.locator('#rafexAuthorityProjectName').fill('Offline mixed audit');await page.locator('#rafexNewProjectV133').click();
 await page.waitForFunction(()=>!window.rafexProjectSavingV133&&window.rafexProjectIdentityV133?.drawingCatalogId===9001);
 for(const system of ['b2b','mekik2','drive','mr','konsol']){
  await page.locator('#rafexUnifiedSystemPicker input[value="'+system+'"]').check({force:true});
  await page.waitForTimeout(250);
  if(optimized&&system==='b2b'){
   assert.equal(await page.evaluate(()=>b2bReadInputState().palletTraverseGap),100,'New B2B default clearance is not 100 mm');
   // The offline harness deliberately omits the Three.js viewer assets.
   // Exercise the real dialog controller without its loading overlay.
   await page.evaluate(()=>b2bOpenMeasureDialog('b2bMeasureSettingsDialog'));
   assert.equal(await page.locator('#b2bMeasureClearance').inputValue(), '100');
   await page.locator('#b2bMeasureSettingsDialog').getByRole('button',{name:'Vazgeç',exact:true}).click();
   const restored=await page.evaluate(()=>{const initial=b2bReadInputState(),values=[];for(const gap of [0,100,200,350]){b2bApplySavedInputState({...initial,palletTraverseGap:gap});values.push(b2bReadInputState().palletTraverseGap)}b2bApplySavedInputState(initial);return values});
   assert.deepEqual(restored,[0,100,200,350],'Saved B2B clearances were overwritten');
  }
  await page.getByRole('button',{name:'Raf Tipini Kaydet',exact:true}).click();
  await page.waitForTimeout(250);
  console.log('SAVE_TYPE',system,await page.evaluate(()=>({types:window.rafexProjectTypesV133?.map(t=>({name:t.name,system:t.__rafexSystem,width:t.drawing?.totalWidth,depth:t.drawing?.railLength})),status:document.getElementById('m2FloorStatus')?.textContent})),dialogs);
 }
 await page.locator('#rafexOpenLayoutScreen').click();
 await page.waitForFunction(()=>document.getElementById('page').dataset.rafexWorkflowScreen==='layout');
 await page.evaluate(()=>{
  m2LayoutState.scale=.0044;m2LayoutState.points=[{x:0,y:0},{x:1500,y:0},{x:1500,y:1000},{x:0,y:1000}];m2LayoutState.closed=true;m2LayoutState.racks=[];
  window.rafexUnifiedCatalogSync();m2RenderSavedRackTypes();
  for(let i=0;i<m2SavedRackTypes.length;i++){m2SelectedSavedType=i;const t=m2SavedRackTypes[i];window.rafexSelectedCatalogKey=t.__rafexSystem+':'+t.id;m2AddSelectedSavedRack();}
  window.auditTemplates=structuredClone(m2LayoutState.racks);
 });
 console.log('TEMPLATES',await page.evaluate(()=>auditTemplates.map(r=>({id:r.id,system:r.rafexSystem,name:r.typeName,w:r.w,h:r.h,key:r.rafexCatalogKey}))),errors,dialogs);
 assert.equal(await page.evaluate(()=>auditTemplates.length),5);
 const results=[];
 for(const count of (process.argv.includes('--profile')?[900]:process.argv.includes('--reopen')?[25]:[25,100,300,900])){
  const init=await page.evaluate(async count=>{
   const settle=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const height=Math.max(1000,Math.ceil(count/20)*55+100);m2LayoutState.points=[{x:0,y:0},{x:1500,y:0},{x:1500,y:height},{x:0,y:height}];
   m2LayoutState.racks=Array.from({length:count},(_,i)=>({...structuredClone(auditTemplates[i%5]),id:10000+i,x:45+(i%20)*65,y:45+Math.floor(i/20)*55,staged:false,freePlacement:false,locked:true,joinGroup:null,sharedFootWith:null,sharedFootSide:null}));
   m2LayoutState.selected=null;const start=performance.now();m2RenderLayout();window.rafexFitCommonLayoutV126();await settle();return {initialMs:performance.now()-start,nodes:document.querySelectorAll('#m2LayoutSvg *').length};
  },count);
  await page.locator('#m2LayoutSvg').evaluate(n=>n.scrollIntoView({block:'start'}));await page.evaluate(()=>scrollBy(0,-150));await page.waitForTimeout(500);
  const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
  const result=await page.evaluate(async()=>{
   const settle=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const measure=async fn=>{const t=performance.now();fn();const js=performance.now()-t;await settle();return {js,paint:performance.now()-t}};
   const render=[];for(let i=0;i<3;i++)render.push(await measure(()=>m2RenderLayout()));
   const select=[];for(let i=0;i<5;i++)select.push(await measure(()=>{m2LayoutState.selected=10000+i;m2RenderLayout()}));
   const zoom=[];for(let i=0;i<6;i++)zoom.push(await measure(()=>m2ZoomLayout(i%2?-.1:.1)));
   const model=m2LayoutState.racks.map(r=>({system:r.rafexSystem,name:r.typeName,key:r.rafexCatalogKey,x:r.x,y:r.y,w:r.w,h:r.h}));
   let mutations=0;const observer=new MutationObserver(a=>mutations+=a.length);observer.observe(document.querySelector('#m2LayoutSvg'),{attributes:true,childList:true,subtree:true});
   const idleFrames=[];let prev=performance.now();for(let i=0;i<30;i++){await new Promise(r=>requestAnimationFrame(r));const now=performance.now();idleFrames.push(now-prev);prev=now}observer.disconnect();
   const point=(()=>{const s=document.getElementById('m2LayoutSvg'),r=m2LayoutState.racks[0],p=new DOMPoint(r.x+r.w/2,r.y+r.h/2).matrixTransform(s.getScreenCTM());return {x:p.x,y:p.y,hit:document.elementFromPoint(p.x,p.y)?.closest('[data-rack]')?.dataset.rack}})();
   return {render,select,zoom,model,mutations,idleFrames,point};
  });
  const {profile}=await cdp.send('Profiler.stop');const totals=new Map();profile.samples?.forEach((id,i)=>totals.set(id,(totals.get(id)||0)+(profile.timeDeltas[i]||0)));
  const cpu=profile.nodes.map(n=>({name:n.callFrame.functionName||'(anonymous)',line:n.callFrame.lineNumber+1,ms:Math.round((totals.get(n.id)||0)/100)/10})).sort((a,b)=>b.ms-a.ms).slice(0,16);
  const interaction=[];
  for(let i=0;i<5;i++){
   const p=await page.evaluate(i=>{const s=document.getElementById('m2LayoutSvg'),r=m2LayoutState.racks[i],p=new DOMPoint(r.x+r.w/2,r.y+r.h/2).matrixTransform(s.getScreenCTM());return {x:p.x,y:p.y,id:r.id,system:r.rafexSystem,hit:document.elementFromPoint(p.x,p.y)?.closest('[data-rack]')?.dataset.rack}},i);
   if(String(p.id)!==p.hit){interaction.push({...p,skipped:true});continue;}
   const t=Date.now();await page.mouse.click(p.x,p.y);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   interaction.push({...p,clickMs:Date.now()-t,selected:await page.evaluate(()=>m2LayoutState.selected)});
  }
  const drag={};
  if(result.point.hit==='10000'){
   await page.mouse.move(result.point.x,result.point.y);let t=Date.now();await page.mouse.down();drag.down=Date.now()-t;
   drag.started=await page.evaluate(()=>({id:m2LayoutState.drag?.id,selected:m2LayoutState.selected}));
   drag.moves=[];for(let i=1;i<=12;i++){t=Date.now();await page.mouse.move(result.point.x+15*i/12,result.point.y+10*i/12);drag.moves.push(Date.now()-t)}
   t=Date.now();await page.mouse.up();drag.up=Date.now()-t;
  }
  const pan={};const modelBeforePan=await page.evaluate(()=>JSON.stringify(m2LayoutState.racks));
  await page.locator('#m2PanV168').click();await page.locator('#m2LayoutSvg').scrollIntoViewIfNeeded();
  const box=await page.locator('#m2LayoutSvg').boundingBox();const x=box.x+box.width/2,y=Math.max(100,Math.min(900,box.y+box.height/2));
  await page.mouse.move(x,y);await page.mouse.down();pan.moves=[];
  await cdp.send('Profiler.start');
  const trace=[];if(process.argv.includes('--profile')){cdp.on('Tracing.dataCollected',e=>trace.push(...e.value));await cdp.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline.invalidationTracking',transferMode:'ReportEvents'});}
  for(let i=1;i<=12;i++){const t=Date.now();await page.mouse.move(x+i*4,y);pan.moves.push(Date.now()-t)}await page.mouse.up();
  const viewBefore=await page.locator('#m2LayoutSvg').getAttribute('viewBox');let t=Date.now();await page.mouse.wheel(0,-100);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));pan.wheelMs=Date.now()-t;
  pan.wheelChanged=viewBefore!==await page.locator('#m2LayoutSvg').getAttribute('viewBox');pan.modelPreserved=modelBeforePan===await page.evaluate(()=>JSON.stringify(m2LayoutState.racks));
  assert(pan.wheelChanged,'PAN wheel must zoom');assert(pan.modelPreserved,'PAN changed physical rack data');
  assert.equal(result.mutations,0,'Idle drawing kept mutating');
  for(const click of interaction.filter(v=>!v.skipped))assert.equal(click.selected,click.id,'Wrong rack selected');
  const panProfile=(await cdp.send('Profiler.stop')).profile;fs.writeFileSync('outputs/mixed-pan-profile.json',JSON.stringify(panProfile));
  if(process.argv.includes('--profile')){const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');await done;fs.writeFileSync('outputs/mixed-pan-trace.json',JSON.stringify(trace));const sums={};for(const e of trace)if(e.ph==='X'&&e.dur)sums[e.name]=(sums[e.name]||0)+e.dur/1000;console.log('PAN_TRACE',Object.entries(sums).sort((a,b)=>b[1]-a[1]).slice(0,20));}
  const panTotals=new Map();panProfile.samples?.forEach((id,i)=>panTotals.set(id,(panTotals.get(id)||0)+(panProfile.timeDeltas[i]||0)));
  pan.cpu=panProfile.nodes.map(n=>({name:n.callFrame.functionName||'(anonymous)',line:n.callFrame.lineNumber+1,ms:Math.round((panTotals.get(n.id)||0)/100)/10})).sort((a,b)=>b.ms-a.ms).slice(0,20);
  await page.keyboard.press('Escape');await page.locator('#m2LayoutSvg').scrollIntoViewIfNeeded();
  const noPanView=await page.locator('#m2LayoutSvg').getAttribute('viewBox');
  await page.mouse.move(x,y);await page.mouse.wheel(0,50);await page.waitForTimeout(100);
  assert.equal(await page.locator('#m2LayoutSvg').getAttribute('viewBox'),noPanView,'Wheel zoomed with PAN disabled');
  const out={count,...init,...result,cpu,interaction,drag,pan,errors:[...errors],dialogs:[...dialogs]};results.push(out);console.log('RESULT',JSON.stringify({...out,model:out.model.slice(0,5),idleFrames:undefined}));
  fs.writeFileSync('outputs/mixed-layout-audit'+(optimized?'-v186':'')+(process.argv.includes('--reopen')?'-quick':'')+'.json',JSON.stringify(results,null,2));await cdp.detach();
 }
 const checks=await page.evaluate(()=>{
  m2LayoutState.racks=Array.from({length:10},(_,i)=>({...structuredClone(auditTemplates[i%5]),id:30000+i,x:45+i*65,y:100,staged:false,freePlacement:false,locked:true,joinGroup:null,sharedFootWith:null,sharedFootSide:null}));
  m2LayoutState.selected=null;m2RenderLayout();return m2LayoutState.racks.map(r=>({id:r.id,key:r.rafexCatalogKey,name:r.typeName,system:r.rafexSystem,w:r.w,h:r.h}));
 });
 await page.evaluate(()=>m2SaveProject());assert(saved,'Mixed project did not save');assert.equal(saved.payload.rackTypes.length,5);
 await page.evaluate(()=>{m2LayoutState.racks=[];m2RenderLayout()});
 await page.getByRole('button',{name:'Proje Geçmişi',exact:true}).click();
 await page.locator('#historyModal').getByRole('button').filter({hasText:'Offline mixed audit'}).click();
 await page.getByRole('button',{name:'Projeyi Aç',exact:true}).click();await page.waitForTimeout(500);
 const reopened=await page.evaluate(()=>m2LayoutState.racks.map(r=>({id:r.id,key:r.rafexCatalogKey,name:r.typeName,system:r.rafexSystem,w:r.w,h:r.h})));
 if(optimized)assert.deepEqual(reopened,checks,'Konsol editor corrupted mixed project');
 const roundtrip={expected:checks,actual:reopened,errors,dialogs,savedTypes:saved.payload.rackTypes.map(t=>({name:t.name,system:t.__rafexSystem})),fields:await page.evaluate(()=>({name:document.getElementById('rafexAuthorityProjectName')?.value,selected:document.querySelector('#rafexUnifiedSystemPicker input:checked')?.value}))};
 fs.writeFileSync('outputs/mixed-layout-roundtrip.json',JSON.stringify(roundtrip,null,2));console.log('ROUNDTRIP',JSON.stringify(roundtrip));
 for(const system of ['b2b','mekik2','drive','mr']){
  const afterKonsolErrors=errors.length;
 if(await page.locator('#rafexBackToRackTypes').isVisible())await page.locator('#rafexBackToRackTypes').click();
 await page.locator('#rafexUnifiedSystemPicker input[value="'+system+'"]').check({force:true});await page.waitForTimeout(250);
 await page.getByRole('button',{name:'Proje Geçmişi',exact:true}).click();
 await page.locator('#historyModal').getByRole('button').filter({hasText:'Offline mixed audit'}).click();
 await page.getByRole('button',{name:'Projeyi Aç',exact:true}).click();await page.waitForTimeout(500);
 const b2bReopened=await page.evaluate(()=>m2LayoutState.racks.map(r=>({id:r.id,key:r.rafexCatalogKey,name:r.typeName,system:r.rafexSystem,w:r.w,h:r.h})));
 if(optimized)assert.deepEqual(b2bReopened,checks,system+' editor corrupted mixed project');
 const b2bResult={expected:checks,actual:b2bReopened,newErrors:errors.slice(afterKonsolErrors)};console.log('B2B_REOPEN',JSON.stringify(b2bResult));
 fs.writeFileSync('outputs/mixed-layout-b2b-roundtrip.json',JSON.stringify(b2bResult,null,2));
 }
 if(await page.locator('#rafexOpenLayoutScreen').isVisible())await page.locator('#rafexOpenLayoutScreen').click();
 const copies=await page.evaluate(()=>{
  const results=[];
  for(let i=0;i<5;i++){
   const source=m2LayoutState.racks[i],n=m2LayoutState.racks.length; m2ClearMultiSelection();m2LayoutState.selected=source.id;
   const oldIds=new Set(m2LayoutState.racks.map(r=>r.id));m2DuplicateRack();
   const added=m2LayoutState.racks.filter(r=>!oldIds.has(r.id));
   results.push({system:source.rafexSystem,before:n,after:m2LayoutState.racks.length,added:added.map(r=>({system:r.rafexSystem,key:r.rafexCatalogKey,name:r.typeName})),expected:{system:source.rafexSystem,key:source.rafexCatalogKey,name:source.typeName}});
   m2UndoLastAction();results.at(-1).afterUndo=m2LayoutState.racks.length;
  }
  return results;
 });console.log('COPY_UNDO',JSON.stringify(copies));fs.writeFileSync('outputs/mixed-layout-copy-undo.json',JSON.stringify(copies,null,2));
 for(const copy of copies){assert.equal(copy.after,copy.before+1);assert.equal(copy.afterUndo,copy.before);assert.deepEqual(copy.added,[copy.expected]);}
 if(optimized){
  const freezeStart=html.indexOf('function freezePlanPaint(source, copy) {'),freezeEnd=html.indexOf(')(source,source.cloneNode(true))',freezeStart);
  assert(freezeStart>=0&&freezeEnd>freezeStart);
  await page.evaluate(freeze=>{
   const check=(ok,msg)=>{if(!ok)throw Error(msg)};
   m2RenderLayoutProductList();
   const products=document.getElementById('m2LayoutProductList').textContent;
   const svg=document.getElementById('m2LayoutSvg'),before=JSON.stringify(m2LayoutState.racks),view=svg.getAttribute('viewBox'),selected=m2LayoutState.selected,details=svg.querySelectorAll('*').length;
   m2LayoutState.selected=null;svg.setAttribute('viewBox','100000 100000 1000 650');window.rafexLayoutBudgetV152.update();
   const nodes=svg.querySelectorAll('[data-rack]'),hidden=svg.querySelectorAll('.rafex-offscreen-v152').length;
   check(hidden===nodes.length&&hidden>0,'Offscreen racks were not culled');
   check(getComputedStyle(nodes[0]).display==='none','Offscreen SVG still participates in layout');
   const copy=(0,eval)('('+freeze+')')(svg,svg.cloneNode(true));
   check(copy.querySelectorAll('*').length===details,'Export lost physical SVG details');
   check(copy.querySelectorAll('[data-rack]').length===nodes.length,'Export lost racks');
   check(!copy.querySelector('.rafex-offscreen-v152'),'Export retained culling');
   check([...copy.querySelectorAll('[data-rack]')].every(n=>n.style.display!=='none'&&n.style.visibility!=='hidden'),'Export contains invisible racks');
   check(svg.querySelectorAll('.rafex-offscreen-v152').length===hidden,'Export changed live visibility');
   m2RenderLayoutProductList();check(document.getElementById('m2LayoutProductList').textContent===products,'Culling changed product counts');
   m2LayoutState.drag={id:m2LayoutState.racks[0].id};window.rafexLayoutBudgetV152.update();
   check(!nodes[0].classList.contains('rafex-offscreen-v152'),'Moving rack was culled');
   check(svg.querySelectorAll('.rafex-offscreen-v152').length===hidden-1,'Dragging revealed unrelated offscreen racks');
   m2LayoutState.drag=null;m2LayoutState.selected=selected;svg.setAttribute('viewBox',view);window.rafexLayoutBudgetV152.update();
   check(JSON.stringify(m2LayoutState.racks)===before,'Culling/export mutated physical data');
  },html.slice(freezeStart,freezeEnd));
  // A broken imported catalog must not partially switch the active owner.
  const invalid=structuredClone(saved);invalid.payload.rackTypes.push({...structuredClone(invalid.payload.rackTypes[0]),drawing:{totalWidth:99999},__rafexSnapshot:{totalWidth:99999}});
  invalid.payload.projectIdentity.uuid='invalid-project';
  await page.evaluate(record=>{
   const snapshot=()=>JSON.stringify([window.rafexProjectIdentityV133,window.rafexProjectTypesV133,m2LayoutState]);
   const before=snapshot();let rejected=false;try{m2ApplyProjectRecord(record,false)}catch(_){rejected=true}
   if(!rejected||snapshot()!==before)throw Error('Invalid catalog changed active project: '+JSON.stringify({rejected,before:JSON.parse(before)[0],after:window.rafexProjectIdentityV133,changed:JSON.parse(before).map((v,i)=>JSON.stringify(v)!==JSON.stringify(JSON.parse(snapshot())[i]))}));
  },invalid);
  const multi=structuredClone(saved),duplicate={...structuredClone(multi.payload.rackTypes[0]),id:600,name:'F'};
  multi.payload.rackTypes.push(duplicate);
  const second=structuredClone(multi.payload.areas[0]);second.id='second-test-area';second.name='İkinci Alan';
  for(const rack of second.layout.racks)rack.id+=1000;
  multi.payload.areas.push(second);
  for(const area of multi.payload.areas)for(const rack of area.layout.racks)if(rack.rafexSystem==='b2b')rack.rafexCatalogKey='b2b:600';
  await page.evaluate(record=>{
   const before=JSON.stringify(record);m2ApplyProjectRecord(record,false);
   if(JSON.stringify(record)!==before)throw Error('History record was mutated');
   const areas=window.rafexAreaDocument().areas;
   if(areas.length!==2||areas.some(a=>a.layout.racks.length!==10))throw Error('Multi-area racks lost');
   if(areas.flatMap(a=>a.layout.racks).some(r=>r.rafexSystem==='b2b'&&(r.rafexCatalogKey!=='b2b:1'||r.typeName!=='A')))throw Error('Inactive area catalog aliases not reconciled');
  },multi);
  const legacy=structuredClone(saved);delete legacy.payload.rafexCommonDrawing;legacy.module='mekik2';legacy.payload.module='mekik2';
  const legacyRacks=await page.evaluate(record=>{m2ApplyProjectRecord(record,false);return m2LayoutState.racks.map(r=>({id:r.id,key:r.rafexCatalogKey,name:r.typeName,system:r.rafexSystem,w:r.w,h:r.h}))},legacy);
  assert.deepEqual(legacyRacks,checks,'Legacy record opened in common editor corrupted rack systems');
  assert.deepEqual(errors,[],'Browser errors');assert.deepEqual(dialogs,[],'Unexpected dialogs');
  console.log('PASS: five-editor mixed history, catalog identity, copy/undo, PAN-only wheel, idle DOM, culling, complete export, invalid catalog rollback, multi-area aliases.');
 }
}finally{await browser.close()}
