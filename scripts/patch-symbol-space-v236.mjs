import fs from 'node:fs';
export function installSymbolSpace(){
 const eps=1e-7,api=window.rafexColumnV204;
 const overlaps=(a,b)=>a.left<b.right-eps&&a.right>b.left+eps&&a.top<b.bottom-eps&&a.bottom>b.top+eps;
 const physical=s=>s.type==='column'||s.type==='barrier';
 function rackBlocks(r,s){
  if(s.type!=='barrier'||!r.b2bLayout||!(Number(r.b2b?.tunnelHeight)>0))return [m2RackBounds(r)];
  const foot=m2B2BFootWidth(r)*r.w/Math.max(1,Number(r.b2bLayout.sectionWidth)+2*m2B2BFootWidth(r));
  const rad=(Number(r.angle)||0)*Math.PI/180,cx=r.x+r.w/2,cy=r.y+r.h/2;
  return [[-r.w/2,-r.w/2+foot],[r.w/2-foot,r.w/2]].map(([lo,hi])=>{
   const p=[[lo,-r.h/2],[hi,-r.h/2],[hi,r.h/2],[lo,r.h/2]].map(([x,y])=>({x:cx+x*Math.cos(rad)-y*Math.sin(rad),y:cy+x*Math.sin(rad)+y*Math.cos(rad)}));
   return {left:Math.min(...p.map(p=>p.x)),right:Math.max(...p.map(p=>p.x)),top:Math.min(...p.map(p=>p.y)),bottom:Math.max(...p.map(p=>p.y))};
  });
 }
 function obstacles(s){return m2LayoutState.racks.flatMap(r=>rackBlocks(r,s)).concat(m2LayoutSymbols.filter(o=>o.id!==s.id&&(o.type==='column'||o.blocking)).map(o=>m2SymbolBounds(o)));}
 function valid(s,x=s.x,y=s.y){return Number.isFinite(x)&&Number.isFinite(y)&&(!physical(s)||!obstacles(s).some(b=>overlaps(m2SymbolBounds(s,x,y),b)));}
 function move(s,x,y){
  if(!Number.isFinite(x)||!Number.isFinite(y))return false;
  if(!physical(s)){s.x=x;s.y=y;return true;}
  const start=m2SymbolBounds(s),blocks=obstacles(s),dx=x-s.x,dy=y-s.y,hit=api.sweep(start,dx,dy,blocks);
  let nx=s.x+dx*hit.time,ny=s.y+dy*hit.time;
  if(hit.time<1){const sx=hit.axis==='y'?dx*(1-hit.time):0,sy=hit.axis==='x'?dy*(1-hit.time):0,slide=api.sweep(m2SymbolBounds(s,nx,ny),sx,sy,blocks);nx+=sx*slide.time;ny+=sy*slide.time;}
  const next=m2SymbolBounds(s,nx,ny),area=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  if(blocks.some(b=>overlaps(next,b)&&area(next,b)>=area(start,b)-eps))return false;
  s.x=nx;s.y=ny;return Math.abs(nx-x)<eps&&Math.abs(ny-y)<eps;
 }
 function place(s){
  if(valid(s))return true;const b=m2SymbolBounds(s),blocks=obstacles(s),candidates=[];
  for(const o of blocks){for(const x of [s.x+o.left-b.right,s.x+o.right-b.left])for(const y of [s.y,s.y+o.top-b.bottom,s.y+o.bottom-b.top])candidates.push({x,y});for(const y of [s.y+o.top-b.bottom,s.y+o.bottom-b.top])candidates.push({x:s.x,y});}
  candidates.sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y));
  for(const p of candidates)if(valid(s,p.x,p.y)){s.x=p.x;s.y=p.y;return true;}return false;
 }
 Object.assign(api,{valid,move,place});
 m2BarrierHostRack=function(s){if(s?.type!=='barrier')return null;const b=m2SymbolBounds(s);return m2LayoutState.racks.find(r=>r.b2bLayout&&Number(r.b2b?.tunnelHeight)>0&&overlaps(b,m2RackBounds(r))&&!rackBlocks(r,s).some(o=>overlaps(b,o)))||null;};
 m2RackOverlapsBlockingSymbol=function(r,x=r.x,y=r.y,angle=r.angle){const probe={...r,x,y,angle};return m2LayoutSymbols.some(s=>(s.type==='column'||s.blocking)&&rackBlocks(probe,s).some(b=>overlaps(b,m2SymbolBounds(s))));};
 const finish=typeof m2FinalizeFastDrag==='function'?m2FinalizeFastDrag:null;
 if(finish)m2FinalizeFastDrag=function(drag){
  const result=finish.apply(this,arguments),members=drag?.symbolMembers||[];
  if(members.some(o=>{const s=m2LayoutSymbols.find(s=>s.id===o.id);return s&&physical(s)&&!valid(s);})){
   for(const o of drag.groupMembers||[]){const r=m2LayoutState.racks.find(r=>r.id===o.id);if(r){r.x=o.x;r.y=o.y;}}
   for(const o of members){const s=m2LayoutSymbols.find(s=>s.id===o.id);if(s){s.x=o.x;s.y=o.y;}}
   const status=document.getElementById('m2FloorStatus');if(status)status.textContent='Grup taşınmadı: bariyer veya kolon rafla çakışıyor.';
  }return result;
 };
 window.rafexSymbolSpaceV236={valid,move,place,rackBlocks};
}
export function transform(html){
 if(html.includes('data-symbol-space="v236"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Missing symbol space anchor '+a.slice(0,80));html=html.replace(a,b);};
 replace('window.rafexColumnV204.move(symbol,Math.max(0,Math.min(1000-symbol.w,point.x-m2SymbolDrag.dx)),Math.max(0,Math.min(650-symbol.h,point.y-m2SymbolDrag.dy)));','window.rafexColumnV204.move(symbol,point.x-m2SymbolDrag.dx,point.y-m2SymbolDrag.dy);');
 replace('m2PushUndo("Bariyer ekleme");m2LayoutSymbols.push({id,type:"barrier",name:"Bariyer Koruma",x:500-w/2,y:325-h/2,w,h,widthMm:lengthMm,depthMm,blocking:true,showDetails:false});','const barrier={id,type:"barrier",name:"Bariyer Koruma",x:500-w/2,y:325-h/2,w,h,widthMm:lengthMm,depthMm,blocking:true,showDetails:false};if(!window.rafexColumnV204.place(barrier)){ $("m2FloorStatus").textContent="Bariyer için çakışmayan konum bulunamadı.";return;}m2PushUndo("Bariyer ekleme");m2LayoutSymbols.push(barrier);');
 replace('copy.type==="column"&&!window.rafexColumnV204.place(copy)','(copy.type==="column"||copy.type==="barrier")&&!window.rafexColumnV204.place(copy)');
 replace('symbol.type==="column"&&!window.rafexColumnV204.valid({...symbol,angle:nextAngle})','(symbol.type==="column"||symbol.type==="barrier")&&!window.rafexColumnV204.valid({...symbol,angle:nextAngle})');
 html=html.replaceAll('Kolon döndürülmedi: raf veya başka kolon ile çakışıyor.','Sembol döndürülmedi: raf veya başka engelle çakışıyor.').replaceAll('Kolon raf yüzeyinde durduruldu; girilen konum çakışıyor.','Sembol engel yüzeyinde durduruldu; girilen konum çakışıyor.');
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+'<script data-symbol-space="v236">('+installSymbolSpace.toString()+')();</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-symbol-space-v236.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}
