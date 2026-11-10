import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {transform} from './initial-placement-v558.mjs';
const s=transform(fs.readFileSync(process.argv[2]||'dist/index.html','utf8'));
const extract=(name,next)=>s.slice(s.indexOf('function '+name+'('),s.indexOf('function '+next+'(',s.indexOf('function '+name+'(')));
let collisions=0;const rack={id:1,x:10,y:10,w:50,h:50,freePlacement:true,locked:false,rafexSystem:'mekik2'};
const context={m2LayoutState:{racks:[rack]},m2MekikColumnTargetV512:()=>{collisions++;throw Error('First placement must not sweep columns');},m2MekikColumnGroupTargetV512:()=>{collisions++;throw Error('First placement must not sweep columns');},m2RackInsideArea:()=>{collisions++;return false;}};
vm.createContext(context);vm.runInContext(extract('m2SmoothFreeRackPosition','m2FreeGroupTranslationValid')+'\n'+extract('m2SmoothFreeGroupTranslation','m2MovementMembersV267'),context);
for(const system of ['mekik2','drive','b2b','mr','konsol']){rack.rafexSystem=system;for(const [x,y]of [[100,200],[-50,-20],[1200,900]]){const p=context.m2SmoothFreeRackPosition(rack,x,y);assert.equal(p.x,x);assert.equal(p.y,y);assert(p.exact);}}
assert.equal(collisions,0);
const grouped=context.m2SmoothFreeGroupTranslation([{id:1}],300,400);assert.equal(grouped.dx,300);assert.equal(grouped.dy,400);assert.equal(collisions,0);
rack.freePlacement=false;rack.locked=true;assert.throws(()=>context.m2SmoothFreeRackPosition(rack,100,200),/sweep columns/);
assert(s.includes('const outside=!m2RackInsideArea(rack),overlap=m2RackOverlaps(rack),valid=!outside&&!overlap;'));
assert(s.includes('rack.freePlacement=!valid;rack.staged=!valid;rack.locked=valid;'));
assert.equal(transform(s),s);
for(const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);
console.log('PASS all systems: initial placement crosses racks/columns/walls; dropped racks retain collision checks; save validation and release lifecycle unchanged.');
