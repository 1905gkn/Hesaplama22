import assert from 'node:assert/strict';
import vm from 'node:vm';
import {planScannedJoin,installScannedJoin,transform,sharedRows,sharedRow,rowAxis} from './patch-scan-join-v235.mjs';
const rack=(id,x,y,rows=1)=>({id,x,y,w:294,h:rows===1?120:250,angle:0,b2bLayout:{rowCount:rows,frameDepth:1100,palletDepth:1200,palletOverhang:50,rowGap:200},footProfile:'HR90',b2b:{},locked:true});
for(const angle of [0,90,180,270])for(const pair of [[1,2],[2,1],[1,1],[2,2]]){
 const target={...rack(1,400,300,pair[0]),angle},moving={...rack(2,900,600,pair[1]),angle},before=JSON.stringify(target);
 const {planned:[p]}=planScannedJoin(target,[moving],.1,120),rad=angle*Math.PI/180,dx=p.x+p.w/2-target.x-target.w/2,dy=p.y+p.h/2-target.y-target.h/2;
 assert(Math.abs(Math.abs(dx*Math.cos(rad)+dy*Math.sin(rad))-282)<1e-8);
 assert(Math.abs(Math.abs(-dx*Math.sin(rad)+dy*Math.cos(rad))-Math.abs(target.h-moving.h)/2)<1e-8);
 assert.equal(JSON.stringify(target),before);assert.equal(p.sharedFootWith,1);
}
function context(blocked=false){
 const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',classList:{add(){},remove(){}},setAttribute(){}});return nodes.get(id);};
 const c={document:{getElementById:get,addEventListener(){}},m2LayoutState:{racks:[rack(1,0,0),rack(2,500,300,2),rack(3,900,500)],scale:.1},m2MultiSelect:{rackIds:new Set(),symbolIds:new Set()},m2JoinMode:false,m2JoinFirstRackId:null,m2ClearMultiSelection(){c.m2MultiSelect.active=false;},m2ClearAllSelections(){},m2RenderLayout(){},m2CommitMultiSelection(){},m2ToggleJoinMode(){},m2ChooseJoinRack(){},m2JoinedRackMembers(r){return [r]},m2RackBounds(r){return {cx:r.x+r.w/2,cy:r.y+r.h/2}},m2B2BFootWidth(){return 120},m2RackInsideArea(){return true},m2RackOverlapsExcept(){return blocked},undo:0,m2PushUndo(){c.undo++},planScannedJoin};
 vm.createContext(c);vm.runInContext('('+installScannedJoin.toString()+')()',c);return {c,get};
}
for(const blocked of [false,true]){
 const {c,get}=context(blocked),before=JSON.stringify(c.m2LayoutState.racks);c.m2ToggleJoinMode();assert(c.m2JoinMode);c.m2ChooseJoinRack(1);assert(c.m2MultiSelect.active);
 c.m2MultiSelect.start={x:400,y:200};c.m2MultiSelect.hover={x:1400,y:900};c.m2CommitMultiSelection();
 if(blocked){assert.equal(JSON.stringify(c.m2LayoutState.racks),before);assert.equal(c.undo,0);assert(c.m2JoinMode);}else{assert.equal(c.undo,1);assert.equal(c.m2LayoutState.racks[0].x,0);assert.equal(c.m2LayoutState.racks[1].sharedFootWith,1);assert.equal(c.m2LayoutState.racks[2].sharedFootWith,2);assert(!c.m2JoinMode);}
}
assert.equal(transform(transform('<body>if (rack.sharedFootSide !== side)</body>')),transform('<body>if (rack.sharedFootSide !== side)</body>'));
console.log('PASS target-first scan joining: single/double both directions, rotations, chain, one undo, collision rollback and injection');

const one=rack(1,0,0),two={...rack(2,282,0,2),sharedFootWith:1};assert.equal(sharedRows(two,[one,two]),1);assert(sharedRow(two,0,[one,two]));assert(!sharedRow(two,1,[one,two]));
const bomSource='<body>if (rack.sharedFootSide !== side) rack.sharedFootWith?rowCount:0; rack.sharedFootWith?rows:0; item.sharedFootWith ? (Number(item.b2bLayout.rowCount) || 1) : 0; rack&&rack.id,rackSystem(rack),</body>';
const patched=transform(bomSource);assert(!patched.includes('sharedFootWith?'));assert(patched.includes('rack&&rack.id,rack&&rack.sharedFootWith,rackSystem(rack)'));
const third={...rack(3,564,0),sharedFootWith:2};assert.equal([one,two,third].reduce((sum,r)=>sum+2*r.b2bLayout.rowCount-sharedRows(r,[one,two,third]),0),6);
// Extend an existing double-single chain from either side. All new doubles
// must remain on the original double's side, irrespective of their old Y.
for(const lower of [false,true])for(const oldY of [-900,900]){
 const double=rack(10,0,0,2),single={...rack(11,282,lower?130:0),sharedFootWith:10};
 const incoming=[rack(12,700,oldY,2),rack(13,1000,-oldY),rack(14,1400,oldY,2)];
 const result=planScannedJoin(single,incoming,.1,120,[double,single]).planned;
 for(const r of result){const index=lower?(r.b2bLayout.rowCount-1):0;assert(Math.abs(rowAxis(r,index)-rowAxis(single,0))<1e-8);if(r.b2bLayout.rowCount===2)assert(Math.abs(r.y-double.y)<1e-8);}
}
console.log('PASS repeated double-single-double joining keeps frame, beam and pallet row aligned on both edges');
