import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import * as THREE from 'three';
import {createDemandFrame} from '../client/demand-frame.mjs';
import {batchDriveStaticParts} from '../client/drive-static-parts.mjs';
import {createStaticSceneTransforms} from '../client/static-scene-transforms.mjs';
import {prepareDriveNativePost,createDriveNativeFacing} from '../client/drive-native-batches.mjs';
import {driveInUprightHeight} from '../client/drive-in-height.mjs';
import {readGlb,readPrimitive} from './cad-gpu-assets-v532.mjs';
import {transform} from './drive-static-v538.mjs';

function clock(){let id=0;const queue=new Map();return {request(fn){const next=id++;queue.set(next,fn);return next;},cancel(i){queue.delete(i);},run(){const todo=[...queue.values()];queue.clear();todo.forEach(fn=>fn());},get size(){return queue.size;}};}
const ticks=clock();let draws=0;const frame=createDemandFrame(()=>draws++,ticks);
for(let i=0;i<20;i++)frame.request();assert.equal(ticks.size,1,'Handle zero must also coalesce');ticks.run();assert.equal(draws,1);
frame.request();frame.flush();assert.equal(draws,2);assert.equal(ticks.size,0,'Capture flush cancels deferred duplicate');
frame.request();frame.dispose();ticks.run();frame.flush();frame.request();assert.equal(draws,2);assert.equal(ticks.size,0);
const recursiveClock=clock();let nested=0,recursive;recursive=createDemandFrame(()=>{nested++;recursive.flush();},recursiveClock);recursive.flush();assert.equal(nested,1,'Synchronous capture is not reentrant');

// Fixed transforms are computed once. A refresh affects only the changed subtree,
// including descendants of new measurement markers and moving vehicles.
const scene=new THREE.Scene(),staticRack=new THREE.Group(),overlay=new THREE.Group(),vehicle=new THREE.Group();scene.add(staticRack,overlay,vehicle);
for(let i=0;i<1000;i++){const o=new THREE.Object3D();o.position.set(i,i%7,4);staticRack.add(o);}
let staticUpdates=0;for(const o of staticRack.children){const original=o.updateMatrix;o.updateMatrix=function(){staticUpdates++;original.call(this);};}
const transforms=createStaticSceneTransforms(scene);assert.equal(staticUpdates,1000);assert.equal(scene.matrixWorldAutoUpdate,false);
for(let i=0;i<60;i++){if(scene.matrixWorldAutoUpdate)scene.updateMatrixWorld();vehicle.position.x=i;transforms.refresh(vehicle);}
assert.equal(staticUpdates,1000,'Camera/vehicle frames must not update fixed racks');assert.equal(vehicle.matrixWorld.elements[12],59);
const marker=new THREE.Object3D();marker.position.set(10,20,30);overlay.add(marker);transforms.refresh(overlay);assert.equal(marker.matrixWorld.elements[13],20);

// Instance only compatible opaque leaves, preserving exact attributes/materials
// and all world transforms under rotated/non-uniformly scaled ancestors.
const geometry=new THREE.BoxGeometry(2,3,4),paint=new THREE.MeshStandardMaterial({color:0x004f7c}),galv=new THREE.MeshStandardMaterial({color:0xaeb8bd}),root=new THREE.Group();root.position.set(7,2,9);root.rotation.y=.24;
const originals=[];
for(let i=0;i<12;i++){const parent=new THREE.Group();parent.position.set(i*5,3,i%3);parent.rotation.z=i*.04;parent.scale.set(1+i*.1,.8,1.2);const mesh=new THREE.Mesh(geometry,i%2?paint:galv);mesh.position.set(2,1,4);parent.add(mesh);root.add(parent);originals.push(mesh);}
const excluded=[];for(const kind of ['hidden','transparent','negative','child','differentFlags','existingInstance']){
 const m=kind==='existingInstance'?new THREE.InstancedMesh(geometry,paint,2):new THREE.Mesh(geometry,kind==='transparent'?new THREE.MeshStandardMaterial({transparent:true,opacity:.5}):paint);
 if(kind==='negative')m.scale.x=-1;if(kind==='child')m.add(new THREE.Object3D());if(kind==='differentFlags')m.renderOrder=8;
 const p=new THREE.Group();p.visible=kind!=='hidden';p.add(m);root.add(p);excluded.push(m);
}
root.updateMatrixWorld(true);const worlds=originals.map(m=>({material:m.material,matrix:m.matrixWorld.clone()})),sourceVertices=geometry.attributes.position.array.slice(),sourceIndex=geometry.index.array.slice();
const stats=batchDriveStaticParts(root);assert.equal(stats.replacedMeshes,12);assert.equal(stats.batches,2);excluded.forEach(m=>assert(m.parent,'Unsupported leaves remain intact'));
assert.deepEqual(geometry.attributes.position.array,sourceVertices);assert.deepEqual(geometry.index.array,sourceIndex);
const actual=[];root.updateMatrixWorld(true);for(const batch of root.children.filter(m=>m.userData.driveStaticBatch)){assert.equal(batch.geometry,geometry);const m=new THREE.Matrix4();for(let i=0;i<batch.count;i++){batch.getMatrixAt(i,m);actual.push({material:batch.material,matrix:new THREE.Matrix4().multiplyMatrices(batch.matrixWorld,m)});}}
for(const before of worlds){const i=actual.findIndex(a=>a.material===before.material&&a.matrix.elements.every((v,j)=>Math.abs(v-before.matrix.elements[j])<.00002));assert(i>=0,'World transform and material preserved');actual.splice(i,1);}assert.equal(actual.length,0);

async function source(file){
 const {json,bin}=readGlb(fs.readFileSync(file)),templates=[];
 for(const mesh of json.meshes){const parts=[];for(const p of mesh.primitives){const data=await readPrimitive(json,bin,p),g=new THREE.BufferGeometry();for(const [key,a]of Object.entries(data.attrs))g.setAttribute({POSITION:'position',NORMAL:'normal',TEXCOORD_0:'uv'}[key]||key,new THREE.BufferAttribute(a.array,a.n,!!a.normalized));g.setIndex(new THREE.BufferAttribute(new Uint32Array(data.indices),1));const m=new THREE.Mesh(g);m.name=mesh.name||'';parts.push(m);}templates.push(parts);}
 function node(i){const n=json.nodes[i],parts=n.mesh==null?[]:templates[n.mesh].map(m=>m.clone()),g=parts.length===1?parts[0]:new THREE.Group();if(parts.length>1)g.add(...parts);g.name=n.name||g.name;if(n.matrix)g.applyMatrix4(new THREE.Matrix4().fromArray(n.matrix));else{g.position.fromArray(n.translation||[0,0,0]);g.quaternion.fromArray(n.rotation||[0,0,0,1]);g.scale.fromArray(n.scale||[1,1,1]);}for(const c of n.children||[])g.add(node(c));return g;}
 const result=new THREE.Group();for(const id of json.scenes[json.scene||0].nodes)result.add(node(id));return result;
}
const models={};for(const [key,name]of Object.entries({ayak:'ayak-top',ray:'ray',konsol:'konsol',arabag:'arabag',palet:'palet'}))models[key]=await source('dist/drive-in/drive-in-'+name+'.glb');models.ayak=await prepareDriveNativePost(models.ayak);
const code=fs.readFileSync('client/drive-in-viewer.entry.js','utf8'),body=code.replace(/^import .*;\r?\n/gm,'').split('let active = null;')[0];
const Viewer=vm.runInNewContext(body+'\nDriveInFrontViewer',{THREE,driveInUprightHeight,prepareDriveNativePost,createDriveNativeFacing,batchDriveStaticParts,createDemandFrame,createStaticSceneTransforms});
export function harness(config,Type=Viewer){
 const viewer=Object.create(Type.prototype),queue=clock();Object.assign(viewer,{config:viewer.normalize(config),models,root:new THREE.Group(),scene:new THREE.Scene(),canvas:{dataset:{},getBoundingClientRect:()=>({width:1260,height:760})},destroyed:false,lastWidth:1260,lastHeight:760,cachedBounds:new THREE.Box3(),layoutSignature:null,renderCount:0,layoutEvents:0,boundsScans:0});viewer.scene.add(viewer.root);
 viewer.camera=new THREE.OrthographicCamera(-1,1,1,-1,1,100000);viewer.camera.up.set(0,0,1);viewer.controls={target:new THREE.Vector3(),update(){viewer.renderScene();}};
 const events=[];viewer.emit=(name,detail)=>events.push({name,detail});
 viewer.renderer={info:{render:{}},setSize(){},render(scene,camera){if(scene.matrixWorldAutoUpdate)scene.updateMatrixWorld();camera.updateMatrixWorld();let calls=0,triangles=0;scene.traverseVisible(m=>{if(m.isMesh){const n=m.isInstancedMesh?m.count:1;if(n){calls++;triangles+=n*Math.min(m.geometry.index?.count??m.geometry.attributes.position.count,m.geometry.drawRange.count)/3;}}});this.info.render={calls,triangles};}};
 viewer.drawFrame=createDemandFrame(()=>viewer.drawScene(),queue);return {viewer,queue,events};
}
const results=[];
for(const config of [{levels:4,bays:4},{levels:12,bays:30,depthPallets:20,footColor:'pgv',traverseColor:'ral2004'},{levels:8,bays:15,showPallets:false},{levels:4,bays:6,driveStepped:{height:7000,frames:[{start:0,end:1100,depth:1100,height:7000},{start:2000,end:3100,depth:1100,height:5000}],floors:Array.from({length:4},(_,i)=>({positions:[i>1?2000:0],runs:[{start:i>1?2000:0,end:4000,supports:[2000,3000],firstFrame:0,lastFrame:1}]}))}}]){
 const {viewer:v,queue,events}=harness(config);v.rebuild();assert.equal(queue.size,1);assert.equal(v.renderCount,0);queue.run();assert.equal(v.renderCount,1);assert.equal(v.layoutEvents,1);assert.equal(v.boundsScans,1);
 const first=JSON.parse(JSON.stringify(events.at(-1).detail)),batches=v.staticBatches;assert(batches.remainingDraws<batches.sourceMeshes/2,'Real Drive-In repeated parts must collapse');
 for(let i=0;i<10;i++)v.renderScene();queue.run();assert.equal(v.renderCount,2);assert.equal(v.layoutEvents,1);assert.equal(v.boundsScans,1,'Unchanged render must never rescan model bounds');
 v.resize(true);v.render();assert.equal(queue.size,0,'Capture immediately flushes prepared image');assert.equal(v.layoutEvents,1);assert.deepEqual(JSON.parse(JSON.stringify(events.at(-1).detail)),first,'Capture framing and measurements stay stable');
 v.lastWidth=1000;v.resize(true);v.camera.zoom=1.1;v.camera.updateProjectionMatrix();v.render();assert.equal(v.layoutEvents,2,'Projection changes update measurement screen positions once');
 assert.equal(v.boundsScans,1);v.update({levels:config.levels+1,driveStepped:null});queue.run();assert.equal(v.boundsScans,2,'Data change rebuilds cached model and bounds');assert.equal(v.layoutEvents,3);
 results.push({levels:config.levels,sourceDraws:batches.sourceMeshes,batchedDraws:batches.remainingDraws,triangleDetailRetained:true});
 v.destroyed=true;v.drawFrame.dispose();
}
const html='<script src="/layout-3d.js?v=537"></script><script src="/drive-in-viewer.js?v=537"></script><script src="/customer-view.js?v=537"></script>',patched=transform(html);assert.equal(transform(patched),patched);for(const name of ['layout-3d','drive-in-viewer','customer-view'])assert(patched.includes('/'+name+'.js?v=538'));
console.log(JSON.stringify({pass:true,coalescedRequests:20,unchangedSceneFrames:60,staticRackUpdates:staticUpdates,worldTransformsAndFinishesPreserved:true,captureSynchronous:true,results}));
