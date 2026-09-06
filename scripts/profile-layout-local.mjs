import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {transform} from './patch-free-drag-distance-v104.mjs';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'rafex-profile-'));
fs.mkdirSync(path.join(scratch,'dist/server'),{recursive:true});
const file=path.join(scratch,'dist/server/index.js');
fs.writeFileSync(file,"const HTML_BASE64='"+Buffer.from(fs.readFileSync('.tmp-cold-store-before.html','utf8')).toString('base64')+"';");
for(const script of ['patch-runtime-authority-v2.mjs','patch-common-system-isolation-v1.mjs','patch-uniform-color-controls-v1.mjs'])execFileSync(process.execPath,[path.resolve('scripts',script)],{cwd:scratch});
const before=Buffer.from(fs.readFileSync(file,'utf8').match(/HTML_BASE64='([^']+)'/)[1],'base64').toString();
const html=transform(before);
const guideStart=before.indexOf('      function m2RackDistanceGuide(rack) {');
const originalGuide=before.slice(guideStart,before.indexOf('\n      function m2ColumnDistanceGuide',guideStart));
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
  const page=await browser.newPage({viewport:{width:1400,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{
    const u=new URL(route.request().url());
    if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:html});
    if(u.pathname==='/api/bootstrap')return route.fulfill({json:{needsSetup:false}});
    if(u.pathname==='/api/me')return route.fulfill({json:{user:{id:1,fullName:'Local Test',username:'test',role:'super',defaultLanguage:'tr'}}});
    return route.fulfill({contentType:'application/json',body:'[]'});
  });
  await page.goto('https://rafex.test/');await page.waitForTimeout(800);
  const init=await page.evaluate(()=>{renderB2B();m2AddRack();return {racks:m2LayoutState.racks.length,keys:Object.keys(m2LayoutState.racks[0]||{})};});
  console.log(JSON.stringify({init,errors:errors.slice(0,3)}));
  if(!init.racks)throw Error('No fixture rack');
  const result=await page.evaluate(async()=>{
    const first=m2LayoutState.racks[0];m2LayoutState.racks=Array.from({length:504},(_,i)=>({...structuredClone(first),id:1000+i,x:20+i%36*25,y:20+Math.floor(i/36)*42,w:24,h:12,angle:0,freePlacement:false,staged:false,joinGroup:'row'+Math.floor(i/36),sharedFootWith:i%36?999+i:null}));
    m2LayoutState.scale=.005;m2LayoutState.points=[{x:0,y:0},{x:1000,y:0},{x:1000,y:650},{x:0,y:650}];m2LayoutState.closed=true;
    m2LayoutState.selected=1000;const t=performance.now();m2RenderLayout();const renderMs=performance.now()-t;
    const originalPositions=m2LayoutState.racks.map(r=>({id:r.id,x:r.x,y:r.y}));
    const staticNode=document.querySelector('[data-rack="1500"]');
    const origins=m2LayoutState.racks.slice(0,36).map(r=>({id:r.id,x:r.x,y:r.y}));
    m2LayoutState.drag={id:1000,originX:origins[0].x,originY:origins[0].y,groupMembers:origins};m2PushFastDragUndo(m2LayoutState.drag);
    const phases=[];
    for(let i=0;i<8;i++){const a=performance.now();const adjusted=m2SmoothGroupTranslation(origins,0,i*.3);const b=performance.now();m2ApplyGroupTranslation(origins,adjusted.dx,adjusted.dy);const c=performance.now();m2PerfRenderSingleRackDragFrame();phases.push({collision:b-a,apply:c-b,paint:performance.now()-c});}
    const timings={};
    for(const name of ['m2PerfRenderSingleRackDragFrame','m2WallDistanceGuides','m2RackDistanceGuide','m2ColumnDistanceGuide','m2PerfRefreshStaticSelectionUi','m2NearestRackGap','m2PerfDistancePrepare']){const base=window[name];window[name]=function(...args){const start=performance.now();try{return base.apply(this,args)}finally{const t=timings[name]||(timings[name]={ms:0,calls:0});t.ms+=performance.now()-start;t.calls++;}};}
    const releaseStart=performance.now(),retained=m2FinishRetainedDragV107(m2LayoutState.drag),releaseMs=performance.now()-releaseStart;
    const releaseTimings=structuredClone(timings);
    const unchangedStatic=staticNode===document.querySelector('[data-rack="1500"]');
    await new Promise(resolve=>setTimeout(resolve,250));
    const retainedAfterObservers=staticNode===document.querySelector('[data-rack="1500"]');
    const firstMove=m2LayoutState.racks[0].y-originalPositions[0].y;
    const secondOrigins=m2LayoutState.racks.slice(0,36).map(r=>({id:r.id,x:r.x,y:r.y}));
    m2LayoutState.drag={id:1000,originX:secondOrigins[0].x,originY:secondOrigins[0].y,groupMembers:secondOrigins};m2PushFastDragUndo(m2LayoutState.drag);
    m2ApplyGroupTranslation(secondOrigins,0,1);m2PerfRenderSingleRackDragFrame();const secondRetained=m2FinishRetainedDragV107(m2LayoutState.drag);
    const rect=document.querySelector('[data-rack="1000"] .m2-layout-rack'),svg=document.getElementById('m2LayoutSvg'),p=svg.createSVGPoint();p.x=Number(rect.getAttribute('x'))+Number(rect.getAttribute('width'))/2;p.y=Number(rect.getAttribute('y'))+Number(rect.getAttribute('height'))/2;
    const local=p.matrixTransform(rect.getCTM()),rack=m2LayoutState.racks[0];const q=svg.createSVGPoint();q.x=rack.x+rack.w/2;q.y=rack.y+rack.h/2;const expected=q.matrixTransform(svg.getCTM());
    const visualError=Math.hypot(local.x-expected.x,local.y-expected.y);
    m2UndoLastAction();m2UndoLastAction();
    const undoRestored=m2LayoutState.racks.every((r,i)=>Math.abs(r.x-originalPositions[i].x)<.01&&Math.abs(r.y-originalPositions[i].y)<.01);
    return {renderMs,phases,releaseMs,releaseTimings,retained,secondRetained,unchangedStatic,retainedAfterObservers,firstMove,visualError,undoRestored};
  });
  console.log(JSON.stringify(result,null,2));
  assert(result.retained&&result.secondRetained&&result.unchangedStatic&&result.retainedAfterObservers&&result.undoRestored);assert(result.firstMove>0);assert(result.visualError<.01);
  const parity=await page.evaluate(source=>{
    const original=new Function(source+';return m2RackDistanceGuide;')();
    return [0,72,252,503].every(i=>original(m2LayoutState.racks[i])===m2RackDistanceGuide(m2LayoutState.racks[i]));
  },originalGuide);
  assert(parity,'Distance guide output must remain identical');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS: retained nodes, repeated drag, observer stability, undo and exact distance guide parity.');
}finally{await browser.close();}
