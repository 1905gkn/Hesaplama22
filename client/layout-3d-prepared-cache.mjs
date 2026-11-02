import {loadLayoutAccessories,disposeLayoutAccessories} from './layout-3d-accessories.mjs';
import {prepareNativeBatches} from './layout-3d-preparation.mjs';

// CPU-only snapshots; each viewer owns its own geometry copies and GPU buffers.
// Bound retained memory so repeated large projects cannot grow an unbounded cache.
export function createPreparedCache({maxBytes=64*1024*1024,maxEntries=1,ttl=300000,now=()=>Date.now()}={}){
 const entries=new Map();let retained=0;
 const release=e=>{retained-=e.bytes;disposeLayoutAccessories(e.value);};
 const remove=key=>{const e=entries.get(key);if(e){entries.delete(key);release(e)}};
 const clone=value=>{const arrays=new Map(),geometry=new Map(),result=new Map();for(const [id,parts] of value){if(!arrays.has(parts))arrays.set(parts,parts.map(p=>{if(!geometry.has(p.geometry))geometry.set(p.geometry,p.geometry.clone());return {...p,geometry:geometry.get(p.geometry),...(p.matrices?{matrices:p.matrices.map(m=>m.slice())}:{})}}));result.set(id,arrays.get(parts))}return result};
 const bytes=value=>{const buffers=new Set();for(const parts of value.values())for(const p of parts){for(const a of Object.values(p.geometry.attributes)){const array=a.array||a.data?.array;if(array)buffers.add(array.buffer)}if(p.geometry.index)buffers.add(p.geometry.index.array.buffer)}return [...buffers].reduce((n,b)=>n+b.byteLength,0)};
 return {
  async get(key,produce){
   for(const [k,e] of entries)if(now()-e.at>ttl)remove(k);
   if(entries.has(key)){const e=entries.get(key);entries.delete(key);entries.set(key,e);e.at=now();return clone(e.value)}
   const value=await produce(),size=bytes(value);
   if(size>maxBytes||key.length>512000)return value;
   while(entries.size&&(retained+size>maxBytes||entries.size>=maxEntries))remove(entries.keys().next().value);
   // A concurrent request may have populated this key while produce was awaited.
   remove(key);entries.set(key,{value,bytes:size,at:now()});retained+=size;return clone(value);
  },
  clear(){for(const key of [...entries.keys()])remove(key)},
  stats(){return {entries:entries.size,bytes:retained,maxBytes}}
 };
}
const cache=createPreparedCache();
export async function loadPreparedAccessories(racks,templates){
 // Snapshot geometry inputs only; templates are immutable CAD assets per page.
 // Including the full rack snapshot invalidates this work after source changes.
 const key=JSON.stringify(racks);
 return cache.get(key,async()=>{const parts=await loadLayoutAccessories(racks,undefined,templates);try{await prepareNativeBatches(parts);return parts}catch(error){disposeLayoutAccessories(parts);throw error}});
}

