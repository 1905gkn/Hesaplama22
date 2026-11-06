// Placement-specific ownership. Saved standalone types always retain all supports.
export function depthSharedSupport(r, racks=[]) {
 const empty={side:null,feet:[],braces:[],extra:false,intervals:[]};
 const a=racks.find(a=>a.id===r?.sharedFootWith);
 if(!a||!r.joinGroup||a.joinGroup!==r.joinGroup||r.b2bLayout||a.b2bLayout||!['left','right'].includes(r.sharedFootSide))return empty;
 if(!r.plan?.feet?.length||!a.plan?.feet?.length)return empty;
 const parts=d=>{let at=0;const list=[];for(let i=0;i<Math.max(d.plan.feet.length,d.plan.braces.length);i++)for(const kind of ['feet','braces']){const length=Number(d.plan[kind][i])||0;if(length>0){list.push({kind,index:i,start:at,end:at+length,length});at+=length;}}return list;};
 const ref=parts(a),own=parts(r),result={...empty,side:r.sharedFootSide};
 for(const p of own){const match=ref.find(q=>q.kind===p.kind&&Math.abs(q.start-p.start)<.1&&(p.kind==='feet'?Math.abs(q.end-p.end)<.1:q.end>=p.end-.1));if(match){result[p.kind].push(p.index);result.intervals.push(p);}}
 const end=Number(r.depthMm||r.railLength),posts=ref.filter(p=>p.kind==='feet').flatMap(p=>[p.start,p.end]);
 if(a.hasExtra)posts.push(Number(a.depthMm||a.railLength));
 result.extra=!!r.hasExtra&&posts.some(p=>Math.abs(p-end)<.1);
 return result;
}

// Shared frames, their bracing, and matching terminal posts are owned by A.
export function isSharedDepthMember(r,x,z,kind='foot') {
 const s=r.depthSharedSupport;if(!s?.side)return false;
 const sideX=(s.side==='left'?-1:1)*(r.width-r.foot)/2;
 if(Math.abs(x-sideX)>.001)return false;
 const at=(z+r.depth/2)*1000,tolerance=r.foot*1000/2+.1;
 return s.intervals.some(p=>(kind!=='foot'||p.kind==='feet')&&at>=p.start-tolerance&&at<=p.end+tolerance)||s.extra&&Math.abs(at-r.depth*1000)<=tolerance;
}
