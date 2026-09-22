import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {transform} from './patch-free-area-preserve-v189.mjs';
const source=fs.readFileSync('dist/server/index.js','utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/),html=transform(Buffer.from(match[1],'base64').toString());
assert.equal(transform(html),html);
function extract(name){const at=html.indexOf('function '+name+'('),end=html.indexOf('\n      function ',at+1);assert(at>=0&&end>at);return html.slice(at,end);}
const ui={classList:{add(){},remove(){}},style:{}};
const state={mode:'idle',scale:.0069,racks:[{id:1,x:80,y:100,w:20,h:8,joinGroup:'pair'},{id:2,x:80,y:120,w:20,h:8,joinGroup:'pair',sharedFootWith:1}],points:[],pdfImport:{fileName:'test.pdf'},cadElements:[{type:'line'}]};
const context={m2LayoutState:state,m2LayoutSymbols:[{id:3,x:20,y:40}],m2UserNotes:[{text:'keep'}],m2LayoutZoom:1,m2AutoFillDraft:null,m2ClearMultiSelection(){},m2SetAutoFillControlsActive(){},m2RenderLayout(){},document:{getElementById:()=>ui},$:()=>ui};
const history=[];context.m2PushUndo=()=>history.push(structuredClone(state));
vm.createContext(context);vm.runInContext(['m2StartFreeArea','m2FitCompletedFreeArea','m2EndFreeAreaOpen','m2FinishFreeArea'].map(extract).join('\n'),context);
const original=JSON.stringify(state.racks),symbols=JSON.stringify(context.m2LayoutSymbols),scale=state.scale;
context.m2StartFreeArea();assert.equal(state.mode,'draw');assert.equal(JSON.stringify(state.racks),original);assert.equal(state.scale,scale);assert.equal(history.length,1);
context.m2StartFreeArea();assert.equal(history.length,1,'Repeated draw clicks must not reset content or history');
state.points=[{x:10,y:10},{x:500,y:10},{x:500,y:600}];context.m2EndFreeAreaOpen();assert.equal(state.openFinished,true);assert.equal(state.scale,scale);assert.equal(JSON.stringify(state.racks),original);
context.m2StartFreeArea();context.m2FinishFreeArea();assert.equal(state.closed,true);assert.equal(state.points.length,4);assert.equal(state.scale,scale);assert.equal(JSON.stringify(state.racks),original);assert.equal(JSON.stringify(context.m2LayoutSymbols),symbols);assert.equal(context.m2UserNotes[0].text,'keep');assert.equal(state.pdfImport.fileName,'test.pdf');
console.log('PASS: native start, repeat, open finish and closed finish preserve racks, joins, symbols, notes and scale; undo captured.');
