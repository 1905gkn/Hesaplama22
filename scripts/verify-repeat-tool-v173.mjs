import vm from 'node:vm';
import assert from 'node:assert/strict';
import {repeatTool,transform} from './patch-repeat-tool-v173.mjs';
const handlers={},calls=[],nodes={m2LayoutSvg:{getClientRects:()=>[{}]}};
const window={};
for(const [id,fn] of [['m2SeismicButton','m2OpenSeismicDialog'],['m2ProtectionButton','m2OpenProtectionDialog'],['m2SymbolButton','m2OpenSymbolDialog']]){nodes[id]={id};window[fn]=()=>calls.push(id);}
vm.runInNewContext('('+repeatTool.toString()+')()',{window,document:{addEventListener:(name,fn)=>handlers[name]=fn,getElementById:id=>nodes[id]}});
const key=(extra={})=>handlers.keydown({key:'x',ctrlKey:true,target:{closest:()=>null},preventDefault(){},stopImmediatePropagation(){},...extra});
key();assert.equal(calls.length,0);
for(const id of ['m2SeismicButton','m2ProtectionButton','m2SymbolButton']){
 handlers.click({target:{closest:()=>nodes[id]}});key({key:'Escape',ctrlKey:false});key();assert.equal(calls.at(-1),id);
}
const n=calls.length;key({target:{closest:()=>({})}});key({repeat:true});key({ctrlKey:false});nodes.m2LayoutSvg.getClientRects=()=>[];key();assert.equal(calls.length,n);
assert.equal(transform(transform('<body></body>')),transform('<body></body>'));
console.log('PASS: Ctrl+X reopens latest tool after Escape; inputs, hidden canvas, repeated keys and normal X untouched.');
