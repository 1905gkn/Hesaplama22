import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const source=fs.readFileSync('scripts/patch-free-konsol-plan-v38.mjs','utf8');
const start=source.indexOf('  const node=(name,attrs={})=>'),end=source.indexOf('  function process(){',start);
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();
 await page.setContent('<svg><g id="rack"><rect class="m2-layout-rack" x="10" y="20" width="60" height="24.4"/><text x="900" y="900">Huge old label</text></g></svg>');
 const result=await page.evaluate(code=>{
  const run=new Function('group','rack','const NS="http://www.w3.org/2000/svg",countOf=()=>2,sideOf=()=>"single";'+code+';drawPlan(group,rack);');
  const group=document.getElementById('rack'),hit=group.querySelector('.m2-layout-rack');
  run(group,{x:10,y:20,w:60,h:24.4});
  const footprint=group.querySelector('.rafex-konsol-plan-footprint rect');
  return{sameHit:group.querySelector('.m2-layout-rack')===hit,pointer:getComputedStyle(hit).pointerEvents,w:Number(footprint.getAttribute('width')),h:Number(footprint.getAttribute('height'))};
 },source.slice(start,end));
 assert.deepEqual(result,{sameHit:true,pointer:'all',w:60,h:24.4});
 console.log('PASS: 3000 x 1220 mm proportions preserved despite oversized old text; original drag hit surface retained.');
}finally{await browser.close();}
