import assert from 'node:assert/strict';
import * as T from 'three';
import {cadPlanarFaces} from '../client/layout-3d-cad.mjs';
import {spatializeInstancesAsync} from '../client/layout-3d-preparation.mjs';
import {createPreparationBudget,populateInstances} from '../client/layout-3d-budget.mjs';
const g=new T.BoxGeometry(1,2,3,40,40,40),count=12000,matrices=Array.from({length:count},(_,i)=>new T.Matrix4().makeTranslation((i%120)*.5,0,Math.floor(i/120)*.5));
for(const axis of ['x','y','z']){const faces=cadPlanarFaces(g,axis);assert.equal(faces.length,2);const size={x:1,y:2,z:3}[axis];assert.deepEqual(faces.map(f=>f.at).sort((a,b)=>a-b),[-size/2,size/2]);for(const f of faces)assert(Math.abs(f.area-6/size)<1e-6);}
let clock=0,yields=0;const budget=createPreparationBudget({now:()=>clock++,milliseconds:2,pause:async()=>{yields++;}}),scene=new T.Scene(),mesh=new T.InstancedMesh(g,new T.MeshStandardMaterial(),count);
await populateInstances(mesh,matrices,budget);scene.add(mesh);for(let i=0;i<count;i++)mesh.setColorAt(i,new T.Color().setRGB((i%3)/2,.3,.7));
const source=new Float32Array(mesh.instanceMatrix.array),colors=new Float32Array(mesh.instanceColor.array);await spatializeInstancesAsync(scene,20,budget);
assert.equal(mesh.count,0);assert.equal(mesh.children.reduce((n,m)=>n+m.count,0),count);const expected=new Map(matrices.map((m,i)=>[String(new Float32Array(m.elements)),Array.from(colors.subarray(i*3,i*3+3))]));
for(const child of mesh.children)for(let i=0;i<child.count;i++){const key=String(child.instanceMatrix.array.subarray(i*16,i*16+16));assert(expected.has(key));assert.deepEqual(Array.from(child.instanceColor.array.subarray(i*3,i*3+3)),expected.get(key));expected.delete(key);}
assert.equal(expected.size,0);assert(yields>10);assert.equal(source.length,count*16);assert.equal(g.index.count/3,19200);
console.log('PASS 12,000 exact transforms/colors; spatial culling preserves every instance; intra-group yields; CAD contact planes and full triangles preserved.');
