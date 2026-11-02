import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const cadCache=new WeakMap();
// Merge only geometries drawn with the same finish and identical attribute layout.
// Original CAD meshes remain intact for seating/contact metadata and validation.
export function cadRenderParts(template){
 if(cadCache.has(template))return cadCache.get(template);
 const groups=new Map();
 for(const [i,geometry] of template.geometries.entries()){
  const finish=template.finishes?.[i]||'paint';
  const attributes=Object.entries(geometry.attributes).sort(([a],[b])=>a.localeCompare(b)).map(([name,a])=>[name,a.itemSize,a.normalized,a.array.constructor.name]);
  const key=JSON.stringify([finish,!!geometry.index,attributes,Object.keys(geometry.morphAttributes)]);
  if(!groups.has(key))groups.set(key,{finish,geometries:[]});groups.get(key).geometries.push(geometry);
 }
 const parts=[];
 for(const {finish,geometries} of groups.values()){
  // Morph targets are not used by static CAD. Preserve them if a future asset has any.
  const merged=geometries.length>1&&!Object.keys(geometries[0].morphAttributes).length?mergeGeometries(geometries,false):null;
  if(merged){merged.computeBoundingBox();merged.computeBoundingSphere();parts.push({geometry:merged,finish});}
  else for(const geometry of geometries)parts.push({geometry,finish});
 }
 cadCache.set(template,parts);return parts;
}

// All transforms are baked once when a viewer is mounted, never on camera movement.
export function nativeRenderBatches(racks,byRack){
 const groups=new Map(),parent=new THREE.Object3D(),local=new THREE.Matrix4();let sourceMeshes=0;
 for(const rack of racks){
  parent.position.set(rack.x,0,rack.z);parent.rotation.set(0,rack.angle,0);parent.updateMatrix();
  for(const part of byRack.get(String(rack.id))||[]){
   sourceMeshes++;
   const roughness=rack.system==='konsol'?Math.max(.42,part.roughness??.42):.42;
   const metalness=rack.system==='konsol'?(part.load?Math.min(.25,part.metalness??.25):.4):rack.system==='mr'?.4:.48;
   const color=new THREE.Color(part.color).getHex();
   const key=JSON.stringify([part.geometry.uuid,color,roughness,metalness,!!part.load]);
   if(!groups.has(key))groups.set(key,{geometry:part.geometry,color,roughness,metalness,load:!!part.load,name:part.name,matrices:[]});
   const group=groups.get(key);
   if(part.matrices){for(const values of part.matrices){local.fromArray(values);group.matrices.push(new THREE.Matrix4().multiplyMatrices(parent.matrix,local));}}
   else group.matrices.push(parent.matrix.clone());
  }
 }
 return {batches:[...groups.values()].filter(g=>g.matrices.length),sourceMeshes};
}