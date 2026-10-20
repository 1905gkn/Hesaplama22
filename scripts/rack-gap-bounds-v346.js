const m2FrameGapCacheV346=new WeakMap();
function m2GapBoundsV346(rack){
  if(m2LayoutState.rackGapBasis!=='frame'||!rack?.b2bLayout)return m2RackBounds(rack);
  const l=rack.b2bLayout,rows=Math.max(1,Number(l.rowCount)||1),depth=Number(rack.depthMm)||Number(rack.railLength),overhang=Math.max(0,Number(l.palletOverhang)||0),frame=Number(l.frameDepth),pallet=Number(l.palletDepth)||depth/rows;
  if(!(depth>0&&frame>0&&rack.w>0&&rack.h>0))return m2RackBounds(rack);
  const key=[rack.x,rack.y,rack.w,rack.h,rack.angle,depth,overhang,frame,pallet,rows,l.rowGap].join('|'),cached=m2FrameGapCacheV346.get(rack);if(cached?.key===key)return cached.box;
  const top=-rack.h/2+overhang*rack.h/depth,bottom=-rack.h/2+((rows-1)*(pallet+Math.max(0,(Number(l.rowGap)||0)-2*overhang))+overhang+frame)*rack.h/depth;
  if(!(bottom>top&&top>=-rack.h/2-.001&&bottom<=rack.h/2+.001))return m2RackBounds(rack);
  const points=[[-rack.w/2,top],[rack.w/2,top],[rack.w/2,bottom],[-rack.w/2,bottom]].map(([x,y])=>m2RackLocalPoint(rack,x,y)),left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x)),upper=Math.min(...points.map(p=>p.y)),lower=Math.max(...points.map(p=>p.y));
  const box={left,right,top:upper,bottom:lower,cx:(left+right)/2,cy:(upper+lower)/2};m2FrameGapCacheV346.set(rack,{key,box});return box;
}
function m2CombinedGapBoundsV346(rack){
  if(m2LayoutState.rackGapBasis!=='frame')return m2CombinedRackBounds(rack);
  const selected=m2MultiSelect.rackIds.size>1&&m2MultiSelect.rackIds.has(rack?.id)?m2LayoutState.racks.filter(r=>m2MultiSelect.rackIds.has(r.id)):m2JoinedRackMembers(rack),boxes=selected.map(m2GapBoundsV346);if(!boxes.length)return m2GapBoundsV346(rack);
  const left=Math.min(...boxes.map(b=>b.left)),right=Math.max(...boxes.map(b=>b.right)),top=Math.min(...boxes.map(b=>b.top)),bottom=Math.max(...boxes.map(b=>b.bottom));return{left,right,top,bottom,cx:(left+right)/2,cy:(top+bottom)/2};
}

