import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {inventorySystem,konsolInventory} from './inventory-system-quantities-v112.mjs';
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'rafex-inventory-'));
fs.mkdirSync(path.join(fixture,'dist/server'),{recursive:true});
const file=path.join(fixture,'dist/server/index.js');
const baseline=fs.readFileSync('portal.html','utf8');
fs.writeFileSync(file,"const HTML_BASE64 = '"+Buffer.from(baseline).toString('base64')+"';");
execFileSync(process.execPath,[path.resolve('scripts/patch-dist-version-badge-position-v1.mjs')],{cwd:fixture});
const html=Buffer.from(fs.readFileSync(file,'utf8').match(/HTML_BASE64\s*=\s*["']([^"']+)/)[1],'base64').toString();
const runtime=html.match(/<script data-rafex-layout-inventory="v44">([\s\S]*?)<\/script>/)[1];
assert.equal(html.split('<script data-rafex-layout-inventory="v44">').length-1,1,'Old inventory runtimes must be removed');
execFileSync(process.execPath,[path.resolve('scripts/patch-dist-version-badge-position-v1.mjs')],{cwd:fixture});
const second=Buffer.from(fs.readFileSync(file,'utf8').match(/HTML_BASE64\s*=\s*["']([^"']+)/)[1],'base64').toString();
assert.equal(second.split('<script data-rafex-layout-inventory="v44">').length-1,1);
new vm.Script(runtime);
const state={racks:[]};
const host={dataset:{},classList:{remove(){}},innerHTML:''};
const context=vm.createContext({m2LayoutState:state,m2LayoutSymbols:[],window:{rafexMrQuantitySummaryV42:()=>[{item:'MR ayak',qty:4,spec:'MR',unit:'adet'}]},document:{getElementById:()=>host,querySelectorAll:()=>[]}});
const start=runtime.indexOf('  function esc('),end=runtime.indexOf('  function schedule(',start);
vm.runInContext(runtime.slice(start,end),context);
const channel={bays:2,levels:3,depth:4,palW:1200,plan:{feet:[1100,1100],braces:[500]},systemType:'fifo'};
const all=[{id:1,rafexSystem:'b2b',levels:3,b2bLayout:{rowCount:1,sectionWidth:2700},b2b:{}},{...channel,id:2,rafexSystem:'mekik2'},{...channel,id:3,rafexSystem:'drive'},{id:4,rafexSystem:'mr',b2bLayout:{}},{id:5,rafexSystem:'konsol',konsol:{count:2,levels:4,side:'single',height:4000,arm:1000}},{id:6}];
for(const system of ['b2b','mekik2','drive','mr','konsol','unknown']){
 state.racks=all.filter(r=>inventorySystem(r)===system);
 const expected=JSON.stringify(context.rows(system));
 assert.notEqual(expected,'[]',system+' needs its own rows');
 state.racks=all;
 assert.equal(JSON.stringify(context.rows(system)),expected,system+' must ignore every other system');
}
context.render(true);
const b2b=state.racks[0];
b2b.footLy=1200;b2b.sideUprightHeight=5500;b2b.b2bLayout.frameDepth=1100;b2b.depthMm=2500;
const foot=context.rows('b2b').find(row=>row.name==='Ayak takımı');
assert.match(foot.spec,/Yükseklik 5.500 mm · Derinlik 1.100 mm/);
assert(!foot.spec.includes('2.500'),'Double-row depth is not individual frame depth');
assert(!foot.spec.includes('1.200'),'Ly is not upright height');
context.m2B2BEffectiveFootHeight=()=>6000;
context.m2B2BFootDepth=()=>1000;
assert.match(context.rows('b2b').find(row=>row.name==='Ayak takımı').spec,/Yükseklik 6.000 mm · Derinlik 1.000 mm/);
b2b.b2b.collectionLevels={enabled:true,groundGap:430,floors:[{traverse:'ZS55|1.5',trayWidth:300,trayThickness:.8,height:500},{traverse:'ZS65|2',trayWidth:250,trayThickness:1,height:500}]};
let collectionRows=context.rows('b2b').filter(row=>row.name.startsWith('Toplama Katı'));
assert.deepEqual(JSON.parse(JSON.stringify(collectionRows)),[
 {name:'Toplama Katı Tava',spec:'250 mm · 1 mm',unit:'adet',qty:11},
 {name:'Toplama Katı Tava',spec:'300 mm · 0,8 mm',unit:'adet',qty:9},
 {name:'Toplama Katı ZS Travers',spec:'ZS55 · 1,5 mm · L 2.700 mm',unit:'adet',qty:2},
 {name:'Toplama Katı ZS Travers',spec:'ZS65 · 2 mm · L 2.700 mm',unit:'adet',qty:2}
]);
const collectionSignature=context.inventorySignature();b2b.b2b.collectionLevels.floors[0].trayWidth=250;
assert.notEqual(context.inventorySignature(),collectionSignature,'Collection changes must refresh the visible inventory');
b2b.b2b.collectionLevels.floors[0].trayWidth=300;
context.m2CorporateHeader=title=>'<header>'+title+'</header>';
context.m2CorporateBomTable=(title,rows)=>'<table data-title="'+title+'">'+JSON.stringify(rows)+'</table>';
const pdfPages=context.inventoryPdfPages([],{unitEach:'adet'}).join('');
for(const row of context.rows('b2b'))assert(pdfPages.includes(JSON.stringify({item:row.name,spec:row.spec,qty:row.qty,unit:row.unit})),'PDF must use the exact visible inventory row: '+row.name);
for(const title of ['B2B ÜRÜNLERİ','MEKİK ÜRÜNLERİ','DRIVE-IN ÜRÜNLERİ','MR ÜRÜNLERİ','KONSOL KOLLU ÜRÜNLERİ','SİSTEM BİLGİSİ EKSİK'])assert(host.innerHTML.includes(title));
const count=(r,name)=>r.find(x=>x.name===name)?.qty;
assert.equal(count(context.rows('konsol'),'Konsol kolu'),8);
state.racks.push({...structuredClone(all[4]),id:7});
assert.equal(count(context.rows('konsol'),'Konsol kolu'),16);
const before=context.inventorySignature();state.racks[4].konsol.side='double';
assert.notEqual(context.inventorySignature(),before);
assert.equal(count(context.rows('konsol'),'Konsol kolu'),24);
for(let legs=2;legs<=20;legs++)for(const side of ['single','double']){
 const result=konsolInventory({konsol:{count:legs,levels:5,side,height:4000}});
 assert.equal(count(result,'Konsol ayak'),legs);
 assert.equal(count(result,'Konsol kolu'),legs*5*(side==='double'?2:1));
 assert.equal(result.filter(x=>x.unit==='set').reduce((s,r)=>s+parseInt(r.name)*r.qty,0),legs);
}
assert.equal(inventorySystem({rafexSystem:'konsol',b2bLayout:{},systemType:'fifo'}),'konsol');
assert.equal(inventorySystem({rafexSystem:'drive',systemType:'fifo'}),'drive');
assert.equal(inventorySystem({plan:{mr:true}}),'mr');
assert.equal(inventorySystem({}),'unknown');
delete context.window.rafexMrQuantitySummaryV42;
assert(!context.rows('mr').some(r=>r.name==='Ray'),'MR must never fall through to channel BOM');
const addPatch=fs.readFileSync('scripts/patch-add-current-drawing-v113.mjs','utf8');
const patchedBlock=addPatch.slice(addPatch.indexOf('const newBlock='));
assert(patchedBlock.indexOf('drawing = m2LastDrawing;')<patchedBlock.indexOf('const selectedType = m2SavedRackTypes[m2SelectedSavedType];'),'Current editor drawing must take priority over the selected saved type');
assert.match(patchedBlock,/const liveB2B = b2bReadInputState\(\);/,'Current B2B inputs must be read when adding the live drawing');
assert.match(patchedBlock,/drawing = \{ \.\.\.drawing, b2b:liveB2B \};/,'Live collection levels must be merged into the placed rack');
console.log('PASS: emitted runtime compiles; five systems isolated; collection rows refresh and feed PDF exactly; current editor drawing is added before saved fallback.');
