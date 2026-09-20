(function(){
  const common=()=>document.querySelector('#nav button.active[data-page]')?.dataset.page==='free';
  window.rafexProjectSavedV156=function(result,record){
    const identity=window.rafexProjectIdentityV133;
    if(identity&&identity.uuid===record.payload.projectIdentity?.uuid){
      identity.displayNumber=String(result.serialNo);
      window.rafexActivateProjectV134?.(identity);
      window.rafexSyncProjectGateV134?.();
    }
    document.getElementById('rafexProjectImportV155')?.dispatchEvent(new Event('rafex-project-saved'));
  };
  const style=document.createElement('style');
  style.textContent=`
  #rafexTypeProjectSaveV156{display:grid;gap:8px;margin-top:16px;padding:14px;border:1px solid #d8bc3a;border-radius:9px;background:#fff9dc;color:#214f3b;font:12px Arial}
  #rafexTypeProjectSaveV156 button{width:100%;padding:14px;background:#f2c500;color:#173c2d;font-weight:bold}
  #page[data-rafex-workflow-screen="layout"] #rafexTypeProjectSaveV156{display:none!important}
  `;
  document.head.appendChild(style);
  let frame=0;
  function install(){
    frame=0;if(!common())return;
    const types=document.getElementById('m2SavedTypesPanel');
    if(types&&!document.getElementById('rafexTypeProjectSaveV156')){
      const row=document.createElement('div');row.id='rafexTypeProjectSaveV156';
      row.innerHTML='<button type="button">Projeyi Kaydet</button><small>Raf tipleri ve varsa yerleşim birlikte kaydedilir. Her kayıt yeni bir proje numarası alır.</small><small role="status" aria-live="polite"></small>';
      types.appendChild(row);
      row.querySelector('button').addEventListener('click',async()=>{
        const button=row.querySelector('button'),status=row.querySelector('[role=status]');
        if(window.rafexProjectSavingV133)return;
        button.disabled=true;status.textContent='Kaydediliyor…';
        try{await m2SaveProject();status.textContent=document.getElementById('m2ProjectSaveMsg')?.textContent||'Kayıt işlemi tamamlandı.';}
        catch(error){status.textContent='Kaydedilemedi: '+error.message;}
        finally{button.disabled=false;}
      });
    }
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(install);}
  const page=document.getElementById('page');
  if(page)new MutationObserver(schedule).observe(page,{childList:true,subtree:true});
  window.addEventListener('rafex-authority-state',schedule);
  schedule();
})();
