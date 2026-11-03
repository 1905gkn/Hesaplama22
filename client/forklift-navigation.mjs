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
 return {nodes,space,step};
}
export function createTraffic(nav,count=3,random=Math.random){
 const nodes=nav?.nodes||[],agents=[],candidates=nodes.filter(n=>n.edges.some(id=>nodes[id].axis===n.axis));
 // Spread starts across the warehouse, never on top of each other.
 for(let k=0;k<count&&candidates.length;k++){let best=null,score=-1;for(const n of candidates){const distance=agents.length?Math.min(...agents.map(a=>Math.hypot(n.x-a.x,n.z-a.z))):random();if(distance>score&&(!agents.length||distance>SEPARATION*2)){best=n;score=distance;}}if(!best)break;agents.push({x:best.x,z:best.z,angle:best.axis?-Math.PI/2:0,node:best.id,previous:-1,target:null,wait:0,elapsed:0});}
 const deltaAngle=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
 function choose(a){const n=nodes[a.node],available=n.edges.filter(id=>!agents.some(other=>other!==a&&(other.node===id||other.target?.id===id||Math.hypot(nodes[id].x-other.x,nodes[id].z-other.z)<SEPARATION)));let ids=available.filter(id=>id!==a.previous);if(!ids.length)ids=available;if(!ids.length)return;const target=nodes[ids[Math.floor(random()*ids.length)]],turn=target.axis!==n.axis;a.target=target;a.start={x:a.x,z:a.z,angle:a.angle};a.endAngle=turn?a.angle+Math.PI/2:a.angle;a.duration=turn?1.4:Math.hypot(target.x-a.x,target.z-a.z)/.85;a.elapsed=0;}
 function step(dt){dt=Math.max(0,Math.min(.1,dt));for(const a of agents){if(!a.target){a.wait-=dt;if(a.wait>0)continue;choose(a);if(!a.target){a.wait=.5;continue;}}const t=Math.min(1,(a.elapsed+dt)/a.duration),x=a.start.x+(a.target.x-a.start.x)*t,z=a.start.z+(a.target.z-a.start.z)*t;if(agents.some(other=>other!==a&&Math.hypot(x-other.x,z-other.z)<SEPARATION)){a.wait+=dt;if(a.wait>2){const home=nodes[a.node],distance=Math.hypot(home.x-a.x,home.z-a.z);a.previous=a.target.id;if(distance>.01){a.target=home;a.start={x:a.x,z:a.z,angle:a.angle};a.endAngle=a.angle;a.duration=distance/.85;a.elapsed=0;a.wait=0;}else{a.target=null;a.wait=.5;}}continue;}a.wait=0;a.elapsed+=dt;a.x=x;a.z=z;a.angle=a.start.angle+deltaAngle(a.start.angle,a.endAngle)*t;if(t===1){a.previous=a.node;a.node=a.target.id;a.target=null;a.wait=.15+random()*.6;}}}
 return {agents,step};
}

