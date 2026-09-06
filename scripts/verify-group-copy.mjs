import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('scripts/patch-common-drawing-group-duplicate-v64.mjs','utf8');
const runtime=source.slice(source.indexOf('const runtime =')).match(/<script data-rafex-common-group-duplicate="v64">([\s\S]*?)<\/script>/)[1];
function run(multi=[]){
  const racks=[{id:1,x:10,y:10,w:20,h:10,joinGroup:'row',sharedFootWith:null},{id:2,x:30,y:10,w:20,h:10,joinGroup:'row',sharedFootWith:1},{id:3,x:200,y:10,w:20,h:10,joinGroup:null}];
  const ctx={m2LayoutState:{racks,selected:1},m2LayoutSymbols:[{id:4,rackId:2,x:30,y:10}],m2MultiSelect:{rackIds:new Set(multi),symbolIds:new Set()},m2SelectedSymbolId:null,m2DuplicateRack(){throw Error('Unexpected single-rack fallback')},m2RackBounds:r=>({left:r.x,right:r.x+r.w,top:r.y,bottom:r.y+r.h}),m2RackInsideArea:()=>true,m2RackOverlaps:()=>false,m2PushUndo(){},m2RenderLayout(){},m2RefreshActiveReport(){},m2SyncAttachedProtections(){},$:()=>({classList:{remove(){}},textContent:''})};
  ctx.window=ctx;vm.runInNewContext(runtime,ctx);ctx.m2DuplicateRack();
  assert.equal(racks.length,5);const copies=racks.slice(3);
  assert.equal(copies[1].sharedFootWith,copies[0].id);assert.equal(copies[0].joinGroup,copies[1].joinGroup);assert.notEqual(copies[0].joinGroup,'row');
  assert.equal(copies[1].x-copies[0].x,20);assert.equal(ctx.m2MultiSelect.rackIds.size,2);
  assert.equal(ctx.m2LayoutSymbols[1].rackId,copies[1].id);
  ctx.m2DuplicateRack();assert.equal(racks.length,7);assert.equal(new Set(racks.map(r=>r.id)).size,7);
}
run();run([1]);run([1,2]);
console.log('PASS: single click, partial selection and full selection copy the complete joined row; links, protection attachments and unique IDs preserved.');
