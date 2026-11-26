// Front uprights expose the perforated web outside each braced frame. Rotate
// around the profile centre so the frame envelope and rail seats do not move.
export function orientMekikFramePosts(placements,r,templates){
 if(r.system!=='mekik2')return placements;
 const post=templates.mekikPost,beam=templates.mekikBeam;
 if(!post?.geometries||!Number.isFinite(post.frontHoleFace))return placements;
 const profile=post.geometries.find(g=>g.userData.uprightCandidate594);
 if(!profile)return placements;
 if(!profile.boundingBox)profile.computeBoundingBox();
 const center=(profile.boundingBox.min.z+profile.boundingBox.max.z)/2;
 const frames=r.mekikStepped?.frames||r.footFrames?.map(([start,end])=>({start:start*1000,end:end*1000}))||[];
 const starts=frames.length?frames.map(f=>Math.max(r.foot/2,Math.min(r.depth-r.foot/2,f.start/1000))-r.depth/2):[Math.min(...placements.filter(p=>p.name==='mekikPost').map(p=>p.z))];
 const turned=[];
 for(const p of placements){
  if(p.name!=='mekikPost'||!starts.some(z=>Math.abs(z-p.z)<1e-6))continue;
  const origin=p.z;
  p.ry=Math.PI;p.z+=2*center*p.sz;
  turned.push({origin,face:p.z-post.frontHoleFace*p.sz});
 }
 for(const p of placements){
  if(p.name!=='mekikBeam'||!Number.isFinite(beam?.connectorContactZ))continue;
  const contact=p.z+beam.connectorContactZ-.0002;
  const support=turned.find(v=>Math.abs(contact-(v.origin+post.frontHoleFace))<1e-6);
  if(!support)continue;
  p.ry=Math.PI;p.z=support.face+beam.connectorContactZ-.0002;
 }
 return placements;
}
