import assert from 'node:assert/strict';
import {createCaptureCache,captureCacheKey} from '../client/output-capture-cache.mjs';
let time=1000;const records=new Map(),writes=[];
const storage={read:async key=>records.get(key),write:async(record,limits)=>{writes.push(limits);records.set(record.key,record);}};
const cache=createCaptureCache({storage,now:()=>time,ttl:100,maxBytes:1024,maxEntries:3});
await cache.put('one','image');assert.equal(await cache.get('one'),'image');time+=101;assert.equal(await cache.get('one'),null,'expired pixels never reused');
await cache.put('oversize','x'.repeat(600));assert(!records.has('oversize'));
await cache.put('one','updated');assert.equal(await cache.get('one'),'updated');assert.equal(writes.at(-1).maxBytes,1024);
const key=await captureCacheKey('geometry',{owner:577,build:'build-a'});
assert(key&&key.length===64);assert.notEqual(key,await captureCacheKey('geometry',{owner:578,build:'build-a'}));
assert.notEqual(key,await captureCacheKey('geometry',{owner:577,build:'build-b'}));assert.notEqual(key,await captureCacheKey('changed-geometry',{owner:577,build:'build-a'}));
assert.equal(await captureCacheKey('geometry',{owner:null,build:'build-a'}),null);
const source={options:{footHeight:6000,footColor:'ral5010'},azimuth:41,elevation:24,captureZoom:1,dimensions:{levels:true},reportLanguage:'tr'};
const sourceKey=await captureCacheKey(JSON.stringify(source),{owner:577,build:'build-a'});
for(const change of [{options:{...source.options,footHeight:6500}},{options:{...source.options,footColor:'pgv'}},{azimuth:55},{captureZoom:1.2},{dimensions:{levels:false}},{reportLanguage:'fr'}]){
 assert.notEqual(sourceKey,await captureCacheKey(JSON.stringify({...source,...change}),{owner:577,build:'build-a'}),'changed display inputs must regenerate the image');
}
const failure=createCaptureCache({storage:{read:async()=>{throw Error('blocked')},write:async()=>{throw Error('quota')}}});
assert.equal(await failure.get('x'),null);await failure.put('x','src');
console.log('PASS persisted pixels: input/build/account isolation, expiration, size limit, unavailable storage and quota failures stay optional.');
