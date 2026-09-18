import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('free-selection-core-v145.js',import.meta.url),'utf8'),context);
const c=context.RafexSelectionCoreV145;
const rack=(id,x,system='b2b')=>({id,x,y:10,w:100,h:50,angle:id*90,rafexSystem:system,rafexCatalogKey:system+':A',typeName:'A',levels:4,b2b:system==='b2b'?{levels:4,accessories:[],customLevels:[]}:undefined,joinGroup:'group',sharedFootWith:id===1?null:1});
for(const system of ['b2b','mr','drive','mekik2','konsol']){
  const list=[rack(1,0,system),rack(2,100,system),rack(3,200,system)];
  const before=c.clone(list);
  list[0].levels=6;list[0].w=120;list[0].plan={feet:[1000,1500]};
  if(list[0].b2b)list[0].b2b.accessories=[{type:'tray',levels:[1,3]}];
  list[1].x=999;list[1].levels=1; // Simulate a legacy whole-group reflow.
  c.commit(list,before,[1,3],1);
  assert.equal(list[0].levels,6);assert.equal(list[2].levels,6);
  assert.equal(JSON.stringify(list[1]),JSON.stringify(before[1]),'unselected instance must be byte-for-byte unchanged');
  assert.equal(list[2].id,3);assert.equal(list[2].angle,270);assert.equal(list[2].x+list[2].w/2,250);
  assert.equal(list[2].joinGroup,'group');assert.equal(list[2].sharedFootWith,1);
  list[0].plan.feet.push(2000);assert.equal(list[2].plan.feet.length,2,'no shared mutable plans');
}
assert.equal(c.sameType(rack(1,0),rack(2,0,'drive')),false,'system identity must never be mixed');
const other=rack(2,0);other.rafexCatalogKey='b2b:B';assert.equal(c.sameType(rack(1,0),other),false,'different saved types must not mix');
const joined=[rack(1,0),rack(2,100),rack(3,200)];joined[2].sharedFootWith=2;
const result=c.separate(joined,[2]);assert.equal(result.count,1);assert.equal(joined[1].joinGroup,null);assert.equal(joined[2].sharedFootWith,null);
assert.equal(joined[1].freePlacement,true);assert.equal(joined[1].locked,false);assert.equal(joined[0].joinGroup,'group');
assert.equal(joined[1].typeName,'A','separation must not rename the type');
assert.equal(c.separate(joined,[2]).count,0,'separation is idempotent');
// A click selection remains enabled until Escape; clicking twice toggles just one id.
const listeners={},nodes=new Map(),selection={racks:[rack(1,0),rack(2,100),rack(3,200)],selected:null};
const page={dataset:{rafexCommonActive:'1'},classList:{contains:()=>false}};
const doc={body:{},getElementById:id=>id==='page'?page:nodes.get(id),querySelector:()=>null,querySelectorAll:()=>[],addEventListener:(name,fn)=>listeners[name]=fn};
let renders=0,undo=0;
const runtime=vm.createContext({window:null,document:doc,MutationObserver:class{observe(){}},requestAnimationFrame:fn=>fn(),queueMicrotask:fn=>fn(),m2LayoutState:selection,m2MultiSelect:{rackIds:new Set(),symbolIds:new Set()},m2RenderLayout:()=>renders++,m2ClearAllSelections(){runtime.m2MultiSelect.rackIds.clear();selection.selected=null},m2PushUndo:()=>undo++,m2NormalizeJoinComponents(){},m2OpenCustomizeModal(){},m2ApplyRackCustomization(){}});
runtime.window=runtime;runtime.RafexSelectionCoreV145=c;
runtime.addEventListener=(name,fn)=>listeners[name]=fn;
vm.runInContext(fs.readFileSync(new URL('free-selection-runtime-v145.js',import.meta.url),'utf8'),runtime);
const key=k=>listeners.keydown({ctrlKey:k==='q',key:k,preventDefault(){},stopImmediatePropagation(){}});
const click=id=>listeners.pointerdown({button:0,target:{closest:s=>s==='#m2LayoutSvg'?{}:{dataset:{rack:String(id)}}},preventDefault(){},stopImmediatePropagation(){}});
key('q');click(1);click(3);assert.deepEqual([...runtime.m2MultiSelect.rackIds],[1,3]);
click(1);assert.deepEqual([...runtime.m2MultiSelect.rackIds],[3]);click(2);assert.deepEqual([...runtime.m2MultiSelect.rackIds],[3,2]);
key('Escape');assert.equal(runtime.m2MultiSelect.rackIds.size,0);click(1);assert.equal(runtime.m2MultiSelect.rackIds.size,0);
assert(renders>0);assert.equal(undo,0,'selection alone must not alter undo history');
console.log('PASS: five-system selected-only updates, identity isolation, deep copies, separation, Ctrl+Q click toggle and Escape.');
