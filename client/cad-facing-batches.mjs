import * as THREE from 'three';
import {populateInstances} from './layout-3d-budget.mjs';
import {prepareScreenLod} from './cad-screen-lod.mjs';
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
const planeOnlyCache=new WeakMap();
function planeOnlyParts(geometry,parts){
 if(planeOnlyCache.has(geometry))return planeOnlyCache.get(geometry);
 const exact=[],remaining=[];
 for(const p of parts){
  if(p.geometry.drawRange.count===0){exact.push(p);continue;}
  const a=p.axis;
  if(a&&p.cosine===1&&Math.abs(a.x)+Math.abs(a.y)+Math.abs(a.z)===1)exact.push(p);else remaining.push(p);
 }
 if(remaining.length){const g=new THREE.BufferGeometry();for(const [name,a]of Object.entries(geometry.attributes))g.setAttribute(name,a);
  const indices=new Uint32Array(remaining.reduce((sum,p)=>sum+p.geometry.index.count,0));let offset=0;
  for(const p of remaining){indices.set(p.geometry.index.array,offset);offset+=p.geometry.index.count;}
  g.setIndex(new THREE.BufferAttribute(indices,1));g.boundingBox=geometry.boundingBox.clone();g.boundingSphere=geometry.boundingSphere.clone();
  exact.push({geometry:g,axis:null,cosine:0,sine:1,box:g.boundingBox,sourceBox:geometry.boundingBox,sphere:g.boundingSphere});
 }
 planeOnlyCache.set(geometry,exact);return exact;
}
export function cadLodScale607(matrix,lod){
 if(!lod.errorAxes)return matrix.getMaxScaleOnAxis();
 return Math.max(...lod.errorAxes.map(axis=>{const j={x:0,y:4,z:8}[axis],e=matrix.elements;return Math.hypot(e[j],e[j+1],e[j+2]);}));
}
export async function createFacingBatch(scene,geometry,material,matrices,budget,options={}){
 if(material.side!==THREE.FrontSide)return null;
 // A modest CAD part repeated thousands of times can dominate GPU work too.
 // Judge the repeated draw cost, not only the size of one prototype.
 const triangles=(geometry.index?.count??geometry.attributes.position.count)/3;
 const repeatedHeavy=triangles>=128&&triangles*matrices.length>=500000;
 let parts=await cadFacingParts(geometry,budget,{threshold:repeatedHeavy?128:geometry.userData.renderCopy?50000:100000});if(!parts)return null;
 // Repeated medium prototypes favour a few exact plane batches over many normal cones.
 // Curved surfaces remain together and are always drawn, retaining every detail.
 if(repeatedHeavy&&triangles<50000)parts=planeOnlyParts(geometry,parts);
 const lod=options.screenLod&&!material.map&&!material.vertexColors&&(repeatedHeavy||triangles>=50000)?await prepareScreenLod(geometry,budget,{allowProtected:!!options.protectedLod}):null;
 const lods=lod?[lod]:[];
 if(options.screenLod&&!material.map&&!material.vertexColors&&(repeatedHeavy||triangles>=50000))for(const tolerance of [.02,.08]){const previous=lods.at(-1);if(previous&&previous.geometry.index.count<3000)break;const next=await prepareScreenLod(previous?.geometry||geometry,budget,{tolerance,allowProtected:!!options.protectedLod});if(next){const error=next.error+(previous?.error||0);lods.push({...next,error});}}
 const inverse=matrices.map(m=>m.determinant()>0?m.clone().invert():null),cameraPoints=inverse.map(()=>new THREE.Vector3()),meshes=[];
 if(!geometry.boundingBox)geometry.computeBoundingBox();
 const worldBounds=matrices.map(m=>geometry.boundingBox.clone().applyMatrix4(m)),inView=new Uint8Array(matrices.length),lastPlanes=new Float64Array(24).fill(Infinity);
 for(const part of parts){const mesh=new THREE.InstancedMesh(part.geometry,material,matrices.length);await populateInstances(mesh,matrices,budget);mesh.computeBoundingSphere();mesh.userData.cadFacing=true;scene.add(mesh);meshes.push(mesh);}
 const coarse=new Uint8Array(matrices.length),scales=lods.length?lods.map(lod=>matrices.map(m=>cadLodScale607(m,lod))):[];
 const coarseMeshes=[];let lastHeight,lastFov,lastAspect,lastError;for(const level of lods){const mesh=new THREE.InstancedMesh(level.geometry,material,matrices.length);await populateInstances(mesh,matrices,budget);mesh.userData.cadFacing=true;mesh.computeBoundingSphere();scene.add(mesh);mesh.count=0;coarseMeshes.push(mesh);}
 const last=new THREE.Vector3(Infinity,Infinity,Infinity);
 const allIndices=matrices.map((_,i)=>i),previous=new WeakMap();
 const visible=new Uint32Array(matrices.length);
 const targets=mesh=>mesh.children.length?mesh.children:[mesh];
 function applyVisibility(mesh,count){
  let indices=previous.get(mesh);
  if(!indices){
   indices=new Int32Array(mesh.instanceMatrix.count).fill(-1);
   previous.set(mesh,indices);
  }
  let first=count,last=-1;
  for(let i=0;i<count;i++){
   if(indices[i]===visible[i])continue;
   indices[i]=visible[i];
   mesh.instanceMatrix.array.set(matrices[visible[i]].elements,i*16);
   first=Math.min(first,i);
   last=i;
  }
  mesh.count=count;
  if(last>=0){
   const attribute=mesh.instanceMatrix;
   let start=first*16,end=(last+1)*16;
   for(const range of attribute.updateRanges){
    start=Math.min(start,range.start);
    end=Math.max(end,range.start+range.count);
   }
   attribute.clearUpdateRanges();
   attribute.addUpdateRange(start,end-start);
   mesh.instanceMatrix.needsUpdate=true;
  }
 }
 return {update(camera,frustum,view){
  for(let parent=scene;parent;parent=parent.parent)if(!parent.visible)return;
  let changed=!last.equals(camera);
  const height=view?.viewportHeight,fov=view?.camera.fov,aspect=view?.camera.aspect,error=view?.maxPixelError??.35;
  if(height!==lastHeight||fov!==lastFov||aspect!==lastAspect||error!==lastError){lastHeight=height;lastFov=fov;lastAspect=aspect;lastError=error;changed=true;}
  if(frustum)for(let i=0;i<6;i++){const p=frustum.planes[i];for(let j=0;j<4;j++){const k=i*4+j,value=j===0?p.normal.x:j===1?p.normal.y:j===2?p.normal.z:p.constant;if(value!==lastPlanes[k])changed=true;lastPlanes[k]=value;}}
  else if(lastPlanes[0]!==Infinity){lastPlanes.fill(Infinity);changed=true;}
  if(!changed)return;last.copy(camera);
  for(let i=0;i<worldBounds.length;i++)inView[i]=!frustum||frustum.intersectsBox(worldBounds[i]);
  coarse.fill(0);
  if(view&&lods.length){
   const m=view.camera.matrixWorldInverse.elements;
   const focalLength=height/(2*Math.tan(fov*Math.PI/360));
   for(let i=0;i<coarse.length;i++){
    if(!inView[i]||!inverse[i])continue;
    // Closest camera-space corner of the world bounds. Long rails no longer
    // look artificially close when their length runs across the screen.
    const {min,max}=worldBounds[i];
    const depth=-(m[2]*(m[2]>0?max.x:min.x)+m[6]*(m[6]>0?max.y:min.y)+m[10]*(m[10]>0?max.z:min.z)+m[14]);
    if(depth<=0)continue;
    const maxError=error*depth/focalLength;
    for(let level=lods.length-1;level>=0;level--)if(lods[level].error*scales[level][i]<=maxError){coarse[i]=level+1;break;}
   }
  }
  for(let i=0;i<inverse.length;i++)if(inView[i]&&inverse[i]&&!coarse[i])cameraPoints[i].copy(camera).applyMatrix4(inverse[i]);
  for(let k=0;k<parts.length;k++)for(const mesh of targets(meshes[k])){
   const source=mesh.userData.cadFacingSources||allIndices;
   let count=0;
   for(const i of source)if(inView[i]&&!coarse[i]&&(!inverse[i]||mayFaceCamera(parts[k],cameraPoints[i])))visible[count++]=i;
   applyVisibility(mesh,count);
  }
  for(let level=0;level<coarseMeshes.length;level++)for(const mesh of targets(coarseMeshes[level])){
   const source=mesh.userData.cadFacingSources||allIndices;
   let count=0;
   for(const i of source)if(inView[i]&&coarse[i]===level+1)visible[count++]=i;
   applyVisibility(mesh,count);
  }
 },stats(){const drawn=[...meshes,...coarseMeshes].flatMap(targets);return {batches:drawn.length,visible:drawn.filter(m=>m.count>0).length,coarseInstances:coarseMeshes.flatMap(targets).reduce((sum,m)=>sum+m.count,0),triangles:drawn.reduce((sum,m)=>sum+Math.min(m.geometry.index.count,m.geometry.drawRange.count)/3*m.count,0),fullTriangles:(geometry.index?.count??geometry.attributes.position.count)/3*matrices.length};}};
}
