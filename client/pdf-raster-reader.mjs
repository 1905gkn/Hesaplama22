const median=values=>values.slice().sort((a,b)=>a-b)[Math.floor(values.length/2)];
const red=(r,g,b)=>r>100&&r>g*1.25&&r>b*1.4;
export function detectRasterGeometry({data,width,height}){
  const bands=[];
  for(let y=0;y<height;y++){
    let count=0;for(let x=0;x<width;x++){const i=(y*width+x)*4;if(red(data[i],data[i+1],data[i+2]))count++;}
    if(count<width*.15)continue;
    const previous=bands.at(-1);
    if(previous&&y-previous.end<=2){previous.end=y;if(count>previous.count){previous.y=y;previous.count=count;}}
    else bands.push({y,end:y,count});
  }
  const gaps=bands.slice(1).map((b,i)=>b.y-bands[i].y).filter(n=>n>=height*.006&&n<height*.035);
  if(gaps.length<4)throw Error('Resimde tekrarlayan renkli raf sıraları seçilemedi. Daha net bir plan PDF’si gerekli.');
  const depth=median(gaps),rows=[];
  for(let n=0;n<bands.length-1;n++){
    const a=bands[n],b=bands[n+1],span=b.y-a.y;
    if(span<depth*.72||span>depth*1.35)continue;
    // Green cross-braces are not uprights; use the dark frame strokes.
    const frames=[];
    for(let x=0;x<width;x++){
      let count=0,total=0;
      for(let y=a.y+2;y<b.y-1;y++){const i=(y*width+x)*4,r=data[i],g=data[i+1],blue=data[i+2];total++;if((r<170&&g<170&&blue<170))count++;}
      if(!total||count/total<.6)continue;
      const last=frames.at(-1);if(last&&x-last.end<=2){last.end=x;last.x=(last.start+x)/2;}else frames.push({start:x,end:x,x});
    }
    // Bright yellow end uprights can lack a dark stroke at scan resolution.
    // Recover only isolated continuous strips; do not widen existing frames.
    const yellow=[];
    for(let x=0;x<width;x++){let hits=0,total=0;for(let y=a.y+2;y<b.y-1;y++){const i=(y*width+x)*4;total++;if(data[i]>230&&data[i+1]>230&&data[i+2]<110)hits++;}if(total&&hits/total>.65){const last=yellow.at(-1);if(last&&x-last.end<=2){last.end=x;last.x=(last.start+x)/2;}else yellow.push({start:x,end:x,x});}}
    for(const f of yellow)if(!frames.some(g=>Math.abs(g.x-f.x)<span*.45))frames.push(f);
    frames.sort((a,b)=>a.x-b.x);
    const bays=[];
    for(let j=0;j<frames.length-1;j++){
      const left=frames[j].x,right=frames[j+1].x,w=right-left;
      if(w<span*1.15||w>span*4)continue;
      let hits=0,total=0;
      for(let x=Math.ceil(left+2);x<right-2;x++)for(const y of [a.y,b.y]){total++;for(let dy=-2;dy<=2;dy++){const yy=y+dy;if(yy<0||yy>=height)continue;const i=(yy*width+x)*4;if(red(data[i],data[i+1],data[i+2])||(data[i+1]>80&&data[i+1]>data[i]*1.2)){hits++;break;}}}
      if(total&&hits/total>.62)bays.push({left,right,width:w});
    }
    if(bays.length>=6)rows.push({top:a.y,bottom:b.y,depth:span,bays,footPixels:median(frames.map(f=>Math.max(1,f.end-f.start)))});
  }
  if(rows.length<2)throw Error('Resimde raf gözleri güvenle ayrılamadı. Daha yüksek çözünürlüklü PDF gerekli.');
  const widths=rows.flatMap(r=>r.bays.map(b=>b.width)),typicalWidth=median(widths);
  // Braced bays use colored interior diagonals. Hatched tunnel bays interrupt
  // the red rails, so recover only gray spans bounded by neighboring rack bays.
  for(const row of rows){
    for(const bay of row.bays){let colored=0,total=0;for(let y=row.top+2;y<row.bottom-1;y++)for(let x=Math.ceil(bay.left+3);x<bay.right-3;x++){const i=(y*width+x)*4;total++;if(data[i+1]>80&&data[i+1]>data[i]*1.2)colored++;}bay.braced=total>0&&colored/total>.16;}
    const runs=[];
    for(let x=0;x<width;x++){let hits=0,total=0;for(let y=row.top+2;y<row.bottom-1;y++){const i=(y*width+x)*4,r=data[i],g=data[i+1],b=data[i+2];total++;if(r>70&&r<210&&Math.max(r,g,b)-Math.min(r,g,b)<25)hits++;}if(hits/total>.55){const last=runs.at(-1);if(last&&x-last.end<=2)last.end=x;else runs.push({start:x,end:x});}}
    for(const run of runs){if(run.end-run.start<typicalWidth*.55||run.end-run.start>typicalWidth*1.3)continue;const before=rows.flatMap(r=>r.bays).filter(b=>b.right<=run.start&&run.start-b.right<typicalWidth*.24).sort((a,b)=>b.right-a.right)[0],after=rows.flatMap(r=>r.bays).filter(b=>b.left>=run.end&&b.left-run.end<typicalWidth*.24).sort((a,b)=>a.left-b.left)[0];if(!before||!after||after.left<=before.right)continue;row.bays.push({left:before.right,right:after.left,width:after.left-before.right,tunnel:true,braced:false});}
    row.bays.sort((a,b)=>a.left-b.left);
  }
  // Geometry is always reviewable; dimensions are not inferred from pixel size.
  return {rows,typicalWidth,footPixels:median(rows.map(r=>r.footPixels)),width,height,count:rows.reduce((n,r)=>n+r.bays.length,0)};
}

export function rasterPlan(geometry,values){
  const fields=['sectionWidth','frameDepth','footHeight','levels','palletCount','palletWidth','palletDepth','palletHeight','palletWeight','firstBeamTop','clearOpening','doubleRowGap','beamHeight'];
  for(const key of fields)if(!Number.isFinite(values[key])||values[key]<=0)throw Error('Eksik veya geçersiz ölçü: '+key);
  if(values.levels<2||values.levels>15||!Number.isInteger(values.levels)||values.palletCount<1||values.palletCount>4||!Number.isInteger(values.palletCount))throw Error('Kat ve palet adedi geçersiz.');
  if(values.palletDepth<values.frameDepth||values.clearOpening<values.palletHeight)throw Error('Palet derinliği veya net kat açıklığı raf ölçüleriyle uyumsuz.');
  const sectionFor=count=>values.palletWidth===800&&count===4?3600:values.palletWidth*count+75*(count+1);
  const predicted=sectionFor(values.palletCount);
  if(predicted!==values.sectionWidth)throw Error('Açıklık, palet eni ve adedi sistemin 75 mm boşluklu B2B tipiyle uyuşmuyor.');
  if(geometry.rows.some(r=>r.bays.some(b=>b.tunnel&&!b.omit))&&(!Number.isFinite(values.tunnelHeight)||values.tunnelHeight<500||values.tunnelHeight>=values.footHeight))throw Error('Tünel geçiş yüksekliğini kontrol et.');
  const types=[],placements=[],excluded=[],scale=values.sectionWidth/(geometry.typicalWidth-geometry.footPixels);
  const minAlong=Math.min(...geometry.rows.flatMap(r=>r.bays.map(b=>b.left))),minAcross=geometry.rows[0].top;
  for(const [row,r] of geometry.rows.entries())for(const [bay,b] of r.bays.entries()){
    if(b.omit)continue;
    const width=(b.width-geometry.footPixels)*scale;
    const count=[1,2,3,4].filter(n=>n<=values.palletCount).sort((a,b)=>Math.abs(sectionFor(a)-width)-Math.abs(sectionFor(b)-width))[0];
    const sectionWidth=sectionFor(count),id='R'+(row+1)+'-'+(bay+1);
    if(Math.abs(width/sectionWidth-1)>.08){excluded.push(id);continue;}
    let t=types.find(t=>t.sectionWidth===sectionWidth);
    if(!t){t={...values,sectionWidth,palletCount:count,key:'raster-'+types.length,name:'PDF resim '+sectionWidth+' / H '+values.footHeight,system:'b2b',rowType:'single',rowGap:0,firstPalletPosition:'ground',clearOpenings:Array(values.levels-2).fill(values.clearOpening),levelStep:values.clearOpening};types.push(t);}
    placements.push({id,row:row+1,key:t.key,braced:!!b.braced,tunnelHeight:b.tunnel?values.tunnelHeight:0,x:(r.top+r.bottom-2*minAcross)/2*scale,y:(b.left+b.right-2*minAlong)/2*scale,width:values.frameDepth,depth:sectionWidth,angle:90});
  }
  if(!placements.length||placements.length>1000)throw Error('Aktarılacak raf gözü sayısı geçersiz (1–1000).');
  const conflicts=[];
  for(let i=0;i<placements.length;i++)for(let j=i+1;j<placements.length;j++){const a=placements[i],b=placements[j];if(Math.abs(a.x-b.x)<(a.width+b.width)/2-5&&Math.abs(a.y-b.y)<(a.depth+b.depth)/2-5)conflicts.push([a.id,b.id]);}
  return {types,placements,rows:geometry.rows.length,conflicts,orientation:'horizontal',doubleRowGap:values.doubleRowGap,warehouseBoundary:null,raster:true,warnings:['Görsel: ölçüler kullanıcı kontrolünden geçti; konumlar piksellerden yaklaşık çıkarıldı.','Yeşil çapraz ve gri tünel işaretleri önizleme onayıyla uygulanır. Diğer özel tipleri kontrol edin.','Depo dış sınırı, kapı ve kolonlar aktarılmaz.',...(excluded.length?[excluded.length+' belirsiz açıklık aktarılmadı: '+excluded.join(', ')]:[])]};
}

export function ocrSuggestions(text){
  const weight=text.match(/(?:max\s*load|weight|palet\s*y[uü]k[uü])\s*[:=]?\s*(\d{2,5})\s*k?g?/i);
  const result={palletWeight:weight?Number(weight[1]):null};
  for(const [key,label] of [['palletWidth','(?:PALLET\\s+)?WIDTH'],['palletDepth','(?:PALLET\\s+)?(?:DEPTH|LENGTH)'],['palletHeight','PALLET\\s+HEIGHT']]){
    const match=text.match(new RegExp('(?:^|\\n)\\s*'+label+'\\s*(?:\\(mm\\)|mm)?\\s*[:=]?\\s*(\\d{3,4})\\b','i'));if(match)result[key]=Number(match[1]);
  }
  return result;
}

export function pngDimensions(bytes){
  const magic=[137,80,78,71,13,10,26,10];
  if(bytes.length<24||magic.some((v,i)=>bytes[i]!==v)||String.fromCharCode(...bytes.slice(12,16))!=='IHDR')throw Error('Geçerli bir PNG dosyası seç.');
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),width=view.getUint32(16),height=view.getUint32(20);
  if(!width||!height||width>16000||height>16000||width*height>32000000)throw Error('PNG en fazla 32 milyon piksel ve kenar başına 16000 piksel olabilir.');
  return {width,height};
}
export async function scanRasterImage(file,progress,isCurrent,onWorker){
  pngDimensions(new Uint8Array(await file.slice(0,24).arrayBuffer()));
  if(!isCurrent())throw Error('İşlem iptal edildi.');
  let bitmap;const canvas=document.createElement('canvas');
  try{
    try{bitmap=await createImageBitmap(file);}catch{throw Error('PNG çözülemedi; dosya bozuk veya desteklenmiyor.');}
    if(!isCurrent())throw Error('İşlem iptal edildi.');
    const scale=Math.min(1,3200/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    return await scanCanvas(canvas,progress,isCurrent,onWorker);
  }finally{bitmap?.close();canvas.width=canvas.height=1;}
}
export async function scanRasterPage(page,progress,isCurrent,onWorker){
  const viewport=page.getViewport({scale:Math.min(4,3200/page.getViewport({scale:1}).width)}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
  try{const ctx=canvas.getContext('2d',{willReadFrequently:true});await page.render({canvasContext:ctx,viewport}).promise;return await scanCanvas(canvas,progress,isCurrent,onWorker);}
  finally{canvas.width=canvas.height=1;}
}
async function scanCanvas(canvas,progress,isCurrent,onWorker){
  if(!isCurrent())throw Error('İşlem iptal edildi.');
  const geometry=detectRasterGeometry(canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,canvas.width,canvas.height));
  progress('Raf çizgileri algılandı. Resimdeki yazı ve yük değerleri okunuyor…');
  const {default:Tesseract}=await import('/ocr/tesseract.esm.min.js');let worker;
  try{
    worker=await Tesseract.createWorker('eng',1,{workerPath:'/ocr/worker.min.js',corePath:'/ocr/core',langPath:'/ocr/lang',logger:m=>{if(isCurrent()&&m.status==='recognizing text')progress('Görsel okunuyor: %'+Math.round(m.progress*100));}});
    onWorker?.(worker);
    if(!isCurrent())throw Error('İşlem iptal edildi.');
    await worker.setParameters({tessedit_pageseg_mode:'11'});
    const {data}=await worker.recognize(canvas);
    return {geometry,text:data.text,suggestions:ocrSuggestions(data.text),image:canvas.toDataURL('image/png')};
  }finally{await worker?.terminate().catch(()=>{});}
}
