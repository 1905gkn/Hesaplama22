import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('scripts/patch-common-drawing-independent-v44.mjs','utf8');
const start=source.indexOf('  var SYSTEM_LABELS='),end=source.indexOf('  var previousRefresh=',start);
let calls=0,release;const gate=new Promise(resolve=>release=resolve),list={};
const records={ '/api/b2b-types':[{id:1,name:'B',drawing:{plan:{},b2b:{}}},{id:2,name:'R',drawing:{plan:{mr:true}}}],'/api/mekik2-types':[{id:1,name:'M',drawing:{plan:{}}},{id:2,name:'D',drawing:{plan:{},rafexSystem:'drive'}},{id:3,name:'K',drawing:{plan:{},rafexSystem:'konsol'}}]};
const ctx=vm.createContext({window:{},document:{getElementById:id=>id==='page'?{dataset:{rafexFreeDrawing:'1'}}:list},m2SavedRackTypes:[],m2SelectedSavedType:null,m2RenderSavedRackTypes:()=>{},req:async url=>{calls++;await gate;return{types:records[url]}}});
vm.runInContext(source.slice(start,end),ctx);
ctx.m2RenderSavedRackTypes();assert.match(list.textContent,/yükleniyor/);
const pending=ctx.loadCatalog(false);assert.equal(calls,2);release();await pending;
const expected=JSON.stringify(ctx.m2SavedRackTypes);assert.equal(ctx.m2SavedRackTypes.length,5);
for(const system of ['b2b','mekik2','drive','mr','konsol']){
  ctx.m2SavedRackTypes=[{id:999,name:system}];ctx.m2RenderSavedRackTypes();await ctx.loadCatalog(false);
  assert.equal(JSON.stringify(ctx.m2SavedRackTypes),expected);
}
assert.equal(calls,2,'Editor changes must use the complete cached catalog');
assert(fs.readFileSync('scripts/patch-unified-free-drawing.mjs','utf8').includes("renderEngine(free.selected&&SUPPORTED.has(free.selected)?free.selected:'mekik2',false);\n    window.rafexUnifiedCatalogSync?.();"));
console.log('PASS: first open loads both APIs before publishing five systems; local editor lists cannot replace catalog; switching uses cache.');
