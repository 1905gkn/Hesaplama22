import * as THREE from 'three';

// Lossless render copy: compare the bits of every attribute, including normals.
// Contact-plane metadata continues to use the original, unmodified CAD meshes.
export function* compactCadVertexSteps(geometry,{threshold=100000}={}){
 const attributes=Object.entries(geometry.attributes),count=geometry.attributes.position?.count||0;
 if(count<threshold||Object.keys(geometry.morphAttributes).length||attributes.some(([,a])=>a.isInterleavedBufferAttribute||a.count!==count||a.array.BYTES_PER_ELEMENT!==4))return geometry;
 const streams=attributes.map(([,a])=>({words:new Uint32Array(a.array.buffer,a.array.byteOffset,a.array.byteLength/4),size:a.itemSize}));
 let capacity=1;while(capacity<count*1.5)capacity*=2;
 const table=new Uint32Array(capacity),remap=new Uint32Array(count),representatives=new Uint32Array(count),mask=capacity-1;let total=0;
 for(let i=0;i<count;i++){
  let hash=2166136261;
  for(const {words,size}of streams)for(let k=0;k<size;k++)hash=Math.imul(hash^words[i*size+k],16777619);
  let slot=hash&mask;
  for(;;){
   if(!table[slot]){table[slot]=i+1;remap[i]=total;representatives[total++]=i;break;}
   const candidate=table[slot]-1;
   if(streams.every(({words,size})=>{for(let k=0;k<size;k++)if(words[i*size+k]!==words[candidate*size+k])return false;return true;})){remap[i]=remap[candidate];break;}
   slot=(slot+1)&mask;
  }
  if((i&1023)===1023)yield;
 }
 if(total===count)return geometry;
 const output=new THREE.BufferGeometry();
 for(const [name,attribute]of attributes){
  const array=new attribute.array.constructor(total*attribute.itemSize);
  for(let i=0;i<total;i++){array.set(attribute.array.subarray(representatives[i]*attribute.itemSize,(representatives[i]+1)*attribute.itemSize),i*attribute.itemSize);if((i&2047)===2047)yield;}
  output.setAttribute(name,new THREE.BufferAttribute(array,attribute.itemSize,attribute.normalized));
 }
 const source=geometry.index?.array,indices=new (total<=65535?Uint16Array:Uint32Array)(geometry.index?geometry.index.count:count);
 for(let i=0;i<indices.length;i++){indices[i]=remap[source?source[i]:i];if((i&4095)===4095)yield;}
 output.setIndex(new THREE.BufferAttribute(indices,1));output.name=geometry.name;
 output.groups=geometry.groups.map(g=>({...g}));output.drawRange={...geometry.drawRange};output.boundingBox=geometry.boundingBox?.clone()||null;output.boundingSphere=geometry.boundingSphere?.clone()||null;
 output.userData={...geometry.userData,exactVertices:{before:count,after:total}};
 return output;
}
export function compactCadVertices(geometry,options){const iterator=compactCadVertexSteps(geometry,options);for(;;){const step=iterator.next();if(step.done)return step.value;}}
export async function compactCadVerticesAsync(geometry,budget,options){const iterator=compactCadVertexSteps(geometry,options);for(;;){const step=iterator.next();if(step.done)return step.value;const pending=budget.checkpoint();if(pending)await pending;}}
