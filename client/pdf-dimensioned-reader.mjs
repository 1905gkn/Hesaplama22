const median=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
const norm=s=>String(s).normalize('NFKC').replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/٫/g,'.');
const number=t=>/^\d+(?:[.,]\d+)?$/.test(norm(t.text))?Number(norm(t.text).replace(',','.')):NaN;
const saturated=c=>/^#[\da-f]{6}$/i.test(c)&&Math.max(...[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)))-Math.min(...[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)))>90;
// Infer dimensions from units, repeated numeric pairs, spatial tables and matching
// section identifiers. Prose and document instructions have no role in parsing.
export function detectDimensionedPlan(vector){
 const {text,lines}=vector,labels=text.map(t=>({...t,pair:norm(t.text).match(/^(\d{3,4})\s*[\/×x]\s*(\d{3,4})$/i)})).filter(t=>t.pair&&!t.vertical);
 if(labels.length<8)return null;
 const depth=median(labels.map(t=>+t.pair[2])),standard=median(labels.map(t=>+t.pair[1])),nums=text.filter(t=>Number.isFinite(number(t)));
 const heads=text.filter(t=>!t.vertical&&/(?:mm|мм|毫米|مم|ミリ|밀리|मिमी)/iu.test(norm(t.text)));
 const loads=[];
 for(const head of heads){
  const cols=heads.filter(h=>Math.abs(h.y-head.y)<head.height*.5&&h.x>=head.x).sort((a,b)=>a.x-b.x).slice(0,3);if(cols.length!==3)continue;
  const first=nums.filter(t=>t.y>head.y&&t.y<head.y+head.height*6&&Math.abs(t.x+t.width/2-(head.x+head.width/2))<head.height*2);
  for(const row of first){
   const cells=cols.map(h=>nums.filter(t=>Math.abs(t.y-row.y)<head.height*.5&&Math.abs(t.x+t.width/2-(h.x+h.width/2))<head.height*2).sort((a,b)=>Math.abs(a.x+a.width/2-h.x-h.width/2)-Math.abs(b.x+b.width/2-h.x-h.width/2))[0]);
   if(cells.some(c=>!c))continue;const [w,d,h]=cells.map(number);
   if(w<500||w>1500||d<depth||d>depth+400||h<300||![1,2,3,4].some(n=>Math.abs(n*w+(n+1)*75-standard)<10))continue;
   const id=text.filter(t=>!t.vertical&&t.x<cells[0].x&&Math.abs(t.y-row.y)<head.height*.5&&!Number.isFinite(number(t))).sort((a,b)=>b.x-a.x)[0];
   if(!id||!text.some(t=>t.text===id.text&&Math.abs(t.y-id.y)>head.height*8))continue;
   if(!loads.some(l=>l.id===id.text))loads.push({id:id.text,width:w,depth:d,height:h,tableY:row.y});
  }
 }
 if(!loads.length)throw Error('Ölçü çiftleri bulundu; yük tablosunun sayısal sütunları güvenle eşleşmedi.');
 if(loads.some(l=>l.width!==loads[0].width||l.depth!==loads[0].depth))throw Error('Farklı palet taban ölçüleri aynı kesitte otomatik eşleştirilemiyor.');
 const weights=text.map(t=>norm(t.text).match(/^(\d+(?:[.,]\d+)?)\s*(?:kg|кг|كغ|公斤|千克)$/iu)).filter(Boolean).map(m=>Number(m[1].replace(',','.')));
 if(!weights.length||new Set(weights).size!==1)throw Error('Tekil palet yükü ve birimi güvenle okunamadı.');
 const refs=text.filter(t=>loads.some(l=>l.id===t.text&&Math.abs(l.tableY-t.y)>t.height*8));
 const columns=[];for(const r of refs){let col=columns.find(c=>Math.abs(c[0].x-r.x)<r.height);if(!col){col=[];columns.push(col);}col.push(r);}
 const section=columns.sort((a,b)=>b.length-a.length)[0]?.sort((a,b)=>b.y-a.y);if(!section||section.length<2)throw Error('Yük tipleri kesit katlarına bağlanamadı.');
 const pitches=nums.filter(t=>t.vertical&&t.x<section[0].x&&section[0].x-t.x<section[0].height*10&&number(t)>=Math.min(...loads.map(l=>l.height))&&number(t)<=Math.max(...loads.map(l=>l.height))*1.5);
 const pitchGroups=[];for(const p of pitches){let g=pitchGroups.find(g=>Math.abs(g[0].x-p.x)<p.height);if(!g){g=[];pitchGroups.push(g);}g.push(p);}
 const steps=pitchGroups.sort((a,b)=>b.length-a.length)[0]?.sort((a,b)=>b.y-a.y);
 if(!steps||steps.length!==section.length-1)throw Error('Kesitteki kat aralığı ölçülerinin tamamı eşleşmedi.');
 const sectionScale=median(steps.slice(1).map((p,i)=>number(p)/(steps[i].y-p.y)));
 if(!Number.isFinite(sectionScale)||steps.slice(1).some((p,i)=>Math.abs(number(p)/(steps[i].y-p.y)/sectionScale-1)>.04))throw Error('Kesit kat ölçüleri çizgi ölçeğiyle uyuşmuyor.');
 const uprights=nums.filter(t=>t.vertical&&number(t)>steps.reduce((n,s)=>n+number(s),0)&&number(t)<steps.reduce((n,s)=>n+number(s),0)+Math.max(...loads.map(l=>l.height)));
 const repeated=uprights.filter(t=>uprights.filter(q=>number(q)===number(t)).length>=2);
 if(!repeated.length)throw Error('Ayak yüksekliği ön ve yan kesitlerde doğrulanamadı.');
 const footHeight=number(repeated[0]);
 if(repeated.some(t=>number(t)!==footHeight))throw Error('Birden fazla ayak yüksekliği var; kesit eşleştirmesi gerekli.');
 const rails=lines.filter(l=>Math.abs(l.y0-l.y1)<.03&&saturated(l.color)&&Math.abs(l.x1-l.x0)>5).map(l=>({...l,left:Math.min(l.x0,l.x1),right:Math.max(l.x0,l.x1)}));
 const bays=labels.map(t=>{
  const center=t.x+t.width/2,candidates=rails.filter(l=>l.left<center&&l.right>center&&Math.abs(l.y0-t.y)<t.height*2).sort((a,b)=>Math.abs(a.y0-t.y)-Math.abs(b.y0-t.y));
  const lower=candidates.find(l=>l.y0>=t.y),upper=candidates.find(l=>l.y0<t.y-t.height*.6);
  if(!lower||!upper||Math.abs((lower.right-lower.left)/(upper.right-upper.left)-1)>.04)throw Error('Bir raf etiketinin çizgi sınırları eşleşmedi.');
  return {width:+t.pair[1],depth:+t.pair[2],cx:(lower.left+lower.right)/2,cy:(upper.y0+lower.y0)/2,scale:+t.pair[1]/(lower.right-lower.left)};
 });
 const scale=median(bays.map(b=>b.scale));if(bays.some(b=>Math.abs(b.scale/scale-1)>.04))throw Error('Plan etiketleri farklı çizim ölçekleriyle eşleşiyor.');
 const rowYs=[];for(const b of bays.sort((a,b)=>a.cy-b.cy||a.cx-b.cx)){if(!rowYs.some(y=>Math.abs(y-b.cy)<1))rowYs.push(b.cy);}
 const side=nums.filter(t=>!t.vertical&&number(t)===depth&&t.x>section[0].x-section[0].height*3&&t.y>Math.max(...section.map(t=>t.y)));
 let rowGap;for(const a of side)for(const b of side){if(b.x<=a.x||Math.abs(a.y-b.y)>a.height)continue;const between=nums.find(t=>!t.vertical&&t.x>a.x&&t.x<b.x&&Math.abs(t.y-a.y)<a.height&&number(t)<depth);if(between)rowGap=number(between);}
 if(!(rowGap>=0))throw Error('Çift sıra ara mesafesi yan kesitten okunamadı.');
 const heights=section.map(t=>loads.find(l=>l.id===t.text).height),types=[],placements=[],minX=Math.min(...bays.map(b=>b.cx-b.width/scale/2)),minY=Math.min(...bays.map(b=>b.cy-b.depth/scale/2));
 for(const [i,b] of bays.entries()){
  let type=types.find(t=>t.sectionWidth===b.width&&t.frameDepth===b.depth);
  if(!type){const count=[4,3,2,1].find(n=>n*loads[0].width+(n+1)*75<=b.width+1);if(!count)throw Error('Palet tabanı raf açıklığına sığmıyor.');type={key:'dim-'+types.length,name:b.width+' / H '+footHeight,system:'b2b',sectionWidth:b.width,frameDepth:b.depth,footHeight,levels:heights.length,palletCount:count,palletWidth:loads[0].width,palletDepth:loads[0].depth,palletHeight:heights[0],palletHeights:heights,palletWeight:weights[0],firstPalletPosition:'ground',firstBeamTop:number(steps[0]),levelPitches:steps.slice(1).map(number),rowType:'single',rowGap:0};types.push(type);}
  placements.push({id:'D'+(i+1),key:type.key,row:rowYs.findIndex(y=>Math.abs(y-b.cy)<1)+1,x:(b.cy-minY)*scale,y:(b.cx-minX)*scale,width:b.depth,depth:b.width,angle:90});
 }
 const capacity=placements.reduce((n,p)=>n+types.find(t=>t.key===p.key).palletCount*heights.length,0);
 const declared=loads.map(l=>text.map(t=>({t,m:norm(t.text).match(/=\s*(\d+)\b/)})).find(({t,m})=>m&&t.text.includes(l.id)&&t.y>l.tableY)?.m).filter(Boolean).map(m=>+m[1]);
 if(declared.length===loads.length&&declared.reduce((n,c)=>n+c,0)!==capacity)throw Error('Algılanan raf kapasitesi belgedeki yük tipi adetleriyle uyuşmuyor; eksik aktarım durduruldu.');
 return {types,placements,rows:rowYs.length,orientation:'horizontal',doubleRowGap:rowGap,conflicts:[],warehouseBoundary:null,capacity,warnings:['Ölçü çiftleri ve sayısal tablo yapısından okundu. Kat bazında farklı yük yükseklikleri korunur.','Hesaplanan palet kapasitesi: '+capacity+'.','Depo duvarları ve kapı/kolonlar bu aktarımda oluşturulmaz.']};
}
