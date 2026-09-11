import fs from 'node:fs';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {transform} from './patch-static-selection-v148.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const html=fs.readFileSync('.tmp-v109/build/dist/index.html','utf8');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const variant of html.includes('/* static-selection-v148 */')?['optimized']:['current','optimized']){
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{
    const p=new URL(r.request().url()).pathname;
    if(r.request().method()!=='GET')writes.push(p);
    if(p==='/')return r.fulfill({contentType:'text/html',body:variant==='current'?html:transform(html)});
    if(p==='/api/bootstrap')return r.fulfill({json:{needsSetup:false}});
    if(p==='/api/me')return r.fulfill({json:{user:{id:1,fullName:'Test',username:'test',role:'super',defaultLanguage:'tr',allowed_modules:['free','b2b','mr','drive','mekik2','konsol']}}});
    if(p.startsWith('/api/'))return r.fulfill({json:{rows:[],types:[],rackTypes:[],projects:[],settings:{}}});
    return r.fulfill({contentType:'application/javascript',body:''});
  });
  await page.goto('https://rafex.test/');await page.waitForTimeout(1300);
  await page.addStyleTag({content:'#b2b3DLoading{display:none!important;pointer-events:none!important}'});
  await page.locator('#nav button[data-page="free"]').click();
  try{await page.locator('#rafexAuthorityProjectName').fill('Selection test',{timeout:8000});}catch(e){console.log(JSON.stringify({errors,ui:await page.locator('#page').innerText()}));throw e;}
  await page.locator('#rafexNewProjectV133').click();
  await page.locator('input[name="rafexUnifiedSystem"][value="b2b"]').check({force:true});
  await page.waitForTimeout(500);
  await page.getByRole('button',{name:'Alanı Belirle',exact:true}).click();
  await page.evaluate(()=>{
    m2ActiveModule='b2b';drawMekik2();m2AddRack(b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()}),'A');
    const fixture=structuredClone(m2LayoutState.racks[0]);
    m2LayoutState.scale=.0044;m2LayoutState.points=[{x:0,y:0},{x:1000,y:0},{x:1000,y:650},{x:0,y:650}];m2LayoutState.closed=true;
    m2LayoutState.racks=Array.from({length:936},(_,i)=>({...structuredClone(fixture),id:1000+i,x:60+(i%36)*12.276,y:100+Math.floor(i/36)*15,staged:false,freePlacement:false,angle:0,b2bLayout:{...fixture.b2bLayout,rowCount:i<36?1:2},typeName:i<36?'A':'B',w:12.672,h:i<36?8:11,joinGroup:'row'+Math.floor(i/36),sharedFootWith:i%36?999+i:null,sharedFootSide:i%36?'left':null}));
    document.querySelectorAll('nav button').forEach(n=>n.classList.toggle('active',n.dataset.page==='free'));document.getElementById('page').setAttribute('data-rafex-common-active','1');
    m2LayoutState.mode='idle';m2LayoutState.drag=null;m2LayoutTool=null;m2AutoFillDraft=null;m2ClearMultiSelection();m2RenderLayout();
  });
  await page.locator('#m2LayoutSvg').scrollIntoViewIfNeeded();await page.waitForTimeout(2200);
  const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
  await page.evaluate(()=>{
    window.selectionStatsV148={handlers:[],motion:0,undo:0,renders:0,positions:JSON.stringify(m2LayoutState.racks),history:m2UndoHistory.length};
    const svg=document.getElementById('m2LayoutSvg');
    for(const key of ['onpointerdown','onpointerup']){const base=svg[key];svg[key]=function(e){const t=performance.now();try{return base.call(this,e)}finally{selectionStatsV148.handlers.push({event:key,ms:performance.now()-t})}}}
    const move=m2ApplyLiveRackDrag,push=m2PushFastDragUndo,render=m2RenderLayout;
    m2ApplyLiveRackDrag=function(...a){selectionStatsV148.motion++;return move(...a)};
    m2PushFastDragUndo=function(...a){selectionStatsV148.undo++;return push(...a)};
    m2RenderLayout=function(...a){selectionStatsV148.renders++;return render(...a)};
  });
  const times=[];
  for(const id of [1040,1041,1076]){
    const target=page.locator(`#m2LayoutSvg [data-rack="${id}"] > .m2-layout-rack`);await target.scrollIntoViewIfNeeded();
    const box=await target.boundingBox();assert(box);
    const t=Date.now();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));times.push(Date.now()-t);
    assert.equal(await page.evaluate(()=>m2LayoutState.selected),id);
  }
  const result=await page.evaluate(()=>({...selectionStatsV148,positions:selectionStatsV148.positions===JSON.stringify(m2LayoutState.racks),history:selectionStatsV148.history===m2UndoHistory.length,drag:m2LayoutState.drag,selected:document.querySelectorAll('#m2LayoutSvg .m2-layout-rack.selected').length}));
  const {profile}=await cdp.send('Profiler.stop'),nodes=new Map(profile.nodes.map(n=>[n.id,n])),parents=new Map(),totals=new Map();
  for(const n of profile.nodes)for(const id of n.children||[])parents.set(id,n.id);
  for(let i=0;i<(profile.samples||[]).length;i++){let id=profile.samples[i];const stack=[];for(let j=0;j<3&&id;j++,id=parents.get(id)){const f=nodes.get(id)?.callFrame;stack.push((f?.functionName||'(anonymous)')+' @'+f?.lineNumber)}const key=stack.join(' <- ');totals.set(key,(totals.get(key)||0)+(profile.timeDeltas[i]||0)/1000)}
  result.cpu=[...totals].sort((a,b)=>b[1]-a[1]).slice(0,10);
  if(variant==='optimized'){assert.equal(result.motion,0);assert.equal(result.undo,0);assert.equal(result.renders,0);assert(result.positions);assert(result.history);assert.equal(result.drag,null);assert.equal(result.selected,1);}
  if(variant==='optimized'){
    await page.waitForTimeout(550); // Keep this separate from the double-click extension gesture.
    const target=page.locator('#m2LayoutSvg [data-rack="1045"] > .m2-layout-rack');await target.scrollIntoViewIfNeeded();
    const box=await target.boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;
    const before=await page.evaluate(()=>({racks:m2LayoutState.racks.map(r=>({id:r.id,x:r.x,y:r.y})),history:m2UndoHistory.length}));
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+1,y);await page.mouse.up();
    assert.deepEqual(await page.evaluate(()=>m2LayoutState.racks.map(r=>({id:r.id,x:r.x,y:r.y}))),before.racks,'Pointer jitter is selection, not movement');
    assert.equal(await page.evaluate(()=>m2UndoHistory.length),before.history);
    await page.waitForTimeout(550);
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y+4,{steps:4});await page.mouse.up();
    assert.notDeepEqual(await page.evaluate(()=>m2LayoutState.racks.map(r=>({id:r.id,x:r.x,y:r.y}))),before.racks,'Real drag still moves the joined row');
    assert.equal(await page.evaluate(()=>m2UndoHistory.length),before.history+1);
    await page.evaluate(()=>m2UndoLastAction());
    assert.deepEqual(await page.evaluate(()=>m2LayoutState.racks.map(r=>({id:r.id,x:r.x,y:r.y}))),before.racks,'Undo restores the row');
    result.jitterAndDrag='passed';
  }
  assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
  console.log(JSON.stringify({variant,times,...result,errors,writes}));
  await page.close();
}}finally{await browser.close()}
