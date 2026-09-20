import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {transform} from './patch-distance-labels-v154.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
const baseline=fs.readFileSync('outputs/live-v153.html','utf8');
const updated=transform(baseline);
assert.equal(transform(updated),updated);
assert.equal(updated.replace(/<style data-distance-labels="v154">[\s\S]*?<\/style>/,''),baseline);
const live=process.argv.includes('--live');
const html=live?await(await fetch('https://rafex-configurator.vercel.app')).text():updated;
assert.ok(html.includes('data-distance-labels="v154"'));
// Exercise the complete deployed cascade without executing application/network
// code. The patch adds CSS only, so no model or saved project is modified.
const styles=s=>[...s.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)].map(m=>m[0]).join('\n');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const width of [100000,200000]){
  const page=await browser.newPage();
  const fixture=`<div id="page" data-rafex-common-active="1"><svg id="m2LayoutSvg" viewBox="0 0 ${width} 100000" width="1000" height="500">
  <g class="m2-distance-guide"><text class="m2-rack-distance-label m2-dimension-movable" data-dimension-key="gap:1:2">RAF ARASI 1500 mm</text><rect class="m2-measure-hit" width="96" height="20"/></g>
  <g class="rafex-common-pair-gap"><text class="m2-rack-distance-label" data-dimension-key="pair-gap:1:2">RAF ARASI 1500 mm</text></g>
  <g class="m2-wall-guide"><text class="m2-wall-distance-label" data-dimension-key="wall:1:left" transform="rotate(-90)">2500 mm</text></g>
  <text class="m2-rack-distance-label" data-dimension-key="column-gap:1">KOLON ARASI 1500 mm</text>
  <text class="m2-wall-distance-label" data-dimension-key="symbol-gap:1:left">2500 mm</text>
  <text class="m2-rack-distance-label" data-dimension-key="gap:3:4" style="font-size:12px">MANUAL</text>
  <text class="m2-wall-distance-label" data-dimension-key="wall:3:left" style="font-size:12px">MANUAL</text>
  <text class="m2-dim">100000 mm</text><text class="m2-rack-name">A</text></svg></div>`;
  const measure=()=>page.evaluate(()=>[...document.querySelectorAll('svg text')].map(n=>({text:n.textContent,font:parseFloat(getComputedStyle(n).fontSize),stroke:parseFloat(getComputedStyle(n).strokeWidth),transform:n.getAttribute('transform')})));
  await page.setContent(styles(baseline)+fixture);const before=await measure();
  await page.setContent(styles(html)+fixture);const after=await measure();
  for(let i=0;i<after.length;i++){
   assert.equal(after[i].text,before[i].text);assert.equal(after[i].transform,before[i].transform);
   assert.equal(after[i].font,before[i].font*(i<3?.5:1),`font ${width} index ${i}`);
   assert.equal(after[i].stroke,before[i].stroke*(i<3||i===5||i===6?.5:1));
  }
  assert.deepEqual(await page.locator('.m2-measure-hit').evaluate(n=>[n.getAttribute('width'),n.getAttribute('height')]),['96','20']);
  // Recreated live-drag labels receive the same CSS without observers/scanning.
  await page.evaluate(()=>{const g=document.querySelector('.m2-distance-guide');g.innerHTML=g.innerHTML;});
  assert.deepEqual(await measure(),after);
  console.log(JSON.stringify({area:width/1000+'x100',fonts:after.map(n=>n.font),unchangedValues:true,unchangedHitTarget:true}));
  await page.close();
 }
}finally{await browser.close();}
console.log('PASS v154: half-size default distances, unrelated labels/manual overrides unchanged, idempotent CSS-only patch'+(live?' (production)':''));
