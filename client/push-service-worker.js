self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{}}catch{}
 if(data.kind==='project-approved'){
  const approvalId=typeof data.approvalId==='string'&&/^[a-f0-9]{48}$/.test(data.approvalId)?data.approvalId:'project';
  event.waitUntil(Promise.all([self.registration.showNotification('RAFEX — Proje onaylandı',{body:String(data.body||'Müşteriniz projeyi onayladı.').slice(0,220),icon:'/app-icon-192.png',badge:'/app-icon-192.png',tag:'rafex-approval-'+approvalId,data:{url:'/?customerShares=1'}}),self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>clients.forEach(client=>client.postMessage({type:'RAFEX_PROJECT_APPROVED'})))]));return;
 }
 const id=Number(data.noteId),safeId=Number.isSafeInteger(id)&&id>0?id:null,notificationId=Number(data.notificationId),kind=['assignment','comment','closed'].includes(data.kind)?data.kind:'assignment';
 const text={assignment:['Yeni not','Size yeni bir not atandı.'],comment:['Yeni yorum','Bir notunuza yeni yorum eklendi.'],closed:['Not kapatıldı','Bir katılımcı notu kendi listesinde kapattı.']}[kind];
 const url=safeId?'/?note='+safeId+(kind==='comment'?'&comments=1':'')+(Number.isSafeInteger(notificationId)&&notificationId>0?'&notification='+notificationId:''):'/';
 event.waitUntil(Promise.all([
  self.registration.showNotification('RAFEX — '+text[0],{body:text[1]+' Görüntülemek için dokunun.',icon:'/app-icon-192.png',badge:'/app-icon-192.png',tag:Number.isSafeInteger(notificationId)&&notificationId>0?'rafex-notification-'+notificationId:safeId?'rafex-note-'+safeId:'rafex-note',data:{url}}),
  self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>clients.forEach(client=>client.postMessage({type:'RAFEX_NOTE_PUSH'})))
 ]));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();const url=new URL(event.notification.data?.url||'/',self.location.origin);
 if(url.origin!==self.location.origin)return;
 event.waitUntil(self.clients.openWindow(url.href));
});