// The plan's first pallet / FILO entry is at local -Z. The imported shuttle
// CAD has its perforated web and connectors facing +Z. Correct the CAD parts
// together at each station; retain frame positions, rear extension and angle.
export function faceMekikCadToPlan(placements,r,templates){
 if(r.system!=='mekik2')return placements;
 const post=templates.mekikPost,beam=templates.mekikBeam;
 const profile=post?.geometries?.find(g=>g.userData.uprightCandidate594);
 if(!profile||!Number.isFinite(post.frontHoleFace)||post.frontHoleFace<=0)return placements;
 if(!profile.boundingBox)profile.computeBoundingBox();
 const center=(profile.boundingBox.min.z+profile.boundingBox.max.z)/2;
 for(const p of placements){
  if(p.name==='mekikPost'){
   p.ry=Math.PI;p.z+=2*center*p.sz;
  }else if(p.name==='mekikBeam'&&Number.isFinite(beam?.connectorContactZ)){
   p.ry=Math.PI;
   p.z+=2*(center-post.frontHoleFace+beam.connectorContactZ-.0002);
  }
 }
 return placements;
}
