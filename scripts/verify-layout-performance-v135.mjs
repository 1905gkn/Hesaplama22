import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {transform} from './patch-layout-performance-v135.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const source=fs.readFileSync(process.argv[2]||'dist/server/index.js','utf8');
const encoded=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
const original=encoded?Buffer.from(encoded[2],'base64').toString():source;
const html=process.argv.includes('--baseline')?original:transform(original);
assert.equal(transform(transform(original)),transform(original),'patch is idempotent');
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
  if(!/\bsrc=|type=["'](?:module|application\/)/.test(match[1]))new vm.Script(match[2]);
}
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
const errors=[],writes=[];
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog',d=>d.accept());
  await page.route('**/*',route=>{
    const req=route.request(),u=new URL(req.url());
    if(req.method()!=='GET')writes.push(u.pathname);
    if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:html});
    if(u.pathname==='/api/bootstrap')return route.fulfill({json:{needsSetup:false}});
    if(u.pathname==='/api/me')return route.fulfill({json:{user:{id:1,fullName:'Test',username:'test',role:'super',defaultLanguage:'tr'}}});
    if(u.pathname.startsWith('/api/'))return route.fulfill({json:{rows:[],types:[],rackTypes:[],settings:{},projects:[]}});
    return route.fulfill({contentType:'application/javascript',body:''});
  });
  await page.goto('https://rafex.test/');await page.waitForTimeout(1200);
  await page.evaluate(()=>{
    renderB2B();m2ActiveModule='b2b';drawMekik2();
    const drawing=b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()});
    m2AddRack(drawing,'A');window.fixtureV135=structuredClone(m2LayoutState.racks[0]);window.drawingV135=drawing;
    m2LayoutState.racks=Array.from({length:500},(_,i)=>({...structuredClone(fixtureV135),id:1000+i,x:25+(i%25)*36,y:25+Math.floor(i/25)*26,w:28.8,h:12,angle:0,freePlacement:false,staged:false,sharedFootWith:null,joinGroup:null}));
    m2LayoutState.scale=.01;m2LayoutState.points=[{x:0,y:0},{x:1000,y:0},{x:1000,y:650},{x:0,y:650}];m2LayoutState.closed=true;m2LayoutState.selected=null;
    m2LayoutSymbols=m2LayoutState.racks.flatMap((r,i)=>[0,1].map(k=>({id:5000+i*2+k,type:'uakz',rackId:r.id,localX:(k?1:-1)*r.w/2,localY:-r.h/2,x:r.x,y:r.y,w:3.6,h:3.6,widthMm:360,depthMm:360,blocking:false,showDetails:false})));
    m2RenderLayout();
  });
  await page.waitForTimeout(1700);
  const result=await page.evaluate(async()=>{
    const check=(value,message)=>{if(!value)throw Error(message)};
    const near=(a,b)=>Math.abs(a-b)<.001;
    const wait=()=>new Promise(r=>setTimeout(r,200));
    const center=node=>{const b=node.getBBox(),p=new DOMPoint(b.x+b.width/2,b.y+b.height/2).matrixTransform(node.getCTM());return{x:p.x,y:p.y}};
    const symbolNode=id=>document.querySelector('[data-layout-symbol="'+id+'"]');
    const times=[];let removedRacks=0;
    const observer=new MutationObserver(records=>{for(const r of records)for(const n of r.removedNodes)if(n.nodeType===1&&n.matches('[data-rack]'))removedRacks++});
    observer.observe(document.getElementById('m2LayoutContent'),{childList:true});
    for(let i=0;i<3;i++){const t=performance.now();m2RenderLayout();times.push(performance.now()-t);await wait()}
    observer.disconnect();
    const baseline=!window.rafexLayoutPerformanceVersion;
    if(!baseline)check(removedRacks===0,'unchanged racks must remain attached');
    const rack=m2LayoutState.racks[0];m2LayoutState.selected=rack.id;m2RenderLayout();await wait();
    const start={x:rack.x,y:rack.y};const stable=symbolNode(5000),startCenter=center(stable),finishTimes=[];
    const startUndo=m2UndoHistory.length;
    for(let i=0;i<3;i++){
      const origins=[{id:rack.id,x:rack.x,y:rack.y}],drag={id:rack.id,originX:rack.x,originY:rack.y,groupMembers:origins};
      m2LayoutState.drag=drag;m2PushFastDragUndo(drag);
      check(m2MoveRackOrJoinedGroup(rack,rack.x+.5,rack.y),'valid drag rejected');
      m2PerfRenderSingleRackDragFrame();const t=performance.now(),retained=m2FinishRetainedDragV107(drag);
      if(baseline&&!retained){m2LayoutState.drag=null;m2RenderLayout()}
      else check(retained,'protected rack fast finish failed');
      finishTimes.push(performance.now()-t);await wait();
      if(!baseline)check(symbolNode(5000)===stable,'protection was recreated');
      const s=m2LayoutSymbols[0];check(near(s.x,rack.x+rack.w/2+s.localX-s.w/2),'protection model drift');
    }
    check(near(rack.x,start.x+1.5),'repeated rack drag drift');
    const afterCenter=center(symbolNode(5000));check(afterCenter.x>startCenter.x,'protection did not move');
    m2RenderLayout();await wait();const fullCenter=center(symbolNode(5000));
    check(near(afterCenter.x,fullCenter.x)&&near(afterCenter.y,fullCenter.y),'retained protection differs from full render');
    for(let i=0;i<3;i++)m2UndoLastAction();await wait();
    check(near(rack.x,start.x)&&near(rack.y,start.y)&&m2UndoHistory.length===startUndo,'repeated drag undo failed');
    check(near(center(symbolNode(5000)).x,startCenter.x),'protection undo failed');

    // Joined movement and shared-foot layer retain their existing semantics.
    const pair=m2LayoutState.racks.slice(0,2);pair.forEach(r=>r.joinGroup='verify-v135');
    pair[1].sharedFootWith=pair[0].id;pair[1].sharedFootSide='left';m2RenderLayout();await wait();
    const origins=pair.map(r=>({id:r.id,x:r.x,y:r.y})),drag={id:pair[0].id,originX:pair[0].x,originY:pair[0].y,groupMembers:origins};
    m2LayoutState.drag=drag;m2PushFastDragUndo(drag);check(m2MoveRackOrJoinedGroup(pair[0],pair[0].x,pair[0].y+1),'group move invalid');m2PerfRenderSingleRackDragFrame();
    const grouped=m2FinishRetainedDragV107(drag);if(!grouped){check(baseline,'group retained finish failed');m2LayoutState.drag=null;m2RenderLayout()}
    check(pair.every((r,i)=>near(r.y,origins[i].y+1)),'group rack drift');
    const groupCenters=[5000,5001,5002,5003].map(id=>center(symbolNode(id)));
    m2RenderLayout();await wait();[5000,5001,5002,5003].forEach((id,i)=>check(near(center(symbolNode(id)).y,groupCenters[i].y),'group protection drift'));
    m2UndoLastAction();check(pair.every((r,i)=>near(r.y,origins[i].y)),'group undo failed');
    pair.forEach(r=>{r.joinGroup=null;r.sharedFootWith=null});m2RenderLayout();

    // Columns still block movement; barrier/topology changes use full render.
    const column={id:9000,type:'column',x:rack.x+2,y:rack.y,w:rack.w,h:rack.h,blocking:true};
    m2LayoutSymbols.push(column);m2LayoutState.drag=null;
    check(!m2MoveRackOrJoinedGroup(rack,column.x,column.y),'column collision bypassed');m2LayoutSymbols.pop();
    const fallback={id:rack.id,originX:rack.x,originY:rack.y,groupMembers:[{id:rack.id,x:rack.x,y:rack.y}]};
    m2LayoutSymbols.push({id:9001,type:'barrier'});check(!m2FinishRetainedDragV107(fallback),'barrier fallback missing');m2LayoutSymbols.pop();
    check(!m2FinishRetainedDragV107({...fallback,selectionGroup:true}),'mixed selection fallback missing');
    const originalRacks=m2LayoutState.racks.length;
    const addStart=performance.now();m2AddRack(drawingV135,'A');const addMs=performance.now()-addStart;
    check(m2LayoutState.racks.length===originalRacks+1,'add rack failed');await wait();
    check(m2LayoutSymbols.length===1000,'accessories lost');
    const svg=document.getElementById('m2LayoutSvg'),originals=svg.querySelectorAll('.m2-b2b-plan-upright:not(.rafex-profile-merge-source-v61)').length;
    const paths=Array.from(svg.querySelectorAll('path.rafex-pdf-upright-overlay-v132'));
    check(paths.reduce((n,p)=>n+(p.getAttribute('d').match(/M/g)||[]).length,0)===originals,'PDF upright geometry lost');
    return {times,finishTimes,addMs,removedRacks,racks:m2LayoutState.racks.length,symbols:m2LayoutSymbols.length,grouped,pdfPaths:paths.length,checks:'repeated drag, attached protections, undo, group/shared feet, collisions, fallback, add, PDF geometry'};
  });
  await page.evaluate(()=>{
    m2LayoutState.mode='idle';m2LayoutState.drag=null;m2LayoutTool=null;m2AutoFillDraft=null;m2ClearMultiSelection();
    const rack=m2LayoutState.racks.find(r=>r.id===1030);m2LayoutState.selected=rack.id;m2RenderLayout();
    window.pointerBeforeV135={x:rack.x,y:rack.y};window.pointerFinishV135=null;
    const finish=m2FinishRetainedDragV107;
    m2FinishRetainedDragV107=function(drag){const t=performance.now(),retained=finish(drag);window.pointerFinishV135={retained,ms:performance.now()-t};return retained};
  });
  const rackElement=page.locator('#m2LayoutSvg [data-rack="1030"] > .m2-layout-rack');
  await rackElement.scrollIntoViewIfNeeded();await page.waitForTimeout(250);
  const box=await rackElement.boundingBox();assert(box);
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2+5,{steps:8});await page.mouse.up();await page.waitForTimeout(250);
  const pointer=await page.evaluate(()=>({before:pointerBeforeV135,after:{x:m2LayoutState.racks.find(r=>r.id===1030).x,y:m2LayoutState.racks.find(r=>r.id===1030).y},finish:pointerFinishV135}));
  assert(pointer.after.y!==pointer.before.y,'real pointer drag must move the rack');
  if(!process.argv.includes('--baseline'))assert(pointer.finish?.retained,'real pointerup must use retained finish');
  console.log(JSON.stringify({result,pointer,errors,writes},null,2));
  assert.deepEqual(errors,[]);assert.deepEqual(writes,[],'layout interactions must not write to the database');
  if(process.env.VERIFY_SCREENSHOT)await page.locator('#m2LayoutSvg').screenshot({path:process.env.VERIFY_SCREENSHOT});
}finally{await browser.close()}
