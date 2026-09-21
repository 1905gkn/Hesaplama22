import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {transform} from './patch-layout-pan-v168.mjs';
import {transform as centerTransform} from './patch-barrier-center-v169.mjs';
const source=fs.readFileSync(process.argv[2]||'outputs/live-after-v168.html','utf8'),html=process.argv.includes('--live')?source:centerTransform(transform(source));
assert(html.includes('// layout-pan-v168:'));assert.equal(transform(html),html);
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
const {chromium}=createRequire(import.meta.url)(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1430,height:1114}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{
  const path=new URL(r.request().url()).pathname;
  if(path==='/')return r.fulfill({contentType:'text/html',body:html});
  if(path==='/api/bootstrap')return r.fulfill({json:{needsSetup:false}});
  if(path==='/api/me')return r.fulfill({json:{user:{id:1,fullName:'Test',username:'test',role:'super',allowed_modules:['free','b2b','mekik2','mr','drive','konsol']}}});
  if(path.startsWith('/api/drawing-projects')&&r.request().method()!=='GET')return r.fulfill({json:{project:{...r.request().postDataJSON(),id:1,revision:0,rackTypes:[]}}});
  if(path.startsWith('/api/'))return r.fulfill({json:{rows:[],types:[],projects:[],settings:{}}});
  return r.fulfill({contentType:'application/javascript',body:''});
 });
 await page.goto('https://rafex-configurator.vercel.app');await page.locator('#nav button[data-page="free"]').click();
 await page.locator('#rafexAuthorityProjectName').fill('Pan test');await page.locator('#rafexNewProjectV133').click();
 await page.waitForFunction(()=>!window.rafexProjectSavingV133&&document.querySelector('#rafexProjectNumberV134 span')?.textContent==='1');
 await page.locator('#rafexOpenLayoutScreen').click();await page.locator('#rafexBackToRackTypes').waitFor();
 await page.evaluate(()=>{
  m2LayoutState.points=[{x:0,y:0},{x:1000,y:0},{x:1000,y:650},{x:0,y:650}];m2LayoutState.closed=true;
  const d=m2B2BRecordV108(b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()}));m2AddRack(d,'A');
  const r=m2LayoutState.racks[0];r.x=350;r.y=250;r.freePlacement=false;r.staged=false;r.locked=true;
  m2LayoutState.selected=r.id;m2LayoutState.mode='idle';m2LayoutTool=null;m2AutoFillDraft=null;m2RenderLayout();rafexFitCommonLayoutV126();
 });
 const svg=page.locator('#m2LayoutSvg'),pan=page.locator('#m2PanV168');await svg.scrollIntoViewIfNeeded();
 assert.equal(await pan.evaluate(n=>n.previousElementSibling.id),'m2FocusSelectedRackV126');
 assert.equal(await page.locator('#m2CenterV169').evaluate(n=>n.previousElementSibling.id),'m2PanV168');
 const geometry=()=>page.evaluate(()=>JSON.stringify({points:m2LayoutState.points,racks:m2LayoutState.racks,selected:m2LayoutState.selected}));
 const getView=()=>page.evaluate(()=>rafexCommonLayoutZoomCrispV126.getView());
 const baseline=await geometry(),initial=await getView();
 async function drag(button){const b=await svg.boundingBox();const x=b.x+b.width*.5,y=Math.min(b.y+b.height*.5,950);await page.mouse.move(x,y);await page.mouse.down({button});await page.mouse.move(x+70,y+40,{steps:8});await page.mouse.up({button});await page.waitForTimeout(80)}
 await pan.click();await drag('left');const left=await getView();assert(left.x<initial.x&&left.y<initial.y);assert.equal(await geometry(),baseline);
 await page.keyboard.press('Escape');assert.equal(await pan.getAttribute('aria-pressed'),'false');
 await drag('right');const right=await getView();assert(right.x<left.x&&right.y<left.y);assert.equal(await geometry(),baseline);
 const menu=await svg.evaluate(n=>n.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true})));assert.equal(menu,false);
 await page.evaluate(()=>m2RenderLayout());assert.deepEqual(await getView(),right,'pan survives layout redraw');
 await page.locator('#m2CenterV169').click();assert.deepEqual(await getView(),initial,'center restores whole project');assert.equal(await page.locator('#m2LayoutZoomLabel').textContent(),'100%');
 await page.evaluate(()=>rafexCommonLayoutZoomCrispV126.zoomAt(.5));const zoomed=await getView();await drag('right');assert.equal((await getView()).w,zoomed.w);assert.equal(await geometry(),baseline);
 await pan.click();await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.keyboard.press('Escape');assert.equal(await pan.getAttribute('aria-pressed'),'false');
 await page.locator('#m2LayoutZoomLabel').click();
 const rack=page.locator('#m2LayoutSvg [data-rack] > .m2-layout-rack').first();await rack.scrollIntoViewIfNeeded();
 const rackBox=await rack.boundingBox(),beforeDrag=await getView();
 await page.mouse.move(rackBox.x+rackBox.width/2,rackBox.y+rackBox.height/2);await page.mouse.down();await page.mouse.move(rackBox.x+rackBox.width/2+20,rackBox.y+rackBox.height/2+10,{steps:8});await page.mouse.up();await page.waitForTimeout(120);
 assert.deepEqual(await getView(),beforeDrag,'normal rack drag does not pan');assert.notEqual(await geometry(),baseline,'normal rack drag still changes rack position');
 const barrierChecks=await page.evaluate(()=>{
  const checks=[];
  for(const scale of [.002,.01,.1]){
   const s={id:900,type:'barrier',x:400,y:350,w:2000*scale,h:150*scale,widthMm:2000,depthMm:150,angle:0};
   m2LayoutSymbols=[s];m2RenderLayout();
   const node=document.querySelector('.rafex-barrier-v169'),b=node.getBBox();
   checks.push(b.x>=s.x-.001&&b.y>=s.y-.001&&b.x+b.width<=s.x+s.w+.001&&b.y+b.height<=s.y+s.h+.001);
  }return checks;
 });assert(barrierChecks.every(Boolean),'barrier details remain inside physical footprint at all scales');
 assert.deepEqual(errors,[]);console.log('PASS pan: adjacent button, left-drag mode, right-drag, Escape, context menu suppressed, fit reset, zoom, redraw persistence, project geometry and selection unchanged.');
 await page.screenshot({path:'outputs/layout-pan-v168.png'});
}finally{await browser.close()}
