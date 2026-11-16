import assert from 'node:assert/strict';import * as T from 'three';
import {prepareScreenLod,projectedCadError} from '../client/cad-screen-lod.mjs';
import {createFacingBatch} from '../client/cad-facing-batches.mjs';import {createPreparationBudget} from '../client/layout-3d-budget.mjs';
const source=new T.BoxGeometry(1,2,3,100,100,100),saved=source.index.array.slice(),budget=createPreparationBudget();source.computeBoundingSphere();
const lod=await prepareScreenLod(source,budget);assert(lod&&lod.geometry.index.count<source.index.count*.1);assert.equal(await prepareScreenLod(source,budget),lod);assert.deepEqual(source.index.array,saved);
const camera=new T.PerspectiveCamera(45,1.6,.01,1000);camera.position.set(0,1,100);camera.lookAt(0,1,0);camera.updateMatrixWorld(true);
assert(projectedCadError(.003,1,source.boundingSphere,camera,1080)<.35);
const scene=new T.Scene(),matrices=Array.from({length:20},(_,i)=>new T.Matrix4().makeTranslation(i*.1,0,0));
const batch=await createFacingBatch(scene,source,new T.MeshStandardMaterial(),matrices,budget,{screenLod:true});batch.update(camera.position,null,{camera,viewportHeight:1080});
const far=batch.stats();assert.equal(far.coarseInstances,20);assert(far.triangles<far.fullTriangles*.1);
batch.update(camera.position,null,{camera,viewportHeight:1080,maxPixelError:0});assert.equal(batch.stats().coarseInstances,0,'detail budget changes must refresh an unchanged camera');batch.update(camera.position,null,{camera,viewportHeight:1080,maxPixelError:.35});assert.equal(batch.stats().coarseInstances,20);
camera.position.set(0,1,1);camera.lookAt(0,1,0);camera.updateMatrixWorld(true);batch.update(camera.position,null,{camera,viewportHeight:1080});const near=batch.stats();assert.equal(near.coarseInstances,0,'near camera always restores full geometry');assert(near.triangles>far.triangles);
assert.deepEqual(source.index.array,saved);assert.equal(scene.children.filter(m=>m.isInstancedMesh).length,batch.stats().batches);
const plate=new T.RingGeometry(.4,1,512,16),plateLod=await prepareScreenLod(plate,budget);
if(plateLod){const p=plate.attributes.position,q=plateLod.geometry.attributes.position,point=(x,y)=>(Math.abs(x)<.0000005?0:x).toFixed(6)+':'+(Math.abs(y)<.0000005?0:y).toFixed(6),kept=new Set();for(let i=0;i<q.count;i++)kept.add(point(q.getX(i),q.getY(i)));for(let i=0;i<p.count;i++){const radius=Math.hypot(p.getX(i),p.getY(i));if(Math.abs(radius-.4)<1e-6||Math.abs(radius-1)<1e-6)assert(kept.has(point(p.getX(i),p.getY(i))),'Open plate outlines and hole borders remain exact');}}
const modest=new T.BoxGeometry(1,2,3,8,8,8),many=Array.from({length:1000},(_,i)=>new T.Matrix4().makeTranslation(i*.01,0,0));
const repeated=await createFacingBatch(new T.Scene(),modest,new T.MeshStandardMaterial(),many,budget,{screenLod:true});assert(repeated,'Small CAD parts repeated heavily must be included');camera.position.set(0,1,100);camera.lookAt(0,1,0);camera.updateMatrixWorld(true);repeated.update(camera.position,null,{camera,viewportHeight:1080});assert.equal(repeated.stats().coarseInstances,1000);assert(repeated.stats().triangles<repeated.stats().fullTriangles*.1);
console.log(JSON.stringify({pass:true,farTriangles:far.triangles,nearTriangles:near.triangles,originalTriangles:far.fullTriangles,pixelErrorLimit:.35,sourceUnchanged:true}));
