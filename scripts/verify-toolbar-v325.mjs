import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import{transform}from './toolbar-fixes-v325.mjs';
const source=fs.readFileSync(process.argv[2]||'../tmp/live-v316-baseline.html','utf8'),html=transform(source);
assert.equal(transform(html),html);for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('../client/toolbar-rules-v325.js',import.meta.url),'utf8'),ctx);
const indices=s=>Array.from(ctx.window.rafexEdgeIndicesV325(s));
assert.deepEqual(indices({points:[{},{}],closed:false}),[0]);assert.deepEqual(indices({points:[{},{},{},{}],closed:true}),[0,1,2,3]);assert.deepEqual(indices({points:[{},{},{},{}],closed:false,pathBreaks:[1]}),[0,2]);assert.deepEqual(indices({points:[]}),[]);
assert.equal(ctx.window.rafexToolbarMetaV325({drawing:{b2bLayout:{rowCount:2,frameDepth:1100},sideUprightHeight:10000,levels:5}}),'B2B · H: 10000 · D: 1100 · Çift · Z+4');
let cleared=0;const env={m2ActiveModule:'b2b',m2LayoutState:{selected:7},m2MultiSelect:{rackIds:new Set(),symbolIds:new Set()},m2SelectedSymbolId:null,m2SelectedNoteId:null,m2SelectedDimensionKey:null,m2CopyMode:false,m2CustomizeMode:false,m2JoinMode:false,m2ClearAllSelections:()=>cleared++,document:{addEventListener(){}}};vm.createContext(env);
const begin=html.indexOf('m2LayoutOutsidePointerHandler=(event)=>'),end=html.indexOf('\n',begin);vm.runInContext(html.slice(begin,end),env);
env.m2LayoutOutsidePointerHandler({target:{closest:s=>s.includes('summary')?{}:null}});assert.equal(cleared,0);
env.m2LayoutOutsidePointerHandler({target:{closest:()=>null}});assert.equal(cleared,1);
console.log('PASS v325: menu opening preserves selection; outside click clears; closed/open/disconnected edge indices; catalog metadata and inline syntax.');

