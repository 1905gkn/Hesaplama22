self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{}}catch{}
 const id=Number(data.noteId),safeId=Number.isSafeInteger(id)&&id>0?id:null;
 event.waitUntil(Promise.all([
  self.registration.showNotification('RAFEX — Yeni not',{body:'Size yeni bir not atandı. Görüntülemek için dokunun.',icon:'/app-icon-192.png',badge:'/app-icon-192.png',tag:safeId?'rafex-note-'+safeId:'rafex-note',data:{url:safeId?'/?note='+safeId:'/'}}),
  self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>clients.forEach(client=>client.postMessage({type:'RAFEX_NOTE_PUSH'})))
 ]));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();const url=new URL(event.notification.data?.url||'/',self.location.origin);
 if(url.origin!==self.location.origin)return;
 event.waitUntil(self.clients.openWindow(url.href));
});
