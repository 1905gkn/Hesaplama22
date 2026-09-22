import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
import {manualOptions,physicalLevels} from './b2b-level-plan-v121.mjs';
const context={window:{}};vm.createContext(context);
const source=fs.readFileSync('client/rack-travers-selection.js','utf8').replace('__RACK_NORMAL__',fs.readFileSync('client/travers-table.json','utf8')).replace('__RACK_COLLECTION__',fs.readFileSync('client/mini-rack-table.json','utf8'));
vm.runInContext(source,context);const api=context.window.RafexRackTravers;
for(const [width,pallets] of [[2700,3],[1825,2]]){
 const choice=api.choices('normal',width,pallets*800).find(c=>api.height(c.value)===100);assert(choice,'Reference beam height must have a suitable load-table profile');
 const rows=[2030,2150,2150,2150,0].map(distance=>({distance,palletHeight:1900,traverseType:choice.value}));
 const o=manualOptions({levels:5,firstPalletPosition:'ground',palletHeight:1900},rows),floors=physicalLevels(o);
 assert.deepEqual(floors.map(f=>f.bottom),[2030,4180,6330,8480]);assert.deepEqual(floors.map(f=>f.bottom+f.beam),[2130,4280,6430,8580]);
 assert.equal(floors.at(-1).bottom+100+1900,10480);assert.equal(floors.filter(f=>f.bottom>=4180).length,3);
}
if(process.env.RAFEX_PLAN_IMAGE){
 const {createCanvas,loadImage}=await import('@napi-rs/canvas');const {detectRasterGeometry,rasterPlan}=await import('../client/pdf-raster-reader.mjs');
 const image=await loadImage(process.env.RAFEX_PLAN_IMAGE),c=createCanvas(image.width,image.height),ctx=c.getContext('2d');ctx.drawImage(image,0,0);
 const g=detectRasterGeometry(ctx.getImageData(0,0,image.width,image.height));
 const p=rasterPlan(g,{sectionWidth:2700,frameDepth:1100,footHeight:9500,levels:5,palletCount:3,palletWidth:800,palletDepth:1200,palletHeight:1900,palletWeight:800,firstBeamTop:2130,clearOpening:2050,doubleRowGap:300,tunnelHeight:4180,beamHeight:100});
 assert.equal(p.placements.length,508);assert.equal(p.placements.filter(b=>p.types.find(t=>t.key===b.key).palletCount===2).length,26);assert.equal(p.placements.filter(b=>b.tunnelHeight).length,32);
 console.log('PASS reference plan: 508 bays, 26 two-pallet bays, 32 tunnel bays.');
}
console.log('PASS reference section: load-rated 100 mm beams, 2030/4180/6330/8480 undersides, 10480 loaded height and three tunnel levels.');
