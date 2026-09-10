(function(){
  const markup = new WeakMap();
  window.rafexCommitLayoutV133=function(layer,html){
    const old=new Map(Array.from(layer.querySelectorAll('[data-rack]')).map(node=>[node.dataset.rack,node]));
    const retained=[],freshMarkup=new Map(),parts=[];
    const starts=/<g\s+data-rack="([^"]+)"[^>]*>/g;
    let last=0,match;
    // Rack groups may contain nested SVG groups. Only replace whole balanced
    // groups, leaving walls, measurements and symbols to their existing renderer.
    while((match=starts.exec(html))){
      const tags=/<\/?g(?=[\s>])[^>]*>/g;tags.lastIndex=starts.lastIndex;
      let depth=1,tag;
      while(depth&&(tag=tags.exec(html)))depth+=tag[0].startsWith('</')?-1:tag[0].endsWith('/>')?0:1;
      if(depth)break;
      const end=tags.lastIndex,raw=html.slice(match.index,end),previous=old.get(match[1]);
      const transform=(match[0].match(/\btransform="([^"]*)"/)||[])[1]||'';
      parts.push(html.slice(last,match.index));
      if(previous&&markup.get(previous)===raw&&(previous.getAttribute('transform')||'')===transform){
        parts.push('<g data-rafex-retain-v133="'+retained.length+'"></g>');retained.push(previous);
      }else{parts.push(raw);freshMarkup.set(match[1],raw);}
      last=end;starts.lastIndex=end;
    }
    parts.push(html.slice(last));
    const buffer=document.createElementNS('http://www.w3.org/2000/svg','g');buffer.innerHTML=parts.join('');
    for(const placeholder of buffer.querySelectorAll('[data-rafex-retain-v133]'))placeholder.replaceWith(retained[Number(placeholder.dataset.rafexRetainV133)]);
    for(const fresh of buffer.querySelectorAll('[data-rack]'))if(freshMarkup.has(fresh.dataset.rack))markup.set(fresh,freshMarkup.get(fresh.dataset.rack));
    layer.replaceChildren(...buffer.childNodes);
    window.rafexLayoutCommitStatsV133={retained:retained.length,total:old.size};
  };
  function resetSession(){
    m2UndoHistory=[];m2UpdateUndoButton();m2ClearMultiSelection();
    m2LayoutState.selected=null;m2LayoutState.drag=null;m2LayoutState.hover=null;
    m2CustomizeMode=false;m2CustomizeRackId=null;m2CopyMode=false;
    m2JoinMode=false;m2JoinFirstRackId=null;m2AutoFillDraft=null;
    m2SelectedSymbolId=null;m2SymbolDrag=null;m2NoteDrag=null;m2SelectedNoteId=null;
    m2SelectedDimensionKey=null;m2DimensionDrag=null;m2ProtectionDraft=null;m2SeismicDraft=null;
    if(typeof m2LayoutRenderFrame!=='undefined'&&m2LayoutRenderFrame!=null){cancelAnimationFrame(m2LayoutRenderFrame);m2LayoutRenderFrame=null;}
    if(typeof m2LayoutRuntimeCache!=='undefined'){
      for(const value of Object.values(m2LayoutRuntimeCache)){if(value instanceof Map||value instanceof Set)value.clear();else if(value&&typeof value==='object'){if('signature' in value)value.signature='';if(value.values instanceof Map)value.values.clear();}}
      m2LayoutRuntimeCache.frameCache.key='';m2LayoutRuntimeCache.frameCache.rackId=null;
    }
    if(typeof m2PerfDistanceIndex!=='undefined')m2PerfDistanceIndex.signature='';
  }
  const baseApply=m2ApplyProjectRecord;
  m2ApplyProjectRecord=function(project,asCopy){
    const isolated=project?.payload?.projectIdentity?.independent;
    window.rafexProjectIdentityV133=isolated?structuredClone(project.payload.projectIdentity):null;
    window.rafexProjectTypesV133=isolated?structuredClone(project.payload.rackTypes||[]):null;
    resetSession();
    const result=baseApply.call(this,structuredClone(project),asCopy);
    // Restore the project name in the common editor's own controller.
    const name=document.getElementById('rafexAuthorityProjectName');
    if(name){name.value=project.project_name+(asCopy?' - Kopya':'');name.dispatchEvent(new Event('input',{bubbles:true}));}
    return result;
  };
  window.m2ApplyProjectRecord=m2ApplyProjectRecord;
  window.rafexOpenIndependentV133=function(record){
    m2ApplyProjectRecord({project_name:record.projectName,module:record.module,payload:record.payload},false);
    document.getElementById('m2FloorStatus').textContent='Bağımsız proje açıldı. '+record.payload.projectIdentity.createdAt+' · '+record.payload.projectIdentity.uuid;
  };
  function installButton(){
    const save=document.getElementById('m2ProjectSaveButton');
    if(!save||document.getElementById('rafexIndependentSaveV133'))return;
    const button=document.createElement('button');button.id='rafexIndependentSaveV133';button.type='button';button.className=save.className;
    button.textContent='Yeni proje olarak kaydet';button.title='Çizimi bağımsız kimliklerle kaydet ve yeni kaydı aç';
    button.addEventListener('click',()=>m2SaveProject(true));save.insertAdjacentElement('afterend',button);
  }
  // Page navigation replaces the editor, so install on those bounded events.
  document.addEventListener('click',event=>{if(event.target.closest('#nav button,.rafex-system-option,#rafexUnifiedContinue'))requestAnimationFrame(installButton);},true);
  const baseRender=m2RenderLayout;
  m2RenderLayout=function(){const result=baseRender.apply(this,arguments);installButton();return result;};
  window.m2RenderLayout=m2RenderLayout;
  installButton();
})();
