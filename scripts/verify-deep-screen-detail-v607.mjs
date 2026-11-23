import fs from 'node:fs';import zlib from 'node:zlib';import assert from 'node:assert/strict';import {createRequire}from'node:module';import * as T from 'three';import {GLTFLoader}from'three/examples/jsm/loaders/GLTFLoader.js';import {MeshoptDecoder}from'three/examples/jsm/libs/meshopt_decoder.module.js';import {nodeDraco}from'./kat-wire-test-decoder-v392.mjs';
import {prepareCad}from'../client/layout-3d-cad.mjs';import {prepareUprightGeometry594}from'../client/upright-side-holes-v594.mjs';import {prepareScreenLod}from'../client/cad-screen-lod.mjs';import {createFacingBatch,cadLodScale607}from'../client/cad-facing-batches.mjs';import {createPreparationBudget}from'../client/layout-3d-budget.mjs';
import {prepareCadRenderParts} from '../client/layout-3d-batching.mjs';
const loader=new GLTFLoader().setDRACOLoader(await nodeDraco(createRequire(import.meta.url),T)).setMeshoptDecoder(MeshoptDecoder),report=[];
for(const system of ['mekik2','drive']){let b;if(system==='mekik2')b=zlib.gunzipSync(fs.readFileSync('assets/mekik-front-src/mekik-front-ayak.glb.gz'));else{const dir='assets/drive-in-src';b=zlib.gunzipSync(Buffer.from(fs.readdirSync(dir).filter(n=>n.startsWith('drive-in-v3-ayak-top.')).sort().map(n=>fs.readFileSync(dir+'/'+n,'utf8')).join(''),'base64'));}
const gl=await loader.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),''),template=prepareCad(gl.scene,system==='drive'?'drivePost':'mekikPost');
if(system==='drive'){
 const budget=createPreparationBudget();
 const source=template.geometries.filter(g=>g.userData.uprightCandidate594);
 const parts=await prepareCadRenderParts({...template,geometries:source,finishes:['paint','paint']},budget);
 assert.equal(parts.length,2,'Separate upright sections must survive material batching');
 for(const {geometry} of parts){
  const lod=await prepareScreenLod(geometry,budget,{allowProtected:true});
  assert(lod&&lod.geometry.index.count<geometry.index.count*.02,'Merged-scene rendering retains each upright distant model');
 }
}
for(const original of template.geometries.filter(g=>g.userData.uprightCandidate594)){const source=prepareUprightGeometry594(original),saved=source.attributes.position.array.slice(),budget=createPreparationBudget();assert.equal(await prepareScreenLod(source,budget),null,'Protected CAD remains exact unless explicitly requested for screen-space use');const lod=await prepareScreenLod(source,budget,{allowProtected:true});assert(lod);assert(lod.geometry.index.count<(source.index?.count??source.attributes.position.count)*.02);assert(lod.geometry.boundingBox.min.distanceTo(source.boundingBox.min)<1e-6);assert(lod.geometry.boundingBox.max.distanceTo(source.boundingBox.max)<1e-6);
assert.equal(cadLodScale607(new T.Matrix4().makeScale(1,10,1),lod),1,'Taller uprights do not enlarge lateral hole error');assert.equal(cadLodScale607(new T.Matrix4().makeScale(2,10,3),lod),3);
const size=source.boundingBox.getSize(new T.Vector3());assert(lod.error>=Math.hypot(size.x,size.z),'Conservative cross-section error bound covers every removed hole');
const scene=new T.Scene(),batch=await createFacingBatch(scene,source,new T.MeshStandardMaterial(),[new T.Matrix4()],budget,{screenLod:true,protectedLod:true}),camera=new T.PerspectiveCamera(45,1,.01,10000);camera.position.set(0,3,1000);camera.lookAt(0,3,0);camera.updateMatrixWorld(true);batch.update(camera.position,null,{camera,viewportHeight:1080,maxPixelError:.35});assert.equal(batch.stats().coarseInstances,1);const far=batch.stats().triangles;camera.position.set(0,3,.2);camera.lookAt(0,3,0);camera.updateMatrixWorld(true);batch.update(camera.position,null,{camera,viewportHeight:1080,maxPixelError:.35});assert.equal(batch.stats().coarseInstances,0,'Close camera restores actual holes and every source triangle');assert.deepEqual(source.attributes.position.array,saved);report.push({system,far,full:batch.stats().fullTriangles,closeDetailRestored:true});}}
console.log(JSON.stringify({pass:true,report}));
