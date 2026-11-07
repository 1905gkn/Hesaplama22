import * as THREE from 'three';

// Instance unchanged CAD leaves by geometry, finish and render flags. Source
// models remain shared; only this drawing's old leaves are detached.
export function batchDriveStaticParts(root){
 root.updateMatrixWorld(true);
 const inverse=root.matrixWorld.clone().invert(),groups=new Map();let sourceMeshes=0;
 root.traverseVisible(mesh=>{
  if(!mesh.isMesh||mesh.isInstancedMesh||mesh.children.length||mesh.isSkinnedMesh||mesh.morphTargetInfluences?.length||Array.isArray(mesh.material)||mesh.material.transparent||mesh.matrixWorld.determinant()<=0)return;
  const flags=[mesh.castShadow,mesh.receiveShadow,mesh.renderOrder,mesh.layers.mask,mesh.frustumCulled];
  const key=JSON.stringify([mesh.geometry.uuid,mesh.material.uuid,flags]);
  if(!groups.has(key))groups.set(key,[]);groups.get(key).push(mesh);sourceMeshes++;
 });
 let batches=0,replacedMeshes=0;
 for(const items of groups.values()){
  if(items.length<2)continue;
  const first=items[0],batch=new THREE.InstancedMesh(first.geometry,first.material,items.length),matrix=new THREE.Matrix4();
  Object.assign(batch,{name:first.name,castShadow:first.castShadow,receiveShadow:first.receiveShadow,renderOrder:first.renderOrder,frustumCulled:first.frustumCulled});batch.layers.mask=first.layers.mask;
  for(let i=0;i<items.length;i++){matrix.multiplyMatrices(inverse,items[i].matrixWorld);batch.setMatrixAt(i,matrix);items[i].removeFromParent();}
  batch.instanceMatrix.needsUpdate=true;batch.computeBoundingBox();batch.computeBoundingSphere();batch.userData.driveStaticBatch=true;root.add(batch);batches++;replacedMeshes+=items.length;
 }
 return {sourceMeshes,replacedMeshes,batches,remainingDraws:sourceMeshes-replacedMeshes+batches};
}
