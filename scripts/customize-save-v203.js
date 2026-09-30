(()=>{
 const el=id=>document.getElementById(id),modal=()=>el('m2CustomizeModal');
 const lang=()=>['en','fr'].includes(document.documentElement.lang)?document.documentElement.lang:'tr';
 const t=(tr,en,fr)=>({tr,en,fr})[lang()];
 const mm=n=>Number(n).toLocaleString(lang()==='tr'?'tr-TR':lang()==='fr'?'fr-FR':'en-US',{maximumFractionDigits:1})+' mm';
 let session=null,busy=false;
 const commit=window.rafexCommitCustomTypeV184;
 window.rafexCommitCustomTypeV184=function(r,entry,previous){
  if(session&&r.id===session.id){entry.rafexCustomNameV203=entry.name;entry.drawing.rafexCustomNameV203=entry.name;r.rafexCustomNameV203=entry.name;}
  return commit.apply(this,arguments);
 };
 function note(host,id,message,error=false){
  let node=el(id);if(!node){node=document.createElement('p');node.id=id;node.setAttribute('translate','no');node.setAttribute('role',error?'alert':'status');node.style.cssText='padding:10px;border:1px solid #bacfc1;border-radius:7px;background:#f1f7f3;font-size:12px;line-height:1.5;white-space:normal';(host.querySelector('.m2-customize-actions,footer')||null)?.before(node);if(!node.parentNode)host.append(node);}
  if(node.textContent!==message)node.textContent=message;node.hidden=!message;return node;
 }
 function heightNote(options,fixed,host,id){
  const levels=window.rafexPhysicalLevelsV121(options),last=levels.at(-1),top=last?last.bottom+last.beam:0;
  const raw=top+Math.max(0,Number(options.lastPalletOverlap??options.palletHeight/2)||0),rounded=Math.max(500,Math.ceil(raw/50)*50);
  const message=t(`Kat düzenine göre hesaplanan ayak boyu: ${mm(raw)}. Otomatik boy (50 mm’ye yukarı yuvarlanır): ${mm(rounded)}. Ayak boyu sabitlendiği için ${mm(fixed)} korunur ve bu değerle kaydedilir.`,
   `Calculated upright height for these levels: ${mm(raw)}. Automatic height (rounded up to 50 mm): ${mm(rounded)}. The upright is fixed, so ${mm(fixed)} is retained and saved.`,
   `Hauteur de montant calculée pour ces niveaux : ${mm(raw)}. Hauteur automatique (arrondie aux 50 mm supérieurs) : ${mm(rounded)}. Le montant étant fixé, ${mm(fixed)} est conservé et enregistré.`);
  note(host,id,message);return {raw,rounded,fixed,top,message};
 }
 window.rafexCustomizeHeightNoteV203=heightNote;
 function rack(){return session&&m2LayoutState.racks===session.racks?m2LayoutState.racks.find(r=>r.id===session.id):null;}
 function refresh(){const r=rack();if(!r||modal()?.hidden)return;try{return heightNote(window.rafexB2BCustomizeOptionsV120(r),session.height,modal().querySelector('aside'),'rafexCustomizeFootNoteV203');}catch(error){console.warn('Customize height note',error);}}
 function baseName(r){let name=String(r.typeName||'A').replace(/\s*-\s*Özel(?:\s*\d+)?\s*$/i,'').trim();const suffix=String(r.blockName||'').trim(),at=suffix?name.lastIndexOf(' - '+suffix):-1;if(at>=0&&/^(?: \d+)?$/.test(name.slice(at+3+suffix.length)))name=name.slice(0,at);return name||'A';}
 function generatedName(){const block=String(el('m2CustomizeBlockName')?.value||'').trim();return block?session.base+' - '+block:session.originalName;}
 function updateName(){if(!session)return;const input=el('m2CustomizeName');if(!input)return;if(input.value===session.lastName){input.value=generatedName();session.lastName=input.value;}}
 const open=window.m2OpenCustomizeModal;
 window.m2OpenCustomizeModal=function(id){
  session=null;const result=open.apply(this,arguments);const r=m2LayoutState.racks.find(r=>Number(r.id)===Number(id));
  if(!r?.b2b||r.b2b.mr||modal()?.hidden)return result;
  session={id:r.id,racks:m2LayoutState.racks,base:baseName(r),originalName:String(r.typeName||'A'),lastName:el('m2CustomizeName')?.value||'',height:Number(window.rafexB2BDetailOptionsV117(r).footHeight)};
  const input=el('m2CustomizeName');if(input)input.maxLength=140;
  updateName();refresh();const error=el('rafexCustomizeSaveErrorV203');if(error)error.hidden=true;
  if(!modal().dataset.saveEventsV203){modal().dataset.saveEventsV203='1';
   modal().addEventListener('input',e=>{if(e.target.id==='m2CustomizeBlockName')updateName();refresh();});
   modal().addEventListener('change',refresh);
  }
  return result;
 };
 const preview=window.rafexUpdateB2BCustomizeViewerV119;
 window.rafexUpdateB2BCustomizeViewerV119=function(){const result=preview?.apply(this,arguments);refresh();return result;};
 const apply=window.m2ApplyRackCustomization;
 window.m2ApplyRackCustomization=function(){
  if(!session||modal()?.hidden)return apply.apply(this,arguments);
  if(busy)return;
  const fail=message=>{note(modal().querySelector('aside'),'rafexCustomizeSaveErrorV203',message,true).scrollIntoView({block:'nearest'});return false;};
  const r=rack();if(!r)return fail(t('Düzenlenen raf bu proje içinde bulunamadı. Özelleştir penceresini kapatıp rafı yeniden seçin.','The edited rack is no longer in this project. Close the editor and select the rack again.','Le rayonnage modifié ne se trouve plus dans ce projet. Fermez l’éditeur et sélectionnez-le à nouveau.'));
  // The editor owns its target; a cleared canvas selection is not a cancelled edit.
  m2CustomizeRackId=r.id;updateName();
  let options,info;
  try{options=window.rafexB2BCustomizeOptionsV120(r);info=refresh();}catch(error){console.error('Customize validation failed',error);return fail(t('Kat bilgileri okunamadı. Düzenlemeler korunuyor; yeniden deneyin.','The level data could not be read. Your edits are retained; please retry.','Les données des niveaux sont illisibles. Vos modifications sont conservées ; réessayez.'));}
  if(options.invalidCustomizeHeight||info?.top>session.height)return fail(t('Kat düzeni sabit ayak boyunu aşıyor. Kat ölçülerini azaltın; ayak boyu burada değişmez.','The levels exceed the fixed upright height. Reduce the level dimensions; upright height stays fixed here.','Les niveaux dépassent la hauteur fixe du montant. Réduisez les cotes des niveaux ; le montant reste fixe ici.'));
  if(options.invalidTunnel)return fail(t('Tünel yüksekliği mevcut ayak boyuna ve üst palet kotuna sığmıyor.','The tunnel does not fit the upright and top pallet heights.','Le tunnel ne tient pas dans les hauteurs du montant et de la palette supérieure.'));
  // Avoid replacing an unrelated saved type that happens to have the same name.
  const input=el('m2CustomizeName'),name=input.value.trim();
  if(name&&name!==String(r.typeName||'')&&m2SavedRackTypes.some(e=>e.source==='custom'&&String(e.name).toLocaleLowerCase('tr-TR')===name.toLocaleLowerCase('tr-TR'))){let i=2;while(m2SavedRackTypes.some(e=>String(e.name).toLocaleLowerCase('tr-TR')===(name+' '+i).toLocaleLowerCase('tr-TR')))i++;input.value=name+' '+i;session.lastName=input.value;}
  busy=true;
  try{
   const result=apply.apply(this,arguments);
   if(!modal().hidden)return fail(t('Değişiklikler kaydedilmedi. Ölçü uyarılarını kontrol edip yeniden deneyin.','Changes were not saved. Check the dimension warnings and try again.','Les modifications n’ont pas été enregistrées. Vérifiez les avertissements de dimensions et réessayez.'));
   if(info){const status=el('m2FloorStatus');if(status){const message=document.createElement('span');message.setAttribute('translate','no');message.setAttribute('data-customize-save-notice','');message.textContent=' '+info.message;status.append(message);}}
   session=null;return result;
  }catch(error){console.error('Customize save failed',error);return fail(t('Kayıt tamamlanamadı. Düzenleme alanı açık tutuldu; yeniden deneyin.','Saving could not be completed. The editor remains open; please retry.','L’enregistrement n’a pas pu être terminé. L’éditeur reste ouvert ; réessayez.'));}
  finally{busy=false;}
 };
 try{m2OpenCustomizeModal=window.m2OpenCustomizeModal;m2ApplyRackCustomization=window.m2ApplyRackCustomization;}catch(_){}
})();
