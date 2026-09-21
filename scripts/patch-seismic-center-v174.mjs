import fs from 'node:fs';
export function seismicPairAtPoint(racks,point){
 const eligible=racks.filter(r=>r.layoutView==='b2b-top'&&r.b2bLayout);
 let best=null,bestScore=Infinity;
 for(const a of eligible){
  const rad=(Number(a.angle)||0)*Math.PI/180,ux=Math.cos(rad),uy=Math.sin(rad),vx=-uy,vy=ux;
  const ax=Number(a.x)+a.w/2,ay=Number(a.y)+a.h/2;
  const pu=(point.x-ax)*ux+(point.y-ay)*uy,pv=(point.x-ax)*vx+(point.y-ay)*vy;
  const tolerance=Math.min(12,a.w*.15,a.h*.35);
  if(Math.abs(Math.abs(pu)-a.w/2)>tolerance||Math.abs(pv)>a.h/2+tolerance)continue;
  for(const b of eligible){
   if(a.id===b.id)continue;
   const angle=Math.abs(((Number(b.angle||0)-Number(a.angle||0))%180+180)%180);
   if(angle>1&&angle<179)continue;
   const dx=Number(b.x)+b.w/2-ax,dy=Number(b.y)+b.h/2-ay,u=dx*ux+dy*uy,v=dx*vx+dy*vy;
   if(u*pu<=0||Math.abs(v)>Math.min(a.h,b.h)*.1)continue;
   const gap=Math.abs(u)-(a.w+b.w)/2;
   if(Math.abs(gap)>Math.min(tolerance,b.w*.15))continue;
   const seam=Math.sign(u)*(a.w/2+gap/2),distance=Math.abs(pu-seam);
   if(distance>tolerance)continue;
   const score=distance+Math.abs(v)+Math.abs(gap)*.1;
   if(score<bestScore){bestScore=score;best=[a,b];}
  }
 }
 return best||[];
}
export function transform(html){
 if(html.includes('/* seismic-center-v174 */'))return html;
 const anchor='selected=m2SeismicSelectionRacks(left,right,top,bottom);let added=0;';
 if(!html.includes(anchor))throw Error('v174 seismic selection missing');
 html=html.replace(anchor,'selected=draft.type==="heavy"&&Math.hypot(right-left,bottom-top)<=6?seismicPairAtPoint(m2LayoutState.racks,draft.start):m2SeismicSelectionRacks(left,right,top,bottom);let added=0;');
 const at=html.lastIndexOf('</body>');
 return html.slice(0,at)+'<script>/* seismic-center-v174 */'+seismicPairAtPoint.toString()+'</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-seismic-center-v174.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
