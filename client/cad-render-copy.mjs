import * as THREE from 'three';
const cache=new WeakMap();
// Render-only index copy. Original CAD positions, normals, contact planes and
// dimensions remain authoritative. This is independent of camera distance.
export async function prepareCadRenderCopy(template,budget){
 if(!['drivePost','mekikPost'].includes(template.cadKind))return template;
 if(cache.has(template))return cache.get(template);
 const pending=(async()=>{const {MeshoptSimplifier}=await import('./cad-render-simplifier.mjs');await MeshoptSimplifier.ready;const geometries=[];
 for(const source of template.geometries){
  const position=source.attributes.position,normal=source.attributes.normal,index=source.index;
  if(!index||index.count<300000||!normal||Object.keys(source.morphAttributes).length){geometries.push(source);continue;}
  source.computeBoundingBox();const {min,max}=source.boundingBox,locks=new Uint8Array(position.count);
  // Pin the envelope, preserving rack width/height/depth and profile extremes.
  for(let i=0;i<position.count;i++){const x=position.getX(i),y=position.getY(i),z=position.getZ(i);if(Math.abs(x-min.x)<1e-9||Math.abs(x-max.x)<1e-9||Math.abs(y-min.y)<1e-9||Math.abs(y-max.y)<1e-9||Math.abs(z-min.z)<1e-9||Math.abs(z-max.z)<1e-9)locks[i]=1;}
  const before=budget?.checkpoint();if(before)await before;
  const [indices,error]=MeshoptSimplifier.simplifyWithAttributes(new Uint32Array(index.array),position.array,3,normal.array,3,[.00001,.00001,.00001],locks,Math.floor(index.count*.1/3)*3,.00005,['Permissive','LockBorder','ErrorAbsolute']);
  if(!indices.length||error>.000050001||indices.length>=index.count*.98){geometries.push(source);continue;}
  const geometry=new THREE.BufferGeometry();for(const [name,attribute]of Object.entries(source.attributes))geometry.setAttribute(name,attribute);geometry.setIndex(new THREE.BufferAttribute(indices,1));geometry.boundingBox=source.boundingBox.clone();geometry.boundingSphere=source.boundingSphere?.clone()||null;geometry.userData={...source.userData,renderCopy:{beforeTriangles:index.count/3,afterTriangles:indices.length/3,errorMetres:error}};geometries.push(geometry);
  const after=budget?.checkpoint();if(after)await after;
 }
 return {...template,geometries};})();cache.set(template,pending);try{return await pending;}catch(error){cache.delete(template);throw error;}
}
