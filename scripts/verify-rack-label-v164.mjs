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
 const frame=node();Object.assign(frame.attrs,{x:'0',y:'0',width:'100',height:'100'});
 group.querySelectorAll=()=>[];group.querySelector=selector=>selector.includes('m2-layout-rack')?frame:group.children[0];group.getScreenCTM=()=>({a:1,b:0});
 let ratio=1;
 const ctx={window:{rafexCommonTypeLetterScaleV65:()=>ratio},m2LayoutState:{racks:[rack]},document:{createElementNS:node},NS:'svg',m2TypeColor:()=> '#123456',group};
 vm.runInNewContext(html.slice(start,end)+'decorateGroup(group);',ctx);
 assert.deepEqual(group.children[0].children.map(n=>n.textContent),subtitle?['A',subtitle]:['A'],system);
 assert.equal(group.children[0].attrs['aria-label'],subtitle?'A '+subtitle:'A');
 assert(group.children[0].children.every(n=>n.attrs.fill==='#123456'));
 const draw=()=>vm.runInNewContext(html.slice(start,end)+'decorateGroup(group);',ctx);
 for(const value of [.1,.5,1,2]){
  ratio=value;draw();const texts=group.children[0].children;
  assert.equal(Number(texts[0].attrs['font-size']),12*value);
  assert.equal(Number(texts[0].attrs.x),50);assert.equal(Number(texts[0].attrs.y),50);
  assert.equal(texts[0].attrs['dominant-baseline'],'central');
  if(subtitle)assert.equal(Number(texts[1].attrs['font-size']),10*value);
 }
 rack.b2b={tunnelHeight:3600};draw();assert(Number(group.children[0].children[0].attrs.y)<50);
 rack.b2b.tunnelHeight=0;draw();assert.equal(Number(group.children[0].children[0].attrs.y),50);
 const unchanged=group.children[0].children[0];draw();assert.equal(group.children[0].children[0],unchanged);
 rack.x=12000;rack.y=-4500;draw();
 assert.equal(Number(group.children[0].children[0].attrs.x),50,'Translated group must retain local center');
 assert.equal(Number(group.children[0].children[0].attrs.y),50,'Model movement must not shift label twice');
 Object.assign(frame.attrs,{x:'12000',y:'-4500'});draw();
 assert.equal(Number(group.children[0].children[0].attrs.x),12050,'Full redraw uses new frame');
 assert.equal(Number(group.children[0].children[0].attrs.y),-4450);
}
console.log('PASS: 10/50/100/200 percent scales; centered names; upward shift only with tunnel; restore center; unchanged no DOM writes; only Drive-In/Mekik subtitles; colors preserved.');
