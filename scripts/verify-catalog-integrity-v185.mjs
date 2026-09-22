import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {mergeRackCatalog,catalogRecordFingerprint} from './stable-rack-catalog.mjs';
import {independentProject} from './independent-project-v133.mjs';
import {validateCatalogWrite} from './catalog-validation-v185.mjs';
const row=(id,name,width=2700,system='b2b')=>({id,name,system,__rafexSystem:system,drawing:{totalWidth:width,levels:4}});
const a=row(1,'A'),b=row(1,'B',3000),before=JSON.stringify([a,b]);
assert.throws(()=>mergeRackCatalog([a,b],[]),/Çakışan/);assert.equal(JSON.stringify([a,b]),before);
const imported=mergeRackCatalog([a],[b]);assert.equal(imported.entries.length,2);assert.notEqual(imported.entries[0].id,imported.entries[1].id);assert(!imported.aliases['b2b:1']);
assert.deepEqual(mergeRackCatalog(imported.entries,[b]).entries,imported.entries);
assert(!mergeRackCatalog(imported.entries,[b]).aliases['b2b:1'],'Repeated imports cannot redirect the original rack key');
assert.match(validateCatalogWrite('/api/drawing-projects/1/types','PUT',{revision:0,rackTypes:[a,b]}),/çakışıyor/);
assert.match(validateCatalogWrite('/api/projects','POST',{payload:{rackTypes:[a,b]}}),/çakışıyor/);
assert.equal(validateCatalogWrite('/api/projects','POST',{payload:{rackTypes:[a,row(1,'B',3000,'mr')]}}),null);
assert.equal(validateCatalogWrite('/api/projects','POST',{payload:{inputs:{}}}),null);
const origins=mergeRackCatalog([{...a,registryKey:'source:1'},{...row(2,'B',3000),registryKey:'source:1'}],[]);
assert.equal(origins.entries.length,2,'Same origin never discards different technical content');
assert.equal(mergeRackCatalog([a],[{...row(3,'B'),drawing:{...a.drawing,rafexSectionLetter:'B'}}]).entries.length,1);
assert.throws(()=>independentProject({payload:{rackTypes:[a,b],layout:{racks:[]}}},'copy',1234),/çakışıyor/);
for(const system of ['b2b','mr','mekik2','drive','konsol']){
 const source=[row(1,'A',2000,system),row(2,'B',3000,system)];let current=mergeRackCatalog([],source).entries;
 for(let i=0;i<25;i++){
  current=mergeRackCatalog(current,source).entries;
  assert.equal(current.length,2);assert.equal(new Set(current.map(t=>t.system+':'+t.id)).size,2);
  const copy=independentProject({payload:{rackTypes:current,layout:{racks:[{id:10,rafexSystem:system,rafexCatalogKey:system+':'+current[0].id}]}}},'copy-'+i,123456+i);
  assert.equal(copy.payload.layout.racks[0].rafexCatalogKey,system+':'+copy.payload.rackTypes[0].id);
  assert.equal(catalogRecordFingerprint(copy.payload.rackTypes[0]),catalogRecordFingerprint(current[0]));
 }
}
const code=fs.readFileSync(new URL('./drawing-catalog-v158.js',import.meta.url),'utf8');
function harness(request){
 const status={textContent:''},name={value:'Test'},window={rafexProjectIdentityV133:{uuid:'one',drawingCatalogId:48,drawingCatalogRevision:0},rafexProjectTypesV133:[row(1,'A')]};
 vm.runInNewContext(code,{window,structuredClone,Event,document:{getElementById:id=>id==='rafexProjectStartStatusV157'?status:id==='rafexAuthorityProjectName'?name:null,addEventListener(){}},req:request});
 return {window,status};
}
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve}};
{
 const gate=deferred(),writes=[];let revision=0;
 const {window}=harness(async(u,o)=>{writes.push(JSON.parse(o.body));if(writes.length===1)await gate.promise;return{revision:++revision}});
 const first=window.rafexSaveDrawingCatalogV158();await Promise.resolve();
 window.rafexProjectTypesV133.push(row(2,'B',3000));const second=window.rafexSaveDrawingCatalogV158();gate.resolve();
 assert.deepEqual(await Promise.all([first,second]),[true,true]);assert.deepEqual(writes.map(w=>w.rackTypes.length),[1,2]);assert.deepEqual(writes.map(w=>w.revision),[0,1]);
}
{
 let fails=true,writes=0;const {window,status}=harness(async()=>{writes++;if(fails)throw Error('offline');return{revision:1}});
 assert.equal(await window.rafexSaveDrawingCatalogV158(),false);assert.equal(window.rafexProjectTypesV133.length,1);assert.match(status.textContent,/offline/);
 fails=false;assert.equal(await window.rafexSaveDrawingCatalogV158(),true);assert.equal(writes,2);
}
{
 let calls=0;const {window}=harness(async()=>{calls++;return{revision:1}});
 window.rafexProjectTypesV133.push(row(1,'B',3000));assert.equal(await window.rafexSaveDrawingCatalogV158(),false);assert.equal(calls,0);
 window.rafexProjectTypesV133.pop();assert.equal(await window.rafexSaveDrawingCatalogV158(),true,'Validation failure must not leave the queue stuck');
}
{
 const gate=deferred(),writes=[];const {window}=harness(async(u,o)=>{writes.push({url:u,...JSON.parse(o.body)});if(writes.length===1)await gate.promise;return{revision:1}});
 const old=window.rafexSaveDrawingCatalogV158();await Promise.resolve();
 window.rafexProjectIdentityV133={uuid:'two',drawingCatalogId:49,drawingCatalogRevision:0};window.rafexProjectTypesV133=[row(8,'Z')];
 const fresh=window.rafexSaveDrawingCatalogV158();gate.resolve();assert.equal(await old,false);assert.equal(await fresh,true);
 assert.deepEqual(writes.map(w=>w.url),['/api/drawing-projects/48/types','/api/drawing-projects/49/types']);assert.equal(writes[1].rackTypes[0].name,'Z');
}
{
 const gate=deferred(),writes=[];const {window}=harness(async(u,o)=>{writes.push(u);if(u==='/api/drawing-projects'){await gate.promise;return{project:{id:50,revision:0}}}return{revision:1}});
 delete window.rafexProjectIdentityV133.drawingCatalogId;
 const create=window.rafexSaveNewProjectV157();await Promise.resolve();const save=window.rafexSaveDrawingCatalogV158();gate.resolve();
 assert.deepEqual(await Promise.all([create,save]),[true,true]);assert.equal(writes.length,2,'Save arriving during creation must persist its catalog');
}
{
 const {window,status}=harness(async()=>({revision:0}));assert.equal(await window.rafexSaveDrawingCatalogV158(),false);assert.match(status.textContent,/yanıtı doğrulanamadı/);
}
console.log('PASS: 5 systems × 25 import/copy cycles; collision isolation; origin/content distinction; pending changes; retry; invalid IDs; owner switches; create/save overlap; invalid acknowledgements.');
