(()=>{
 const eps=1e-8;
 const overlap=(a,b)=>a.left<b.right-eps&&a.right>b.left+eps&&a.top<b.bottom-eps&&a.bottom>b.top+eps;
 function obstacles(symbol){return m2LayoutState.racks.map(r=>m2RackBounds(r)).concat(m2LayoutSymbols.filter(s=>s.id!==symbol.id&&(s.type==='column'||s.blocking)).map(s=>m2SymbolBounds(s)));}
 function valid(symbol,x=symbol.x,y=symbol.y){const b=m2SymbolBounds(symbol,x,y);return b.left>=-eps&&b.top>=-eps&&b.right<=1000+eps&&b.bottom<=650+eps&&!obstacles(symbol).some(o=>overlap(b,o));}
 // Swept AABB: a fast pointer jump cannot cross through a rack and land on its far side.
 function sweep(box,dx,dy,blocks){
  let time=1,axis=null;
  for(const b of blocks){
   if(overlap(box,b))continue; // Legacy overlap can be moved out, but not deeper in.
   let near=-Infinity,far=Infinity,hitAxis=null,miss=false;
   for(const [d,lo,hi,min,max,a] of [[dx,box.left,box.right,b.left,b.right,'x'],[dy,box.top,box.bottom,b.top,b.bottom,'y']]){
    if(Math.abs(d)<eps){if(hi<=min+eps||lo>=max-eps){miss=true;break;}continue;}
    const n=d>0?(min-hi)/d:(max-lo)/d,f=d>0?(max-lo)/d:(min-hi)/d;
    if(n>near){near=n;hitAxis=a;}far=Math.min(far,f);
   }
   if(!miss&&near<far-eps&&far>eps&&near>=-eps&&near<time){time=Math.max(0,near);axis=hitAxis;}
  }
  return {time,axis};
 }
 function move(symbol,x,y){
  if(symbol.type!=='column'){symbol.x=x;symbol.y=y;return true;}
  const start=m2SymbolBounds(symbol),blocks=obstacles(symbol),original={x:symbol.x,y:symbol.y};
  let dx=x-original.x,dy=y-original.y;
  dx=Math.max(-start.left,Math.min(1000-start.right,dx));dy=Math.max(-start.top,Math.min(650-start.bottom,dy));
  const hit=sweep(start,dx,dy,blocks);
  let nx=original.x+dx*hit.time,ny=original.y+dy*hit.time;
  if(hit.time<1){const box=m2SymbolBounds(symbol,nx,ny),sx=hit.axis==='y'?dx*(1-hit.time):0,sy=hit.axis==='x'?dy*(1-hit.time):0,slide=sweep(box,sx,sy,blocks);nx+=sx*slide.time;ny+=sy*slide.time;}
  const next=m2SymbolBounds(symbol,nx,ny);
  // Permit recovery of old invalid placements only when every overlap decreases.
  const area=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  if(blocks.some(b=>overlap(next,b)&&area(next,b)>=area(start,b)-eps)){return false;}
  symbol.x=nx;symbol.y=ny;return Math.abs(nx-x)<eps&&Math.abs(ny-y)<eps;
 }
 function place(symbol){
  if(valid(symbol))return true;
  const origin={x:symbol.x,y:symbol.y},box=m2SymbolBounds(symbol),blocks=obstacles(symbol),left=box.left-symbol.x,top=box.top-symbol.y,right=box.right-symbol.x,bottom=box.bottom-symbol.y;
  const candidates=[{x:-left,y:-top},{x:1000-right,y:-top},{x:-left,y:650-bottom},{x:1000-right,y:650-bottom}];
  for(const b of blocks)for(const x of [b.left-right,b.right-left])for(const y of [origin.y,b.top-bottom,b.bottom-top])candidates.push({x,y});
  for(const b of blocks)for(const y of [b.top-bottom,b.bottom-top])candidates.push({x:origin.x,y});
  candidates.sort((a,b)=>Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(b.x-origin.x,b.y-origin.y));
  for(const p of candidates){const a=m2SymbolBounds(symbol,p.x,p.y);if(a.left>=-eps&&a.top>=-eps&&a.right<=1000+eps&&a.bottom<=650+eps&&!blocks.some(b=>overlap(a,b))){symbol.x=p.x;symbol.y=p.y;return true;}}
  return false;
 }
 function shape(s,selected){
  const stroke=Math.min(selected?1.1:.7,s.w*.1,s.h*.1),half=stroke/2,x=s.x+half,y=s.y+half,w=Math.max(0,s.w-stroke),h=Math.max(0,s.h-stroke);
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(.4,w*.05,h*.05)}" class="m2-symbol-shape m2-symbol-column" style="stroke-width:${stroke}px"/><path d="M${x} ${y}L${x+w} ${y+h}M${x+w} ${y}L${x} ${y+h}" stroke="#d9dfe3" stroke-width="${Math.min(.5,stroke*.65)}"/>`;
 }
 window.rafexColumnV204={move,valid,place,shape,sweep};
 const nearest=m2NearestSymbolRackRelation;
 m2NearestSymbolRackRelation=window.m2NearestSymbolRackRelation=function(symbol){
  if(symbol.type!=='column')return nearest.apply(this,arguments);
  const a=m2SymbolBounds(symbol);let best=null;
  for(const rack of m2LayoutState.racks){const b=m2RackBounds(rack),cy=(Math.max(a.top,b.top)+Math.min(a.bottom,b.bottom))/2,cx=(Math.max(a.left,b.left)+Math.min(a.right,b.right))/2;let c=null;
   if(Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)+eps){if(a.right<=b.left+eps)c={d:Math.max(0,b.left-a.right),moveAxis:'x',moveSign:-1,x1:a.right,y1:cy,x2:b.left,y2:cy};else if(b.right<=a.left+eps)c={d:Math.max(0,a.left-b.right),moveAxis:'x',moveSign:1,x1:a.left,y1:cy,x2:b.right,y2:cy};}
   if(Math.min(a.right,b.right)>Math.max(a.left,b.left)+eps){if(a.bottom<=b.top+eps)c={d:Math.max(0,b.top-a.bottom),moveAxis:'y',moveSign:-1,x1:cx,y1:a.bottom,x2:cx,y2:b.top};else if(b.bottom<=a.top+eps)c={d:Math.max(0,a.top-b.bottom),moveAxis:'y',moveSign:1,x1:cx,y1:a.top,x2:cx,y2:b.bottom};}
   if(c&&(!best||c.d<best.d))best=c;
  }
  return best;
 };
})();
