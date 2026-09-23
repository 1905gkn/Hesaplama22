(function(){
  let dialog,task,serial=0,plan,entries,identity,fileName,raster,rasterModule,groupPlan,ocrWorker,batch=[],active=null,busy=false,combinePlans;
  const edits=new Map(),specKey=t=>JSON.stringify(Object.fromEntries(Object.entries(t).filter(([k])=>!["key","name","_originalSignature"].includes(k)).sort(([a],[b])=>a.localeCompare(b))));
  const owner=()=>window.rafexProjectIdentityV133?.uuid;
  window.rafexPdfReadingV201={fields:()=>rasterFields,contains:file=>batch.some(i=>i.file===file),ocr:file=>active?.file===file?raster?.text||'':'',apply(file,readings){if(active?.file!==file||!raster||owner()!==identity)throw Error('Bu dosyanın ölçü formu açık değil. Okunan değerleri ilgili raf tipinde elle kontrol et.');const targets=readings.map(r=>({r,input:dialog.querySelector('[data-raster-field="'+r.field+'"]')}));if(targets.some(t=>!t.input))throw Error('Seçilen ölçülerden biri bu formda yok; yalnız mevcut alanları seç.');for(const {r,input} of targets){input.value=r.value;input.dispatchEvent(new Event('change',{bubbles:true}));}dialog.querySelector('[data-raster-reviewed]').checked=false;}};
  function status(text){dialog.querySelector('[data-pdf-workflow] [role=status], :scope > [role=status]').textContent=text;}
  function clear(){window.rafexImportTypeEditorV198?.close();edits.clear();batch=[];active=null;busy=false;serial++;task?.destroy();task=null;plan=null;entries=null;raster=null;ocrWorker?.terminate().catch(()=>{});ocrWorker=null;dialog?.querySelector("[data-raster]")?.replaceChildren();}
  function open(){
    if(!dialog){
      const style=document.createElement('style');style.textContent='#rafexAutoLayoutButton{background:#246447;color:white;border:0;border-radius:7px;padding:10px 14px;font-weight:700;cursor:pointer}#rafexPdfAutoDialog{width:min(840px,94vw);max-height:88vh;overflow:auto;border:1px solid #b9cec3;border-radius:12px;padding:24px;color:#173c2d}#rafexPdfAutoDialog::backdrop{background:#10211999}#rafexPdfAutoDialog header,#rafexPdfAutoDialog footer{display:flex;gap:12px;justify-content:space-between;align-items:center}#rafexPdfAutoDialog h2{margin:0}#rafexPdfAutoDialog p{line-height:1.6}#rafexPdfAutoDialog button{padding:10px 16px;cursor:pointer}#rafexPdfAutoDialog label{display:block;margin:18px 0}#rafexPdfAutoDialog [role=status]{white-space:pre-wrap;padding:12px;background:#f0f6f2}#rafexPdfAutoDialog table{width:100%;border-collapse:collapse;font-size:13px}#rafexPdfAutoDialog td,#rafexPdfAutoDialog th{padding:8px;border-bottom:1px solid #ddd;text-align:left}#rafexPdfAutoDialog svg{width:100%;height:280px;background:#f4f7f5}#rafexPdfAutoDialog [hidden]{display:none!important}';document.head.append(style);
      dialog=document.createElement('dialog');dialog.id='rafexPdfAutoDialog';dialog.innerHTML='<header><h2>PDF / PNG’den otomatik yerleşim</h2><button data-close aria-label="Kapat">×</button></header><p>Ölçülü B2B plan PDF’sini veya PNG görselini seç. Raf tipleri ve konumlar otomatik okunur; ayak ve traversler uygulamanın yük tablolarından hesaplanır.</p><label>PDF / PNG dosyaları (en fazla 10 dosya, dosya başına 20 MB)<input data-file multiple type="file" accept="application/pdf,image/png,.pdf,.png"></label><p><small>Dosya bu tarayıcıda işlenir. Vektörel PDF doğrudan okunur. PNG ve resim PDF’de renkli yatay raf planı ve OCR kullanılır; belirsiz ölçüler sorulur.</small></p><div role="status" aria-live="polite">PDF veya PNG seçerek başlayabilirsin.</div><div data-files></div><div data-raster></div><div data-preview hidden></div><label data-confirm hidden><input type="checkbox"> Uyarıları gördüm. Çakışan gözleri bekleterek mevcut çizimin yerine uygula.</label><footer><button data-close>Vazgeç</button><button data-apply disabled>Raf tiplerini oluştur ve yerleştir</button></footer>';document.body.append(dialog);
      dialog.addEventListener('close',clear);
      dialog.addEventListener('input',e=>{if(e.target.matches('[data-block-name]')){entries[Number(e.target.dataset.blockName)].importName=e.target.value;validateNames();}});
      dialog.addEventListener('change',e=>{if(e.target.matches('[data-file]'))analyze(e);else if(e.target.closest('[data-raster]')){entries=null;plan=null;dialog.querySelector('[data-apply]').disabled=true;dialog.querySelector('[data-confirm]').hidden=true;dialog.querySelector('[data-preview]').hidden=true;}});
      dialog.addEventListener('click',event=>{
        if(event.target.closest('[data-close]'))dialog.close();
        const editor=event.target.closest('[data-edit-type],[data-view-type]');
        if(editor){const index=Number(editor.dataset.editType??editor.dataset.viewType),editable=editor.hasAttribute('data-edit-type');window.rafexImportTypeEditorV198.open(entries[index],plan.importTypes[index],editable,(entry,spec)=>{
          spec._originalSignature=plan.importTypes[index]._originalSignature||specKey(plan.importTypes[index]);
          edits.set(spec._originalSignature,{spec:{...spec},name:entry.importName});plan.importTypes[index]=spec;const refreshed=window.rafexPrepareImportedTypesV188(plan.importTypes);entries=refreshed.map((item,i)=>({...item,id:entries[i].id,importName:entries[i].importName}));
          plan.blocks.filter(b=>b.key===spec.key).forEach(b=>b.rowCount=spec.rowType==='double'?2:1);
          dialog.querySelector('[data-confirm] input').checked=false;preview();validateNames();
          status(entry.importName+' tipi güncellendi. Bu tipe bağlı tüm bloklar düzenlenen ölçülerle yerleştirilecek. Kaynak konumlar korunur; boyut değişiklikleri yerleştirme sırasında çakışma kontrolünden geçer.');
        },next=>window.rafexPrepareImportedTypesV188(plan.importTypes.map((t,i)=>i===index?next:t))[index]);return;}
        const remove=event.target.closest('[data-remove-file]');if(remove){removeFile(Number(remove.dataset.removeFile));return;}
        const read=event.target.closest('[data-read-file]');if(read){window.rafexDocumentAgentV201?.open(batch[Number(read.dataset.readFile)].file,dialog);return;}
        const retry=event.target.closest('[data-retry-file]');if(retry){batch[Number(retry.dataset.retryFile)].error=null;renderFiles();processNext();return;}
        if(event.target.closest('[data-raster-prepare]')){prepareRaster();return;}
        if(!event.target.closest('[data-apply]'))return;
        try{if(!entries||!plan)throw Error('Analiz sonucu geçersiz; Dosyaları yeniden seç.');if(!dialog.querySelector('[data-confirm] input').checked)throw Error('Önce önizlemenin altındaki uyarı onayını işaretle.');if(owner()!==identity)throw Error('Proje değişti; Dosyaları yeniden seç.');window.rafexApplyImportedLayoutV188(plan,entries,fileName);dialog.close();}catch(e){status('Uygulanmadı: '+e.message);}
      });
    }
    clear();renderFiles();identity=owner();dialog.querySelector('[data-file]').value='';dialog.querySelector('[data-preview]').hidden=true;dialog.querySelector('[data-confirm]').hidden=true;dialog.querySelector('[data-confirm] input').checked=false;dialog.querySelector('[data-apply]').disabled=true;status(identity?'PDF veya PNG seçerek başlayabilirsin.':'Önce Ortak Çizim içinde bir proje oluştur.');dialog.querySelector('[data-file]').disabled=!identity;dialog.showModal();
  }
  function invalidate(){entries=null;plan=null;dialog.querySelector('[data-apply]').disabled=true;dialog.querySelector('[data-preview]').hidden=true;dialog.querySelector('[data-confirm]').hidden=true;dialog.querySelector('[data-confirm] input').checked=false;}
  function renderFiles(){
    const box=dialog.querySelector('[data-files]');box.replaceChildren();
    batch.forEach((item,index)=>{const row=document.createElement('p'),label=document.createElement('span');label.textContent=item.name+' — '+(item.result?'Hazır':item.error?'Hata: '+item.error:active===item?'Ölçü kontrolü / okunuyor':'Sırada');row.append(label);const remove=document.createElement('button');remove.type='button';remove.dataset.removeFile=index;remove.textContent='Kaldır';row.append(remove);if(item.error){const retry=document.createElement('button');retry.type='button';retry.dataset.retryFile=index;retry.textContent='Tekrar dene';row.append(retry);}box.append(row);});
  }
  function removeFile(index){
    const item=batch[index];if(!item)return;
    if(active===item){serial++;task?.destroy();task=null;ocrWorker?.terminate().catch(()=>{});ocrWorker=null;busy=false;active=null;raster=null;dialog.querySelector('[data-raster]').replaceChildren();}
    batch.splice(index,1);invalidate();renderFiles();processNext();
  }
  function analyze(event){
    const files=[...event.target.files];event.target.value='';
    if(files.some(f=>!(/\.(pdf|png|jpe?g)$/i.test(f.name)||['application/pdf','image/png','image/jpeg'].includes(f.type)))){status('PDF, PNG veya JPEG dosyası seç.');return;}
    const additions=files.filter(f=>!batch.some(i=>i.name===f.name&&i.file.size===f.size&&i.file.lastModified===f.lastModified));
    if(batch.length+additions.length>10){status('En fazla 10 dosya ekleyebilirsin.');return;}
    if(additions.some(f=>f.size>20*1024*1024)){status('Her dosya en fazla 20 MB olabilir.');return;}
    if([...batch.map(i=>i.file),...additions].reduce((n,f)=>n+f.size,0)>100*1024*1024){status('Toplam dosya boyutu en fazla 100 MB olabilir.');return;}
    if(!additions.length)return;invalidate();batch.push(...additions.map(file=>({file,name:file.name,result:null,error:null})));renderFiles();processNext();
  }
  async function processNext(){
    if(busy||raster)return;
    const item=batch.find(i=>!i.result&&!i.error);
    if(!item){if(batch.length&&batch.every(i=>i.result)){try{fileName=batch.map(i=>i.name).join(', ');prepare(combinePlans(batch));}catch(e){status(e.message);}}else status(batch.length?'Okunamayan dosyaları tekrar dene veya kaldır.':'PDF veya PNG seçerek başlayabilirsin.');return;}
    busy=true;active=item;const token=serial;let loadingTask;renderFiles();status(item.name+' okunuyor…');
    try{
      const [pdfjs,reader,detector,batchReader]=await Promise.all([import('/pdfjs/pdf.mjs'),import('/pdfjs/pdf-vector-reader.mjs'),import('/pdfjs/pdf-rack-detection.mjs'),import('/pdfjs/pdf-batch-plan.mjs')]);
      if(token!==serial)return;combinePlans=batchReader.combinePlans;pdfjs.GlobalWorkerOptions.workerSrc='/pdfjs/pdf.worker.mjs';
      groupPlan=detector.groupRackPlan;
      if(['image/png','image/jpeg'].includes(item.file.type)||/\.(png|jpe?g)$/i.test(item.name)){
        rasterModule=await import('/pdfjs/pdf-raster-reader.mjs');
        const scanned=await rasterModule.scanRasterImage(item.file,t=>{if(token===serial)status(item.name+': '+t);},()=>token===serial&&dialog.open,w=>{if(token===serial)ocrWorker=w;else w.terminate().catch(()=>{});});
        if(token!==serial||!dialog.open)return;raster=scanned;ocrWorker=null;showRaster();return;
      }
      const bytes=new Uint8Array(await item.file.arrayBuffer());if(token!==serial)return;
      task=loadingTask=pdfjs.getDocument({data:bytes,isEvalSupported:false});const documentPdf=await loadingTask.promise;
      if(documentPdf.numPages!==1)throw Error('Her PDF plan ve kesitleri içeren tek sayfa olmalı.');
      const page=await documentPdf.getPage(1),vectors=await reader.readVectors(page,pdfjs.OPS);groupPlan=detector.groupRackPlan;
      if(vectors.lines.length<10){
        rasterModule=await import('/pdfjs/pdf-raster-reader.mjs');
        const scanned=await rasterModule.scanRasterPage(page,t=>{if(token===serial)status(item.name+': '+t);},()=>token===serial&&dialog.open,w=>{if(token===serial)ocrWorker=w;else w.terminate().catch(()=>{});});
        if(token!==serial||!dialog.open)return;raster=scanned;ocrWorker=null;showRaster();
      }else{const result=detector.groupRackPlan(detector.detectRacks(vectors));if(token!==serial||!dialog.open)return;if(owner()!==identity)throw Error('Proje değişti. Pencereyi yeniden aç.');item.result=result;active=null;}
    }catch(e){if(token===serial){item.error=e.message||'Dosya okunamadı.';active=null;status(item.name+': '+item.error);}}
    finally{await loadingTask?.destroy();if(token===serial){task=null;busy=false;renderFiles();if(!raster)processNext();}}
  }
  function prepare(result){
    if(owner()!==identity)throw Error('Proje değişti. Dosyaları yeniden seç.');
      if(m2ActiveModule!=='b2b'){const radio=document.querySelector('input[name="rafexUnifiedSystem"][value="b2b"]');if(!radio)throw Error('Ortak Çizim B2B motoru bulunamadı.');radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));}
      result={...result,blocks:result.blocks.map(b=>({...b})),importTypes:result.importTypes.map(t=>{const signature=specKey(t),saved=edits.get(signature);return saved?{...saved.spec,key:t.key,_originalSignature:signature}:{...t,_originalSignature:signature};})};
      result.blocks.forEach(b=>{const t=result.importTypes.find(t=>t.key===b.key);if(t)b.rowCount=t.rowType==='double'?2:1;});
      entries=window.rafexPrepareImportedTypesV188(result.importTypes);plan=result;if(!Array.isArray(entries)||entries.length!==result.importTypes.length)throw Error('Raf tipi hesabı tamamlanamadı.');
      window.rafexImportedNamesV194.defaults(window.rafexProjectTypesV133||[],entries,result.blocks);
      entries.forEach((entry,i)=>{const saved=edits.get(result.importTypes[i]._originalSignature);if(saved)entry.importName=saved.name;});
      preview();dialog.querySelector('[data-confirm]').hidden=false;validateNames();
      const excluded=new Set(plan.conflicts.flat()).size;status(plan.importTypes.length+' raf tipi · '+plan.rows+' sıra · '+plan.placements.length+' göz algılandı.\n'+(plan.placements.length-excluded)+' göz, '+plan.blocks.length+' blok olarak hazır; '+plan.blocks.filter(p=>p.rowCount===2).length+' çift sıra blok.\n'+plan.warnings.join('\n')+'\nAynı tip sırt sırta gözler çift sıradır. Kesintisiz devam eden uyumlu gözler ortak ayakla birleştirilir; geçiş boşlukları korunur.');
  }
  const rasterFields=[['sectionWidth','Standart travers açıklığı (mm)'],['frameDepth','Raf çerçeve derinliği (mm)'],['footHeight','Ayak yüksekliği (mm)'],['levels','Zemin dahil kat adedi'],['palletCount','Standart gözde bir sıranın palet adedi'],['palletWidth','Palet eni (mm)'],['palletDepth','Palet derinliği (mm)'],['palletHeight','Yüklü palet yüksekliği (mm)'],['palletWeight','Bir paletin yükü (kg)'],['firstBeamTop','İlk travers üst kotu (mm)'],['beamHeight','Travers yüksekliği (mm)'],['clearOpening','Üst katlar arası net açıklık (mm)'],['doubleRowGap','Çift sıralarda çerçeveler arası mesafe (mm)'],['tunnelHeight','Tünel net geçiş yüksekliği (mm)']];
  function showRaster(){
    const box=dialog.querySelector('[data-raster]');box.replaceChildren();
    const text=document.createElement('p');text.textContent=active.name+' — Görsel okundu: '+raster.geometry.rows.length+' sıra ve '+raster.geometry.count+' olası raf gözü. Yeşil kutular algılanan gözlerdir; aktarılmayacak gözlere tıklayarak çıkar. Mor: çaprazlı, mavi: tünelli göz. Küçük yazılardan okunamayan ölçüleri aşağıda tamamla. Rafları uygulama otomatik yerleştirir.';box.append(text);
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 '+raster.geometry.width+' '+raster.geometry.height);svg.style.height='auto';svg.style.maxHeight='560px';
    const img=document.createElementNS(ns,'image');img.setAttribute('href',raster.image);img.setAttribute('width',raster.geometry.width);img.setAttribute('height',raster.geometry.height);svg.append(img);
    for(const [row,r] of raster.geometry.rows.entries())for(const [bay,b] of r.bays.entries()){
      const rect=document.createElementNS(ns,'rect');for(const [k,v] of Object.entries({x:b.left,y:r.top,width:b.width,height:r.depth,fill:b.tunnel?'#0088ff66':b.braced?'#aa33cc66':'#00884455',stroke:'#008844','stroke-width':1,tabindex:0,role:'button','aria-label':'R'+(row+1)+'-'+(bay+1)+' gözünü çıkar veya dahil et'}))rect.setAttribute(k,v);
      const toggle=()=>{b.omit=!b.omit;rect.setAttribute('fill',b.omit?'#ff333377':b.tunnel?'#0088ff66':b.braced?'#aa33cc66':'#00884455');entries=null;plan=null;dialog.querySelector('[data-apply]').disabled=true;dialog.querySelector('[data-confirm]').hidden=true;};rect.addEventListener('click',toggle);rect.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});svg.append(rect);
    }box.append(svg);
    const details=document.createElement('details'),summary=document.createElement('summary'),raw=document.createElement('pre');summary.textContent='OCR ile okunan yazılar';raw.textContent=raster.text||'Okunabilir yazı bulunamadı.';raw.style.whiteSpace='pre-wrap';details.append(summary,raw);box.append(details);
    const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px';
    for(const [key,title] of rasterFields){if(key==='tunnelHeight'&&!raster.geometry.rows.some(r=>r.bays.some(b=>b.tunnel)))continue;const label=document.createElement('label'),input=document.createElement('input');label.textContent=title;label.style.margin='4px 0';input.type='number';input.min='1';input.required=true;input.dataset.rasterField=key;input.style.cssText='display:block;width:95%;padding:8px';input.placeholder='Görselden okunamadı';if(raster.suggestions[key])input.value=raster.suggestions[key];label.append(input);grid.append(label);}box.append(grid);
    const check=document.createElement('label'),accept=document.createElement('input');accept.type='checkbox';accept.dataset.rasterReviewed='';check.append(accept,document.createTextNode(' Ölçüleri ve yeşil gözleri kontrol ettim. İkili/üçlü gözleri, tünel işaretlerini ve geçiş yüksekliğini doğruladım. Mor işaretler sistemin tek göz çaprazı olarak uygulanacak.'));box.append(check);
    const button=document.createElement('button');button.type='button';button.dataset.rasterPrepare='';button.textContent='Ölçüleri doğrula ve yerleşimi hazırla';box.append(button);status('Resim algılandı. OCR ile okunamayan ölçüleri tamamla ve gözleri kontrol et.');
  }
  function prepareRaster(){
    try{if(!raster||owner()!==identity)throw Error('Dosyaları yeniden seç.');const fields=[...dialog.querySelectorAll('[data-raster-field]')],missing=fields.find(input=>!input.checkValidity());if(missing){missing.reportValidity();throw Error('Okunamayan zorunlu ölçüleri tamamla.');}if(!dialog.querySelector('[data-raster-reviewed]').checked)throw Error('Ölçü ve göz kontrolü onayını işaretle.');const values=Object.fromEntries(fields.map(input=>[input.dataset.rasterField,Number(input.value)]));active.result=groupPlan(rasterModule.rasterPlan(raster.geometry,values));active=null;raster=null;dialog.querySelector('[data-raster]').replaceChildren();renderFiles();processNext();}catch(e){status(e.message);}
  }
  function validateNames(){
    const error=dialog.querySelector('[data-name-error]');let message='';
    try{window.rafexImportedNamesV194.apply(window.rafexProjectTypesV133||[],entries);}catch(e){message=e.message;}
    error.textContent=message;error.hidden=!message;dialog.querySelector('[data-apply]').disabled=!!message;
    return !message;
  }
  function preview(){
    const box=dialog.querySelector('[data-preview]');box.replaceChildren();box.hidden=false;
    const table=document.createElement('table'),head=table.createTHead().insertRow();['Blok adı','Açıklık × derinlik × yükseklik','Sıra','Kat','Palet yüksekliği','Kat açıklığı','Palet/kat/sıra','Blok','İncele / düzenle'].forEach(s=>{const c=document.createElement('th');c.textContent=s;head.append(c);});
    for(const [index,t] of plan.importTypes.entries()){const row=table.insertRow(),input=document.createElement('input');input.type='text';input.dataset.blockName=index;input.value=entries[index].importName;input.setAttribute('aria-label',(index+1)+'. raf tipinin blok adı');input.style.width='64px';row.insertCell().append(input);[t.sectionWidth+' × '+t.frameDepth+' × '+t.footHeight+' mm',t.rowType==='double'?'Çift · ara '+t.rowGap+' mm':'Tek',t.levels,(t.palletHeights||[t.palletHeight]).join(' / ')+' mm','İlk travers üstü '+t.firstBeamTop+' mm; '+(t.levelPitches?'kat adımı '+t.levelPitches.join(' / '):'net '+t.clearOpenings.join(' / '))+' mm',t.palletCount,plan.blocks.filter(p=>p.key===t.key).length].forEach(s=>row.insertCell().textContent=s);const actions=row.insertCell();for(const [key,label] of [['viewType','3D Görüntü'],['editType','Özelleştir']]){const button=document.createElement('button');button.type='button';button.dataset[key]=index;button.textContent=label;button.setAttribute('aria-label',entries[index].importName+' · '+label);actions.append(button);}}
    const shown=plan.batch?plan.placements.map(p=>({...p,x:p.previewX,y:p.previewY,width:p.previewWidth,depth:p.previewDepth})):plan.orientation==='horizontal'?plan.placements.map(p=>({...p,x:p.y,y:p.x,width:p.depth,depth:p.width})):plan.placements;
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),maxX=Math.max(...shown.map(p=>p.x+p.width)),maxY=Math.max(...shown.map(p=>p.y+p.depth)),excluded=new Set(plan.conflicts.flat());svg.setAttribute('viewBox',[-1000,-1000,maxX+2000,maxY+2000].join(' '));svg.setAttribute('role','img');svg.setAttribute('aria-label','Dosyalardan algılanan raf yerleşimi; çakışan gözler kırmızı');
    for(const p of shown){const rect=document.createElementNS(ns,'rect');for(const [k,v] of Object.entries({x:p.x-p.width/2,y:p.y-p.depth/2,width:p.width,height:p.depth,fill:excluded.has(p.id)?'#ca3939':['#3581b8','#77a8ce','#277b60','#79b797','#b47730','#d2ab77'][plan.types.findIndex(t=>t.key===p.key)],stroke:'white','stroke-width':30}))rect.setAttribute(k,v);svg.append(rect);}
    const hint=document.createElement('p');hint.textContent='Harfler blok adedine göre çoktan aza atanır: A, B, C… Eşit adette dosyadaki sıra korunur; projede kullanılan harfler atlanır. Blok adlarını değiştirebilirsin. Aynı raf tipindeki tüm bloklar bu adı kullanır. Her tipin adı farklı olmalıdır.';
    const error=document.createElement('p');error.dataset.nameError='';error.setAttribute('role','alert');error.style.color='#a71919';error.hidden=true;
    box.append(hint,table,error,svg);
  }
  let pending=false;function install(){
    pending=false;const anchor=document.getElementById('rafexProjectImportV155');
    if(anchor&&!document.getElementById('rafexAutoLayoutButton')){const button=document.createElement('button');button.id='rafexAutoLayoutButton';button.type='button';button.textContent='Otomatik yerleşim';button.onclick=open;anchor.after(button);}
    const floor=document.getElementById('m2FloorStatus'),info=typeof m2LayoutState==='object'?m2LayoutState.pdfImport:null;
    let note=document.getElementById('rafexImportNoteV188');
    if(!info||!anchor){note?.remove();return;}
    if(floor&&!note){note=document.createElement('p');note.id='rafexImportNoteV188';note.style.cssText='padding:12px;background:#fff4dc;color:#674718;white-space:pre-wrap;font-size:12px';floor.after(note);}
    const message='Dosya aktarımı: '+info.fileName+'\nDepo sınırı, kapılar, kolonlar ve bina yüksekliği bu aktarıma dahil değildir.'+(info.excluded?.length?'\nBekletilen çakışan gözler: '+info.excluded.map(p=>p.id).join(', '):'')+(info.doubleBlocks?'\n'+info.doubleBlocks+' çift sıra blok.':'')+(info.joined?' '+info.joined+' ortak ayaklı birleşim.':'')+(info.raster?'\nGörsel: konumlar yaklaşık; özel/tünelli raflar ve okunamayan ölçüler kullanıcı kontrolü gerektirir.':'')+(info.adjusted?'\n'+info.adjusted+' blok konumu ortak ayak ölçüsüne göre düzenlendi.':'');
    if(note&&note.textContent!==message)note.textContent=message;
  }
  const observer=new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(install);}});observer.observe(document.getElementById('page')||document.body,{childList:true,subtree:true});install();
})();
