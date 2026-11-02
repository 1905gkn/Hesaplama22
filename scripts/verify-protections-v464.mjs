import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {prepareProtectionCad,protectionBatches,protectionAxis} from '../client/layout-3d-protections.mjs';
import {environmentSnapshot,environmentParts} from '../client/layout-3d-environment.mjs';
const templates={};for(const [type,file,height] of [['uaks','uaks-koruma',.293],['uakz','uakz-koruma',.4030487],['barrier','bariyer-koruma',.283]]){
 const bytes=fs.readFileSync('assets/'+file+'.glb'),asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');let triangles=0;asset.scene.traverse(m=>{if(m.isMesh)triangles+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3});
 const t=prepareProtectionCad(asset.scene,type);templates[type]=t;assert(Math.abs(t.height-height)<.00001);assert(Math.abs(t.geometry.boundingBox.min.y)<1e-6);assert(Math.abs(t.geometry.boundingBox.min.x+t.geometry.boundingBox.max.x)<1e-6);assert.equal((t.geometry.index?.count||t.geometry.attributes.position.count)/3,triangles);
}
const state={scale:.04,racks:[{id:1,x:0,y:0,w:120,h:48,angle:90,footType:90}],points:[],closed:false};
const raw=[{id:1,type:'uaks',rackId:1,localX:-60,localY:-22,x:0,y:0,w:12,h:12},{id:2,type:'uakz',rackId:1,localX:60,localY:22,x:100,y:0,w:14.4,h:14.4},{id:3,type:'barrier',x:10,y:20,w:80,h:6,widthMm:2000,depthMm:150,angle:90}];
const copy=JSON.stringify(raw),data=environmentSnapshot(state,raw);assert.equal(data.symbols.length,3);assert.equal(environmentParts({...data,points:[]}).length,0,'Guards must not become doors');assert.equal(JSON.stringify(raw),copy,'Original 2D symbols unchanged');
const first=data.symbols[0];assert(Math.abs(first.x-(60-(-22+1.8))/40)<1e-8);assert(Math.abs(first.angle-Math.PI/2)<1e-8);
const batches=protectionBatches(data.symbols,templates);assert.equal(batches.length,3);const b=batches.find(p=>p.geometry===templates.barrier.geometry),size=new THREE.Vector3();new THREE.Box3().copy(b.geometry.boundingBox).applyMatrix4(b.matrices[0]).getSize(size);assert(Math.abs(size.x-.15)<1e-5);assert(Math.abs(size.z-2)<1e-5);assert(Math.abs(size.y-.283)<1e-5);
assert.equal(protectionBatches([...data.symbols,...data.symbols],templates).length,3,'Repeated guards use shared draw batches');
console.log('PASS: supplied U/UAKS, UZ/UAKZ and barrier GLBs; upright orientation, floor seating, all triangles preserved, rotated attached feet, barrier dimensions, unchanged 2D data and instanced drawing.');

const uzUp=new THREE.Vector3(-.270598050073,.707106781187,-.653281482438).normalize().transformDirection(protectionAxis('uakz'));assert(uzUp.distanceTo(new THREE.Vector3(0,1,0))<1e-9,'UZ base normal must be vertical');assert(Math.abs(protectionAxis('uakz').determinant()-1)<1e-9,'No mirroring');

const rawUp=new THREE.Vector3(-.270598050073,.707106781187,-.653281482438).normalize(),rawFront=new THREE.Vector3(-.103553390593,.653281482438,.75);rawFront.addScaledVector(rawUp,-rawFront.dot(rawUp)).normalize();const rawFace=new THREE.Vector3().crossVectors(rawUp,rawFront).normalize().transformDirection(protectionAxis('uakz'));assert(rawFace.distanceTo(new THREE.Vector3(0,0,1))<1e-9,'UAKZ front face must match UAKS, not its side stiffener');