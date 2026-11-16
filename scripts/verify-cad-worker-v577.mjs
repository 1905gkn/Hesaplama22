import assert from 'node:assert/strict';
import {Worker as NodeWorker} from 'node:worker_threads';
import * as T from 'three';
const workers=[];
globalThis.Worker=class{
 constructor(){
  const entry=new URL('../client/cad-simplify-worker.entry.js',import.meta.url).href;
  this.node=new NodeWorker(`const {parentPort}=require('node:worker_threads');globalThis.self={postMessage:(data,transfer)=>parentPort.postMessage(data,transfer)};import(${JSON.stringify(entry)}).then(()=>parentPort.on('message',data=>self.onmessage({data})));`,{eval:true});
  this.node.on('message',data=>this.onmessage?.({data}));this.node.on('error',error=>this.onerror?.(error));workers.push(this.node);
 }
 postMessage(data,transfer){this.node.postMessage(data,transfer);}
 terminate(){return this.node.terminate();}
};
try{
 const {simplifyCad}=await import('../client/cad-simplify-job.mjs');
 const g=new T.BoxGeometry(1,2,3,100,100,100),index=new Uint32Array(g.index.array),position=g.attributes.position.array,normal=g.attributes.normal.array;
 const original=position.slice(),bytes=position.byteLength;let ticks=0;const timer=setInterval(()=>ticks++,1);
 const [indices,error]=await simplifyCad([index,position,3,normal,3,[.00001,.00001,.00001],new Uint8Array(position.length/3),7200,.0001,['Permissive','LockBorder','ErrorAbsolute']]);
 clearInterval(timer);assert(ticks>0,'main thread must remain responsive');assert.equal(position.byteLength,bytes);assert.deepEqual(position,original);assert(indices.length<index.length);assert(error<=.0001);
 console.log(JSON.stringify({worker:true,mainThreadTicks:ticks,sourceBuffersPreserved:true,trianglesBefore:index.length/3,trianglesAfter:indices.length/3}));
}finally{await Promise.all(workers.map(w=>w.terminate()));delete globalThis.Worker;}
