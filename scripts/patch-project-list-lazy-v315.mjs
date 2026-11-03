import fs from 'node:fs';
export function transform(html){
 if(html.includes('project-list-lazy-v315'))return html;
 html=html.replace('<b>${metric}</b></button><div class="history-detail">','<b>${p.__summary?"Detay için aç":metric}</b></button><div class="history-detail">');
 const runtime=`<script>
/* project-list-lazy-v315 */
(()=>{
 const originalReq=req,pending=new Map();
 req=async function(path,options){
  if(path==='/api/projects'&&(!options?.method||options.method==='GET'))path='/api/projects?summary=1';
  return originalReq.call(this,path,options);
 };
 function records(){return [...(typeof projects==='undefined'?[]:projects),...(typeof m2ProjectRecords==='undefined'?[]:m2ProjectRecords)];}
 async function hydrate(id){
  const current=records().find(p=>Number(p.id)===Number(id)&&!p.__summary);if(current)return current;
  if(pending.has(Number(id)))return pending.get(Number(id));
  const task=(async()=>{
   const data=await req('/api/projects/'+Number(id),{cache:'no-store'}),full=data.project;
   if(!full?.payload)throw Error('Proje verisi alınamadı.');
   for(const list of [typeof projects==='undefined'?[]:projects,typeof m2ProjectRecords==='undefined'?[]:m2ProjectRecords]){
    const record=list.find(p=>Number(p.id)===Number(id));if(record)Object.assign(record,full,{__summary:false});
   }
   return full;
  })();pending.set(Number(id),task);
  try{return await task;}finally{pending.delete(Number(id));}
 }
 function action(original,index=0){return async function(...args){try{await hydrate(args[index]);return await original.apply(this,args);}catch(error){alert(error.message);}};}
 copyProject=window.copyProject=action(copyProject);
 m2LoadProject=window.m2LoadProject=action(m2LoadProject);
 window.rafexOpenHistoryProjectV134=action(window.rafexOpenHistoryProjectV134);
 const detailPending=new Map(),detailHTML=new Map();
 function detailBody(id){return document.querySelector('[data-history-body-v261="'+Number(id)+'"]');}
 function detailState(body,loading){
  const row=body?.closest('.history-item'),button=row?.querySelector('.history-summary');if(!row||!button)return;
  row.classList.add('open');button.setAttribute('aria-expanded','true');button.disabled=loading;
  if(loading){button.setAttribute('aria-busy','true');body.textContent='Proje detayı yükleniyor…';body.setAttribute('role','status');}
  else{button.removeAttribute('aria-busy');body.removeAttribute('role');}
 }
 function paintDetail(body,p){if(!body||!p)return;body.innerHTML=historyProjectBody(p,p.payload||{},p.payload?.inputs||{});body.dataset.loaded='1';detailHTML.set(Number(p.id),body.innerHTML);delete body.dataset.error;detailState(body,false);}
 const baseHistoryRender=renderHistoryProjects;
 renderHistoryProjects=window.renderHistoryProjects=function(){
  const opened=[...document.querySelectorAll('.history-item.open [data-history-body-v261]')].map(body=>Number(body.getAttribute('data-history-body-v261')));
  const result=baseHistoryRender.apply(this,arguments);
  for(const id of opened){const body=detailBody(id);if(!body)continue;const p=records().find(p=>Number(p.id)===id&&!p.__summary);if(detailPending.has(id))detailState(body,true);else if(p)paintDetail(body,p);else if(detailHTML.has(id)){body.innerHTML=detailHTML.get(id);body.dataset.loaded='1';detailState(body,false);}}
  for(const id of detailHTML.keys()){if(!opened.includes(id)||!detailBody(id))detailHTML.delete(id);}
  return result;
 };
 window.rafexToggleHistoryV261=function(button,id){
  id=Number(id);if(detailPending.has(id))return detailPending.get(id);
  const body=detailBody(id),row=body?.closest('.history-item');if(!body||!row)return Promise.resolve();
  if(row.classList.contains('open')&&body.dataset.loaded){row.classList.remove('open');detailHTML.delete(id);button.setAttribute('aria-expanded','false');return Promise.resolve();}
  detailState(body,true);
  const task=(async()=>{
   try{const p=await hydrate(id);paintDetail(detailBody(id),p);}
   catch(error){const current=detailBody(id);if(current){current.textContent='Proje detayı alınamadı: '+error.message+' Yeniden denemek için başlığa tıklayın.';current.dataset.error='1';detailState(current,false);}}
   finally{detailPending.delete(id);const current=detailBody(id);if(current)detailState(current,false);}
  })();detailPending.set(id,task);return task;
 };
 const apply=m2ApplyProjectRecord;
 m2ApplyProjectRecord=window.m2ApplyProjectRecord=function(project,...args){
  if(project?.__summary)return hydrate(project.id).then(full=>apply.call(this,full,...args)).catch(error=>{alert(error.message);return false;});
  return apply.call(this,project,...args);
 };
})();
</script>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body');return html.slice(0,end)+runtime+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-project-list-lazy-v315.mjs')){
 const file=process.argv[2]||'dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
