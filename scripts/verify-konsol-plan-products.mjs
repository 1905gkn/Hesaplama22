import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('scripts/patch-free-konsol-plan-v38.mjs','utf8');
const runtime=source.split('<script data-rafex-konsol-free-plan="v38">').at(-1).split('</script>')[0];
class Element {
  constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.dataset={};this.style={setProperty:(k,v)=>this.style[k]=v};}
  setAttribute(k,v){this.attrs[k]=v;}
  appendChild(n){this.children.push(n);return n;}
  replaceChildren(fragment){this.children=fragment.children;}
  querySelector(){return this.hit;}
}
function render({load='profile',rotated=false,side='single',rows,count=1,legacy=false}={}){
  const group=new Element('g');group.dataset.rack='1';group.hit=new Element('rect');
  const rack={id:1,rafexSystem:'konsol',typeName:'D',x:10,y:20,w:rotated?122:613,h:rotated?613:122,widthMm:6130,konsol:{count:5,spacing:1500,side,loadType:load,productLength:3000,levelRows:rows}};
  if(legacy)rack.systemType='mekik2';
  let scheduled,observer,decorations=0,schedules=0;
  const groups=Array.from({length:count},(_,i)=>{const g=i?new Element('g'):group;g.dataset.rack=String(i+1);g.hit=g.hit||new Element('rect');return g;});
  const window={m2LayoutState:{racks:Array.from({length:count},(_,i)=>({...rack,id:i+1}))},rafexCommonSingleLineLetterV58:{decorate(){decorations++;}}};
  const document={readyState:'complete',body:{},createElementNS:(_,tag)=>new Element(tag),createDocumentFragment:()=>new Element('fragment'),getElementById:()=>({querySelectorAll:()=>groups})};
  vm.runInNewContext(runtime,{window,document,MutationObserver:class{constructor(fn){observer=fn;}observe(){}},requestAnimationFrame:fn=>{schedules++;scheduled=fn;return 1;}});
  scheduled();
  assert.equal(decorations,1,'All labels are decorated once per batch, not once per rack');
  observer([{addedNodes:[{nodeType:1,matches:()=>false,querySelector:()=>null}]}]);
  assert.equal(schedules,1,'Unrelated UI changes must not schedule a plan scan');
  const all=n=>[n,...n.children.flatMap(all)];
  return {group,nodes:all(group),rack};
}
for(const side of ['single','double'])for(const rotated of [false,true])for(const load of ['profile','pallet','unpacked']){
  const {group,nodes,rack}=render({side,rotated,load});
  const goods=nodes.filter(n=>n.attrs['class']==='rafex-konsol-plan-product');
  assert.equal(goods.length,load==='unpacked'?0:side==='double'?2:1);
  assert(goods.every(n=>n.attrs['data-load-type']===load));
  const label=nodes.find(n=>n.attrs['class']==='m2-rack-name');
  assert.equal(label.textContent,'D');
  assert.equal(Number(label.attrs.x),rack.x+rack.w/2);
  assert.equal(Number(label.attrs.y),rack.y+rack.h/2);
  assert.equal(group.children[0],group.hit);
  assert.equal(group.hit.style.fill,'transparent');
  assert.equal(group.hit.style.stroke,'none');
  const steel=nodes.find(n=>n.attrs['class']==='rafex-konsol-plan-steel');
  assert.equal(steel.children.filter(n=>n.tag==='rect').length,10,'Only five arms and five uprights; no extra band or outline');
}
assert.equal(render({rows:[{load:0}]}).nodes.filter(n=>n.attrs['class']==='rafex-konsol-plan-product').length,0);
render({count:500});
assert(render({legacy:true}).nodes.some(n=>n.attrs['class']==='rafex-konsol-plan-steel'),'Cantilever geometry must override inherited Mekik tag');
console.log('PASS: Konsol centered label, transparent hit area, no back band; profile/pallet/empty, single/double, rotated, zero load.');
