(function(){
  const clone=value=>JSON.parse(JSON.stringify(value));
  const common=()=>document.querySelector('#nav button.active[data-page]')?.dataset.page==='free';
  const sessions=new Map();let documentState=null,owner=null,restoring=false,output=false,preparedSignature=null;
  function outputSignature(){
    if(!documentState)return null;
    const live=capture();
    const areas=documentState.areas.map(area=>{
      const layout={...(area.id===documentState.activeAreaId?live:area.layout)};
      for(const key of ['mode','drag','hover','selected','pinnedRackId','areaEditMode','drawFromIndex','branchSourceIndex','scale','areaZoom'])delete layout[key];
      return {id:area.id,name:area.name,layout};
    });
    return JSON.stringify({owner,areas});
  }
  window.rafexAreaOutputIsCurrent=()=>common()&&preparedSignature!==null&&preparedSignature===outputSignature();
  function capture(){
    const s=m2UndoSnapshot();
    return {...s.layout,symbols:s.symbols,userNotes:s.notes,dimensionOffsets:s.dimensionOffsets,dimensionFontSizes:s.dimensionFontSizes,hiddenSummaryDimensions:s.hidden,visibleRackDimensions:s.visible,pinnedDimensionsByRack:s.pinned,pinnedDimensions:{...m2PinnedDimensions},freeMeasure:s.freeMeasure,
      areaWidth:document.getElementById('m2AreaW')?.value,areaDepth:document.getElementById('m2AreaH')?.value,areaZoom:m2LayoutZoom};
  }
  function current(){return documentState?.areas.find(a=>a.id===documentState.activeAreaId);}
  function remember(){if(current())current().layout=capture();}
  function ensure(){
    if(!common()||restoring)return;
    const key=window.rafexProjectIdentityV133?.uuid||'unopened';
    if(owner!==key){owner=key;documentState=sessions.get(key);if(!documentState){const id=crypto.randomUUID();documentState={activeAreaId:id,areas:[{id,name:'1. Alan',layout:capture()}]};sessions.set(key,documentState);}}
  }
  function restore(layout,paint=true){
    const v=clone(layout);restoring=true;
    try{
      m2LayoutState={...v,mode:'idle',drag:null,hover:null,selected:null,areaEditMode:false,drawFromIndex:null,branchSourceIndex:null};
      m2LayoutSymbols=v.symbols||[];m2UserNotes=v.userNotes||[];
      m2DimensionOffsets=v.dimensionOffsets||{};m2DimensionFontSizes=v.dimensionFontSizes||{};
      m2HiddenSummaryDimensions=new Set(v.hiddenSummaryDimensions||[]);m2VisibleRackDimensions={length:new Set(v.visibleRackDimensions?.length||[]),depth:new Set(v.visibleRackDimensions?.depth||[])};
      m2PinnedDimensionsByRack=v.pinnedDimensionsByRack||{};m2PinnedDimensions={...m2EmptyPinnedDimensions(),...v.pinnedDimensions};m2FreeMeasure=v.freeMeasure||{points:[],hover:null};
      m2LayoutZoom=v.areaZoom||1;m2LayoutTool=null;m2DimensionDrag=null;m2PendingMeasureApply=null;m2SelectedSymbolId=null;m2SelectedNoteId=null;m2SelectedDimensionKey=null;m2SymbolDrag=null;m2NoteDrag=null;m2JoinMode=false;m2JoinFirstRackId=null;m2CustomizeMode=false;m2CustomizeRackId=null;m2UndoHistory=[];m2ClearMultiSelection();
      for(const [id,value] of [['m2AreaW',v.areaWidth],['m2AreaH',v.areaDepth]])if(value!=null&&document.getElementById(id))document.getElementById(id).value=value;
      if(paint){m2RenderLayout();m2RenderLayoutProductList();m2UpdateUndoButton();}
    }finally{restoring=false;}
  }
  function invalidate(){if(output)return;preparedSignature=null;const p=document.querySelector('.m2-report-panel');if(p){p.dataset.rafexOutputVisible='0';delete p.dataset.rafexReadyV136;}window.__rafexFreeOutputDirty=true;}
  function select(id){if(output||window.rafexProjectSavingV133)return;ensure();if(!documentState.areas.some(a=>a.id===id)||id===documentState.activeAreaId)return;remember();documentState.activeAreaId=id;restore(current().layout);draw();invalidate();}
  function rename(id,value){const a=documentState.areas.find(a=>a.id===id);if(!a)return;const name=String(value).trim().slice(0,100);if(name)a.name=name;draw();invalidate();}
  function add(){
    if(output||window.rafexCanEditProjectV134?.()===false)return;ensure();remember();
    const id=crypto.randomUUID(),name=(documentState.areas.length+1)+'. Alan';
    const layout={mode:'idle',points:[],pathBreaks:[],closed:false,openFinished:false,racks:[],scale:.04,showAreaDimensions:false,edgeDimensions:[],symbols:[],userNotes:[],areaWidth:'50000',areaDepth:'30000',areaZoom:1};
    documentState.areas.push({id,name,layout});documentState.activeAreaId=id;restore(layout);draw();invalidate();
  }
  function draw(){
    if(!common()||!documentState||output)return;
    const tools=document.querySelector('.m2-tool-group.area-tools');if(!tools)return;
    let button=document.getElementById('rafexAddArea');if(!button){button=document.createElement('button');button.id='rafexAddArea';button.type='button';button.textContent='+ Yeni Bölüm Ekle';button.addEventListener('click',add);tools.appendChild(button);}
    let list=document.getElementById('rafexAreaList');if(!list){list=document.createElement('div');list.id='rafexAreaList';}if(list.previousElementSibling!==button)button.insertAdjacentElement('afterend',list);
    const signature=JSON.stringify(documentState.areas.map(a=>[a.id,a.name]))+documentState.activeAreaId;
    if(list.dataset.signature!==signature){list.dataset.signature=signature;list.replaceChildren();
      documentState.areas.forEach((a,index)=>{const row=document.createElement('div');row.className='rafex-area-row';row.classList.toggle('active',a.id===documentState.activeAreaId);const open=document.createElement('button');open.type='button';open.textContent=(index+1)+'. Alanı Aç';open.setAttribute('aria-pressed',String(a.id===documentState.activeAreaId));open.addEventListener('click',()=>select(a.id));const input=document.createElement('input');input.dataset.areaId=a.id;input.value=a.name;input.maxLength=100;input.setAttribute('aria-label',(index+1)+'. alan adı');input.title='Alan adını değiştirmek için yazın';input.addEventListener('change',()=>rename(a.id,input.value));input.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();input.blur();}});row.append(open,input);list.appendChild(row);});
    }
    const floor=document.getElementById('m2LayoutSvg')?.closest('.m2-floor-editor');const heading=floor?.querySelector('.m2-floor-head h3');
    if(heading)heading.textContent='Serbest Yerleşim Alanı · '+current().name;
  }
  window.rafexAreaDocument=()=>{ensure();remember();return documentState?clone(documentState):null;};
  window.rafexAttachAreas=record=>{if(!common())return record;const state=window.rafexAreaDocument();record.payload.areas=state.areas;record.payload.activeAreaId=state.activeAreaId;record.payload.layout=clone(current().layout);record.payload.drawing=state.areas.flatMap(a=>a.layout.racks||[])[0]||record.payload.drawing;return record;};
  window.rafexRenderAreaOutput=async(target,render)=>{
    if(!common()){await render();return;}
    ensure();remember();const active=documentState.activeAreaId,areas=clone(documentState.areas),fragments=[],plans=[],details=[],sharedSections=[],undo=m2UndoHistory;let cover=null;output=true;preparedSignature=null;
    const page=document.getElementById('page'),nav=document.getElementById('nav');page?.setAttribute('inert','');nav?.setAttribute('inert','');
    try{
      for(const area of areas){
        documentState.activeAreaId=area.id;restore(area.layout);await render({sections:false});
        const copy=document.createElement('div');copy.innerHTML=target.innerHTML;
        copy.querySelectorAll('.m2-corporate-page').forEach(section=>{section.dataset.rafexArea=area.id;const title=section.querySelector('.m2-corporate-page-header');if(title){const label=document.createElement('b');label.className='rafex-area-report-name';label.textContent=area.name;title.appendChild(label);}else{const subtitle=section.querySelector('.m2-corporate-cover-content p');if(subtitle)subtitle.textContent=area.name;}});
        if(!copy.querySelector('.m2-corporate-page')){const title=document.createElement('h3');title.textContent=area.name;copy.prepend(title);}
        window.rafexNamespaceAreaSvg(copy,'area-'+area.id);
        const pages=[...copy.querySelectorAll(':scope>.m2-corporate-page')];
        if(!pages.length)fragments.push(...copy.childNodes);
        else for(const section of pages){
          if(section.matches('.rafex-v19-type-page')||section.querySelector('.rafex-v19-type-card,.m2-corporate-type-grid'))continue;
          if(section.querySelector('.m2-corporate-cover-content')){if(!cover)cover=section;continue;}
          if(section.querySelector('.m2-corporate-floor'))plans.push(section);else details.push(section);
        }
      }
      if(plans.length){
        // Render the shared catalog against all placed racks once. Only section
        // pages are retained; each area's quantities remain in its own report.
        const layout={...areas[0].layout,racks:areas.flatMap(area=>area.layout.racks||[])};
        restore(layout);await render();
        const copy=document.createElement('div');copy.innerHTML=target.innerHTML;
        cover=copy.querySelector(':scope>.m2-corporate-cover')||cover;
        if(cover){cover.dataset.rafexArea='shared';const subtitle=cover.querySelector('.m2-corporate-cover-content p');if(subtitle)subtitle.textContent=areas.map(area=>area.name).join(' · ');}
        for(const section of copy.querySelectorAll(':scope>.rafex-v19-type-page')){
          section.dataset.rafexArea='shared';
          section.querySelectorAll('.rafex-area-report-name').forEach(label=>label.remove());
          sharedSections.push(section);
        }
        window.rafexNamespaceAreaSvg(copy,'shared-sections');
        fragments.push(...(cover?[cover]:[]),...plans,...sharedSections,...details);
      }else if(details.length||cover)fragments.push(...(cover?[cover]:[]),...details);
    }finally{
      try{documentState.activeAreaId=active;restore(current().layout);m2UndoHistory=undo;m2UpdateUndoButton();}
      finally{output=false;page?.removeAttribute('inert');nav?.removeAttribute('inert');draw();}
    }
    target.replaceChildren(...fragments);
    const pages=[...target.querySelectorAll('.m2-corporate-page')];pages.forEach((page,index)=>{let footer=page.querySelector('.m2-corporate-page-footer');if(!footer){footer=document.createElement('footer');footer.className='m2-corporate-page-footer';page.appendChild(footer);}footer.textContent=(index+1)+' / '+pages.length;});
    preparedSignature=outputSignature();
  };
  // A late refresh from restoring the active area must not hide a completed report.
  // Real user edits (including section camera settings) re-enable invalidation.
  for(const eventName of ['pointerdown','input','change'])document.addEventListener(eventName,event=>{
    if(event.isTrusted&&!output&&(eventName!=='pointerdown'||event.target.closest?.('button,input,select,textarea,.rafex-placement-stage')))preparedSignature=null;
  },true);
  const render=m2RenderLayout;m2RenderLayout=function(){const result=render.apply(this,arguments);if(!restoring){ensure();draw();}return result;};window.m2RenderLayout=m2RenderLayout;
  const apply=m2ApplyProjectRecord;m2ApplyProjectRecord=function(project,asCopy){restoring=true;let result;try{result=apply.apply(this,arguments);}finally{restoring=false;}if(common()){owner=window.rafexProjectIdentityV133?.uuid||'unopened';const payload=project.payload;if(payload.areas?.length){documentState=clone({areas:payload.areas,activeAreaId:payload.activeAreaId||payload.areas[0].id});if(!current())documentState.activeAreaId=documentState.areas[0].id;sessions.set(owner,documentState);restore(current().layout);}else{documentState=null;sessions.delete(owner);owner=null;ensure();}draw();}return result;};window.m2ApplyProjectRecord=m2ApplyProjectRecord;
  const navigate=showPage;showPage=function(){if(common()&&documentState&&!restoring)remember();const result=navigate.apply(this,arguments);ensure();draw();return result;};window.showPage=showPage;
  const validate=m2ProjectPlacementError;m2ProjectPlacementError=function(){if(!common()||!documentState)return validate.apply(this,arguments);remember();const saved=capture();try{for(const area of documentState.areas){m2LayoutState=clone(area.layout);const error=validate();if(error)return area.name+': '+error;}return '';}finally{m2LayoutState=saved;}};
  document.addEventListener('input',event=>{const input=event.target;if(!input.matches?.('#rafexAreaList input'))return;const a=documentState?.areas.find(a=>a.id===input.dataset.areaId);if(a){a.name=input.value.trim().slice(0,100)||a.name;const list=input.closest('#rafexAreaList');list.dataset.signature=JSON.stringify(documentState.areas.map(a=>[a.id,a.name]))+documentState.activeAreaId;invalidate();}},true);
  document.addEventListener('click',event=>{if(event.target.closest?.('.rafex-system-option,#rafexNewProjectV133'))setTimeout(()=>{ensure();draw();},0);});
  const style=document.createElement('style');style.textContent=`
    #rafexAddArea{flex-basis:100%;margin-bottom:0}
    #rafexAreaList{display:grid;gap:5px;flex:0 0 100%;width:100%;min-width:0;align-self:flex-start;align-content:start;max-height:192px;overflow-y:auto}
    #rafexAreaList .rafex-area-row{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:6px;padding:4px;border:1px solid #d5dfd9;border-radius:7px;min-height:0}
    #rafexAreaList .rafex-area-row.active{border-color:#214f3b;background:#eef5f0}
    #rafexAreaList .rafex-area-row>button,#rafexAreaList .rafex-area-row>input{box-sizing:border-box;height:32px;min-height:32px;max-height:32px;width:auto;min-width:0;margin:0;padding:5px 8px;font:inherit;font-size:12px;line-height:20px}
    #rafexAreaList .rafex-area-row>input{width:100%;border:1px solid #d5dfd9;border-radius:6px;background:#fff}
    .m2-floor-tools{grid-template-columns:minmax(240px,1fr) minmax(280px,1.2fr) minmax(220px,1fr);align-items:start}
    .m2-floor-tools>.measure-tools{order:1;grid-column:auto;justify-content:center;align-content:flex-start}
    .m2-floor-tools>.rack-tools{order:2}
    .m2-floor-tools>.measure-tools>.m2-tool-group-title{text-align:center}
    @media(max-width:1150px){.m2-floor-tools{grid-template-columns:repeat(2,minmax(0,1fr))}.m2-floor-tools>.rack-tools{grid-column:1/-1}}
    @media(max-width:750px){.m2-floor-tools{grid-template-columns:minmax(0,1fr)}.m2-floor-tools>.rack-tools{grid-column:auto}}
    .rafex-area-report-name{margin-left:auto;padding:4px 10px;color:#fff;max-width:45%;white-space:normal}
  `;document.head.appendChild(style);
  ensure();draw();
})();


