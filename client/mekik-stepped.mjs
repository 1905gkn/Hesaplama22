// Millimetres. A single source for stepped shuttle geometry, capacity and BOM.
export function mekikStepped(r) {
 const c=r?.mekikCustomizationV514;if(!c)return null;
 const n=(v,f)=>v!==null&&v!==''&&Number.isFinite(Number(v))?Number(v):f;
 const levels=Math.max(1,Math.min(30,Math.round(n(r.levels,1)))),depth=Math.max(1,Math.round(n(r.depth,1))),pd=n(r.palD,800),ph=n(r.palletHeight,1200),first=n(r.firstRailHeight,430),gap=n(r.levelH,ph+380),length=n(r.railLength||r.depthMm,depth*(pd+50)-50),bays=Math.max(1,n(r.bays,1));
 let positions=(r.palletPositions||[]).slice(0,depth).map(Number);if(positions.length!==depth){positions=[];let at=0;for(let i=0;i<depth;i++){positions.push(at);at+=pd+(i===0||r.systemType==='fifo'&&i===depth-2?n(r.firstPalletGap,200):n(r.palletGap,50));}}
 const frames=[];let cursor=0;for(let i=0;i<(r.plan?.feet||[]).length;i++){const d=n(r.plan.feet[i],0);frames.push({index:i,start:cursor,end:cursor+d,depth:d,limit:Math.max(1,Math.min(levels,Math.round(n(c.frameLevels?.[i],levels))))});cursor+=d+n(r.plan.braces?.[i],0);}
 if(!frames.length)throw Error('Mekik ayak yerleşimi eksik.');
 const floors=[];let previous=depth;
 for(let i=0;i<levels;i++){
  const count=Math.max(1,Math.min(previous,Math.round(n(c.depths?.[i],depth))));previous=count;
  const requested=positions.slice(depth-count),start=requested[0],end=length;
  // Extend to the nearest support in front of the first retained pallet.
  const support=[...frames].reverse().find(f=>f.start<=start)||frames[0],active=frames.filter(f=>f.index>=support.index&&f.limit>=i+1),runs=[];
  for(const f of active){const last=runs.at(-1);if(last&&f.index===last.lastFrame+1){last.end=f.end;last.lastFrame=f.index;}else runs.push({start:f.start,end:f.end,firstFrame:f.index,lastFrame:f.index});}
  for(const run of runs){run.start=Math.max(0,run.start);run.end=Math.min(end,run.end);}
  const slots=requested.filter(p=>runs.some(run=>p>=run.start-1&&p+pd<=run.end+1));
  // A full-depth legacy run may end just beyond the final frame.
  for(const run of runs)if(run.lastFrame===frames.length-1)run.end=end;
  const usable=requested.filter(p=>runs.some(run=>p>=run.start-1&&p+pd<=run.end+1));
  floors.push({index:i,y:first+i*gap,count,positions:usable,runs});
 }
 const top=first+(levels-1)*gap,automatic=Math.ceil((top+ph/2)/50)*50,manual=n(c.uprightHeight,0),height=c.heightMode==='manual'?manual:automatic,errors=[];
 if(height<top)errors.push('Ayak boyu son paletin oturduğu kottan ('+top+' mm) kısa olamaz.');
 for(const floor of floors)if(!floor.positions.length)errors.push('K'+(floor.index+1)+' katında kullanılabilir palet yeri kalmadı. Ayak katlarını veya derinliği kontrol edin.');
 for(const f of frames){const supported=floors.filter(l=>l.runs.some(run=>f.index>=run.firstFrame&&f.index<=run.lastFrame));f.levels=supported.length;f.minimum=supported.at(-1)?.y||first;const auto=supported.length===levels?height:supported.length?Math.min(height,Math.ceil((f.minimum+ph/2)/50)*50):Math.min(height,first);f.height=n(c.frameHeights?.[f.index],0)||auto;if(f.height<f.minimum)errors.push((f.index+1)+'. ayak boyu bağlı olduğu son ray kotundan kısa olamaz.');}
 const rows=[];const add=(name,qty,spec='')=>{if(qty>0)rows.push({name,qty,spec,unit:name==='Ayak takımı'?'takım':'adet'});};
 const fmt=v=>new Intl.NumberFormat('tr-TR',{maximumFractionDigits:2}).format(v),groups=new Map();for(const f of frames){const key=f.depth+'|'+f.height;groups.set(key,(groups.get(key)||0)+bays+1);}for(const [key,qty]of groups){const [d,h]=key.split('|').map(Number);add('Ayak takımı',qty,(r.footProfile?r.footProfile+' · ':'')+'Yükseklik '+fmt(h)+' mm · Derinlik '+fmt(d)+' mm');}
 const traverse=typeof r.traverseRecommendation==='string'?r.traverseRecommendation:r.traverseRecommendation?.label||r.traverseType||'',pitch=(n(r.totalWidth||r.widthMm,0)-n(r.footType,100))/bays;
 for(const floor of floors)for(const run of floor.runs){const supported=frames.slice(run.firstFrame,run.lastFrame+1),stationCount=supported.length*2+(r.hasExtra&&run.lastFrame===frames.length-1?1:0)-(r.systemType==='fifo'?2:1);add('Travers',Math.max(0,stationCount)*bays,traverse+' · '+fmt(pitch)+' mm');add('Ray',bays*2,fmt(n(r.railThickness,2.5))+' mm kalınlık · H '+fmt(n(r.railHeight,150))+' mm · L '+fmt(run.end-run.start)+' mm · '+floor.positions.filter(p=>p>=run.start&&p+pd<=run.end+1).length+' derinlik');for(let j=run.firstFrame;j<run.lastFrame;j++)add('Düz arabağ',(bays+1),fmt(n(r.plan.braces[j],0))+' mm');}
 const railQty=floors.reduce((a,l)=>a+l.runs.length*bays*2,0),fifo=r.systemType==='fifo';add('Palet yastığı',railQty*(fifo?2:1));add('Forklift stoperi',fifo?railQty*2:bays+1);add('Giriş konsolu',fifo?railQty*2:(bays+1)*levels);if(!fifo)add('Arka stoper',railQty);add('Yatay çapraz seti',bays*Math.floor(levels/2));if(r.hasExtra)add('Ayak Profili',bays+1,'L '+fmt(height)+' mm');
 return {version:514,anchor:'rear',levels,depth,positions,floors,frames,height:Math.max(height,...frames.map(f=>f.height)),minimum:top,automatic,capacity:bays*floors.reduce((s,l)=>s+l.positions.length,0),rows,errors};
}
