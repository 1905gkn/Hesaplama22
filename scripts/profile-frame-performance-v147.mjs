import fs from 'node:fs';
import {createRequire} from 'node:module';
import {transform} from './patch-idle-dom-performance-v147.mjs';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const source=fs.readFileSync('.tmp-v109/build/dist/server/index.js','utf8');
const html=Buffer.from(source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/)[1],'base64').toString();
const browser=await chromium.launch({channel:'msedge',headless:true});
try {for(const variant of (process.argv.includes('--current')?['current']:html.includes('/* idle-dom-performance-v147:')?['optimized']:['current','optimized'])){
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const p=new URL(r.request().url()).pathname;
 if(p==='/')return r.fulfill({contentType:'text/html',body:variant==='current'?html:transform(html)});
 if(p==='/api/bootstrap')return r.fulfill({json:{needsSetup:false}});
 if(p==='/api/me')return r.fulfill({json:{user:{id:1,fullName:'Test',username:'test',role:'super',defaultLanguage:'tr'}}});
 if(p.startsWith('/api/'))return r.fulfill({json:{rows:[],types:[],rackTypes:[],projects:[],settings:{}}});
 return r.fulfill({contentType:'application/javascript',body:''});});
 await page.goto('https://rafex.test/');await page.waitForTimeout(400);
 const cdp=await page.context().newCDPSession(page);const events=[];cdp.on('Tracing.dataCollected',e=>events.push(...e.value));await cdp.send('Tracing.start',{categories:'devtools.timeline',transferMode:'ReportEvents'});await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
 const results=await page.evaluate(async()=>{
  renderB2B();m2ActiveModule='b2b';drawMekik2();m2AddRack(b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()}),'A');
  if(!m2LayoutState.racks.length)throw Error('Fixture missing');
  const fixture=structuredClone(m2LayoutState.racks[0]);
  m2LayoutState.scale=.0044;m2LayoutState.points=[{x:0,y:0},{x:1000,y:0},{x:1000,y:650},{x:0,y:650}];m2LayoutState.closed=true;
  m2LayoutState.racks=Array.from({length:936},(_,i)=>({...structuredClone(fixture),id:1000+i,x:60+(i%36)*12.276,y:100+Math.floor(i/36)*15,staged:false,freePlacement:false,angle:0,b2bLayout:{...fixture.b2bLayout,rowCount:i<36?1:2},typeName:i<36?'A':'B',w:12.672,h:i<36?8:11,joinGroup:'row'+Math.floor(i/36),sharedFootWith:i%36?999+i:null,sharedFootSide:i%36?'left':null}));
  document.querySelectorAll("nav button").forEach(n=>n.classList.toggle("active",n.dataset.page==="free"));document.getElementById("page").setAttribute("data-rafex-common-active","1");const before=performance.now();m2RenderLayout();const initialMs=performance.now()-before;await new Promise(r=>setTimeout(r,500));
  await new Promise(r=>setTimeout(r,2000));const mutations={};const mo=new MutationObserver(rs=>{for(const r of rs){const k=r.target.nodeName+"#"+r.target.id+"."+(r.target.getAttribute?.("class")||"")+":"+(r.attributeName||r.type);mutations[k]=(mutations[k]||0)+1}});mo.observe(document.getElementById("page"),{subtree:true,attributes:true,childList:true});const painted=[];for(let i=0;i<8;i++){await new Promise(r=>requestAnimationFrame(r));const t=performance.now();m2ZoomLayout(i%2?-.1:.1);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));painted.push(performance.now()-t)}mo.disconnect();const svg=document.getElementById("m2LayoutSvg"),view=window.rafexCommonLayoutZoomCrispV126.getView(),rect=svg.getBoundingClientRect(),center=new DOMPoint(view.x+view.w/2,view.y+view.h/2).matrixTransform(svg.getScreenCTM());if(Math.hypot(center.x-rect.x-rect.width/2,center.y-rect.y-rect.height/2)>1)throw Error("Zoom matrix differs from visible viewport");const shared=()=>Array.from(document.querySelectorAll('.rafex-shared-foot-layer-v60 [data-shared-foot]'));
  const geometry=()=>shared().map(n=>[n.getAttribute('data-shared-foot'),n.getAttribute('transform'),Array.from(n.children).filter(c=>c.hasAttribute('width')).map(c=>['x','y','width','height'].map(k=>c.getAttribute(k)))]);
  const initialShared=geometry(),stableShared=shared().at(-1);
  const times=[];for(let i=0;i<3;i++){const t=performance.now();m2LayoutState.selected=1000+i;m2RenderLayout();times.push(performance.now()-t);await new Promise(r=>setTimeout(r,50));}
  if(JSON.stringify(initialShared)!==JSON.stringify(geometry()))throw Error('Unchanged shared foot geometry changed: '+JSON.stringify([initialShared[0],geometry()[0]]));
  const retainedShared=stableShared===shared().at(-1);
  const members=m2LayoutState.racks.slice(0,36),origins=members.map(r=>({id:r.id,x:r.x,y:r.y})),drag={id:members[0].id,originX:members[0].x,originY:members[0].y,groupMembers:origins};
  m2LayoutState.drag=drag;m2PushFastDragUndo(drag);const frames=[];
  for(let i=1;i<=5;i++){const t=performance.now();m2ApplyGroupTranslation(origins,.2*i,0);m2PerfRenderSingleRackDragFrame();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));frames.push(performance.now()-t)}
  const finishStart=performance.now(),retainedDrag=m2FinishRetainedDragV107(drag),finishMs=performance.now()-finishStart;
  if(!retainedDrag)throw Error('Shared row drag did not retain nodes');
  const getBox=()=>{const n=shared()[0],b=n.getBBox(),p=new DOMPoint(b.x,b.y).matrixTransform(n.getCTM());return {x:p.x,y:p.y}};
  const fast=getBox();m2RenderLayout();const full=getBox();if(Math.hypot(fast.x-full.x,fast.y-full.y)>.01)throw Error('Shared foot moved differently after a full refresh');
  m2UndoLastAction();if(!members.every((r,i)=>Math.abs(r.x-origins[i].x)<.001&&Math.abs(r.y-origins[i].y)<.001))throw Error('Shared row undo failed');
  let bboxCalls=0,bboxMs=0;const bbox=SVGGraphicsElement.prototype.getBBox;SVGGraphicsElement.prototype.getBBox=function(...args){const t=performance.now();try{return bbox.apply(this,args)}finally{bboxCalls++;bboxMs+=performance.now()-t}};
  const t=performance.now();window.rafexFitNameplatesV136?.();const fitMs=performance.now()-t;
  SVGGraphicsElement.prototype.getBBox=bbox;
  return {mutations:Object.entries(mutations).sort((a,b)=>b[1]-a[1]).slice(0,20),painted,initialMs,renderMs:times,fitMs,bboxCalls,bboxMs,retainedShared,retainedDrag,dragFrames:frames,finishMs,racks:m2LayoutState.racks.length,nodes:document.getElementById('m2LayoutSvg').querySelectorAll('*').length};
 });
 await cdp.send('Tracing.end');await new Promise(r=>cdp.once('Tracing.tracingComplete',r));fs.writeFileSync('.tmp-v109/frame-trace-v147.json',JSON.stringify(events));const traceTotals={};for(const e of events)if(e.ph==='X'&&e.dur)traceTotals[e.name]=(traceTotals[e.name]||0)+e.dur/1000;console.log(JSON.stringify({trace:Object.entries(traceTotals).sort((a,b)=>b[1]-a[1]).slice(0,20)}));const {profile}=await cdp.send('Profiler.stop');const nodes=new Map(profile.nodes.map(n=>[n.id,n])),parents=new Map();for(const n of profile.nodes)for(const child of n.children||[])parents.set(child,n.id);const totals=new Map();for(let i=0;i<(profile.samples||[]).length;i++){let id=profile.samples[i];const stack=[];for(let j=0;j<3&&id;j++,id=parents.get(id)){const f=nodes.get(id)?.callFrame;stack.push((f?.functionName||'(anonymous)')+' @'+f?.lineNumber)}const key=stack.join(' <- ');totals.set(key,(totals.get(key)||0)+(profile.timeDeltas[i]||0)/1000)}
 assert.equal(errors.length,0,errors.join('\n'));if(variant==='optimized')assert(results.retainedShared);if(variant==='optimized'){assert(!results.mutations.some(([key])=>key.includes('m2SelectedRackInfo')||key==='svg#m2LayoutSvg.:style'),'Zoom must not rewrite selection or SVG styles');}
 console.log(JSON.stringify({variant,...results,errors,cpu:[...totals].sort((a,b)=>b[1]-a[1]).slice(0,8)}));await page.close();
}}finally{await browser.close()}
