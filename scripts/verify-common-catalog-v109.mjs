import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('scripts/patch-drive-in-mekik-v1.mjs','utf8');
const start=source.indexOf('  m2RefreshSavedRackTypes=async function(...args){');
const end=source.indexOf('  window.m2RefreshSavedRackTypes=m2RefreshSavedRackTypes;',start);
assert(start>=0&&end>start);
const records=['b2b','mekik2','drive','mr','konsol'].map((s,i)=>({id:i+1,drawing:{rafexSystem:s}}));
let common=true;
const context=vm.createContext({m2ActiveModule:'b2b',m2SavedRackTypes:records,m2SelectedSavedType:2,m2RefreshSavedRackTypes:null,baseRefreshSaved:async()=>{},isDrive:()=>context.m2ActiveModule==='drive',m2RenderSavedRackTypes:()=>{},relabelDrive:()=>{},document:{getElementById:id=>id==='page'?{dataset:{rafexFreeDrawing:common?'1':'0'},classList:{contains:()=>common}}:{}}});
vm.runInContext(source.slice(start,end),context);
for(let pass=0;pass<2;pass++)for(const system of ['b2b','mekik2','drive','mr','konsol']){
  context.m2ActiveModule=system;
  await context.m2RefreshSavedRackTypes();
  assert.equal(context.m2SavedRackTypes,records,system+' must retain the shared list');
  assert.equal(context.m2SelectedSavedType,2);
}
common=false;context.m2ActiveModule='drive';await context.m2RefreshSavedRackTypes();
assert.deepEqual(Array.from(context.m2SavedRackTypes,r=>r.drawing.rafexSystem),['drive']);
context.m2SavedRackTypes=records;context.m2ActiveModule='mekik2';await context.m2RefreshSavedRackTypes();
assert(!context.m2SavedRackTypes.some(r=>r.drawing.rafexSystem==='drive'));
const catalog=fs.readFileSync('scripts/patch-unified-free-drawing-catalog.mjs','utf8');
const a=catalog.indexOf('  function activeFirstSystems(){'),b=catalog.indexOf('  function normalizeEntry',a);
const ordering=vm.createContext({SYSTEMS:records,m2ActiveModule:'drive'});
vm.runInContext(catalog.slice(a,b),ordering);
assert.deepEqual(Array.from(ordering.activeFirstSystems(),r=>r.id),records.map(r=>r.id));
console.log('PASS: all five editors retain identical catalog and selection; order fixed; standalone Drive/Mekik filters preserved.');
