import assert from 'node:assert/strict';
import * as THREE from 'three';
import {layoutSnapshot} from '../client/layout-3d-data.mjs';
import {rackParts} from '../client/layout-3d-geometry.mjs';
import {cadPlacements,prepareCad} from '../client/layout-3d-cad.mjs';
import {rackDimensions,planDimensions,mmLabel} from '../client/layout-3d-dimensions.mjs';
import {fixtures} from './verify-layout-3d.mjs';
const source=new THREE.Group(),mesh=new THREE.Mesh(new THREE.BoxGeometry(90,1100,5000),new THREE.MeshStandardMaterial());mesh.position.set(600,800,-2500);source.add(mesh);
const template=prepareCad(source,'b2bFrame');assert.ok(Math.abs(template.height-5)<1e-6);assert.ok(Math.abs(template.depth-1.1)<1e-6);const bounds=template.geometries[0].boundingBox;assert.ok(Math.abs(bounds.min.y)<1e-6);assert.ok(Math.abs((bounds.max.x+bounds.min.x)/2)<1e-6,'CAD coordinates must be centered independent of original translation');
const data=layoutSnapshot({scale:.04,racks:fixtures});
const b2b=data.racks[0],mekik=data.racks[3],templates={b2bFrame:template,mekikPost:{height:6},mekikBeam:{}};
const cad=cadPlacements(b2b,templates);assert.equal(cad.filter(p=>p.name==='b2bFrame').length,2);assert.equal(cad.filter(p=>p.name==='b2bBeam').length,6);assert.ok(cad.some(p=>p.name==='b2bBeam'&&p.ry===Math.PI),'Front connectors must face the upright');assert.equal(rackParts(b2b,{cad:true}).filter(p=>p.kind==='foot').length,0,'Do not overlay rough procedural posts on CAD frames');
const special={...b2b,rows:2,depth:2.6,frameHeights:[{left:6000,right:4900},{left:4900,right:6000}]},ends=cadPlacements(special,templates);assert.equal(ends.filter(p=>p.name==='b2bFrame').length,4);assert.equal(ends.filter(p=>p.name==='b2bFrame'&&Math.abs(p.sy*template.height-6)<1e-6).length,2);
const parts=rackParts(mekik,{cad:true}),braces=parts.filter(p=>p.kind==='brace');assert.ok(braces.length>=50,'Each lane and frame team needs repeated diagonal panels');assert.ok(braces.some(p=>p.rx>0)&&braces.some(p=>p.rx<0),'Diagonal direction must alternate');
for(const p of braces){const halfZ=Math.abs(Math.sin(p.rx)*p.h/2),halfY=Math.abs(Math.cos(p.rx)*p.h/2),z1=p.z-halfZ+mekik.depth/2,z2=p.z+halfZ+mekik.depth/2;assert.ok(p.y-halfY>=.149&&p.y+halfY<=mekik.height-.149);assert.ok(mekik.footFrames.some(([a,b])=>z1>=a-1e-6&&z2<=b+1e-6),'Never put a diagonal across a straight-tie gap');}
assert.equal(parts.filter(p=>p.kind==='foot').length,0,'Mekik posts must come from the same CAD source as front view');const placements=cadPlacements(mekik,templates);assert.equal(placements.filter(p=>p.name==='mekikPost').length,18);assert.equal(placements.filter(p=>p.name==='mekikBeam').length,36);
const dimensions=rackDimensions(special);assert.ok(dimensions.some(d=>d.label==='EN · 2.880 mm'));assert.ok(dimensions.some(d=>d.label==='YAN AYAK · 6.000 mm'));assert.ok(dimensions.some(d=>d.label.includes('K2 KOT')));assert.equal(mmLabel(.43),'430 mm');
const plan={points:[{x:0,z:0},{x:4,z:0},{x:4,z:3}],closed:false,breaks:[1],showAreaDimensions:true,measurePoints:[{x:0,z:0},{x:3,z:4}]};const ds=planDimensions(plan);assert.equal(ds.length,2);assert.equal(ds[0].label,'ALAN · 4.000 mm');assert.equal(ds[1].label,'MESAFE · 5.000 mm');
console.log('PASS CAD frames and dimensions: source axis/units, real model placements, special end heights, repeated alternating diagonals inside each frame team, no duplicate rough posts, saved area breaks, free measurements and millimetre labels.');

const beamScene=new THREE.Group();for(const [name,x,w,h] of [["PROFIL",0,2700,120],["SOL KONNEKTÖR",-1370,42,240],["SAĞ KONNEKTÖR",1370,42,240]]){const part=new THREE.Mesh(new THREE.BoxGeometry(w,50,h),new THREE.MeshStandardMaterial());part.name=name;part.position.set(x,0,-130);beamScene.add(part)}const beamTemplate=prepareCad(beamScene,"b2bBeam");assert.equal(beamTemplate.geometries.length,3);assert.ok(Math.abs(beamTemplate.referenceHeight-.12)<1e-6);assert.ok(beamTemplate.geometries[1].boundingBox.min.y<0,"Keep connector end plates; do not crop to beam body");console.log("PASS B2B connector CAD: two end plates, profile-based height and front/back mounting.");
