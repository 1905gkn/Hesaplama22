import assert from 'node:assert/strict';
import {barrierScanSlots,barrierPlacement,barrierFrameSlots,barrierWorldPoint} from '../client/barrier-scan.js';
const base={id:1,x:0,y:0,w:288,h:120,widthMm:2880,depthMm:1200,footType:90,b2bLayout:{frameDepth:1100,palletOverhang:50,rowCount:1,sectionWidth:2700}};
for(const angle of [0,90,180,270,35]){
 const rack={...base,angle},rect={left:-200,right:400,top:-150,bottom:400};
 const selected=barrierScanSlots([rack],rect,.1),slot=selected[0];assert(slot);
 const expected=1100;
 assert(Math.abs(slot.lengthMm-expected)<1e-7);
 for(const side of [-1,1]){
  const barrier=barrierPlacement(slot,side);assert.equal(barrier.widthMm,slot.lengthMm);
  assert(Math.abs(Math.abs(barrier.localX-slot.localX)/slot.sx-slot.profileWidthMm/2-barrier.depthMm/2-100)<1e-7);
  const saved=JSON.parse(JSON.stringify(barrier));const moved={...rack,x:25,y:35};
  const fresh=barrierFrameSlots(moved,.1).find(s=>s.edge===saved.barrierScan.edge);
  const restored=barrierPlacement(fresh,side);assert.equal(restored.widthMm,barrier.widthMm);assert(Math.abs(restored.x-barrier.x-25)<1e-7);assert(Math.abs(restored.y-barrier.y-35)<1e-7);
  const end1=barrierWorldPoint(slot,slot.localX,slot.localY-slot.lengthMm*slot.sy/2),end2=barrierWorldPoint(slot,slot.localX,slot.localY+slot.lengthMm*slot.sy/2);
  if(angle===0){assert.equal(end1.y,5);assert.equal(end2.y,115);}
 }
}
const short=barrierScanSlots([base],{left:-1,right:10,top:40,bottom:70},.1)[0];assert.equal(short.lengthMm,1100);
const legacy=barrierPlacement(barrierFrameSlots(base,.1)[0],1);assert.equal(legacy.widthMm,1100);assert(!legacy.barrierScan.selectionSpan);
console.log('PASS rack frame bounds determine full barrier span; short selections, five rotations, 100mm clearance, save/reopen and movement preserve exact length; legacy barriers unchanged.');

const double={...base,id:2,x:340,h:240,depthMm:2400,b2bLayout:{...base.b2bLayout,rowCount:2,rowGap:200}};
assert.deepEqual(barrierScanSlots([base,double],{left:-10,right:650,top:-100,bottom:500},.1).map(s=>s.lengthMm),[1100,1100,2400,2400]);
