import assert from 'node:assert/strict';
import * as T from 'three';
import {createFacingBatch} from '../client/cad-facing-batches.mjs';
import {createPreparationBudget} from '../client/layout-3d-budget.mjs';
const geometry=new T.BoxGeometry(1,3,1,20,20,20),material=new T.MeshStandardMaterial(),source=geometry.index.array.slice();
const matrices=Array.from({length:240},(_,i)=>new T.Matrix4().makeTranslation(i%20*3,0,Math.floor(i/20)*3));
const scene=new T.Scene(),batch=await createFacingBatch(scene,geometry,material,matrices,createPreparationBudget());
assert(batch,'Repeated modest prototype must now be eligible');
for(const camera of [new T.Vector3(100,40,100),new T.Vector3(-100,40,-100),new T.Vector3(100,40,-100),new T.Vector3(-100,40,100)]){batch.update(camera);const s=batch.stats();assert(s.triangles>0&&s.triangles<s.fullTriangles);}
assert.deepEqual(geometry.index.array,source);
assert.equal(await createFacingBatch(new T.Scene(),geometry,material,matrices.slice(0,1),createPreparationBudget()),null,'Small total workload stays unpartitioned');
assert.equal(await createFacingBatch(new T.Scene(),new T.BoxGeometry(),material,matrices,createPreparationBudget()),null,'Tiny primitive stays unpartitioned');
assert.equal(await createFacingBatch(new T.Scene(),geometry,new T.MeshStandardMaterial({side:T.DoubleSide}),matrices,createPreparationBudget()),null);
const camera=new T.PerspectiveCamera(45,1,.1,500);camera.position.set(80,30,80);camera.lookAt(25,1,15);camera.updateMatrixWorld();const f=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));batch.update(camera.position,f);const s=batch.stats();assert(s.triangles<s.fullTriangles);console.log(JSON.stringify({pass:true,prototypeTriangles:geometry.index.count/3,instances:matrices.length,...s}));

