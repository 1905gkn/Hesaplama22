import {mekikStepped} from './mekik-stepped.mjs';

// Shared rear-anchored placement, with Drive-In height and product rules.
// Millimetres throughout. No shuttle FIFO accessory multipliers enter here.
export function driveStepped(r){
 const c=r?.driveCustomizationV521;if(!c)return null;
 if(!r.plan?.feet?.length)throw Error('Drive-In ayak yerleşimi eksik.');
 const n=(v,f=0)=>v!==null&&v!==''&&Number.isFinite(Number(v))?Number(v):f;
 const ceil=v=>Math.ceil(v/50)*50;
 const base=mekikStepped({...r,mekikCustomizationV514:{...c,heightMode:'auto',frameHeights:[]}});
 const ph=n(r.palletHeight,1200),cols=Math.max(1,n(r.bays,1))+1,bays=cols-1;
 const minimum=ceil(base.floors.at(-1).y+ph+220),height=c.heightMode==='manual'?ceil(n(c.uprightHeight)):minimum;
 const errors=base.errors.filter(e=>!e.startsWith('Ayak boyu'));
 if(height<minimum)errors.push('Drive-In ayak boyu üst palet kotu ve 220 mm üst bağlantı payından ('+minimum+' mm) kısa olamaz.');
 for(const f of base.frames){
  const supported=base.floors.filter(l=>l.runs.some(run=>f.index>=run.firstFrame&&f.index<=run.lastFrame));
  f.levels=supported.length;f.minimum=ceil((supported.at(-1)?.y||base.floors[0].y)+ph+220);
  const automatic=supported.length===base.levels?height:Math.min(height,f.minimum);
  f.height=ceil(n(c.frameHeights?.[f.index])||automatic);
  if(f.height<f.minimum)errors.push((f.index+1)+'. Drive-In ayak boyu taşıdığı paletin üst kotu ve üst bağlantı payından kısa olamaz.');
 }
 const rows=[],fmt=v=>new Intl.NumberFormat('tr-TR',{maximumFractionDigits:2}).format(v);
 const add=(name,qty,spec='')=>{if(qty>0)rows.push({name,qty,spec,unit:name==='Ayak takımı'?'takım':'adet'});};
 const feet=new Map();for(const f of base.frames){const key=f.depth+'|'+f.height;feet.set(key,(feet.get(key)||0)+cols);}
 for(const [key,qty]of feet){const [d,h]=key.split('|').map(Number);add('Ayak takımı',qty,(r.footProfile?r.footProfile+' · ':'')+'Yükseklik '+fmt(h)+' mm · Derinlik '+fmt(d)+' mm');}
 const profile=typeof r.traverseRecommendation==='string'?r.traverseRecommendation:r.traverseRecommendation?.label||r.traverseType||'';
 const pitch=(n(r.totalWidth||r.widthMm)-n(r.footType,90))/bays;
 for(const floor of base.floors)for(const run of floor.runs){
  add('Travers',run.stations.length*bays,profile+' · '+fmt(pitch)+' mm');
  add('Ray',bays*2,fmt(n(r.railThickness,2.5))+' mm kalınlık · H '+fmt(n(r.railHeight,150))+' mm · L '+fmt(run.end-run.start)+' mm · '+floor.positions.filter(p=>p>=run.start&&p+n(r.palD,800)<=run.end+1).length+' derinlik');
  // Native Drive-In ties occur on alternating levels, including the first.
  if(floor.index%2===0)for(let j=run.firstFrame;j<run.lastFrame;j++)add('Düz arabağ',cols,fmt(n(r.plan.braces[j]))+' mm');
 }
 const railQty=base.floors.reduce((sum,l)=>sum+l.runs.length*bays*2,0);
 add('Palet yastığı',railQty);add('Arka stoper',railQty);
 add('Forklift stoperi',cols);add('Giriş konsolu',cols*base.floors.reduce((sum,l)=>sum+l.runs.length,0));
 add('Yatay çapraz seti',bays*Math.floor(base.levels/2));
 if(r.hasExtra)add('Ayak Profili',cols,'L '+fmt(Math.max(height,...base.frames.map(f=>f.height)))+' mm');
 return {...base,version:521,system:'drive',rows,height:Math.max(height,...base.frames.map(f=>f.height)),automatic:minimum,minimum,errors};
}
