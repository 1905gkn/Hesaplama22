const positive=(n,f)=>Number(n)>0?Number(n):f;
export function environmentSnapshot(state,symbols=[]){
 const unit=1/(positive(state.scale,.04)*1000);
 return {wallless:(state.points||[]).length<2,symbols:symbols.filter(s=>s.type==='column'||s.type==='door').map(s=>({id:s.id,type:s.type,x:(Number(s.x)+Number(s.w)/2)*unit,z:(Number(s.y)+Number(s.h)/2)*unit,width:positive(s.widthMm,Number(s.w)*unit*1000)/1000,depth:positive(s.depthMm,Number(s.h)*unit*1000)/1000,angle:-(Number(s.angle)||0)*Math.PI/180}))};
}
export function rackVisualTop(r){
 const special=(r.frameHeights||[]).flatMap(row=>[Number(row.left)/1000,Number(row.right)/1000]).filter(Number.isFinite);
 const loads=r.system==='mr'?[]:r.system==='konsol'?r.floors.map(y=>y+r.productHeight+.12):r.floors.map((y,i)=>y+r.palletHeights[i]);
 return Math.max(r.height,...special,...loads);
}
export function environmentParts(data){
 const out=[],box=(kind,x,y,z,w,h,d,ry=0)=>{if([x,y,z,w,h,d,ry].every(Number.isFinite)&&w>0&&h>0&&d>0)out.push({kind,x,y,z,w,h,d,ry});};
 const symbols=data.symbols||[],points=data.points||[],thickness=.12;
 let area=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];area+=a.x*b.z-b.x*a.z;}
 if(!data.wallless)for(let i=0;i<points.length;i++){
  const j=(i+1)%points.length;if((j===0&&!data.closed)||data.breaks.includes(i))continue;const a=points[i],b=points[j],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);if(length<.001)continue;
  const ux=dx/length,uz=dz/length,sign=area>=0?1:-1,nx=sign*uz,nz=-sign*ux,cuts=[];
  for(const door of symbols.filter(s=>s.type==='door')){
   const offsetX=door.x-a.x,offsetZ=door.z-a.z,position=offsetX*ux+offsetZ*uz,distance=Math.abs(offsetX*uz-offsetZ*ux),alignment=Math.abs(Math.cos(door.angle)*ux-Math.sin(door.angle)*uz);
   if(distance>door.depth/2+.15||alignment<.95)continue;const half=door.width/2;if(position+half<=0||position-half>=length)continue;cuts.push([Math.max(0,position-half),Math.min(length,position+half)]);
  }
  let cursor=0;const wall=(start,end)=>{if(end-start<.01)return;const t=(start+end)/2;box('wall',a.x+t*ux+nx*thickness/2,.5,a.z+t*uz+nz*thickness/2,end-start,1,thickness,-Math.atan2(dz,dx));};
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
