/* separate-local-drafts-v241 */
(()=>{
  const DB='rafex-local-drafts-v241',codes=new Map();let database,current=null,queue=Promise.resolve();
  const owner=()=>typeof me!=='undefined'&&me?.id!=null?String(me.id):null;
  const clone=value=>JSON.parse(JSON.stringify(value));
  function db(){if(!database)database=new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>{const store=request.result.createObjectStore('drafts',{keyPath:'key'});store.createIndex('owner','owner');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);}).catch(error=>{database=null;throw error;});return database;}
  async function write(record){const storage=await db();await new Promise((resolve,reject)=>{const tx=storage.transaction('drafts','readwrite');tx.objectStore('drafts').put(record);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Taslak işlemi iptal edildi'));});}
  async function records(){const user=owner();if(!user)return[];const storage=await db();return new Promise((resolve,reject)=>{const request=storage.transaction('drafts').objectStore('drafts').index('owner').getAll(user);request.onsuccess=()=>resolve(request.result.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)));request.onerror=()=>reject(request.error);});}
  function notice(message){let node=document.getElementById('rafexDraftStatusV241');if(!node){node=document.createElement('div');node.id='rafexDraftStatusV241';node.setAttribute('role','status');document.getElementById('page')?.prepend(node);}node.textContent=message;}
  function snapshot(){
    if(typeof m2LayoutState==='undefined'||!owner())return null;
    const name=String(document.getElementById('rafexAuthorityProjectName')?.value||document.getElementById('m2ProjectName')?.value||'Adsız çalışma').trim();
    const types=window.rafexProjectTypesV133||m2SavedRackTypes||[],drawing=m2LastDrawing||types[0]?.drawing||m2LayoutState.racks?.[0];
    if(!drawing&&!types.length&&!m2LayoutState.racks?.length)return null;
    const layout=clone({...m2LayoutState,drag:null,hover:null,symbols:m2LayoutSymbols,pinnedDimensions:m2PinnedDimensions,pinnedDimensionsByRack:m2PinnedDimensionsByRack,dimensionOffsets:m2DimensionOffsets,dimensionFontSizes:m2DimensionFontSizes,hiddenSummaryDimensions:[...m2HiddenSummaryDimensions],visibleRackDimensions:{length:[...m2VisibleRackDimensions.length],depth:[...m2VisibleRackDimensions.depth]},userNotes:m2UserNotes,freeMeasure:m2FreeMeasure});
    let snapshotDocument={projectName:name,module:'ortak',payload:{version:1,module:'ortak',rafexCommonDrawing:true,drawing:clone(drawing||null),rackTypes:clone(types),layout,projectIdentity:clone(window.rafexProjectIdentityV133||null)}};
    snapshotDocument=window.rafexAttachAreas?.(snapshotDocument)||snapshotDocument;
    return clone(snapshotDocument);
  }
  function backup(){
    current=null;
    // Capture now; serialize only database writes so navigation cannot change the captured owner.
    let document,user;try{document=snapshot();user=owner();}catch(error){notice('TASLAK oluşturulamadı: '+error.message);return Promise.resolve(null);}
    if(!document||!user)return Promise.resolve(null);
    const scope=user+'|'+(document.payload.projectIdentity?.uuid||'unopened');
    let code=codes.get(scope);if(!code){code='TASLAK-'+new Date().toLocaleDateString('sv-SE').replaceAll('-','')+'-'+crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase();codes.set(scope,code);}
    const record={schema:'rafex-local-draft-v1',kind:'DRAFT',code,key:user+'|'+code,owner:user,updatedAt:new Date().toISOString(),sourceProjectNumber:document.payload.projectIdentity?.drawingCatalogId||null,document};
    const task=queue.then(async()=>{await write(record);current=record;if(owner()===user)notice(code+' · TASLAK — yalnızca bu tarayıcıda. Gerçek proje kaydı değildir.');return record;});
    queue=task.catch(()=>{});
    return task.catch(error=>{notice('TASLAK YEDEĞİ OLUŞTURULAMADI: '+(error?.name==='QuotaExceededError'?'Tarayıcı depolama alanı dolu.':error.message||'Tarayıcı depolamasına erişilemiyor.')+' Sunucuya kayıt ayrı olarak denenecek.');return null;});
  }
  async function failure(error,record){if(!record||record.owner!==owner())return;const task=queue.then(async()=>{const latest=(await records()).find(item=>item.key===record.key);if(!latest||latest.updatedAt>record.updatedAt)return;const updated={...latest,lastError:error.message,errorDetails:error.details};await write(updated);if(current?.key===record.key&&owner()===record.owner){current=updated;notice(error.message+' · Yerel taslak: '+record.code+' (gerçek kayıt değildir).');}});queue=task.catch(()=>{});return task;}
  function download(record){const url=URL.createObjectURL(new Blob([JSON.stringify(record,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=record.code+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function restore(record,dialog){
    if(record.owner!==owner())throw Error('Bu taslak farklı bir kullanıcıya ait.');
    // Preserve the current work first. Never load an old server identity/revision from a draft.
    const existing=snapshot();if(existing&&!await backup())throw Error('Açık çalışma yedeklenemedi; taslak açılmadı.');
    showPage('free');
    if(!document.getElementById('m2FloorStatus')){const radio=document.querySelector('input[name="rafexUnifiedSystem"][value="b2b"]');if(radio)radio.checked=true;rafexFreeDrawingContinue();}
    const copy=window.rafexIndependentProjectV133(clone(record.document),crypto.randomUUID(),Date.now());
    copy.payload.projectIdentity.displayNumber=record.code;
    copy.payload.projectIdentity.draftOriginCode=record.code;
    window.rafexOpenIndependentV133(copy);
    notice(record.code+' · TASLAKTAN AÇILDI — yeni çalışma; henüz sunucuya kaydedilmedi.');
    dialog.close();
  }
  async function open(){
    document.getElementById('rafexDraftDialogV241')?.remove();const dialog=document.createElement('dialog');dialog.id='rafexDraftDialogV241';
    const title=document.createElement('h3');title.textContent='Yerel Taslaklar';
    const explanation=document.createElement('p');explanation.textContent='TASLAK kodları proje numarası değildir. Yalnızca bu tarayıcıda saklanır; tarayıcı verileri temizlenirse silinir. Taslağı açmak yeni bir çalışma oluşturur, gerçek proje kaydını değiştirmez.';
    const list=document.createElement('div'),error=document.createElement('p'),close=document.createElement('button');close.textContent='Kapat';close.onclick=()=>dialog.close();dialog.append(title,explanation,list,error,close);document.body.append(dialog);dialog.showModal();
    try{const items=await records();if(!items.length)list.textContent='Bu kullanıcı için yerel taslak yok.';for(const record of items){const row=document.createElement('section'),heading=document.createElement('b'),meta=document.createElement('p'),load=document.createElement('button'),save=document.createElement('button');heading.textContent=record.code+' · TASLAK';meta.textContent=record.document.projectName+' · '+new Date(record.updatedAt).toLocaleString('tr-TR')+(record.sourceProjectNumber?' · Kaynak proje #'+record.sourceProjectNumber:'')+(record.lastError?' · Son hata: '+record.lastError:'');load.textContent='Yeni çalışma olarak aç';save.textContent='Taslak dosyasını indir';load.onclick=async()=>{load.disabled=true;try{await restore(record,dialog);}catch(e){error.textContent=e.message;}finally{load.disabled=false;}};save.onclick=()=>download(record);row.append(heading,meta,load,save);list.append(row);}}catch(e){error.textContent='Taslaklar okunamadı: '+e.message;}
  }
  const anchor=document.getElementById('installAppButton');if(anchor){const button=document.createElement('button');button.id='rafexDraftsButtonV241';button.textContent='Yerel Taslaklar';button.onclick=open;anchor.after(button);}
  const style=document.createElement('style');style.textContent='#rafexDraftStatusV241{padding:9px 12px;margin:8px 0;border:1px solid #d6af55;background:#fff7df;color:#694800;border-radius:8px;font-size:12px}#rafexDraftDialogV241{max-width:760px;width:85vw;max-height:80vh;overflow:auto;border:1px solid #b4c9bd;border-radius:12px;padding:22px}#rafexDraftDialogV241 section{border:1px solid #d6af55;background:#fffaf0;padding:12px;margin:12px 0;border-radius:8px}#rafexDraftDialogV241 button{margin:5px;padding:9px 12px}';document.head.append(style);
  window.rafexDraftsV241={backup,failure,open,reference:()=>current};
})();
