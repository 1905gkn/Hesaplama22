import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {transform,wallCuts559} from './target-placement-v559.mjs';
const s=transform(fs.readFileSync(process.argv[2]||'dist/index.html','utf8'));
const fn=name=>{const start=s.indexOf('function '+name+'('),end=s.indexOf('function m2',start+('function '+name+'(').length);return s.slice(start,end).replace(/\/\*[\s\S]*?\*\//g,'');};
let symbols=false,clearance=true,sweeps=0;const walls=[{a:{x:0,y:0},b:{x:100,y:0}},{a:{x:100,y:0},b:{x:100,y:100}},{a:{x:100,y:100},b:{x:0,y:100}},{a:{x:0,y:100},b:{x:0,y:0}}];
const c={window:{rafexWallCuts559:wallCuts559},m2IsMekikV512:()=>true,m2RackOverlapsBlockingSymbol:()=>symbols,m2AccessoryWallClearanceValidV503:()=>clearance,m2RackVisualSideOverhang:()=>0,m2WallMeasurementInset:0,m2PerfWallGeometryTable:()=>({segments:walls}),m2LayoutState:{closed:true},m2RackOverlaps:()=>symbols,m2MekikColumnTargetV512:()=>{sweeps++;throw Error('Sweep only applies after invalid target');}};
vm.createContext(c);vm.runInContext(fn('m2RackInsideArea')+fn('m2SmoothDragPosition'),c);
const rack={x:-40,y:20,w:20,h:20,angle:0,freePlacement:false,locked:true};
assert(c.m2RackInsideArea(rack)); // Completely outside the enclosure, clear of its walls.
assert(c.m2RackInsideArea(rack,40,40)); // Closed room has enough space.
assert(!c.m2RackInsideArea(rack,90,40)); // Straddles a wall.
assert(!c.m2RackInsideArea({...rack,w:120,h:120},-10,-10)); // Room smaller than rack.
assert(c.m2RackInsideArea(rack,0,0)); // Touching walls is valid without accessory clearance.
assert(c.m2RackInsideArea(rack,35,35,45));assert(!c.m2RackInsideArea(rack,95,35,45));
const moved=c.m2SmoothDragPosition(rack,40,40);assert.equal(moved.x,40);assert.equal(moved.y,40);assert.equal(sweeps,0);
c.m2GroupTranslationValid=()=>true;c.m2MekikColumnGroupTargetV512=()=>{throw Error('Valid group destination must not sweep columns');};vm.runInContext(fn('m2SmoothGroupTranslation'),c);const group=c.m2SmoothGroupTranslation([{id:1}],80,20);assert.equal(group.dx,80);assert.equal(group.dy,20);
symbols=true;assert(!c.m2RackInsideArea(rack,40,40));symbols=false;clearance=false;assert(!c.m2RackInsideArea(rack,40,40));clearance=true;
const box=[{x:0,y:0},{x:10,y:0},{x:10,y:10},{x:0,y:10}];assert(wallCuts559({x:-2,y:-2},{x:12,y:12},box));assert(!wallCuts559({x:-2,y:0},{x:12,y:0},box));
assert.equal(transform(s),s);for(const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);
console.log('PASS destination placement: outside walls, entry into closed room, too-small room rejected, wall/column/accessory checks, rotation, corner crossings and no swept-path restriction for valid targets.');
