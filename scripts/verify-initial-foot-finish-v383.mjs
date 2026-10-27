import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const html=fs.readFileSync(process.argv[2],'utf8'),start=html.indexOf('data-initial-foot-finish="v383"');assert(start>=0);
let nodes=[];const context={window:{},document:{querySelectorAll:()=>nodes,addEventListener(){}}};vm.createContext(context);
const body=html.indexOf('>',start)+1;vm.runInContext(html.slice(body,html.indexOf('</script>',body)),context);
const pick=context.window.rafexInitialFootFinishV383;
assert.equal(pick('mekik2',null),'ral5010');assert.equal(pick('drive',null),'ral5010');
assert.equal(pick('mekik2',{rafexSystem:'drive',mekikFootColor:'pgv'}),'ral5010');
assert.equal(pick('drive',{rafexSystem:'mekik2',mekikFootColor:'pgv'}),'ral5010');
for(const system of ['mekik2','drive'])for(const color of ['ral5010','pgv'])assert.equal(pick(system,JSON.parse(JSON.stringify({rafexSystem:system,mekikFootColor:color}))),color);
nodes=[{isConnected:true,value:'pgv',getClientRects:()=>[]}];assert.equal(pick('mekik2',null),'ral5010');
nodes.push({isConnected:true,value:'ral5010',getClientRects:()=>[{}]});assert.equal(pick('mekik2',{rafexSystem:'mekik2',mekikFootColor:'pgv'}),'ral5010');assert.equal(pick('drive',null),'ral5010');
nodes[1].value='pgv';assert.equal(pick('mekik2',null),'pgv');assert.equal(pick('drive',null),'pgv');
assert(html.includes('rafexSystem:m2ActiveModule, mekikFootColor:window.rafexInitialFootFinishV383(m2ActiveModule,m2LastDrawing)'));
console.log('v383: initial RAL5010/PGV, cross-system isolation, visible choices, hidden controls and saved finishes passed');


import {heightChoiceV421,transformMekikManualHeightV421} from './initial-foot-finish-v383.mjs';
const sourceHtml421=html;
{
const html=transformMekikManualHeightV421(sourceHtml421);

for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
assert.equal(transformMekikManualHeightV421(html),html);
for(const auto of [600,4190,5770,12250]){
 assert.equal(heightChoiceV421(auto,'auto',99999).height,auto);
 for(const raw of [auto,auto+1,auto+1000])assert(heightChoiceV421(auto,'manual',raw).valid);
 for(const raw of [auto-1,0,-1,'',NaN,Infinity,auto+.5])assert(!heightChoiceV421(auto,'manual',raw).valid);
}
const fields={m2UprightModeV421:{value:'auto'},m2UprightHeightV421:{value:'',setCustomValidity(x){this.error=x},reportValidity(){this.reported=true}},m2UprightWrapV421:{},m2UprightHintV421:{style:{},setAttribute(){}},m2FloorStatus:{}};
let draws=0,saves=0;const env={window:{},document:{getElementById:id=>fields[id]},m2ActiveModule:'mekik2',m2LastDrawing:{},drawMekik2(){draws++},m2SaveRackType(){saves++;return true}};vm.createContext(env);
vm.runInContext(html.match(/<script data-mekik-manual-height="v421">([\s\S]*?)<\/script>/)[1],env);const api=env.window.rafexMekikHeightV421;
assert.equal(api.resolve(5770,'mekik2'),5770);assert(fields.m2UprightHeightV421.disabled);assert.equal(fields.m2UprightHeightV421.value,'5770');
fields.m2UprightModeV421.value='manual';fields.m2UprightHeightV421.value='6500';assert.equal(api.resolve(5770,'mekik2'),6500);assert(!fields.m2UprightHeightV421.disabled);
const drawing={rafexSystem:'mekik2',firstRailHeight:430,levels:4,levelH:1580,palletHeight:1200,sideUprightHeight:6500,...api.snapshot()};
assert(api.valid(drawing));api.restore(JSON.parse(JSON.stringify(drawing)));assert.equal(fields.m2UprightModeV421.value,'manual');assert.equal(fields.m2UprightHeightV421.value,'6500');
fields.m2UprightHeightV421.value='5769';api.resolve(5770,'mekik2');env.m2LastDrawing={...drawing,mekikManualUprightHeight:5769};assert(!api.valid(env.m2LastDrawing));
vm.runInContext(html.match(/<script data-mekik-height-save="v421">([\s\S]*?)<\/script>/)[1],env);assert.equal(env.m2SaveRackType(),false);assert.equal(saves,0);assert(fields.m2UprightHeightV421.reported);assert(fields.m2FloorStatus.textContent.includes('Kayıt yapılmadı'));
fields.m2UprightHeightV421.value='6500';api.resolve(5770,'mekik2');env.m2LastDrawing=drawing;assert(env.m2SaveRackType());assert.equal(saves,1);
// Later geometry raises the minimum; a previously valid height must stop saving.
assert.equal(api.resolve(7000,'mekik2'),7000);assert(!api.current.valid);assert.equal(env.m2SaveRackType(),false);assert.equal(saves,1);
fields.m2UprightModeV421.value='auto';api.resolve(7000,'mekik2');env.m2LastDrawing={...drawing,mekikUprightMode:'auto'};assert(env.m2SaveRackType());
assert.equal(api.resolve(4000,'drive'),4000);assert(fields.m2UprightWrapV421.hidden);env.m2ActiveModule='drive';assert(env.m2SaveRackType());
api.restore({rafexSystem:'mekik2'});assert.equal(fields.m2UprightModeV421.value,'auto');
console.log('PASS v421: 4 automatic heights, manual bounds, invalid save blocked, recalculated minimum, automatic reset, JSON reload and Drive isolation; all scripts parse.');


}
