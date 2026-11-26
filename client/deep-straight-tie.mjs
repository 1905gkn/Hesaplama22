const variants=new WeakMap();

export function straightTieTemplate(template,span){
 let cache=variants.get(template);
 if(!cache){cache=new Map();variants.set(template,cache);}
 const key=span.toFixed(6);
 if(cache.has(key))return cache.get(key);
 const sourceHalf=template.depth/2,targetHalf=span/2;
 const plate=Math.min(.004,span*.25,sourceHalf*.5);
 const geometries=template.geometries.map(source=>{
  const geometry=source.clone(),position=geometry.attributes.position;
  for(let i=0;i<position.count;i++){
   const z=position.getZ(i),a=Math.abs(z);
   const next=a>=sourceHalf-plate?targetHalf-(sourceHalf-a):a*(targetHalf-plate)/(sourceHalf-plate);
   position.setZ(i,Math.sign(z)*next);
  }
  geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
  return geometry;
 });
 const result={...template,geometries};cache.set(key,result);return result;
}

export function deepStraightTiePlacements(r,posts,template,tieHeight){
 const shaft=post=>template.geometries.filter(g=>g.userData.uprightCandidate594).map(g=>{
  const box=g.boundingBox,axis=Math.cos(post.ry||0)*post.sz;
  const a=post.z+box.min.z*axis,b=post.z+box.max.z*axis;
  return {min:Math.min(a,b),max:Math.max(a,b),center:(a+b)/2};
 });
 const lanes=new Map();
 for(const post of posts){if(!lanes.has(post.x))lanes.set(post.x,[]);lanes.get(post.x).push(...shaft(post));}
 const items=[],drive=r.system==='drive',stepped=drive?r.driveStepped:r.mekikStepped;
 const pitch=(r.width-r.foot)/r.bays;
 for(let lane=0;lane<=r.bays;lane++){
  const x=-r.width/2+r.foot/2+lane*pitch;
  const matchingX=[...lanes.keys()].find(key=>Math.abs(key-x)<1e-6);
  const shafts=lanes.get(matchingX)||[];
  const frames=stepped?(drive?stepped.frames:stepped.frameRows?.[lane]||stepped.frames).map(f=>[f.start/1000,f.end/1000]):r.footFrames||[];
  const levels=stepped?(drive?stepped.floors:stepped.lanes?.filter(l=>l.index===lane||l.index===lane-1).flatMap(l=>l.model.floors)||stepped.floors):r.floors.map((y,index)=>({y:y*1000,index}));
  const floors=levels?.length?levels:stepped?.floors||[];
  const terminal=!drive&&r.hasExtra&&frames.length&&r.depth-frames.at(-1)[1]>r.foot?[...frames,[r.depth-r.foot/2,r.depth]]:frames;
  for(let i=0;i+1<terminal.length;i++){
   const [end,start]=[terminal[i][1],terminal[i+1][0]];
   if(start-end<.008)continue;
   const shared=r.depthSharedSupport;
   if(shared?.braces?.includes(i)&&Math.abs(x-(shared.side==='left'?-1:1)*(r.width-r.foot)/2)<.001)continue;
   const near=z=>shafts.reduce((best,s)=>!best||Math.abs(s.center-z)<Math.abs(best.center-z)?s:best,null);
   const back=near(end-r.depth/2),front=near(start-r.depth/2);
   if(!back||!front||back===front||front.min-back.max<.008)continue;
   const seen=new Set();
   for(const floor of floors){
    if(drive&&floor.index%2!==0)continue;
    if(floor.runs&&!floor.runs.some(run=>run.firstFrame<=i&&(run.lastFrame>i||i===frames.length-1&&terminal.length>frames.length&&run.lastFrame===i)))continue;
    const y=Math.max(0,floor.y/1000-.2-tieHeight/2);
    if(seen.has(y))continue;seen.add(y);
    items.push({name:'deepStraightTie',color:/^(pgv|galvanized)$/i.test(r.footColor)?(r.beamColor||'ral1007'):'ral5010',x,y,z:(back.max+front.min)/2,sx:1,sy:1,sz:1,tieSpan:front.min-back.max});
   }
  }
 }
 return items;
}
