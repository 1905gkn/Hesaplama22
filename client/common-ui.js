(function(){
 const root=()=>document.querySelector('#page[data-rafex-common-active="1"]');
 function text(el,value){if(el&&el.textContent!==value)el.textContent=value;}
 function help(parent,id,value){if(!parent)return;let el=document.getElementById(id);if(!el){el=document.createElement('small');el.id=id;el.className='common-help';parent.append(el);}text(el,value);}
 function label(id,value){const el=document.getElementById(id),host=el?.closest('label');if(!host)return;const span=host.querySelector('span');if(span)text(span,value);else for(const n of host.childNodes)if(n.nodeType===3&&n.textContent.trim()){if(n.textContent!==value)n.textContent=value;break;}}
 window.RafexCommonFeedback=function(message,host){host=host||root();if(!host)return false;let box=host.querySelector(':scope > .common-error');if(!box){box=document.createElement('div');box.className='common-error';box.setAttribute('role','alert');host.prepend(box);}text(box,message);box.scrollIntoView({block:'nearest',behavior:'smooth'});return true;};
 function sync(){const p=root();if(!p)return;
   const mekikCard=p.querySelector('#m2Bays')?.closest('.card');if(mekikCard&&!mekikCard.classList.contains('rafex-common-mekik-input-card'))mekikCard.classList.add('rafex-common-mekik-input-card');
   for(const id of ['m2SaveRackButton','mrSaveRackButton','rafexKonsolCommonSaveRack'])text(document.getElementById(id),'Raf Tipini Kaydet');
   p.querySelectorAll('button[onclick^="rafexCollectionSave"]').forEach(el=>text(el,'Katı Görsele Ekle'));
   label('b2bPalletWeight','Palet başına ağırlık (kg)');
   const weight=document.getElementById('b2bPalletWeight'),count=document.getElementById('b2bPalletCount');
   if(weight&&count){const w=Number(weight.value),n=Number(count.value);help(weight.closest('label'),'common-pallet-load',w>0&&n>0?n+' palet × '+w.toLocaleString('tr-TR')+' kg = '+(w*n).toLocaleString('tr-TR')+' kg / kat':'Palet sayısı ve ağırlığı girildiğinde kat yükü hesaplanır.');}
   const list=document.getElementById('b2bAccessoryList');
   if(list?.querySelector('.rack-tray-selection'))help(list,'common-accessory-load','Tava yükü, seçtiğiniz her katın toplam yüküdür. Birden fazla kat seçildiğinde yük katlar arasında bölünmez.');
   if(list&&weight&&count){list.querySelectorAll('.b2b-accessory-card').forEach(card=>{
     const input=card.querySelector('input[onchange*="rafexAccessorySetTraySelection"]');
     const index=input?.getAttribute('onchange')?.match(/rafexAccessorySetTraySelection\((\d+),'load'/)?.[1];if(index==null)return;
     const total=Number(weight.value)*Number(count.value);let reuse=card.querySelector('[data-common-reuse-load]');
     if(!reuse){reuse=document.createElement('button');reuse.type='button';reuse.dataset.commonReuseLoad='';input.closest('label').after(reuse);reuse.onclick=()=>{const load=Number(document.getElementById('b2bPalletWeight')?.value)*Number(document.getElementById('b2bPalletCount')?.value);if(load>0)window.rafexAccessorySetTraySelection(Number(index),'load',load);};}
     reuse.disabled=!(total>0);text(reuse,'Raf kat yükünü kullan'+(total>0?' · '+total.toLocaleString('tr-TR')+' kg':''));
   });}
   for(const id of ['b2bFootProfile','b2bTraverseType']){const select=document.getElementById(id);if(!select)continue;const option=select.selectedOptions[0]?.textContent||'';if(select.title!==option)select.title=option;const duplicate=document.getElementById(id==='b2bFootProfile'?'b2bFootRecommendation':'b2bTraverseRecommendation');if(duplicate)duplicate.classList.toggle('common-duplicate',duplicate.textContent.trim()===option.trim());}
   help(document.getElementById('m2SaveRackButton')?.parentElement,'common-rack-save-help','Raf tipini kaydeder. Yerleşimdeki raflar ve çizim, “Projeyi Kaydet” ile kaydedilir.');
 }
 let frame=0;function queue(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;sync();});}
 document.addEventListener('change',queue,true);
 document.addEventListener('input',queue,true);
 document.addEventListener('click',function(event){
   const button=event.target.closest?.('button');if(!button||!root())return;
   const action=button.getAttribute('onclick')||'',match=action.match(/rafexAccessory(?:ToggleLevel|AllLevels)\((\d+)/);
   if(match){const item=window.rafexAccessoryState?.()[Number(match[1])];if(item?.type==='tray'&&(!(item.load>0)||!(item.thickness>0))){event.preventDefault();event.stopImmediatePropagation();const card=button.closest('.b2b-accessory-card');window.RafexCommonFeedback('Kat seçmeden önce kat yükünü girin ve uygun bir tava seçin.',card);card?.querySelector('input')?.setAttribute('aria-invalid','true');return;}}
   queue();
 },true);
 document.addEventListener('input',event=>{event.target.removeAttribute?.('aria-invalid');const card=event.target.closest?.('.b2b-accessory-card');card?.querySelector('.common-error')?.remove();},true);
 const page=document.getElementById('page');if(page)new MutationObserver(records=>{if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches('input,select,button,label')||node.querySelector('input,select,button,label')))))queue();}).observe(page,{childList:true,subtree:true});
 queue();
})();
