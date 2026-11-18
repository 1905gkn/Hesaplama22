import assert from 'node:assert/strict';import * as THREE from 'three';import fs from 'node:fs';import {build} from 'esbuild';
import {GALVANIZED_COLOR593,isGalvanizedColor593,fixedGalvanizedMaterial593,stabilizeGalvanizedObject593} from '../client/galvanized-material-v593.mjs';
import {transformViewerSource593} from './galvanized-finish-v593.mjs';
import {spatializeInstances} from '../client/layout-3d-preparation.mjs';
for(const color of [0xaeb8bd,0xa8b0b3,0xb8c0bd,0xa7b0ab,'#b8c3c5','#bbc3c6'])assert(isGalvanizedColor593(color));
for(const color of [0x005078,0xe5bd00,0xe25318,0xd6b47b,0xf3f6f4])assert(!isGalvanizedColor593(color));
const root=new THREE.Group(),g=new THREE.BoxGeometry(1,2,3),paint=new THREE.MeshStandardMaterial({color:0x005078}),galv=new THREE.MeshStandardMaterial({color:0xaeb8bd}),unknown=new THREE.MeshStandardMaterial({color:0xffffff});
const painted=new THREE.Mesh(g,paint),galvanized=new THREE.Mesh(g,galv),tray=new THREE.Mesh(g,unknown);tray.name='MR Toplama Tava 18-1';tray.position.set(3,4,5);root.add(painted,galvanized,tray);
const positions=g.attributes.position.array.slice(),at=tray.position.clone();stabilizeGalvanizedObject593(root);
assert.equal(painted.material,paint);assert.equal(galvanized.material.isMeshBasicMaterial,true);assert.equal(tray.material.color.getHex(),GALVANIZED_COLOR593);assert.equal(tray.material.toneMapped,false);assert.equal(tray.material.fog,false);assert.deepEqual(g.attributes.position.array,positions);assert(tray.position.equals(at));assert.equal(galv.color.getHex(),GALVANIZED_COLOR593,'Shared CAD source material untouched');const saved=tray.material;stabilizeGalvanizedObject593(root);assert.equal(tray.material,saved);
const fixed=fixedGalvanizedMaterial593({side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1});assert.equal(fixed.side,THREE.DoubleSide);assert.equal(fixed.polygonOffsetFactor,-1);
const scene=new THREE.Scene(),instances=new THREE.InstancedMesh(g,fixed,20);for(let i=0;i<20;i++)instances.setMatrixAt(i,new THREE.Matrix4().makeTranslation(i<10?0:50,0,0));scene.add(instances);spatializeInstances(scene);assert.equal(instances.count,0);assert.equal(instances.children.length,2);assert.equal(instances.children.reduce((sum,m)=>sum+m.count,0),20);assert(instances.children.every(m=>m.material===fixed),'Unlit galvanizing keeps spatial culling and instancing');
for(const system of ['b2b','mr','drive-in','mekik-front','konsol']){
 const source=fs.readFileSync('client/'+system+'-viewer.entry.js','utf8'),changed=transformViewerSource593(source,system);assert.equal(transformViewerSource593(changed,system),changed);
 if(system==='mr')assert(transformViewerSource593(source.replace('this.addDimensions(levelYs, totalWidth, depth, uprightHeight);','this.addDimensions(levelYs, totalWidth, footprintDepth, uprightHeight);'),system).includes('stabilizeGalvanizedObject593(this.root);this.addDimensions'));
 await build({stdin:{contents:changed,resolveDir:process.cwd()+'/client'},bundle:true,write:false,target:'es2022',format:'iife',logLevel:'silent'});
}
const layout=fs.readFileSync('client/layout-3d.entry.js','utf8');assert(layout.includes('if(isGalvanizedColor593(params.color))return fixedGalvanizedMaterial593(params)'));
console.log('PASS five system viewers and layout: PGV uses unlit #aeb8bd, exposure/fog disabled, RAL materials untouched, source geometry/materials/positions preserved, conversion idempotent.');
