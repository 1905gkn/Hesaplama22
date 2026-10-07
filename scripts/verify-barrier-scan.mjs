import assert from 'node:assert/strict';
import {barrierFrameSlots,barrierWorldPoint,barrierScanSlots,barrierPlacement} from '../client/barrier-scan.js';
const rack=(overrides={})=>({id:1,x:0,y:0,w:288,h:120,widthMm:2880,depthMm:1200,footType:90,angle:0,b2bLayout:{frameDepth:1100,palletOverhang:50,palletDepth:1200,rowCount:1,rowGap:200,sectionWidth:2700},...overrides});
const single=rack(),a=barrierFrameSlots(single,.1);
assert.equal(a[0].lengthMm,1100);
const double=rack({id:2,h:240,depthMm:2400,b2bLayout:{...single.b2bLayout,rowCount:2}});
assert.equal(barrierFrameSlots(double,.1)[0].lengthMm,2400);
const zero=rack({b2bLayout:{...single.b2bLayout,rowCount:2,rowGap:0}});
assert.equal(barrierFrameSlots(zero,.1)[0].lengthMm,2200);
for(const angle of [0,90,180,270,35])for(const side of [-1,1]){
 const slot=barrierFrameSlots(rack({angle}),.1)[0],barrier=barrierPlacement(slot,side);
 assert.equal(barrier.angle,angle+90);assert.equal(barrier.widthMm,1100);
 const gap=Math.abs(barrier.localX-slot.localX)/slot.sx-slot.profileWidthMm/2-barrier.depthMm/2;
 assert(Math.abs(gap-100)<1e-8);
 const world=barrierWorldPoint(slot,barrier.localX,barrier.localY);
 assert(Math.abs(world.x-barrier.x-barrier.w/2)<1e-8);
 assert.equal(barrier.blocking,false,'Attached protection must allow tunnel placement');
}
assert.equal(barrierScanSlots([single],{left:-1,right:10,top:40,bottom:70},.1).length,1,'Scan through the frame middle');
assert.equal(barrierScanSlots([single],{left:80,right:160,top:30,bottom:80},.1).length,0,'No feet in selected bay');
const neighbour=rack({id:3,x:279});
assert.equal(barrierScanSlots([single,neighbour],{left:275,right:288,top:0,bottom:120},.1).length,1,'Shared physical frame deduplicated');
assert.equal(barrierScanSlots([single,double],{left:-10,right:600,top:-10,bottom:500},.1).length,4);
console.log('PASS: 1100/2400/zero-gap lengths, 100 mm clearances, five rotations, middle scans, empty scans, shared frame deduplication and tunnel placement.');
