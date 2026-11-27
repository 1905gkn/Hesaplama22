import fs from'node:fs';import assert from'node:assert/strict';import vm from'node:vm';import {deepLevelModel598,deepTraverseCatalog598}from'../client/deep-levels-v598.mjs';import {mekikStepped}from'../client/mekik-stepped.mjs';import {driveStepped}from'../client/drive-stepped.mjs';import {layoutSnapshot}from'../client/layout-3d-data.mjs';import {rackParts}from'../client/layout-3d-geometry.mjs';import {palletRowsV395}from'./report-final-pallet-v393.mjs';import {transform}from'./deep-levels-v598.mjs';
const base={id:1,rafexSystem:'mekik2',systemType:'fifo',bays:2,levels:3,depth:5,palW:1200,palD:800,palletWeight:1000,palletHeight:1200,firstRailHeight:430,railHeight:170,railLength:4350,totalWidth:3000,footType:100,levelH:1630,plan:{feet:[1100,1100,550],braces:[800,800]},palletPositions:[0,1000,1850,2700,3550],x:0,y:0,w:3000,h:4350};const specs=[{palletHeight:1000,palletWeight:600},{palletHeight:1600,palletWeight:1200},{palletHeight:800,palletWeight:900}];
for(const system of ['mekik2','drive']){const key=system==='drive'?'driveCustomizationV521':'mekikCustomizationV514',r={...base,rafexSystem:system,systemType:system==='drive'?'drive':'fifo',[key]:{heightMode:'auto',levelSpecs:specs}},model=system==='drive'?driveStepped(r):mekikStepped(r);assert.deepEqual(model.errors,[]);assert.deepEqual(model.floors.map(f=>f.y),(system==='drive'?[430,1860,3890]:[430,1860,3880]));assert.deepEqual(model.floors.map(f=>f.palletHeight),[1000,1600,800]);assert(model.rows.filter(r=>r.name==='Travers').every(r=>/ST(37|52)/.test(r.spec)));assert.equal(model.height%50,0);const snap=layoutSnapshot({scale:1,racks:[r]}).racks[0];assert.deepEqual(snap.floors,(system==='drive'?[.43,1.86,3.89]:[.43,1.86,3.88]));assert.deepEqual(snap.palletHeights,[1,1.6,.8]);const loads=rackParts(snap,{cad:true}).filter(p=>p.kind==='load');assert(loads.some(p=>Math.abs(p.h-1.44)<.001));assert.deepEqual((system==='drive'?driveStepped:mekikStepped)(JSON.parse(JSON.stringify(r))),model);assert.equal(palletRowsV395([{name:'A',drawing:r}]).length,3);const m=deepLevelModel598(r,specs);assert.equal(m.totalPalletLoad,13500);assert.equal(deepLevelModel598({...r,footLoadStart:'first'},specs).totalPalletLoad,10500);assert(m.floors.every(f=>f.capacity>=f.load));assert.equal(deepLevelModel598(r,[{...specs[0],selectionMode:'manual',traverseType:'ST52|50×70×1,5'},...specs.slice(1)]).floors[0].traverseType,'ST52|50×70×1,5');assert(deepLevelModel598(r,[{palletWeight:10000},...specs.slice(1)]).errors.length);assert(deepLevelModel598(r,[specs[0],{...specs[1],height:500},specs[2]]).errors.some(e=>e.includes('çakışıyor')));}
for(const railHeight of [150,170]){
 const r={...base,railHeight,levels:2};
 const specs=height=>[{}, {selectionMode:'manual',traverseType:'ST52|50×'+height+'×1,5'}];
 const low=deepLevelModel598(r,specs(50)),high=deepLevelModel598(r,specs(70));
 assert.equal(high.floors[1].y-low.floors[1].y,20);
 assert.equal(low.floors[1].y-low.floors[0].y-1200-150,260);
 const fixed=deepLevelModel598(r,[{}, {...specs(70)[1],height:low.floors[1].y}]);
 assert.equal(fixed.floors[1].y,low.floors[1].y,'Explicit support elevations remain fixed');
}
if(fs.existsSync('dist/index.html')){const h=fs.readFileSync('dist/index.html','utf8');assert(h.includes('data-deep-levels="v598"'));assert.equal(transform(h),h);for(const m of h.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);}
console.log('PASS both deep systems: distinct level heights/weights/types, catalogue limits, manual capacity guard, collisions, 50mm uprights, 3D snapshot, BOM, pallet report and JSON roundtrip.');

const groundRack={...base,id:2,rafexSystem:'drive',systemType:'drive',firstRailHeight:1600,driveCustomizationV521:{groundPallet:true,groundPalletHeight:900,levelSpecs:[{palletHeight:1050}]}};
const groundModel=driveStepped(JSON.parse(JSON.stringify(groundRack)));
assert.equal(groundModel.groundPallet.height,900);
assert.equal(groundModel.floors[0].palletHeight,1050);
assert.equal(groundModel.capacity,driveStepped({...groundRack,driveCustomizationV521:{...groundRack.driveCustomizationV521,groundPallet:false}}).capacity+1);
const raised=driveStepped({...groundRack,firstRailHeight:1000});
assert.equal(raised.groundPallet.height,900);
assert.equal(raised.floors[0].y,1180);
const groundSnap=layoutSnapshot({scale:1,racks:[groundRack]}).racks[0];
const groundParts=rackParts(groundSnap,{cad:true,palletInstances:true});
assert.equal(groundParts.filter(p=>p.kind==='palletTimber'&&p.y===0).length,1);
assert.equal(groundParts.filter(p=>p.kind==='load').length,rackParts({...groundSnap,driveStepped:{...groundSnap.driveStepped,groundPallet:null}},{cad:true,palletInstances:true}).filter(p=>p.kind==='load').length+1);
assert.equal(rackParts({...groundSnap,showPallets:false},{cad:true,palletInstances:true}).filter(p=>p.kind==='palletTimber').length,0);
console.log('PASS one optional Drive-In floor pallet, existing pallet height, clearance, visibility toggle and saved data.');
