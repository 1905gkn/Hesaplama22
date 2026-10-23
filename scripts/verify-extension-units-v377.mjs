import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {transform as extension} from './extension-priority-v376.mjs';
import {transform as units} from './product-units-v377.mjs';
const html=fs.readFileSync(process.argv[2]||'dist/index.html','utf8');
assert(html.includes('data-extension-priority="v376"'));assert(html.includes('data-product-units="v377"'));
assert.equal(extension(html),html);assert.equal(units(html),html);
assert(html.indexOf('data-extension-priority="v376"')<html.indexOf('data-precise-measures="v364"'));
let parsed=0;for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){if(!match[1].trim())continue;new vm.Script(match[1]);parsed++;}
const script=tag=>html.match(new RegExp('<script '+tag+'>([\\s\\S]*?)<\\/script>'))?.[1];
const listeners=new Map(),state={m2AutoFillDraft:null,m2LayoutState:{mode:'idle',drag:null},window:{},calls:[],document:{addEventListener:(type,fn)=>{const handlers=listeners.get(type)||[];handlers.push(fn);listeners.set(type,handlers);}},m2SvgPoint:e=>({x:e.clientX*2,y:e.clientY*3}),m2CommitAutoFillGuide(point){state.calls.push({point,system:state.m2AutoFillDraft.rafexSystem});state.m2AutoFillDraft=null;},Date};
vm.createContext(state);vm.runInContext(script('data-extension-priority="v376"'),state);
// A later measurement capture listener reproduces the original conflict.
let measurements=0;listeners.get('pointerdown').push(()=>measurements++);
const svg={},target={closest:s=>s==='#m2LayoutSvg'?svg:null};
function send(type,extra={}){const e={type,target,button:0,detail:1,clientX:20,clientY:30,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra};for(const fn of listeners.get(type)||[]){fn(e);if(e.stopped)break;}return e;}
for(const hit of ['wall label','rack gap label','edge label','free distance','preview label','rack','column','blank canvas'])for(const system of ['b2b','mr']){state.m2AutoFillDraft={rafexSystem:system};const count=state.calls.length;assert(send('pointerdown').prevented,hit);assert.equal(state.calls.length,count+1);assert.equal(state.calls.at(-1).point.x,40);assert.equal(state.calls.at(-1).point.y,90);assert.equal(state.calls.at(-1).system,system);assert.equal(state.m2AutoFillDraft,null);assert.equal(measurements,0);assert(send('click').stopped);assert(send('dblclick').stopped);}
send('pointerdown');assert.equal(measurements,1,'Normal dimension editing resumes after completion');
state.m2AutoFillDraft={};send('pointerdown',{button:2});assert.equal(state.calls.length,16,'Right click does not commit');
send('pointerdown',{target:{closest:()=>null}});assert.equal(state.calls.length,16,'Toolbar/manual input remains independent');
state.m2LayoutState.mode='draw';send('pointerdown');assert.equal(state.calls.length,16,'Area drawing preserved');state.m2LayoutState.mode='idle';
assert(!send('click',{detail:0}).stopped,'Keyboard activation preserved');assert(!send('click',{clientX:100}).stopped,'Other controls/locations preserved');
vm.runInContext(script('data-product-units="v377"'),state);
for(const name of ['Ayak takımı','Ayak takimi','Ayak','Konsol ayak','H Travers','H-travers'])assert.equal(state.window.rafexProductUnitV377(name),'takım',name);
for(const name of ['Ayak profili','Ayak Profili','Ayak pabucu','UAKS ayak koruma','UAKZ ayak koruma','Travers','Düz arabağ','Tava','Yatay çapraz seti','2’lü çapraz seti','Ray','Şim'])assert.equal(state.window.rafexProductUnitV377(name),'adet',name);
// Exercise the real shared inventory and its PDF/Excel/snapshot consumers.
const marker=html.indexOf('window.rafexLayoutInventoryRowsV44=rows;'),start=html.lastIndexOf('<script',marker),end=html.indexOf('</script>',marker);
let inventory=html.slice(html.indexOf('>',start)+1,end);inventory=inventory.slice(0,inventory.indexOf('  function inventoryPdfPages'))+'window.rafexLayoutInventoryRowsV44=rows;})();';
const context={window:{rafexProductUnitV377:state.window.rafexProductUnitV377,rafexProductCodeRulesV322:{codeFor:()=>null},rafexSharedFramesV255:{stations:()=>new Map([[1,[{product:{profile:'HR90',height:4900,depth:1100}},{product:{profile:'HR90',height:4900,depth:1100}}]]])}},m2LayoutState:{racks:[]},m2LayoutSymbols:[],sharedRows:()=>0,m2B2BVisibleTraverseLevels:()=>2,console};vm.createContext(context);vm.runInContext(inventory,context);
const rack={id:1,b2b:{traverseType:'CC140',accessories:[{type:'hTraverse',levels:[1,2,3]}]},b2bLayout:{rowCount:1,sectionWidth:2700,frameDepth:1100},levels:3,footProfile:'HR90'};context.m2LayoutState.racks=[rack];
let rows=context.window.rafexLayoutInventoryRowsV44();assert.equal(rows.find(r=>r.name==='Ayak takımı').unit,'takım');assert.equal(rows.find(r=>r.name==='Ayak takımı').qty,2);assert.equal(rows.find(r=>r.name==='Travers').qty,4);assert.equal(rows.find(r=>r.name==='Travers').unit,'adet');
for(const row of rows)assert.equal(row.unit,context.window.rafexProductUnitV377(row.name));
assert.equal(rows.find(r=>r.name==='H Travers').unit,'takım');assert.equal(rows.find(r=>r.name==='H Travers').qty,3);
context.window.rafexMrQuantitySummaryV42=()=>[{item:'Ayak Profili',qty:4,unit:'takım',spec:'HR60'},{item:'Düz arabağ',qty:3,unit:'set',spec:'1000 mm'}];context.m2LayoutState.racks=[{id:2,b2b:{mr:true}}];rows=context.window.rafexLayoutInventoryRowsV44();assert(rows.every(r=>r.unit==='adet'));assert.equal(rows.find(r=>r.name==='Ayak Profili').qty,4);
const rowStart=html.indexOf('  function renderRow(row)'),rowEnd=html.indexOf('\n  function renderSection',rowStart);vm.runInContext(html.slice(rowStart,rowEnd),Object.assign(context,{esc:x=>String(x),textNumber:x=>String(x)}));
assert(context.renderRow({name:'Ayak takımı',qty:2,unit:'takım'}).includes('>2 takım</strong>'));
assert(context.renderRow({name:'Ayak profili',qty:4,unit:'adet'}).includes('>4 adet</strong>'));
console.log('PASS: '+parsed+' scripts parse; extension wins before all measurement captures for B2B/MR; one commit per gesture; normal editing, manual controls and drawing preserved; team/piece units before grouping; real native inventory quantities unchanged; number then unit.');
