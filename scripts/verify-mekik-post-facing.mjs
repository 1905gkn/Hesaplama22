import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {orientMekikFramePosts} from '../client/mekik-post-facing.mjs';

const profile=new T.BoxGeometry(.1,6,.08).translate(0,3,.02);
profile.userData.uprightCandidate594=true;profile.computeBoundingBox();
const templates={mekikPost:{geometries:[profile],frontHoleFace:.06},mekikBeam:{connectorContactZ:.0275}};
for(const depth of [3,8]){
 const frames=[[0,1],[1.3,2.3]],r={system:'mekik2',depth,foot:.1,footFrames:frames};
 const placements=[];
 for(const [start,end] of frames){
  const front=Math.max(.05,start)-depth/2,rear=end-depth/2;
  for(const x of [-.7,.7])for(const z of [front,rear])placements.push({name:'mekikPost',x,z,sx:1,sy:1,sz:1});
  for(const z of [front,rear])placements.push({name:'mekikBeam',x:0,z:z+.06-.0275+.0002});
 }
 const before=structuredClone(placements);
 orientMekikFramePosts(placements,r,templates);
 for(let i=0;i<placements.length;i++){
  const p=placements[i],old=before[i];
  if(p.name==='mekikPost'){
   const matrix=new T.Matrix4().makeRotationY(p.ry||0).setPosition(p.x,0,p.z);
   const actual=profile.boundingBox.clone().applyMatrix4(matrix),original=profile.boundingBox.clone().translate(new T.Vector3(old.x,0,old.z));
   assert(actual.min.distanceTo(original.min)<1e-7&&actual.max.distanceTo(original.max)<1e-7,'Turning a post preserves its frame envelope');
   const isFront=frames.some(([start])=>Math.abs(old.z-(Math.max(.05,start)-depth/2))<1e-6);
   assert.equal(p.ry||0,isFront?Math.PI:0,'Front web faces out; rear web keeps its outward orientation');
  }else{
   const sign=Math.cos(p.ry||0),face=p.z+sign*.0275;
   const post=placements.find(q=>q.name==='mekikPost'&&(q.ry||0)===(p.ry||0)&&Math.abs(q.z+sign*.06-(face-sign*.0002))<1e-7);
   assert(post,'Rotated connector remains seated on the actual perforated web');
  }
 }
 const stepped=before.map(p=>({...p}));
 orientMekikFramePosts(stepped,{...r,footFrames:undefined,mekikStepped:{frames:frames.map(([start,end])=>({start:start*1000,end:end*1000}))}},templates);
 assert.deepEqual(stepped,placements,'Saved stepped and legacy frame layouts use identical orientation');
}
const viewer=fs.readFileSync('client/layout-3d.entry.js','utf8');
assert(!viewer.includes('innerPostTemplate605('),'Detailed scene must preserve perforations on intermediate posts too');
assert(viewer.includes('screenLod:!protectedLod,protectedLod:false'),'Protected uprights and connectors must retain full geometry at every camera distance');
console.log('PASS front/rear web orientation, unchanged frame envelope, connector seating, stepped/legacy parity and full protected detail at every distance.');
