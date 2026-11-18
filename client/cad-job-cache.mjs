// Cache derived render indices only. No project records, credentials or CAD
// source buffers are persisted here; exact inputs and solver options form the key.
export function createCadJobStore(env=globalThis){
 let opening;
 const open=()=>opening||=new Promise(resolve=>{
  let done=false;const finish=db=>{if(done){db?.close();return;}done=true;env.clearTimeout(timer);resolve(db);};
  const timer=env.setTimeout(()=>finish(null),250);
  try{const request=env.indexedDB.open('rafex-render-indices-587',1);request.onupgradeneeded=()=>{const s=request.result.createObjectStore('jobs',{keyPath:'key'});s.createIndex('at','at');};request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();finish(db);};request.onerror=request.onblocked=()=>finish(null);}catch{finish(null);}
 });
 return {enabled:!!env.indexedDB&&!!env.crypto?.subtle,
  async get(key){const db=await open();if(!db)return null;return new Promise(resolve=>{let complete=false;const finish=v=>{if(complete)return;complete=true;env.clearTimeout(timer);resolve(v);},timer=env.setTimeout(()=>finish(null),100);try{const r=db.transaction('jobs').objectStore('jobs').get(key);r.onsuccess=()=>finish(r.result&&Date.now()-r.result.at<30*86400000?r.result:null);r.onerror=()=>finish(null);}catch{finish(null);}});},
  async put(key,value){if(value.indices.byteLength>512*1024)return;const db=await open();if(!db)return;try{const tx=db.transaction('jobs','readwrite'),s=tx.objectStore('jobs');tx.onerror=()=>{};s.put({key,at:Date.now(),...value});const count=s.count();count.onsuccess=()=>{let excess=count.result-64;if(excess<=0)return;const cursor=s.index('at').openCursor();cursor.onsuccess=()=>{const c=cursor.result;if(c&&excess-->0){c.delete();c.continue();}};};}catch{}}
 };
}
export async function cadJobKey(args,crypto=globalThis.crypto){
 const hashes=[];
 for(const arg of args){if(ArrayBuffer.isView(arg)){const bytes=new Uint8Array(arg.buffer,arg.byteOffset,arg.byteLength),digest=await crypto.subtle.digest('SHA-256',bytes);hashes.push([arg.constructor.name,arg.length,Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('')]);}else hashes.push(arg);}
 return JSON.stringify(['meshopt-render-587',hashes]);
}
export function memoizeCadJobs(compute,{store=createCadJobStore(),keyOf=cadJobKey}={}){
 const inFlight=new Map();let hits=0,misses=0;
 const valid=(v,args)=>v?.indices instanceof Uint32Array&&v.indices.length<=args[0].length&&Number.isFinite(v.error)&&v.error>=0&&v.indices.every(i=>i<args[1].length/args[2]);
 const run=async args=>{
  if(!store.enabled)return compute(args);
  let key;try{key=await keyOf(args);}catch{return compute(args);}
  if(!inFlight.has(key)){
   const task=(async()=>{let cached;try{cached=await store.get(key);}catch{}if(valid(cached,args)){hits++;return [cached.indices,cached.error];}misses++;const result=await compute(args);if(valid({indices:result[0],error:result[1]},args))void Promise.resolve(store.put(key,{indices:result[0].slice(),error:result[1]})).catch(()=>{});return result;})();
   inFlight.set(key,task);task.finally(()=>inFlight.delete(key)).catch(()=>{});
  }
  const [indices,error]=await inFlight.get(key);return [indices.slice(),error];
 };
 run.stats=()=>({cadJobCacheHits:hits,cadJobCacheMisses:misses});return run;
}
