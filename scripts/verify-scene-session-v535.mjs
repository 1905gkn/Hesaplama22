import assert from 'node:assert/strict';
import * as T from 'three';
import {createPreparedSceneSession,layoutRevision,sceneBufferBytes} from '../client/layout-3d-session.mjs';

const makeHarness=options=>{
 const events=[],objects=[];let contextsDisposed=0;
 const cache=createPreparedSceneSession({
  async create(source){
   if(source.fail)throw Error('fixture load failure');
   await source.wait;
   const value={source,camera:{x:3},bytes:source.bytes||10,disposed:0,dispose(){this.disposed++;events.push('dispose:'+source.id);}};objects.push(value);return value;
  },activate(value){events.push('show:'+value.source.id);},deactivate(value){events.push('pause:'+value.source.id);},disposeSurface(){contextsDisposed++;},...options
 });return {cache,events,objects,contexts:()=>contextsDisposed};
};
const source={racks:[{id:'A',x:1,height:5,color:'ral5010'}],columns:[{x:3,z:4}],visibleClearances:[{label:'100 mm'}],selectedId:'A'};
assert.equal(layoutRevision(source),layoutRevision({...source,selectedId:'B'}));
assert.equal(layoutRevision(source),layoutRevision({visibleClearances:source.visibleClearances,columns:source.columns,racks:[{color:'ral5010',height:5,x:1,id:'A'}]}));
assert.equal(layoutRevision({x:.1+.2}),layoutRevision({x:.3}));
assert.notEqual(layoutRevision({x:.3}),layoutRevision({x:.3001}));
for(const delta of [{columns:[]},{racks:[{...source.racks[0],x:2}]},{racks:[{...source.racks[0],height:6}]},{visibleClearances:[]}])assert.notEqual(layoutRevision(source),layoutRevision({...source,...delta}));
const h=makeHarness(),a={id:'A'},b={id:'B'};h.cache.retain([['A','v1'],['B','v1']]);
const first=await h.cache.show('A','v1',a);first.value.camera.x=42;h.cache.hide();
const second=await h.cache.show('A','v1',a);assert.equal(second.reused,true);assert.equal(second.value,first.value);assert.equal(second.value.camera.x,42);
await h.cache.show('B','v1',b);assert.equal((await h.cache.show('A','v1',a)).value,first.value);
assert.deepEqual(h.cache.stats(),{builds:2,reuses:2,entries:2,bytes:20,maxBytes:256*1024*1024,sourceChanges:[]});
h.cache.retain([['A','v2']]);assert.equal(h.objects[0].disposed,1);assert.equal(h.objects[1].disposed,1);
assert.equal((await h.cache.show('A','v2',{id:'A updated'})).reused,false);
h.cache.dispose();h.cache.dispose();await Promise.resolve();await Promise.resolve();assert.equal(h.contexts(),1);assert(h.objects.every(v=>v.disposed===1));

const bounded=makeHarness({maxEntries:2,maxBytes:25});
await bounded.cache.show('A','v1',a);await bounded.cache.show('B','v1',b);await bounded.cache.show('A','v1',a);await bounded.cache.show('C','v1',{id:'C'});
assert.equal(bounded.objects[1].disposed,1);assert.equal(bounded.objects[0].disposed,0);assert.equal(bounded.cache.stats().entries,2);
await bounded.cache.show('huge','v1',{id:'huge',bytes:100});assert.equal(bounded.cache.stats().entries,1);assert.equal(bounded.cache.stats().bytes,100);bounded.cache.dispose();

let release;const wait=new Promise(resolve=>release=resolve),r=makeHarness();
const stale=r.cache.show('slow','v1',{id:'slow',wait});await Promise.resolve();const latest=r.cache.show('new','v1',{id:'new'});release();assert.equal(await stale,null);assert.equal((await latest).value.source.id,'new');assert(!r.events.includes('show:slow'));
await assert.rejects(r.cache.show('fail','v1',{id:'fail',fail:true}),/fixture load failure/);assert(await r.cache.show('new','v1',{id:'new'}));r.cache.dispose();
let done;const pending=makeHarness(),closed=pending.cache.show('pending','v1',{id:'pending',wait:new Promise(resolve=>done=resolve)});await Promise.resolve();pending.cache.dispose();done();assert.equal(await closed,null);await Promise.resolve();assert.equal(pending.objects[0].disposed,1);assert.equal(pending.contexts(),1);

const scene=new T.Scene(),geometry=new T.BoxGeometry(1,2,3),material=new T.MeshBasicMaterial(),one=new T.InstancedMesh(geometry,material,5),two=new T.InstancedMesh(geometry,material,2);scene.add(one,two);
const geometryBytes=[geometry.index,...Object.values(geometry.attributes)].reduce((n,a)=>n+a.array.byteLength,0);
assert.equal(sceneBufferBytes(scene),geometryBytes+7*16*4);
console.log('PASS immutable scene reuse, camera preservation, source/column/measure invalidation, one context, memory eviction, rapid switches, close-during-build, failure recovery and shared buffer accounting.');
