import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
export function nativeInstanceSnapshot(root){
 root.updateMatrixWorld(true);const prototypes=new Map(),out=new Map(),flip=new THREE.Matrix4().makeScale(-1,1,1);
 const reverse=g=>{if(!g.index)g.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));const ix=g.index.array;for(let i=0;i<ix.length;i+=3)[ix[i+1],ix[i+2]]=[ix[i+2],ix[i+1]];return g;};
 for(const assembly of root.children){
  const inverse=assembly.matrixWorld.clone().invert(),groups=new Map(),reflected=assembly.matrixWorld.determinant()<0;
  assembly.traverse(m=>{if(!m.isMesh)return;const mat=Array.isArray(m.material)?m.material[0]:m.material,color=mat?.color?.getHex?.()??0xaeb8bd,roughness=mat?.roughness??.42,metalness=mat?.metalness??.4,key=[color,roughness,metalness].join(':');
   if(!groups.has(key))groups.set(key,{color,roughness,metalness,items:[]});const local=new THREE.Matrix4().multiplyMatrices(inverse,m.matrixWorld);groups.get(key).items.push({mesh:m,local});});
  for(const [finish,group]of groups){const signature=finish+':'+reflected+':'+group.items.map(p=>p.mesh.geometry.uuid+':'+p.local.elements.map(n=>Math.round(n*1e9)/1e9).join(',')).join('|');
   let parts=prototypes.get(signature);
   if(!parts){const schemaGroups=new Map();for(const item of group.items){const g=item.mesh.geometry,key=JSON.stringify([!!g.index,Object.entries(g.attributes).map(([k,a])=>[k,a.itemSize,a.normalized,a.array.constructor.name])]);if(!schemaGroups.has(key))schemaGroups.set(key,[]);schemaGroups.get(key).push(item);}
    parts=[];for(const items of schemaGroups.values()){const baked=items.map(({mesh,local})=>{const g=mesh.geometry.clone().applyMatrix4(local);if(local.determinant()<0)reverse(g);g.scale(.001,.001,.001);if(reflected){g.applyMatrix4(flip);reverse(g)}return g;});let geometry=baked.length===1?baked[0]:mergeGeometries(baked,false);if(geometry){if(baked.length>1)baked.forEach(g=>g.dispose());geometry.computeBoundingBox();geometry.computeBoundingSphere();parts.push({geometry,color:group.color,roughness:group.roughness,metalness:group.metalness,name:items.map(i=>i.mesh.name).join(' '),matrices:[]});}else throw Error('MR CAD attribute layout could not be preserved');}prototypes.set(signature,parts);parts.forEach(p=>out.set(p,p));}
   const matrix=assembly.matrixWorld.clone();if(reflected)matrix.multiply(flip);matrix.elements[12]*=.001;matrix.elements[13]*=.001;matrix.elements[14]*=.001;for(const p of parts)p.matrices.push(matrix.toArray());
  }
 }return [...out.values()];
}
