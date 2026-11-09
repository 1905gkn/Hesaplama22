import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {directionalWalls552,transform} from './wall-distance-v552.mjs';
const box={left:20,right:60,top:30,bottom:50,cx:40,cy:40};
const walls=[{a:{x:0,y:0},b:{x:100,y:10}},{a:{x:100,y:10},b:{x:100,y:100}},{a:{x:100,y:100},b:{x:0,y:100}},{a:{x:0,y:100},b:{x:0,y:0}}];
let w=directionalWalls552(box,walls);assert.equal(w.top,6);assert.equal(w.topAt,60);assert.equal(w.left,0);assert.equal(w.right,100);assert.equal(w.bottom,100);
assert.equal(directionalWalls552(box,[{a:{x:25,y:20},b:{x:30,y:20}}]).top,20,'Narrow obstacle outside the centre ray is still measured.');
assert.equal(directionalWalls552(box,[{a:{x:70,y:20},b:{x:80,y:20}}]).top,-Infinity,'Unaligned obstacles do not create dimensions.');
assert.equal(directionalWalls552(box,walls.map(e=>({a:e.b,b:e.a}))).top,6,'Wall drawing direction must not change clearance.');
const file=fs.existsSync('after.html')?'after.html':fs.existsSync('dist/index.html')?'dist/index.html':null;
assert(file,'Built HTML required for wall movement regressions');
const before=fs.readFileSync(file,'utf8'),html=transform(before);assert.equal(transform(html),html);
const take=(source,start,end)=>{const a=source.indexOf(start),b=source.indexOf(end,a+start.length);assert(a>=0&&b>a,start);return source.slice(a,b);};
const actual=source=>take(source,'function m2ActualWallsV228(box)','      /* wall-gap-basis-v353 */');
const rack={id:1,x:20,y:30,w:40,h:20,angle:0},state={scale:1,closed:true,points:walls.map(e=>e.a),racks:[rack],selected:1};let undo=0;
const bounds=r=>({left:r.x,right:r.x+r.w,top:r.y,bottom:r.y+r.h,cx:r.x+r.w/2,cy:r.y+r.h/2});
const ctx={window:{rafexCadDistancesV363:{segments:()=>walls}},m2LayoutState:state,m2LayoutSymbols:[],m2WallMeasurementInset:0,m2MultiSelect:{rackIds:new Set()},m2IsMekikV512:()=>false,m2RackOverlapsBlockingSymbol:()=>false,m2AccessoryWallClearanceValidV503:()=>true,m2RackVisualSideOverhang:()=>0,m2GapBoundsV346:bounds,m2MovementMembersV267:r=>[r],m2PerfDistancePrepare:()=>({wallMeasurements:new Map()}),m2PerfRememberDistanceDependency:()=>{},m2AccessoryWallMinimumV503:()=>0,m2MeasurementRack:()=>state.racks.find(r=>r.id===state.selected),m2PushUndo:()=>undo++,m2RememberEditedDistance:()=>{},m2RenderLayout:()=>{},fmt:String,$:()=>({textContent:''}),directionalWalls552};
vm.createContext(ctx);
vm.runInContext(take(before,'function m2PointInArea(point)','      function m2PointInConvexShape')+take(before,'function m2RackInsideArea(rack','      function m2RackVisualSideOverhang'),ctx);
const oldTop=walls[0].a.y+(bounds(rack).cx-walls[0].a.x)*(walls[0].b.y-walls[0].a.y)/(walls[0].b.x-walls[0].a.x);assert.equal(oldTop,4);
assert.equal(ctx.m2RackInsideArea(rack,rack.x,oldTop,0),false,'REPRO: centre-ray zero clearance puts a corner through the skew wall.');
vm.runInContext(actual(html)+take(html,'function m2WallMovementBoundsV552','      /* wall-guides-v225 */')+take(html,'function m2SetWallDistance(direction','      function m2CreateRectangle'),ctx);
ctx.m2GroupTranslationValid=(origins,dx,dy)=>origins.every(o=>{const r=state.racks.find(r=>r.id===o.id);return ctx.m2RackInsideArea(r,o.x+dx,o.y+dy,r.angle);});
ctx.m2MoveRackOrJoinedGroup=(r,x,y)=>{const origins=ctx.m2MovementMembersV267(r).map(r=>({id:r.id,x:r.x,y:r.y})),dx=x-r.x,dy=y-r.y;if(!ctx.m2GroupTranslationValid(origins,dx,dy))return false;origins.forEach(o=>Object.assign(state.racks.find(r=>r.id===o.id),{x:o.x+dx,y:o.y+dy}));return true;};
ctx.m2SetWallDistance('top',0);assert.equal(rack.y,6);assert.equal(ctx.m2WallMeasurements(rack).top.px,0);assert.equal(undo,1);
ctx.m2SetWallDistance('top',20);assert.equal(rack.y,26);assert.equal(ctx.m2WallMeasurements(rack).top.px,20);
const r2={id:2,x:60,y:26,w:20,h:20,angle:0};state.racks.push(r2);ctx.m2MovementMembersV267=()=>[rack,r2];ctx.m2SetWallDistance('top',0);assert.equal(rack.y,8);assert.equal(r2.y,8);assert.equal(ctx.m2WallMeasurements(rack).top.px,0,'Whole connected row uses its closest corner, not selected bay centre.');
const pos=JSON.stringify(state.racks);ctx.m2SetWallDistance('bottom',500);assert.equal(JSON.stringify(state.racks),pos,'Real out-of-area movement is still rejected.');
state.selected=2;ctx.m2MovementMembersV267=r=>[r];ctx.m2SetWallDistance('left',10,1);assert.equal(rack.x,10,'Explicit dimension owner survives selection changes.');assert.equal(r2.x,60);
for(const direction of ['left','right','top','bottom']){
 Object.assign(rack,{x:20,y:30});state.selected=1;ctx.m2SetWallDistance(direction,12);assert(Math.abs(ctx.m2WallMeasurements(rack)[direction].px-12)<1e-7,direction);
}
if(file==='after.html')fs.writeFileSync('after552.html',html);
console.log('PASS v552: reproduced skew-wall freeze, zero/positive offsets on all four sides, full moving row, narrow columns, reversed walls, owner binding, undo and genuine obstruction protection.');

