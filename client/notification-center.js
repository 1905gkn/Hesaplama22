(()=>{
 if(window.rafexNotificationCenter)return;
 const fetchBase=window.fetch.bind(window);let items=[],cursor=null,latestId=0,unread=0,loading=false,account=null,imported=false,pendingOpenedId=Number(new URL(location.href).searchParams.get('notification'));
 const label={assignment:'Yeni atama',comment:'Yeni yorum',closed:'Not kapatıldı'};
 const description={assignment:'size bir not atadı.',comment:'nota yorum ekledi.',closed:'notu kendi listesinde kapattı.'};
 const node=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el};
 async function api(path,method='GET',data){const r=await fetchBase(path,{method,credentials:'same-origin',...(data?{headers:{'content-type':'application/json'},body:JSON.stringify(data)}:{})}),x=await r.json();if(!r.ok){const e=Error(x.error||'Bildirimler yüklenemedi.');e.status=r.status;throw e}return x}
 const currentUser=()=>typeof me!=='undefined'?me?.id:null;
 const dialog=()=>document.getElementById('rafexNotificationDialog');
 function badge(){const b=document.getElementById('rafexNotificationBell'),count=document.getElementById('rafexNotificationCount');if(!b)return;b.hidden=false;b.setAttribute('aria-label','Bildirimler'+(unread?', '+unread+' okunmamış':''));count.hidden=!unread;count.textContent=unread>99?'99+':String(unread);const all=document.getElementById('rafexNotificationsReadAll');if(all)all.disabled=!unread||!latestId}
 function install(){
  if(document.getElementById('rafexNotificationBell'))return true;const history=document.querySelector('.top-actions .history-top');if(!history)return false;
  const group=node('div',undefined,'rafex-history-notifications');history.before(group);group.append(history);
  const b=node('button',undefined,'rafex-notification-bell');b.id='rafexNotificationBell';b.type='button';b.setAttribute('aria-label','Bildirimler');b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-expanded','false');b.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" stroke-linecap="round" stroke-linejoin="round"/></svg><span id="rafexNotificationCount" class="rafex-notification-count" hidden></span>';group.append(b);b.onclick=open;
  const box=node('dialog');box.id='rafexNotificationDialog';box.setAttribute('aria-labelledby','rafexNotificationHeading');
  box.innerHTML='<header><h2 id="rafexNotificationHeading">Bildirimler</h2><button type="button" data-close aria-label="Bildirimleri kapat">×</button></header><div class="rafex-notification-toolbar"><span>Atamalar, yorumlar ve kapatmalar</span><button type="button" id="rafexNotificationsReadAll">Tümünü okundu işaretle</button></div><div id="rafexNotificationList" aria-live="polite"></div><footer><button type="button" id="rafexNotificationsMore" hidden>Daha eski bildirimler</button></footer>';
  document.body.append(box);box.querySelector('[data-close]').onclick=()=>box.close();box.addEventListener('click',e=>{if(e.target===box)box.close()});box.addEventListener('close',()=>b.setAttribute('aria-expanded','false'));
  box.querySelector('#rafexNotificationsMore').onclick=()=>refresh(true);
  box.querySelector('#rafexNotificationsReadAll').onclick=async e=>{e.target.disabled=true;try{await api('/api/notifications/read','POST',{throughId:latestId});await refresh()}catch(error){showError(error.message)}};
  return true;
 }
 function showError(text){const host=document.getElementById('rafexNotificationList');if(!host)return;host.replaceChildren(node('p',text,'rafex-notification-empty'));const retry=node('button','Yeniden dene');retry.type='button';retry.onclick=()=>refresh();host.append(retry)}
 function render(){
  const host=document.getElementById('rafexNotificationList');if(!host)return;host.replaceChildren();
  if(!items.length)host.append(node('p','Henüz bildiriminiz yok.','rafex-notification-empty'));
  for(const item of items){
   const row=node('button',undefined,'rafex-notification-row'+(!item.read_at?' is-unread':''));row.type='button';row.dataset.notification=String(item.id);
   const title=node('strong',label[item.kind]||'Bildirim');row.append(title,node('span',item.actor_name+' '+(description[item.kind]||''),'rafex-notification-description'));
   if(item.note_text)row.append(node('span',item.note_text,'rafex-notification-preview'));else row.append(node('span',item.accessible?'Not #'+item.todo_id:'Not silinmiş veya erişiminiz kaldırılmış.','rafex-notification-preview'));
   const time=node('time',new Date(item.created_at).toLocaleString('tr-TR',{timeZone:'Europe/Istanbul',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}));time.dateTime=item.created_at;row.append(time);row.setAttribute('aria-label',(item.read_at?'':'Okunmamış: ')+(label[item.kind]||'Bildirim')+' — '+item.actor_name);
   row.onclick=async()=>{row.disabled=true;try{await api('/api/notifications/read','POST',{id:item.id});item.read_at=new Date().toISOString();if(!item.accessible){await refresh();return}boxClose();location.assign('/?note='+item.todo_id+(item.kind==='comment'?'&comments=1':''))}catch(error){showError(error.message)}finally{row.disabled=false}};
   host.append(row);
  }
  const more=document.getElementById('rafexNotificationsMore');more.hidden=!cursor;more.disabled=loading;badge();
 }
 function boxClose(){dialog()?.close()}
 async function refresh(append=false){
  if(loading||!install())return;const uid=currentUser();if(!uid){document.getElementById('rafexNotificationBell').hidden=true;return}
  if(uid!==account){account=uid;imported=false;items=[];cursor=null;latestId=0;unread=0}
  loading=true;
  try{if(!imported){await api('/api/notifications/sync','POST',{});imported=true}if(Number.isSafeInteger(pendingOpenedId)&&pendingOpenedId>0){await api('/api/notifications/read','POST',{id:pendingOpenedId});pendingOpenedId=0}const data=await api('/api/notifications'+(append&&cursor?'?before='+cursor:''));items=append?[...items,...data.notifications]:data.notifications;cursor=data.nextBefore;latestId=Math.max(latestId,Number(data.latestId)||0);unread=Number(data.unreadCount)||0;badge();if(dialog()?.open)render()}
  catch(error){if([401,403].includes(error.status))document.getElementById('rafexNotificationBell').hidden=true;if(dialog()?.open)showError(error.message)}finally{loading=false;const more=document.getElementById('rafexNotificationsMore');if(more)more.disabled=false}
 }
 async function open(){if(!install())return;const box=dialog();document.getElementById('rafexNotificationBell').setAttribute('aria-expanded','true');if(!box.open)box.showModal();if(items.length)render();else document.getElementById('rafexNotificationList').replaceChildren(node('p','Bildirimler yükleniyor…','rafex-notification-empty'));await refresh()}
 window.rafexNotificationCenter={refresh,open};
 const home=window.renderHome;if(typeof home==='function')window.renderHome=function(){const value=home.apply(this,arguments);void refresh();return value};
 install();if(currentUser())void refresh();
 const visibleRefresh=()=>{if(document.visibilityState==='visible')void refresh()};setInterval(visibleRefresh,60000);window.addEventListener('focus',visibleRefresh);document.addEventListener('visibilitychange',visibleRefresh);
 navigator.serviceWorker?.addEventListener('message',e=>{if(e.data?.type==='RAFEX_NOTE_PUSH')visibleRefresh()});
})();
