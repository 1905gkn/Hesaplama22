import {rackParts} from './layout-3d-geometry.mjs';
import {environmentParts} from './layout-3d-environment.mjs';
import {b2bFrameLayout} from './layout-3d-b2b-placement.mjs';
const sq=(a,b)=>(a.x-b.x)**2+(a.z-b.z)**2;
function rectangle(r,x,z,w,d){const c=Math.cos(r.angle),s=Math.sin(r.angle);return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([dx,dz])=>({x:r.x+(x+dx)*c+(z+dz)*s,z:r.z-(x+dx)*s+(z+dz)*c}));}
export function rackFootprints(r,basis){
 if(basis!=='Raftan rafa'){
  const unique=new Map();for(const p of rackParts(r,{simple:true}))if(['load','product'].includes(p.kind)){const key=[p.x,p.z,p.w,p.d].join(':');if(!unique.has(key))unique.set(key,rectangle(r,p.x,p.z,p.w,p.d));}if(unique.size)return [...unique.values()];
 }
 if(r.system==='b2b'){const {depth,centers}=b2bFrameLayout(r);return centers.map(z=>rectangle(r,0,z,r.width,depth));}
 return [rectangle(r,0,0,r.width,r.depth)];
}
function inside(p,ring){let sign=0;for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],cross=(b.x-a.x)*(p.z-a.z)-(b.z-a.z)*(p.x-a.x);if(Math.abs(cross)<1e-10)continue;const next=Math.sign(cross);if(sign&&sign!==next)return false;sign=next;}return true;}
function nearest(p,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1)));return{x:a.x+t*dx,z:a.z+t*dz};}
function intersection(a,b,c,d){const dx=b.x-a.x,dz=b.z-a.z,ex=d.x-c.x,ez=d.z-c.z,den=dx*ez-dz*ex;if(Math.abs(den)<1e-12)return null;const t=((c.x-a.x)*ez-(c.z-a.z)*ex)/den,u=((c.x-a.x)*dz-(c.z-a.z)*dx)/den;return t>=0&&t<=1&&u>=0&&u<=1?{x:a.x+t*dx,z:a.z+t*dz}:null;}
export function customerRackDistance(data,firstId,secondId,basis){
 const first=data.racks.find(r=>String(r.id)===String(firstId)),second=data.racks.find(r=>String(r.id)===String(secondId));if(!first||!second||String(first.id)===String(second.id))return null;
 const ids=[String(first.id),String(second.id)].sort();
 // Prefer the authoritative saved plan relation when these exact racks have one.
 const saved=[...(data.visibleClearances||[]),...Object.values(data.clearancesByRack||{}).flat()].find(d=>d.kind==='pair'&&d.rackIds?.length===2&&d.rackIds.map(String).sort().every((id,i)=>id===ids[i])&&Number.isFinite(d.mm)&&d.mm>=0&&Array.isArray(d.a)&&Array.isArray(d.b)&&d.a.length===3&&d.b.length===3&&[...d.a,...d.b].every(Number.isFinite));
 if(saved&&basis===undefined)return {...structuredClone(saved),key:'customer-distance',requested:true};
 let best={distance:Infinity};const offer=(a,b)=>{const distance=sq(a,b);if(distance<best.distance)best={distance,a,b};};
 for(const a of rackFootprints(first,basis||data.gapBasis))for(const b of rackFootprints(second,basis||data.gapBasis)){
  if(inside(a[0],b)){offer(a[0],a[0]);continue;}if(inside(b[0],a)){offer(b[0],b[0]);continue;}
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){const cross=intersection(a[i],a[(i+1)%4],b[j],b[(j+1)%4]);if(cross)offer(cross,cross);offer(a[i],nearest(a[i],b[j],b[(j+1)%4]));offer(nearest(b[j],a[i],a[(i+1)%4]),b[j]);}
 }
 if(!Number.isFinite(best.distance))return null;const mm=Math.round(Math.sqrt(best.distance)*1000);
 return {key:'customer-distance',kind:'pair',rackIds:ids,mm,label:mm.toLocaleString('tr-TR')+' mm',a:[best.a.x,.12,best.a.z],b:[best.b.x,.12,best.b.z],requested:true};
}
export function savedCustomerMeasures(data){return Array.isArray(data.visibleClearances)?data.visibleClearances.filter(d=>typeof d.label==='string'&&Array.isArray(d.a)&&Array.isArray(d.b)&&d.a.length===3&&d.b.length===3&&[...d.a,...d.b].every(Number.isFinite)):[];}

export function customerWallParts(data){return environmentParts(data).filter(p=>p.kind==='wall');}
export function customerWallDistance(data,rackId,wallIndex,basis='Paletten palete'){
 const r=data.racks.find(r=>String(r.id)===String(rackId)),wall=customerWallParts(data)[wallIndex];if(!r||!wall)return null;
 const b=rectangle({x:wall.x,z:wall.z,angle:wall.ry},0,0,wall.w,wall.d);
 let best={distance:Infinity};const offer=(a,b)=>{const distance=sq(a,b);if(distance<best.distance)best={distance,a,b};};
 for(const a of rackFootprints(r,basis)){
  if(inside(a[0],b)){offer(a[0],a[0]);continue;}if(inside(b[0],a)){offer(b[0],b[0]);continue;}
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){const cross=intersection(a[i],a[(i+1)%4],b[j],b[(j+1)%4]);if(cross)offer(cross,cross);offer(a[i],nearest(a[i],b[j],b[(j+1)%4]));offer(nearest(b[j],a[i],a[(i+1)%4]),b[j]);}
 }
 if(!Number.isFinite(best.distance))return null;const mm=Math.round(Math.sqrt(best.distance)*1000);
 return {key:'wall:customer-distance',kind:'wall',rackIds:[String(r.id)],wallIndex,mm,label:mm.toLocaleString('tr-TR')+' mm',a:[best.a.x,.12,best.a.z],b:[best.b.x,.12,best.b.z],requested:true};
}
