(function(){
 let pending=null,owner=null,wantsTypes=false;
 function status(text){
  let node=document.getElementById('rafexProjectStartStatusV157');
  if(!node){node=document.createElement('p');node.id='rafexProjectStartStatusV157';node.setAttribute('role','status');node.setAttribute('aria-live','polite');document.querySelector('#page .rafex-common-project-name-wrap')?.after(node);}
  node.textContent=text;
 }
 async function persist(saveTypes){
  const identity=window.rafexProjectIdentityV133;
  if(pending){
   if(owner===identity){wantsTypes=wantsTypes||saveTypes;return pending;}
   await pending;
   if(window.rafexProjectIdentityV133!==identity)return false;
   return persist(saveTypes);
  }
  const name=String(document.getElementById('rafexAuthorityProjectName')?.value||'').trim();
  if(!identity||!name){status('Önce proje adını yazıp yeni proje oluştur.');return false;}
  owner=identity;wantsTypes=saveTypes;
  const active=()=>window.rafexProjectIdentityV133===identity;
  const button=document.getElementById('rafexNewProjectV133');
  window.rafexProjectSavingV133=true;if(button)button.disabled=true;
  pending=Promise.resolve().then(async()=>{
   try{
    status('Raf tipi listesi kaydediliyor…');
    if(!identity.drawingCatalogId){
     const result=await req('/api/drawing-projects',{method:'POST',body:JSON.stringify({name,uuid:identity.uuid})});
     if(!Number.isSafeInteger(result.project?.id))throw Error('Proje numarası alınamadı.');
     identity.drawingCatalogId=result.project.id;identity.drawingCatalogRevision=result.project.revision;
    }
    if(!active())return false;
    if(wantsTypes){
     // Snapshot immediately before each write. Changes made while awaiting a
     // response must be acknowledged by a subsequent write, not by that response.
     for(;;){
      if(!active())return false;
      const types=structuredClone(window.rafexProjectTypesV133||[]),keys=new Set();
      for(const type of types){
       const system=type.__rafexSystem||type.system||type.drawing?.rafexSystem||(type.drawing?.b2b?'b2b':'mekik2'),key=system+':'+type.id;
       if(type.id==null||type.id===''||!Number.isSafeInteger(Number(type.id))||keys.has(key))throw Error('Raf tipi kimlikleri geçersiz veya çakışıyor. Mevcut kayıt değiştirilmedi.');
       keys.add(key);
      }
      if(!Number.isSafeInteger(identity.drawingCatalogRevision)||identity.drawingCatalogRevision<0)throw Error('Katalog sürümü doğrulanamadı; mevcut kayıt korunuyor.');
      const snapshot=JSON.stringify(types);
      const result=await req('/api/drawing-projects/'+identity.drawingCatalogId+'/types',{method:'PUT',body:JSON.stringify({revision:identity.drawingCatalogRevision,rackTypes:types})});
      if(!Number.isSafeInteger(result.revision)||result.revision<=identity.drawingCatalogRevision)throw Error('Kayıt yanıtı doğrulanamadı. Yeniden açmadan önce yerel değişikliklerini koru.');
      identity.drawingCatalogRevision=result.revision;
      if(!active())return false;
      if(snapshot===JSON.stringify(window.rafexProjectTypesV133||[]))break;
     }
    }
    if(!active())return false;
    identity.displayNumber=String(identity.drawingCatalogId);
    window.rafexActivateProjectV134?.(identity);window.rafexSyncProjectGateV134?.();
    document.getElementById('rafexProjectImportV155')?.dispatchEvent(new Event('rafex-project-saved'));
    status(wantsTypes?'Proje #'+identity.drawingCatalogId+' · Raf tipleri otomatik kaydedildi.':'Proje #'+identity.drawingCatalogId+' oluşturuldu. Raf tipleri Serbest Yerleşim Alanı’na geçerken otomatik kaydedilir.');
    return true;
   }catch(error){if(active())status('Kaydedilemedi: '+error.message+' Raf tiplerin korunuyor; yeniden deneyebilirsin.');return false;}
   finally{window.rafexProjectSavingV133=false;if(button)button.disabled=false;pending=null;owner=null;}
  });
  return pending;
 }
 window.rafexSaveNewProjectV157=()=>persist(false);
 window.rafexSaveDrawingCatalogV158=()=>persist(true);
 // History saves have their own identifiers and must never change this number.
 window.rafexProjectSavedV156=function(){};
 document.addEventListener('keydown',event=>{
  if(event.key==='Enter'&&event.target?.id==='rafexAuthorityProjectName'){
   event.preventDefault();if(!window.rafexProjectSavingV133)window.rafexStartNewProjectV133();
  }
 });
})();
