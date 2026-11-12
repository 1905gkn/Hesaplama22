import assert from 'node:assert/strict';
import * as T from 'three';
import {createFacingBatch} from '../client/cad-facing-batches.mjs';
import {createPreparationBudget} from '../client/layout-3d-budget.mjs';
const scene=new T.Scene(),geometry=new T.BoxGeometry(2,3,1,100,100,100),material=new T.MeshStandardMaterial();
const matrices=Array.from({length:16},(_,i)=>new T.Matrix4().makeTranslation(i*4,0,0));
const batch=await createFacingBatch(scene,geometry,material,matrices,createPreparationBudget());assert(batch);
batch.update(new T.Vector3(80,30,20));const a=batch.stats();assert(a.triangles<a.fullTriangles);assert(a.triangles>0);
batch.update(new T.Vector3(-80,30,-20));assert(batch.stats().triangles>0);
const original=geometry.index.array.slice();batch.update(new T.Vector3(80,30,20));assert.deepEqual(geometry.index.array,original);
assert.equal(await createFacingBatch(new T.Scene(),new T.BoxGeometry(),material,matrices,createPreparationBudget()),null);
assert.equal(await createFacingBatch(new T.Scene(),geometry,new T.MeshStandardMaterial({side:T.DoubleSide}),matrices,createPreparationBudget()),null);
console.log(JSON.stringify({pass:true,fullTriangles:a.fullTriangles,submittedTriangles:a.triangles,batches:a.batches}));

