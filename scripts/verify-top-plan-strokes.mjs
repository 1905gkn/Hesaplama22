import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const scope={};vm.createContext(scope);
vm.runInContext(fs.readFileSync(new URL('../client/top-plan-import.js',import.meta.url),'utf8'),scope);
const api=scope.RafexTopPlan;
for(const text of ['3300/1100','3300 × 1100 mm','3300x1100','３３００／１１００','٣٣٠٠/١١٠٠','۳۳۰۰/۱۱۰۰']){
  const d=api.dimensionLabel(text);assert.equal(d.w,3300);assert.equal(d.d,1100);
}
assert.equal(api.dimensionLabel('Plan 01/07/2026'),null);
function fixture({rotate=false,color='231,91,18',scale=1,missing=false}={}){
  const labels=[],segments=[];
  const pt=(x,y)=>rotate?{x:y*scale+40,y:x*scale+70}:{x:x*scale+40,y:y*scale+70};
  for(let i=0;i<4;i++){
    const left=i*40,center=pt(left+16.5,5.5);
    labels.push({...center,cx:center.x,cy:center.y,spanAxis:rotate?'y':'x',nominalW:3300,nominalD:1100,label:''});
    for(const [x,y,x2,y2] of [[left,0,left+33,0],[left,11,left+33,11],[left,0,left,11],...(!missing||i!==3?[[left+33,0,left+33,11]]:[])])segments.push({a:pt(x,y),b:pt(x2,y2),color});
  }
  return {rects:[],labels,segments};
}
const region={x:0,y:0,w:1000,h:1000};
for(const rotate of [false,true])for(const color of ['231,91,18','0,0,0'])for(const scale of [1,2,4]){
  const g=fixture({rotate,color,scale}),r=api.detectVectors(g,region);
  assert.equal(r.length,4);assert.equal(r.unmatchedLabels,0);
  assert(r.every(b=>b.nominalW===3300&&b.nominalD===1100));
  g.segments.push(...g.segments);assert.equal(api.detectVectors(g,region).length,4,'Duplicate strokes must not duplicate bays');
}
const incomplete=api.detectVectors(fixture({missing:true}),region);
assert.equal(incomplete.length,3);assert.equal(incomplete.unmatchedLabels,1,'Do not fabricate a missing side');
assert.equal(api.detectVectors({...fixture(),segments:[]},region),null,'Labels alone are insufficient');
assert.equal(api.detectVectors(fixture({color:'255,255,255'}),region),null,'White strokes are not visible outlines');
assert.equal(api.detectVectors(fixture(),{x:45,y:70,w:30,h:15}).length,1,'Crop includes one measured bay');
assert.equal(api.detectVectors(fixture(),{x:900,y:900,w:10,h:10}),null,'Empty vector crop must allow raster fallback');
console.log('PASS: dimension formats, Arabic/full-width digits, separate strokes, monochrome, rotation, scale, missing sides, duplicates and cropped rescans.');
const file=process.argv[2];
if(file){
  // Use the very same PDF.js distribution loaded by the production wizard.
  const lib=await import('../assets/pdfjs/pdf.min.mjs');
  lib.GlobalWorkerOptions.workerSrc=new URL('../assets/pdfjs/pdf.worker.min.mjs',import.meta.url).href;
  const task=lib.getDocument({data:new Uint8Array(fs.readFileSync(file)),isEvalSupported:false});
  try{
    const document=await task.promise,page=await document.getPage(1),viewport=page.getViewport({scale:2});
    const text=await page.getTextContent(),list=await page.getOperatorList();
    const geometry=api.pdfGeometry(list,lib.OPS,viewport,text.items);
    const result=api.detectVectors(geometry,{x:0,y:0,w:viewport.width,h:viewport.height});
    assert.equal(result.length,266);assert.equal(result.unmatchedLabels,0);
    const counts={};for(const r of result){counts[r.nominalW]=(counts[r.nominalW]||0)+1;assert.equal(r.nominalD,1100);assert(r.w<60&&r.h<20,'Warehouse outlines must not become bays');}
    assert.deepEqual(counts,{1850:2,2400:10,3300:254});
    const first=result[0],crop={x:first.cx-first.w*.4,y:first.cy-first.h*.4,w:first.w*.8,h:first.h*.8};
    assert.equal(api.detectVectors(geometry,crop).length,1);
    // Changing label notation must preserve all detected geometry.
    for(const separator of ['x','×']){
      const translated=text.items.map(t=>({...t,str:t.str.replace(/(\d{3,5})\/(\d{3,5})/g,'$1'+separator+'$2')}));
      const alternate=api.detectVectors(api.pdfGeometry(list,lib.OPS,viewport,translated),{x:0,y:0,w:viewport.width,h:viewport.height});
      assert.equal(alternate.length,266);
    }
    console.log('PASS: real PDF through production PDF.js and wizard detector: 266 bays, 254/10/2 widths, no unmatched labels, partial rescan and equivalent label notations.');
  }finally{await task.destroy();}
}
