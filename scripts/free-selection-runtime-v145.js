(function(){
  'use strict';
  if(window.__rafexFreeSelectionV145) return;
  window.__rafexFreeSelectionV145=true;
  const core=window.RafexSelectionCoreV145;
  let picking=false,ids=new Set(),batch=null,scheduled=false;
  const byId=id=>document.getElementById(id);
  function common(){const p=byId('page');return p?.dataset.rafexFreeDrawing==='1'||p?.dataset.rafexCommonActive==='1'||p?.classList.contains('rafex-free-drawing-page');}
  function racks(){try{return m2LayoutState.racks||[]}catch(_){return[]}}
  function status(text){const n=byId('m2FloorStatus');if(n)n.textContent=text;}
  function chosen(){
    const selected=new Set(ids.size ? ids : typeof m2MultiSelect==='undefined'?[]:m2MultiSelect.rackIds);
    if(!selected.size && typeof m2LayoutState!=='undefined' && m2LayoutState.selected!=null) selected.add(m2LayoutState.selected);
    return racks().filter(r=>selected.has(r.id));
  }
  function syncSelection(){
    ids=new Set([...ids].filter(id=>racks().some(r=>r.id===id)));
    if(!picking)return;
    m2MultiSelect.active=false;m2MultiSelect.start=null;m2MultiSelect.hover=null;
    m2MultiSelect.rackIds=new Set(ids);m2MultiSelect.symbolIds.clear();
    m2LayoutState.selected=[...ids].at(-1)??null;
  }
  function render(){syncSelection();m2RenderLayout();syncUi();}
  function start(){
    if(!picking){m2ClearAllSelections();ids.clear();}
    picking=true;syncSelection();render();
    status('Tek tek seçim açık. Bloklara tıklayarak seç veya seçimden çıkar; Esc ile bitir.');
  }
  function stop(){
    // Escape also cancels an open editor before clearing its target id.
    const standard=byId('m2CustomizeModal');if(standard&&!standard.hidden)window.m2CloseCustomizeModal?.();
    const lane=byId('rafexLaneCustomizeV115');if(lane&&!lane.hidden)lane.querySelector('[data-cancel]')?.click();
    const konsol=byId('rafexKonsolCustomizeV114');if(konsol&&!konsol.hidden)konsol.querySelector('[data-rkc-cancel]')?.click();
    picking=false;ids.clear();batch=null;m2ClearAllSelections('Tek tek seçim kapatıldı.');syncUi();
  }
  function syncUi(){
    if(!common())return;
    syncSelection();
    const host=document.querySelector('.m2-floor-tools .rack-tools');
    if(host && !byId('rafexPickBlocksV145')){
      const button=document.createElement('button');button.id='rafexPickBlocksV145';button.type='button';button.onclick=()=>picking?stop():start();
      button.setAttribute('aria-keyshortcuts','Control+q');host.appendChild(button);
    }
    const pick=byId('rafexPickBlocksV145');
    if(pick){const text=picking?'Tek tek seç · '+ids.size+' seçili · Esc':'Tek tek seç (Ctrl+Q)';if(pick.textContent!==text)pick.textContent=text;pick.classList.toggle('active',picking);pick.setAttribute('aria-pressed',String(picking));}
    const separate=byId('m2SeparateRackButton');if(separate)separate.disabled=!chosen().some(r=>core.linked(r,racks()));
    const report=byId('m2ReportType');if(report){report.value='corporate';report.closest('label')?.setAttribute('hidden','');}
    const hint=byId('rafexProjectGateHintV134');if(hint?.textContent.includes('aşağıdaki Kayıtlı Projeler'))hint.textContent='Başlamak için proje adını yazıp Yeni proje aç düğmesine bas. Kayıtlı projelerini Proje Geçmişi düğmesinden açabilirsin.';
    const svg=byId('m2LayoutSvg');
    if(picking && svg)svg.querySelectorAll('[data-rack] > .m2-layout-rack').forEach(rect=>rect.classList.toggle('selected',ids.has(Number(rect.parentElement.dataset.rack))));
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;syncUi();});}
  function separate(){
    const selection=chosen();if(!selection.some(r=>core.linked(r,racks()))){status('Ayırmak için birleşik bir blok seç.');return;}
    m2PushUndo('Seçili blokları ayır');
    const result=core.separate(racks(),selection.map(r=>r.id));
    result.groups.forEach(group=>m2NormalizeJoinComponents(group));
    for(const rack of selection){
      if(typeof m2PinnedDimensionsByRack!=='undefined')delete m2PinnedDimensionsByRack[String(rack.id)];
    }
    render();status(result.count+' blok ortak ayak bağlantılarından ayrıldı. Bağımsız olarak taşıyabilirsin.');
  }
  const baseOpen=window.m2OpenCustomizeModal;
  function open(id){
    const rack=racks().find(r=>Number(r.id)===Number(id));if(!rack)return;
    const selected=chosen(),targets=selected.length>1 && selected.some(r=>r.id===rack.id)?selected:[rack];
    if(targets.length>1 && !targets.every(r=>core.sameType(rack,r))){status('Toplu özelleştirme için aynı raf tipindeki blokları seç.');return;}
    batch={sourceId:rack.id,ids:targets.map(r=>r.id),before:core.clone(racks())};
    document.querySelectorAll('.rafex-mr-batch-fields').forEach(node=>node.remove());
    const result=baseOpen.call(this,id);
    if(core.system(rack)==='mr' && targets.length>1)setupMrBatch(rack);
    const modal=[byId('rafexLaneCustomizeV115'),byId('rafexKonsolCustomizeV114'),byId('m2CustomizeModal')].find(n=>n&&!n.hidden);
    if(modal){
      let note=modal.querySelector('.rafex-batch-note-v145');
      if(!note){note=document.createElement('p');note.className='rafex-batch-note-v145';(modal.querySelector('aside,.rsv115-fields')||modal.firstElementChild).prepend(note);}
      note.textContent=targets.length>1?targets.length+' seçili blok düzenleniyor. Değişiklikler yalnızca bu bloklara uygulanır.':'Yalnızca seçilen blok düzenleniyor.';
    }
    return result;
  }
  function finish(modal){
    if(!batch || !modal?.hidden)return;
    const context=batch;batch=null;
    if(context.ids.length<2)return;
    core.commit(racks(),context.before,context.ids,context.sourceId);
    for(const id of context.ids){
      const rack=racks().find(r=>r.id===id);if(!rack)continue;
      const bad=!m2RackInsideArea(rack)||m2RackOverlaps(rack);
      rack.freePlacement=bad;rack.staged=bad;rack.locked=!bad;
    }
    if(picking)ids=new Set(context.ids);
    render();status(context.ids.length+' seçili blok güncellendi. Seçilmeyen bloklar korunuyor.');
  }
  const baseApply=window.m2ApplyRackCustomization;
  function apply(){const result=baseApply.apply(this,arguments);finish(byId('m2CustomizeModal'));return result;}
  window.m2OpenCustomizeModal=open;window.m2ApplyRackCustomization=apply;window.m2SeparateSelectedRack=separate;
  try{m2OpenCustomizeModal=open;m2ApplyRackCustomization=apply;m2SeparateSelectedRack=separate;}catch(_){}

  function setupMrBatch(rack){
    const modal=byId('m2CustomizeModal'),aside=modal?.querySelector('aside');if(!aside)return;
    const title=aside.querySelector('.m2-customize-head b'),description=aside.querySelector('.m2-customize-head small');
    if(title)title.textContent='MR Toplu Özelleştir';if(description)description.textContent='Kaydettiğin ölçüler yalnız seçili MR bloklarına uygulanır.';
    aside.querySelector('.rafex-mr-batch-fields')?.remove();
    const b=rack.b2b||{},box=document.createElement('form');box.className='rafex-mr-batch-fields';
    const fields=[['width','Net raf genişliği (mm)',b.width||rack.b2bLayout?.sectionWidth||rack.palW,100],['depth','Raf derinliği (mm)',b.depth||rack.palD,100],['levels','Kat sayısı',rack.levels||b.levels,1],['firstTraverse','İlk kat yüksekliği (mm)',b.firstTraverse??rack.firstRailHeight??200,0],['levelGap','Kat arası mesafe (mm)',b.levelGap||rack.levelH||1000,1],['uprightHeight','Ayak yüksekliği (mm)',b.uprightHeight||rack.sideUprightHeight||4000,100]];
    for(const [key,label,value,min]of fields){const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.name=key;input.type='number';input.min=String(min);input.max=key==='levels'?'15':'30000';input.step='1';input.required=true;input.value=String(value||min);l.appendChild(input);box.appendChild(l);}
    const save=document.createElement('button');save.type='submit';save.textContent='Seçili bloklara uygula';box.appendChild(save);aside.appendChild(box);
    box.onsubmit=event=>{
      event.preventDefault();if(!box.reportValidity()||!batch)return;
      const v=Object.fromEntries(fields.map(([key])=>[key,Number(box.elements.namedItem(key).value)]));
      if(v.firstTraverse+(v.levels-1)*v.levelGap>v.uprightHeight){status('Son kat ayak yüksekliğini aşıyor. Kat aralığını veya ayak yüksekliğini düzelt.');return;}
      m2PushUndo('MR toplu özelleştirme');
      const foot=Number(b.uprightWidth)||60,modules=Number(b.modules)||1,rows=Number(rack.b2bLayout?.rowCount)||1,gap=Number(rack.b2bLayout?.rowGap)||0;
      Object.assign(rack.b2b,v);Object.assign(rack.b2bLayout,{sectionWidth:v.width,palletWidth:v.width,palletDepth:v.depth,frameDepth:v.depth});
      rack.levels=v.levels;rack.palW=v.width;rack.palD=v.depth;rack.firstRailHeight=v.firstTraverse;rack.levelH=v.levelGap;
      rack.sideUprightHeight=v.uprightHeight;rack.totalRackHeight=v.uprightHeight;rack.widthMm=modules*v.width+(modules+1)*foot;rack.totalWidth=rack.widthMm;
      rack.depthMm=rows*v.depth+(rows-1)*gap;rack.railLength=rack.depthMm;rack.w=rack.widthMm*m2LayoutState.scale;rack.h=rack.depthMm*m2LayoutState.scale;
      rack.b2bLayout.footprintDepth=rack.depthMm;rack.plan={...(rack.plan||{}),feet:[v.depth],mr:true};
      window.rafexCloseMrCustomizeV37?.();modal.hidden=true;finish(modal);
    };
  }
  document.addEventListener('keydown',event=>{
    if(!common())return;
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='q'){
      event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)start();return;
    }
    if(event.key==='Escape'&&picking){event.preventDefault();event.stopImmediatePropagation();stop();}
  },true);
  window.addEventListener('pointerdown',event=>{
    if(!common()||!picking||!event.target.closest?.('#m2LayoutSvg')||event.button!==0)return;
    event.preventDefault();event.stopImmediatePropagation();
    const node=event.target.closest('[data-rack]') || document.elementsFromPoint(event.clientX,event.clientY).map(n=>n.closest?.('#m2LayoutSvg [data-rack]')).find(Boolean);if(!node)return;
    const id=Number(node.dataset.rack);if(!racks().some(r=>r.id===id))return;
    if(ids.has(id))ids.delete(id);else ids.add(id);
    m2LayoutState.drag=null;render();status(ids.size+' blok seçili. Seçim için tıklamaya devam et; Esc ile bitir.');
  },true);
  document.addEventListener('click',event=>{
    if(!common())return;
    if(event.target.closest?.('#m2CustomizeRackButton')){
      const selected=chosen();if(!selected.length)return;
      event.preventDefault();event.stopImmediatePropagation();open(selected[0].id);return;
    }
    if(event.target.closest?.('#m2SeparateRackButton')){event.preventDefault();event.stopImmediatePropagation();separate();return;}
  },true);
  // Run after the modal's own save handler. A microtask from a capture listener
  // may run before the target handler, while the modal is still open.
  document.addEventListener('click',event=>{
    const save=event.target.closest?.('#rafexKonsolCustomizeV114 [data-rkc-save],#rafexLaneCustomizeV115 [data-save]');
    if(common()&&save)finish(save.closest('#rafexKonsolCustomizeV114,#rafexLaneCustomizeV115'));
  });
  // Only react to structural changes. Attribute/style updates from selection
  // must not start another render/observer cycle.
  new MutationObserver(records=>{if(records.some(r=>r.addedNodes.length))schedule();}).observe(document.body,{childList:true,subtree:true});
  const baseRender=window.m2RenderLayout;
  if(typeof baseRender==='function'){
    const wrapped=function(){syncSelection();const result=baseRender.apply(this,arguments);syncUi();return result;};
    window.m2RenderLayout=wrapped;try{m2RenderLayout=wrapped;}catch(_){}
  }
  syncUi();
})();
