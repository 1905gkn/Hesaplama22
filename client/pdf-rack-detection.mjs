import {detectDimensionedPlan} from './pdf-dimensioned-reader.mjs';
const median=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
const numeric=t=>/^\d+(?:[.,]\d+)?$/.test(t.text)?Number(t.text.replace(',','.')):NaN;
const saturated=c=>/^#[\da-f]{6}$/i.test(c)&&Math.max(...[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)))-Math.min(...[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)))>100;
const vertical=l=>Math.abs(l.x0-l.x1)<.15;
const horizontal=l=>Math.abs(l.y0-l.y1)<.15;
const length=l=>Math.hypot(l.x1-l.x0,l.y1-l.y0);
const close=(a,b,t)=>Math.abs(a-b)<t;
const fail=message=>{throw Error(message);};
// Keep source bays intact for conflict reporting. Native blocks may represent two bays.
export function groupRackPlan(plan){
  const excluded=new Set(plan.conflicts.flat()),used=new Set(),types=new Map(plan.types.map(t=>[t.key,t])),importTypes=new Map(),blocks=[];
  for(const p of plan.placements){
    if(excluded.has(p.id)||used.has(p.id))continue;
    const spec=types.get(p.key);
    const matches=plan.placements.filter(q=>q.id!==p.id&&!used.has(q.id)&&!excluded.has(q.id)&&q.key===p.key&&!!q.braced===!!p.braced&&(q.tunnelHeight||0)===(p.tunnelHeight||0)&&Math.abs(q.y-p.y)<=10&&Math.abs(q.x-p.x)>=spec.palletDepth&&Math.abs(q.x-p.x)<=spec.frameDepth+500).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x));
    const partner=matches[0],gap=partner?(Number.isFinite(plan.doubleRowGap)?plan.doubleRowGap:Math.round((Math.abs(partner.x-p.x)-spec.frameDepth)/5)*5):0;
    const key=partner?spec.key+'-double-'+gap:spec.key;
    importTypes.set(key,{...spec,key,rowType:partner?'double':'single',rowGap:gap,name:spec.name+(partner?' · Çift sıra '+gap:' · Tek sıra')});
    const sources=partner?[p,partner]:[p];sources.forEach(q=>used.add(q.id));
    blocks.push({...p,key,x:partner?(p.x+partner.x)/2:p.x,width:partner?spec.frameDepth*2+gap:p.width,sourceIds:sources.map(q=>q.id),sourceRows:sources.map(q=>q.row).sort((a,b)=>a-b),rowCount:sources.length});
  }
  return {...plan,importTypes:[...importTypes.values()],blocks};
}
export function detectRacks(vector){
  const dimensioned=detectDimensionedPlan(vector);if(dimensioned)return dimensioned;
  const {text,lines}=vector,nums=text.filter(t=>Number.isFinite(numeric(t)));
  function tableValue(label){
    const heading=text.find(t=>label.test(t.text));if(!heading)return null;
    const values=nums.filter(t=>t.x>heading.x+heading.width&&Math.abs(t.y-heading.y)<heading.height*.6).sort((a,b)=>a.x-b.x);
    return values.length?numeric(values[0]):null;
  }
  const palletWidth=tableValue(/^(WIDTH|GENİŞLİK)\s*\(mm\)/i),palletDepth=tableValue(/^(LENGTH|DEPTH|DERİNLİK|UZUNLUK)\s*\(mm\)/i),palletHeight=tableValue(/^(HEIGHT|YÜKSEKLİK)\s*\(mm\)/i),palletWeight=tableValue(/^(WEIGHT|AĞIRLIK)\s*\(kg\)/i);
  if(![palletWidth,palletDepth,palletHeight,palletWeight].every(n=>n>0))fail('Palet ölçüleri ve yük tablosu okunamadı. Tablo düzeni otomatik eşleşmedi; yük ölçülerinin doğrulanması gerekli.');
  const depthGroups=new Map();
  for(const t of nums.filter(t=>!t.vertical&&numeric(t)>=500&&numeric(t)<=palletDepth)){
    const key=t.text+':'+Math.round(t.y/5);if(!depthGroups.has(key))depthGroups.set(key,[]);depthGroups.get(key).push(t);
  }
  const depthLabels=[...depthGroups.values()].sort((a,b)=>b.length-a.length)[0];
  if(!depthLabels||depthLabels.length<2)fail('Raf sıralarının derinlik ölçüleri eşleştirilemedi.');
  const frameDepth=numeric(depthLabels[0]),sectionY=median(depthLabels.map(t=>t.y));
  const sectionLabels=nums.filter(t=>!t.vertical&&t.y>sectionY&&numeric(t)>palletWidth*1.5&&numeric(t)<palletWidth*5);
  const beamLines=lines.filter(l=>horizontal(l)&&saturated(l.color)&&length(l)>10);
  const calibrations=[];
  for(const t of sectionLabels){
    const candidates=beamLines.filter(l=>l.y0<t.y&&t.y-l.y0<150&&Math.abs((l.x0+l.x1)/2-(t.x+t.width/2))<t.height*.4).sort((a,b)=>b.y0-a.y0);
    if(candidates.length)calibrations.push({width:numeric(t),scale:numeric(t)/length(candidates[0]),label:t});
  }
  if(calibrations.length<2)fail('Travers açıklıkları ile çizim ölçeği doğrulanamadı.');
  const scale=median(calibrations.map(c=>c.scale));
  if(calibrations.some(c=>Math.abs(c.scale/scale-1)>.025))fail('PDF’de farklı ölçekler var; raf planı güvenle eşleştirilemedi.');
  const widths=[...new Set(calibrations.map(c=>c.width))].sort((a,b)=>b-a),depthPt=frameDepth/scale;
  const heightLabels=nums.filter(t=>t.vertical&&t.y>sectionY&&numeric(t)>palletHeight*2);
  const heights=heightLabels.map(t=>{
    const dims=nums.filter(n=>n.vertical&&n.x>t.x&&n.x<t.x+t.height*3&&n.y>sectionY&&numeric(n)<numeric(t)/2);
    // Read bottom to top. The first dimension is ground -> first beam TOP;
    // subsequent dimensions are clear openings (lower beam TOP -> upper BOTTOM).
    const steps=dims.sort((a,b)=>b.y-a.y).map(numeric);return {height:numeric(t),levels:steps.length+1,first:steps[0],clearances:steps.slice(1),step:Math.min(...steps)};
  });
  if(!heights.length||heights.some(h=>h.levels<2||!Number.isFinite(h.step)))fail('Kesit yüksekliği ve kat aralıkları okunamadı.');
  const railLines=lines.filter(l=>vertical(l)&&saturated(l.color)&&Math.max(l.y0,l.y1)<sectionY-depthPt*2&&widths.some(w=>Math.abs(length(l)*scale/w-1)<.012));
  const columns=[];
  for(const l of railLines.sort((a,b)=>a.x0-b.x0)){
    let column=columns.at(-1);if(!column||!close(column.x,l.x0,.15)){column={x:l.x0,spans:[]};columns.push(column);}
    const top=Math.min(l.y0,l.y1),bottom=Math.max(l.y0,l.y1);
    if(!column.spans.some(s=>close(s.top,top,.15)&&close(s.bottom,bottom,.15)))column.spans.push({top,bottom});
  }
  const rows=[];let consumed=-Infinity;
  for(const column of columns.filter(c=>c.spans.length>=4)){
    if(column.x<=consumed)continue;
    const right=columns.filter(c=>c.x>column.x+depthPt*.8&&c.x<column.x+depthPt*1.05).find(c=>column.spans.filter(s=>c.spans.some(r=>close(s.top,r.top,.2)&&close(s.bottom,r.bottom,.2))).length>=column.spans.length*.85);
    if(!right)continue;
    const dimension=depthLabels.find(t=>t.x>=column.x-depthPt*.2&&t.x<right.x);
    if(!dimension)continue;
    const upright=lines.filter(l=>vertical(l)&&saturated(l.color)&&l.x0>=column.x-depthPt*.08&&l.x0<=right.x+depthPt*.08&&Math.max(l.y0,l.y1)<sectionY&&Math.max(l.y0,l.y1)>sectionY-depthPt&&length(l)>depthPt*2).sort((a,b)=>length(b)-length(a))[0];
    if(!upright)fail('Bir sıranın kesit yüksekliği okunamadı.');
    const measured=length(upright)*scale,height=heights.slice().sort((a,b)=>Math.abs(a.height-measured)-Math.abs(b.height-measured))[0];
    if(Math.abs(height.height/measured-1)>.025)fail('Sıra yüksekliği kesit ölçüleriyle uyuşmuyor.');
    rows.push({...column,right:right.x,height});consumed=column.x+depthPt*1.06;
  }
  if(!rows.length||rows.length!==depthLabels.length)fail('Plan sıraları ile kesitlerin tamamı eşleştirilemedi. Eksik aktarım yapmamak için işlem durduruldu.');
  const types=[],placements=[];
  for(const [row,r] of rows.entries())for(const [bay,s] of r.spans.sort((a,b)=>a.top-b.top).entries()){
    const width=widths.slice().sort((a,b)=>Math.abs(a-(s.bottom-s.top)*scale)-Math.abs(b-(s.bottom-s.top)*scale))[0];
    let type=types.find(t=>t.sectionWidth===width&&t.footHeight===r.height.height);
    if(!type){
      const palletCount=[1,2,3,4].find(n=>n*palletWidth+(n+1)*75===width);
      if(!palletCount)fail(width+' mm özel açıklık otomatik tip hesabıyla eşleşmedi.');
      type={key:'pdf-'+types.length,name:'PDF '+width+' / H '+r.height.height,system:'b2b',sectionWidth:width,frameDepth,footHeight:r.height.height,levels:r.height.levels,palletCount,palletWidth,palletDepth,palletHeight,palletWeight,rowType:'single',rowGap:0,firstPalletPosition:'ground',firstFloorGap:0,palletTraverseGap:0,firstBeamTop:r.height.first,clearOpenings:r.height.clearances.slice(),levelStep:r.height.step};types.push(type);
    }
    placements.push({id:'R'+(row+1)+'-'+(bay+1),row:row+1,key:type.key,x:(r.x+r.right)/2*scale,y:(s.top+s.bottom)/2*scale,angle:90,width:frameDepth,depth:width});
  }
  const originX=Math.min(...placements.map(p=>p.x))-frameDepth/2,originY=Math.min(...placements.map(p=>p.y-p.depth/2));
  placements.forEach(p=>{p.x=Math.round((p.x-originX)/5)*5;p.y=Math.round((p.y-originY)/5)*5;});
  const conflicts=[];
  for(let i=0;i<placements.length;i++)for(let j=i+1;j<placements.length;j++){
    const a=placements[i],b=placements[j];if(Math.abs(a.x-b.x)<(a.width+b.width)/2-5&&Math.abs(a.y-b.y)<(a.depth+b.depth)/2-5)conflicts.push([a.id,b.id]);
  }
  if(placements.length>1000)fail('Bir aktarımda en fazla 1000 raf gözü desteklenir.');
  return {types,placements,rows:rows.length,conflicts,warehouseBoundary:null,warnings:['PDF’de depo dış sınırı doğrulanamadı. Mevcut raf konumları aktarılır; depo alanına göre optimizasyon yapılmaz.',...(conflicts.length?[conflicts.length+' raf çifti kaynak PDF’de üst üste çizilmiş. Bu gözler çakışma çözülene kadar yerleştirilmeyecek.']:[])]};
}
