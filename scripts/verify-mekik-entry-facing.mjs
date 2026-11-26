import assert from 'node:assert/strict';
import * as T from 'three';
import {cadPlacements} from '../client/layout-3d-cad.mjs';
import {layoutSnapshot} from '../client/layout-3d-data.mjs';

export function verifyMekikEntryFacing(post,beam){
 const r={system:'mekik2',width:3,foot:.1,bays:2,footZ:[0,1],footFrames:[[0,1]],depth:1.1,height:3.5,floors:[.43,2.08],railHeight:.17,hasExtra:false};
 const stepped={...r,mekikStepped:{version:517,frames:[{start:0,end:1000,height:3500,levels:2}],floors:r.floors.map((y,index)=>({index,y:y*1000,positions:[0],runs:[{start:0,end:1000,stations:[50,1000]}]}))}};
 for(const rack of [r,stepped]){
  const placements=cadPlacements(rack,{mekikPost:post,mekikBeam:beam});
  const posts=placements.filter(p=>p.name==='mekikPost'),beams=placements.filter(p=>p.name==='mekikBeam');
  assert(posts.length&&beams.length);
  for(const p of posts){
   const rear=p.z>0;
   assert.equal(p.ry||0,rear?0:Math.PI,'Paired profiles open toward each other');
   assert.ok(Math.abs(p.z-(rear?1-r.depth/2:.05-r.depth/2+.04))<1e-6,'Rotation keeps the original frame stations');
  }
  for(const p of beams){
   const direction=Math.cos(p.ry||0),contact=p.z+direction*(beam.connectorContactZ-.0002);
   const supports=posts.filter(q=>Math.abs(q.z+Math.cos(q.ry||0)*post.frontHoleFace-contact)<1e-6&&Math.abs(Math.abs(q.x-p.x)-(r.width-r.foot)/r.bays/2)<1e-6);
   assert.equal(supports.length,2,'Both connector plates stay on the actual rotated upright webs');
  }
  for(const degrees of [0,90,180,270]){
   const a=degrees*Math.PI/180;
   const snap=layoutSnapshot({scale:1,racks:[{id:1,rafexSystem:'mekik2',x:0,y:0,w:3000,h:1100,angle:degrees}]});
   const world=new T.Matrix4().makeRotationY(JSON.parse(JSON.stringify(snap)).racks[0].angle);
   const arrow=new T.Vector3(Math.sin(a),0,-Math.cos(a));
   for(const p of posts){const web=new T.Vector3(0,0,1).applyAxisAngle(new T.Vector3(0,1,0),p.ry||0).transformDirection(world);assert(web.dot(arrow)*(p.z>0?-1:1)>.999999,'3D front agrees with the rotated plan entry at '+degrees+' degrees');}
  }
 }
 console.log('PASS actual shuttle CAD: plan entry matches 3D front at 0/90/180/270°, legacy/stepped frames, unchanged stations and both connector contacts.');
}
