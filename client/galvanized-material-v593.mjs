import {flatConnectorGeometry596} from './connector-contact-v596.mjs';
import {prepareUprightGeometry594} from './upright-side-holes-v594.mjs';
import * as THREE from 'three';
export const GALVANIZED_COLOR593=0xaeb8bd;
// These are the existing PGV palette entries, not a generic "all grey" rule.
const palette=new Set([0xaeb8bd,0xa8b0b3,0xb8c0bd,0xa7b0ab,0xb8c3c5,0xbbc3c6]);
export function isGalvanizedColor593(color){try{return palette.has(color?.isColor?color.getHex():new THREE.Color(color).getHex());}catch{return false;}}
export function fixedGalvanizedMaterial593(source={}){
 const material=new THREE.MeshBasicMaterial({color:GALVANIZED_COLOR593,toneMapped:false,fog:false,side:source.side??THREE.FrontSide,transparent:source.transparent??false,opacity:source.opacity??1,depthTest:source.depthTest??true,depthWrite:source.depthWrite??true,polygonOffset:source.polygonOffset??false,polygonOffsetFactor:source.polygonOffsetFactor??0,polygonOffsetUnits:source.polygonOffsetUnits??0,clippingPlanes:source.clippingPlanes??null});
 // A bounded studio light retains CAD face normals without exposure-dependent
 // white clipping. No additional lights, textures, meshes or draw calls.
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vPgvNormal594;\n'+shader.vertexShader
   .replace('#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )','#if 1')
   .replace('#include <begin_vertex>','vPgvNormal594 = normalize(transformedNormal);\n#include <begin_vertex>');
  shader.fragmentShader='varying vec3 vPgvNormal594;\n'+shader.fragmentShader
   .replace('#include <opaque_fragment>',
    'vec3 pgvNormal = normalize(vPgvNormal594) * (gl_FrontFacing ? 1.0 : -1.0);\n'+
    'vec3 pgvKey = normalize(mat3(viewMatrix) * vec3(0.35, 0.8, 0.48));\n'+
    'float pgvShade = 0.54 + 0.42 * max(dot(pgvNormal, pgvKey), 0.0);\n'+
    'outgoingLight = diffuseColor.rgb * pgvShade;\n#include <opaque_fragment>');
 };
 material.customProgramCacheKey=()=> 'pgv-studio-normals-594';
 material.name=source.name||'PGV';material.userData={...source.userData,finish:'pgv',fixedGalvanized593:true};return material;
}
export function stabilizeGalvanizedObject593(root){
 const converted=new Map();root.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.material)return;
  if(/KONNEKT|BRAKET/i.test(mesh.name||''))mesh.geometry=flatConnectorGeometry596(mesh.geometry);
  if(/MRD\d|AYAK(?:[_\s]+\d+)*[_\s]*-\d+/i.test(mesh.name||'')){
   mesh.geometry.computeBoundingBox();const size=mesh.geometry.boundingBox.getSize(new THREE.Vector3()),heightAxis=size.z>size.y?'z':'y';
   if(size[heightAxis]>Math.max(size.x,heightAxis==='y'?size.z:size.y)*8)mesh.geometry=prepareUprightGeometry594(mesh.geometry,{heightAxis,frontAxis:heightAxis==='z'?'y':'z'});
  }
  // Tray CADs may have an unassigned white material; their finish is fixed PGV.
  let tray=false;for(let p=mesh;p&&p!==root.parent;p=p.parent)if(/(?:^Tava |Toplama Tava)/i.test(p.name||'')){tray=true;break;}
  const convert=source=>{if(source.userData?.fixedGalvanized593)return source;if(!tray&&!isGalvanizedColor593(source.color))return source;
   const key=JSON.stringify([source.side,source.transparent,source.opacity,source.depthTest,source.depthWrite,source.polygonOffset,source.polygonOffsetFactor,source.polygonOffsetUnits]);
   if(!converted.has(key))converted.set(key,fixedGalvanizedMaterial593(source));return converted.get(key);
  };
  mesh.material=Array.isArray(mesh.material)?mesh.material.map(convert):convert(mesh.material);
 });return root;
}
