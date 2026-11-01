export function gridOutsideWalls(vertices,loops){
 if(!loops.length)return Array.from(vertices);const out=[],inside=p=>loops.some(r=>{let hit=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a.z>p.z)!==(b.z>p.z)&&p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x)hit=!hit;}return hit;});
 for(let i=0;i<vertices.length;i+=6){const ax=vertices[i],ay=vertices[i+1],az=vertices[i+2],dx=vertices[i+3]-ax,dz=vertices[i+5]-az,cuts=[0,1];for(const ring of loops)for(let j=0;j<ring.length;j++){const a=ring[j],b=ring[(j+1)%ring.length],ex=b.x-a.x,ez=b.z-a.z,det=dx*ez-dz*ex;if(Math.abs(det)<1e-9)continue;const t=((a.x-ax)*ez-(a.z-az)*ex)/det,u=((a.x-ax)*dz-(a.z-az)*dx)/det;if(t>0&&t<1&&u>=0&&u<=1)cuts.push(t);}cuts.sort((a,b)=>a-b);for(let j=1;j<cuts.length;j++){const a=cuts[j-1],b=cuts[j],m=(a+b)/2;if(b-a<1e-8||inside({x:ax+dx*m,z:az+dz*m}))continue;out.push(ax+dx*a,ay,az+dz*a,ax+dx*b,ay,az+dz*b);}}
 return out;
}
export function closedWallFloors(segments){
 const key=p=>p.x+':'+p.z,adj=new Map(),used=new Set(),loops=[];segments.forEach((s,i)=>{for(const p of [s.a,s.b]){const k=key(p);if(!adj.has(k))adj.set(k,[]);adj.get(k).push(i)}});
 for(let i=0;i<segments.length;i++){if(used.has(i))continue;let at=segments[i].a,start=key(at),edge=i,ring=[],local=new Set();while(!local.has(edge)){local.add(edge);ring.push(at);const s=segments[edge];at=key(s.a)===key(at)?s.b:s.a;if(key(at)===start){if(ring.length>=3)loops.push(ring);break}const next=(adj.get(key(at))||[]).filter(n=>n!==edge);if(next.length!==1)break;edge=next[0];}for(const n of local)used.add(n);}
 return loops;
}
const positive=(n,f)=>Number(n)>0?Number(n):f;
export function planWallSegments(state){
 const out=[],seen=new Set();const add=(a,b)=>{if(!a||!b||![a.x,a.y,b.x,b.y].every(v=>Number.isFinite(Number(v)))||Math.hypot(b.x-a.x,b.y-a.y)<1e-8)return;const first=[Number(a.x),Number(a.y)],last=[Number(b.x),Number(b.y)],key=[first.join(':'),last.join(':')].sort().join('|');if(seen.has(key))return;seen.add(key);out.push({a:{x:first[0],y:first[1]},b:{x:last[0],y:last[1]}})};
 const path=(p,closed,breaks=[])=>{for(let i=0;i<(closed?p.length:p.length-1);i++)if(!breaks.includes(i))add(p[i],p[(i+1)%p.length])};path(state.points||[],state.closed,state.pathBreaks||[]);for(const e of state.cadElements||[])if(e.type==='wall')path(e.points||[],e.closed);return out;
}
export function environmentSnapshot(state,symbols=[]){
 const unit=1/(positive(state.scale,.04)*1000),segments=planWallSegments(state),all=symbols.filter(s=>s.type==='column'||s.type==='door').slice(),represented=new Set(all.filter(s=>s.cadElement).map(s=>JSON.stringify([s.cadElement.type,s.cadElement.points])));
 for(const e of state.cadElements||[]){if(!['column','door'].includes(e.type)||represented.has(JSON.stringify([e.type,e.points]))||!e.points?.length)continue;const xs=e.points.map(p=>Number(p.x)),ys=e.points.map(p=>Number(p.y));all.push({id:e.id,type:e.type,x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)});}
 const worldSegments=segments.map(s=>({a:{x:s.a.x*unit,z:s.a.y*unit},b:{x:s.b.x*unit,z:s.b.y*unit}}));
 return {floorLoops:closedWallFloors(worldSegments),wallless:!segments.length,wallSegments:segments.map(s=>({a:{x:s.a.x*unit,z:s.a.y*unit},b:{x:s.b.x*unit,z:s.b.y*unit}})),symbols:all.map(s=>({id:s.id,type:s.type,x:(Number(s.x)+Number(s.w)/2)*unit,z:(Number(s.y)+Number(s.h)/2)*unit,width:positive(s.widthMm,Math.max(1,Number(s.w))*unit*1000)/1000,depth:positive(s.depthMm,Math.max(1,Number(s.h))*unit*1000)/1000,angle:-(Number(s.angle)||0)*Math.PI/180}))};
}
export function rackVisualTop(r){
 const special=(r.frameHeights||[]).flatMap(row=>[Number(row.left)/1000,Number(row.right)/1000]).filter(Number.isFinite);
 const loads=r.system==='mr'?[]:r.system==='konsol'?r.floors.map(y=>y+r.productHeight+.12):r.floors.map((y,i)=>y+r.palletHeights[i]);
 return Math.max(r.height,...special,...loads);
}
export function environmentParts(data){
 const out=[],box=(kind,x,y,z,w,h,d,ry=0)=>{if([x,y,z,w,h,d,ry].every(Number.isFinite)&&w>0&&h>0&&d>0)out.push({kind,x,y,z,w,h,d,ry});};
 const symbols=data.symbols||[],points=data.points||[],thickness=.12,wallHeight=positive(data.wallHeight,1);
 let area=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];area+=a.x*b.z-b.x*a.z;}
 const segments=data.wallSegments||points.flatMap((a,i)=>{const j=(i+1)%points.length;return (j===0&&!data.closed)||data.breaks.includes(i)?[]:[{a,b:points[j]}]});
 if(!data.wallless)for(const {a,b} of segments){
  const dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);if(length<.001)continue;
  const ux=dx/length,uz=dz/length,sign=area>=0?1:-1,nx=sign*uz,nz=-sign*ux,cuts=[];
  for(const door of symbols.filter(s=>s.type==='door')){
   const offsetX=door.x-a.x,offsetZ=door.z-a.z,position=offsetX*ux+offsetZ*uz,distance=Math.abs(offsetX*uz-offsetZ*ux),alignment=Math.abs(Math.cos(door.angle)*ux-Math.sin(door.angle)*uz);
   if(distance>door.depth/2+.15||alignment<.95)continue;const half=door.width/2;if(position+half<=0||position-half>=length)continue;cuts.push([Math.max(0,position-half),Math.min(length,position+half)]);
  }
  let cursor=0;const wall=(start,end)=>{if(end-start<.01)return;const t=(start+end)/2;box('wall',a.x+t*ux+nx*thickness/2,wallHeight/2,a.z+t*uz+nz*thickness/2,end-start,wallHeight,thickness,-Math.atan2(dz,dx));};
  for(const [start,end] of cuts.sort((a,b)=>a[0]-b[0])){if(start>cursor)wall(cursor,start);cursor=Math.max(cursor,end);}wall(cursor,length);
 }
 for(const s of symbols){
  if(s.type==='column'){box('column',s.x,.5,s.z,s.width,1,s.depth,s.angle);continue;}
  const c=Math.cos(s.angle),sn=Math.sin(s.angle),post=.05,position=x=>[s.x+x*c,s.z-x*sn];
  for(const side of [-1,1]){const [x,z]=position(side*(s.width-post)/2);box('door',x,.5,z,post,1,Math.max(.07,s.depth),s.angle);}
  box('door',s.x,.97,s.z,s.width,.06,Math.max(.07,s.depth),s.angle);
  // A half-open cutaway leaf makes the door location legible at the wall height.
  const width=Math.max(.1,s.width-2*post),hinge=position(-s.width/2+post),angle=s.angle-Math.PI/4;
  box('doorLeaf',hinge[0]+Math.cos(angle)*width/2,.45,hinge[1]-Math.sin(angle)*width/2,width,.9,.025,angle);
 }
 return out;
}
