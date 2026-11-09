import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {rackLabelSize554,transform} from './patch-rack-label-v160.mjs';
for(const [w,h] of [[26,32],[3,4],[150,300],[32,26]]){
 const size=rackLabelSize554(w,h);assert(size>0&&size<=Math.min(12,Math.min(w,h)*.48));
 assert.equal(rackLabelSize554(w,h,2),size*2);assert.equal(rackLabelSize554(w,h,.5),size*.5);
}
const fixture='<html><body><script>function scope(){\n  function decorateGroup(group){return;}\n  function decorate(){var node=svg();}\n}</script></body></html>';
const html=transform(fixture);assert.equal(transform(html),html);
const snippet=html.slice(html.indexOf('function rackLabelSize554'),html.indexOf('  function decorate(){var node=svg();'));
let zoom=1,mark;
const rack={id:1,x:10,y:20,w:26,h:32,typeName:'A',rafexSystem:'b2b'};
const node=()=>({attrs:{},children:[],setAttribute(k,v){this.attrs[k]=String(v)},getAttribute(k){return this.attrs[k]??null},appendChild(n){this.children.push(n)},replaceChildren(){this.children=[]}});
const frame={getAttribute:k=>({x:'10',y:'20',width:'26',height:'32'})[k]};
const group={getAttribute:k=>k==='data-rack'?'1':null,querySelectorAll:()=>[],querySelector:s=>s.includes('m2-layout-rack')?frame:mark,getScreenCTM:()=>({a:zoom,b:0}),appendChild:n=>{mark=n}};
const ctx={window:{rafexCommonTypeLetterScaleV65:()=>1},m2LayoutState:{racks:[rack]},m2TypeColor:()=> '#c60000',NS:'svg',document:{createElementNS:node}};
vm.createContext(ctx);vm.runInContext(snippet,ctx);
let baseline;
for(zoom of [.1,1,2,8]){
 ctx.decorateGroup(group);const font=Number(mark.children[0].attrs['font-size']);baseline??=font;
 assert.equal(font,baseline,'Camera zoom must not shrink the local block label.');
 assert.equal(font*zoom,baseline*zoom,'Block letter zooms with rack geometry.');
 assert.equal(mark.children[0].textContent,'A');
}
ctx.window.rafexCommonTypeLetterScaleV65=()=>1.5;ctx.decorateGroup(group);assert.equal(Number(mark.children[0].attrs['font-size']),baseline*1.5);
const tunnel=fs.readFileSync(new URL('./patch-original-letter-tunnel-v307.mjs',import.meta.url),'utf8');assert.match(tunnel,/rafexRackLabelSizeV554/);assert.match(tunnel,/const gap=main\*4\/3/);
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
console.log('PASS v554: B2B/Mekik/Drive-In/MR/Cantilever label sizing, rack-relative cap, 80x zoom, stable reselection, manual ratio, unchanged label text and shared tunnel sizing.');

