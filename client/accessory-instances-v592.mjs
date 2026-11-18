import * as THREE from 'three';
// Repeated panels keep one exact CAD mesh plus translations. Do not merge all
// eighteen picking levels into another enormous vertex buffer.
export function instanceRepeatedAccessories592(parts){
 const candidates=new Map();for(const p of parts){if(p.renderSystem!=='b2b'||!p.sourceKey||p.matrices)continue;const key=JSON.stringify([p.sourceKey,p.color,p.roughness,p.metalness]);if(!candidates.has(key))candidates.set(key,[]);candidates.get(key).push(p);}
 const replacements=new Map(),removed=new Set();
 for(const group of candidates.values()){
  if(group.length<2)continue;const first=group[0];first.geometry.computeBoundingBox();const size=first.geometry.boundingBox.getSize(new THREE.Vector3());
  // A source key encodes CAD identity and linear transform; verify envelopes too.
  const same=group.filter(p=>{p.geometry.computeBoundingBox();return p.geometry.boundingBox.getSize(new THREE.Vector3()).distanceTo(size)<.00002;});if(same.length<2)continue;
  const positions=same.map(p=>p.geometry.boundingBox.min.clone()),geometry=first.geometry;
  geometry.translate(-positions[0].x,-positions[0].y,-positions[0].z);geometry.computeBoundingBox();geometry.computeBoundingSphere();
  replacements.set(first,{...first,geometry,matrices:positions.map(p=>new THREE.Matrix4().makeTranslation(p.x,p.y,p.z).toArray())});
  for(const p of same){removed.add(p);if(p!==first)p.geometry.dispose();}
 }
 return parts.flatMap(p=>replacements.has(p)?[replacements.get(p)]:removed.has(p)?[]:[p]);
}
