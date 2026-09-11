(function(){
  if(window.__rafexManualFreeOutputV32)return;
  window.__rafexManualFreeOutputV32=true;
  let depth=0,creating=false,scheduled=0,currentPanel=null,currentKey='',generation=0;
  const settings=new Map();
  const fields=['m2ReportType','m2ReportLanguage','m2ReportProductTotal','m2ReportCompleteFront'];
  const base={};
  const nav=()=>document.querySelector('#nav button.active[data-page]')?.dataset.page||'';
  const key=()=>nav()==='free'?'common:'+ (window.rafexProjectIdentityV133?.uuid||'unopened'):nav();
  const panel=()=>document.querySelector('#page .m2-report-panel');
  function invalidate(){const p=panel();if(p){delete p.dataset.rafexReadyV136;p.dataset.rafexOutputVisible='0';}window.__rafexFreeOutputDirty=true;}
  function capture(){if(!currentPanel?.isConnected||!currentKey||currentKey!==key())return;const saved={};for(const id of fields){const input=currentPanel.querySelector('#'+id);if(input)saved[id]=input.type==='checkbox'?input.checked:input.value;}settings.set(currentKey,saved);}
  window.rafexScreenStateV136=()=>({key:key(),currentKey,settings:Array.from(settings)});
  function restore(p,k){
    let saved=settings.get(k);
    if(!saved){saved={m2ReportType:'corporate',m2ReportLanguage:'tr',m2ReportProductTotal:false,m2ReportCompleteFront:false};settings.set(k,saved);}
    for(const id of fields){const input=p.querySelector('#'+id);if(!input)continue;if(input.type==='checkbox')input.checked=saved[id];else input.value=saved[id];input.closest('label')?.removeAttribute('hidden');}
  }
  for(const name of ['m2ScheduleReportRefresh','m2RefreshActiveReport','m2RenderA4Report','m2RenderCorporateReport','rafexRenderSelectedB2BSections']){
    const original=window[name];if(typeof original!=='function')continue;base[name]=original;
    const guarded=function(){if(!depth&&panel()){invalidate();return;}return original.apply(this,arguments);};
    window[name]=guarded;
    // The original portal uses global lexical calls as well as window properties.
    if(name==='m2ScheduleReportRefresh')m2ScheduleReportRefresh=guarded;
    if(name==='m2RefreshActiveReport')m2RefreshActiveReport=guarded;
    if(name==='m2RenderA4Report')m2RenderA4Report=guarded;
    if(name==='m2RenderCorporateReport')m2RenderCorporateReport=guarded;
  }
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const status=text=>{const node=document.getElementById('m2FloorStatus');if(node)node.textContent=text;};
  async function createOutput(){
    if(creating||window.rafexCanEditProjectV134?.()===false)return;
    ensure();
    const p=panel(),owner=key(),token=++generation;if(!p)return;
    const button=p.querySelector('#m2CreateOutputButton'),type=p.querySelector('#m2ReportType')?.value||'corporate';
    const target=p.querySelector(type==='summary'?'#m2A4Sheet':'#m2CorporatePreview');
    creating=true;depth++;window.__rafexManualOutputBuild=true;
    if(button){button.disabled=true;button.textContent='Çıktı Oluşturuluyor…';}
    status('Teknik çıktı hazırlanıyor.');invalidate();
    try{
      window.rafexOpenPdfGateV89?.();
      if(!target)throw Error('Önizleme alanı bulunamadı.');
      if(type==='summary')await base.m2RenderA4Report?.();else await base.m2RenderCorporateReport?.();
      // Existing section repair passes settle within 3100ms.
      await wait(3200);
      if(token!==generation||!p.isConnected||owner!==key())return;
      if(type==='corporate')await base.rafexRenderSelectedB2BSections?.(true);
      if(token!==generation||!p.isConnected||owner!==key())return;
      if(!target.querySelector('svg,img,canvas'))throw Error('Çizim önizlemesi üretilemedi.');
      p.querySelector('#m2A4Sheet')?.toggleAttribute('hidden',type!=='summary');
      p.querySelector('#m2CorporatePreview')?.toggleAttribute('hidden',type!=='corporate');
      p.dataset.rafexOutputVisible='1';p.dataset.rafexReadyV136=type;
      window.__rafexFreeOutputDirty=false;
      status('Teknik çıktı hazır. Çizimi veya çıktı ayarlarını değiştirirsen yeniden oluştur.');
      target.scrollIntoView({block:'start'});
    }catch(error){
      if(token===generation&&p.isConnected){invalidate();status('Çıktı oluşturulamadı: '+error.message);}
      console.error('RAFEX çıktı',error);
    }finally{
      depth--;creating=false;window.__rafexManualOutputBuild=false;
      if(button){button.disabled=false;button.textContent='Çıktıyı Oluştur';}
    }
  }
  function ensure(){
    scheduled=0;const p=panel();if(!p)return;
    const k=key();
    if(p!==currentPanel||k!==currentKey){currentPanel=p;currentKey=k;generation++;invalidate();}
    restore(p,k);
    p.dataset.rafexManualOutput='1';
    const head=p.querySelector('.m2-report-head'),host=p.querySelector('.m2-report-head-actions');if(!host)return;
    const title=head?.querySelector('b'),subtitle=head?.querySelector('small');
    if(title&&title.textContent!=='PDF Çıktı Alanı')title.textContent='PDF Çıktı Alanı';
    const text=nav()==='free'?'Tüm sistemler için ortak proje çıktısı':'Yerleşim ve teknik görünüşler';
    if(subtitle&&subtitle.textContent!==text)subtitle.textContent=text;
    let button=p.querySelector('#m2CreateOutputButton');
    if(!button){button=document.createElement('button');button.id='m2CreateOutputButton';button.type='button';button.textContent='Çıktıyı Oluştur';button.addEventListener('click',createOutput);host.prepend(button);}
    button.hidden=false;
    const list=document.getElementById('m2ProjectList'),heading=list?.previousElementSibling;
    if(nav()==='free'&&heading&&heading.textContent!=='Kayıtlı Projeler · Tüm Sistemler')heading.textContent='Kayıtlı Projeler · Tüm Sistemler';
  }
  function schedule(){if(!scheduled)scheduled=requestAnimationFrame(ensure);}
  document.addEventListener('change',event=>{
    if(fields.includes(event.target?.id)){if(event.isTrusted)capture();else schedule();invalidate();}
    if(event.target?.name==='rafexUnifiedSystem'){generation++;schedule();}
  },true);
  document.addEventListener('click',event=>{
    if(event.target.closest?.('#nav button,.rafex-system-option,#m2ProjectList button,#rafexNewProjectV133')){generation++;schedule();setTimeout(schedule,250);}
  },true);
  // Only inspect mutations in report controls or replaced page children.
  // Never scan the thousands of SVG nodes during a drag.
  const page=document.getElementById('page');
  if(page)new MutationObserver(records=>{
    if(records.some(r=>!r.target.closest?.('svg')&&(r.target===page||r.target===currentPanel?.parentElement||r.target.closest?.('.m2-report-head,#m2ProjectList')||Array.from(r.addedNodes).some(n=>n.nodeType===1&&(n.matches('.m2-report-panel')||n.querySelector('.m2-report-panel'))))))schedule();
  }).observe(page,{childList:true,subtree:true});
  window.rafexCreateFreeDrawingOutput=createOutput;
  window.addEventListener('rafex-authority-state',schedule);
  schedule();setTimeout(schedule,250);setTimeout(schedule,1000);
})();
