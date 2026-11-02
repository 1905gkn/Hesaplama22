import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
export const protectionTypes=['uaks','uakz','barrier'];
const paths={uaks:'/uaks-koruma.glb',uakz:'/uakz-koruma.glb',barrier:'/bariyer-koruma.glb'},cache=new Map();
export function protectionAxis(type){
 if(type!=='uakz')return new THREE.Matrix4().makeRotationX(Math.PI/2);
 // The supplied UZ asset has a compound export rotation. Its base normal is
 // (0.270598,-0.707107,0.653281); align the opposite normal with world up.
 const up=new THREE.Vector3(-.270598050073,.707106781187,-.653281482438).normalize();
 const front=new THREE.Vector3(-.103553390593,.653281482438,.75);front.addScaledVector(up,-front.dot(up)).normalize();
 const right=new THREE.Vector3().crossVectors(up,front).normalize();
 // Match the UAKS front face; keep the triangular stiffener behind the post.
 return new THREE.Matrix4().makeRotationY(-Math.PI/2).multiply(new THREE.Matrix4().makeBasis(right,up,front).transpose());
}
export function prepareProtectionCad(scene,type){
 scene.updateMatrixWorld(true);const axis=protectionAxis(type),parts=[];
 scene.traverse(mesh=>{if(!mesh.isMesh)return;const g=mesh.geometry.clone();g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(axis,mesh.matrixWorld));g.scale(.001,.001,.001);parts.push(g)});
 if(!parts.length)throw Error('Koruma modelinde çizilecek parça yok.');
 const bounds=new THREE.Box3();parts.forEach(g=>{g.computeBoundingBox();bounds.union(g.boundingBox)});const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
 parts.forEach(g=>g.translate(-center.x,-bounds.min.y,-center.z));const geometry=parts.length===1?parts[0]:mergeGeometries(parts,false);if(!geometry)throw Error('Koruma CAD parçaları birleştirilemedi.');if(parts.length>1)parts.forEach(g=>g.dispose());geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const originalGeometries=new Set(),materials=new Set();scene.traverse(m=>{if(m.isMesh){originalGeometries.add(m.geometry);for(const material of Array.isArray(m.material)?m.material:[m.material])if(material)materials.add(material)}});originalGeometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
 return {geometry,width:size.x,height:size.y,depth:size.z};
}
export async function loadProtectionCad(symbols=[]){
 return Object.fromEntries(await Promise.all([...new Set(symbols.filter(s=>protectionTypes.includes(s.type)).map(s=>s.type))].map(async type=>{if(!cache.has(type))cache.set(type,new GLTFLoader().loadAsync(paths[type]+'?v=464').then(g=>prepareProtectionCad(g.scene,type)).catch(e=>{cache.delete(type);throw e}));return [type,await cache.get(type)]})));
}
export function protectionBatches(symbols=[],templates={}){
 const groups=new Map(),dummy=new THREE.Object3D(),palette={'1007':'#e5bd00','1023':'#f2c500','2004':'#e25318','5010':'#005078',pgv:'#aeb8bd'};
 for(const s of symbols){const t=templates[s.type];if(!protectionTypes.includes(s.type)||!t)continue;const color=palette[String(s.ral||'1007').toLowerCase().replace('ral','').trim()]||'#e5bd00',key=s.type+':'+color;if(!groups.has(key))groups.set(key,{...t,color,matrices:[]});
  dummy.position.set(s.x,0,s.z);dummy.rotation.set(0,s.angle||0,0);dummy.scale.set(s.type==='barrier'?s.width/t.width:1,1,s.type==='barrier'?s.depth/t.depth:1);dummy.updateMatrix();groups.get(key).matrices.push(dummy.matrix.clone());
 }return [...groups.values()];
}