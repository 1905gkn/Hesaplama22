import * as THREE from 'three';
export const GALVANIZED_COLOR593=0xaeb8bd;
// These are the existing PGV palette entries, not a generic "all grey" rule.
const palette=new Set([0xaeb8bd,0xa8b0b3,0xb8c0bd,0xa7b0ab,0xb8c3c5,0xbbc3c6]);
export function isGalvanizedColor593(color){try{return palette.has(color?.isColor?color.getHex():new THREE.Color(color).getHex());}catch{return false;}}
export function fixedGalvanizedMaterial593(source={}){
 const material=new THREE.MeshBasicMaterial({color:GALVANIZED_COLOR593,toneMapped:false,fog:false,side:source.side??THREE.FrontSide,transparent:source.transparent??false,opacity:source.opacity??1,depthTest:source.depthTest??true,depthWrite:source.depthWrite??true,polygonOffset:source.polygonOffset??false,polygonOffsetFactor:source.polygonOffsetFactor??0,polygonOffsetUnits:source.polygonOffsetUnits??0,clippingPlanes:source.clippingPlanes??null});
 material.name=source.name||'PGV';material.userData={...source.userData,finish:'pgv',fixedGalvanized593:true};return material;
}
export function stabilizeGalvanizedObject593(root){
 const converted=new Map();root.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.material)return;
  // Tray CADs may have an unassigned white material; their finish is fixed PGV.
  let tray=false;for(let p=mesh;p&&p!==root.parent;p=p.parent)if(/(?:^Tava |Toplama Tava)/i.test(p.name||'')){tray=true;break;}
  const convert=source=>{if(source.userData?.fixedGalvanized593)return source;if(!tray&&!isGalvanizedColor593(source.color))return source;
   const key=JSON.stringify([source.side,source.transparent,source.opacity,source.depthTest,source.depthWrite,source.polygonOffset,source.polygonOffsetFactor,source.polygonOffsetUnits]);
   if(!converted.has(key))converted.set(key,fixedGalvanizedMaterial593(source));return converted.get(key);
  };
  mesh.material=Array.isArray(mesh.material)?mesh.material.map(convert):convert(mesh.material);
 });return root;
}
