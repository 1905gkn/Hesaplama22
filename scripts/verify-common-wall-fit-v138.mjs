import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {transform as session} from './patch-screen-session-v136.mjs';
import {transform as controls} from './patch-common-konsol-controls-v137.mjs';
import {transform} from './patch-common-wall-fit-v138.mjs';
import {transform as zoomHeader} from './patch-common-zoom-header-v139.mjs';
const source=fs.readFileSync(process.argv[2]||'.perf-production.html','utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
const html=zoomHeader(transform(controls(session(match?Buffer.from(match[2],'base64').toString():source))));
assert.equal(zoomHeader(html),html);
assert.equal(transform(html),html);
for(const s of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc=|type=["'](?:module|application\/)/.test(s[1]))new vm.Script(s[2]);
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],writes=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{
  const r=route.request(),u=new URL(r.url());if(r.method()!=='GET')writes.push(u.pathname);
  if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:html});
  if(u.pathname==='/api/bootstrap')return route.fulfill({json:{needsSetup:false}});
  if(u.pathname==='/api/me')return route.fulfill({json:{user:{id:1,full_name:'Test',role:'super',allowed_modules:['free','b2b','mekik2','mr','konsol','drive']}}});
  if(u.pathname.startsWith('/api/'))return route.fulfill({json:{rows:[],types:[],rackTypes:[],projects:[],settings:{},todos:[],users:[],notifications:[]}});
  return route.fulfill({contentType:'application/javascript',body:''});
 });
 await page.goto('https://rafex.test/');await page.waitForTimeout(2500);
 await page.locator('#nav [data-page="free"]').click();await page.waitForTimeout(600);
 await page.locator('#rafexAuthorityProjectName').fill('Wall fit regression');await page.locator('#rafexNewProjectV133').click();await page.waitForTimeout(400);
 const header=await page.evaluate(()=>{const a=document.querySelector('.top-actions'),h=a.closest('.top');return{gap:h.getBoundingClientRect().right-a.getBoundingClientRect().right,padding:parseFloat(getComputedStyle(h).paddingRight)};});
 assert(Math.abs(header.gap-header.padding)<2,'common header actions align to right padding');
 for(const [w,h] of [[100000,100000],[200000,200000],[50000,30000],[200000,100000]]){
  await page.locator('#m2AreaW').fill(String(w));await page.locator('#m2AreaH').fill(String(h));
  await page.getByRole('button',{name:'Alanı Belirle',exact:true}).click();await page.waitForTimeout(400);
  const baseline=await page.evaluate(()=>JSON.stringify({points:m2LayoutState.points,scale:m2LayoutState.scale,racks:m2LayoutState.racks}));
  const result=await page.evaluate(()=>{const s=m2LayoutState,p=s.points,v=rafexCommonLayoutZoomCrispV126.getView(),svg=document.getElementById('m2LayoutSvg'),r=svg.getBoundingClientRect(),box={w:Math.max(...p.map(a=>a.x))-Math.min(...p.map(a=>a.x)),h:Math.max(...p.map(a=>a.y))-Math.min(...p.map(a=>a.y))};const point=m2SvgPoint({clientX:r.left+r.width*.35,clientY:r.top+r.height*.65});return{v,box,ratio:r.width/r.height,point,physical:[box.w/s.scale,box.h/s.scale]};});
  assert.equal(result.physical[0],w);assert.equal(result.physical[1],h);
  assert(result.box.w/result.v.w>.87);assert(result.box.h/result.v.h>.83);
  assert(await page.evaluate(()=>{const s=document.getElementById('m2LayoutSvg').getBoundingClientRect();return [...document.querySelectorAll('#m2LayoutSvg .m2-area-dimension')].every(e=>{const r=e.getBoundingClientRect();return r.left>=s.left&&r.right<=s.right&&r.top>=s.top&&r.bottom<=s.bottom;});}),'wall dimensions remain inside the fitted canvas');
  assert(Math.abs(result.ratio-result.v.w/result.v.h)<.002,'no physical aspect distortion');
  assert(Math.abs(result.point.x-(result.v.x+result.v.w*.35))<.001);assert(Math.abs(result.point.y-(result.v.y+result.v.h*.65))<.001);
  await page.evaluate(()=>{m2ZoomLayout(.2);m2ZoomLayout(0,true);});await page.waitForTimeout(150);
  assert.equal(await page.evaluate(()=>JSON.stringify({points:m2LayoutState.points,scale:m2LayoutState.scale,racks:m2LayoutState.racks})),baseline,'fit/zoom cannot change project geometry');
  console.log('FIT',w,h,result);
  await page.getByRole('button',{name:'Yerleşimi uzaklaştır',exact:true}).click();await page.waitForTimeout(250);
  const out=await page.evaluate(()=>({v:rafexCommonLayoutZoomCrispV126.getView(),label:document.getElementById('m2LayoutZoomLabel').textContent}));
  assert.equal(out.label,'78%');assert(Math.abs(out.v.w-result.v.w*1.28)<.001);
  assert(Math.abs(out.v.x+out.v.w/2-result.v.x-result.v.w/2)<.001,'zoom out stays centered');
  await page.evaluate(()=>{for(let i=0;i<20;i++)m2ZoomLayout(-.2);m2RenderLayout();});await page.waitForTimeout(300);
  assert.equal(await page.locator('#m2LayoutZoomLabel').textContent(),'25%');
  await page.locator('#m2LayoutZoomLabel').click();await page.waitForTimeout(150);
  assert.deepEqual(await page.evaluate(()=>rafexCommonLayoutZoomCrispV126.getView()),result.v,'percentage button restores fitted view');
  assert.equal(await page.evaluate(()=>JSON.stringify({points:m2LayoutState.points,scale:m2LayoutState.scale,racks:m2LayoutState.racks})),baseline);
 }
 const rackId=await page.evaluate(()=>{drawMekik2();const d=b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()});m2AddRack(d,'A');const r=m2LayoutState.racks[0];r.staged=false;r.freePlacement=false;m2LayoutState.selected=r.id;m2LayoutState.mode='idle';m2LayoutTool=null;m2AutoFillDraft=null;m2RenderLayout();return r.id;});
 await page.getByRole('button',{name:'Yerleşimi uzaklaştır',exact:true}).click();
 await page.waitForTimeout(250);
 const rack=page.locator('#m2LayoutSvg [data-rack="'+rackId+'"] > .m2-layout-rack');await rack.scrollIntoViewIfNeeded();
 const box=await rack.boundingBox(),before=await page.evaluate(()=>({x:m2LayoutState.racks[0].x,y:m2LayoutState.racks[0].y,view:rafexCommonLayoutZoomCrispV126.getView(),height:document.getElementById('m2LayoutSvg').getBoundingClientRect().height}));
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y+box.height/2+10,{steps:6});await page.mouse.up();await page.waitForTimeout(250);
 const after=await page.evaluate(()=>({x:m2LayoutState.racks[0].x,y:m2LayoutState.racks[0].y}));
 assert(Math.abs(after.x-before.x)<.1);assert(Math.abs(after.y-before.y-10*before.view.h/before.height)<1,'real pointer drag tracks fitted SVG coordinates');
 console.log('FITTED POINTER',before,after);
 // Replaced SVG hosts must retain fitted bounds after switching engines.
 await page.locator('input[name="rafexUnifiedSystem"][value="mekik2"]').evaluate(e=>e.click());await page.waitForTimeout(1400);
 assert.notEqual(await page.locator('#m2LayoutSvg').getAttribute('viewBox'),'0 0 1000 650');
 await page.locator('#nav [data-page="b2b"]').click();await page.waitForTimeout(1000);
 assert.equal(await page.locator('#m2LayoutSvg').getAttribute('viewBox'),'0 0 1000 650','standalone remains unchanged');
 await page.locator('#nav [data-page="free"]').click();await page.waitForTimeout(1200);
 assert.notEqual(await page.locator('#m2LayoutSvg').getAttribute('viewBox'),'0 0 1000 650');
 await page.locator('#m2LayoutSvg').scrollIntoViewIfNeeded();await page.screenshot({path:'.wall-fit-v138.png'});
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 for(const width of [900,390,1440]){
  await page.setViewportSize({width,height:1000});await page.waitForTimeout(200);
  const h=await page.evaluate(()=>{const a=document.querySelector('.top-actions'),t=a.closest('.top');return{gap:t.getBoundingClientRect().right-a.getBoundingClientRect().right,padding:parseFloat(getComputedStyle(t).paddingRight)};});
  assert(Math.abs(h.gap-h.padding)<2,'header remains right aligned at '+width+'px');
 }
 console.log('PASS v138: wall fill, scale, pointer mapping, zoom and navigation preserved');
 console.log('PASS v139: existing percentage zoom below 100, reset, drag and responsive right header');
}finally{await browser.close();}
