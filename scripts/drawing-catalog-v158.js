(function(){
 let pending=null;
 function status(text){
  let node=document.getElementById('rafexProjectStartStatusV157');
  if(!node){node=document.createElement('p');node.id='rafexProjectStartStatusV157';node.setAttribute('role','status');node.setAttribute('aria-live','polite');document.querySelector('#page .rafex-common-project-name-wrap')?.after(node);}
  node.textContent=text;
 }
 async function persist(saveTypes){
  if(pending)return pending;
  const identity=window.rafexProjectIdentityV133;
  const name=String(document.getElementById('rafexAuthorityProjectName')?.value||'').trim();
  if(!identity||!name){status('Önce proje adını yazıp yeni proje oluştur.');return false;}
  const types=structuredClone(window.rafexProjectTypesV133||[]);
  const button=document.getElementById('rafexNewProjectV133');
  window.rafexProjectSavingV133=true;if(button)button.disabled=true;
  pending=(async()=>{
   try{
    status('Raf tipi listesi kaydediliyor…');
    if(!identity.drawingCatalogId){
     const result=await req('/api/drawing-projects',{method:'POST',body:JSON.stringify({name,uuid:identity.uuid})});
     if(!Number.isSafeInteger(result.project?.id))throw Error('Proje numarası alınamadı.');
     identity.drawingCatalogId=result.project.id;identity.drawingCatalogRevision=result.project.revision;
    }
    if(saveTypes){
     const result=await req('/api/drawing-projects/'+identity.drawingCatalogId+'/types',{method:'PUT',body:JSON.stringify({revision:identity.drawingCatalogRevision,rackTypes:types})});
     identity.drawingCatalogRevision=result.revision;
    }
    if(window.rafexProjectIdentityV133?.uuid!==identity.uuid)return false;
    identity.displayNumber=String(identity.drawingCatalogId);
    window.rafexActivateProjectV134?.(identity);window.rafexSyncProjectGateV134?.();
    document.getElementById('rafexProjectImportV155')?.dispatchEvent(new Event('rafex-project-saved'));
    status(saveTypes?'Proje #'+identity.drawingCatalogId+' · Raf tipleri otomatik kaydedildi.':'Proje #'+identity.drawingCatalogId+' oluşturuldu. Raf tipleri Serbest Yerleşim Alanı’na geçerken otomatik kaydedilir.');
    return true;
   }catch(error){status('Kaydedilemedi: '+error.message+' Raf tiplerin korunuyor; yeniden deneyebilirsin.');return false;}
   finally{window.rafexProjectSavingV133=false;if(button)button.disabled=false;pending=null;}
  })();
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
