import * as THREE from 'three';
import {prepareCad} from '../client/layout-3d-cad.mjs';
import assert from 'node:assert/strict';
import {environmentSnapshot,environmentParts,rackVisualTop} from '../client/layout-3d-environment.mjs';
import {layoutSnapshot} from '../client/layout-3d-data.mjs';
import {rackParts} from '../client/layout-3d-geometry.mjs';
import {fixtures} from './verify-layout-3d.mjs';
const state={scale:.1,closed:true,racks:fixtures,points:[{x:0,y:0},{x:1000,y:0},{x:1000,y:800},{x:0,y:800}],pathBreaks:[]},symbols=[{id:10,type:'door',x:400,y:-10,w:200,h:20,widthMm:2000,depthMm:200},{id:11,type:'column',x:700,y:600,w:50,h:50,widthMm:500,depthMm:500,angle:90}],before=JSON.stringify({state,symbols});
const snap=environmentSnapshot(state,symbols),data={...layoutSnapshot(state),...snap},parts=environmentParts(data),walls=parts.filter(p=>p.kind==='wall');
assert.ok(walls.every(p=>p.h===1&&p.y===.5),'Walls must be exactly one metre high');assert.ok(Math.abs(walls.reduce((n,p)=>n+p.w,0)-34)<1e-6,'The 2m doorway must cut the 36m perimeter');assert.equal(parts.filter(p=>p.kind==='column').length,1);assert.equal(parts.filter(p=>p.kind==='door').length,3);assert.equal(parts.filter(p=>p.kind==='doorLeaf').length,1);
const front=walls.filter(p=>Math.abs(p.z+.06)<1e-6);assert.equal(front.length,2);assert.ok(front.every(p=>Math.abs(p.w-4)<1e-6));assert.ok(front.every(p=>Math.abs(p.z+p.d/2)<1e-6),'Wall inner face must stay on the measured plan edge');
assert.equal(environmentParts({...data,wallless:true}).filter(p=>p.kind==='wall').length,0,'Never turn workspace edges into physical walls');const broken=environmentParts({...data,breaks:[3]});assert.ok(Math.abs(broken.filter(p=>p.kind==='wall').reduce((n,p)=>n+p.w,0)-26)<1e-6);
assert.equal(snap.symbols[1].width,.5);assert.equal(snap.symbols[1].angle,-Math.PI/2);assert.equal(JSON.stringify({state,symbols}),before,'Environment preview must not modify project data');
const rack=layoutSnapshot({scale:.04,racks:[{...fixtures[3],typeName:'D',typeColor:'#db2777'}]}).racks[0];assert.equal(rack.name,'D');assert.equal(rack.typeColor,'#db2777');const pitch=(rack.width-rack.foot)/rack.bays,seats=[-.4575,.4575],rails=rackParts(rack,{cad:true,railSeats:seats}).filter(p=>p.kind==='rail');const center=-rack.width/2+rack.foot/2+pitch/2;
assert.ok(Math.abs((rails[0].x-rails[0].w/2)-(center+seats[0]*pitch/1.45-.004))<1e-6,'Left rail must sit on the aisle-facing front of the bracket');assert.ok(Math.abs((rails[1].x+rails[1].w/2)-(center+seats[1]*pitch/1.45+.004))<1e-6,'Right rail must face into the lane');
assert.equal(rackVisualTop({...rack,system:'mr',height:3.7}),3.7,'MR labels must not float above invented pallet loads');assert.equal(rackVisualTop({...rack,height:4.9,frameHeights:[{left:6000,right:4900}]}),6);
console.log('PASS 3D environment: one-metre walls, real doorway openings, columns/doors in one set, outward wall thickness preserving clearances, breaks/wallless plans, exact type names/colors, immutable state and rails on bracket front faces.');

const brackets=new THREE.Group();for(const side of [-1,1]){const mesh=new THREE.Mesh(new THREE.BoxGeometry(135,50,250),new THREE.MeshStandardMaterial());mesh.name="BRAKET "+side;mesh.position.set(side*525,0,125);brackets.add(mesh)}const prepared=prepareCad(brackets,"mekikBeam");assert.ok(Math.abs(prepared.railSeats[0]+.4575)<1e-6&&Math.abs(prepared.railSeats[1]-.4575)<1e-6,"Rail front seats must come from CAD bracket faces");console.log("PASS rail seats extracted from CAD bracket faces.");
