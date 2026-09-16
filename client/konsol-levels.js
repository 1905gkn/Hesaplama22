(function(){
 if(window.rafexKonsolLevels)return;
 let manual=null,first=1000,dialog=null,productLengthMode='auto',writingLength=false,pendingProduct=null;
 const el=id=>document.getElementById(id),num=(id,f)=>{const n=Number(el(id)?.value);return Number.isFinite(n)?n:f;};
 function defaults(){return Array.from({length:Math.max(1,num('konsolLevels',4))},(_,i)=>({distance:i?num('konsolLevelGap',1000):num('konsolFirstLevel',first),load:num('femUnitLoad',1000),depth:num('konsolArmLength',1000)}));}
 function snapshot(){const rows=defaults();if(manual)rows.forEach((r,i)=>{if(manual[i])rows[i]={...manual[i]};});rows[0].distance=num('konsolFirstLevel',first);return {firstLevel:rows[0].distance,levelRows:rows,manualLevels:!!manual};}
 function refresh(){first=num('konsolFirstLevel',first);if(manual?.[0])manual[0].distance=first;document.dispatchEvent(new Event('rafex-konsol-levels-change'));const note=el('konsolLevelModeNote');if(note)note.textContent=manual?'Kat ölçüleri manuel düzenlendi.':'Diğer katlar genel mesafe, yük ve derinlik değerlerini kullanır.';}
 function load(spec){pendingProduct=el('konsolProductLengthAuto')?null:spec;productLengthMode=spec?.productLengthMode||(Number(spec?.productLength)>0?'manual':'auto');if(el('femProductLength')&&Number(spec?.productLength)>0)el('femProductLength').value=String(spec.productLength);if(el('konsolHeightMode'))el('konsolHeightMode').value=spec?.heightMode||'auto';if(el('konsolHeight')&&spec?.height)el('konsolHeight').value=String(spec.height);manual=spec?.manualLevels&&Array.isArray(spec.levelRows)?spec.levelRows.map(r=>({...r})):null;first=Number(spec?.firstLevel)||1000;if(el('konsolFirstLevel'))el('konsolFirstLevel').value=String(first);refresh();}
 function syncProductLength(){
  const input=el('femProductLength');if(!input||writingLength)return;
  const count=num('konsolUprightCount',5),spacing=num('konsolSpacing',1500);
  if(!(count>=2&&spacing>0))return;
  const automatic=Math.round(count*spacing);
  if(productLengthMode==='auto'&&Number(input.value)!==automatic){writingLength=true;input.value=String(automatic);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));writingLength=false;}
  const note=el('konsolProductLengthNote'),overhang=(Number(input.value)-(count-1)*spacing)/2;
  if(note)note.textContent=(productLengthMode==='auto'?'Otomatik · '+count+' ayak × '+spacing.toLocaleString('tr-TR')+' mm = '+automatic.toLocaleString('tr-TR')+' mm':'Manuel uzunluk')+(overhang>=0?' · Sağ/sol taşma: '+overhang.toLocaleString('tr-TR')+' mm':'');
 }
 function enhanceProductLength(){
  const input=el('femProductLength');if(!input||el('konsolProductLengthAuto'))return;
  const label=input.closest('label');if(!label)return;
  productLengthMode=pendingProduct?(pendingProduct.productLengthMode||(Number(pendingProduct.productLength)>0?'manual':'auto')):'auto';if(pendingProduct?.productLength)input.value=String(pendingProduct.productLength);pendingProduct=null;
  const button=document.createElement('button');button.type='button';button.id='konsolProductLengthAuto';button.textContent='Otomatik hesapla';button.addEventListener('click',()=>{productLengthMode='auto';syncProductLength();});
  const note=document.createElement('small');note.id='konsolProductLengthNote';label.append(button,note);
  input.addEventListener('input',()=>{if(writingLength)return;if(Number(input.value)!==Math.round(num('konsolUprightCount',5)*num('konsolSpacing',1500)))productLengthMode='manual';syncProductLength();});
  for(const id of ['konsolUprightCount','konsolSpacing','konsolSpacingSelect']){const node=el(id);node?.addEventListener('input',syncProductLength);node?.addEventListener('change',syncProductLength);}
  syncProductLength();
 }
 function open(){
  dialog?.remove();dialog=document.createElement('dialog');dialog.id='konsolLevelsDialog';dialog.setAttribute('aria-label','Konsol katlarını özelleştir');
  dialog.innerHTML='<h3>Katları özelleştir</h3><p>İlk mesafe zeminden ilk kolun üst yüzeyine kadardır. Diğer mesafeler, bir alt kolun üst yüzeyinden bu kolun üst yüzeyine ölçülür. Yük, ilgili katın toplam yüküdür; derinlik kol uzunluğudur.</p><div class="kl-scroll"><table><thead><tr><th>Kat</th><th>Mesafe (mm)</th><th>Kat yükü (kg)</th><th>Kol derinliği (mm)</th></tr></thead><tbody></tbody></table></div><p role="alert" class="kl-error"></p><footer><button type="button" data-action="auto">Otomatik düzene dön</button><button type="button" data-action="cancel">Vazgeç</button><button type="button" data-action="apply">Uygula</button></footer>';
  function populate(rows){dialog.querySelector('tbody').innerHTML=rows.map((r,i)=>'<tr><th>'+(i+1)+'. kat</th>'+['distance','load','depth'].map(k=>'<td><label><span>'+(k==='distance'?(i?'Bir alt kata mesafe':'Zemine mesafe'):k==='load'?'Toplam yük':'Kol derinliği')+'</span><input type="number" data-row="'+i+'" data-key="'+k+'" aria-label="'+(i+1)+'. kat '+(k==='distance'?'mesafesi':k==='load'?'yükü':'derinliği')+'" min="'+(k==='depth'?250:k==='load'?0:1)+'" value="'+r[k]+'"></label></td>').join('')+'</tr>').join('');}
  let draftAuto=false;populate(snapshot().levelRows);
  dialog.addEventListener('click',event=>{const action=event.target.closest('[data-action]')?.dataset.action;if(action==='cancel')dialog.close();if(action==='auto'){draftAuto=true;populate(defaults());dialog.querySelector('.kl-error').textContent='';}if(action==='apply'){
   const rows=Array.from(dialog.querySelectorAll('tbody tr'),tr=>Object.fromEntries(Array.from(tr.querySelectorAll('input'),input=>[input.dataset.key,input.value.trim()===''?NaN:Number(input.value)])));
   const error=window.rafexKonsolWorkbook.validateLevels(rows,Math.max(1,num('konsolLevels',4)));if(error){dialog.querySelector('.kl-error').textContent=error;return;}
   manual=draftAuto?null:rows;first=rows[0].distance;el('konsolFirstLevel').value=String(first);refresh();dialog.close();
  }});
  dialog.addEventListener('input',()=>{draftAuto=false;});document.body.appendChild(dialog);dialog.showModal();
 }
 function enhance(){const gap=el('konsolLevelGap')?.closest('label');if(!gap||el('konsolFirstLevel'))return;const row=document.createElement('div');row.className='konsol-first-row';row.innerHTML='<label>İlk katın zeminden yüksekliği (mm)<input id="konsolFirstLevel" type="number" min="1" max="10000" value="'+first+'"></label><button type="button" id="konsolCustomizeLevels">Özelleştir</button><small id="konsolLevelModeNote">Diğer katlar genel mesafe, yük ve derinlik değerlerini kullanır.</small>';gap.after(row);el('konsolFirstLevel').addEventListener('input',refresh);el('konsolCustomizeLevels').addEventListener('click',open);el('konsolHeight')?.addEventListener('input',refresh);el('konsolHeight')?.addEventListener('change',refresh);el('konsolHeightMode')?.addEventListener('change',refresh);refresh();}
 function enrich(spec){const details=snapshot(),rows=details.levelRows,gap=num('konsolLevelGap',1000);return {...spec,...details,productLengthMode,levelGap:gap,arm:Math.max(...rows.map(r=>r.depth)),height:num('konsolHeight',rows.reduce((sum,r)=>sum+r.distance,0)+gap),heightMode:el('konsolHeightMode')?.value||'auto',uprightProfile:el('konsolUprightProfile')?.value,armProfile:el('konsolArmProfile')?.value,baseDepth:num('konsolBaseDepth',1000),levelLoad:num('femUnitLoad',1000)};}
 window.rafexKonsolLevels={snapshot,load,open,enrich};
 let frame;new MutationObserver(()=>{if(!el('konsolLevelGap')||(el('konsolFirstLevel')&&el('konsolProductLengthAuto'))||frame)return;frame=requestAnimationFrame(()=>{frame=0;enhance();enhanceProductLength();});}).observe(el('page')||document.body,{childList:true,subtree:true});enhance();enhanceProductLength();
})();
