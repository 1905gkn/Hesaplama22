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
    importFile.onchange=async()=>{try{const file=importFile.files[0];if(!file)return;if(file.size>256*1024*1024)throw Error('Taslak dosyası en fazla 256 MB olabilir.');const record=JSON.parse(await file.text());if(record.kind!=='DRAFT'||record.schema!=='rafex-local-draft-v1'||!record.document?.payload?.layout)throw Error('Geçerli RAFEX taslak dosyası seçin.');record.owner=owner();record.code='TASLAK-IMPORT-'+crypto.randomUUID().slice(0,12);record.key=owner()+'|'+record.code;record.updatedAt=new Date().toISOString();try{await write(record);}catch(storageError){await restore(record,dialog);notice('Taslak bu tarayıcıya yazılamadı; dosyadan açıldı. Çalışmanızı sunucuya kaydedebilir veya taslak dosyasını koruyabilirsiniz.');return;}dialog.close();await open();}catch(e){error.textContent=e.message;}};`);
 html=html.slice(0,start)+script+html.slice(end);
 const runtime=`(()=>{
 function install(){for(const [source,id] of [['m2ProjectSaveButton','rafexDraftSaveV407'],['rafexNewProjectV133','rafexDraftSaveTopV407']]){const save=document.getElementById(source);if(!save||document.getElementById(id))continue;
 const button=document.createElement('button');button.id=id;button.type='button';button.textContent='Taslak kaydet';button.title='Hatalı veya eksik çizimi de bu tarayıcıda saklar';
 button.onclick=async()=>{if(typeof me!=='undefined'&&(me?.role==='observer'||me?.read_only))return;button.disabled=true;try{await window.rafexDraftsV241.save();}finally{button.disabled=false;}};save.after(button);}}
 const observer=new MutationObserver(install);observer.observe(document.getElementById('page')||document.body,{childList:true,subtree:true});install();
 })();`;
 const bodyEnd=html.lastIndexOf('</body>');if(bodyEnd<0)throw Error('Draft page body missing');
 return html.slice(0,bodyEnd)+'<script data-reliable-drafts="v407">'+runtime+'</script><script data-large-projects="v416">('+largeProjectRuntimeV416.toString()+')();</script>'+html.slice(bodyEnd);
}


function largeProjectRuntimeV416(){
 const MAX=256*1024*1024,PART=2*1024*1024,basePrepare=window.rafexPrepareWireV244,baseRequest=requestJson,active=new Map();
 const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
 function progress(text,value=0,total=1,bad=false){let box=document.getElementById('rafexTransferProgressV416');if(!box){box=document.createElement('div');box.id='rafexTransferProgressV416';box.setAttribute('role','status');box.style.cssText='padding:9px 12px;border-radius:8px;background:#edf5f0;color:#194c37;font-size:13px;overflow-wrap:anywhere;margin:8px 0';(document.getElementById('m2ProjectSaveButton')||document.getElementById('rafexOpenLayoutScreen'))?.after(box);if(!box.isConnected)document.body.append(box);}box.textContent=text;box.style.color=bad?'#9c2634':'#194c37';const bar=document.createElement('progress');bar.max=total||1;bar.value=value;bar.style.cssText='display:block;width:100%;height:8px;margin-top:6px';bar.setAttribute('aria-label',text);box.append(bar);}
 async function digest(bytes){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');}
 async function transferRequest(path,options={},binary=false){let response;for(let attempt=0;attempt<3;attempt++){try{response=await fetch(path,{credentials:'same-origin',...options});if(response.ok)break;if(![429,502,503,504].includes(response.status)||attempt===2)break;}catch(error){if(attempt===2)throw error;}await new Promise(r=>setTimeout(r,500*(attempt+1)));}if(!response)throw Error('Aktarım servisine ulaşılamadı.');if(!response.ok){const value=await response.json().catch(()=>({}));throw Error(value.error||'Proje aktarımı başarısız (HTTP '+response.status+').');}return binary?response:response.json();}
 function stringEnd(raw,start){let at=start+1;while(at<raw.length){const end=raw.indexOf('"',at);if(end<0)throw Error('Kayıt JSON metni tamamlanmamış.');let back=end-1;while(back>start&&raw[back]==='\\')back--;if((end-1-back)%2===0)return end+1;at=end+1;}throw Error('Kayıt metni okunamadı.');}
 function valueEnd(raw,start){const c=raw[start];if(c==='"')return stringEnd(raw,start);if(c==='{'||c==='['){let depth=1,at=start+1;const mark=/[{}\[\]"]/g;while(depth){mark.lastIndex=at;const match=mark.exec(raw);if(!match)throw Error('Kayıt JSON metni tamamlanmamış.');at=match.index;if(raw[at]==='"')at=stringEnd(raw,at);else{depth+=raw[at]==='{'||raw[at]==='['?1:-1;at++;}}return at;}const end=/[,}\]\s]/g;end.lastIndex=start;return end.exec(raw)?.index??raw.length;}
 function* members(raw,start){if(raw[start]!=='{')throw Error('Proje nesnesi geçersiz.');let i=start+1;while(i<raw.length){while(/[\s,]/.test(raw[i]))i++;if(raw[i]==='}')return;if(raw[i]!=='"')throw Error('Proje alanı okunamadı.');const end=stringEnd(raw,i),key=JSON.parse(raw.slice(i,end));i=end;while(/\s/.test(raw[i]))i++;if(raw[i++]!==':')throw Error('Proje alanı geçersiz.');while(/\s/.test(raw[i]))i++;const from=i; i=valueEnd(raw,i);yield {key,start:from,end:i};}}
 function smallValue(raw,span){if(span.end-span.start>1500000)throw Error('Proje özet alanı çok büyük.');return JSON.parse(raw.slice(span.start,span.end));}
 function metadata(raw,kind,catalogId){const root={};let payload;for(const span of members(raw,raw.search(/\S/))){if(span.key==='payload')payload=span;else if(['projectName','module','revision'].includes(span.key))root[span.key]=smallValue(raw,span);}if(kind==='catalog')return {catalogId,revision:root.revision};if(!payload)throw Error('Proje verisi eksik.');const summary={};for(const span of members(raw,payload.start)){if(span.key==='layout')summary.layout={};else if(span.key==='projectIdentity'){const identity={};for(const item of members(raw,span.start))if(['uuid','createdAt','displayNumber','creationNameV253','independent','schemaVersion'].includes(item.key))identity[item.key]=smallValue(raw,item);summary.projectIdentity=identity;}else if(['version','crm','module','rafexCommonDrawing','p','productSnapshotV372'].includes(span.key))summary[span.key]=smallValue(raw,span);}return {projectName:root.projectName,module:root.module||'drive-in',payload:summary};}
 function cached(key,value){try{const k='rafex-project-transfer-v416-'+key;if(value===null)localStorage.removeItem(k);else if(value)localStorage.setItem(k,JSON.stringify(value));else return JSON.parse(localStorage.getItem(k)||'null');}catch{return null;}}
 window.rafexPrepareWireV244=async function(url,opt){
  const method=String(opt.method||'GET').toUpperCase(),path=String(url).split('?')[0],catalog=path.match(/^\/api\/drawing-projects\/(\d+)\/types$/),kind=path==='/api/projects'&&method==='POST'?'history':catalog&&method==='PUT'?'catalog':null;
  if(!kind||typeof opt.body!=='string')return basePrepare(url,opt);
  const blob=new Blob([opt.body],{type:'application/json'});if(blob.size<1000000)return basePrepare(url,opt);if(blob.size>MAX)throw Error('Proje en fazla 256 MB olabilir. Yerel taslağınız korunuyor.');
  try{
   const meta=metadata(opt.body,kind,catalog?Number(catalog[1]):null),count=Math.ceil(blob.size/PART),hashes=[];progress('Büyük proje hazırlanıyor… 0 / '+count,0,count);
   for(let i=0;i<count;i++){hashes.push(await digest(await blob.slice(i*PART,(i+1)*PART).arrayBuffer()));progress('Büyük proje hazırlanıyor… '+(i+1)+' / '+count,i+1,count);await pause();}
   const key=await digest(new TextEncoder().encode(kind+'|'+JSON.stringify(meta)+'|'+blob.size+'|'+hashes.join('|')));let transfer=cached(key),state=null;
   if(transfer){try{state=await transferRequest('/api/project-transfers/'+transfer.id);if(state.parts.some(p=>hashes[p.part_no]!==p.sha256)||state.byteLength!==blob.size){state=null;transfer=null;}}catch{transfer=null;}}
   if(!transfer){transfer=await transferRequest('/api/project-transfers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({kind,byteLength:blob.size,metadata:meta})});cached(key,{id:transfer.id});state={nextPart:0,partCount:count};}
   active.set(opt.body,{id:transfer.id,key});
   for(let i=state.nextPart;i<count;i++){const part=blob.slice(i*PART,(i+1)*PART);progress('Proje aktarılıyor: '+Math.min(blob.size,i*PART).toLocaleString('tr-TR')+' / '+blob.size.toLocaleString('tr-TR')+' bayt',i,count);const result=await transferRequest('/api/project-transfers/'+transfer.id+'/parts/'+i,{method:'PUT',headers:{'content-type':'application/octet-stream'},body:part});if(result.sha256!==hashes[i])throw Error('Aktarım parçasının bütünlüğü doğrulanamadı.');await pause();}
   progress('Tüm parçalar doğrulandı. Proje kaydı tamamlanıyor…',count,count);
   return basePrepare(url,{...opt,body:JSON.stringify({projectTransferV416:transfer.id,...(kind==='catalog'?{revision:meta.revision,rackTypes:[]}:{})})});
  }catch(error){progress('Aktarım tamamlanmadı. Taslağınız korunuyor. '+error.message,0,1,true);throw error;}
 };
 async function readDocument(descriptor){if(descriptor.version!==1||!Number.isSafeInteger(descriptor.bytes)||descriptor.bytes>MAX||descriptor.bytes<1)throw Error('Proje dosyası bilgisi geçersiz.');const manifest=await transferRequest('/api/project-transfers/'+descriptor.id);if(manifest.status!=='committed'||manifest.byteLength!==descriptor.bytes||manifest.partCount!==descriptor.parts||manifest.parts.length!==descriptor.parts)throw Error('Proje dosyası tamamlanmamış.');const chunks=[];let size=0;for(let i=0;i<manifest.parts.length;i++){const p=manifest.parts[i];if(p.part_no!==i)throw Error('Proje parça sırası geçersiz.');progress('Proje açılıyor: '+(i+1)+' / '+descriptor.parts,i,descriptor.parts);const response=await transferRequest('/api/project-transfers/'+descriptor.id+'/parts/'+i,{},true),bytes=await response.arrayBuffer();if(bytes.byteLength!==p.byte_length||await digest(bytes)!==p.sha256)throw Error('Proje dosyasının bütünlüğü doğrulanamadı.');size+=bytes.byteLength;chunks.push(bytes);await pause();}if(size!==descriptor.bytes)throw Error('Proje dosyası eksik.');let blob=new Blob(chunks);chunks.length=0;const raw=await blob.text();blob=null;const document=JSON.parse(raw);progress('Proje eksiksiz açıldı.',1,1);return document;}
 async function expand(row){if(row?.payload?.projectStorageV416){const document=await readDocument(row.payload.projectStorageV416);if(!document.payload||typeof document.payload!=='object')throw Error('Proje içeriği okunamadı.');row.payload=document.payload;}if(row?.rackTypes?.catalogStorageV416){const document=await readDocument(row.rackTypes.catalogStorageV416);if(!Array.isArray(document.rackTypes))throw Error('Raf tipi dosyası okunamadı.');row.rackTypes=document.rackTypes;}}
 async function invoke(base,url,opt={},prepare=false){try{const options=prepare&&typeof opt.body==='string'&&opt.body.length>=1000000?await window.rafexPrepareWireV244(url,opt):opt;const result=await base(url,options);const transfer=active.get(opt.body);if(transfer){cached(transfer.key,null);active.delete(opt.body);progress('Proje kaydı tamamlandı.',1,1);}if(result?.project)await expand(result.project);if(Array.isArray(result?.projects))for(const row of result.projects)await expand(row);return result;}catch(error){active.delete(opt.body);throw error;}}
 requestJson=window.requestJson=(url,opt={})=>invoke(baseRequest,url,opt);
 if(typeof req==='function'){const baseReq=req;req=window.req=(url,opt={})=>invoke(baseReq,url,opt,true);}
 window.rafexLargeProjectsV416=Object.freeze({maxBytes:MAX,partBytes:PART});
}

