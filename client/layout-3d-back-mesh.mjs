import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {backMeshPanels,backMeshFaces,backMeshSupports} from './back-mesh-plan.mjs';
const cache=new Map();
export function withoutMiddleSupport(source){
 const g=source.clone(),p=g.attributes.position,index=g.index,keep=[];g.computeBoundingBox();const center=(g.boundingBox.min.x+g.boundingBox.max.x)/2,count=index?.count||p.count;
 for(let i=0;i<count;i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);if(ids.every(id=>Math.abs(p.getX(id)-center)<.016))continue;keep.push(...ids);}
 g.setIndex(keep);g.computeBoundingBox();g.computeBoundingSphere();return g;
}
export function prepareBackMeshCad(scene){
 const parts=[];scene.updateMatrixWorld(true);scene.traverse(mesh=>{if(!mesh.isMesh)return;const g=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);g.rotateX(Math.PI/2);g.scale(.001,.001,.001);parts.push(g);});
 if(!parts.length)throw Error('Tel kafes CAD modeli boş.');
 const bounds=new THREE.Box3();parts.forEach(g=>{g.computeBoundingBox();bounds.union(g.boundingBox);});const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
 parts.forEach(g=>g.translate(-center.x,-bounds.min.y,-center.z));const geometry=parts.length===1?parts[0]:mergeGeometries(parts,false);if(parts.length>1)parts.forEach(g=>g.dispose());geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const gs=new Set(),ms=new Set();scene.traverse(m=>{if(m.isMesh){gs.add(m.geometry);for(const mat of Array.isArray(m.material)?m.material:[m.material])if(mat)ms.add(mat);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());
 return {geometry,width:size.x,height:size.y,depth:size.z};
}
export async function loadBackMeshCad(racks=[]){
 const needed=new Set(racks.filter(r=>r.backMeshSides?.length).map(r=>backMeshSupports(r.backMeshWidth*1000)));
 const result={};for(const supports of needed){const family=supports===2?2:1;if(!cache.has(family))cache.set(family,new GLTFLoader().loadAsync('/back-mesh-'+(family===2?'3600':'2700')+'.glb?v=482').then(g=>prepareBackMeshCad(g.scene)).catch(e=>{cache.delete(family);throw e;}));const t=await cache.get(family);
 if(supports===0){if(!cache.has(0))cache.set(0,{...t,geometry:withoutMiddleSupport(t.geometry)});result[0]=cache.get(0);}else result[supports]=t;}
 if(needed.size){for(const [key,file]of [['vertical','back-mesh-vertical'],['horizontal','back-mesh-horizontal']]){if(!cache.has(key))cache.set(key,new GLTFLoader().loadAsync('/'+file+'.glb?v=482').then(g=>prepareBackMeshCad(g.scene)).catch(e=>{cache.delete(key);throw e;}));result[key]=await cache.get(key);}}
 return result;
}
export function backMeshBatches(racks=[],templates={}){
 const groups=new Map();
 function add(key,t,color,root,x,y,z,yaw=0){if(!t)return;const part=new THREE.Object3D();part.position.set(x,y,z);part.rotation.y=yaw;part.updateMatrix();if(!groups.has(key))groups.set(key,{geometry:t.geometry,color,matrices:[]});groups.get(key).matrices.push(new THREE.Matrix4().multiplyMatrices(root.matrix,part.matrix));}
 const dummy=new THREE.Object3D(),root=new THREE.Object3D(),matrix=new THREE.Matrix4();
 for(const r of racks){if(!r.backMeshSides?.length)continue;const plan=backMeshPanels(r.height*1000,r.backMeshWidth*1000),t=templates[plan.supports];if(!t)continue;
 const faces=backMeshFaces(r.frameDepth*1000,r.rows,r.rowGap*1000);root.position.set(r.x,0,r.z);root.rotation.set(0,r.angle||0,0);root.updateMatrix();
 for(const side of new Set(r.backMeshSides)){if(!Number.isFinite(faces[side]))continue;let y=0;const direction=side==='front'?-1:1,z=faces[side]/1000-direction*.1,yaw=direction<0?Math.PI:0;
 for(const panel of plan.panels)for(let i=0;i<panel.quantity;i++){
  dummy.position.set(0,y,faces[side]/1000);dummy.rotation.set(0,0,0);dummy.scale.set(r.backMeshWidth/t.width,panel.height/1000/t.height,1);dummy.updateMatrix();
  if(!groups.has(plan.supports))groups.set(plan.supports,{geometry:t.geometry,color:'#a5afb2',matrices:[]});groups.get(plan.supports).matrices.push(matrix.multiplyMatrices(root.matrix,dummy.matrix).clone());const h=panel.height/1000;
  add('vertical',templates.vertical,'#a5afb2',root,-r.backMeshWidth/2,y+h/2,z,yaw);add('vertical',templates.vertical,'#a5afb2',root,r.backMeshWidth/2,y+h/2,z,yaw);
  if(y>0){add('horizontal',templates.horizontal,'#a5afb2',root,-r.backMeshWidth/4,y,z,yaw);add('horizontal',templates.horizontal,'#a5afb2',root,r.backMeshWidth/4,y,z,yaw);}y+=h;
 }}
 }return [...groups.values()];
}
