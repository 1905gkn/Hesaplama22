import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync(process.argv[2]||'tmp/zoom-marks/top-finishes-v382.html','utf8');
const sandbox={window:{},document:{addEventListener(){}}};vm.createContext(sandbox);
for(const marker of ['data-product-units="v377"','data-top-finishes-units="v382"','data-rafex-plan-detail="v143"']){
 const start=html.indexOf(marker),body=html.indexOf('>',start)+1,end=html.indexOf('</script>',body);assert(start>=0,marker);vm.runInContext(html.slice(body,end),sandbox);
}
for(const [name,unit] of [['Ayak','TK'],['Ayak takımı','TK'],['H Travers','TK'],['Ayak profili','AD'],['Ray','AD'],['Dübel','AD']])assert.equal(sandbox.window.rafexProductUnitLabelV382(name),unit,name);
assert.equal(sandbox.window.rafexProductUnitV377('Ayak'),'takım');
for(const system of ['drive','mekik2'])for(const [choice,color] of [['ral5010','#004f7c'],['pgv','#a8b0b3']]){
 const drawing={rafexSystem:system,mekikFootColor:choice,bays:3,depth:2,totalWidth:7000,railLength:2400,footType:90,plan:{feet:[1000],braces:[200]}};
 const plan=sandbox.window.rafexPlanDetailV143(JSON.parse(JSON.stringify(drawing)));
 assert.equal(plan.footFinish,color);assert.equal(plan.width,7000);assert.equal(plan.length,2400);
 const svg=sandbox.window.rafexRenderPlanV143(plan);assert(svg.includes('fill="'+color+'"'));assert(!svg.includes('fill="#d7d9d9"'));
 assert.equal((svg.match(/class="rafex-plan-foot-v143"/g)||[]).length,4);
}
assert(html.includes("footFinish:window.rafexPlanFinishV382(rack)"));
console.log('v382: selected finishes, JSON roundtrip, plan geometry, uppercase units and canonical API units passed');

