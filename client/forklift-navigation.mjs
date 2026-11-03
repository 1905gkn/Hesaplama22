// Metres. A conservative full footprint includes lowered forks and clearance.
export const HALF_LENGTH=1.55, HALF_WIDTH=.62, TURN_RADIUS=1.72, SEPARATION=3.55;
const inside=(x,z,ring)=>{let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)hit=!hit;}return hit;};
export function navigationSpace(data,parts=[]){
 const obstacles=(data.racks||[]).map(r=>({x:r.x,z:r.z,w:r.width+.12,d:r.depth+.2,a:r.angle||0}));
 for(const p of parts)if(['wall','column','doorLeaf'].includes(p.kind))obstacles.push({x:p.x,z:p.z,w:p.w,d:p.d,a:p.ry||0});
 for(const p of data.symbols||[])if(['uaks','uakz','barrier'].includes(p.type))obstacles.push({x:p.x,z:p.z,w:Math.max(.25,p.width),d:Math.max(.25,p.depth),a:p.angle||0});
 const loops=(data.floorLoops||[]).filter(r=>r.length>2),points=loops.length?loops.flat():[...(data.points||[]),...obstacles.flatMap(o=>{const d=Math.hypot(o.w,o.d)/2;return [{x:o.x-d,z:o.z-d},{x:o.x+d,z:o.z+d}];})];
 if(!points.length)return null;
 const pad=loops.length?0:4,bounds={minX:Math.min(...points.map(p=>p.x))-pad,maxX:Math.max(...points.map(p=>p.x))+pad,minZ:Math.min(...points.map(p=>p.z))-pad,maxZ:Math.max(...points.map(p=>p.z))+pad};
 const buckets=new Map(),bucketSize=6;
 for(const o of obstacles){o.c=Math.cos(o.a);o.s=Math.sin(o.a);o.hw=o.w/2;o.hd=o.d/2;const ex=Math.abs(o.c)*o.hw+Math.abs(o.s)*o.hd,ez=Math.abs(o.s)*o.hw+Math.abs(o.c)*o.hd;
  for(let ix=Math.floor((o.x-ex)/bucketSize);ix<=Math.floor((o.x+ex)/bucketSize);ix++)for(let iz=Math.floor((o.z-ez)/bucketSize);iz<=Math.floor((o.z+ez)/bucketSize);iz++){const k=ix+','+iz;if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(o);}}
 function nearby(x,z,r){const set=new Set();for(let ix=Math.floor((x-r)/bucketSize);ix<=Math.floor((x+r)/bucketSize);ix++)for(let iz=Math.floor((z-r)/bucketSize);iz<=Math.floor((z+r)/bucketSize);iz++)for(const o of buckets.get(ix+','+iz)||[])set.add(o);return set;}
 function contained(x,z,ex,ez){if(x-ex<bounds.minX||x+ex>bounds.maxX||z-ez<bounds.minZ||z+ez>bounds.maxZ)return false;if(!loops.length)return true;return [[0,0],[-ex,-ez],[ex,-ez],[ex,ez],[-ex,ez]].every(([dx,dz])=>loops.some(r=>inside(x+dx,z+dz,r)));}
 function boxFree(x,z,ex,ez){if(!contained(x,z,ex,ez))return false;for(const o of nearby(x,z,Math.hypot(ex,ez))){const dx=x-o.x,dz=z-o.z,c=Math.abs(o.c),s=Math.abs(o.s);if(Math.abs(dx)>ex+c*o.hw+s*o.hd||Math.abs(dz)>ez+s*o.hw+c*o.hd)continue;if(Math.abs(dx*o.c-dz*o.s)>o.hw+c*ex+s*ez||Math.abs(dx*o.s+dz*o.c)>o.hd+s*ex+c*ez)continue;return false;}return true;}
 function turnFree(x,z){if(!contained(x,z,TURN_RADIUS,TURN_RADIUS))return false;for(const o of nearby(x,z,TURN_RADIUS)){const dx=x-o.x,dz=z-o.z,lx=dx*o.c-dz*o.s,lz=dx*o.s+dz*o.c;if(Math.hypot(Math.max(0,Math.abs(lx)-o.hw),Math.max(0,Math.abs(lz)-o.hd))<TURN_RADIUS)return false;}return true;}
 return {bounds,boxFree,turnFree,obstacles};
}
export async function buildNavigation(data,parts=[],{yieldTask=()=>Promise.resolve(),cancelled=()=>false}={}){
 const space=navigationSpace(data,parts);if(!space)return {nodes:[],space:null};
 const b=space.bounds,w=b.maxX-b.minX,d=b.maxZ-b.minZ,step=Math.max(.85,Math.sqrt(w*d/12000)),nx=Math.floor(w/step),nz=Math.floor(d/step),nodes=[],grid=new Map();
 for(let iz=0;iz<nz;iz++){if(cancelled())return null;for(let ix=0;ix<nx;ix++){const x=b.minX+(ix+.5)*step,z=b.minZ+(iz+.5)*step;for(let axis=0;axis<2;axis++){if(!space.boxFree(x,z,axis?HALF_WIDTH:HALF_LENGTH,axis?HALF_LENGTH:HALF_WIDTH))continue;const n={id:nodes.length,x,z,ix,iz,axis,edges:[]};nodes.push(n);grid.set((iz*nx+ix)*2+axis,n);}}if(iz%12===0)await yieldTask();}
 for(const n of nodes){if(n.id%500===0){if(cancelled())return null;await yieldTask();}for(const sign of [-1,1]){const ix=n.ix+(n.axis?0:sign),iz=n.iz+(n.axis?sign:0);if(ix<0||ix>=nx||iz<0||iz>=nz)continue;const target=grid.get((iz*nx+ix)*2+n.axis);if(target&&space.boxFree((n.x+target.x)/2,(n.z+target.z)/2,n.axis?HALF_WIDTH:HALF_LENGTH+step/2,n.axis?HALF_LENGTH+step/2:HALF_WIDTH))n.edges.push(target.id);}const turn=grid.get((n.iz*nx+n.ix)*2+1-n.axis);if(turn&&space.turnFree(n.x,n.z))n.edges.push(turn.id);}
 // Identify true aisles by racks on both lateral sides of the driving axis.
 const rackBoxes=(data.racks||[]).map(r=>{const c=Math.abs(Math.cos(r.angle||0)),s=Math.abs(Math.sin(r.angle||0));return {x:r.x,z:r.z,ex:(c*r.width+s*r.depth)/2,ez:(s*r.width+c*r.depth)/2};});
 for(const n of nodes){if(n.id%500===0){if(cancelled())return null;await yieldTask();}let left=Infinity,right=Infinity,near=Infinity;for(const r of rackBoxes){near=Math.min(near,Math.hypot(Math.max(0,Math.abs(n.x-r.x)-r.ex),Math.max(0,Math.abs(n.z-r.z)-r.ez)));const along=n.axis?n.z:n.x,center=n.axis?r.z:r.x,extent=n.axis?r.ez:r.ex;if(Math.abs(along-center)>extent)continue;const lateral=n.axis?n.x:n.z,lo=(n.axis?r.x:r.z)-(n.axis?r.ex:r.ez),hi=(n.axis?r.x:r.z)+(n.axis?r.ex:r.ez);if(hi<=lateral)left=Math.min(left,lateral-hi);if(lo>=lateral)right=Math.min(right,lo-lateral);}n.aisle=left<6&&right<6;n.nearRack=near;}
 const components=[];for(const start of nodes){if(start.component!=null)continue;const id=components.length,queue=[start.id],members=[];start.component=id;for(let i=0;i<queue.length;i++){const n=nodes[queue[i]];members.push(n.id);for(const target of n.edges)if(nodes[target].component==null){nodes[target].component=id;queue.push(target);}}components.push({members,aisles:members.filter(id=>nodes[id].aisle)});}
 const runs=[];for(const start of nodes){if(!start.aisle||start.aisleRun!=null)continue;const id=runs.length,queue=[start.id];start.aisleRun=id;for(let i=0;i<queue.length;i++)for(const target of nodes[queue[i]].edges){const next=nodes[target];if(next.aisle&&next.axis===start.axis&&next.aisleRun==null){next.aisleRun=id;queue.push(target);}}runs.push(queue);}
 return {nodes,space,step,components,runs,aisles:nodes.filter(n=>n.aisle).map(n=>n.id)};
}
export function createTraffic(nav,count=3,random=Math.random){
 const nodes=nav?.nodes||[],agents=[],driveNodes=nodes.filter(n=>n.edges.some(id=>nodes[id].axis===n.axis)),aisles=driveNodes.filter(n=>n.aisle&&(nav.runs?.[n.aisleRun]?.length||0)*nav.step>6),near=driveNodes.filter(n=>n.nearRack<4),candidates=aisles.length?aisles:near.length?near:driveNodes;
 // Spread starts across the warehouse, never on top of each other.
 for(let k=0;k<count&&candidates.length;k++){let best=null,score=-1;for(const n of candidates){if(n.aisleRun!=null&&agents.some(a=>a.reservedRun===n.aisleRun))continue;const distance=agents.length?Math.min(...agents.map(a=>Math.hypot(n.x-a.x,n.z-a.z))):random();if(distance>score&&(!agents.length||distance>SEPARATION*2)){best=n;score=distance;}}if(!best)break;agents.push({x:best.x,z:best.z,angle:best.axis?-Math.PI/2:0,node:best.id,previous:-1,target:null,wait:0,elapsed:0,route:[],goal:null,wheelTravel:0,reservedRun:best.aisleRun,fromRun:null});}
 const visits=new Map();for(const a of agents){a.runTrips=0;a.lastRun=a.reservedRun;if(a.reservedRun!=null)visits.set(a.reservedRun,(visits.get(a.reservedRun)||0)+1);}
 const deltaAngle=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
 function routeTo(start,goal,blocked){
  const distances=new Map([[start,0]]),previous=new Map(),heap=[[0,start]];
  const push=(cost,id)=>{let i=heap.length;heap.push([cost,id]);while(i){const p=(i-1)>>1;if(heap[p][0]<=cost)break;heap[i]=heap[p];i=p;}heap[i]=[cost,id];};
  const pop=()=>{const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1][0]<heap[child][0])child++;if(heap[child][0]>=last[0])break;heap[i]=heap[child];i=child;}heap[i]=last;}return first;};
  while(heap.length){const [cost,id]=pop();if(cost!==distances.get(id))continue;if(id===goal){const path=[];for(let at=goal;at!==start;at=previous.get(at))path.push(at);return path.reverse();}const n=nodes[id];for(const to of n.edges){if(blocked(nodes[to]))continue;const target=nodes[to],next=cost+(target.axis!==n.axis?2.5:1)+(target.aisle?0:2);if(next>=(distances.get(to)??Infinity))continue;distances.set(to,next);previous.set(to,id);push(next,to);}}
  return [];
 }
 function blockedFor(a){return target=>agents.some(other=>other!==a&&(other.node===target.id||other.target?.id===target.id||(target.aisleRun!=null&&(target.aisleRun===other.reservedRun||target.aisleRun===other.fromRun))||Math.hypot(target.x-other.x,target.z-other.z)<SEPARATION));}
 function applyCommand(a,plan){a.manualPending=null;a.manualGoal=plan.goal;a.goal=plan.goal;a.route=routeTo(a.node,plan.goal,blockedFor(a));a.fromRun=nodes[a.node].aisleRun;a.reservedRun=nodes[plan.goal].aisleRun;a.wait=0;}
 function command(index,x,z){
  const a=agents[index];if(!a||!Number.isFinite(x)||!Number.isFinite(z))return {accepted:false,message:'Önce bir forklift seçin.'};
  if(!nav.space?.boxFree(x,z,.08,.08))return {accepted:false,message:'Hedef için raflardan ve engellerden uzak, boş zemini işaretleyin.'};
  const from=a.target?.id??a.node,component=nodes[from].component,blocked=blockedFor(a),near=nodes.filter(n=>n.component===component&&Math.hypot(n.x-x,n.z-z)<=nav.step*1.6&&!blocked(n)).sort((p,q)=>Math.hypot(p.x-x,p.z-z)-Math.hypot(q.x-x,q.z-z));
  for(const target of near.slice(0,8)){const route=routeTo(from,target.id,blocked);if(!route.length&&from!==target.id)continue;const plan={goal:target.id};if(a.target)a.manualPending=plan;else applyCommand(a,plan);return {accepted:true,point:{x:target.x,z:target.z}};}
  return {accepted:false,message:'Bu noktaya uygun yol bulunamadı. Boş bir koridor noktası seçin.'};
 }
 function choose(a){const n=nodes[a.node],blocked=blockedFor(a);
  if(a.manualGoal!=null){if(n.id===a.manualGoal){a.manualGoal=null;a.route=[];return;}if(!a.route.length)a.route=routeTo(n.id,a.manualGoal,blocked);if(!a.route.length)return;}
  if(!a.route.length){const members=nav.components?.[n.component],pool=members?.aisles.length?members.aisles:members?.members||candidates.map(n=>n.id);let goals=pool.map(id=>nodes[id]).filter(target=>target.id!==a.goal&&Math.hypot(target.x-n.x,target.z-n.z)>5&&!blocked(target));const sameAisle=goals.filter(target=>target.aisleRun===n.aisleRun),other=goals.filter(target=>target.aisleRun!=null&&target.aisleRun!==n.aisleRun);
   if(n.aisle&&sameAisle.length&&(a.runTrips<2||!other.length))goals=sameAisle;
   else if(other.length){const least=Math.min(...other.map(target=>visits.get(target.aisleRun)||0)),available=other.filter(target=>(visits.get(target.aisleRun)||0)===least),distances=new Map();for(const target of available){const d=Math.hypot(target.x-n.x,target.z-n.z);distances.set(target.aisleRun,Math.min(distances.get(target.aisleRun)??Infinity,d));}const run=[...distances].sort((p,q)=>p[1]-q[1])[0]?.[0];goals=available.filter(target=>target.aisleRun===run);}
   goals.sort((p,q)=>Math.hypot(q.x-n.x,q.z-n.z)-Math.hypot(p.x-n.x,p.z-n.z));for(let attempt=0;attempt<Math.min(5,goals.length);attempt++){const goal=goals[Math.floor(random()*Math.min(3,goals.length))];const route=routeTo(n.id,goal.id,blocked);if(route.length){a.route=route;a.goal=goal.id;a.fromRun=n.aisleRun;a.reservedRun=goal.aisleRun;break;}}}
  let id=a.route[0];if(id!=null&&!blocked(nodes[id]))a.route.shift();else if(id!=null){a.blockedRetries=(a.blockedRetries||0)+1;if(a.blockedRetries>5){a.route=[];a.blockedRetries=0;}return;}
  if(id==null){if(a.manualGoal!=null)return;const available=n.edges.filter(id=>!blocked(nodes[id]));let ids=available.filter(id=>id!==a.previous);if(!ids.length)ids=available;if(!ids.length)return;id=ids[Math.floor(random()*ids.length)];}
  a.blockedRetries=0;const target=nodes[id],turn=target.axis!==n.axis;a.target=target;a.start={x:a.x,z:a.z,angle:a.angle};a.endAngle=turn?a.angle+Math.PI/2:a.angle;a.duration=turn?1.4:Math.hypot(target.x-a.x,target.z-a.z)/.85;a.elapsed=0;
 }
 function step(dt){
  dt=Math.max(0,Math.min(.1,dt));
  for(const a of agents){let remaining=dt;
   // Carry frame time across grid edges: a grid node is not a stop.
   for(let segment=0;remaining>1e-8&&segment<4;segment++){
    if(!a.target){if(a.wait>0){const delay=Math.min(remaining,a.wait);a.wait-=delay;remaining-=delay;if(remaining<=1e-8)break;}choose(a);if(!a.target){a.wait=.5;break;}}
    const slice=Math.min(remaining,Math.max(0,a.duration-a.elapsed)),t=Math.min(1,(a.elapsed+slice)/a.duration),x=a.start.x+(a.target.x-a.start.x)*t,z=a.start.z+(a.target.z-a.start.z)*t;
    if(agents.some(other=>other!==a&&Math.hypot(x-other.x,z-other.z)<SEPARATION)){
     a.wait+=remaining;if(a.wait>2){const home=nodes[a.node],distance=Math.hypot(home.x-a.x,home.z-a.z);a.previous=a.target.id;a.route=[];if(distance>.01){a.target=home;a.start={x:a.x,z:a.z,angle:a.angle};a.endAngle=a.angle;a.duration=distance/.85;a.elapsed=0;a.wait=0;}else{a.target=null;a.wait=.5;}}break;
    }
    a.wait=0;a.elapsed+=slice;remaining-=slice;a.wheelTravel+=(x-a.x)*Math.cos(a.angle)-(z-a.z)*Math.sin(a.angle);a.x=x;a.z=z;a.angle=a.start.angle+deltaAngle(a.start.angle,a.endAngle)*t;
    if(t===1){a.previous=a.node;a.node=a.target.id;if(a.fromRun!==a.reservedRun&&nodes[a.node].aisleRun!==a.fromRun)a.fromRun=null;a.target=null;
     if(a.node===a.goal&&nodes[a.node].aisleRun!=null){const run=nodes[a.node].aisleRun;a.runTrips=run===a.lastRun?a.runTrips+1:1;a.lastRun=run;visits.set(run,(visits.get(run)||0)+1);}
     if(a.manualPending)applyCommand(a,a.manualPending);
     if(a.manualGoal===a.node){a.manualGoal=null;a.route=[];}
     a.wait=0;
    }
   }
  }
 }

 return {agents,step,command,coverage:()=>({visitedAisles:visits.size,totalAisles:nav.runs?.length||0})};
}



