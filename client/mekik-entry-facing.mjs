// The plan's first pallet / FILO entry is at local -Z.
// The two webs face outwards so the open profiles face into the frame.
export function faceMekikCadToPlan(placements,r,templates){
 if(r.system!=='mekik2')return placements;
 const post=templates.mekikPost,beam=templates.mekikBeam;
 const profile=post?.geometries?.find(g=>g.userData.uprightCandidate594);
 if(!profile||!Number.isFinite(post.frontHoleFace)||post.frontHoleFace<=0)return placements;
 if(!profile.boundingBox)profile.computeBoundingBox();
 const center=(profile.boundingBox.min.z+profile.boundingBox.max.z)/2;
 const frames=(r.mekikStepped?.frameRows?.flat()||r.mekikStepped?.frames)?.map(f=>[f.start/1000,f.end/1000])||r.footFrames||[];
 const at=z=>Math.max(r.foot/2,Math.min(r.depth-r.foot/2,z))-r.depth/2;
 const backs=new Set(frames.map(([,end])=>at(end).toFixed(6)));
 for(const [start] of frames)backs.delete(at(start).toFixed(6));
 for(const p of placements){
  if(p.name==='mekikPost'){
   if(backs.has(p.z.toFixed(6)))continue;
   p.ry=Math.PI;p.z+=2*center*p.sz;
  }else if(p.name==='mekikBeam'&&Number.isFinite(beam?.connectorContactZ)){
   const station=p.z-post.frontHoleFace+beam.connectorContactZ-.0002;
   if(backs.has(station.toFixed(6)))continue;
   p.ry=Math.PI;
   p.z+=2*(center-post.frontHoleFace+beam.connectorContactZ-.0002);
  }
 }
 return placements;
}

export function mekikBraceSeats(template){
 const profile=template?.geometries?.find(g=>g.userData.uprightCandidate594);
 if(!profile)return null;
 if(!profile.boundingBox)profile.computeBoundingBox();
 const {min,max}=profile.boundingBox;
 // Use the post section, excluding the wider base plate. A small overlap
 // seats cut brace ends into the lip instead of leaving a visible hairline.
 const overlap=.004;
 return {front:max.z-overlap,rear:min.z+overlap};
}
