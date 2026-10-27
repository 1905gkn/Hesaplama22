export function transform(html){
 if(html.includes('data-reliable-drafts="v407"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Draft v407 anchor missing: '+a.slice(0,90));html=html.replace(a,b);};
 replace('ayak(?: takimi)?|konsol ayak|h[ -]?travers','ayak(?: takimi)?|mr ayak toplama|konsol ayak|h[ -]?travers');
 // Read the area session without remember()/undo, which normalizes imported CAD.
 replace('  window.rafexAreaDocument=()=>{ensure();remember();return documentState?clone(documentState):null;};',`  window.rafexRawDraftAreasV407=layout=>{
    const key=window.rafexProjectIdentityV133?.uuid||'unopened',source=owner===key?documentState:sessions.get(key);
    const state=source?clone(source):{activeAreaId:'draft-area',areas:[{id:'draft-area',name:'1. Alan',layout:{}}]};
    const active=state.areas.find(a=>a.id===state.activeAreaId);if(active)active.layout=clone(layout);return state;
  };
  window.rafexRestoreDraftAreasV407=state=>{
    owner=window.rafexProjectIdentityV133.uuid;documentState=clone(state);sessions.set(owner,documentState);
    restore(current().layout,false,true);if(current().layout.editorViewportV258)window.rafexCommonLayoutZoomCrispV126?.setView(current().layout.editorViewportV258);draw();invalidate();m2RenderLayout();
  };
  window.rafexAreaDocument=()=>{ensure();remember();return documentState?clone(documentState):null;};`);
 html=html.replaceAll('window.rafexCadDistancesV363?.normalize(m2LayoutSymbols);','if(!m2LayoutState.draftExactGeometryV407)window.rafexCadDistancesV363?.normalize(m2LayoutSymbols);');
 replace('  function restore(layout,paint=true){','  function restore(layout,paint=true,exactDraft=false){');
 replace('    for(const rack of v.racks||[]){const entry=types.find', '    for(const rack of exactDraft?[]:(v.racks||[])){const entry=types.find');
 replace("    if(!drawing&&!types.length&&!m2LayoutState.racks?.length)return null;",'    // Partial boundaries, CAD and invalid drawings are valid draft contents.');
 replace('      async function m2SaveProject() {','      async function m2SaveProject() {');
 const start=html.indexOf('/* separate-local-drafts-v241 */'),end=html.indexOf('</script>',start);
 let script=html.slice(start,end);
 script=script.replace('  function backup(){','  function backup(manual=false){');
 script=script.replace('let code=codes.get(scope);','let code=manual?null:codes.get(scope);');
 script=script.replace('codes.set(scope,code);','if(!manual)codes.set(scope,code);');
 script=script.replace('if(existing&&!await backup())','if(existing&&!await backup(true))');
 script=script.replace("return task.catch(error=>{notice('TASLAK YEDEĞİ OLUŞTURULAMADI:","return task.catch(error=>{if(manual){download(record);notice('Tarayıcı taslağı saklayamadı; çalışma JSON dosyası olarak indirildi. Yerel Taslaklar içinden dosyayı içe aktarabilirsiniz.');return record;}notice('TASLAK YEDEĞİ OLUŞTURULAMADI:");
 script=script.replace('snapshotDocument=window.rafexAttachAreas?.(snapshotDocument)||snapshotDocument;',`const areas=window.rafexRawDraftAreasV407(layout);
    snapshotDocument.payload.areas=areas.areas;snapshotDocument.payload.activeAreaId=areas.activeAreaId;
    snapshotDocument.payload.crm=window.rafexProjectCrmV368?.snapshot()||null;
    snapshotDocument.payload.layout.areaWidth=document.getElementById('m2AreaW')?.value;
    snapshotDocument.payload.layout.areaDepth=document.getElementById('m2AreaH')?.value;
    snapshotDocument.payload.layout.areaZoom=m2LayoutZoom;
    snapshotDocument.payload.layout.editorViewportV258=window.rafexCommonLayoutZoomCrispV126?.getView();
    Object.assign(areas.areas.find(a=>a.id===areas.activeAreaId).layout,snapshotDocument.payload.layout);
    snapshotDocument.payload.draftInputsV407=[...document.querySelectorAll('#page input[id],#page select[id],#page textarea[id]')].filter(el=>!['password','file','hidden'].includes(el.type)).map(el=>({id:el.id,value:el.value,checked:el.checked}));`);
 const a=script.indexOf('    const copy=window.rafexIndependentProjectV133'),b=script.indexOf('    notice(record.code',a);
 if(a<0||b<a)throw Error('Draft restore missing');
 script=script.slice(0,a)+`    const copy=clone(record.document),identity={...(copyIdentity(record.document.payload.projectIdentity)),uuid:crypto.randomUUID(),independent:true,createdAt:new Date().toISOString(),displayNumber:record.code,draftOriginCode:record.code};
    copy.payload.projectIdentity=identity;delete copy.payload.productSnapshotV372;
    // Preserve IDs and CAD coordinates; detach only the server project identity.
    window.rafexProjectIdentityV133=identity;
    window.rafexProjectTypesV133=clone(copy.payload.rackTypes||[]);
    window.rafexActivateProjectV134?.(identity);
    m2SavedRackTypes=clone(copy.payload.rackTypes||[]);m2LastDrawing=clone(copy.payload.drawing||null);m2SelectedSavedType=m2SavedRackTypes.length?0:null;
    window.RafexRuntimeAuthority?.setProjectName?.(copy.projectName);
    for(const id of ['rafexAuthorityProjectName','m2ProjectName']){const el=document.getElementById(id);if(el)el.value=copy.projectName;}
    window.rafexProjectCrmV368?.restore(copy.payload.crm||null);
    const areas={activeAreaId:copy.payload.activeAreaId||'draft-area',areas:copy.payload.areas||[{id:'draft-area',name:'1. Alan',layout:copy.payload.layout}]};
    for(const area of areas.areas)area.layout.draftExactGeometryV407=true;
    window.rafexRestoreDraftAreasV407(areas);
    for(const item of copy.payload.draftInputsV407||[]){const el=document.getElementById(item.id);if(el&&!['password','file','hidden'].includes(el.type)){el.value=item.value;if(['checkbox','radio'].includes(el.type))el.checked=item.checked;}}
    window.rafexSyncProjectGateV134?.();
    m2RenderSavedRackTypes();
`+script.slice(b);
 script=script.replace('  async function restore(record,dialog){',`  function copyIdentity(identity){const {sectionViews,excludedRackTypes}=identity||{};return {sectionViews:clone(sectionViews||{}),excludedRackTypes:clone(excludedRackTypes||[])};}
  async function restore(record,dialog){`);
 script=script.replace('backup,failure,open,reference:()=>current','backup,failure,open,save:()=>backup(true),reference:()=>current');
 script=script.replace("const list=document.createElement('div'),error=document.createElement('p'),close=document.createElement('button');",`const list=document.createElement('div'),error=document.createElement('p'),close=document.createElement('button');
    const importLabel=document.createElement('label'),importFile=document.createElement('input');importLabel.textContent='Taslak dosyasını içe aktar ';importFile.type='file';importFile.accept='.json,application/json';importLabel.append(importFile);dialog.append(importLabel);
    importFile.onchange=async()=>{try{const file=importFile.files[0];if(!file)return;if(file.size>64*1024*1024)throw Error('Taslak dosyası en fazla 64 MB olabilir.');const record=JSON.parse(await file.text());if(record.kind!=='DRAFT'||record.schema!=='rafex-local-draft-v1'||!record.document?.payload?.layout)throw Error('Geçerli RAFEX taslak dosyası seçin.');record.owner=owner();record.code='TASLAK-IMPORT-'+crypto.randomUUID().slice(0,12);record.key=owner()+'|'+record.code;record.updatedAt=new Date().toISOString();await write(record);dialog.close();await open();}catch(e){error.textContent=e.message;}};`);
 html=html.slice(0,start)+script+html.slice(end);
 const runtime=`(()=>{
 function install(){for(const [source,id] of [['m2ProjectSaveButton','rafexDraftSaveV407'],['rafexNewProjectV133','rafexDraftSaveTopV407']]){const save=document.getElementById(source);if(!save||document.getElementById(id))continue;
 const button=document.createElement('button');button.id=id;button.type='button';button.textContent='Taslak kaydet';button.title='Hatalı veya eksik çizimi de bu tarayıcıda saklar';
 button.onclick=async()=>{if(typeof me!=='undefined'&&(me?.role==='observer'||me?.read_only))return;button.disabled=true;try{await window.rafexDraftsV241.save();}finally{button.disabled=false;}};save.after(button);}}
 const observer=new MutationObserver(install);observer.observe(document.getElementById('page')||document.body,{childList:true,subtree:true});install();
 })();`;
 const bodyEnd=html.lastIndexOf('</body>');if(bodyEnd<0)throw Error('Draft page body missing');
 return html.slice(0,bodyEnd)+'<script data-reliable-drafts="v407">'+runtime+'</script>'+html.slice(bodyEnd);
}

