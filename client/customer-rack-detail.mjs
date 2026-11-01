import * as THREE from 'three';
import {rackParts} from './layout-3d-geometry.mjs';
import {cadPlacements,deepBeamScale,loadLayoutCad} from './layout-3d-cad.mjs';
import {loadLayoutAccessories,disposeLayoutAccessories} from './layout-3d-accessories.mjs';
export async function loadCustomerRackDetail(r){
 const templates=await loadLayoutCad([r]),accessoryGeometries=await loadLayoutAccessories([r],undefined,templates);
 try{
 const data={racks:[r]},scene=new THREE.Group(),options={customerPerformance:true};
 function Surface(params){const {roughness,metalness,...simple}=params;return new THREE.MeshLambertMaterial(simple);}
 const geometries=[],materials=[],parts={},geometry=new THREE.BoxGeometry(1,1,1);geometries.push(geometry);
 const colors={ral5010:'#005078',ral5015:'#287ab5',pgv:'#aeb8bd',galvanized:'#aeb8bd',ral1007:'#e5bd00',ral1023:'#f2c500',ral2004:'#e25318',timber:'#a67b45',load:'#d6b47b',product:'#75838a',shelf:'#b8c3c5',rail:'#bbc3c6'};
 const dummy=new THREE.Object3D(),parent=new THREE.Object3D(),palletMeshes=[];
 for(const r of data.racks){if(['mr','konsol'].includes(r.system)&&accessoryGeometries.has(String(r.id)))continue;parent.position.set(r.x,0,r.z);parent.rotation.set(0,r.angle,0);parent.updateMatrix();for(const p of rackParts(r,{cad:true,railSeats:templates.mekikBeam?.railSeats,railBearings:templates.mekikBeam?.railBearings,nativeAccessories:accessoryGeometries.has(String(r.id)),railScaleX:r.system==='mekik2'?deepBeamScale(r,templates.mekikPost,templates.mekikBeam):null})){
  const loads=['timber','load','product'].includes(p.kind),color=['brace','tie'].includes(p.kind)?'galvanized':p.kind==='foot'?r.footColor:p.kind==='beam'?r.beamColor:p.kind,key=(loads?'load:':'structure:')+color;
  dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.rx,0,p.rz);dummy.scale.set(p.w,p.h,p.d);dummy.updateMatrix();(parts[key]||=[]).push(new THREE.Matrix4().multiplyMatrices(parent.matrix,dummy.matrix));
 }}
 for(const [key,list] of Object.entries(parts)){const color=key.split(':')[1],mat=new Surface({color:colors[color]||'#176090',roughness:.5,metalness:.25});materials.push(mat);
  const mesh=new THREE.InstancedMesh(geometry,mat,list.length);list.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));scene.add(mesh);if(key.startsWith('load:'))palletMeshes.push(mesh);
 }
 const cadGroups=new Map();
 for(const r of data.racks){if(['mr','konsol'].includes(r.system)&&accessoryGeometries.has(String(r.id)))continue;parent.position.set(r.x,0,r.z);parent.rotation.set(0,r.angle,0);parent.updateMatrix();for(const p of cadPlacements(r,templates)){
  const key=p.name+':'+p.color;if(!cadGroups.has(key))cadGroups.set(key,{template:templates[p.name],color:p.color,matrices:[]});dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.ry||0,0);dummy.scale.set(p.sx,p.sy,p.sz);dummy.updateMatrix();cadGroups.get(key).matrices.push(new THREE.Matrix4().multiplyMatrices(parent.matrix,dummy.matrix));
 }}
 for(const {template,color,matrices} of cadGroups.values()){const material=new Surface({color:colors[color]||'#005078',roughness:.42,metalness:.4});materials.push(material);const galvanized=new Surface({color:colors.galvanized,metalness:.6,roughness:.42});materials.push(galvanized);for(const [index,geometry] of template.geometries.entries()){const mesh=new THREE.InstancedMesh(geometry,template.finishes?.[index]==='galvanized'?galvanized:material,matrices.length);matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));scene.add(mesh)}}
 for(const r of data.racks){const parts=accessoryGeometries.get(String(r.id))||[];if(!parts.length)continue;const group=new THREE.Group();group.position.set(r.x,0,r.z);group.rotation.y=r.angle;for(const p of parts){const mat=new Surface({color:p.color,roughness:r.system==='konsol'?Math.max(.42,p.roughness??.42):.42,metalness:r.system==='konsol'?(p.load?Math.min(.25,p.metalness??.25):.4):r.system==='mr'?.4:.48});materials.push(mat);if(!geometries.includes(p.geometry))geometries.push(p.geometry);const mesh=p.matrices?new THREE.InstancedMesh(p.geometry,mat,p.matrices.length):new THREE.Mesh(p.geometry,mat);if(p.matrices)p.matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,new THREE.Matrix4().fromArray(matrix)));mesh.name=p.name;group.add(mesh);if(p.load)palletMeshes.push(mesh);}scene.add(group);}

 return {group:scene,loads(value){palletMeshes.forEach(m=>m.visible=value)},dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.traverse(o=>{if(o.isInstancedMesh)o.dispose()});}};
 }catch(error){disposeLayoutAccessories(accessoryGeometries);throw error;}
}
