import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createForkliftFleet} from '../client/layout-3d-forklifts.mjs';
const scene=new THREE.Scene(),traffic={agents:[{x:0,z:0,angle:0,wheelTravel:0},{x:10,z:0,angle:Math.PI/2,wheelTravel:2},{x:20,z:0,angle:Math.PI,wheelTravel:-2}]};
const fleet=createForkliftFleet(scene,traffic);assert(fleet.group.children.length<=10);let triangles=0;
const first=new THREE.Matrix4(),wheel=fleet.group.children.find(m=>m.name==='forklift-wheels-rubber');wheel.getMatrixAt(0,first);traffic.agents[0].wheelTravel=1;fleet.update();const second=new THREE.Matrix4();wheel.getMatrixAt(0,second);assert.notDeepEqual(first.elements,second.elements,'tyres must rotate with travel');
const vertex=new THREE.Vector3(),instance=new THREE.Matrix4();
for(const mesh of fleet.group.children){triangles+=mesh.geometry.index?mesh.geometry.index.count/3*mesh.count:mesh.geometry.attributes.position.count/3*mesh.count;for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,instance);for(let p=0;p<mesh.geometry.attributes.position.count;p++){vertex.fromBufferAttribute(mesh.geometry.attributes.position,p).applyMatrix4(instance);assert(vertex.y>=-.001,'parts must stay above floor');}}}
assert(triangles<100000);const local=new THREE.Box3();for(const mesh of fleet.group.children){mesh.geometry.computeBoundingBox();if(!mesh.name.includes('wheels'))local.union(mesh.geometry.boundingBox);}assert(local.min.x>=-1.55&&local.max.x<=1.55&&local.min.z>=-.62&&local.max.z<=.62,'detailed vehicle exceeds navigation footprint');
traffic.agents[0].x=2;fleet.update();let disposed=0;const unique=new Set(fleet.group.children.map(m=>m.material));for(const m of unique)m.addEventListener('dispose',()=>disposed++);const batches=fleet.group.children.length;fleet.dispose();assert.equal(disposed,unique.size);assert.equal(scene.children.length,0);
console.log('PASS: realistic fleet footprint, rolling tyres, ground clearance, bounded batches/triangles, updates and complete disposal.',{triangles,batches});

