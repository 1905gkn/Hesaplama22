import {prepareUprightGeometry594} from './upright-side-holes-v594.mjs';
import * as THREE from 'three';
import {simplifyCad} from './cad-simplify-job.mjs';
const cache=new WeakMap();
// Render-only index copy, capped at 1 mm error in source-model metres.
// The envelope and original contact metadata remain unchanged. Original CAD positions, normals, contact planes and
// dimensions remain authoritative. This is independent of camera distance.
export async function prepareCadRenderCopy(template,budget){
 if(!['drivePost','mekikPost','mekikBeam','b2bBeam','b2bFrame','mrBeam','mrPost'].includes(template.cadKind))return template;
 if(cache.has(template))return cache.get(template);
 const pending=(async()=>{const geometries=[];
 for(let source of template.geometries){
  if(source.userData.uprightProfile594){geometries.push(source);continue;}
  if(source.userData.uprightCandidate594&&['drivePost','mekikPost','b2bFrame','mrPost'].includes(template.cadKind)){
   source.computeBoundingBox();const size=source.boundingBox.getSize(new THREE.Vector3());if(size.y>Math.max(size.x,size.z)*8){geometries.push(prepareUprightGeometry594(source));continue;}
  }
  const tolerance=template.cadKind==='mrPost'?.0005:['drivePost','mekikPost'].includes(template.cadKind)?.001:.0001;
  const position=source.attributes.position,normal=source.attributes.normal,index=source.index;
  if(!index||index.count<(template.cadKind==='mrPost'?100000:['drivePost','mekikPost'].includes(template.cadKind)?300000:3000)||!normal||Object.keys(source.morphAttributes).length){geometries.push(source);continue;}
  source.computeBoundingBox();const {min,max}=source.boundingBox,locks=new Uint8Array(position.count);
  // Pin six envelope representatives. Pinning every coplanar point would lock
  // the entire perforated profile face and defeat render-only simplification.
  const pinned=new Set();
  for(let i=0;i<position.count&&pinned.size<6;i++)for(const [axis,get]of [['x','getX'],['y','getY'],['z','getZ']])for(const edge of ['min','max']){const key=axis+edge;if(!pinned.has(key)&&Math.abs(position[get](i)-(edge==='min'?min:max)[axis])<1e-9){locks[i]=1;pinned.add(key);}}
  const before=budget?.checkpoint();if(before)await before;
  const [indices,error]=await simplifyCad([new Uint32Array(index.array),position.array,3,normal.array,3,[.00001,.00001,.00001],locks,Math.floor(index.count*.02/3)*3,tolerance,['Permissive','LockBorder','ErrorAbsolute']]);
  if(!indices.length||error>tolerance*1.000001||indices.length>=index.count*.98){geometries.push(source);continue;}
  const geometry=new THREE.BufferGeometry();for(const [name,attribute]of Object.entries(source.attributes))geometry.setAttribute(name,attribute);geometry.setIndex(new THREE.BufferAttribute(indices,1));geometry.boundingBox=source.boundingBox.clone();geometry.boundingSphere=source.boundingSphere?.clone()||null;geometry.userData={...source.userData,renderCopy:{beforeTriangles:index.count/3,afterTriangles:indices.length/3,errorMetres:error}};geometries.push(geometry);
  const after=budget?.checkpoint();if(after)await after;
 }
 return geometries.some((geometry,i)=>geometry!==template.geometries[i])?{...template,geometries}:template;})();cache.set(template,pending);try{return await pending;}catch(error){cache.delete(template);throw error;}
}
