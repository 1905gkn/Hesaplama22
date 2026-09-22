import assert from 'node:assert/strict';
import fs from 'node:fs';
import {detectRasterGeometry,rasterPlan,ocrSuggestions} from '../client/pdf-raster-reader.mjs';
import {groupRackPlan} from '../client/pdf-rack-detection.mjs';
const width=900,height=600,data=new Uint8ClampedArray(width*height*4).fill(255);
function pixel(x,y,r,g,b){const i=(y*width+x)*4;data.set([r,g,b,255],i);}
// Repeated rasterized colored frames; the long line below is not a rack row.
for(const y of [40,100,160,220]){
  for(const rail of [y,y+14])for(let x=40;x<=840;x++)pixel(x,rail,180,40,20);
  for(let x=40;x<=840;x+=40)for(let yy=y;yy<=y+14;yy++)pixel(x,yy,30,30,30);
}
for(let x=0;x<width;x++)pixel(x,400,180,40,20);
const geometry=detectRasterGeometry({data,width,height});assert.equal(geometry.rows.length,4);assert.equal(geometry.count,80);
assert.throws(()=>detectRasterGeometry({data:new Uint8ClampedArray(width*height*4).fill(255),width,height}),/seçilemedi/);
assert.equal(ocrSuggestions('Max load: 800Kg').palletWeight,800);assert.equal(ocrSuggestions('TOTAL: 8609 pp').palletWeight,null);
assert.equal(ocrSuggestions('PALLET HEIGHT (mm): 1900').palletHeight,1900);
const dims={sectionWidth:2700,frameDepth:1100,footHeight:9500,levels:5,palletCount:3,palletWidth:800,palletDepth:1200,palletHeight:1900,palletWeight:800,firstBeamTop:2200,clearOpening:2050,doubleRowGap:300,tunnelHeight:4200};
assert.throws(()=>rasterPlan(geometry,{...dims,palletWeight:0}),/geçersiz/);
assert.throws(()=>rasterPlan(geometry,{...dims,clearOpening:1800}),/uyumsuz/);
assert.throws(()=>rasterPlan(geometry,{...dims,sectionWidth:3000}),/uyuşmuyor/);
assert.throws(()=>rasterPlan(geometry,{...dims,doubleRowGap:undefined}),/geçersiz/);
const full=rasterPlan(geometry,dims);assert.equal(full.orientation,'horizontal');assert.equal(full.placements.length,80);assert.equal(full.types[0].palletHeight,1900);
geometry.rows[0].bays[0].omit=true;assert.equal(rasterPlan(geometry,dims).placements.length,79);
if(process.env.RAFEX_RASTER_FIXTURE){
  const {createCanvas,loadImage}=await import('@napi-rs/canvas'),image=await loadImage(process.env.RAFEX_RASTER_FIXTURE),canvas=createCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
  const g=detectRasterGeometry(ctx.getImageData(0,0,image.width,image.height));assert.equal(g.rows.length,10);assert(g.count>400&&g.count<550);assert(g.rows.flatMap(r=>r.bays).some(b=>b.braced));assert.equal(g.rows.flatMap(r=>r.bays).filter(b=>b.tunnel).length,32);const grouped=groupRackPlan(rasterPlan(g,dims));assert.deepEqual([...new Set(grouped.importTypes.map(t=>t.palletCount))].sort(),[2,3]);for(const count of [2,3]){const doubles=grouped.importTypes.filter(t=>t.rowType==='double'&&t.palletCount===count);assert.equal(doubles.length,1);assert.equal(doubles[0].rowGap,300);}assert(grouped.blocks.some(b=>grouped.importTypes.find(t=>t.key===b.key).palletCount===2));console.log('PASS narrow 1825 mm two-pallet bays and standard 2700 mm three-pallet bays stay distinct.');console.log('PASS same raster racks share one double-row type despite pixel gap differences.');console.log('PASS raster fixture: 10 rows, '+g.count+' candidates; no filename or image-coordinate rules.');
  const {createWorker}=await import('tesseract.js'),worker=await createWorker('eng',1,{langPath:'node_modules/@tesseract.js-data/eng/4.0.0',cachePath:'outputs'});
  try{await worker.setParameters({tessedit_pageseg_mode:'11'});const {data}=await worker.recognize(process.env.RAFEX_RASTER_FIXTURE);assert.equal(ocrSuggestions(data.text).palletWeight,800);console.log('PASS OCR fixture: 800 kg load read from image.');}finally{await worker.terminate();}
}
for(const path of ['dist/ocr/tesseract.esm.min.js','dist/ocr/worker.min.js','dist/ocr/lang/eng.traineddata.gz','dist/ocr/core/tesseract-core-lstm.wasm.js'])assert(fs.existsSync(path),'Missing deployed OCR asset: '+path);
console.log('PASS raster geometry, unrelated line rejection, missing dimensions, load OCR, omission controls and local assets.');
