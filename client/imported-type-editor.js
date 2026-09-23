(function(){
 const copy=v=>JSON.parse(JSON.stringify(v));
 const fields=[['sectionWidth','Travers açıklığı (mm)',500,10000],['frameDepth','Çerçeve derinliği (mm)',300,3000],['footHeight','Ayak yüksekliği (mm)',500,30000],['palletWidth','Palet eni (mm)',300,3000],['palletDepth','Palet derinliği (mm)',300,3000],['palletCount','Bir sıradaki palet adedi',1,4],['palletWeight','Palet başına yük (kg)',1,10000],['levels','Zemin dahil kat adedi',2,15],['rowGap','Çift sıra çerçeve aralığı (mm)',0,3000],['firstBeamTop','İlk travers üst kotu (mm)',100,30000],['beamHeight','Travers yüksekliği (mm; 0 = otomatik)',0,500]];
 let active;
 async function open(entry,spec,editable,onSave,prepareEntry=spec=>window.rafexPrepareImportedTypesV188([spec])[0]){
  active?.close();
  const original=copy(spec),dialog=document.createElement('dialog');dialog.id='rafexImportTypeEditorV198';
  dialog.style.cssText='width:min(1180px,94vw);max-height:90vh;overflow:auto;border:1px solid #b9cec3;border-radius:12px;padding:20px;color:#173c2d';
  dialog.innerHTML='<style>#rafexImportTypeEditorV198::backdrop{background:#10211999}#rafexImportTypeEditorV198 .edit-grid{display:grid;grid-template-columns:minmax(260px,1fr) minmax(300px,1.3fr);gap:20px}#rafexImportTypeEditorV198 .fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}#rafexImportTypeEditorV198 label{display:grid;gap:4px;font-size:12px}#rafexImportTypeEditorV198 input,#rafexImportTypeEditorV198 select{width:100%;box-sizing:border-box;padding:7px}#rafexImportTypeEditorV198 canvas{width:100%;height:500px;display:block}#rafexImportTypeEditorV198 button{padding:8px 12px;margin:4px}#rafexImportTypeEditorV198 table{width:100%;font-size:12px}#rafexImportTypeEditorV198 th{font-weight:600}#rafexImportTypeEditorV198 [role=alert]{color:#a71919}@media(max-width:760px){#rafexImportTypeEditorV198 .edit-grid{grid-template-columns:1fr}}</style><h2></h2><p data-scope></p><div class="edit-grid"><div><div class="fields"></div><h3>Kat düzeni</h3><p>Palet yükseklikleri zemin katından başlayarak sıralanır. Kat aralığı travers üst kotları arasındaki mesafedir.</p><table><thead><tr><th>Kat</th><th>Palet yüksekliği (mm)</th><th>Sonraki travers üst kotuna mesafe (mm)</th></tr></thead><tbody></tbody></table></div><div><nav><button data-view="perspective">Perspektif</button><button data-view="front">Önden</button><button data-view="side">Yandan</button><button data-view="top">Üstten</button></nav><canvas aria-label="Okunan raf tipinin interaktif 3D görünümü"></canvas><p data-view-status>3D yükleniyor…</p><p data-profile></p></div></div><p role="alert" aria-live="polite"></p><footer><button data-close></button><button data-save>Değişiklikleri Kaydet</button></footer>';
  dialog.querySelector('h2').textContent=entry.importName+' · '+(editable?'Özelleştir':'3D Görüntü');
  dialog.querySelector('[data-scope]').textContent=editable?'Değişiklikler bu tipe bağlı tüm bloklara uygulanır. Vazgeçersen mevcut hazırlık korunur.':'Yerleştirmeden önce raf tipini döndürerek inceleyebilirsin.';
  let viewer,timer,revision=0,finished=false,previewDrawing=entry.drawing;
  const values=dialog.querySelector('.fields');
  for(const [key,label,min,max] of fields){const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.type='number';input.min=min;input.max=max;input.step=['levels','palletCount'].includes(key)?'1':'any';input.required=true;input.dataset.field=key;input.value=spec[key]??0;input.disabled=!editable;l.append(input);values.append(l);}
  const l=document.createElement('label');l.textContent='Sıra tipi';const select=document.createElement('select');select.dataset.field='rowType';select.innerHTML='<option value="single">Tek sıra</option><option value="double">Çift sıra</option>';select.value=spec.rowType||'single';select.disabled=!editable;l.append(select);values.append(l);
  const initialHeights=spec.palletHeights||Array(spec.levels).fill(spec.palletHeight),beam=entry.drawing.traverseHeight;
  const initialPitches=spec.levelPitches||(spec.clearOpenings||[]).map(g=>g+beam);
  function renderRows(){
   const body=dialog.querySelector('tbody'),old=[...body.rows].map(row=>({height:row.querySelector('[data-height]').value,pitch:row.querySelector('[data-pitch]')?.value}));
   body.replaceChildren();const count=Number(dialog.querySelector('[data-field=levels]').value);if(!Number.isInteger(count)||count<2||count>15)return;
   for(let i=0;i<count;i++){const row=body.insertRow();row.insertCell().textContent=i===0?'Zemin':i+'. kat';const height=document.createElement('input');height.type='number';height.min=300;height.max=3000;height.required=true;height.disabled=!editable;height.dataset.height=i;height.setAttribute('aria-label',(i===0?'Zemin':i+'. kat')+' palet yüksekliği');height.value=old[i]?.height??initialHeights[i]??initialHeights.at(-1);row.insertCell().append(height);const cell=row.insertCell();if(i>0&&i<count-1){const pitch=document.createElement('input');pitch.type='number';pitch.min=100;pitch.max=30000;pitch.required=true;pitch.disabled=!editable;pitch.dataset.pitch=i-1;pitch.setAttribute('aria-label',i+'. kat travers üst kot aralığı');pitch.value=old[i]?.pitch??initialPitches[i-1]??initialPitches.at(-1)??1500;cell.append(pitch);}else cell.textContent=i===0?'İlk kot yukarıda':'—';}
  }
  renderRows();
  function read(){
   const input=[...dialog.querySelectorAll('input')].find(i=>!i.checkValidity());if(input)throw Error('Geçerli ölçü gir: '+(input.getAttribute('aria-label')||input.parentElement.textContent));
   const next={...original};dialog.querySelectorAll('[data-field]').forEach(i=>next[i.dataset.field]=i.tagName==='SELECT'?i.value:Number(i.value));
   if(next.sectionWidth<next.palletCount*next.palletWidth+(next.palletCount+1)*75)throw Error('Paletler ve gerekli yan boşluklar travers açıklığına sığmıyor.');
   if(next.frameDepth>next.palletDepth)throw Error('Çerçeve derinliği palet derinliğini aşamaz.');
   next.palletHeights=[...dialog.querySelectorAll('[data-height]')].map(i=>Number(i.value));next.palletHeight=next.palletHeights[0];
   next.levelPitches=[...dialog.querySelectorAll('[data-pitch]')].map(i=>Number(i.value));delete next.clearOpenings;next.userCustomized=true;
   return next;
  }
  function calculate(){
   clearTimeout(timer);const error=dialog.querySelector('[role=alert]');
   try{const next=read(),result=prepareEntry(next);result.id=entry.id;result.importName=entry.importName;
    previewDrawing=result.drawing;const options=window.rafexB2BDetailOptionsV117(result.drawing);viewer?.update(options);error.textContent='';dialog.querySelector('[data-save]').disabled=false;
    dialog.querySelector('[data-profile]').textContent='Açıklık: '+next.sectionWidth+' mm · Ayak: '+result.drawing.footProfile+' · Travers: '+result.drawing.b2b.traverseType;
    return {entry:result,spec:next};
   }catch(e){error.textContent=e.message;dialog.querySelector('[data-save]').disabled=true;return null;}
  }
  function close(){if(finished)return;finished=true;revision++;clearTimeout(timer);viewer?.destroy();dialog.close();dialog.remove();if(active?.close===close)active=null;}
  active={close};dialog.querySelector('[data-close]').textContent=editable?'Vazgeç':'Kapat';dialog.querySelector('[data-save]').hidden=!editable;
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});dialog.querySelector('[data-close]').onclick=close;
  dialog.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>viewer?.setView(b.dataset.view));
  dialog.addEventListener('input',e=>{if(e.target.matches('[data-field=levels]'))renderRows();clearTimeout(timer);dialog.querySelector('[data-save]').disabled=true;timer=setTimeout(calculate,350);});
  dialog.querySelector('[data-save]').onclick=()=>{const result=calculate();if(!result)return;try{onSave(result.entry,result.spec);close();}catch(e){dialog.querySelector('[role=alert]').textContent=e.message;}};
  document.body.append(dialog);dialog.showModal();
  const token=++revision;
  try{await window.rafexLoadViewerOnDemandV3?.('b2b');if(finished||token!==revision)return;
   const create=window.RafexB2BViewer?.createDetached;if(!create)throw Error('3D motoru yüklenemedi.');
   viewer=create(dialog.querySelector('canvas'),window.rafexB2BDetailOptionsV117(previewDrawing));viewer.setView('perspective');dialog.querySelector('[data-view-status]').textContent='Sürükle: döndür · Tekerlek: yakınlaştır';
  }catch(e){if(!finished)dialog.querySelector('[data-view-status]').textContent=e.message;}
 }
 window.rafexImportTypeEditorV198={open,close:()=>active?.close()};
})();
