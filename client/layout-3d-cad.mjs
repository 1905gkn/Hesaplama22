import {b2bFrameLayout,b2bBeamMountZ} from './layout-3d-b2b-placement.mjs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
const cache=new Map();
export async function loadLayoutCad(racks){
 const names=new Set();for(const r of racks){if(r.system==='b2b'){names.add('b2bFrame');names.add('b2bBeam');}if(r.system==='mr')names.add('mrBeam');if(r.system==='mekik2'){names.add('mekikPost');names.add('mekikBeam')}if(r.system==='drive'){names.add('drivePost');names.add('b2bBeam')}}
 return Object.fromEntries(await Promise.all([...names].map(async name=>{
  if(!cache.has(name))cache.set(name,(async()=>{
   const loader=new GLTFLoader(),draco=new DRACOLoader();draco.setDecoderPath('/draco/');draco.setDecoderConfig({type:'wasm'});loader.setDRACOLoader(draco);loader.setMeshoptDecoder(MeshoptDecoder);
   const paths={b2bFrame:'/b2b-ayak.glb',b2bBeam:'/b2b-travers.glb',mrBeam:'/mr-zs-travers.glb',drivePost:'/drive-in/drive-in-ayak-top.glb',mekikPost:'/mekik-front-ayak.glb',mekikBeam:'/mekik-front-travers.glb'};
   try{const gltf=await loader.loadAsync(paths[name]+'?v=layout445');return prepareCad(gltf.scene,name)}finally{draco.dispose()}
  })().catch(e=>{cache.delete(name);throw e}));return [name,await cache.get(name)];
 })));
}
export function cadPlanarFaces(g,axis){const p=g.attributes.position,ix=g.index,planes=new Map(),v=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];for(let i=0;i<(ix?ix.count:p.count);i+=3){v.forEach((q,n)=>q.fromBufferAttribute(p,ix?ix.getX(i+n):i+n));if(Math.max(...v.map(q=>q[axis]))-Math.min(...v.map(q=>q[axis]))>.00001)continue;const area=new THREE.Vector3().subVectors(v[1],v[0]).cross(new THREE.Vector3().subVectors(v[2],v[0])).length()/2;if(area<1e-10)continue;const key=(Math.round(v[0][axis]*100000)/100000).toFixed(5),f=planes.get(key)||{at:Number(key),area:0,center:new THREE.Vector3(),min:new THREE.Vector3(Infinity,Infinity,Infinity),max:new THREE.Vector3(-Infinity,-Infinity,-Infinity)};f.area+=area;for(const q of v){f.center.addScaledVector(q,area/3);f.min.min(q);f.max.max(q)}planes.set(key,f);}return [...planes.values()].map(f=>({...f,center:f.center.divideScalar(f.area)})).sort((a,b)=>b.area-a.area);}
export function deepBeamScale(r,post,beam){const pitch=(r.width-r.foot)/r.bays,bodyWidth=(post?.bodyWidthX||.1)*(r.system==='drive'?r.foot/(post?.width||.141):r.foot/.1);return (pitch-bodyWidth)/(2*(beam?.mountHalfSpan||(r.system==='drive'?1.35:.675)));}
export function prepareCad(scene,name){
 scene.updateMatrixWorld(true);const axis=name==='mrBeam'?new THREE.Matrix4().makeBasis(new THREE.Vector3(0,0,1),new THREE.Vector3(1,0,0),new THREE.Vector3(0,-1,0)):new THREE.Matrix4().makeRotationX(name.startsWith('b2b')?Math.PI/2:-Math.PI/2),source=[],names=[],finishes=[],profileBounds=new THREE.Box3();
 if(name==='drivePost')axis.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
 scene.traverse(mesh=>{if(!mesh.isMesh)return;const geometry=mesh.geometry.clone();geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(axis,mesh.matrixWorld));if(axis.determinant()<0&&geometry.index){const indices=geometry.index.array;for(let i=0;i<indices.length;i+=3){const v=indices[i+1];indices[i+1]=indices[i+2];indices[i+2]=v;}geometry.index.needsUpdate=true;}geometry.computeBoundingBox();if(name==='b2bBeam'&&!/KONNEKT/i.test(mesh.name))profileBounds.union(geometry.boundingBox);source.push(geometry);names.push(String(mesh.name).toLocaleUpperCase('tr-TR'));finishes.push(/DİAGONEL|DIAGONEL|ÇAĞRAZ|ÇAPRAZ/.test(String(mesh.name).toLocaleUpperCase('tr-TR'))?'galvanized':null)});
 const bounds=new THREE.Box3();source.forEach(g=>bounds.union(g.boundingBox));const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
 const originY=name==='b2bBeam'&&!profileBounds.isEmpty()?profileBounds.min.y:name==='mekikBeam'||name==='mrBeam'?bounds.max.y:bounds.min.y;
 source.forEach(g=>{g.translate(-center.x,-originY,-center.z);g.scale(.001,.001,.001);g.computeBoundingBox();g.computeBoundingSphere()});
 // Dispose parser materials/textures; prepared geometries are cached across viewers.
 const materials=new Set(),geometries=new Set();scene.traverse(m=>{if(m.isMesh){geometries.add(m.geometry);for(const mat of Array.isArray(m.material)?m.material:[m.material])materials.add(mat)}});materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());
 const bracketBounds=source.map((g,i)=>({box:g.boundingBox,name:names[i]})).filter(p=>p.name.includes('BRAKET'));const left=bracketBounds.filter(p=>(p.box.min.x+p.box.max.x)/2<0),right=bracketBounds.filter(p=>(p.box.min.x+p.box.max.x)/2>0);const railSeats=name==='mekikBeam'&&left.length&&right.length?[left.reduce((n,p)=>n+(p.box.min.x+p.box.max.x)/2,0)/left.length,right.reduce((n,p)=>n+(p.box.min.x+p.box.max.x)/2,0)/right.length]:null;
 const uprightBoxes=['b2bFrame','drivePost','mekikPost'].includes(name)?source.map(g=>g.boundingBox).filter(b=>b.max.y-b.min.y>size.y*.0007).sort((a,b)=>(a.min.z+a.max.z)-(b.min.z+b.max.z)):[];const innerFaces=uprightBoxes.length>=2?{'-1':uprightBoxes[0].max.z,'1':uprightBoxes.at(-1).min.z}:null;
 const outerFaces=uprightBoxes.length>=2?{'-1':uprightBoxes[0].min.z,'1':uprightBoxes.at(-1).max.z}:null;
 const bracketGeometries=source.filter((g,i)=>names[i].includes('BRAKET')).sort((a,b)=>a.boundingBox.min.x-b.boundingBox.min.x);const railBearings=bracketGeometries.map(g=>{const faces=cadPlanarFaces(g,'y'),best=faces.filter(f=>f.area>=faces[0]?.area*.45).sort((a,b)=>b.at-a.at)[0];return best?{x:best.center.x,y:best.at,width:best.max.x-best.min.x}:null}).filter(Boolean);
 const connectors=source.filter((g,i)=>names[i].includes('KONNEKT'));const connectorMinZ=connectors.length?Math.min(...connectors.map(g=>g.boundingBox.min.z)):-size.z/2000;
const mountFace=connectors.flatMap(g=>cadPlanarFaces(g,'x')).sort((a,b)=>b.area-a.area)[0],mountHalfSpan=mountFace?Math.abs(mountFace.at):null;
 return {geometries:source,finishes,railSeats,railBearings,innerFaces,outerFaces,connectorMinZ,mountHalfSpan,topY:Math.max(...source.map(g=>g.boundingBox.max.y)),bodyWidthX:uprightBoxes[0]?uprightBoxes[0].max.x-uprightBoxes[0].min.x:null,postCenters:uprightBoxes.map(b=>(b.min.z+b.max.z)/2),postFrontFaces:uprightBoxes.map(b=>b.min.z),referenceHeight:profileBounds.isEmpty()?size.y/1000:profileBounds.getSize(new THREE.Vector3()).y/1000,height:size.y/1000,depth:size.z/1000,width:size.x/1000};
}
export function cadPlacements(r,templates){
 const out=[],add=(name,x,y,z,sx,sy,sz)=>out.push({name,x,y,z,sx,sy,sz,color:name==='mekikBeam'||name==='b2bBeam'||name==='mrBeam'?r.beamColor:r.footColor});
 if(r.system==='b2b'){
  const t=templates.b2bFrame,{depth:fd,centers}=b2bFrameLayout(r);
  for(let row=0;row<r.rows;row++)for(const side of [-1,1]){const h=Number(r.frameHeights[row]?.[side<0?'left':'right'])/1000||r.height;add('b2bFrame',side*(r.width-r.foot)/2,0,centers[row],r.foot/.09,h/t.height,fd/t.depth)}
  for(let row=0;row<r.rows;row++)for(let i=0;i<r.floors.length;i++){const y=r.beamYs[i];if(y===null||(r.tunnelHeight>0&&y<r.tunnelHeight))continue;for(const side of [-1,1]){add('b2bBeam',0,y,centers[row]+b2bBeamMountZ(r,t,templates.b2bBeam,side),(r.width-2*r.foot)/2.7,r.beam/(templates.b2bBeam?.referenceHeight||.12),1);out.at(-1).ry=side<0?Math.PI:0;}}
 }else if(r.system==='mr'){
  const t=templates.mrBeam,pitch=(r.width-r.foot)/r.modules;for(let m=0;m<r.modules;m++)for(const y of r.floors)for(const side of [-1,1]){add('mrBeam',-r.width/2+r.foot/2+(m+.5)*pitch,y,side*(r.depth/2-t.depth/2),(pitch-r.foot)/t.width,r.beam/t.height,1);out.at(-1).ry=side<0?Math.PI:0;}
 }else if(r.system==='mekik2'||r.system==='drive'){
  const postName=r.system==='drive'?'drivePost':'mekikPost',t=templates[postName],pitch=(r.width-r.foot)/r.bays,stations=r.footZ.length?r.footZ:[0,r.depth];
  if(r.system==='drive'){for(let lane=0;lane<=r.bays;lane++)for(const [start,end] of (r.footFrames.length?r.footFrames:[[0,r.depth]]))add(postName,-r.width/2+r.foot/2+lane*pitch,0,(start+end)/2-r.depth/2,r.foot/t.width,r.height/t.height,(end-start)/t.depth);}else for(let lane=0;lane<=r.bays;lane++)for(const zz of [...new Set(stations)])add(postName,-r.width/2+r.foot/2+lane*pitch,0,Math.max(r.foot/2,Math.min(r.depth-r.foot/2,zz))-r.depth/2,r.foot/.1,r.height/t.height,1);
  const postMounts=r.system==='drive'?(r.footFrames.length?r.footFrames:[[0,r.depth]]).flatMap(([start,end])=>(t.postCenters?.length?t.postCenters:[-t.depth/2,t.depth/2]).map(center=>(start+end)/2-r.depth/2+center*(end-start)/t.depth)):[...new Set(stations)].map(zz=>Math.max(r.foot/2,Math.min(r.depth-r.foot/2,zz))-r.depth/2+(t.postCenters?.[0]??.02));
  const beamName=r.system==='drive'?'b2bBeam':'mekikBeam',beam=templates[beamName],sy=r.system==='drive'?.14/(beam.referenceHeight||.12):1,bearingY=beam.railBearings?.[0]?.y??-.146,ys=r.system==='drive'?[r.height-(beam.topY??.18)*sy]:r.floors.map(y=>y-(r.railHeight||.17)-bearingY);
  for(let lane=0;lane<r.bays;lane++)for(const y of ys)for(const z of postMounts){add(beamName,-r.width/2+r.foot/2+(lane+.5)*pitch,y,z-.002,deepBeamScale(r,t,beam),sy,1);out.at(-1).ry=r.system==='drive'?0:Math.PI;}


 }
 return out;
}
