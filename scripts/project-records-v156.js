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
  #rafexSavedProjectsV156{position:relative;flex:1 1 220px;min-width:180px;color:#214f3b;font:12px Arial}
  #rafexSavedProjectsV156 summary{cursor:pointer;padding:10px;border:1px solid #a9c1b3;border-radius:7px;background:#fff;font-weight:bold}
  #rafexSavedProjectsV156 .saved-project-panel{position:absolute;left:0;top:100%;z-index:120;width:min(380px,80vw);box-sizing:border-box;display:grid;gap:8px;padding:12px;border:1px solid #a9c1b3;border-radius:8px;background:#fff;box-shadow:0 8px 24px #0002}
  #rafexSavedProjectsV156 select{width:100%;min-width:0;padding:8px}
  #rafexTypeProjectSaveV156{display:grid;gap:8px;margin-top:16px;padding:14px;border:1px solid #d8bc3a;border-radius:9px;background:#fff9dc;color:#214f3b;font:12px Arial}
  #rafexTypeProjectSaveV156 button{width:100%;padding:14px;background:#f2c500;color:#173c2d;font-weight:bold}
  #page[data-rafex-workflow-screen="layout"] #rafexTypeProjectSaveV156{display:none!important}
  `;
  document.head.appendChild(style);
  let frame=0;
  function install(){
    frame=0;if(!common())return;
    const wrap=document.querySelector('#page .rafex-common-project-name-wrap');
    if(wrap&&!wrap.querySelector('#rafexSavedProjectsV156')){
      const root=document.createElement('details');root.id='rafexSavedProjectsV156';
      root.innerHTML='<summary>Kayıtlı projeyi aç</summary><div class="saved-project-panel"><label>Proje no · Proje adı<select aria-label="Açılacak proje"><option value="">Proje seç…</option></select></label><button type="button" data-open disabled>Kayıtlı haliyle aç</button><button type="button" data-refresh>Listeyi yenile</button><small>Projenin kayıtlı raf tipleri ve yerleşimi birlikte açılır.</small><small role="status" aria-live="polite"></small></div>';
      wrap.insertBefore(root,wrap.querySelector('#rafexProjectImportV155'));
      const select=root.querySelector('select'),open=root.querySelector('[data-open]'),status=root.querySelector('[role=status]'),refresh=root.querySelector('[data-refresh]');
      let records=[],loading=false;
      async function load(){
        if(loading)return;loading=true;refresh.disabled=true;open.disabled=true;status.textContent='Projeler yükleniyor…';
        try{
          const result=await req('/api/projects',{cache:'no-store'});
          if(!Array.isArray(result?.projects))throw Error('Proje listesi alınamadı.');
          if(!root.isConnected)return;
          records=result.projects.filter(p=>p.payload?.layout||Array.isArray(p.payload?.rackTypes)).sort((a,b)=>Number(b.serial_no||b.id)-Number(a.serial_no||a.id));
          select.replaceChildren(new Option('Proje seç…',''));
          records.forEach(p=>select.add(new Option('#'+(p.serial_no||p.id)+' · '+p.project_name,String(p.id))));
          status.textContent=records.length?'Numarası ve adıyla bir proje seç.':'Henüz kayıtlı proje yok.';
        }catch(error){status.textContent=error.message||'Projeler yüklenemedi.';}
        finally{loading=false;refresh.disabled=false;}
      }
      root.addEventListener('toggle',()=>{if(root.open)load();});
      refresh.addEventListener('click',load);
      select.addEventListener('change',()=>open.disabled=!select.value);
      open.addEventListener('click',()=>{
        if(window.rafexProjectSavingV133){status.textContent='Kayıt işleminin bitmesini bekle.';return;}
        const record=records.find(p=>String(p.id)===select.value);if(!record)return;
        m2ApplyProjectRecord(structuredClone(record),false);
        root.open=false;window.rafexSyncProjectGateV134?.();
      });
    }
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
