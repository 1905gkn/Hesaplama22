// Read unit schedules and vector bay outlines; never synthesize missing bays.
const fail=s=>{throw Error('Selective plan: '+s);};
export function inspectSelectivePlan({text,lines}){
 const specs=text.map(t=>({...t,match:t.text.match(/^([A-Z]\d*)-UNIT-(\d+)x(\d+)x(\d+)mm$/i)})).filter(t=>t.match);
 if(specs.length<2)return null;
 const capacityRows=text.map(t=>({...t,match:t.text.match(/^ZONE-(\d+)-TY-([A-Z]\d*)$/i)})).filter(t=>t.match);
 if(!capacityRows.length)fail('Tip bazlı kapasite tablosu bulunamadı.');
 const capacityHeading=text.find(t=>/^Locations$/i.test(t.text));
 if(!capacityHeading)fail('Kapasite sütunu bulunamadı.');
 const schedule=[];
 for(const row of capacityRows){
  const cells=text.filter(t=>t.x>row.x+row.width&&t.x<capacityHeading.x+capacityHeading.width+row.height&&Math.abs(t.y-row.y)<row.height*.4).sort((a,b)=>a.x-b.x);
  const dimensions=cells.find(t=>/^\d+x\d+x\d+$/i.test(t.text));
  const nums=cells.filter(t=>/^\d[\d,]*$/.test(t.text)).map(t=>Number(t.text.replaceAll(',','')));
  if(!dimensions||nums.length!==4||nums.some(n=>!Number.isSafeInteger(n)||n<=0)||nums[0]*nums[2]!==nums[3]||nums[2]%nums[1]!==0)fail('Kapasite satırı doğrulanamadı: '+row.text);
  schedule.push({zone:row.match[1],name:row.match[2],palletDimensions:dimensions.text.split(/x/i).map(Number),bays:nums[0],palletLevels:nums[1],palletsPerBay:nums[2],capacity:nums[3]});
 }
 const tableTop=Math.min(...specs.map(t=>t.y));
 const labels=text.filter(t=>specs.some(s=>s.match[1]===t.text)&&t.y<tableTop-t.height*8);
 if(!labels.length)fail('Plan içindeki tip etiketleri bulunamadı.');
 const sample=labels[0],sampleWidth=+specs.find(s=>s.match[1]===sample.text).match[4];
 const vertical=lines.filter(l=>Math.abs(l.x0-l.x1)<.02&&l.y0<tableTop-20&&l.y1<tableTop-20).map(l=>({...l,top:Math.min(l.y0,l.y1),bottom:Math.max(l.y0,l.y1),length:Math.abs(l.y1-l.y0)}));
 const edges=vertical.filter(l=>l.top<sample.y&&l.bottom>sample.y&&Math.abs(l.x0-sample.x)<sample.height*2&&l.length>sample.height*2);
 if(!edges.length)fail('Tip etiketi raf çizgilerine bağlanamadı.');
 const edge=edges.sort((a,b)=>Math.abs(a.x0-sample.x)-Math.abs(b.x0-sample.x))[0],scale=sampleWidth/edge.length;
 const frameDepth=+specs[0].match[3],intervals=new Map();
 for(const l of vertical){if(l.color!==edge.color)continue;const spec=specs.find(s=>Math.abs(l.length*scale-Number(s.match[4]))<35);if(!spec)continue;const key=Math.round(l.top*10)+':'+Math.round(l.bottom*10);if(!intervals.has(key))intervals.set(key,{top:l.top,bottom:l.bottom,width:+spec.match[4],xs:[]});intervals.get(key).xs.push(l.x0);}
 const bays=[];
 for(const row of intervals.values()){
  const clusters=[];for(const x of row.xs.sort((a,b)=>a-b)){let c=clusters.at(-1);if(!c||x-c[0]>.5){c=[];clusters.push(c);}c.push(x);}
  const xs=clusters.map(c=>(Math.min(...c)+Math.max(...c))/2);
  for(let i=0;i<xs.length-1;i++){if(Math.abs((xs[i+1]-xs[i])*scale-frameDepth)>100)continue;bays.push({cx:(xs[i]+xs[i+1])/2,cy:(row.top+row.bottom)/2,top:row.top,bottom:row.bottom,width:row.width,depth:frameDepth});i++;}
 }
 // A connected run has the same width and no aisle. Require matching source
 // labels in that run, rather than borrowing a label across a passage.
 const columns=[];for(const b of bays.sort((a,b)=>a.cx-b.cx||a.cy-b.cy)){let c=columns.find(c=>Math.abs(c[0].cx-b.cx)<.5);if(!c){c=[];columns.push(c);}c.push(b);}
 for(const column of columns){column.sort((a,b)=>a.cy-b.cy);const runs=[];for(const b of column){let run=runs.at(-1);if(!run||(b.top-run.at(-1).bottom)*scale>200){run=[];runs.push(run);}run.push(b);}for(const run of runs){const hits=labels.filter(t=>Math.abs(t.x+t.width/2-run[0].cx)<frameDepth/scale/2&&t.y>=run[0].top&&t.y<=run.at(-1).bottom);const names=[...new Set(hits.map(t=>t.text))];for(const b of run){const matching=names.filter(n=>Number(specs.find(s=>s.match[1]===n).match[4])===b.width);const families=[...new Set(names.map(n=>n.replace(/\d+$/,'')))];b.type=matching.length===1?matching[0]:families.length===1?specs.find(s=>s.match[1].replace(/\d+$/,'')===families[0]&&Number(s.match[4])===b.width)?.match[1]:null;}}}
 if(bays.some(b=>!b.type))fail('Bazı raf gözlerinin tipi kendi kesintisiz sırasındaki etiketlerden doğrulanamadı.');
 const quantities=specs.map(s=>{const name=s.match[1],rows=schedule.filter(r=>r.name===name),declared=rows.reduce((n,r)=>n+r.bays,0),detected=bays.filter(b=>b.type===name).length;if(!declared||declared!==detected)fail(name+' sayımı eşleşmiyor: tablo '+declared+', çizim '+detected+'.');return {name,declared,detected,capacity:rows.reduce((n,r)=>n+r.capacity,0)};});
 const enriched=specs.map(s=>{
  const name=s.match[1],family=name.replace(/\d+$/,''),caption=text.find(t=>t.text.split('-').length===2&&t.text.split('-').every(n=>n.replace(/\d+$/,'')===family));
  if(!caption)fail(name+' ön kesiti bulunamadı.');
  const nums=text.filter(t=>t.vertical&&/^\d+$/.test(t.text)&&t.x>caption.x+caption.width&&t.x<caption.x+caption.width+60&&t.y<caption.y&&t.y>tableTop);
  const cols=[];for(const t of nums){let c=cols.find(c=>Math.abs(c[0].x-t.x)<.5);if(!c){c=[];cols.push(c);}c.push(t);}
  const clearCol=cols.find(c=>c.filter(t=>Number(t.text)>=1000&&Number(t.text)<=2000).length>=4);
  const beamCol=cols.find(c=>c.filter(t=>Number(t.text)>=50&&Number(t.text)<=300).length>=4);
  if(!clearCol||!beamCol)fail(name+' kesit kat açıklıkları doğrulanamadı.');
  const common=c=>{const counts=new Map();for(const t of c)counts.set(Number(t.text),(counts.get(Number(t.text))||0)+1);return [...counts].sort((a,b)=>b[1]-a[1])[0][0];};
  const beam=common(beamCol),opening=common(clearCol),firstClear=Number(clearCol.slice().sort((a,b)=>b.y-a.y)[0].text);
  const weights=[...new Set(text.filter(t=>t.x>caption.x-30&&t.x<caption.x+caption.width+30&&t.y<caption.y&&t.y>tableTop).map(t=>t.text.match(/^(\d+)\s*KG$/i)?.[1]).filter(Boolean).map(Number))];
  if(weights.length!==1)fail(name+' palet yükü kesitten doğrulanamadı.');
  return {name,footHeight:+s.match[2],frameDepth:+s.match[3],sectionWidth:+s.match[4],firstBeamTop:firstClear+beam,levelPitch:opening+beam,sourceBeamHeight:beam,palletWeight:weights[0]};
 });
 return {specs:enriched,bays,scale,columns:columns.length,schedule,quantities,capacity:quantities.reduce((n,q)=>n+q.capacity,0)};
}

export function selectivePlan(audit,{levels,groundHeightFactor}={}){
 if(!Number.isInteger(levels)||levels<2||levels>21||![1,2].includes(groundHeightFactor))fail('Kat sayısı ve zemin palet düzeni açıkça onaylanmalı.');
 const types=audit.specs.map(s=>{
  const rows=audit.schedule.filter(r=>r.name===s.name),r=rows[0];
  if(rows.some(x=>JSON.stringify(x.palletDimensions)!==JSON.stringify(r.palletDimensions)||x.palletLevels!==r.palletLevels||x.palletsPerBay!==r.palletsPerBay))fail(s.name+' tablosunda çelişkili yük ölçüleri var.');
  const [palletHeight,palletWidth,palletDepth]=r.palletDimensions,palletCount=r.palletsPerBay/r.palletLevels;
  const lastBeam=s.firstBeamTop+(levels-2)*s.levelPitch;
  if(lastBeam>s.footHeight||s.firstBeamTop-s.sourceBeamHeight<palletHeight*groundHeightFactor)fail(s.name+' kat kotları ayak / yük yüksekliğiyle uyuşmuyor.');
  return {...s,key:'selective-'+s.name,system:'b2b',rowType:'single',rowGap:0,firstPalletPosition:'ground',levels,palletHeight,palletWidth,palletDepth,palletCount,palletHeights:[palletHeight*groundHeightFactor,...Array(levels-1).fill(palletHeight)],levelPitches:Array(levels-2).fill(s.levelPitch)};
 });
 const xs=[...new Set(audit.bays.map(b=>Math.round(b.cx*10)/10))].sort((a,b)=>a-b),minX=Math.min(...audit.bays.map(b=>b.cx-b.depth/audit.scale/2)),minY=Math.min(...audit.bays.map(b=>b.top));
 const placements=audit.bays.map((b,i)=>({id:'S'+(i+1),key:'selective-'+b.type,row:xs.indexOf(Math.round(b.cx*10)/10)+1,x:(b.cx-minX)*audit.scale,y:(b.cy-minY)*audit.scale,width:b.depth,depth:b.width,angle:0}));
 const capacity=placements.reduce((n,p)=>n+types.find(t=>t.key===p.key).palletCount*levels,0);
 return {types,placements,reconcileMixedRows:true,rows:xs.length,orientation:'vertical',conflicts:[],warehouseBoundary:null,capacity,warnings:['Kaynak çizimde '+placements.length+' göz; dört tipin sayımı kapasite tablosuyla eşleştirildi.','Kullanıcı onayı: zemin + '+(levels-1)+' travers katı; zemin yük yüksekliği '+groundHeightFactor+' palet yüksekliği.','Kaynak tablo kapasitesi '+audit.capacity+'; yerleşim motorunun istifsiz kapasitesi '+capacity+'. Zemin istifi analiz hesabında ayrıca gösterilir.','Uyumlu sırt sırta gözler çift blok, farklı veya taşan bölümler tekli blok olarak korunur. Farklı dizilimlerin birleştiği yerlerde ortak ayak doğrulanamazsa iki uç ayak korunur ve konumlar buna göre düzeltilir.','Konumlar vektör çiziminden ölçeklenmiştir; NTS plan nedeniyle koridor ölçüleri yaklaşık kabul edilmelidir. Duvarlar, kolonlar ve bina çaprazları aktarılmaz.','Travers/ayak profilleri uygulamanın yük tablosundan seçilir; kaynak profilin mühendislik onayı değildir.']};
}
