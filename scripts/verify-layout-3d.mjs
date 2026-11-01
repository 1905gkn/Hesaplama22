import assert from 'node:assert/strict';
import {layoutSnapshot,rackSystem} from '../client/layout-3d-data.mjs';
import {rackParts} from '../client/layout-3d-geometry.mjs';
import {transform} from './layout-3d-v443.mjs';
export const fixtures=[
 {id:1,typeName:'A',rafexSystem:'b2b',x:40,y:40,w:115.2,h:48,widthMm:2880,depthMm:1200,bays:1,levels:4,palletHeight:1200,sideUprightHeight:4900,footType:90,b2b:{palletCount:3,palletHeight:1200},b2bLayout:{rowCount:1,palletCount:3,palletWidth:800,palletDepth:1200,frameDepth:1100}},
 {id:2,typeName:'A',rafexSystem:'mr',x:220,y:40,w:103.2,h:32,widthMm:2580,depthMm:800,bays:1,levels:4,sideUprightHeight:3700,b2b:{mr:true,modules:1,width:2460,depth:800,firstTraverse:200,levelGap:1000,accessories:[{type:'tray',levels:[1,2,3,4]}]}},
 {id:3,typeName:'A',rafexSystem:'konsol',x:390,y:40,w:185.2,h:56.8,widthMm:4630,depthMm:1420,levels:3,totalRackHeight:4500,konsol:{count:4,spacing:1500,height:4500,arm:1200,baseDepth:1200,side:'single',levels:3,productHeight:300}},
 {id:4,typeName:'A',rafexSystem:'mekik2',x:60,y:230,w:112,h:208,widthMm:2800,depthMm:5200,bays:2,levels:3,sideUprightHeight:4900,palW:1200,palD:800,palletHeight:1200,firstRailHeight:430,levelH:1580,palletPositions:[200,1050,1900,2750,3600,4450],plan:{feet:[1200,1200,1200],braces:[800,800]}},
 {id:5,typeName:'A',rafexSystem:'drive',x:310,y:230,w:112,h:208,widthMm:2800,depthMm:5200,bays:2,levels:3,sideUprightHeight:4900,palW:1200,palD:800,palletHeight:1200,firstRailHeight:430,levelH:1580,palletPositions:[200,1050,1900,2750,3600,4450],plan:{feet:[1200,1200,1200],braces:[800,800]}}
];
const state={scale:.04,points:[{x:0,y:0},{x:650,y:0},{x:650,y:520},{x:0,y:520}],closed:true,pathBreaks:[],racks:fixtures},before=JSON.stringify(state);
const data=layoutSnapshot(state),types=data.racks.map(r=>r.system);
assert.deepEqual(types,['b2b','mr','konsol','mekik2','drive']);assert.equal(rackSystem({b2b:{mr:true},systemType:'fifo'}),'mr');assert.equal(rackSystem({konsol:{},systemType:'fifo'}),'konsol');
const geometry=data.racks.map(rackParts),by=(i,k)=>geometry[i].filter(p=>p.kind===k);
assert.equal(by(0,'load').length,12,'B2B must contain 3 pallets × 4 levels, not the bay count of one');assert.equal(by(0,'timber').length,240,'Each pallet has a distinct timber base');
assert.equal(by(1,'load').length,0,'MR must not invent pallet loads');assert.equal(by(1,'shelf').length,4,'Saved MR trays are on their assigned levels');assert.deepEqual(data.racks[1].floors,[.275,1.35,2.425,3.5]);
assert.equal(by(2,'load').length+by(2,'timber').length,0,'Cantilever must carry long goods, not pallets');assert.equal(by(2,'product').length,12);assert.ok(by(2,'beam').filter(p=>p.d>1).every(p=>p.w<.2),'Cantilever arms must extend in depth, not span the bay');
const double=layoutSnapshot({...state,racks:[{...fixtures[2],depthMm:2620,h:104.8,konsol:{...fixtures[2].konsol,side:'double'}}]}).racks[0];assert.equal(rackParts(double).filter(p=>p.kind==='product').length,24,'Double sided cantilever must have two sets of arms/loads');
assert.equal(by(3,'load').length,30,'Mekik pallets respect the saved positions and depth bound');assert.equal(by(4,'load').length,30);assert.equal(by(3,'rail').length,36);assert.equal(by(4,'rail').length,12);
assert.ok(by(4,'beam').every(p=>p.w<1),'Drive-in entry lanes must not be blocked by full width front beams');assert.ok(by(3,'beam').some(p=>p.w>1),'Mekik transverse supports must be present');
for(const parts of geometry)for(const p of parts){for(const k of ['x','y','z','w','h','d','rx','rz'])assert.ok(Number.isFinite(p[k]));assert.ok(p.w>0&&p.h>0&&p.d>0)}
assert.equal(new Set(geometry.map(p=>JSON.stringify(p))).size,5,'Five systems must have distinct geometry');assert.equal(JSON.stringify(state),before,'Preview must never modify the project');
const rotated=layoutSnapshot({...state,racks:[{...fixtures[0],angle:90}]}).racks[0];assert.equal(rotated.angle,-Math.PI/2);assert.equal(rotated.width,2.88);
const custom=layoutSnapshot({...state,racks:[{...fixtures[0],b2b:{customLevels:[{interval:1700},{interval:1500}]},levels:3}]},()=>({footHeight:4900,frameHeights:[{left:6000,right:4900}]})).racks[0];assert.deepEqual(custom.floors,[0,1.7,3.2]);assert.equal(custom.frameHeights[0].left,6000);
const raised=layoutSnapshot({...state,racks:[fixtures[0]]},()=>({firstPalletPosition:'traverse',firstFloorGap:300,traverseHeight:100,traverseBottoms:[300,1800,3300,4800]})).racks[0];assert.equal(raised.floors[0],.4);assert.ok(Math.abs(raised.floors[1]-1.9)<1e-9);
const html='<html><head></head><body><script>const print="</body>";const t=`<button type="button" id="m2FreeButton">Çiz</button>`;</script></body></html>',result=transform(html);assert.equal(transform(result),result);assert.ok(result.indexOf('/layout-3d.js')>result.indexOf('</script>'));
console.log('PASS all 5 layout systems: B2B pallet count/timber, MR trays without invented pallets, single/double cantilever, Mekik depth rails, open Drive-In entries, custom/raised levels, finite geometry, rotation, immutable project and safe injection.');

for(const index of [0,3,4]){const rack=data.racks[index],parts=rackParts(rack),blocks=parts.filter(p=>p.kind==='timber'&&Math.abs(p.h-.08)<1e-8),loads=parts.filter(p=>p.kind==='load');assert.equal(blocks.length,loads.length*9,'Every pallet has nine corner/center blocks');for(const load of loads){const y=load.y-load.h/2-.16,under=blocks.filter(p=>Math.abs(p.y-y-.065)<1e-6&&Math.abs(p.x-load.x)<rack.palletWidth/2&&Math.abs(p.z-load.z)<rack.palletDepth/2);assert.equal(under.length,9);const half=load.w/.94/2;assert.ok(under.some(p=>Math.abs(p.x-p.w/2-(load.x-half))<1e-6));assert.ok(under.some(p=>Math.abs(p.x+p.w/2-(load.x+half))<1e-6));const hd=load.d/.94/2;assert.ok(under.some(p=>Math.abs(p.z-p.d/2-(load.z-hd))<1e-6));assert.ok(under.some(p=>Math.abs(p.z+p.d/2-(load.z+hd))<1e-6));}}console.log('PASS all pallet systems: nine blocks in left/center/right and front/middle/back, outer blocks flush to all pallet corners.');
