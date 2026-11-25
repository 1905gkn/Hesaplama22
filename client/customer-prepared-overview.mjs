import {rackParts} from './layout-3d-geometry.mjs';
import {rackGeometryKey} from './layout-3d-pallet-key.mjs';
import {upgradeMekikStepped} from './mekik-stepped.mjs';
import {normalizeCollectionOnlyLayout} from './collection-only-layout-v587.mjs';
import {overviewKinds} from './customer-overview-wire.mjs';

export function customerOverviewParts(rack){
 return rackParts(rack,{simple:true});
}

// Keep the optional cache small so it cannot dominate the initial share payload.
export async function prepareCustomerOverview(racks){
 const templates=[],indices=new Map(),refs=[];
 const limit=1500000;
 let bytes=0,lastYield=performance.now();
 for(const original of racks){
  if(performance.now()-lastYield>10){
   await new Promise(resolve=>setTimeout(resolve,0));
   lastYield=performance.now();
  }
  const rack=upgradeMekikStepped(normalizeCollectionOnlyLayout(original));
  const key=rackGeometryKey(rack);
  if(!indices.has(key)){
   const parts=customerOverviewParts(rack).map(p=>[
    overviewKinds.indexOf(p.kind),p.x,p.y,p.z,p.w,p.h,p.d,p.rx,p.rz,p.palletWeight??null
   ]);
   const size=JSON.stringify(parts).length;
   if(bytes+size>limit){indices.set(key,-1);continue;}
   bytes+=size;
   indices.set(key,templates.length);templates.push(parts);
  }
  const index=indices.get(key);
  if(index>=0)refs.push([String(original.id),index]);
 }
 return refs.length?{version:1,templates,refs}:null;
}

