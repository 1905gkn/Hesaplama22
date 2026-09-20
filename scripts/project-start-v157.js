(function(){
 window.rafexSaveNewProjectV157=async function(){
  const identity=window.rafexProjectIdentityV133,button=document.getElementById('rafexNewProjectV133'),wrap=document.querySelector('#page .rafex-common-project-name-wrap');
  if(!identity||!wrap)return;
  let status=document.getElementById('rafexProjectStartStatusV157');
  if(!status){status=document.createElement('p');status.id='rafexProjectStartStatusV157';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.style.cssText='margin:8px 0 12px;color:#214f3b;font:13px Arial';wrap.after(status);}
  status.textContent='Proje kaydediliyor, numarası oluşturuluyor…';
  if(button)button.disabled=true;
  try{
   await m2SaveProject();
   if(window.rafexProjectIdentityV133?.uuid!==identity.uuid)return;
   status.textContent=/^\d+$/.test(String(identity.displayNumber))?'Proje kaydedildi. Raf tiplerini oluşturup alttaki Projeyi Kaydet düğmesiyle saklayabilirsin.':(document.getElementById('m2ProjectSaveMsg')?.textContent||'Proje kaydedilemedi. Yeniden dene.');
  }catch(error){status.textContent='Proje kaydedilemedi: '+error.message;}
  finally{if(button)button.disabled=false;}
 };
 document.addEventListener('keydown',event=>{
  if(event.key==='Enter'&&event.target?.id==='rafexAuthorityProjectName'){
   event.preventDefault();if(!window.rafexProjectSavingV133)window.rafexStartNewProjectV133();
  }
 });
})();
