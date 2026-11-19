import * as T from 'three';
import {simplifyCad} from './cad-simplify-job.mjs';
import {compactCadVerticesAsync} from './cad-exact-vertices.mjs';
import {createPreparationBudget} from './layout-3d-budget.mjs';
const cache=new WeakMap();
// A coarse index is used only within the current screen-space error budget.
// Original CAD, contacts, positions and near-camera detail stay authoritative.
export function projectedCadError(error,scale,sphere,camera,viewportHeight){
 const m=camera.matrixWorldInverse.elements,c=sphere.center;
 const depth=-(m[2]*c.x+m[6]*c.y+m[10]*c.z+m[14])-sphere.radius;
 if(depth<=0)return Infinity;
 return error*scale*viewportHeight/(2*Math.tan(camera.fov*Math.PI/360)*depth);
}
export async function prepareScreenLod(source,budget=createPreparationBudget(),{tolerance=.003}={}){
 // Never collapse upright folded walls across holes. Its repaired lateral faces
 // are already minimal; front holes and section remain the CAD source.
 if(source.userData?.uprightProfile594)return null;
 let variants=cache.get(source);if(!variants){variants=new Map();cache.set(source,variants);}if(variants.has(tolerance))return variants.get(tolerance);
 const job=(async()=>{
  const p=source.attributes.position,n=source.attributes.normal,index=source.index;
  if(!p||!n||!index||index.count<384||p.isInterleavedBufferAttribute||n.isInterleavedBufferAttribute||Object.keys(source.morphAttributes).length)return null;
  if(!source.boundingBox)source.computeBoundingBox();const {min,max}=source.boundingBox,locks=new Uint8Array(p.count),pinned=new Set();
  // CAD splits vertices at normal seams. Weld positions for the topology solver
  // so those seams are not mistaken for thousands of open profile borders.
  // Actual open outlines stay locked, including openings in flat CAD plates.
  const representatives=new Map(),remap=new Uint32Array(p.count),solverIndices=new Uint32Array(index.count);
  for(let i=0;i<p.count;i++){const key=Math.round(p.getX(i)*1e6)+':'+Math.round(p.getY(i)*1e6)+':'+Math.round(p.getZ(i)*1e6);if(!representatives.has(key))representatives.set(key,i);remap[i]=representatives.get(key);if((i&1023)===1023){const pause=budget.checkpoint();if(pause)await pause;}}
  for(let i=0;i<index.count;i++)solverIndices[i]=remap[index.getX(i)];
  for(let i=0;i<p.count&&pinned.size<6;i++)for(const [axis,get]of [['x','getX'],['y','getY'],['z','getZ']])for(const edge of ['min','max']){const key=axis+edge;if(!pinned.has(key)&&Math.abs(p[get](i)-(edge==='min'?min:max)[axis])<1e-9){locks[remap[i]]=1;pinned.add(key);}}
  const [indices,error]=await simplifyCad([solverIndices,p.array,3,n.array,3,[.00001,.00001,.00001],locks,Math.floor(index.count*.01/3)*3,tolerance,['Permissive','LockBorder','ErrorAbsolute']]);
  if(!indices.length||indices.length>=index.count*.5||error>tolerance*1.000001)return null;
  const copy=new T.BufferGeometry();for(const [name,a]of Object.entries(source.attributes))copy.setAttribute(name,a);copy.setIndex(new T.BufferAttribute(indices,1));copy.boundingBox=source.boundingBox.clone();copy.boundingSphere=source.boundingSphere?.clone()||null;copy.userData={...source.userData,renderCopy:{screenLod:true,errorMetres:error}};
  // Restore face normals after welding; a representative from an adjacent face
  // must never supply a sideways normal to a broad painted CAD surface.
  const flat=copy.toNonIndexed();flat.computeVertexNormals();flat.boundingBox=copy.boundingBox.clone();flat.boundingSphere=copy.boundingSphere?.clone()||null;flat.userData={...copy.userData};copy.dispose();
  const geometry=await compactCadVerticesAsync(flat,budget,{threshold:0});if(geometry!==flat)flat.dispose();if(!geometry.index)geometry.setIndex(new T.BufferAttribute(Uint32Array.from({length:geometry.attributes.position.count},(_,i)=>i),1));return {geometry,error:error+Math.sqrt(3)*1e-6};
 })();variants.set(tolerance,job);try{return await job;}catch(error){variants.delete(tolerance);throw error;}
}
