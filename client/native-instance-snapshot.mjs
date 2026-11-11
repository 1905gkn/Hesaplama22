import * as THREE from 'three';
// Preserve exact CAD attributes; repeated instances keep transforms, not baked copies.
export function nativeInstanceSnapshot(root){
 root.updateMatrixWorld(true);const geometries=new Map(),parts=new Map(),flip=new THREE.Matrix4().makeScale(-1,1,1);
 root.traverse(m=>{if(!m.isMesh)return;const reflected=m.matrixWorld.determinant()<0,key=m.geometry.uuid+':'+reflected;let g=geometries.get(key);
 if(!g){g=m.geometry.clone();g.scale(.001,.001,.001);if(reflected){g.applyMatrix4(flip);if(!g.index)g.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));const ix=g.index.array;for(let i=0;i<ix.length;i+=3)[ix[i+1],ix[i+2]]=[ix[i+2],ix[i+1]];}g.computeBoundingBox();g.computeBoundingSphere();geometries.set(key,g);}
 const mat=Array.isArray(m.material)?m.material[0]:m.material,color=mat?.color?.getHex?.()??0xaeb8bd,roughness=mat?.roughness??.42,metalness=mat?.metalness??.4,groupKey=key+':'+color+':'+roughness+':'+metalness;
 if(!parts.has(groupKey))parts.set(groupKey,{geometry:g,color,roughness,metalness,name:m.name||'MR kayıtlı parça',matrices:[]});
 const matrix=m.matrixWorld.clone();if(reflected)matrix.multiply(flip);matrix.elements[12]*=.001;matrix.elements[13]*=.001;matrix.elements[14]*=.001;parts.get(groupKey).matrices.push(matrix.toArray());
 });return [...parts.values()];
}
