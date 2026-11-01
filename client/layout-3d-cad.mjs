import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
const cache=new Map();
export async function loadLayoutCad(racks){
 const names=new Set();for(const r of racks){if(r.system==='b2b')names.add('b2bFrame');if(r.system==='mekik2'||r.system==='drive'){names.add('mekikPost');if(r.system==='mekik2')names.add('mekikBeam')}}
 return Object.fromEntries(await Promise.all([...names].map(async name=>{
  if(!cache.has(name))cache.set(name,(async()=>{
   const loader=new GLTFLoader(),draco=new DRACOLoader();draco.setDecoderPath('/draco/');draco.setDecoderConfig({type:'wasm'});loader.setDRACOLoader(draco);loader.setMeshoptDecoder(MeshoptDecoder);
   const paths={b2bFrame:'/b2b-ayak.glb',mekikPost:'/mekik-front-ayak.glb',mekikBeam:'/mekik-front-travers.glb'};
   try{const gltf=await loader.loadAsync(paths[name]+'?v=layout445');return prepareCad(gltf.scene,name)}finally{draco.dispose()}
  })().catch(e=>{cache.delete(name);throw e}));return [name,await cache.get(name)];
 })));
}
export function prepareCad(scene,name){
 scene.updateMatrixWorld(true);const axis=new THREE.Matrix4().makeRotationX(name==='b2bFrame'?Math.PI/2:-Math.PI/2),source=[],finishes=[];
 scene.traverse(mesh=>{if(!mesh.isMesh)return;const geometry=mesh.geometry.clone();geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(axis,mesh.matrixWorld));geometry.computeBoundingBox();source.push(geometry);finishes.push(/DİAGONEL|DIAGONEL|ÇAĞRAZ|ÇAPRAZ/.test(String(mesh.name).toLocaleUpperCase('tr-TR'))?'galvanized':null)});
 const bounds=new THREE.Box3();source.forEach(g=>bounds.union(g.boundingBox));const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
 const originY=name==='mekikBeam'?bounds.max.y:bounds.min.y;
 source.forEach(g=>{g.translate(-center.x,-originY,-center.z);g.scale(.001,.001,.001);g.computeBoundingBox();g.computeBoundingSphere()});
 // Dispose parser materials/textures; prepared geometries are cached across viewers.
 const materials=new Set(),geometries=new Set();scene.traverse(m=>{if(m.isMesh){geometries.add(m.geometry);for(const mat of Array.isArray(m.material)?m.material:[m.material])materials.add(mat)}});materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());
 return {geometries:source,finishes,height:size.y/1000,depth:size.z/1000,width:size.x/1000};
}
export function cadPlacements(r,templates){
 const out=[],add=(name,x,y,z,sx,sy,sz)=>out.push({name,x,y,z,sx,sy,sz,color:name==='mekikBeam'?r.beamColor:r.footColor});
 if(r.system==='b2b'){
  const t=templates.b2bFrame,fd=Math.min(r.frameDepth,(r.depth-r.rowGap*(r.rows-1))/r.rows),pitch=r.rows===2?r.depth-fd:0;
  for(let row=0;row<r.rows;row++)for(const side of [-1,1]){const h=Number(r.frameHeights[row]?.[side<0?'left':'right'])/1000||r.height;add('b2bFrame',side*(r.width-r.foot)/2,0,(row-(r.rows-1)/2)*pitch,r.foot/.09,h/t.height,fd/t.depth)}
 }else if(r.system==='mekik2'||r.system==='drive'){
  const t=templates.mekikPost,pitch=(r.width-r.foot)/r.bays,stations=r.footZ.length?r.footZ:[0,r.depth];
  for(let lane=0;lane<=r.bays;lane++)for(const zz of [...new Set(stations)])add('mekikPost',-r.width/2+r.foot/2+lane*pitch,0,Math.max(r.foot/2,Math.min(r.depth-r.foot/2,zz))-r.depth/2,r.foot/.1,r.height/t.height,1);
  if(r.system==='mekik2')for(let lane=0;lane<r.bays;lane++)for(const y of r.floors)for(const zz of [...new Set(stations)])add('mekikBeam',-r.width/2+r.foot/2+(lane+.5)*pitch,y,Math.max(.05,Math.min(r.depth-.05,zz))-r.depth/2,pitch/1.45,1,1);
 }
 return out;
}
