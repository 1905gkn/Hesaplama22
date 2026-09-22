import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {detectRacks} from '../client/pdf-rack-detection.mjs';
import {readVectors} from '../client/pdf-vector-reader.mjs';
import {transform} from './patch-pdf-auto-layout-v188.mjs';
for(const file of ['pdf-auto-layout.js','pdf-native-placement.js'])new vm.Script(fs.readFileSync('client/'+file,'utf8'));
const exported=[...fs.readFileSync('client/pdf-native-placement.js','utf8').matchAll(/window\.(\w+)=function/g)].map(m=>m[1]);
assert.equal(exported.length,2);
for(const name of exported)assert(!/(pdf|report|print|a4|output)/i.test(name),'Import must not be intercepted by the existing output-only gate: '+name);
const fixture='<html><body>rafexProjectImportV155<script>const layout = { points: m2LayoutState.points, };</script></body></html>',patched=transform(fixture);assert.equal(transform(patched),patched);
assert.throws(()=>detectRacks({text:[],lines:[]}),/okunamadı/);
// A failed native placement must leave the user's old drawing, catalog and annotations intact.
const context={window:{rafexProjectTypesV133:[],rafexMergeRackCatalog:(_,e)=>({entries:e,aliases:{}}),rafexUnifiedCatalogSync(){}},m2LayoutState:{racks:[{id:7}],points:[]},m2LayoutSymbols:[{id:8}],m2UndoHistory:[],m2UserNotes:[{text:'keep'}],m2DimensionOffsets:{a:1},m2DimensionFontSizes:{},m2HiddenSummaryDimensions:new Set(),m2VisibleRackDimensions:{length:new Set(),depth:new Set()},m2PinnedDimensionsByRack:{},m2FreeMeasure:{points:[]},b2bLayoutDrawing:()=>({totalWidth:2000,railLength:1200}),m2RenderLayout(){},m2UpdateUndoButton(){},m2RackInsideArea:()=>false,m2RackOverlaps:()=>false};
context.m2PushUndo=()=>context.m2UndoHistory.push('undo');context.m2AddRack=()=>context.m2LayoutState.racks.push({w:10,h:6});
vm.createContext(context);vm.runInContext(fs.readFileSync('client/pdf-native-placement.js','utf8'),context);
const spec={key:'test'},entry={id:-1,name:'A',drawing:{pdfSourceSpec:spec}};
assert.throws(()=>context.window.rafexApplyImportedLayoutV188({conflicts:[],placements:[{id:'r',key:'test',row:1,x:1000,y:1000}],warnings:[]},[entry],'test.pdf'),/çakışıyor/);
assert.equal(context.m2LayoutState.racks[0].id,7);assert.equal(context.m2LayoutSymbols[0].id,8);assert.equal(context.m2UserNotes[0].text,'keep');assert.equal(context.window.rafexProjectTypesV133.length,0);assert.equal(context.m2UndoHistory.length,0);
const originalDrawing={tag:'original'},originalForm={tag:'original'};let form=originalForm;
const profileContext={window:{RafexRackTravers:{choices:()=>[{value:'CC125'}],height:()=>125}},document:{getElementById:()=>({})},m2ActiveModule:'b2b',m2LastDrawing:originalDrawing,b2bReadInputState:()=>form,b2bTraverseHeight:()=>form.traverseHeightOverride,b2bLayoutDrawing:d=>({b2bLayout:{sectionWidth:2700,frameDepth:1100}})};
profileContext.b2bApplySavedInputState=s=>{form=s;profileContext.m2LastDrawing={plan:{feet:[]},footProfile:'HR',footCapacity:20000,footLoad:10800,traverseHeight:80,b2b:s};};
vm.createContext(profileContext);vm.runInContext(fs.readFileSync('client/pdf-native-placement.js','utf8'),profileContext);
const generated=profileContext.window.rafexPrepareImportedTypesV188([{name:'Test',key:'one',sectionWidth:2700,frameDepth:1100,footHeight:8000,levels:5,palletCount:3,palletWidth:800,palletDepth:1200,palletHeight:1500,palletWeight:900,firstBeamTop:1730,levelStep:1630}]);
assert.equal(generated[0].drawing.traverseHeight,125,'Generic Mekik height must not leak into B2B');assert.equal(generated[0].drawing.b2b.manualLevelSpecs[0].distance+125,1730);assert.equal(profileContext.m2LastDrawing,originalDrawing);assert.equal(form,originalForm);
if(process.env.RAFEX_PDF_FIXTURE){
  const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
  const task=pdfjs.getDocument({data:new Uint8Array(fs.readFileSync(process.env.RAFEX_PDF_FIXTURE)),isEvalSupported:false}),document=await task.promise;
  try{
    const vector=await readVectors(await document.getPage(1),pdfjs.OPS),result=detectRacks(vector);
    assert.equal(result.types.length,6);assert.equal(result.rows,12);assert.equal(result.placements.length,262);assert.equal(new Set(result.conflicts.flat()).size,4);
    const counts=Object.fromEntries(result.types.map(t=>[t.sectionWidth+'/'+t.footHeight,result.placements.filter(p=>p.key===t.key).length]));
    assert.deepEqual(counts,{'1825/8000':3,'2700/8000':46,'2700/6000':127,'1825/6000':4,'2700/4250':79,'1825/4250':3});
    assert(result.types.every(t=>t.palletWeight===900&&t.frameDepth===1100));
    const moved={...vector,text:vector.text.map(t=>({...t,x:t.x+73,y:t.y+95})),lines:vector.lines.map(l=>({...l,x0:l.x0+73,x1:l.x1+73,y0:l.y0+95,y1:l.y1+95}))};
    assert.deepEqual(detectRacks(moved).placements,result.placements,'Detection must not depend on hardcoded page coordinates');
    const missing={...vector,text:vector.text.filter(t=>t.text!=='WEIGHT (kg)')};assert.throws(()=>detectRacks(missing),/Palet ölçüleri/);
    console.log('PASS: real PDF vectors, 6 computed type specs, 262 bays, 12 rows, 4 conflicted bays, translated drawing, missing-data rejection.');
  }finally{await task.destroy();}
}
console.log('PASS: syntax, idempotent injection, unsupported PDF rejection.');
