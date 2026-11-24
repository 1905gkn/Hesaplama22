import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {spacing557,sync557,transform} from './mekik-clearance-v557.mjs';
for(const rail of [150,170])for(const ph of [800,1200,1450]){
 const total={value:String(spacing557(ph,rail)),dataset:{}},gap={value:'150'},fields={m2LevelSpacing:total,m2PalletClearance557:gap};
 globalThis.document={getElementById:id=>fields[id],activeElement:null};
 assert.equal(sync557(null,ph,rail),ph+410);assert.equal(gap.value,'150');
 assert.equal(sync557({target:{id:'m2LevelH'}},ph+100,rail),ph+100+410);
 gap.value='200';assert.equal(sync557({target:{id:'m2PalletClearance557'}},ph,rail),ph+460);
 total.value=String(ph+600);assert.equal(sync557({target:{id:'m2LevelSpacing'}},ph,rail),ph+600);assert.equal(Number(gap.value),600-260);
 // Reopening saved spacing retains its value rather than replacing it with a default.
 total.dataset={};total.value=String(ph+530);assert.equal(sync557(null,ph,rail),ph+530);
}
const viewer=fs.readFileSync('client/mekik-front-viewer.entry.js','utf8');
const syncSource=viewer.slice(viewer.indexOf('function traverseProfileHeight('),viewer.indexOf('function updateTraverseChoice('));
for(const rail of [150,170]){
 const gap={value:'150'},total={value:String(spacing557(1200,rail)),dataset:{netClearance557:'150'},
  addEventListener(){},closest(){return null;},dispatchEvent(){sync557(null,1200,rail);}};
 globalThis.document={getElementById:id=>({m2LevelSpacing:total,m2PalletClearance557:gap})[id],activeElement:null};
 const sync=vm.runInNewContext(syncSource+';syncMekikLevelSpacing',{liveField:()=>total,numberFrom:id=>id==='m2RailHeight'?rail:1200,Event});
 const before=Number(total.value);
 assert.equal(before,1200+260+150);
 sync(null,{profile:'50×60×1,5'});assert.equal(Number(total.value),1200+270+150);assert.equal(gap.value,'150');
 sync(null,{profile:'50×70×1,5'});
 assert.equal(Number(total.value),before+20);
 assert.equal(gap.value,'150');
 sync(null,{profile:'50×50×1,5'});
 assert.equal(Number(total.value),before);
 assert.equal(gap.value,'150');
}
const file=process.argv[2]||'dist/index.html';if(fs.existsSync(file)){
 const source=fs.readFileSync(file,'utf8'),s=source.includes('data-mekik-clearance="557"')?source:transform(source);
 assert(s.includes('m2ActiveModule === "drive" ? 1350 : 1610'));assert(s.includes('firstRailHeight = m2Number("m2FirstLevelHeight", 0, 5000)'));
 for(const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);
 assert.equal(transform(s),s);
}
console.log('PASS Mekik 150/170 assembly, net clearance, manual spacing, pallet height, saved spacing, bottom level preserved; inline syntax.');
