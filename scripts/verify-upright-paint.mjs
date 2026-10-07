import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:900,height:460}});
 const runtime=fs.readFileSync('client/upright-paint.js','utf8');
 const shapes=Array.from({length:12},(_,i)=>`<g transform="translate(${40+i*65+.27*(i%3)} 30) rotate(${i%2?90:0} 15 50)"><rect x="0" y="0" width="1.17" height="100" class="m2-b2b-plan-upright rafex-ral5010-upright" style="stroke:none!important;fill:#00679d!important"/><rect x="28" y="0" width="1.17" height="100" class="m2-b2b-plan-upright"/></g>`).join('');
 await page.setContent(`<html><body><h3>RAL 5010 — different positions and rotations</h3><svg id="m2LayoutSvg" width="850" height="180" viewBox="0 0 850 180">${shapes}</svg><div id="m2CorporatePreview"><svg width="850" height="180">${shapes}</svg></div><script>${runtime}</script></body></html>`);
 const result=await page.locator('.m2-b2b-plan-upright').evaluateAll(nodes=>nodes.map(n=>({fill:getComputedStyle(n).fill,stroke:getComputedStyle(n).stroke,effect:getComputedStyle(n).vectorEffect,width:n.getAttribute('width'),blue:n.classList.contains('rafex-ral5010-upright')})));
 for(const row of result){assert.equal(row.fill,row.blue?'rgb(0, 103, 157)':'rgb(174, 184, 189)');assert.equal(row.stroke,row.fill);assert.equal(row.effect,'non-scaling-stroke');assert.equal(row.width,'1.17');}
 await page.screenshot({path:'../outputs/upright-color-fix/verified.png'});
 console.log('PASS: RAL5010/PGV, rotated profiles, preview and unchanged physical geometry ('+result.length+' uprights).');
}finally{await browser.close();}
