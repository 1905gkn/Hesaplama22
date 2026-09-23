import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {buildAgentRequest,layoutAgent} from './layout-agent-api-v188.mjs';
const input={mode:'automatic',requestId:crypto.randomUUID(),prompt:'A tipinden 3 blok yerleştir',context:{width:30000,depth:20000,aisle:3000,margin:500,existingCount:0,types:[{key:'b2b:1',name:'A',system:'b2b',width:2880,depth:1200}]}};
const body=buildAgentRequest(input);assert.equal(body.reasoning.effort,'low');assert(body.input.includes('b2b:1'));assert((Buffer.byteLength(JSON.stringify(body))+1000)*5+30000<=95000);
const req=()=>new Request('https://test.local/api/layout-agent',{method:'POST',headers:{origin:'https://test.local'},body:JSON.stringify(input)});
const cfg={env:{OPENAI_API_KEY:'test'},now:()=>Date.parse('2026-09-23'),proxyApi:async()=>Response.json({ok:true,requestId:input.requestId,reservedUsd:.1})};
for(const [key,expected]of [['b2b:1',200],['invented',502]]){const response=await layoutAgent(req(),{...cfg,fetchImpl:async()=>Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({action:'layout',reason:'Öneri',items:[{typeKey:key,count:3,angle:0}]})}]}]})});assert.equal(response.status,expected);}
const {chromium}=createRequire(import.meta.url)(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));let calls=0;
 await page.route('**/*',r=>{if(r.request().url().endsWith('/api/layout-agent')){calls++;return r.fulfill({json:{plan:{action:'layout',reason:'3 blok önerisi',items:[{typeKey:'b2b:1',count:3,angle:0}]}}});}return r.fulfill({contentType:'text/html',body:'<button id="rafexAutoLayoutButton" onclick="document.querySelector(\'dialog\').showModal()">Otomatik yerleşim</button><dialog id="rafexPdfAutoDialog"><header><h2>PDF</h2></header><p role="status">PDF seç</p><button data-apply>PDF uygula</button></dialog>'});});
 await page.goto('https://test.local');
 await page.evaluate(()=>{
  window.rafexProjectIdentityV133={uuid:'project'};window.rafexProjectTypesV133=[{id:1,name:'A',__rafexSystem:'b2b',drawing:{totalWidth:2880,railLength:1200,plan:{feet:[],braces:[]}}}];window.m2LayoutState={scale:.01,closed:true,points:[{x:0,y:0},{x:300,y:0},{x:300,y:200},{x:0,y:200}],racks:[]};window.m2LayoutSymbols=[];window.undos=0;
  window.m2TypeColor=()=> '#abc';window.m2RackBounds=r=>{const w=r.angle===90?r.h:r.w,h=r.angle===90?r.w:r.h,cx=r.x+r.w/2,cy=r.y+r.h/2;return {left:cx-w/2,right:cx+w/2,top:cy-h/2,bottom:cy+h/2};};window.m2RackInsideArea=r=>{const b=m2RackBounds(r);return b.left>=0&&b.top>=0&&b.right<=300&&b.bottom<=200;};window.m2RackOverlaps=()=>false;window.m2PushUndo=()=>undos++;window.m2RenderLayout=window.m2RenderLayoutProductList=window.m2RefreshActiveReport=()=>{};
 });
 await page.addScriptTag({content:fs.readFileSync('client/automatic-agent.js','utf8')});await page.locator('#rafexAutoLayoutButton').click();
 await page.locator('#rafexAgentV188').waitFor();assert(await page.locator('#rafexPdfAutoDialog #rafexAgentV188').isVisible());assert.equal(await page.locator('[data-rack-agent]').count(),0);
 await page.locator('textarea').fill(input.prompt);await page.locator('[data-agent-ask]').click();await page.locator('[data-agent-preview] svg').waitFor();assert.equal(calls,1);assert.equal(await page.evaluate(()=>m2LayoutState.racks.length),0);
 await page.locator('[data-agent-apply]').click();assert.equal(await page.evaluate(()=>m2LayoutState.racks.length),3);assert.equal(await page.evaluate(()=>undos),1);
 await page.locator('[data-agent-ask]').click();await page.locator('[data-agent-preview] svg').waitFor();await page.locator('[data-agent-cancel]').click();assert.equal(await page.evaluate(()=>m2LayoutState.racks.length),3);
 await page.locator('[data-agent-ask]').click();await page.locator('[data-agent-preview] svg').waitFor();await page.evaluate(()=>m2LayoutState.scale=.02);await page.locator('[data-agent-apply]').click();assert.equal(await page.evaluate(()=>m2LayoutState.racks.length),3);assert((await page.locator('[data-agent-status]').textContent()).includes('Proje değişti'));
 const packing=await page.evaluate(()=>{
  m2LayoutState.scale=.01;m2LayoutState.racks=[];const types=rafexAutomaticAgent.catalog(),c={types,scale:.01,bounds:{left:0,right:300,top:0,bottom:200},aisle:3000,margin:500};
  const rotated=rafexAutomaticAgent.pack({items:[{typeKey:types[0].key,count:4,angle:90}]},c);
  let fails=false;try{rafexAutomaticAgent.pack({items:[{typeKey:types[0].key,count:500,angle:0}]},c);}catch{fails=true;}
  return {rotated:rotated.racks.length,angle:rotated.racks[0].angle,fails,unchanged:m2LayoutState.racks.length};
 });assert.deepEqual(packing,{rotated:4,angle:90,fails:true,unchanged:0});
 assert.deepEqual(errors,[]);console.log('PASS: automatic schema, unknown-type rejection, modal containment, preview without mutation, apply once, cancel, stale project rejection, rotation and over-capacity.');
}finally{await browser.close();}
