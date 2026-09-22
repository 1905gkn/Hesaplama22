(function(){
  let dialog,task,serial=0,plan,entries,identity,fileName;
  const owner=()=>window.rafexProjectIdentityV133?.uuid;
  function status(text){dialog.querySelector('[role=status]').textContent=text;}
  function clear(){serial++;task?.destroy();task=null;plan=null;entries=null;}
  function open(){
    if(!dialog){
      const style=document.createElement('style');style.textContent='#rafexAutoLayoutButton{background:#246447;color:white;border:0;border-radius:7px;padding:10px 14px;font-weight:700;cursor:pointer}#rafexPdfAutoDialog{width:min(840px,94vw);max-height:88vh;overflow:auto;border:1px solid #b9cec3;border-radius:12px;padding:24px;color:#173c2d}#rafexPdfAutoDialog::backdrop{background:#10211999}#rafexPdfAutoDialog header,#rafexPdfAutoDialog footer{display:flex;gap:12px;justify-content:space-between;align-items:center}#rafexPdfAutoDialog h2{margin:0}#rafexPdfAutoDialog p{line-height:1.6}#rafexPdfAutoDialog button{padding:10px 16px;cursor:pointer}#rafexPdfAutoDialog label{display:block;margin:18px 0}#rafexPdfAutoDialog [role=status]{white-space:pre-wrap;padding:12px;background:#f0f6f2}#rafexPdfAutoDialog table{width:100%;border-collapse:collapse;font-size:13px}#rafexPdfAutoDialog td,#rafexPdfAutoDialog th{padding:8px;border-bottom:1px solid #ddd;text-align:left}#rafexPdfAutoDialog svg{width:100%;height:280px;background:#f4f7f5}#rafexPdfAutoDialog [hidden]{display:none!important}';document.head.append(style);
      dialog=document.createElement('dialog');dialog.id='rafexPdfAutoDialog';dialog.innerHTML='<header><h2>PDF’den otomatik yerleşim</h2><button data-close aria-label="Kapat">×</button></header><p>Ölçülü B2B plan PDF’sini seç. Raf tipleri ve konumlar otomatik okunur; ayak ve traversler uygulamanın yük tablolarından hesaplanır.</p><label>PDF dosyası (en fazla 20 MB)<input data-file type="file" accept="application/pdf,.pdf"></label><p><small>Dosya bu tarayıcıda işlenir. Taranmış resim PDF’leri ve farklı çizim düzenleri henüz desteklenmiyor.</small></p><div role="status" aria-live="polite">PDF seçerek başlayabilirsin.</div><div data-preview hidden></div><label data-confirm hidden><input type="checkbox"> Uyarıları gördüm. Çakışan gözleri bekleterek mevcut çizimin yerine uygula.</label><footer><button data-close>Vazgeç</button><button data-apply disabled>Raf tiplerini oluştur ve yerleştir</button></footer>';document.body.append(dialog);
      dialog.addEventListener('close',clear);
      dialog.addEventListener('change',e=>{if(e.target.matches('[data-file]'))analyze(e);});
      dialog.addEventListener('click',event=>{
        if(event.target.closest('[data-close]'))dialog.close();
        if(!event.target.closest('[data-apply]'))return;
        try{if(!entries||!plan)throw Error('Analiz sonucu geçersiz; PDF’yi yeniden seç.');if(!dialog.querySelector('[data-confirm] input').checked)throw Error('Önce önizlemenin altındaki uyarı onayını işaretle.');if(owner()!==identity)throw Error('Proje değişti; PDF’yi yeniden seç.');window.rafexApplyImportedLayoutV188(plan,entries,fileName);dialog.close();}catch(e){status('Uygulanmadı: '+e.message);}
      });
    }
    clear();identity=owner();dialog.querySelector('[data-file]').value='';dialog.querySelector('[data-preview]').hidden=true;dialog.querySelector('[data-confirm]').hidden=true;dialog.querySelector('[data-confirm] input').checked=false;dialog.querySelector('[data-apply]').disabled=true;status(identity?'PDF seçerek başlayabilirsin.':'Önce Ortak Çizim içinde bir proje oluştur.');dialog.querySelector('[data-file]').disabled=!identity;dialog.showModal();
  }
  async function analyze(event){
    clear();const token=serial,file=event.target.files[0];dialog.querySelector('[data-apply]').disabled=true;dialog.querySelector('[data-preview]').hidden=true;dialog.querySelector('[data-confirm]').hidden=true;dialog.querySelector('[data-confirm] input').checked=false;
    if(!file)return;if(file.size>20*1024*1024){status('PDF en fazla 20 MB olabilir.');return;}
    status('PDF okunuyor; plan çizgileri ve kesit ölçüleri eşleştiriliyor…');
    let documentPdf,loadingTask;
    try{
      const [pdfjs,reader,detector]=await Promise.all([import('/pdfjs/pdf.mjs'),import('/pdfjs/pdf-vector-reader.mjs'),import('/pdfjs/pdf-rack-detection.mjs')]);
      if(token!==serial)return;pdfjs.GlobalWorkerOptions.workerSrc='/pdfjs/pdf.worker.mjs';
      const bytes=new Uint8Array(await file.arrayBuffer());if(token!==serial)return;
      task=loadingTask=pdfjs.getDocument({data:bytes,isEvalSupported:false});documentPdf=await loadingTask.promise;
      if(documentPdf.numPages!==1)throw Error('Şimdilik plan ve kesitlerin birlikte bulunduğu tek sayfalık PDF seç.');
      const result=detector.detectRacks(await reader.readVectors(await documentPdf.getPage(1),pdfjs.OPS));
      if(token!==serial||!dialog.open)return;if(owner()!==identity)throw Error('Proje değişti. Pencereyi yeniden aç.');
      if(m2ActiveModule!=='b2b'){const radio=document.querySelector('input[name="rafexUnifiedSystem"][value="b2b"]');if(!radio)throw Error('Ortak Çizim B2B motoru bulunamadı.');radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));}
      entries=window.rafexPrepareImportedTypesV188(result.types);plan=result;fileName=file.name;if(!Array.isArray(entries)||entries.length!==result.types.length)throw Error('Raf tipi hesabı tamamlanamadı.');
      preview();dialog.querySelector('[data-confirm]').hidden=false;dialog.querySelector('[data-apply]').disabled=false;
      const excluded=new Set(plan.conflicts.flat()).size;status(plan.types.length+' raf tipi · '+plan.rows+' sıra · '+plan.placements.length+' göz algılandı.\n'+(plan.placements.length-excluded)+' göz yerleşime hazır.\n'+plan.warnings.join('\n')+'\nGöz aralıkları hesaplanan ayak dış ölçülerine göre gerektiğinde açılır.');
    }catch(e){if(token===serial)status(e.message||'PDF okunamadı.');}
    finally{await loadingTask?.destroy();if(token===serial)task=null;}
  }
  function preview(){
    const box=dialog.querySelector('[data-preview]');box.replaceChildren();box.hidden=false;
    const table=document.createElement('table'),head=table.createTHead().insertRow();['Açıklık × derinlik × yükseklik','Kat','Palet/kat','Göz'].forEach(s=>{const c=document.createElement('th');c.textContent=s;head.append(c);});
    for(const t of plan.types){const row=table.insertRow();[t.sectionWidth+' × '+t.frameDepth+' × '+t.footHeight+' mm',t.levels,t.palletCount,plan.placements.filter(p=>p.key===t.key).length].forEach(s=>row.insertCell().textContent=s);}
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),maxX=Math.max(...plan.placements.map(p=>p.x+p.width)),maxY=Math.max(...plan.placements.map(p=>p.y+p.depth)),excluded=new Set(plan.conflicts.flat());svg.setAttribute('viewBox',[-1000,-1000,maxX+2000,maxY+2000].join(' '));svg.setAttribute('role','img');svg.setAttribute('aria-label','PDF’den algılanan raf yerleşimi; çakışan gözler kırmızı');
    for(const p of plan.placements){const rect=document.createElementNS(ns,'rect');for(const [k,v] of Object.entries({x:p.x-p.width/2,y:p.y-p.depth/2,width:p.width,height:p.depth,fill:excluded.has(p.id)?'#ca3939':['#3581b8','#77a8ce','#277b60','#79b797','#b47730','#d2ab77'][plan.types.findIndex(t=>t.key===p.key)],stroke:'white','stroke-width':30}))rect.setAttribute(k,v);svg.append(rect);}
    box.append(table,svg);
  }
  let pending=false;function install(){
    pending=false;const anchor=document.getElementById('rafexProjectImportV155');
    if(anchor&&!document.getElementById('rafexAutoLayoutButton')){const button=document.createElement('button');button.id='rafexAutoLayoutButton';button.type='button';button.textContent='Otomatik yerleşim';button.onclick=open;anchor.after(button);}
    const floor=document.getElementById('m2FloorStatus'),info=typeof m2LayoutState==='object'?m2LayoutState.pdfImport:null;
    let note=document.getElementById('rafexImportNoteV188');
    if(!info||!anchor){note?.remove();return;}
    if(floor&&!note){note=document.createElement('p');note.id='rafexImportNoteV188';note.style.cssText='padding:12px;background:#fff4dc;color:#674718;white-space:pre-wrap;font-size:12px';floor.after(note);}
    const message='PDF aktarımı: '+info.fileName+'\nDepo sınırı, kapılar, kolonlar ve bina yüksekliği bu aktarıma dahil değildir.'+(info.excluded?.length?'\nBekletilen çakışan gözler: '+info.excluded.map(p=>p.id).join(', '):'')+(info.adjusted?'\n'+info.adjusted+' gözün sıra aralığı hesaplanan ayak dış ölçüsüne göre açıldı.':'');
    if(note&&note.textContent!==message)note.textContent=message;
  }
  const observer=new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(install);}});observer.observe(document.getElementById('page')||document.body,{childList:true,subtree:true});install();
})();
