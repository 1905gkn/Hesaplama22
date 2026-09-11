import assert from 'node:assert/strict';
import {rackGapSearchV148} from './rack-gap-search-v148.mjs';

// Reference: the previous exhaustive search, retaining its direction and tie order.
function exhaustive(owner,a,racks,bounds,clearLine,clearance,perDirection){
  const relations=[];
  for(const other of racks){
    if(other.id===owner.id||(owner.joinGroup&&other.joinGroup===owner.joinGroup))continue;
    const b=bounds(other),candidates=[],hs=Math.max(a.top,b.top),he=Math.min(a.bottom,b.bottom),vs=Math.max(a.left,b.left),ve=Math.min(a.right,b.right);
    if(a.right<=b.left&&hs<=he)candidates.push(clearLine(owner,other,'right',a.right,b.left,hs,he));
    if(b.right<=a.left&&hs<=he)candidates.push(clearLine(owner,other,'left',a.left,b.right,hs,he));
    if(a.bottom<=b.top&&vs<=ve)candidates.push(clearLine(owner,other,'bottom',a.bottom,b.top,vs,ve));
    if(b.bottom<=a.top&&vs<=ve)candidates.push(clearLine(owner,other,'top',a.top,b.bottom,vs,ve));
    const candidate=candidates.filter(Boolean).sort((x,y)=>x.distance-y.distance)[0];
    if(candidate)relations.push({...candidate,clearanceMm:clearance(owner,other,candidate.direction),other,a,b});
  }
  relations.sort((x,y)=>x.distance-y.distance);
  if(!perDirection)return relations.slice(0,1);
  const best=new Map();for(const r of relations)if(!best.has(r.direction))best.set(r.direction,r);
  return [...best.values()].sort((x,y)=>x.distance-y.distance).slice(0,2);
}
let seed=148;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
let checks=0;
for(let test=0;test<1000;test++){
  const racks=Array.from({length:50},(_,id)=>{const x=Math.floor(random()*15)*10,y=Math.floor(random()*15)*10,w=10+Math.floor(random()*3)*10,h=10+Math.floor(random()*3)*10;return{id,joinGroup:id%7===0?'joined':null,box:{left:x,right:x+w,top:y,bottom:y+h}}});
  const owner=racks[test%racks.length],bounds=r=>r.box;
  const clear=(o,r,d,from,to,start,end)=>((r.id+test+['left','right','top','bottom'].indexOf(d))%4===0)?null:{direction:d,distance:Math.abs(to-from),ax:from,ay:(start+end)/2,bx:to,by:(start+end)/2};
  const clearance=(o,r)=>r.id%3*50;
  for(const mode of [false,true]){assert.deepEqual(rackGapSearchV148(owner,owner.box,racks,bounds,clear,clearance,mode),exhaustive(owner,owner.box,racks,bounds,clear,clearance,mode));checks++;}
}
console.log(`v148: ${checks} exhaustive comparisons passed (blocked directions, ties, touching corners and joined racks).`);
