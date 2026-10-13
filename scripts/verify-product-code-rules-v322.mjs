import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {transform} from './product-codes-v322.mjs';
const context={};vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../client/product-code-rules-v322.js',import.meta.url),'utf8'),context);
const rules=context.rafexProductCodeRulesV322;
for(const [input,result] of [[1.5,'150'],[2,'200'],['2,5','250'],[3,'300']])assert.equal(rules.thickness(input),result);
for(const [input,threshold,result] of [[4200,10000,'04200'],[10000,10000,'10000'],[600,1000,'0600'],[1000,1000,'1000']])assert.equal(rules.dimension(input,threshold),result);
assert.equal(rules.shim(90),'SIMK100090100');assert.equal(rules.shim(100),'SIMK100090100');
assert.equal(rules.shim(120),'SIMK120100');assert.equal(rules.shim(127),'SIMK12725016010');assert.equal(rules.shim(140),'SIM140100');
assert.equal(rules.weldedShoe(90),'APKHR090');assert.equal(rules.weldedShoe(140),'APKHR120240140');
assert.equal(rules.shim(80),'');assert.equal(rules.dimension(-1,1000),'');assert.equal(rules.thickness('unknown'),'');
assert.equal(rules.frame('HR100.80.2,0',4200,1100),'HR100042001100200');
assert.equal(rules.frame('HR090.80.2,5',10000,800),'HR09010000800250');
assert.equal(rules.ccBeam('CC150x50x1,50 ST52',3600),'CCT1503600150050150');
assert.equal(rules.ccBeam('CC80x50x1,50 ST37',600),'CCT0800600080050150');
assert.equal(rules.ccBeam('Kutu140x50x1,50 ST52',3600),'');
assert.equal(rules.codeFor('Düz arabağ','200 × 200 mm · galvaniz'),'DAB900200');
assert.equal(rules.codeFor('Düz arabağ','1.000 × 200 mm · galvaniz'),'DAB901000');
if(process.argv[2]){
  const original=fs.readFileSync(process.argv[2],'utf8'),html=transform(original);
  assert.equal(transform(html),html);
  for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
  function inventory(source){
    const begin=source.indexOf('  function rows(targetSystem){'),end=source.indexOf('  function inventoryPdfPages(',begin);
    assert(begin>0&&end>begin);
    const racks=[90,100,120,127,140].map((width,index)=>({id:index+1,rafexSystem:'b2b',footProfile:'HR'+width+'.80.2,0',sideUprightHeight:4200,levels:3,b2bLayout:{rowCount:2,sectionWidth:3600,frameDepth:1100},b2b:{traverseType:'CC150x50x1,50 ST52'}}));
    const env={window:{rafexProductCodeRulesV322:rules,rafexSharedFramesV255:{stations:()=>new Map(racks.map(r=>[r.id,Array.from({length:4},()=>({product:{profile:r.footProfile,height:4200,depth:1100}}))]))}},m2LayoutState:{racks},racks:()=>racks,rackSystem:r=>r.rafexSystem,n:v=>Math.max(0,Math.round(Number(v)||0)),textNumber:v=>Number(v).toLocaleString('tr-TR'),sharedRows:()=>0,m2B2BEffectiveFootHeight:r=>r.sideUprightHeight,m2B2BFootDepth:r=>r.b2bLayout.frameDepth,m2B2BVisibleTraverseLevels:r=>r.levels,b2bStraightTiePlan:()=>({count:2,length:200,width:200}),b2bAccessoryRows:()=>[]};
    vm.createContext(env);vm.runInContext(source.slice(begin,end)+'\nresult=rows("b2b");',env);return Array.from(env.result);
  }
  const before=inventory(original),after=inventory(html);
  const totals=rows=>Object.fromEntries(rows.reduce((map,r)=>map.set(r.name,(map.get(r.name)||0)+r.qty),new Map()));
  assert.deepEqual(totals(after),totals(before));
  assert.equal(after.filter(r=>r.name==='Ayak pabucu').length,5);
  assert.equal(after.filter(r=>r.name==='Şim').length,5);
  assert(after.some(r=>r.spec.startsWith('SIMK12725016010 ·')));
  assert(after.some(r=>r.spec.startsWith('APKHR120240140 ·')));
  assert(after.some(r=>r.spec.startsWith('CCT1503600150050150 ·')));
  assert(html.includes('class="rafex-product-code"'));
}
console.log('PASS v322: confirmed frame/CC codes, dimension boundaries, profile-specific shoes/shims, unchanged inventory quantities and inline syntax.');

