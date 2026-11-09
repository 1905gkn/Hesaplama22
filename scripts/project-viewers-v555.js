(()=>{
 const text=value=>esc(String(value??'')),canManage=p=>me?.role==='super'||Number(p.created_by)===Number(me?.id);
 const message=(node,value)=>{node.querySelector('[role="status"]').textContent=value;};
 function decorate(){
  for(const row of document.querySelectorAll('#historyList .history-item')){
   const summary=row.querySelector('.history-summary'),id=Number(row.querySelector('[data-history-body-v261]')?.dataset.historyBodyV261),project=projects.find(p=>Number(p.id)===id);if(!summary||!project||row.querySelector('.history-people555'))continue;
   const header=document.createElement('div');header.className='history-header555';summary.before(header);header.append(summary);
   const people=document.createElement('aside');people.className='history-people555';people.innerHTML=(canManage(project)?'<details data-project-viewers555="'+id+'"><summary>Kullanıcılar ▾</summary><div class="history-viewers-popup555"><p role="status">Kullanıcıları görmek için açın.</p><div data-viewer-list></div></div></details>':'')+'<span><small>Projeyi oluşturan</small><strong>'+text(project.owner_name||project.username)+'</strong></span>';header.append(people);
   const details=people.querySelector('details');if(details)details.addEventListener('toggle',async()=>{if(!details.open||details.dataset.loaded||details.dataset.loading)return;details.dataset.loading='1';message(details,'Kullanıcılar yükleniyor…');try{const data=await req('/api/projects/'+id+'/viewers',{cache:'no-store'});if(!details.isConnected)return;details.querySelector('[data-viewer-list]').innerHTML=data.users.map(u=>'<label><input type="checkbox" value="'+Number(u.id)+'" '+(u.selected?'checked':'')+'><span>'+text(u.full_name||u.username)+'</span></label>').join('')||'<p>Başka kullanıcı yok.</p>';details.dataset.loaded='1';message(details,'Seçimler otomatik kaydedilir.');}catch(error){message(details,error.message);}finally{delete details.dataset.loading;}});
   if(details){let task=Promise.resolve();details.addEventListener('change',event=>{if(!event.target.matches('input[type=checkbox]'))return;const checkbox=event.target;checkbox.disabled=true;const desired=checkbox.checked;task=task.catch(()=>{}).then(async()=>{const userIds=[...details.querySelectorAll('input:checked')].map(i=>Number(i.value));message(details,'Kaydediliyor…');try{await req('/api/projects/'+id+'/viewers',{method:'PUT',body:JSON.stringify({userIds})});message(details,'Görüntüleme yetkileri kaydedildi.');}catch(error){checkbox.checked=!desired;message(details,error.message);}finally{checkbox.disabled=false;}});});}
   if(!canManage(project))for(const b of row.querySelectorAll('[onclick]'))if(b.getAttribute('onclick').includes('deleteProject('))b.hidden=true;
  }
 }
 const render=renderHistoryProjects;renderHistoryProjects=window.renderHistoryProjects=function(){const result=render.apply(this,arguments);decorate();return result;};decorate();
})();
