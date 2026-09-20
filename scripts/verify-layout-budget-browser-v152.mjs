import {createRequire} from 'node:module';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {transform} from './patch-layout-budget-v152.mjs';
import {splitRuntimeAssets} from './split-runtime-assets-v152.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
const raw=process.argv[2]?fs.readFileSync(process.argv[2],'utf8'):await(await fetch('https://rafex-configurator.vercel.app/')).text();
fs.mkdirSync('outputs',{recursive:true});fs.writeFileSync('outputs/layout-budget-baseline.html',raw);
console.log(execFileSync(process.execPath,['scripts/verify-layout-budget-v152.mjs','outputs/layout-budget-baseline.html'],{encoding:'utf8'}));
const optimized=transform(raw),split=splitRuntimeAssets(optimized);
const freezeStart=optimized.indexOf('function freezePlanPaint(source, copy) {');
const freezeEnd=optimized.indexOf(')(source,source.cloneNode(true))',freezeStart);
assert(freezeStart>=0&&freezeEnd>freezeStart);
const freeze=optimized.slice(freezeStart,freezeEnd);
const browser=await chromium.launch({channel:'msedge',headless:true});
const snapshots=[];
try{
for(const variant of ['baseline','optimized']){
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const p=new URL(r.request().url()).pathname;
  if(p==='/')return r.fulfill({contentType:'text/html',body:variant==='baseline'?raw:split.html});
  if(split.assets.has(p))return r.fulfill({contentType:'application/javascript',body:split.assets.get(p)});
  if(p==='/api/bootstrap')return r.fulfill({json:{needsSetup:false}});
  if(p==='/api/me')return r.fulfill({json:{user:{id:1,fullName:'Audit',username:'audit',role:'super',defaultLanguage:'tr'}}});
  if(p.startsWith('/api/'))return r.fulfill({json:{rows:[],types:[],rackTypes:[],projects:[],settings:{}}});
  return r.fulfill({contentType:'application/javascript',body:''});
 });
 await page.goto('https://rafex.test/');await page.waitForTimeout(800);
 const snapshot=await page.evaluate(async({variant,freeze})=>{
  const check=(ok,msg)=>{if(!ok)throw Error(msg)};
  renderB2B();m2ActiveModule='b2b';drawMekik2();m2AddRack(b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()}),'A');
  const fixture=structuredClone(m2LayoutState.racks[0]);
  m2LayoutState.scale=.0044;m2LayoutState.points=[{x:0,y:0},{x:1000,y:0},{x:1000,y:650},{x:0,y:650}];m2LayoutState.closed=true;
  m2LayoutState.racks=Array.from({length:8},(_,i)=>({...structuredClone(fixture),id:1000+i,x:20+i*100,y:100,staged:false,angle:i===7?90:0,typeName:String.fromCharCode(65+i),w:84,h:72,joinGroup:null,sharedFootWith:null,...(i%3?{b2b:undefined,b2bLayout:undefined,layoutView:null,rackDetail:null,rafexSystem:i%3===1?'drive':'mekik2',systemType:'fifo',bays:20,depth:14,widthMm:21000,depthMm:18000,plan:{feet:[6000,6000,6000],braces:[]},palW:800,palD:1200,footType:90}:{})}));
  m2LayoutState.selected=null;
  document.querySelectorAll('nav button').forEach(n=>n.classList.toggle('active',n.dataset.page==='free'));document.getElementById('page').setAttribute('data-rafex-common-active','1');
  m2RenderLayout();await new Promise(r=>setTimeout(r,1000));
  const svg=document.getElementById('m2LayoutSvg'),group=()=>svg.querySelector('[data-rack="1001"]');
  const nodes=svg.querySelectorAll('[data-rack] *').length,markup=Array.from(svg.querySelectorAll('[data-rack]')).map(n=>n.outerHTML);
  const saved=m2LayoutState.racks.map(r=>JSON.stringify(r));
  const old=group();m2RenderLayout();check(group()===old,'Unchanged rack DOM was replaced');
  check(group().querySelector('.rafex-single-line-system-v58').textContent==='Drive-In','Drive-In subtitle missing');
  check(svg.querySelector('[data-rack="1002"] .rafex-single-line-system-v58').textContent==='Mekik','Mekik subtitle missing');
  const originalScale=window.rafexCommonTypeLetterScaleV65;
  window.rafexCommonTypeLetterScaleV65=()=>.1;window.rafexCommonSingleLineLetterV58.decorate();
  const small=Number(group().querySelector('.rafex-single-line-system-v58').getAttribute('font-size'));
  window.rafexCommonTypeLetterScaleV65=()=>1;window.rafexCommonSingleLineLetterV58.decorate();
  check(Math.abs(Number(group().querySelector('.rafex-single-line-system-v58').getAttribute('font-size'))/small-10)<.001,'10% subtitle scaling failed');
  window.rafexCommonTypeLetterScaleV65=originalScale;window.rafexCommonSingleLineLetterV58.decorate();
  if(variant==='optimized'){
   svg.setAttribute('viewBox','0 0 200 200');window.rafexLayoutBudgetV152.update();
   check(svg.querySelectorAll('.rafex-offscreen-v152').length>0,'Offscreen culling did not run');
   check(getComputedStyle(svg.querySelector('.rafex-offscreen-v152')).visibility==='hidden','Offscreen paint was not skipped');
   check(!group().classList.contains('rafex-offscreen-v152'),'Visible rack was culled');
   check(svg.querySelectorAll('[data-rack] *').length===nodes,'Zoom removed physical details');
   const hidden=svg.querySelectorAll('.rafex-offscreen-v152').length;
   const copy=(0,eval)('('+freeze+')')(svg,svg.cloneNode(true));
   check(copy.querySelectorAll('.rafex-offscreen-v152').length===0,'Export retained culling');
   check([...copy.querySelectorAll('[data-rack]')].every(n=>n.style.visibility!=='hidden'),'Export rack invisible');
   check(svg.querySelectorAll('.rafex-offscreen-v152').length===hidden,'Export did not restore viewport');
   m2LayoutState.drag={id:1000};window.rafexLayoutBudgetV152.update();check(!svg.querySelector('.rafex-offscreen-v152'),'Drag must reveal all details');m2LayoutState.drag=null;
   svg.setAttribute('viewBox','0 0 1000 650');window.rafexLayoutBudgetV152.update();check(!svg.querySelector('.rafex-offscreen-v152'),'Zoom out did not restore racks');
  }
  check(m2LayoutState.racks.every((r,i)=>JSON.stringify(r)===saved[i]),'Performance code mutated rack model');
  return {nodes,markup};
 },{variant,freeze});
 assert.deepEqual(errors,[]);snapshots.push(snapshot);console.log(variant+' PASS: retained DOM, subtitles, 10% scale, model preservation'+(variant==='optimized'?', culling, drag, complete export':''));await page.close();
}
assert.deepEqual(snapshots[1],snapshots[0],'Geometry/labels differ from production');
console.log('PASS: baseline and optimized full-detail SVG markup identical; extracted scripts load without errors.');
}finally{await browser.close()}
