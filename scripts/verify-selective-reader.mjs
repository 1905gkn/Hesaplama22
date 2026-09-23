import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {inspectSelectivePlan,selectivePlan} from '../client/pdf-selective-reader.mjs';
import {groupRackPlan} from '../client/pdf-rack-detection.mjs';
import {readVectors} from '../client/pdf-vector-reader.mjs';
assert.equal(inspectSelectivePlan({text:[],lines:[]}),null);
if(!process.env.RAFEX_SELECTIVE_FIXTURE)throw Error('Set RAFEX_SELECTIVE_FIXTURE to the private source PDF (never commit it).');
const pdfjs=await import(process.env.RAFEX_PDFJS_PATH?pathToFileURL(process.env.RAFEX_PDFJS_PATH).href:'pdfjs-dist/legacy/build/pdf.mjs');
const task=pdfjs.getDocument({data:new Uint8Array(fs.readFileSync(process.env.RAFEX_SELECTIVE_FIXTURE)),isEvalSupported:false});
try{
 const doc=await task.promise,v=await readVectors(await doc.getPage(1),pdfjs.OPS),audit=inspectSelectivePlan(v);
 assert.equal(audit.bays.length,2688);assert.equal(audit.capacity,47268);
 assert.deepEqual(Object.fromEntries(audit.quantities.map(q=>[q.name,q.detected])),{B:90,A:2474,A1:118,B1:6});
 assert(audit.quantities.every(q=>q.declared===q.detected));
 const plan=selectivePlan(audit,{levels:8,groundHeightFactor:2});
 assert.equal(plan.capacity,42016);
 assert.equal(plan.placements.length,2688);
 for(const type of plan.types){
  assert.equal(type.levels,8);
  assert.deepEqual(type.palletHeights,[2200,1100,1100,1100,1100,1100,1100,1100]);
  assert.equal(type.levelPitches.length,6);
  assert(type.firstBeamTop-type.sourceBeamHeight>=2200);
  assert(type.firstBeamTop+6*type.levelPitch<=type.footHeight);
 }
 assert.throws(()=>selectivePlan(audit,{levels:0,groundHeightFactor:2}),/onaylanmalı/);
 const grouped=groupRackPlan(plan);
 assert.equal(grouped.blocks.flatMap(b=>b.sourceIds).length,2688);
 assert.equal(new Set(grouped.blocks.flatMap(b=>b.sourceIds)).size,2688);
 assert(grouped.importTypes.every(t=>t.levels===8&&t.palletHeights[0]===2200));
 const shifted={...v,text:v.text.map(t=>({...t,x:t.x+45,y:t.y+70})),lines:v.lines.map(l=>({...l,x0:l.x0+45,x1:l.x1+45,y0:l.y0+70,y1:l.y1+70}))};
 assert.deepEqual(inspectSelectivePlan(shifted).quantities,audit.quantities);
 const broken={...v,text:v.text.filter(t=>t.text!=='ZONE-6-TY-B1')};assert.throws(()=>inspectSelectivePlan(broken),/sayımı eşleşmiyor/);
 const unlabelled={...v,text:v.text.filter(t=>t.text!=='A'&&t.text!=='A1')};assert.throws(()=>inspectSelectivePlan(unlabelled),/doğrulanamadı/);
 console.log('PASS: real PDF 2688 vector bays, all four type counts match schedule, capacity 47268, translated coordinates, missing schedule and missing labels fail closed.');
}finally{await task.destroy();}
