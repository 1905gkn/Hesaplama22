import assert from 'node:assert/strict';
import {once} from 'node:events';
import {Worker} from 'node:worker_threads';
import {groupPlacementWorkerSource} from './large-layout-render.mjs';

const transport=`
import {parentPort} from 'node:worker_threads';
globalThis.self={postMessage:data=>parentPort.postMessage(data)};
${groupPlacementWorkerSource()}
parentPort.on('message',data=>self.onmessage({data}));
`;
const worker=new Worker(new URL('data:text/javascript,'+encodeURIComponent(transport)));
try{
 const box={left:0,right:10,top:0,bottom:10};
 const corners=[{x:0,y:0},{x:10,y:0},{x:10,y:10},{x:0,y:10}];
 worker.postMessage({geometry:{
  members:[{box,corners}],
  obstacles:[{left:20,right:30,top:0,bottom:10}],
  walls:[{a:{x:15,y:20},b:{x:15,y:40}}]
 }});
 async function solve(targetDx,targetDy){
  const result=once(worker,'message');
  worker.postMessage({startDx:0,startDy:0,targetDx,targetDy});
  return (await result)[0];
 }
 assert.deepEqual(await solve(5,0),{dx:5,dy:0,exact:true});
 assert.deepEqual(await solve(10,0),{dx:10,dy:0,exact:true},'Rack edges may touch');
 const blocked=await solve(15,0);
 assert.equal(blocked.exact,false);
 assert.ok(blocked.dx<=10);
 const wall=await solve(10,25);
 assert.equal(wall.exact,false);
 assert.deepEqual(await solve(5,25),{dx:5,dy:25,exact:true},'Wall may touch the frame edge');
 console.log('PASS group worker: message transport, free movement, rack overlap, wall intersection and edge contact.');
}finally{await worker.terminate();}
