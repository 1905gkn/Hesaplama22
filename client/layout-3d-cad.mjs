import {consoleBearing608} from './drive-console-seat-v608.mjs';
import {faceMekikCadToPlan} from './mekik-entry-facing.mjs';
import {classifyDepthPosts605} from './inner-post-v605.mjs';
import {planeHoles597,repeatingHoles597,connectorPhase597} from './hook-hole-joint-v597.mjs';
import {flatConnectorGeometry596} from './connector-contact-v596.mjs';
import {isSharedDepthMember} from './depth-shared-support.mjs';
import {upgradeMekikStepped} from './mekik-stepped.mjs';
import {b2bFrameLayout,b2bBeamMountZ} from './layout-3d-b2b-placement.mjs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
const cache=new Map();let sharedLoader;
function cadLoader(){
 if(!sharedLoader){const draco=new DRACOLoader();draco.setDecoderPath('/draco/');draco.setDecoderConfig({type:'wasm'});draco.setWorkerLimit(2);sharedLoader=new GLTFLoader();sharedLoader.setDRACOLoader(draco);sharedLoader.setMeshoptDecoder(MeshoptDecoder);}
 return sharedLoader;
}
export async function loadLayoutCad(racks){
 const names=new Set();for(const r of racks){if(r.system==='b2b'){names.add('b2bFrame');names.add('b2bBeam');}if(r.system==='mr')names.add('mrBeam');if(r.system==='mekik2'){names.add('mekikPost');names.add('mekikBeam')}if(r.system==='drive'){names.add('drivePost');names.add('b2bBeam');names.add('driveConsole');names.add('driveRail')}}
 return Object.fromEntries(await Promise.all([...names].map(async name=>{
  if(!cache.has(name))cache.set(name,(async()=>{
   const loader=cadLoader();
   const paths={b2bFrame:'/b2b-ayak.glb',b2bBeam:'/b2b-travers.glb',mrBeam:'/mr-zs-travers.glb',drivePost:'/drive-in/drive-in-ayak-top.glb',driveConsole:'/drive-in/drive-in-konsol.glb',driveRail:'/drive-in/drive-in-ray.glb',mekikPost:'/layout-mekik-post.glb',mekikBeam:'/mekik-front-travers.glb'};
   const gltf=await loader.loadAsync(paths[name]+'?v=layout445');return prepareCad(gltf.scene,name);
  })().catch(e=>{cache.delete(name);throw e}));return [name,await cache.get(name)];
 })));
}
// Scan CAD contact planes without allocating vectors/arrays per triangle.
export function cadPlanarFaces(g,axis){
 const p=g.attributes.position,ix=g.index,planes=new Map(),v=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],ab=new THREE.Vector3(),ac=new THREE.Vector3();
 for(let i=0,count=ix?ix.count:p.count;i<count;i+=3){
  for(let n=0;n<3;n++)v[n].fromBufferAttribute(p,ix?ix.getX(i+n):i+n);
  const a=v[0][axis],b=v[1][axis],c=v[2][axis];if(Math.max(a,b,c)-Math.min(a,b,c)>.00001)continue;
  const area=ab.subVectors(v[1],v[0]).cross(ac.subVectors(v[2],v[0])).length()/2;if(area<1e-10)continue;
  const key=(Math.round(a*100000)/100000).toFixed(5);let f=planes.get(key);
  if(!f){f={at:Number(key),area:0,center:new THREE.Vector3(),min:new THREE.Vector3(Infinity,Infinity,Infinity),max:new THREE.Vector3(-Infinity,-Infinity,-Infinity)};planes.set(key,f);}
  f.area+=area;for(let n=0;n<3;n++){const q=v[n];f.center.addScaledVector(q,area/3);f.min.min(q);f.max.max(q);}
 }
 return [...planes.values()].map(f=>({...f,center:f.center.divideScalar(f.area)})).sort((a,b)=>b.area-a.area);
}
export function deepBeamScale(r,post,beam){if(r.system==='mekik2'&&beam?.hookHalfSpan&&post?.holeXs?.length){const pitch=(r.width-r.foot)/r.bays,offset=Math.min(...post.holeXs.map(Math.abs))*r.foot/.1;return (pitch/2-offset)/beam.hookHalfSpan;}const pitch=(r.width-r.foot)/r.bays,bodyWidth=(post?.bodyWidthX||.1)*(r.system==='drive'?r.foot/(post?.width||.141):r.foot/.1);return (pitch-bodyWidth)/(2*(beam?.mountHalfSpan||(r.system==='drive'?1.35:.675)));}
export function prepareCad(scene,name){
 scene.updateMatrixWorld(true);const axis=name==='mrBeam'?new THREE.Matrix4().makeBasis(new THREE.Vector3(0,0,1),new THREE.Vector3(1,0,0),new THREE.Vector3(0,-1,0)):new THREE.Matrix4().makeRotationX(name.startsWith('b2b')?Math.PI/2:-Math.PI/2),source=[],names=[],finishes=[],profileBounds=new THREE.Box3();
 if(name==='drivePost')axis.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
 scene.traverse(mesh=>{if(!mesh.isMesh)return;const geometry=(/KONNEKT|BRAKET|KONSOL/i.test(mesh.name||'')?flatConnectorGeometry596(mesh.geometry):mesh.geometry).clone();geometry.userData.cadPartName=mesh.name||'';geometry.userData.uprightCandidate594=/MRD\d|AYAK(?:[_\s]+\d+)*[_\s]*-\d+/i.test(mesh.name||'');geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(axis,mesh.matrixWorld));if(axis.determinant()<0&&geometry.index){const indices=geometry.index.array;for(let i=0;i<indices.length;i+=3){const v=indices[i+1];indices[i+1]=indices[i+2];indices[i+2]=v;}geometry.index.needsUpdate=true;}geometry.computeBoundingBox();if(name==='b2bBeam'&&!/KONNEKT/i.test(mesh.name))profileBounds.union(geometry.boundingBox);source.push(geometry);names.push(String(mesh.name).toLocaleUpperCase('tr-TR'));finishes.push(/DİAGONEL|DIAGONEL|ÇAĞRAZ|ÇAPRAZ/.test(String(mesh.name).toLocaleUpperCase('tr-TR'))?'galvanized':null)});
 const bounds=new THREE.Box3();source.forEach(g=>bounds.union(g.boundingBox));const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
 const originY=name==='b2bBeam'&&!profileBounds.isEmpty()?profileBounds.min.y:name==='mekikBeam'||name==='mrBeam'?bounds.max.y:bounds.min.y;
 source.forEach(g=>{g.translate(-center.x,-originY,-center.z);g.scale(.001,.001,.001);g.computeBoundingBox();g.computeBoundingSphere()});
 if(name==='driveConsole')for(const g of source){g.rotateZ(Math.PI);g.translate(0,size.y/1000,0);g.computeBoundingBox();g.computeBoundingSphere();}
 // Turn the rail section over around its transverse axis before measuring the load face.
 if(name==='driveRail')for(const g of source){g.rotateX(Math.PI);g.translate(0,size.y/1000,0);g.computeBoundingBox();g.computeBoundingSphere();}
 const consoleBearing=['driveConsole','driveRail'].includes(name)?consoleBearing608(source):null;
 const consolePlate=name==='driveConsole'?Math.min(...source.map(g=>g.boundingBox.min.z)):null;
 const consoleHoles=name==='driveConsole'?repeatingHoles597(planeHoles597(source[0],'z',consolePlate)):[];
 const lipFace=name==='driveConsole'?cadPlanarFaces(source[0],'y').filter(f=>f.at>.02&&f.at<.12&&f.area>.001).sort((a,b)=>b.at-a.at)[0]:null;
 const consoleLip=lipFace?.at??null;
 const consoleLipWidth=lipFace?lipFace.max.x-lipFace.min.x:0;
 const consoleLipCenter=lipFace?Math.abs((lipFace.max.x+lipFace.min.x)/2):0;
 // Dispose parser materials/textures; prepared geometries are cached across viewers.
 const materials=new Set(),geometries=new Set();scene.traverse(m=>{if(m.isMesh){geometries.add(m.geometry);for(const mat of Array.isArray(m.material)?m.material:[m.material])materials.add(mat)}});materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());
 const bracketBounds=source.map((g,i)=>({box:g.boundingBox,name:names[i]})).filter(p=>p.name.includes('BRAKET'));const left=bracketBounds.filter(p=>(p.box.min.x+p.box.max.x)/2<0),right=bracketBounds.filter(p=>(p.box.min.x+p.box.max.x)/2>0);const railSeats=name==='mekikBeam'&&left.length&&right.length?[left.reduce((n,p)=>n+(p.box.min.x+p.box.max.x)/2,0)/left.length,right.reduce((n,p)=>n+(p.box.min.x+p.box.max.x)/2,0)/right.length]:null;
 const uprightBoxes=['b2bFrame','drivePost','mekikPost'].includes(name)?source.filter(g=>!source.some(p=>p.userData.uprightCandidate594)||g.userData.uprightCandidate594).map(g=>g.boundingBox).filter(b=>b.max.y-b.min.y>size.y*.0007).sort((a,b)=>(a.min.z+a.max.z)-(b.min.z+b.max.z)):[];const innerFaces=uprightBoxes.length>=2?{'-1':uprightBoxes[0].max.z,'1':uprightBoxes.at(-1).min.z}:null;
 const outerFaces=uprightBoxes.length>=2?{'-1':uprightBoxes[0].min.z,'1':uprightBoxes.at(-1).max.z}:null;
 const bracketGeometries=source.filter((g,i)=>names[i].includes('BRAKET')).sort((a,b)=>a.boundingBox.min.x-b.boundingBox.min.x);const railBearings=bracketGeometries.map(g=>{const faces=cadPlanarFaces(g,'y'),best=faces.filter(f=>f.area>=faces[0]?.area*.45).sort((a,b)=>b.at-a.at)[0];return best?{x:best.center.x,y:best.at,width:best.max.x-best.min.x}:null}).filter(Boolean);
 const connectors=source.filter((g,i)=>names[i].includes('KONNEKT'));const connectorMinZ=connectors.length?Math.min(...connectors.map(g=>g.boundingBox.min.z)):-size.z/2000;
const mountFace=connectors.flatMap(g=>cadPlanarFaces(g,'x')).sort((a,b)=>b.area-a.area)[0],mountHalfSpan=mountFace?Math.abs(mountFace.at):null;
 const connectorContactZ=connectors.flatMap(g=>cadPlanarFaces(g,'z')).sort((a,b)=>b.area-a.area)[0]?.at??connectorMinZ;
 const hookHoles=repeatingHoles597(connectors.flatMap(g=>planeHoles597(g,'z',connectorContactZ))),hookHalfSpan=hookHoles.length?hookHoles.reduce((n,h)=>n+Math.abs(h.x),0)/hookHoles.length:null;
 const postGeometry=source.find(g=>g.userData.uprightCandidate594),frontFace=postGeometry?cadPlanarFaces(postGeometry,'z').filter(f=>f.area>=(cadPlanarFaces(postGeometry,'z')[0]?.area||0)*.9).sort((a,b)=>Math.abs(b.at-postGeometry.boundingBox.getCenter(new THREE.Vector3()).z)-Math.abs(a.at-postGeometry.boundingBox.getCenter(new THREE.Vector3()).z))[0]:null,holes=frontFace?repeatingHoles597(planeHoles597(postGeometry,'z',frontFace.at)):[],holeXs=[...new Set(holes.map(h=>Math.round(h.x*100000)/100000))],holeYs=[...new Set(holes.map(h=>Math.round(h.y*100000)/100000))].sort((a,b)=>a-b),profileParts=source.filter((g,i)=>names[i].includes('PROFIL'));
 return {consoleBearing,consolePlate,consoleHoles,consoleLip,consoleLipWidth,consoleLipCenter,holeXs,holeBase:postGeometry?.boundingBox.min.y,holeFirstOffset:holes.length?Math.min(...holes.map(h=>h.y))-postGeometry.boundingBox.min.y:null,holePitch:holeYs.length>1?holeYs[1]-holeYs[0]:.05,frontHoleFace:frontFace?.at,hookHalfSpan,hookTopY:hookHoles.length?Math.max(...hookHoles.map(h=>h.y)):null,connectorBottomY:connectors.length?Math.min(...connectors.map(g=>g.boundingBox.min.y)):null,connectorTopY:connectors.length?Math.max(...connectors.map(g=>g.boundingBox.max.y)):null,profileMinY:profileParts.length?Math.min(...profileParts.map(g=>g.boundingBox.min.y)):null,profileMaxY:profileParts.length?Math.max(...profileParts.map(g=>g.boundingBox.max.y)):null,cadKind:name,geometries:source,finishes,connectorContactZ,railSeats,railBearings,innerFaces,outerFaces,connectorMinZ,mountHalfSpan,topY:Math.max(...source.map(g=>g.boundingBox.max.y)),bodyWidthX:uprightBoxes[0]?uprightBoxes[0].max.x-uprightBoxes[0].min.x:null,postHoleFaces:uprightBoxes.map(box=>{const g=source.find(g=>g.boundingBox===box),faces=g?cadPlanarFaces(g,'z'):[],best=faces.filter(f=>f.area>=(faces[0]?.area||0)*.9).sort((a,b)=>Math.abs(b.at-(box.min.z+box.max.z)/2)-Math.abs(a.at-(box.min.z+box.max.z)/2))[0];return {at:best?.at??box.max.z,sign:(best?.at??box.max.z)>(box.min.z+box.max.z)/2?1:-1};}),postCenters:uprightBoxes.map(b=>(b.min.z+b.max.z)/2),postFrontFaces:uprightBoxes.map(b=>b.min.z),referenceHeight:profileBounds.isEmpty()?size.y/1000:profileBounds.getSize(new THREE.Vector3()).y/1000,height:size.y/1000,depth:size.z/1000,width:size.x/1000};
}
function driveConsoleLevel609(y,templates){
 const console=templates.driveConsole,post=templates.drivePost,hole=console?.consoleHoles?.[0];
 if(!hole||console.consoleLip==null||post?.holeFirstOffset==null)return y;
 const pitch=post.holePitch||.05,reference=(post.holeBase||0)+post.holeFirstOffset;
 return reference+Math.round((y-console.consoleLip+hole.y-reference)/pitch)*pitch-hole.y+console.consoleLip;
}
export function driveVisualLevel609(y,templates){
 return driveConsoleLevel609(y,templates);
}
export function cadPlacements(r,templates){
 r=upgradeMekikStepped(r);
 const out=[],add=(name,x,y,z,sx,sy,sz)=>out.push({name,x,y,z,sx,sy,sz,color:name==='driveConsole'||name==='mekikBeam'||name==='b2bBeam'||name==='mrBeam'?r.beamColor:r.footColor});
 if(r.system==='b2b'){
  const t=templates.b2bFrame,{depth:fd,centers}=b2bFrameLayout(r);
  for(let row=0;row<r.rows;row++)for(const side of [-1,1]){const h=Number(r.frameHeights[row]?.[side<0?'left':'right'])/1000||r.height;add('b2bFrame',side*(r.width-r.foot)/2,0,centers[row],r.foot/.09,h/t.height,fd/t.depth)}
  for(let row=0;row<r.rows;row++)for(let i=0;i<r.floors.length;i++){const y=r.beamYs[i];if(y===null||(r.tunnelHeight>0&&y<r.tunnelHeight))continue;for(const side of [-1,1]){add('b2bBeam',0,y,centers[row]+b2bBeamMountZ(r,t,templates.b2bBeam,side),(r.width-2*r.foot)/2.7,(r.floors[i]-y)/(templates.b2bBeam?.referenceHeight||.12),1);out.at(-1).ry=side<0?Math.PI:0;}}
 }else if(r.system==='mr'){
  const t=templates.mrBeam,pitch=(r.width-r.foot)/r.modules;for(let m=0;m<r.modules;m++)for(const y of r.floors)for(const side of [-1,1]){add('mrBeam',-r.width/2+r.foot/2+(m+.5)*pitch,y,side*(r.depth/2-t.depth/2),(pitch-r.foot)/t.width,r.beam/t.height,1);out.at(-1).ry=side<0?Math.PI:0;}
 }else if(r.system==='drive'&&r.driveStepped){
  const t=templates.drivePost,beam=templates.b2bBeam,pitch=(r.width-r.foot)/r.bays,sy=.14/(beam.referenceHeight||.12);
  for(const f of r.driveStepped.frames){
   for(let lane=0;lane<=r.bays;lane++)add('drivePost',-r.width/2+r.foot/2+lane*pitch,0,(f.start+f.end)/2000-r.depth/2,r.foot/t.width,f.height/1000/t.height,f.depth/1000/t.depth);
   const mounts=(t.postHoleFaces?.length?t.postHoleFaces:[{at:-t.depth/2,sign:-1},{at:t.depth/2,sign:1}]).map(face=>({z:(f.start+f.end)/2000-r.depth/2+face.at*f.depth/1000/t.depth,side:face.sign}));
   // Native Drive-In cross-channel connection stays above the highest load
   // carried by each frame, including frames shortened along the depth.
   for(let lane=0;lane<r.bays;lane++)for(const mount of mounts){add('b2bBeam',-r.width/2+r.foot/2+(lane+.5)*pitch,f.height/1000-(beam.topY??.18)*sy,mount.z-mount.side*(beam.connectorContactZ??beam.connectorMinZ??-(beam.depth||.063)/2)+mount.side*.0002,deepBeamScale(r,t,beam),sy,1);out.at(-1).ry=mount.side<0?Math.PI:0;}
  }
 }else if(r.system==='mekik2'&&r.mekikStepped){
  const s=r.mekikStepped,t=templates.mekikPost,beam=templates.mekikBeam,pitch=(r.width-r.foot)/r.bays;
  for(let lane=0;lane<=r.bays;lane++)for(const f of s.frameRows?.[lane]||s.frames)for(const zz of [f.start/1000,f.end/1000])add('mekikPost',-r.width/2+r.foot/2+lane*pitch,0,Math.max(r.foot/2,Math.min(r.depth-r.foot/2,zz))-r.depth/2,r.foot/.1,f.height/1000/t.height,1);
  if(r.hasExtra)for(let row=0;row<=r.bays;row++){const heights=s.lanes?.filter(l=>l.index===row-1||l.index===row).map(l=>l.model.height/1000);add('mekikPost',-r.width/2+r.foot/2+row*pitch,0,r.depth/2-r.foot/2,r.foot/.1,(heights?Math.max(...heights):r.height)/t.height,1);}
  for(let lane=0;lane<r.bays;lane++)for(const floor of s.lanes?.[lane]?.model.floors||s.floors)for(const run of floor.runs){const stations=run.stations.map(p=>p/1000);for(const zz of stations){add('mekikBeam',-r.width/2+r.foot/2+(lane+.5)*pitch,floor.y/1000-(r.railHeight||.17)-(beam.railBearings?.[0]?.y??-.146),Math.max(r.foot/2,Math.min(r.depth-r.foot/2,zz))-r.depth/2+(t.frontHoleFace??t.postHoleFaces?.[0]?.at??.06)-(beam.connectorContactZ??.0275)+.0002,deepBeamScale(r,t,beam),1,1);out.at(-1).ry=0;out.at(-1).connectorDy=connectorPhase597(t,beam,r.height/t.height,out.at(-1).y);out.at(-1).profileHeight598=floor.traverseHeight?floor.traverseHeight/1000:null;}}
 }else if(r.system==='mekik2'||r.system==='drive'){
  const postName=r.system==='drive'?'drivePost':'mekikPost',t=templates[postName],pitch=(r.width-r.foot)/r.bays,stations=[...new Set([...(r.footZ.length?r.footZ:[0,r.depth]),...(r.system==='mekik2'&&r.hasExtra?[r.depth]:[])])];
  if(r.system==='drive'){for(let lane=0;lane<=r.bays;lane++)for(const [start,end] of (r.footFrames.length?r.footFrames:[[0,r.depth]]))add(postName,-r.width/2+r.foot/2+lane*pitch,0,(start+end)/2-r.depth/2,r.foot/t.width,r.height/t.height,(end-start)/t.depth);}else for(let lane=0;lane<=r.bays;lane++)for(const zz of [...new Set(stations)])add(postName,-r.width/2+r.foot/2+lane*pitch,0,Math.max(r.foot/2,Math.min(r.depth-r.foot/2,zz))-r.depth/2,r.foot/.1,r.height/t.height,1);
   const postMounts=r.system==='drive'?(r.footFrames.length?r.footFrames:[[0,r.depth]]).flatMap(([start,end])=>(t.postHoleFaces?.length?t.postHoleFaces:[{at:-t.depth/2,sign:-1},{at:t.depth/2,sign:1}]).map(face=>({z:(start+end)/2-r.depth/2+face.at*(end-start)/t.depth,side:face.sign}))):stations.map(zz=>({z:Math.max(r.foot/2,Math.min(r.depth-r.foot/2,zz))-r.depth/2+(t.postCenters?.[0]??.02),side:-1}));
  const beamName=r.system==='drive'?'b2bBeam':'mekikBeam',beam=templates[beamName],sy=r.system==='drive'?.14/(beam.referenceHeight||.12):1,bearingY=beam.railBearings?.[0]?.y??-.146,ys=r.system==='drive'?[r.height-(beam.topY??.18)*sy]:r.floors.map(y=>y-(r.railHeight||.17)-bearingY);
  for(let lane=0;lane<r.bays;lane++)for(const y of ys)for(const mount of postMounts){add(beamName,-r.width/2+r.foot/2+(lane+.5)*pitch,y,r.system==='drive'?mount.z-mount.side*(beam.connectorContactZ??beam.connectorMinZ??-(beam.depth||.063)/2)+mount.side*.0002:mount.z-(t.postCenters?.[0]??.02)+(t.frontHoleFace??t.postHoleFaces?.[0]?.at??.06)-(beam.connectorContactZ??.0275)+.0002,deepBeamScale(r,t,beam),sy,1);out.at(-1).ry=r.system==='drive'?(mount.side<0?Math.PI:0):0;if(r.system==='mekik2')out.at(-1).connectorDy=connectorPhase597(t,beam,r.height/t.height,out.at(-1).y);}


 }
 if(r.system==='drive'&&templates.driveConsole){
  const pitch=(r.width-r.foot)/r.bays,t=templates.driveConsole,factor=70/59,rail=templates.driveRail,railScale=rail?.height ? .15/rail.height : 1,seatDrop=t.consoleLip!=null ? t.consoleLip-t.consoleBearing.at : rail?.consoleBearing?(rail.consoleBearing.at-rail.consoleBearing.bottom)*railScale:.15;
  const post=templates.drivePost, hole=t.consoleHoles?.[0];
  const holeInset=hole&&post?.holeXs?.length?Math.min(...post.holeXs.map(Math.abs))*r.foot/post.width:null;
  const clearSpan=holeInset!=null?pitch-2*holeInset+2*(t.width/2-Math.abs(hole.x))*factor+.0004:pitch-r.foot;
  const posts=out.filter(p=>p.name==='drivePost'&&Math.abs(p.x+r.width/2-r.foot/2)<1e-6);
  const mounts=posts.flatMap(p=>(post.postHoleFaces||[]).map(face=>p.z+face.at*p.sz));
  function addConsole(x,y,z){
   const base=y-seatDrop-(t.consoleBearing?.at??0)*(hole?1:factor);
   const mount=mounts.reduce((best,value)=>Math.abs(value-z)<Math.abs(best-z)?value:best,Infinity);
   const snap=base+driveConsoleLevel609(y,templates)-y;
   add('driveConsole',x,snap,Number.isFinite(mount)?mount-t.consolePlate*factor:z+t.depth*factor/2,1,1,1);
   out.at(-1).consoleSpan=clearSpan;
  }
  for(let lane=0;lane<r.bays;lane++){
   const x=-r.width/2+r.foot/2+(lane+.5)*pitch;
   if(r.driveStepped){for(const floor of r.driveStepped.floors)for(const run of floor.runs)for(const at of run.supports)addConsole(x,floor.y/1000,at/1000-r.depth/2);}
   else for(const y of r.floors)for(const at of [...new Set(r.footZ.length?r.footZ:[0,r.depth])])addConsole(x,y,Math.max(.05,Math.min(r.depth-.05,at))-r.depth/2);
  }
  if(rail&&t.consoleBearing){
   const railFace=rail.consoleBearing?.seats[0],loadHeight=rail.consoleBearing?.at??rail.height;
   const fitLip=t.consoleLip!=null&&t.consoleLipWidth>0&&railFace?.width>0&&loadHeight>0;
   const sx=fitLip?t.consoleLipWidth*factor/railFace.width:1;
   const sy=fitLip?(t.consoleLip-t.consoleBearing.at)/loadHeight:railScale;
   const consoles=out.filter(part=>part.name==='driveConsole');
   for(let lane=0;lane<r.bays;lane++){const center=-r.width/2+r.foot/2+(lane+.5)*pitch;const floors=r.driveStepped?r.driveStepped.floors.map(f=>({y:f.y/1000,runs:f.runs.map(run=>({start:run.start/1000,end:run.end/1000}))})):r.floors.map(y=>({y,runs:[{start:0,end:r.depth}]}));for(const floor of floors)for(const run of floor.runs){
    const level=driveVisualLevel609(floor.y,templates);
    let start=run.start-r.depth/2,end=run.end-r.depth/2;
    const supports=consoles.filter(p=>Math.abs(p.x-center)<1e-6&&Math.abs(p.y+t.consoleLip-level)<1e-6&&p.z>=start-t.depth&&p.z<=end+t.depth);
    if(supports.length){
     start=Math.min(start,...supports.map(p=>p.z-t.depth*factor/2));
     end=Math.max(end,...supports.map(p=>p.z+t.depth*factor/2));
    }
    for(const seat of t.consoleBearing.seats){
     const side=Math.sign(seat.x),outer=side*t.width/2;
     const contactX=fitLip?side*t.consoleLipCenter:seat.x;
     const x=center+side*(clearSpan/2-.0002)+(contactX-outer)*factor+side*(railFace?.x||0)*sx;
     add('driveRail',x,level-loadHeight*sy,(start+end)/2, sx,sy,(end-start)/rail.depth);
     out.at(-1).color='rail';
     out.at(-1).ry=side>0?Math.PI:0;
    }
   }
   }
  }
 }
 return classifyDepthPosts605(faceMekikCadToPlan(out.filter(p=>!(['mekikPost','drivePost'].includes(p.name)&&isSharedDepthMember(r,p.x,p.z))),r,templates),templates,r.system,true);
}
