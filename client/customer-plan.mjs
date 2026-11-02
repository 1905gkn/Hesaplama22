import {rackParts} from './layout-3d-geometry.mjs';
import {environmentParts} from './layout-3d-environment.mjs';
import {savedCustomerMeasures} from './customer-distance.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const color=(s,f)=>/^#[0-9a-f]{3,8}$/i.test(s||'')?s:f;
export function completeCustomerPlan(data){
 if(!data?.racks?.length)return null;
 const boxes=[],labels=[],extents=[];
 const rect=(x,z,w,d,angle,fill,stroke)=>{const c=Math.cos(angle),s=Math.sin(angle);for(const dx of [-w/2,w/2])for(const dz of [-d/2,d/2])extents.push([x+dx*c+dz*s,z-dx*s+dz*c]);return `<rect x="${x-w/2}" y="${z-d/2}" width="${w}" height="${d}" transform="rotate(${-angle*180/Math.PI} ${x} ${z})" fill="${fill}" stroke="${stroke}" stroke-width=".018"/>`};
 for(const p of environmentParts(data))boxes.push(rect(p.x,p.z,p.w,p.d,p.ry,p.kind==='column'?'#697675':p.kind==='wall'?'#394443':'#c4d9d7','#394443'));
 for(const r of data.racks){
  const parts=rackParts(r,{simple:true}),seen=new Set(),shapes=[];const c=Math.cos(r.angle),s=Math.sin(r.angle);
  shapes.push(rect(r.x,r.z,r.width,r.depth,r.angle,'#f1e6c3','#7b8589'));
  for(const p of parts){if(!['load','product','foot','beam','shelf','rail'].includes(p.kind))continue;const key=[p.kind,p.x,p.z,p.w,p.d].join(':');if(seen.has(key))continue;seen.add(key);const fill=p.kind==='load'?'#dfbf73':p.kind==='product'?'#8d999e':p.kind==='shelf'?'#b8c3c5':p.kind==='foot'?'#005078':p.kind==='rail'?'#aeb8bd':'#d7a63a';shapes.push(rect(r.x+p.x*c+p.z*s,r.z-p.x*s+p.z*c,p.w,p.d,r.angle,fill,p.kind==='load'?'#a57c2d':fill));}
  boxes.push(`<g data-rack-id="${esc(r.id)}">${shapes.join('')}</g>`);
  labels.push(`<text x="${r.x}" y="${r.z}" fill="${color(r.typeColor,'#194f39')}" font-size=".34" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${esc(r.name)}</text>`);
 }
 for(const p of data.points||[])extents.push([p.x,p.z]);
 for(const m of savedCustomerMeasures(data)){extents.push([m.a[0],m.a[2]],[m.b[0],m.b[2]]);boxes.push(`<path d="M${m.a[0]} ${m.a[2]}L${m.b[0]} ${m.b[2]}" fill="none" stroke="#39735c" stroke-width=".02"/>`);labels.push(`<text x="${(m.a[0]+m.b[0])/2}" y="${(m.a[2]+m.b[2])/2-.08}" font-size=".25" fill="#194f39" text-anchor="middle" paint-order="stroke" stroke="#f0f5f3" stroke-width=".06">${esc(m.label)}</text>`)}
 let minX=Infinity,minZ=Infinity,maxX=-Infinity,maxZ=-Infinity;for(const [x,z]of extents){minX=Math.min(minX,x);minZ=Math.min(minZ,z);maxX=Math.max(maxX,x);maxZ=Math.max(maxZ,z)}minX-=1;minZ-=1;const w=maxX-minX+1,h=maxZ-minZ+1;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(6000*Math.min(1,w/h))}" height="${Math.round(6000*Math.min(1,h/w))}" viewBox="${minX} ${minZ} ${w} ${h}"><defs><pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M1 0H0V1" fill="none" stroke="#dbe5de" stroke-width=".012"/></pattern></defs><rect x="${minX}" y="${minZ}" width="${w}" height="${h}" fill="#f0f5f3"/><rect x="${minX}" y="${minZ}" width="${w}" height="${h}" fill="url(#grid)"/>${boxes.join('')}${labels.join('')}</svg>`;
}
export function imageTouchesRackEdge(image){
 const c=document.createElement('canvas');c.width=256;c.height=256;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,256,256);let colored=0;
 for(const [x,y,w,h] of [[0,0,256,1],[0,255,256,1],[0,0,1,256],[255,0,1,256]]){const a=ctx.getImageData(x,y,w,h).data;for(let i=0;i<a.length;i+=4)if(a[i+3]>100&&a[i]>110&&a[i+1]>70&&a[i+2]<a[i+1]*.9&&a[i]>a[i+1]*1.02)colored++;}
 c.width=c.height=1;return colored>8;
}
