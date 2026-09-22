import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
const patch=fs.readFileSync('scripts/patch-common-drawing-precise-wall-hit-v66.mjs','utf8');
const css=patch.match(/<style data-rafex-precise-wall-hit="v66">[\s\S]*?<\/style>/)[0];
const baseline=fs.readFileSync('outputs/live-after-v170.html','utf8');
const styles=[...baseline.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)].map(m=>m[0]).join('\n');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();
 for(const mode of ['', 'm2-dimension-editing']){
  await page.setContent(css+styles+`<div id="page"><svg id="m2LayoutSvg" class="${mode}" width="600" height="300" viewBox="0 0 600 300">
  <rect id="rack" x="0" y="0" width="600" height="300" fill="orange" ondblclick="window.blockOpened++"/>
  <g class="m2-distance-guide rafex-common-pair-gap" data-rack-gap="1500">
  <line x1="20" y1="100" x2="400" y2="100" stroke="green"/><circle cx="20" cy="100" r="4"/>
  <rect class="m2-measure-hit" data-dimension-key="gap:1:2" x="170" y="70" width="160" height="50" onpointerdown="window.gapOpened++"/>
  <text class="m2-rack-distance-label m2-dimension-movable" data-dimension-key="gap:1:2" x="250" y="94" text-anchor="middle" style="font-size:14px" onpointerdown="window.gapOpened++;event.stopPropagation()">1500 mm</text></g></svg></div>`);
  await page.evaluate(()=>{window.blockOpened=0;window.gapOpened=0;});
  assert.equal(await page.locator('.m2-measure-hit').evaluate(n=>getComputedStyle(n).pointerEvents),'none');
  const rack=await page.locator('#rack').boundingBox();
  await page.mouse.dblclick(rack.x+180,rack.y+105);
  assert.deepEqual(await page.evaluate(()=>[window.blockOpened,window.gapOpened]),[1,0]);
  await page.locator('text').click();
  assert.equal(await page.evaluate(()=>window.gapOpened),1);
 }
 console.log('PASS: gap text remains clickable; transparent box passes double-click to rack in normal and dimension modes.');
}finally{await browser.close();}
