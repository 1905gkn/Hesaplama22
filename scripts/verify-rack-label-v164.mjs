import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {transform} from './patch-rack-label-v160.mjs';
const input=process.argv[2]?fs.readFileSync(process.argv[2],'utf8'):'<body><script>  function decorateGroup(group){}\n  function decorate(){var node=svg();}\n</script></body>';
const html=process.argv.includes('--live')?input:transform(input);
assert(html.includes('data-rack-label="v164"'));
assert.equal(transform(html),html);
const start=html.indexOf('  function decorateGroup(group){'),end=html.indexOf('  function decorate(){var node=svg();',start);
function node(){return {attrs:{},children:[],setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},appendChild(n){this.children.push(n)},replaceChildren(){this.children=[]}}}
for(const [system,subtitle] of [['b2b',''],['mr',''],['konsol',''],['mekik2','Mekik'],['mekik','Mekik'],['fifo','Mekik'],['filo','Mekik'],['drive','Drive-In'],['drive-in','Drive-In'],['drivein','Drive-In']]){
 const rack={id:1,rafexSystem:system,typeName:'A',x:0,y:0,w:100,h:100},group=node();group.attrs['data-rack']='1';
 group.querySelectorAll=()=>[];group.querySelector=()=>group.children[0];group.getScreenCTM=()=>({a:1,b:0});
 const ctx={m2LayoutState:{racks:[rack]},document:{createElementNS:node},NS:'svg',m2TypeColor:()=> '#123456',group};
 vm.runInNewContext(html.slice(start,end)+'decorateGroup(group);',ctx);
 assert.deepEqual(group.children[0].children.map(n=>n.textContent),subtitle?['A',subtitle]:['A'],system);
 assert.equal(group.children[0].attrs['aria-label'],subtitle?'A '+subtitle:'A');
 assert(group.children[0].children.every(n=>n.attrs.fill==='#123456'));
}
console.log('PASS: only Drive-In/Mekik subtitles; all section letters and colors preserved.');
