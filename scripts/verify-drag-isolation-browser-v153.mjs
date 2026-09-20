import fs from 'node:fs';
import {transform} from './patch-drag-isolation-v153.mjs';
import {createRequire} from 'node:module';
// Optional browser test. Mock APIs guarantee no saved project can be changed.
// Use --optimized --verify for the new code; omit --optimized for a baseline.
const {chromium}=createRequire(import.meta.url)(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
fs.mkdirSync('outputs',{recursive:true});
const origin='https://rafex-configurator.vercel.app',html=process.argv.includes('--offline')?fs.readFileSync('outputs/live-v152.html','utf8'):await(await fetch(origin)).text(),assets=new Map();
for(const m of html.matchAll(/<script[^>]+src="(\/runtime-assets\/[^" ]+)"/g))assets.set(m[1],process.argv.includes('--offline')?fs.readFileSync('outputs/'+m[1].split('/').at(-1),'utf8'):await(await fetch(origin+m[1])).text());
fs.writeFileSync('outputs/live-'+(html.includes('data-drag-isolation="v153"')?'v153':'v152')+'.html',html);for(const [p,b] of assets)fs.writeFileSync('outputs/'+p.split('/').at(-1),b);
if(process.argv.includes('--optimized'))fs.writeFileSync('outputs/optimized-v153.html',transform(html));
const browser=await chromium.launch({channel:'msedge',headless:true});
const all=[];
try{for(const [count,lanes] of (process.argv.includes('--probe')?[[936,false]]:[[100,false],[936,false],[60,true]])){
 const page=await browser.newPage({viewport:{width:1600,height:1200}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const p=new URL(r.request().url()).pathname;if(p==='/')return r.fulfill({contentType:'text/html',body:process.argv.includes('--optimized')?transform(html):html});if(assets.has(p))return r.fulfill({contentType:'application/javascript',body:assets.get(p)});if(p==='/api/bootstrap')return r.fulfill({json:{needsSetup:false}});if(p==='/api/me')return r.fulfill({json:{user:{id:1,fullName:'Audit',username:'audit',role:'super',defaultLanguage:'tr'}}});if(p.startsWith('/api/'))return r.fulfill({json:{rows:[],types:[],rackTypes:[],projects:[],settings:{}}});return r.fulfill({contentType:'application/javascript',body:''});});
 await page.goto(origin);await page.waitForTimeout(800);
 const init=await page.evaluate(async({count,lanes})=>{
 renderB2B();m2ActiveModule='b2b';drawMekik2();m2AddRack(b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()}),'A');
 const f=structuredClone(m2LayoutState.racks[0]);
 showPage('free');document.querySelector('input[name="rafexUnifiedSystem"][value="b2b"]').checked=true;window.rafexFreeDrawingContinue();
 window.rafexProjectIdentityV133={uuid:'test-local-drag-audit',displayNumber:'TEST'};window.rafexActivateProjectV134(window.rafexProjectIdentityV133);
 m2LayoutState.scale=.0044;m2LayoutState.points=[{x:0,y:0},{x:1000,y:0},{x:1000,y:650},{x:0,y:650}];m2LayoutState.closed=true;
 m2LayoutState.racks=Array.from({length:count},(_,i)=>({...structuredClone(f),id:1000+i,x:60+(i%36)*12.276,y:100+Math.floor(i/36)*15,staged:false,freePlacement:false,angle:0,b2bLayout:{...f.b2bLayout,rowCount:2},typeName:'B',w:12.672,h:11,joinGroup:'row'+Math.floor(i/36),sharedFootWith:i%36?999+i:null,sharedFootSide:i%36?'left':null}));
 if(lanes)m2LayoutState.racks=m2LayoutState.racks.map((r,i)=>({...r,b2b:undefined,b2bLayout:undefined,layoutView:null,rackDetail:null,rafexSystem:i%2?'drive':'mekik2',systemType:'fifo',bays:20,depth:14,widthMm:21000,depthMm:18000,plan:{feet:[6000,6000,6000],braces:[]},palW:800,palD:1200,footType:90,w:84,h:72,x:50+(i%10)*90,y:90+Math.floor(i/10)*85,joinGroup:null,sharedFootWith:null,sharedFootSide:null}));
 document.querySelectorAll('nav button').forEach(n=>n.classList.toggle('active',n.dataset.page==='free'));document.getElementById('page').setAttribute('data-rafex-common-active','1');
 const t=performance.now();m2RenderLayout();const js=performance.now()-t;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return {renderJs:js,renderTwoRaf:performance.now()-t,budget:!!window.rafexLayoutBudgetV152};
 },{count,lanes});
 // Fixture engine switching may restore serialized navigation without listeners.
 await page.evaluate(()=>document.querySelectorAll('#rafexLayoutScreenLaunch,#rafexLayoutScreenHeader').forEach(n=>n.remove()));
 await page.waitForTimeout(150);
 await page.locator('#rafexOpenLayoutScreen').evaluate(n=>n.click());
 await page.locator('#m2LayoutSvg').scrollIntoViewIfNeeded({timeout:5000});await page.waitForTimeout(1000);
 const point=await page.evaluate(()=>{const svg=document.getElementById('m2LayoutSvg'),rack=m2LayoutState.racks[0],p=new DOMPoint(rack.x+rack.w/2,rack.y+rack.h/2).matrixTransform(svg.getScreenCTM());return {x:p.x,y:p.y,scale:svg.getScreenCTM().a,hit:document.elementFromPoint(p.x,p.y)?.closest('[data-rack]')?.dataset.rack,rect:svg.getBoundingClientRect().toJSON(),visible:svg.checkVisibility()}});
 if(count===100)await page.screenshot({path:'outputs/drag-audit-visible.png'});
 if(point.hit!=='1000'||!point.visible){console.log(await page.evaluate(p=>document.elementsFromPoint(p.x,p.y).map(n=>({tag:n.tagName,id:n.id,cls:n.getAttribute('class'),pe:getComputedStyle(n).pointerEvents})),point));throw Error('Fixture not hit-testable: '+JSON.stringify(point));}
 const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Performance.enable');
 if(process.argv.includes('--trace'))await cdp.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline.invalidationTracking',transferMode:'ReturnAsStream'});
 if(process.argv.includes('--probe'))await page.evaluate(()=>{
  window.attrWrites={};new MutationObserver(rs=>{for(const r of rs){const n=r.target;if(n.closest?.('#m2LayoutSvg'))continue;const key=n.tagName+'#'+n.id+'['+r.attributeName+']';attrWrites[key]=(attrWrites[key]||0)+1;}}).observe(document.body,{subtree:true,attributes:true});
  window.writes={};const base=Element.prototype.setAttribute;Element.prototype.setAttribute=function(k,v){if(this.getAttribute(k)===String(v)){const key=this.tagName+'#'+this.id+'['+k+'] '+String(v).slice(0,70);const e=writes[key]||{count:0,stack:new Error().stack};e.count++;writes[key]=e;}return base.call(this,k,v)};
 });
 await page.evaluate(()=>{window.audit={frames:[],long:[],running:true};new PerformanceObserver(l=>audit.long.push(...l.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask'});let last=performance.now();const loop=t=>{if(!audit.running)return;audit.frames.push(t-last);last=t;requestAnimationFrame(loop)};requestAnimationFrame(loop)});
 await page.mouse.move(point.x,point.y);await cdp.send('Profiler.start');const before=await cdp.send('Performance.getMetrics');
 const start=Date.now();await page.mouse.down();const downMs=Date.now()-start;
 const drag=await page.evaluate(()=>({id:m2LayoutState.drag?.id,members:m2LayoutState.drag?.groupMembers?.length,selected:m2LayoutState.selected}));
 if(drag.id!==1000)throw Error('Drag did not start: '+JSON.stringify(drag));
 if(process.argv.includes('--verify'))await page.evaluate(async()=>{
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const ids=new Set((m2LayoutState.drag.groupMembers||[{id:m2LayoutState.drag.id}]).map(r=>Number(r.id)));
  window.staticCheck=[...document.querySelectorAll('#m2LayoutSvg [data-rack]')].filter(n=>!ids.has(Number(n.dataset.rack))).map(n=>({node:n,html:n.outerHTML,id:Number(n.dataset.rack),model:JSON.stringify(m2LayoutState.racks.find(r=>Number(r.id)===Number(n.dataset.rack)))}));
  window.shapeCheck=m2LayoutState.racks.map(r=>({id:r.id,x:r.x,y:r.y,w:r.w,h:r.h,joinGroup:r.joinGroup,sharedFootWith:r.sharedFootWith}));
 });
 const moves=[],steps=process.argv.includes('--probe')?10:36;for(let i=1;i<=steps;i++){const t=Date.now();await page.mouse.move(point.x,point.y-40*point.scale*i/steps);moves.push(Date.now()-t)}
 if(process.argv.includes('--verify'))await page.evaluate(()=>{for(const r of staticCheck){if(!r.node.isConnected||r.node.outerHTML!==r.html)throw Error('Static rack DOM changed '+r.id);if(JSON.stringify(m2LayoutState.racks.find(n=>Number(n.id)===r.id))!==r.model)throw Error('Static rack model changed '+r.id);}});
 const release=Date.now();await page.mouse.up();const upMs=Date.now()-release;await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const after=await cdp.send('Performance.getMetrics'),{profile}=await cdp.send('Profiler.stop');
 if(process.argv.includes('--trace')){
  const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');const {stream}=await done;let raw='';for(;;){const chunk=await cdp.send('IO.read',{handle:stream});raw+=chunk.data;if(chunk.eof)break;}await cdp.send('IO.close',{handle:stream});fs.writeFileSync('outputs/drag-trace.json',raw);
  const events=JSON.parse(raw).traceEvents,summary=events.filter(e=>e.name==='UpdateLayoutTree').map(e=>({ms:e.dur/1000,...e.args}));console.log('STYLE',JSON.stringify(summary.slice(0,8)));
 }
 const detail=await page.evaluate(()=>{audit.running=false;return {...audit,rackY:m2LayoutState.racks[0].y,nodes:document.querySelectorAll('#m2LayoutSvg *').length}});
 if(process.argv.includes('--verify')){
  const freezeStart=html.indexOf('function freezePlanPaint(source, copy) {'),freezeEnd=html.indexOf(')(source,source.cloneNode(true))',freezeStart),freeze=html.slice(freezeStart,freezeEnd);
  console.log('VERIFY',await page.evaluate(async({freeze,optimized})=>{
   const check=(ok,msg)=>{if(!ok)throw Error(msg)};
   const svg=document.getElementById('m2LayoutSvg'),copy=(0,eval)('('+freeze+')')(svg,svg.cloneNode(true));
   check(copy.querySelectorAll('[data-rack]').length===m2LayoutState.racks.length,'Export lost racks');
   const typeBefore=svg.querySelector('[data-rack] .rafex-single-line-letter-v58')?.getAttribute('data-signature');check(!!typeBefore,'Letter missing');
   m2UndoLastAction();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   check(m2LayoutState.racks.every((r,i)=>['id','x','y','w','h','joinGroup','sharedFootWith'].every(k=>r[k]===shapeCheck[i][k])),'Undo changed layout topology');
   const rack=m2LayoutState.racks[0],members=rack.joinGroup?m2LayoutState.racks.filter(r=>r.joinGroup===rack.joinGroup):[rack],origins=members.map(r=>({id:r.id,x:r.x,y:r.y}));
   const clamped=m2SmoothGroupTranslation(origins,0,-1000);check(!clamped.exact&&m2GroupTranslationValid(origins,clamped.dx,clamped.dy),'Wall collision bypassed');
   const other=m2LayoutState.racks.find(r=>!members.includes(r)&&r.y>rack.y);if(other)check(!m2GroupTranslationValid(origins,other.x-rack.x,other.y-rack.y),'Rack collision bypassed');
   if(optimized){
    let modal=document.getElementById('m2SectionPlacementModal');if(!modal){modal=document.createElement('section');modal.id='m2SectionPlacementModal';modal.hidden=true;document.body.append(modal);}
    const previous=modal.hidden,probe=document.createElement('div');probe.style.filter='blur(3px)';document.body.append(probe);
    modal.hidden=false;await new Promise(r=>requestAnimationFrame(r));check(document.body.classList.contains('rafex-section-placement-open-v153')&&getComputedStyle(probe).filter==='none','Modal open styling changed');
    modal.hidden=true;await new Promise(r=>requestAnimationFrame(r));check(!document.body.classList.contains('rafex-section-placement-open-v153')&&getComputedStyle(probe).filter==='blur(3px)','Modal close styling changed');
    modal.hidden=previous;probe.remove();
    let runs=0;const job=()=>runs++;m2LayoutState.drag={};window.rafexDragUiV153.defer(job);window.rafexDragUiV153.defer(job);m2LayoutState.drag=null;document.dispatchEvent(new PointerEvent('pointercancel'));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));check(runs===1,'Deferred UI did not recover');
   }
   return {staticRacks:staticCheck.length,export:true,undo:true,wallCollision:true,rackCollision:true,modalState:optimized};
  },{freeze,optimized:process.argv.includes('--optimized')||html.includes('data-drag-isolation="v153"')}));
 }
 if(process.argv.includes('--probe')){const writes=await page.evaluate(()=>Object.entries(writes).sort((a,b)=>b[1].count-a[1].count).slice(0,25));fs.writeFileSync('outputs/repeated-writes.json',JSON.stringify(writes,null,2));console.log('ATTRIBUTES',await page.evaluate(()=>Object.entries(attrWrites).sort((a,b)=>b[1]-a[1]).slice(0,30)));}
 const samples=new Map();profile.samples?.forEach((id,i)=>samples.set(id,(samples.get(id)||0)+(profile.timeDeltas[i]||0)));
 const top=profile.nodes.map(n=>({name:n.callFrame.functionName||'(anonymous)',line:n.callFrame.lineNumber+1,ms:Math.round((samples.get(n.id)||0)/100)/10})).sort((a,b)=>b.ms-a.ms).slice(0,18);
 const metric=Object.fromEntries(after.metrics.filter(x=>['TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration','LayoutCount','RecalcStyleCount'].includes(x.name)).map(x=>[x.name,x.value-(before.metrics.find(b=>b.name===x.name)?.value||0)]));
 const pct=(a,p)=>{const s=a.filter(x=>x>=0).sort((a,b)=>a-b);return Math.round(s[Math.min(s.length-1,Math.floor(s.length*p))]*10)/10};
 const result={count,lanes,...init,point,drag,downMs,upMs,moveP50:pct(moves,.5),moveP95:pct(moves,.95),frameP50:pct(detail.frames,.5),frameP95:pct(detail.frames,.95),frameMax:Math.max(...detail.frames),longTasks:detail.long,rackY:detail.rackY,nodes:detail.nodes,metric,top,errors};
 fs.writeFileSync(`outputs/drag-profile-${count}-${lanes}.json`,JSON.stringify(profile));all.push(result);console.log(JSON.stringify(result));await page.close();
}fs.writeFileSync('outputs/drag-audit-results-'+(process.argv.includes('--optimized')?'v153':'v152')+'.json',JSON.stringify(all,null,2));}finally{await browser.close()}
