import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Yield between independent templates without changing geometry or display resolution.
export const yieldPreparation=()=>new Promise(resolve=>setTimeout(resolve,0));
export async function prepareNativeBatches(byRack){
 const cache=new Map(),originals=new Set();
 for(const [id,parts] of byRack){
  if(!cache.has(parts)){
   const groups=new Map();
   for(const p of parts){
    const g=p.geometry;if(Object.keys(g.morphAttributes).length)continue;
    const schema=Object.entries(g.attributes).map(([k,a])=>[k,a.itemSize,a.normalized,a.array.constructor.name]);
    const key=JSON.stringify([p.color,p.roughness,p.metalness,!!p.load,!!g.index,schema]);
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);
   }
   const next=[],replaced=new Set();
   for(const group of groups.values()){
    if(group.length<2)continue;
    const baked=[];
    for(const p of group)for(const values of p.matrices||[new THREE.Matrix4().toArray()]){
     const matrix=new THREE.Matrix4().fromArray(values),g=p.geometry.clone().applyMatrix4(matrix);
     if(matrix.determinant()<0){if(!g.index)g.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));const a=g.index.array;for(let i=0;i<a.length;i+=3)[a[i+1],a[i+2]]=[a[i+2],a[i+1]];}
     baked.push(g);
    }
    const merged=mergeGeometries(baked,false);baked.forEach(g=>g.dispose());
    if(merged){merged.computeBoundingBox();merged.computeBoundingSphere();const {matrices,...first}=group[0];next.push({...first,geometry:merged});for(const p of group){replaced.add(p);originals.add(p.geometry);}}
    await yieldPreparation();
   }
   cache.set(parts,[...parts.filter(p=>!replaced.has(p)),...next]);
  }
  byRack.set(id,cache.get(parts));
 }
 const kept=new Set([...byRack.values()].flatMap(ps=>ps.map(p=>p.geometry)));for(const g of originals)if(!kept.has(g))g.dispose();
 return byRack;
}

// WebGL frustum culling works on whole instance groups. Spatial groups prevent a
// single visible rack from forcing every distant rack in that group to be drawn.
export function spatializeInstances(scene,cell=20){
 const targets=[];scene.traverse(m=>{if(m.isInstancedMesh&&m.count>=8&&!m.userData.environmentKind&&(m.material.isMeshStandardMaterial||m.material.isMeshLambertMaterial))targets.push(m)});
 const matrix=new THREE.Matrix4(),center=new THREE.Vector3();
 for(const mesh of targets){
  const cells=new Map();mesh.geometry.computeBoundingSphere();
  for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);center.copy(mesh.geometry.boundingSphere.center).applyMatrix4(matrix);const key=Math.floor(center.x/cell)+':'+Math.floor(center.z/cell);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(i)}
  if(cells.size<2)continue;
  // Keep original mesh as a visibility/disposal parent (load and wall toggles).
  for(const indices of cells.values()){
   const child=new THREE.InstancedMesh(mesh.geometry,mesh.material,indices.length);
   indices.forEach((i,j)=>{mesh.getMatrixAt(i,matrix);child.setMatrixAt(j,matrix);if(mesh.instanceColor){mesh.getColorAt(i,center);child.setColorAt(j,center)}});
   child.computeBoundingSphere();child.computeBoundingBox();child.name=mesh.name;mesh.add(child);
  }
  mesh.count=0;mesh.frustumCulled=false;
 }
}

