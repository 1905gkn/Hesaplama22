// Keep the synchronous WASM solver away from pointer/keyboard processing.
// Copy only job inputs: authoritative CAD buffers must never be transferred.
let worker=null,sequence=0;
const pending=new Map();
function fail(error){for(const job of pending.values())job.reject(error);pending.clear();worker?.terminate();worker=null;}
export async function simplifyCad(args){
 if(typeof Worker==='undefined'){
  const {MeshoptSimplifier}=await import('./cad-render-simplifier.mjs');
  await MeshoptSimplifier.ready;
  return MeshoptSimplifier.simplifyWithAttributes(...args);
 }
 if(!worker){
  worker=new Worker('/cad-simplify-worker.js?v=577',{type:'module'});
  worker.onmessage=({data})=>{const job=pending.get(data.id);if(!job)return;pending.delete(data.id);if(data.message)job.reject(Error(data.message));else job.resolve([data.indices,data.error]);};
  worker.onerror=event=>fail(Error(event.message||'CAD arka plan işlemi başlatılamadı.'));
  worker.onmessageerror=()=>fail(Error('CAD arka plan yanıtı okunamadı.'));
 }
 const copied=args.map(a=>ArrayBuffer.isView(a)?a.slice():a),id=++sequence;
 return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});try{worker.postMessage({id,args:copied},copied.filter(ArrayBuffer.isView).map(a=>a.buffer));}catch(error){pending.delete(id);reject(error);}});
}
