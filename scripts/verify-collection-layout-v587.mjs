import assert from 'node:assert/strict';import fs from 'node:fs';
import {layoutSnapshot} from '../client/layout-3d-data.mjs';
import {normalizeCollectionOnlyLayout} from '../client/collection-only-layout-v587.mjs';
import {rackParts} from '../client/layout-3d-geometry.mjs';
const collectionFloors=Array.from({length:18},(_,index)=>({index,bottom:500+index*500})),options={levels:0,collectionFloors,footHeight:10000,palletCount:2,palletWidth:800,palletDepth:1200,palletHeight:1200,rowType:'single'};
const state={scale:.013,points:[],racks:[{id:1,rafexSystem:'b2b',x:0,y:0,w:30,h:15,levels:0,widthMm:1980,depthMm:1200,b2b:{levels:0},b2bLayout:{palletCount:2},plan:{feet:[10000],braces:[]}}]};
const before=JSON.stringify(state),r=layoutSnapshot(state,()=>options).racks[0];assert.equal(r.levels,0);assert.deepEqual(r.floors,[]);assert.deepEqual(r.beamYs,[]);assert.deepEqual(r.palletHeights,[]);assert.equal(JSON.stringify(state),before);assert.equal(r.height,10);
const legacy={...r,levels:4,floors:[9.82,11.13,12.44,13.75],beamYs:[9.7,11.01,12.32,13.63],palletHeights:[1.2,1.2,1.2,1.2]},saved=JSON.stringify(legacy),fixed=normalizeCollectionOnlyLayout(legacy);
assert.equal(JSON.stringify(legacy),saved);assert.equal(fixed.levels,0);assert.equal(fixed.collectionFloors.length,18);assert.equal(rackParts(fixed,{cad:true,nativeAccessories:true,palletInstances:true}).filter(p=>['palletTimber','load'].includes(p.kind)).length,0);
assert.equal(normalizeCollectionOnlyLayout(fixed),fixed);const normal={...legacy,nativeOptions:{...options,levels:4}};assert.equal(normalizeCollectionOnlyLayout(normal),normal);
let actual=null;if(fs.existsSync('local-review/share587.fixture.json')){const payload=JSON.parse(fs.readFileSync('local-review/share587.fixture.json')),area=payload.layout.areas.find(a=>a.name==='TYPE B'),old=area.layout.racks;const count=list=>list.flatMap(r=>rackParts(r,{cad:true,nativeAccessories:true,palletInstances:true})).filter(p=>p.kind==='palletTimber').length;const phantom=count(old),corrected=count(old.map(normalizeCollectionOnlyLayout));assert(phantom>0);assert.equal(corrected,0);actual={racks:old.length,phantomPalletsBefore:phantom,phantomPalletsAfter:corrected};}
console.log(JSON.stringify({pass:true,normalZeroPreserved:true,collectionFloors:18,legacySharesCorrectedWithoutMutation:true,actual}));
