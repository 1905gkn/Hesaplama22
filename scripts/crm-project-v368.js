(()=>{
 let record=null,serial=0,controller=null,message='',busy=false,freshSelection=false,confirmed=false,draft='',reportKey='null';
 const clean=value=>typeof value==='string'?value.trim().slice(0,600):'';
 function normalize(value){const number=String(value?.number??'').trim();return /^[1-9]\d{0,9}$/.test(number)&&Number(number)<=2147483647?{number:Number(number),projectNo:clean(value.projectNo),companyName:clean(value.companyName),contactName:clean(value.contactName)}:null;}
 const isLocked=()=>!!(confirmed&&record&&String(record.number)===draft.trim());
 function snapshot(){return record?{...record,confirmed}:null;}
 function restore(value){serial++;controller?.abort();record=normalize(value);draft=String(record?.number??'');confirmed=!!record&&(value?.confirmed===true||value?.confirmed!==false&&!!(record.projectNo||record.companyName||record.contactName));message='';busy=false;freshSelection=false;paint();}
 function applyName(value){if(window.RafexRuntimeAuthority?.setProjectName)window.RafexRuntimeAuthority.setProjectName(value);else{const input=document.getElementById('rafexAuthorityProjectName')||document.getElementById('m2ProjectName');if(input){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));}}}
 function prepareNew(){if(!freshSelection)restore(null);freshSelection=false;}
 function syncLocks(){
  const locked=isLocked(),name=document.getElementById('rafexAuthorityProjectName'),button=document.getElementById('rafexNewProjectV133');
  if(name){if(name.readOnly!==locked)name.readOnly=locked;if(name.dataset.crmLocked!==String(locked))name.dataset.crmLocked=String(locked);}
  if(button){const identity=window.rafexProjectIdentityV133,n=String(name?.value||'').trim();button.disabled=!!(locked||window.rafexProjectSavingV133||(identity?.drawingCatalogId&&identity.creationNameV253===n));if(button.dataset.crmLocked!==String(locked))button.dataset.crmLocked=String(locked);}
 }
 function paint(){
  const input=document.getElementById('rafexCrmNumberV368'),status=document.getElementById('rafexCrmStatusV368'),details=document.getElementById('rafexCrmDetailsV368'),button=document.getElementById('rafexCrmConfirmV369');
  if(input&&input.value!==draft)input.value=draft;
  if(button){button.disabled=busy||!draft.trim();const label=busy?'Alınıyor…':'Onayla';if(button.textContent!==label)button.textContent=label;}
  if(status){if(status.textContent!==message)status.textContent=message;if(status.dataset.busy!==String(busy))status.dataset.busy=String(busy);}
  if(details){details.hidden=!confirmed||!record;for(const key of ['projectNo','companyName','contactName']){const field=details.querySelector('[data-crm-field="'+key+'"]'),value=record?.[key]||'—';if(field&&field.textContent!==value)field.textContent=value;}}
  syncLocks();
  const nextReportKey=JSON.stringify(confirmed?record:null);if(nextReportKey!==reportKey){reportKey=nextReportKey;window.__rafexFreeOutputDirty=true;}
 }
 async function lookup(value){
  draft=String(value??'').trim();const number=normalize({number:draft}),ticket=++serial;controller?.abort();record=number;confirmed=false;freshSelection=false;message='';busy=false;
  if(!draft){paint();return;}if(!number){message='Geçerli bir CRM numarası yazın.';paint();return;}
  controller=new AbortController();busy=true;message='CRM bilgileri alınıyor…';paint();
  try{
   const response=await fetch('/api/crm/'+number.number,{credentials:'same-origin',headers:{accept:'application/json'},signal:controller.signal,cache:'no-store'}),data=await response.json();
   if(ticket!==serial)return;if(!response.ok)throw Error(data?.error||'CRM bilgileri alınamadı.');
   const next=normalize(data.crm);if(!next||next.number!==number.number)throw Error('CRM yanıtı doğrulanamadı.');
   record=next;draft=String(next.number);confirmed=true;freshSelection=true;if(next.projectNo)applyName(next.projectNo);message=next.projectNo?'CRM bilgileri getirildi.':'CRM bilgileri getirildi; ERP kaydında proje adı boş.';
  }catch(error){if(ticket!==serial||error?.name==='AbortError')return;message=error?.message||'CRM bilgileri alınamadı. Tekrar deneyin.';}
  finally{if(ticket===serial){busy=false;paint();}}
 }
 function install(){
  const name=document.querySelector('#page .rafex-common-project-name-field'),wrap=name?.parentElement;if(!name||!wrap)return;
  if(!document.getElementById('rafexCrmNumberV368')){
   const field=document.createElement('div');field.className='rafex-crm-field-v368';field.innerHTML='<label for="rafexCrmNumberV368">CRM</label><div class="rafex-crm-controls-v369"><input id="rafexCrmNumberV368" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="CRM no" aria-describedby="rafexCrmStatusV368"><button id="rafexCrmConfirmV369" type="button">Onayla</button></div>';name.after(field);
   const input=field.querySelector('input'),button=field.querySelector('button');
   input.addEventListener('input',()=>{serial++;controller?.abort();draft=input.value;record=null;confirmed=false;freshSelection=false;message='';busy=false;paint();});
   input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();if(!button.disabled)button.click();}});
   button.addEventListener('click',()=>lookup(input.value));
  }
  if(!document.getElementById('rafexCrmStatusV368')){const status=document.createElement('small');status.id='rafexCrmStatusV368';status.setAttribute('role','status');status.setAttribute('aria-live','polite');wrap.append(status);}
  if(!document.getElementById('rafexCrmDetailsV368')){const details=document.createElement('div');details.id='rafexCrmDetailsV368';details.hidden=true;details.innerHTML='<div><small>Proje Adı</small><strong data-crm-field="projectNo"></strong></div><div><small>Firma</small><strong data-crm-field="companyName"></strong></div><div><small>İlgili kişi</small><strong data-crm-field="contactName"></strong></div>';wrap.append(details);}
  paint();
 }
 let scheduled=false;const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;install();});}};
 window.rafexProjectCrmV368={snapshot,restore,lookup,install,prepareNew,isLocked,syncLocks,markSaved(){freshSelection=false;}};
 new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.rafex-common-project-name-wrap,.rafex-common-project-name-field,#rafexNewProjectV133,#page')||n.querySelector?.('.rafex-common-project-name-field,#rafexNewProjectV133')))))schedule();}).observe(document.body,{childList:true,subtree:true});install();
})();
