// Rank cheap bounding-box distances before testing 21 possible sight lines.
// Preserve original rack order for ties and one relation per other rack.
export function rackGapSearchV148(owner, a, racks, bounds, clearLine, clearance, perDirection) {
  const rows=[];
  racks.forEach((other,order)=>{
    if(other.id===owner.id||(owner.joinGroup&&other.joinGroup===owner.joinGroup))return;
    const b=bounds(other),hs=Math.max(a.top,b.top),he=Math.min(a.bottom,b.bottom),vs=Math.max(a.left,b.left),ve=Math.min(a.right,b.right),choices=[];
    const add=(direction,from,to,start,end)=>choices.push({direction,from,to,start,end,distance:Math.abs(to-from)});
    if(a.right<=b.left&&hs<=he)add('right',a.right,b.left,hs,he);
    if(b.right<=a.left&&hs<=he)add('left',a.left,b.right,hs,he);
    if(a.bottom<=b.top&&vs<=ve)add('bottom',a.bottom,b.top,vs,ve);
    if(b.bottom<=a.top&&vs<=ve)add('top',a.top,b.bottom,vs,ve);
    choices.sort((x,y)=>x.distance-y.distance);
    if(choices.length)rows.push({other,order,b,choices});
  });
  rows.sort((x,y)=>x.choices[0].distance-y.choices[0].distance||x.order-y.order);
  const best=new Map();
  const dominates=(known,choice,order)=>known&&(known.value.distance<choice.distance||(known.value.distance===choice.distance&&known.order<=order));
  for(const row of rows){
    if(row.choices.every(c=>dominates(best.get(perDirection?c.direction:'nearest'),c,row.order)))continue;
    let value;
    for(const c of row.choices){
      value=clearLine(owner,row.other,c.direction,c.from,c.to,c.start,c.end);
      if(value)break;
    }
    if(!value)continue;
    const key=perDirection?value.direction:'nearest';
    if(dominates(best.get(key),value,row.order))continue;
    value={...value,clearanceMm:clearance(owner,row.other,value.direction),other:row.other,a,b:row.b};
    best.set(key,{value,order:row.order});
  }
  return [...best.values()].sort((x,y)=>x.value.distance-y.value.distance||x.order-y.order).slice(0,perDirection?2:1).map(x=>x.value);
}
