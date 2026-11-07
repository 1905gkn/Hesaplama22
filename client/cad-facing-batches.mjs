import * as THREE from 'three';
import {populateInstances} from './layout-3d-budget.mjs';
// Conservative object-space backface culling. All original triangles/attributes
// remain intact. Only batches proven entirely back-facing can be skipped.
const cache=new WeakMap(),directions=[];
for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)if(x||y||z)directions.push(new THREE.Vector3(x,y,z).normalize());
export async function cadFacingParts(geometry,budget,{threshold=100000}={}){
 const count=geometry.index?.count??geometry.attributes.position.count;
 if(count/3<threshold||geometry.morphAttributes.position?.length)return null;
 if(cache.has(geometry))return cache.get(geometry);
 const groups=directions.map(axis=>({axis,cosine:1,indices:[]})),p=geometry.attributes.position,index=geometry.index,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3(),edge=new THREE.Vector3();
 const degenerate=[];
 for(let i=0;i<count;i+=3){
  const ia=index?index.getX(i):i,ib=index?index.getX(i+1):i+1,ic=index?index.getX(i+2):i+2;
  a.fromBufferAttribute(p,ia);b.fromBufferAttribute(p,ib);c.fromBufferAttribute(p,ic);n.subVectors(b,a).cross(edge.subVectors(c,a));
  if(n.lengthSq()===0)degenerate.push(ia,ib,ic);else{n.normalize();let best=0,dot=-Infinity;for(let k=0;k<directions.length;k++){const d=n.dot(directions[k]);if(d>dot){dot=d;best=k;}}const g=groups[best];g.cosine=Math.min(g.cosine,dot);g.indices.push(ia,ib,ic);}
  if((i%1536)===0){const pending=budget.checkpoint();if(pending)await pending;}
 }
 if(!geometry.boundingSphere)geometry.computeBoundingSphere();
 const parts=[];
 for(const group of [...groups,{indices:degenerate,axis:null,cosine:0}]){
  if(!group.indices.length)continue;
  const g=new THREE.BufferGeometry();for(const [name,attribute]of Object.entries(geometry.attributes))g.setAttribute(name,attribute);
  g.setIndex(group.indices);g.boundingBox=geometry.boundingBox?.clone()||null;g.boundingSphere=geometry.boundingSphere.clone();
  parts.push({geometry:g,axis:group.axis,cosine:group.cosine,sine:Math.sqrt(Math.max(0,1-group.cosine*group.cosine)),sphere:g.boundingSphere});
 }
 cache.set(geometry,parts);return parts;
}
export function mayFaceCamera(part,point){
 if(!part.axis)return true;
 const dx=point.x-part.sphere.center.x,dy=point.y-part.sphere.center.y,dz=point.z-part.sphere.center.z,length=Math.hypot(dx,dy,dz),along=dx*part.axis.x+dy*part.axis.y+dz*part.axis.z;
 if(length<=part.sphere.radius||along>=length*part.cosine)return true;
 const maximum=along*part.cosine+Math.sqrt(Math.max(0,length*length-along*along))*part.sine;
 return maximum+part.sphere.radius>=-1e-5;
}
export async function createFacingBatch(scene,geometry,material,matrices,budget){
 if(material.side!==THREE.FrontSide)return null;
 const parts=await cadFacingParts(geometry,budget);if(!parts)return null;
 const inverse=matrices.map(m=>m.determinant()>0?m.clone().invert():null),cameraPoints=inverse.map(()=>new THREE.Vector3()),meshes=[];
 for(const part of parts){const mesh=new THREE.InstancedMesh(part.geometry,material,matrices.length);await populateInstances(mesh,matrices,budget);mesh.computeBoundingSphere();mesh.userData.cadFacing=true;scene.add(mesh);meshes.push(mesh);}
 const last=new THREE.Vector3(Infinity,Infinity,Infinity);
 const allIndices=matrices.map((_,i)=>i),previous=new WeakMap();
 const targets=mesh=>mesh.children.length?mesh.children:[mesh];
 return {update(camera){
  if(last.equals(camera))return;last.copy(camera);
  for(let i=0;i<inverse.length;i++)if(inverse[i])cameraPoints[i].copy(camera).applyMatrix4(inverse[i]);
  for(let k=0;k<parts.length;k++)for(const mesh of targets(meshes[k])){
   const source=mesh.userData.cadFacingSources||allIndices,visible=[];
   for(const i of source)if(!inverse[i]||mayFaceCamera(parts[k],cameraPoints[i]))visible.push(i);
   const before=previous.get(mesh);if(before&&before.length===visible.length&&before.every((i,j)=>i===visible[j]))continue;
   // Positions are immutable. Copy cached transforms only when the visibility
   // mask changes; never rebuild racks, products or layout on camera movement.
   for(let j=0;j<visible.length;j++)mesh.instanceMatrix.array.set(matrices[visible[j]].elements,j*16);
   mesh.count=visible.length;mesh.instanceMatrix.needsUpdate=true;previous.set(mesh,visible);
  }
 },stats(){const drawn=meshes.flatMap(targets);return {batches:drawn.length,visible:drawn.filter(m=>m.count>0).length,triangles:drawn.reduce((sum,m)=>sum+m.geometry.index.count/3*m.count,0),fullTriangles:(geometry.index?.count??geometry.attributes.position.count)/3*matrices.length};}};
}
