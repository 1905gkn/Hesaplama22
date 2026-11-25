import assert from 'node:assert/strict';import vm from 'node:vm';import {transform} from './patch-rack-label-v160.mjs';
const fixture='<html><body><script>  function decorateGroup(group){}\n  function decorate(){var node=svg();if(!node)return;node.querySelectorAll("[data-rack]").forEach(decorateGroup);}</script></body></html>';
const html=transform(fixture),order=[],marks=new Map();
function node(){return {attrs:{},children:[],setAttribute(k,v){order.push('write');this.attrs[k]=String(v)},getAttribute(k){return this.attrs[k]??null},removeAttribute(k){delete this.attrs[k]},appendChild(n){this.children.push(n)},replaceChildren(){this.children=[]}}}
const racks=[{id:1,x:0,y:0,w:26,h:32,typeName:'A',b2b:{}},{id:2,x:30,y:0,w:26,h:4,typeName:'F',b2b:{mr:true},rafexSystem:'mr'},{id:3,x:60,y:0,w:26,h:32,typeName:'D',rafexSystem:'drive'}];
const groups=racks.map((r,i)=>({getAttribute:k=>k==='data-rack'?String(r.id):null,querySelectorAll:()=>[],querySelector:s=>s.includes('m2-layout-rack')?{getAttribute:k=>({x:r.x,y:r.y,width:r.w,height:r.h})[k]}:marks.get(r.id),getScreenCTM:()=>{order.push('read'+r.id);return {a:i+1,b:0}},appendChild:n=>marks.set(r.id,n)}));
const root={querySelectorAll:()=>groups},ctx={window:{addEventListener(){},rafexCommonTypeLetterScaleV65:()=>1},m2LayoutState:{racks},m2TypeColor:()=> '#c60000',NS:'svg',document:{createElementNS:node},svg:()=>root};vm.createContext(ctx);
for(const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],ctx);
ctx.decorate();assert.deepEqual(order.slice(0,3),['read1','read2','read3']);assert.equal(order.filter(x=>x.startsWith('read')).length,3);assert.equal(Number(marks.get(2).children[0].attrs['font-size']),3.84);assert.equal(marks.get(3).children[1].textContent,'Drive-In');
const baseline=[...marks.values()].map(n=>JSON.stringify(n.attrs));order.length=0;ctx.decorate();assert.equal(order.filter(x=>x==='write').length,0,'unchanged labels cause no writes');assert.deepEqual([...marks.values()].map(n=>JSON.stringify(n.attrs)),baseline);
for(const angle of [90,180,270,-90,45,360,0]){
 racks[0].angle=angle;ctx.decorate();
 const mark=marks.get(1),transform=mark.getAttribute('transform');
 assert.equal(transform,angle%360?'rotate('+(-angle%360)+' 13 16)':null);
 assert.equal(mark.children[0].textContent,'A');
}
console.log('PASS upright labels through rack rotations.');
console.log('PASS label matrices read before any DOM writes; one read per rack; unchanged labels retained; MR size and system labels preserved.');
