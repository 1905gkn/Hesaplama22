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
 // Keep exact cardinal planes apart from curved surfaces. A curved hole edge
 // must not enlarge the visibility cone of an entire flat upright face.
 const planes=directions.filter(d=>Math.abs(d.x)+Math.abs(d.y)+Math.abs(d.z)===1);
 const groups=[...directions,...planes].map(axis=>({axis,cosine:1,indices:[],box:new THREE.Box3()})),p=geometry.attributes.position,index=geometry.index,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3(),edge=new THREE.Vector3();
 const degenerate=[];
 for(let i=0;i<count;i+=3){
  const ia=index?index.getX(i):i,ib=index?index.getX(i+1):i+1,ic=index?index.getX(i+2):i+2;
  a.fromBufferAttribute(p,ia);b.fromBufferAttribute(p,ib);c.fromBufferAttribute(p,ic);n.subVectors(b,a).cross(edge.subVectors(c,a));
  if(n.lengthSq()===0)degenerate.push(ia,ib,ic);else{n.normalize();let best=0,dot=-Infinity;const cardinal=planes.findIndex(d=>n.equals(d));if(cardinal>=0){best=directions.length+cardinal;dot=1;}else for(let k=0;k<directions.length;k++){const d=n.dot(directions[k]);if(d>dot){dot=d;best=k;}}const g=groups[best];g.cosine=Math.min(g.cosine,dot);g.indices.push(ia,ib,ic);g.box.expandByPoint(a).expandByPoint(b).expandByPoint(c);}
  if((i%1536)===0){const pending=budget.checkpoint();if(pending)await pending;}
 }
 if(!geometry.boundingSphere)geometry.computeBoundingSphere();if(!geometry.boundingBox)geometry.computeBoundingBox();
 const parts=[];
 for(const group of [...groups,{indices:degenerate,axis:null,cosine:0,box:geometry.boundingBox,emptySurface:true}]){
  if(!group.indices.length)continue;
  const g=new THREE.BufferGeometry();for(const [name,attribute]of Object.entries(geometry.attributes))g.setAttribute(name,attribute);
  g.setIndex(group.indices);g.boundingBox=group.box?.clone()||null;g.boundingSphere=g.boundingBox&&!g.boundingBox.isEmpty()?g.boundingBox.getBoundingSphere(new THREE.Sphere()):geometry.boundingSphere.clone();
  // Zero-area faces remain in the source/validation data but cannot produce a
  // fragment. Never submit their vertices to the GPU, at any camera distance.
  if(group.emptySurface)g.setDrawRange(0,0);
  parts.push({geometry:g,axis:group.axis,cosine:group.cosine,sine:Math.sqrt(Math.max(0,1-group.cosine*group.cosine)),sphere:g.boundingSphere,box:g.boundingBox,sourceBox:geometry.boundingBox});
 }
 cache.set(geometry,parts);return parts;
}
export function mayFaceCamera(part,point){
 if(!part.axis)return true;
 if(part.sourceBox?.containsPoint(point))return true;
 if(part.box){
  // The normal-cone support function is convex over the bounding box. Testing
  // its eight corners is conservative and much tighter than a tall sphere.
  const {min,max}=part.box,{axis,cosine,sine}=part;
  for(let i=0;i<8;i++){const x=point.x-(i&1?max.x:min.x),y=point.y-(i&2?max.y:min.y),z=point.z-(i&4?max.z:min.z),along=x*axis.x+y*axis.y+z*axis.z;
   if(along>=0||along*cosine+Math.sqrt(Math.max(0,x*x+y*y+z*z-along*along))*sine>=-1e-5)return true;
  }
  return false;
 }
 const dx=point.x-part.sphere.center.x,dy=point.y-part.sphere.center.y,dz=point.z-part.sphere.center.z,length=Math.hypot(dx,dy,dz),along=dx*part.axis.x+dy*part.axis.y+dz*part.axis.z;
 if(length<=part.sphere.radius||along>=length*part.cosine)return true;
 const maximum=along*part.cosine+Math.sqrt(Math.max(0,length*length-along*along))*part.sine;
 return maximum+part.sphere.radius>=-1e-5;
}
export async function createFacingBatch(scene,geometry,material,matrices,budget){
 if(material.side!==THREE.FrontSide)return null;
 const parts=await cadFacingParts(geometry,budget,{threshold:geometry.userData.renderCopy?50000:100000});if(!parts)return null;
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
 },stats(){const drawn=meshes.flatMap(targets);return {batches:drawn.length,visible:drawn.filter(m=>m.count>0).length,triangles:drawn.reduce((sum,m)=>sum+Math.min(m.geometry.index.count,m.geometry.drawRange.count)/3*m.count,0),fullTriangles:(geometry.index?.count??geometry.attributes.position.count)/3*matrices.length};}};
}
