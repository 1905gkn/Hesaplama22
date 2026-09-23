import assert from 'node:assert/strict';import fs from 'node:fs';
import {detectDimensionedPlan} from '../client/pdf-dimensioned-reader.mjs';import {groupRackPlan} from '../client/pdf-rack-detection.mjs';
assert.equal(detectDimensionedPlan({text:[],lines:[]}),null);
if(process.env.RAFEX_DIMENSIONED_FIXTURE){
 const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs'),{readVectors}=await import('../client/pdf-vector-reader.mjs');const task=pdfjs.getDocument({data:new Uint8Array(fs.readFileSync(process.env.RAFEX_DIMENSIONED_FIXTURE)),isEvalSupported:false});
 try{
  const d=await task.promise,v=await readVectors(await d.getPage(1),pdfjs.OPS),plan=detectDimensionedPlan(v);
  assert.equal(plan.capacity,5488);assert.equal(plan.rows,12);assert.equal(plan.placements.length,266);assert.equal(plan.doubleRowGap,200);assert.deepEqual(plan.types.map(t=>t.sectionWidth).sort((a,b)=>a-b),[1850,2400,3300]);
  for(const t of plan.types){assert.equal(t.footHeight,10006);assert.deepEqual(t.palletHeights,[1300,1300,1300,1300,1300,1300,1700]);assert.deepEqual(t.levelPitches,[1550,1550,1550,1550,1550]);}
  assert.equal(groupRackPlan(plan).blocks.length,156);
  assert.deepEqual(plan.aisles.map(a=>a.frameGap),[3378,3378,3378,3378.33,3378,3378]);
  assert(plan.aisles.every(a=>a.measured));
  for(const a of plan.aisles){const before=plan.placements.find(p=>p.row===a.fromRow),after=plan.placements.find(p=>p.row===a.toRow);assert(Math.abs(after.x-before.x-(before.width+after.width)/2-a.frameGap)<.001);}
  for(const unit of ['mm','мм','毫米','مم','ミリ','밀리','मिमी']){
   const translated={...v,text:v.text.map(t=>({...t,text:t.text.includes('(mm)')?'寸法 ('+unit+')':/^(DETAIL|VUE|DIMENSIONS)/.test(t.text)?'अन्य शीर्षक عنوان':t.text}))};
   assert.deepEqual(detectDimensionedPlan(translated).placements,plan.placements,'Captions must not drive geometry: '+unit);
  }
  const arabic={...v,text:v.text.map(t=>({...t,text:t.text.replace(/\d/g,c=>String.fromCharCode(1632+Number(c))).replace('Kg','كغ')}))};assert.equal(detectDimensionedPlan(arabic).capacity,5488);
  const shifted={...v,text:v.text.map(t=>({...t,x:t.x+45,y:t.y+70})),lines:v.lines.map(l=>({...l,x0:l.x0+45,x1:l.x1+45,y0:l.y0+70,y1:l.y1+70}))};const moved=detectDimensionedPlan(shifted);assert.equal(moved.capacity,5488);assert.equal(moved.placements.length,266);
  const missing={...v,text:v.text.filter(t=>!/^800 Kg$/.test(t.text))};assert.throws(()=>detectDimensionedPlan(missing),/yükü/);
  const dropped={...v,text:v.text.filter((t,i)=>i!==v.text.findIndex(t=>t.text==='3300/1100'))};assert.throws(()=>detectDimensionedPlan(dropped),/kapasitesi/);
  console.log('PASS real dimensioned PDF, mixed heights, custom widths, seven unit scripts, Arabic digits, translation, missing loads and capacity mismatch.');
 }finally{await task.destroy();}
}
