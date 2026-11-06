import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Exact existing timber boards, baked once per size rather than 20 transforms
// for every pallet on every rack. No triangle or resolution reduction.
export function palletTimberParts(w,d){
 const parts=[],box=(x,y,z,w,h,d)=>parts.push({x,y,z,w,h,d});
 const bw=Math.min(.145,w*.125),bd=Math.min(.145,d*.18),xs=[-(w-bw)/2,0,(w-bw)/2],zs=[-(d-bd)/2,0,(d-bd)/2];
 for(const x of xs){box(x,.0125,0,bw,.025,d);for(const z of zs)box(x,.065,z,bw,.08,bd);}
 for(const z of zs)box(0,.115,z,w,.02,bd);
 const deckWidth=w/5*.85;for(let i=0;i<5;i++)box(-w/2+deckWidth/2+i*(w-deckWidth)/4,.1425,0,deckWidth,.035,d);
 return parts;
}
export function palletTimberGeometry(w,d){
 const dummy=new THREE.Object3D(),unit=new THREE.BoxGeometry(1,1,1),pieces=[];
 for(const p of palletTimberParts(w,d)){dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.w,p.h,p.d);dummy.updateMatrix();pieces.push(unit.clone().applyMatrix4(dummy.matrix));}
 const geometry=mergeGeometries(pieces,false);unit.dispose();pieces.forEach(p=>p.dispose());return geometry;
}
export function rackGeometryKey(r){
 const {id,sourceId,x,z,angle,name,detailLabel,typeColor,areaId,areaName,...shape}=r;return JSON.stringify(shape);
}
