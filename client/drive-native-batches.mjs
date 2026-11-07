import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {cadFacingParts} from './cad-facing-batches.mjs';
import {createPreparationBudget} from './layout-3d-budget.mjs';

const templates=new WeakMap(),facingParts=new WeakMap(),postGeometries=new WeakSet();
export const isDrivePaintedPost=name=>/HR[_\s-]*\d+[_\s-]*AYAK/i.test(name);

// Preserve every triangle and the two native finishes; merge the immutable
// source assembly once, instead of cloning scores of fasteners for every foot.
export async function prepareDriveNativePost(source){
 if(templates.has(source))return templates.get(source);
 const promise=(async()=>{
  source.updateMatrixWorld(true);
  const groups=new Map(),budget=createPreparationBudget(),output=new THREE.Group();
  source.traverse(mesh=>{
   if(!mesh.isMesh)return;
   const geometry=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
   if(mesh.matrixWorld.determinant()<0){
    if(!geometry.index)geometry.setIndex(Array.from({length:geometry.attributes.position.count},(_,i)=>i));
    const a=geometry.index.array;for(let i=0;i<a.length;i+=3)[a[i+1],a[i+2]]=[a[i+2],a[i+1]];
   }
   const finish=isDrivePaintedPost(mesh.name)?'paint':'galvanized';
   const schema=Object.entries(geometry.attributes).map(([name,a])=>[name,a.itemSize,a.normalized,a.array.constructor.name]).sort();
   const key=JSON.stringify([finish,!!geometry.index,schema]);
   if(!groups.has(key))groups.set(key,{finish,geometries:[]});groups.get(key).geometries.push(geometry);
  });
  for(const {finish,geometries} of groups.values()){
   const merged=geometries.length>1?mergeGeometries(geometries,false):null;
   const exact=merged?[merged]:geometries;
   if(merged)geometries.forEach(g=>g.dispose());
   for(const geometry of exact){
    geometry.computeBoundingBox();geometry.computeBoundingSphere();
    const parts=await cadFacingParts(geometry,budget);
    for(const part of parts||[{geometry}]){
     const mesh=new THREE.Mesh(part.geometry);
     postGeometries.add(part.geometry);
     mesh.name=finish==='paint'?'HR_90_AYAK':'DRIVE_GALVANIZED';
     if(parts)facingParts.set(part.geometry,part);
     output.add(mesh);
    }
   }
   const pending=budget.checkpoint();if(pending)await pending;
  }
  return output;
 })();templates.set(source,promise);
 try{return await promise;}catch(error){templates.delete(source);throw error;}
}

// Orthographic views use parallel rays. A camera-position test would be wrong
// for wide assemblies, so bound the normal cone against the view direction.
export function drivePartFacesDirection(part,towardsCamera){
 if(!part.axis)return true;
 const length=towardsCamera.length(),along=towardsCamera.dot(part.axis);
 if(!length||along>=length*part.cosine)return true;
 const maxDot=along*part.cosine+Math.sqrt(Math.max(0,length*length-along*along))*part.sine;
 return maxDot>=-1e-7;
}
export function createDriveNativeFacing(root){
 const entries=[],groups=new Map(),direction=new THREE.Vector3(),localDirection=new THREE.Vector3(),last=new THREE.Vector3(Infinity,Infinity,Infinity);
 root.updateMatrixWorld(true);
 const rootInverse=root.matrixWorld.clone().invert();
 root.traverse(mesh=>{
  if(!mesh.isMesh||!postGeometries.has(mesh.geometry)||mesh.matrixWorld.determinant()<=0)return;
  const key=mesh.geometry.uuid+':'+mesh.material.uuid;
  if(!groups.has(key))groups.set(key,{geometry:mesh.geometry,material:mesh.material,name:mesh.name,matrices:[],inverse:[]});
  const group=groups.get(key);group.matrices.push(new THREE.Matrix4().multiplyMatrices(rootInverse,mesh.matrixWorld));group.inverse.push(mesh.matrixWorld.clone().invert());mesh.visible=false;
 });
 for(const group of groups.values()){
  const mesh=new THREE.InstancedMesh(group.geometry,group.material,group.matrices.length);
  for(let i=0;i<group.matrices.length;i++)mesh.instanceMatrix.array.set(group.matrices[i].elements,i*16);
  mesh.name=group.name;mesh.computeBoundingBox();mesh.computeBoundingSphere();root.add(mesh);
  entries.push({...group,mesh,part:group.material.side===THREE.FrontSide?facingParts.get(group.geometry):null,previous:null});
 }
 return {update(camera){
  camera.getWorldDirection(direction).negate();if(last.equals(direction))return;last.copy(direction);
  for(const entry of entries){
   const {mesh,part,inverse,matrices,previous}=entry;if(!part)continue;
   const visible=[];for(let i=0;i<inverse.length;i++)if(drivePartFacesDirection(part,localDirection.copy(direction).transformDirection(inverse[i])))visible.push(i);
   if(previous&&previous.length===visible.length&&previous.every((v,i)=>v===visible[i]))continue;
   for(let i=0;i<visible.length;i++)mesh.instanceMatrix.array.set(matrices[visible[i]].elements,i*16);
   mesh.count=visible.length;mesh.instanceMatrix.needsUpdate=true;entry.previous=visible;
  }
 },stats(){return {parts:entries.length,fullTriangles:entries.reduce((n,e)=>n+(e.geometry.index?.count??e.geometry.attributes.position.count)/3*e.matrices.length,0),drawnTriangles:entries.reduce((n,e)=>n+(e.geometry.index?.count??e.geometry.attributes.position.count)/3*e.mesh.count,0)};}};
}
