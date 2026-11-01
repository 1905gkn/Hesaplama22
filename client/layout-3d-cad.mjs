import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
const cache=new Map();
export async function loadLayoutCad(racks){
 const names=new Set();for(const r of racks){if(r.system==='b2b'){names.add('b2bFrame');names.add('b2bBeam');}if(r.system==='mr')names.add('mrBeam');if(r.system==='mekik2'||r.system==='drive'){names.add('mekikPost');if(r.system==='mekik2')names.add('mekikBeam')}}
 return Object.fromEntries(await Promise.all([...names].map(async name=>{
  if(!cache.has(name))cache.set(name,(async()=>{
   const loader=new GLTFLoader(),draco=new DRACOLoader();draco.setDecoderPath('/draco/');draco.setDecoderConfig({type:'wasm'});loader.setDRACOLoader(draco);loader.setMeshoptDecoder(MeshoptDecoder);
   const paths={b2bFrame:'/b2b-ayak.glb',b2bBeam:'/b2b-travers.glb',mrBeam:'/mr-zs-travers.glb',mekikPost:'/mekik-front-ayak.glb',mekikBeam:'/mekik-front-travers.glb'};
   try{const gltf=await loader.loadAsync(paths[name]+'?v=layout445');return prepareCad(gltf.scene,name)}finally{draco.dispose()}
  })().catch(e=>{cache.delete(name);throw e}));return [name,await cache.get(name)];
 })));
}
export function prepareCad(scene,name){
 scene.updateMatrixWorld(true);const axis=name==='mrBeam'?new THREE.Matrix4().makeBasis(new THREE.Vector3(0,0,1),new THREE.Vector3(1,0,0),new THREE.Vector3(0,-1,0)):new THREE.Matrix4().makeRotationX(name.startsWith('b2b')?Math.PI/2:-Math.PI/2),source=[],names=[],finishes=[],profileBounds=new THREE.Box3();
 scene.traverse(mesh=>{if(!mesh.isMesh)return;const geometry=mesh.geometry.clone();geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(axis,mesh.matrixWorld));if(axis.determinant()<0&&geometry.index){const indices=geometry.index.array;for(let i=0;i<indices.length;i+=3){const v=indices[i+1];indices[i+1]=indices[i+2];indices[i+2]=v;}geometry.index.needsUpdate=true;}geometry.computeBoundingBox();if(name==='b2bBeam'&&!/KONNEKT/i.test(mesh.name))profileBounds.union(geometry.boundingBox);source.push(geometry);names.push(String(mesh.name).toLocaleUpperCase('tr-TR'));finishes.push(/DİAGONEL|DIAGONEL|ÇAĞRAZ|ÇAPRAZ/.test(String(mesh.name).toLocaleUpperCase('tr-TR'))?'galvanized':null)});
 const bounds=new THREE.Box3();source.forEach(g=>bounds.union(g.boundingBox));const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
 const originY=name==='b2bBeam'&&!profileBounds.isEmpty()?profileBounds.min.y:name==='mekikBeam'||name==='mrBeam'?bounds.max.y:bounds.min.y;
 source.forEach(g=>{g.translate(-center.x,-originY,-center.z);g.scale(.001,.001,.001);g.computeBoundingBox();g.computeBoundingSphere()});
 // Dispose parser materials/textures; prepared geometries are cached across viewers.
 const materials=new Set(),geometries=new Set();scene.traverse(m=>{if(m.isMesh){geometries.add(m.geometry);for(const mat of Array.isArray(m.material)?m.material:[m.material])materials.add(mat)}});materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());
 const bracketBounds=source.map((g,i)=>({box:g.boundingBox,name:names[i]})).filter(p=>p.name.includes('BRAKET'));const left=bracketBounds.filter(p=>(p.box.min.x+p.box.max.x)/2<0),right=bracketBounds.filter(p=>(p.box.min.x+p.box.max.x)/2>0);const railSeats=name==='mekikBeam'&&left.length&&right.length?[Math.max(...left.map(p=>p.box.max.x)),Math.min(...right.map(p=>p.box.min.x))]:null;
 return {geometries:source,finishes,railSeats,referenceHeight:profileBounds.isEmpty()?size.y/1000:profileBounds.getSize(new THREE.Vector3()).y/1000,height:size.y/1000,depth:size.z/1000,width:size.x/1000};
}
export function cadPlacements(r,templates){
 const out=[],add=(name,x,y,z,sx,sy,sz)=>out.push({name,x,y,z,sx,sy,sz,color:name==='mekikBeam'||name==='b2bBeam'||name==='mrBeam'?r.beamColor:r.footColor});
 if(r.system==='b2b'){
  const t=templates.b2bFrame,fd=Math.min(r.frameDepth,(r.depth-r.rowGap*(r.rows-1))/r.rows),pitch=r.rows===2?r.depth-fd:0;
  for(let row=0;row<r.rows;row++)for(const side of [-1,1]){const h=Number(r.frameHeights[row]?.[side<0?'left':'right'])/1000||r.height;add('b2bFrame',side*(r.width-r.foot)/2,0,(row-(r.rows-1)/2)*pitch,r.foot/.09,h/t.height,fd/t.depth)}
  for(let row=0;row<r.rows;row++)for(let i=0;i<r.floors.length;i++){const y=r.beamYs[i];if(y===null||(r.tunnelHeight>0&&r.floors[i]<=r.tunnelHeight))continue;for(const side of [-1,1]){add('b2bBeam',0,y,(row-(r.rows-1)/2)*pitch+side*((fd-r.foot)/2+.04+(templates.b2bBeam?.depth||.063)/2-.004),(r.width-2*r.foot)/2.7,r.beam/(templates.b2bBeam?.referenceHeight||.12),1);out.at(-1).ry=side<0?Math.PI:0;}}
 }else if(r.system==='mr'){
  const t=templates.mrBeam,pitch=(r.width-r.foot)/r.modules;for(let m=0;m<r.modules;m++)for(const y of r.floors)for(const side of [-1,1]){add('mrBeam',-r.width/2+r.foot/2+(m+.5)*pitch,y,side*((r.depth-r.foot)/2+.03+t.depth/2-.004),(pitch-r.foot)/t.width,r.beam/t.height,1);out.at(-1).ry=side<0?Math.PI:0;}
 }else if(r.system==='mekik2'||r.system==='drive'){
  const t=templates.mekikPost,pitch=(r.width-r.foot)/r.bays,stations=r.footZ.length?r.footZ:[0,r.depth];
  for(let lane=0;lane<=r.bays;lane++)for(const zz of [...new Set(stations)])add('mekikPost',-r.width/2+r.foot/2+lane*pitch,0,Math.max(r.foot/2,Math.min(r.depth-r.foot/2,zz))-r.depth/2,r.foot/.1,r.height/t.height,1);
  if(r.system==='mekik2')for(let lane=0;lane<r.bays;lane++)for(const y of r.floors)for(const zz of [...new Set(stations)])add('mekikBeam',-r.width/2+r.foot/2+(lane+.5)*pitch,y,Math.max(.05,Math.min(r.depth-.05,zz))-r.depth/2,pitch/1.45,1,1);
 }
 return out;
}
