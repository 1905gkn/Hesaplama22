import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {planDetail,renderPlan} from './plan-detail-v143.mjs';
import {readDetail,sealDetail} from './rack-detail-snapshot-v135.mjs';
const drawing={bays:7,depth:10,levels:4,palW:1000,palD:1200,footType:90,totalWidth:8770,railLength:12600,systemType:'fifo',firstPalletGap:200,palletGap:50,palletPositions:Array.from({length:10},(_,i)=>200+i*1250),plan:{feet:[1000,1000,1000,1000,1000,1000,600],braces:[1000,1000,1000,1000,1000,1000]},topVBraceBays:[2],hasExtra:true};
const model=planDetail(drawing),sealed=sealDetail(drawing,{top:model,mekik2:drawing});
const placed=JSON.parse(JSON.stringify(sealed));placed.widthMm=placed.totalWidth;placed.depthMm=placed.railLength;delete placed.totalWidth;delete placed.railLength;
assert.deepEqual(readDetail(placed,'top'),model,'placing a saved type must retain the top snapshot');
const reference=renderPlan(model);
for(const size of [50000,100000]){
  const scale=530/size,rendered=renderPlan(readDetail(placed,'top'),{x:20,y:30,scale});
  assert.equal(rendered.replace(`translate(20 30) scale(${scale})`,'translate(0 0) scale(1)'),reference,'only the outer scale may change');
  assert.equal((rendered.match(/class="rafex-plan-pallet-v143"/g)||[]).length,70);
  assert.equal((rendered.match(/class="rafex-plan-foot-v143"/g)||[]).length,64);
}
assert.equal(model.positions[1],1450,'saved pallet gaps must be used');
placed.topVBraceBays=[3];assert.equal(readDetail(placed,'top'),null,'changed top bracing must invalidate saved geometry');
assert(!renderPlan({...model,showPallets:false}).includes('class="rafex-plan-pallet-v143"'));
const source=fs.readFileSync(process.argv[2]||'dist/server/index.js','utf8'),html=Buffer.from(source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/)[1],'base64').toString();
for(const s of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(s[1].trim()&&!/type="(?:module|application\/json)"/.test(s[0]))new vm.Script(s[1]);
assert(html.includes('window.rafexRenderPlanV143(window.rafexPlanDetailV143(m2LastDrawing)'));
assert(html.includes("window.rafexReadRackDetailV135?.(rack,'top')||window.rafexPlanDetailV143(rack)"));
assert(!html.includes('const ayakWidth = Math.max(4, Math.min(14, partH * 146 / 1062))'));
assert(html.includes('views.top=window.rafexPlanDetailV143(clean)'));
console.log('PASS v143: saved top geometry, 50/100m proportions, positions, visibility, braces and complete runtime syntax.');
