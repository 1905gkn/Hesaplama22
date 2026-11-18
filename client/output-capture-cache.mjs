// Cached pixels are disposable. Saved dimensions, cameras and project records
// remain authoritative; every renderer build and input change gets a new key.
export function createCaptureCache({storage,now=()=>Date.now(),maxBytes=24*1024*1024,maxEntries=64,ttl=7*86400000}={}){
 let queue=Promise.resolve();
 return {
  async get(key){if(!key)return null;try{const record=await storage.read(key);return record&&now()-record.at<=ttl?record.src:null;}catch{return null;}},
  put(key,src){if(!key||typeof src!=='string'||src.length*2>maxBytes)return Promise.resolve();
   const task=queue.then(()=>storage.write({key,src,bytes:src.length*2,at:now()},{maxBytes,maxEntries,expireBefore:now()-ttl})).catch(()=>{});queue=task;return task;
  }
 };
}
export function browserCaptureStorage(env=globalThis){
 let database;
 const open=()=>database??=(new Promise(resolve=>{
  if(!env.indexedDB){resolve(null);return;}let settled=false;
  const finish=value=>{if(settled){value?.close();return;}settled=true;env.clearTimeout(timer);resolve(value);};
  const timer=env.setTimeout(()=>finish(null),250),request=env.indexedDB.open('rafex-section-captures-v579',1);
  request.onupgradeneeded=()=>{for(const name of ['images','meta'])if(!request.result.objectStoreNames.contains(name))request.result.createObjectStore(name);};
  request.onsuccess=()=>finish(request.result);request.onerror=request.onblocked=()=>finish(null);
 })).catch(()=>null);
 return {
  async read(key){const db=await open();if(!db)return null;return new Promise(resolve=>{
   const tx=db.transaction(['images','meta']),image=tx.objectStore('images').get(key),meta=tx.objectStore('meta').get(key);let done=false;
   const timer=env.setTimeout(()=>{done=true;resolve(null);},100);
   const finish=value=>{if(done)return;done=true;env.clearTimeout(timer);resolve(value);};
   tx.oncomplete=()=>finish(meta.result&&typeof image.result==='string'?{...meta.result,src:image.result}:null);tx.onabort=tx.onerror=()=>finish(null);
  });},
  async write(record,{maxBytes,maxEntries,expireBefore}){const db=await open();if(!db)return;return new Promise(resolve=>{
   const tx=db.transaction(['images','meta'],'readwrite'),images=tx.objectStore('images'),meta=tx.objectStore('meta'),all=meta.getAll();
   const timer=env.setTimeout(()=>{try{tx.abort();}catch{}resolve();},1500);
   all.onsuccess=()=>{
    const retained=[];for(const item of all.result){if(item.key===record.key||item.at<expireBefore){images.delete(item.key);meta.delete(item.key);}else retained.push(item);}
    retained.sort((a,b)=>a.at-b.at);let bytes=retained.reduce((sum,item)=>sum+item.bytes,record.bytes),count=retained.length+1;
    while(retained.length&&(bytes>maxBytes||count>maxEntries)){const item=retained.shift();bytes-=item.bytes;count--;images.delete(item.key);meta.delete(item.key);}
    const {src,...metadata}=record;images.put(src,record.key);meta.put(metadata,record.key);
   };
   tx.oncomplete=tx.onabort=tx.onerror=()=>{env.clearTimeout(timer);resolve();};
  });}
 };
}
export async function captureCacheKey(signature,{owner,build,crypto=globalThis.crypto}={}){
 if(owner==null||!build||!crypto?.subtle)return null;
 const bytes=new TextEncoder().encode(JSON.stringify(['section-v579',String(owner),build,signature]));
 const digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
}
