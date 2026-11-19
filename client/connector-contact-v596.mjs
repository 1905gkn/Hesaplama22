import * as THREE from 'three';
const flatCache=new WeakMap();
export function flatConnectorGeometry596(source){
 if(source.userData.connectorExact596)return source;if(flatCache.has(source))return flatCache.get(source);
 const geometry=source.index?source.toNonIndexed():source.clone();geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();geometry.userData={...source.userData,connectorExact596:true};flatCache.set(source,geometry);return geometry;
}
// Contact is the broad flat return plate, not the projecting hook tips.
export function connectorContact596(root,axis='y'){
 root.updateMatrixWorld(true);const planes=new Map(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3(),edge=new THREE.Vector3();
 root.traverse(mesh=>{if(!mesh.isMesh||!/KONNEKT/i.test(mesh.name))return;const p=mesh.geometry.attributes.position,ix=mesh.geometry.index,count=ix?.count??p.count,at=i=>ix?ix.getX(i):i;
 for(let i=0;i<count;i+=3){a.fromBufferAttribute(p,at(i)).applyMatrix4(mesh.matrixWorld);b.fromBufferAttribute(p,at(i+1)).applyMatrix4(mesh.matrixWorld);c.fromBufferAttribute(p,at(i+2)).applyMatrix4(mesh.matrixWorld);n.subVectors(b,a).cross(edge.subVectors(c,a));const area=n.length()/2;if(!area||Math.abs(n.normalize()[axis])<.999)continue;const key=Math.round(a[axis]*1000);let plane=planes.get(key);if(!plane){plane={at:a[axis],area:0};planes.set(key,plane);}plane.area+=area;
 }});return [...planes.values()].sort((a,b)=>b.area-a.area)[0]?.at;
}
export function postFront596(root,axis='y'){
 root.updateMatrixWorld(true);let face=-Infinity;root.traverse(mesh=>{if(mesh.isMesh&&/MRD\d|AYAK(?:[_\s]+\d+)*[_\s]*-\d+/i.test(mesh.name))face=Math.max(face,new THREE.Box3().setFromObject(mesh).max[axis]);});return Number.isFinite(face)?face:null;
}
