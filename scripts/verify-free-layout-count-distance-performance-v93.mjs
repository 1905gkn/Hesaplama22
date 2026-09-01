import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";

const cellSize = 50;
const racks = [];
let id = 1;
for (let row = 0; row < 15; row += 1) {
  for (let column = 0; column < 26; column += 1) {
    const quarter = (row + column) % 7 === 0;
    racks.push({ id:id++, x:20+column*36, y:18+row*39, w:quarter?16:24, h:quarter?24:16, angle:quarter?90:0, joinGroup:null });
  }
}

const walls = [
  [{x:0,y:0},{x:1000,y:0}],
  [{x:1000,y:0},{x:1000,y:650}],
  [{x:1000,y:650},{x:0,y:650}],
  [{x:0,y:650},{x:0,y:0}],
];

const bounds = (rack) => {
  const quarter = Math.abs(rack.angle % 180) === 90;
  const width = quarter ? rack.h : rack.w;
  const height = quarter ? rack.w : rack.h;
  const cx = rack.x + rack.w/2;
  const cy = rack.y + rack.h/2;
  return {left:cx-width/2,right:cx+width/2,top:cy-height/2,bottom:cy+height/2,cx,cy};
};

const cross = (p,q,r) => (q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
const on = (p,q,r) => Math.abs(cross(p,q,r))<.001&&r.x>=Math.min(p.x,q.x)-.001&&r.x<=Math.max(p.x,q.x)+.001&&r.y>=Math.min(p.y,q.y)-.001&&r.y<=Math.max(p.y,q.y)+.001;
const segmentsTouch = (a,b,c,d) => {
  const c1=cross(a,b,c),c2=cross(a,b,d),c3=cross(c,d,a),c4=cross(c,d,b);
  return (Math.sign(c1)!==Math.sign(c2)&&Math.sign(c3)!==Math.sign(c4))||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b);
};

let bruteChecks = 0;
function bruteBlocked(ax,ay,bx,by,rackId,otherId){
  const a={x:ax,y:ay},b={x:bx,y:by};
  if(walls.some(([c,d])=>segmentsTouch(a,b,c,d)))return true;
  const horizontal=Math.abs(ay-by)<.001;
  return racks.some((rack)=>{
    if(rack.id===rackId||rack.id===otherId)return false;bruteChecks+=1;
    const box=bounds(rack);
    return horizontal?ay>box.top&&ay<box.bottom&&Math.max(Math.min(ax,bx),box.left)<Math.min(Math.max(ax,bx),box.right):ax>box.left&&ax<box.right&&Math.max(Math.min(ay,by),box.top)<Math.min(Math.max(ay,by),box.bottom);
  });
}

const grid=new Map(),boundsById=new Map();
for(const rack of racks){
  const box=bounds(rack);boundsById.set(rack.id,box);
  const x0=Math.floor((box.left-.001)/cellSize),x1=Math.floor((box.right+.001)/cellSize),y0=Math.floor((box.top-.001)/cellSize),y1=Math.floor((box.bottom+.001)/cellSize);
  for(let gx=x0;gx<=x1;gx+=1)for(let gy=y0;gy<=y1;gy+=1){const key=gx+":"+gy,list=grid.get(key);if(list)list.push(rack.id);else grid.set(key,[rack.id]);}
}

let indexedChecks = 0;
function indexedBlocked(ax,ay,bx,by,rackId,otherId){
  const a={x:ax,y:ay},b={x:bx,y:by};
  if(walls.some(([c,d])=>segmentsTouch(a,b,c,d)))return true;
  const epsilon=.001,x0=Math.floor((Math.min(ax,bx)-epsilon)/cellSize),x1=Math.floor((Math.max(ax,bx)+epsilon)/cellSize),y0=Math.floor((Math.min(ay,by)-epsilon)/cellSize),y1=Math.floor((Math.max(ay,by)+epsilon)/cellSize),ids=new Set();
  for(let gx=x0;gx<=x1;gx+=1)for(let gy=y0;gy<=y1;gy+=1)(grid.get(gx+":"+gy)||[]).forEach((candidate)=>ids.add(candidate));
  const horizontal=Math.abs(ay-by)<.001;
  for(const candidate of ids){
    if(candidate===rackId||candidate===otherId)continue;indexedChecks+=1;
    const box=boundsById.get(candidate);
    if(horizontal?ay>box.top&&ay<box.bottom&&Math.max(Math.min(ax,bx),box.left)<Math.min(Math.max(ax,bx),box.right):ax>box.left&&ax<box.right&&Math.max(Math.min(ay,by),box.top)<Math.min(Math.max(ay,by),box.bottom))return true;
  }
  return false;
}

function clearLine(blocked,rack,other,direction,from,to,laneStart,laneEnd){
  const horizontal=direction==="left"||direction==="right",middle=(laneStart+laneEnd)/2,span=laneEnd-laneStart,lanes=[middle];
  for(let step=1;step<=20;step+=1){const offset=span*Math.ceil(step/2)/40;lanes.push(middle+(step%2?-offset:offset));}
  for(const lane of lanes){const ax=horizontal?from:lane,ay=horizontal?lane:from,bx=horizontal?to:lane,by=horizontal?lane:to;if(!blocked(ax,ay,bx,by,rack.id,other.id))return{direction,distance:Math.abs(to-from),ax,ay,bx,by};}
  return null;
}

function nearest(rack,blocked){
  const a=bounds(rack);let best=null;
  for(const other of racks){
    if(other.id===rack.id)continue;
    const b=bounds(other),candidates=[],horizontalStart=Math.max(a.top,b.top),horizontalEnd=Math.min(a.bottom,b.bottom),verticalStart=Math.max(a.left,b.left),verticalEnd=Math.min(a.right,b.right);
    if(a.right<=b.left&&horizontalStart<=horizontalEnd){const value=clearLine(blocked,rack,other,"right",a.right,b.left,horizontalStart,horizontalEnd);if(value)candidates.push(value);}
    if(b.right<=a.left&&horizontalStart<=horizontalEnd){const value=clearLine(blocked,rack,other,"left",a.left,b.right,horizontalStart,horizontalEnd);if(value)candidates.push(value);}
    if(a.bottom<=b.top&&verticalStart<=verticalEnd){const value=clearLine(blocked,rack,other,"bottom",a.bottom,b.top,verticalStart,verticalEnd);if(value)candidates.push(value);}
    if(b.bottom<=a.top&&verticalStart<=verticalEnd){const value=clearLine(blocked,rack,other,"top",a.top,b.bottom,verticalStart,verticalEnd);if(value)candidates.push(value);}
    const candidate=candidates.sort((first,second)=>first.distance-second.distance)[0];if(candidate&&(!best||candidate.distance<best.distance))best={...candidate,otherId:other.id};
  }
  return best;
}

const samples=[racks[0],racks[37],racks[119],racks[241],racks[389]];
const bruteStart=performance.now();
const expected=samples.map((rack)=>nearest(rack,bruteBlocked));
const bruteMs=performance.now()-bruteStart;
const indexedStart=performance.now();
const actual=samples.map((rack)=>nearest(rack,indexedBlocked));
const indexedMs=performance.now()-indexedStart;

assert.deepEqual(actual,expected,"Bolgesel tablo en yakin raf sonucunu degistirdi");
assert.ok(indexedChecks<bruteChecks*.25,`Engel adaylari yeterince azalmadi: ${indexedChecks}/${bruteChecks}`);
console.log(JSON.stringify({racks:racks.length,samples:samples.length,bruteChecks,indexedChecks,reductionPercent:Math.round((1-indexedChecks/bruteChecks)*100),bruteMs:Number(bruteMs.toFixed(2)),indexedMs:Number(indexedMs.toFixed(2))}));
