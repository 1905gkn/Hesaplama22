(()=>{
 if(window.rafexWebPush)return;
 const nativeFetch=window.fetch.bind(window);let config=null,registration=null,busy=false;
 const supported=()=>isSecureContext&&'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window;
 const api=async(path,method='GET',body)=>{const r=await nativeFetch(path,{method,credentials:'same-origin',headers:body?{'content-type':'application/json'}:{},...(body?{body:JSON.stringify(body)}:{})});const x=await r.json();if(!r.ok)throw Error(x.error||'Bildirim ayarı kaydedilemedi.');return x};
 const keyBytes=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 const status=text=>{const el=document.getElementById('rafexPushStatus');if(el)el.textContent=text};
 async function reg(){return registration||(registration=await navigator.serviceWorker.register('/push-service-worker.js',{scope:'/push-notifications/',updateViaCache:'none'}))}
 async function activeRegistration(){const r=await reg();if(!r.active)await new Promise((resolve,reject)=>{const w=r.installing||r.waiting;if(!w)return reject(Error('Bildirim hizmeti başlatılamadı.'));const timer=setTimeout(()=>reject(Error('Bildirim hizmeti zaman aşımına uğradı.')),15000);w.addEventListener('statechange',()=>{if(w.state==='activated'){clearTimeout(timer);resolve()}else if(w.state==='redundant'){clearTimeout(timer);reject(Error('Bildirim hizmeti yüklenemedi.'))}})});return r}
 async function paint(){
  if(!document.getElementById('todoList'))return;
  let box=document.getElementById('rafexPushSettings');if(!box){box=document.createElement('div');box.id='rafexPushSettings';box.style.cssText='padding:12px 0;display:flex;align-items:center;gap:12px;flex-wrap:wrap';box.innerHTML='<button type="button" id="rafexPushToggle">Cihaz bildirimlerini aç</button><span id="rafexPushStatus" role="status" aria-live="polite" style="font-size:12px"></span>';document.querySelector('.todo-head')?.after(box);box.querySelector('button').onclick=toggle}
  const b=box.querySelector('button');b.disabled=busy;
  if(!supported()){b.disabled=true;status(/iphone|ipad|ipod/i.test(navigator.userAgent)?'Bildirim için Safari’den Ana Ekrana Ekle ile uygulamayı yükleyip açın.':'Bu tarayıcı Web Push desteklemiyor. Chrome, Edge, Firefox veya Safari kullanın.');return}
  if(Notification.permission==='denied'){b.disabled=true;status('Bildirim izni kapalı. Tarayıcının site ayarlarından izin verebilirsiniz.');return}
  try{config=await api('/api/push/config');if(!config.enabled){b.disabled=true;status('Bildirim hizmeti hazırlanıyor.');return}const r=await reg(),sub=await r.pushManager.getSubscription();b.textContent=sub?'Bu cihazda bildirimleri kapat':'Cihaz bildirimlerini aç';status(sub?'Not atamalarını, yorumları ve kapatmaları bu cihazda alıyorsunuz.':'Not atamalarında, yorumlarda ve kapatmalarda telefonunuza veya bilgisayarınıza bildirim gelsin.');if(sub)await api('/api/push/subscription','POST',{subscription:sub.toJSON()})}catch(e){status(e.message)}
 }
 async function toggle(){
  if(busy)return;busy=true;const b=document.getElementById('rafexPushToggle');if(b)b.disabled=true;
  try{
   // The permission prompt must run directly from the user's click (iOS).
   if(Notification.permission!=='granted'&&await Notification.requestPermission()!=='granted'){status('Bildirim izni verilmedi.');return}
   const r=await activeRegistration();let sub=await r.pushManager.getSubscription();
   if(sub){await api('/api/push/subscription','DELETE',{endpoint:sub.endpoint});await sub.unsubscribe()}
   else{if(!config?.publicKey)config=await api('/api/push/config');sub=await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes(config.publicKey)});try{await api('/api/push/subscription','POST',{subscription:sub.toJSON()})}catch(e){await sub.unsubscribe();throw e}}
  }catch(e){status(e.message);return}finally{busy=false;if(b)b.disabled=false}
  await paint();
 }
 async function detach(){if(!supported())return;const r=await navigator.serviceWorker.getRegistration('/push-notifications/'),sub=await r?.pushManager.getSubscription();if(sub){await api('/api/push/subscription','DELETE',{endpoint:sub.endpoint});await sub.unsubscribe()}}
 // Remove this account's device association before its session is destroyed.
 window.fetch=async(input,init)=>{const url=new URL(typeof input==='string'?input:input.url,location.href);if(url.origin===location.origin&&url.pathname==='/api/logout'&&(init?.method||input?.method||'GET').toUpperCase()==='POST'){try{await detach()}catch{throw Error('Bildirim bağlantısı kapatılamadı. Çıkış yapmayı yeniden deneyin.')}}return nativeFetch(input,init)};
 const home=window.renderHome;if(typeof home==='function')window.renderHome=function(){const out=home.apply(this,arguments);void paint();return out};
 window.rafexWebPush={refresh:paint};
 // A push link opens the normal authenticated home page, then locates the note.
 const id=new URL(location.href).searchParams.get('note'),openComments=new URL(location.href).searchParams.get('comments')==='1';
 if(/^\d+$/.test(id||'')){
  let attempts=0,loading=false;const timer=setInterval(async()=>{if(loading)return;if(!document.getElementById('todoList')||!window.rafexNotesV405){if(++attempts>120)clearInterval(timer);return}if(typeof showClosedTodos!=='undefined'&&!showClosedTodos){showClosedTodos=true;window.renderTodoRows?.()}const target=document.querySelector('[data-note="'+id+'"]');if(target){clearInterval(timer);target.scrollIntoView({behavior:'smooth',block:'center'});target.style.outline='3px solid #f2c500';if(openComments)void window.rafexNotesV405.comments(Number(id));history.replaceState(null,'',location.pathname)}else{loading=true;try{await window.rafexNotesV405.more()}catch{}finally{loading=false}if(++attempts>30)clearInterval(timer)}},1000);
 }
 navigator.serviceWorker?.addEventListener('message',e=>{if(e.data?.type==='RAFEX_NOTE_PUSH'){window.loadTodos?.()}});
 void paint();
})();
