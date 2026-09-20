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
// Selected-only width changes must reflow their joined row. Otherwise shared
// feet and tunnel boundaries are drawn at the stale pre-customization points.
const tunnelRow=[rack(1,0),rack(2,90),rack(3,180)];
tunnelRow.forEach((item,index)=>{item.angle=0;item.w=100;item.b2b.palletCount=3;item.b2bLayout={palletCount:3};item.sharedFootWith=index?tunnelRow[index-1].id:null;});
tunnelRow[1].b2b.tunnelHeight=3600;
const tunnelBefore=c.clone(tunnelRow),unselectedSpec=c.clone(tunnelRow[1]);
tunnelRow[0].w=130;tunnelRow[0].b2b.palletCount=4;tunnelRow[0].b2bLayout.palletCount=4;
c.commit(tunnelRow,tunnelBefore,[1,3],1);
assert.equal(JSON.stringify(c.reflow(tunnelRow,tunnelBefore,[1,3],1,10)),JSON.stringify(['group']));
assert.equal(tunnelRow[0].x+tunnelRow[0].w-tunnelRow[1].x,10,'left selected block must keep one shared-foot overlap');
assert.equal(tunnelRow[1].x+tunnelRow[1].w-tunnelRow[2].x,10,'tunnel boundary must keep one shared-foot overlap');
assert.equal(tunnelRow[1].b2b.tunnelHeight,3600,'unselected tunnel detail must remain unchanged');
for(const key of Object.keys(unselectedSpec))if(!['x','y'].includes(key))assert.deepEqual(tunnelRow[1][key],unselectedSpec[key],`unselected tunnel field ${key} must stay unchanged`);
// Extending a joined row must repair a stale perpendicular coordinate instead
// of leaving one module above the row with a module-sized hole below it.
const extensionBefore=[rack(11,0),rack(12,90),rack(13,180)];
extensionBefore.forEach((item,index)=>{item.angle=0;item.w=100;item.y=40;item.sharedFootWith=index?extensionBefore[index-1].id:null;});
const extended=c.clone(extensionBefore);extended[1].y=-10;
extended.push({...c.clone(extended[2]),id:14,x:270,y:40,sharedFootWith:13});
assert.equal(JSON.stringify(c.alignExtension(extended,extensionBefore,12,1,1,10)),JSON.stringify(['group']));
assert(extended.every(item=>item.y===40),'all extended modules must return to the original row axis');
for(let index=1;index<extended.length;index++)assert.equal(extended[index-1].x+extended[index-1].w-extended[index].x,10,'extended row must retain one shared-foot overlap');
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
