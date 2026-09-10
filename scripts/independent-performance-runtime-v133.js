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
  const baseTypes=m2RenderSavedRackTypes;
  m2RenderSavedRackTypes=function(){
    if(window.rafexProjectTypesV133&&document.querySelector('#nav button.active[data-page]')?.dataset.page==='free')m2SavedRackTypes=structuredClone(window.rafexProjectTypesV133);
    return baseTypes.apply(this,arguments);
  };
  window.m2RenderSavedRackTypes=m2RenderSavedRackTypes;
  m2ApplyProjectRecord=function(project,asCopy){
    if(document.querySelector('#nav button.active[data-page]')?.dataset.page==='free'||project?.module==='ortak'||project?.payload?.rafexCommonDrawing){
      project=structuredClone(project);
      if(asCopy||!project.payload.projectIdentity){
        const uuid=crypto.randomUUID();
        project.payload.projectIdentity={uuid,independent:true,createdAt:new Date().toISOString(),displayNumber:asCopy||!project.serial_no?'P-'+uuid.replaceAll('-','').slice(0,12).toUpperCase():'K-'+String(project.serial_no).padStart(4,'0')};
      }
    }
    const isolated=project?.payload?.projectIdentity?.independent;
    window.rafexProjectIdentityV133=isolated?structuredClone(project.payload.projectIdentity):null;
    window.rafexProjectTypesV133=isolated?structuredClone(project.payload.rackTypes||[]):null;
    window.rafexActivateProjectV134?.(window.rafexProjectIdentityV133);
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
  window.rafexStartNewProjectV133=function(){
    const nameInput=document.getElementById('rafexAuthorityProjectName')||document.getElementById('m2ProjectName');
    const projectName=String(nameInput?.value||'').trim();
    if(!projectName){
      if(nameInput){nameInput.setCustomValidity('Önce proje adını yaz.');nameInput.reportValidity();nameInput.focus();}
      window.rafexSyncProjectGateV134?.();return;
    }
    nameInput.setCustomValidity('');
    if(window.rafexProjectSavingV133||window.__rafexManualOutputBuild){
      document.getElementById('m2FloorStatus').textContent='Devam eden kayıt veya çıktı işlemi tamamlanınca yeni proje açabilirsin.';return;
    }
    const fresh=window.rafexIndependentProjectV133({payload:{rackTypes:m2SavedRackTypes,layout:{racks:[]}}},crypto.randomUUID(),Date.now());
    window.rafexProjectIdentityV133=fresh.payload.projectIdentity;
    window.rafexProjectIdentityV133.displayNumber='P-'+fresh.payload.projectIdentity.uuid.replaceAll('-','').slice(0,12).toUpperCase();
    window.rafexProjectTypesV133=fresh.payload.rackTypes;
    window.rafexActivateProjectV134?.(window.rafexProjectIdentityV133);
    m2LayoutState={mode:'idle',points:[],pathBreaks:[],closed:false,openFinished:false,areaEditMode:false,drawFromIndex:null,branchSourceIndex:null,racks:[],selected:null,pinnedRackId:null,drag:null,hover:null,scale:.04,showAreaDimensions:false,edgeDimensions:[]};
    m2LayoutSymbols=[];m2UserNotes=[];m2LayoutTool=null;
    m2DimensionOffsets={};m2DimensionFontSizes={};m2HiddenSummaryDimensions=new Set();
    m2VisibleRackDimensions={length:new Set(),depth:new Set()};m2ClearPinnedDimensions();
    m2FreeMeasure={points:[],hover:null};m2ShowSharedFootLabels=false;m2EdgeEditorVisible=false;
    m2PendingMeasureApply=null;m2LastRackTap={id:null,at:0};m2SeismicChoice='light';
    m2ReportImages=Array(4).fill(null);if(m2ReportRefreshTimer!=null){clearTimeout(m2ReportRefreshTimer);m2ReportRefreshTimer=null;}
    if(m2SavedTypeClickTimer!=null){clearTimeout(m2SavedTypeClickTimer);m2SavedTypeClickTimer=null;}
    resetSession();m2SetAutoFillControlsActive(false);
    for(const id of ['rafexAuthorityProjectName','rafexCommonProjectName','m2ProjectName']){
      const input=document.getElementById(id);if(input){input.value=projectName;input.dispatchEvent(new Event('input',{bubbles:true}));}
    }
    for(const id of ['m2AreaW','m2AreaH','m2SegmentLength','m2DimensionFontSize','m2AnnotationFontSize','m2AutoFillLength']){
      const input=document.getElementById(id);if(input)input.value=input.defaultValue;
    }
    for(const id of ['m2CorporatePreview','m2ReportFronts','m2ReportSides','m2ReportFloor','m2ReportPalletSpec'])document.getElementById(id)?.replaceChildren();
    const panel=document.querySelector('.m2-report-panel');if(panel)panel.dataset.rafexOutputVisible='0';
    window.__rafexFreeOutputDirty=true;
    const output=document.getElementById('m2CreateOutputButton');if(output)output.textContent='Çıktıyı Oluştur';
    const saveMessage=document.getElementById('m2ProjectSaveMsg');if(saveMessage)saveMessage.textContent='';
    m2RenderReportImages();m2SelectedSavedType=fresh.payload.rackTypes.length?0:null;m2RenderSavedRackTypes();
    m2LayoutZoom=1;m2ZoomLayout(0,true);m2RenderLayout();
    document.getElementById('m2FloorStatus').textContent=projectName+' açıldı. Alanı oluşturup çizime başlayabilirsin.';
    window.rafexSyncProjectGateV134?.();
  };
  function installButton(){
    const save=document.getElementById('m2ProjectSaveButton');
    const identity=window.rafexProjectIdentityV133,name=document.getElementById('rafexAuthorityProjectName');
    let info=document.getElementById('rafexIndependentProjectInfoV133');
    if(identity&&name){
      if(!info){info=document.createElement('small');info.id='rafexIndependentProjectInfoV133';name.insertAdjacentElement('afterend',info);}
      info.dataset.projectUuid=identity.uuid;info.title=identity.uuid;
      const text='Proje · '+new Date(identity.createdAt).toLocaleString('tr-TR');if(info.textContent!==text)info.textContent=text;
    }else if(info)info.remove();
    document.getElementById('rafexIndependentSaveV133')?.remove();
    const field=name?.closest('label'),existing=document.getElementById('rafexNewProjectV133');
    if(existing){if(field&&existing.nextElementSibling!==field)field.insertAdjacentElement('beforebegin',existing);return;}
    if(!save)return;
    const button=document.createElement('button');button.id='rafexNewProjectV133';button.type='button';button.className=save.className;
    button.textContent='Yeni proje aç';button.title='Boş çizim alanı ve yeni proje kimliğiyle başla';
    button.style.whiteSpace='nowrap';button.style.flexShrink='0';button.addEventListener('click',window.rafexStartNewProjectV133);
    if(field)field.insertAdjacentElement('beforebegin',button);else save.insertAdjacentElement('beforebegin',button);
  }
  // Page navigation replaces the editor, so install on those bounded events.
  document.addEventListener('click',event=>{if(event.target.closest('#nav button,.rafex-system-option,#rafexUnifiedContinue')){requestAnimationFrame(installButton);setTimeout(installButton,250);setTimeout(installButton,1000);}},true);
  const baseRender=m2RenderLayout;
  m2RenderLayout=function(){const result=baseRender.apply(this,arguments);installButton();return result;};
  window.m2RenderLayout=m2RenderLayout;
  installButton();
})();
