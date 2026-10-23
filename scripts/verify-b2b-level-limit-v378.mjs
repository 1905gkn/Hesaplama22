import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {transform,transformViewerSource} from './b2b-level-limit-v378.mjs';
const html=fs.readFileSync(process.argv[2]||'dist/index.html','utf8'),viewer=fs.readFileSync(process.argv[3]||'dist/b2b-viewer.patched.entry.js','utf8');
assert(html.includes('data-b2b-level-limit="v378"'));assert.equal(transform(html),html);assert.equal(transformViewerSource(viewer),viewer);
assert(html.includes('id="b2bLevels" type="number" min="1" max="25"'));assert(html.includes('id="mrLevels" type="number" min="1" max="15"'));
assert(html.includes('m2LimitedNumber("m2Levels", 1, m2ActiveModule === "b2b" ? 25 : 15, "kat")'));
assert(!/Math\.min\(\s*15\s*,[^\n;]{0,160}m2CustomizeLevels/.test(html));
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
const normalize=viewer.match(/  normalizeOptions\(next = \{\}\) \{([\s\S]*?)\n  \}/);assert(normalize);
const scene={window:{dispatchEvent(){}},CustomEvent:class{},console};vm.createContext(scene);vm.runInContext(viewer.replace(/^import .*;\s*$/gm,''),scene);
for(const position of ['ground','traverse'])for(const rowType of ['single','double'])assert.equal(scene.window.RafexB2BViewer.palletCapacity({levels:25,palletCount:3,rowType,firstPalletPosition:position}),75*(rowType==='double'?2:1),'3D contains every pallet on all 25 levels');
const env={clamp:(n,a,b)=>Math.max(a,Math.min(b,n))};vm.createContext(env);vm.runInContext('normalize=function(next={}){'+normalize[1]+'};',env);
for(const position of ['ground','traverse'])for(const rowType of ['single','double'])for(const n of [1,14,15,16,24,25,26]){
 const options={levels:n,firstPalletPosition:position,rowType,accessories:[{type:'hTraverse',levels:[1,15,16,24,25,26]},{type:'tray',levels:[25],width:300}]};const result=env.normalize(options);
 assert.equal(result.levels,Math.min(25,n));assert.equal(result.firstPalletPosition,position);assert.equal(result.rowType,rowType);assert.deepEqual(Array.from(result.accessories[0].levels),[1,15,16,24,25]);
 assert.equal(env.normalize(JSON.parse(JSON.stringify(result))).levels,result.levels,'Saved detail retains all 25 levels');
}
const nodes={b2bLevels:{value:'25',max:'25'},m2Levels:{value:'4',max:'15'},m2CustomizeLevels:{value:'25',max:'25'},b2bFirstPalletPosition:{value:'ground'},b2bPalletHeight:{value:'300'},b2bFootHeightMode:{value:'auto'}};
const ctx={window:{},document:{getElementById:id=>nodes[id]||null},m2ActiveModule:'b2b',m2LayoutState:{racks:[{id:1,b2b:{}},{id:2,b2b:{mr:true}}]},b2bApplyInputs:()=>{},m2OpenCustomizeModal:()=>{},$:(id)=>nodes[id],b2bSyncPitchV242:()=>true,b2bTraverseHeight:()=>100,b2bPalletTraverseGap:100,b2bFirstFloorGap:200,b2bLastPalletOverlap:150};vm.createContext(ctx);
vm.runInContext(html.match(/<script data-b2b-level-limit="v378">([\s\S]*?)<\/script>/)[1],ctx);ctx.b2bApplyInputs();assert.equal(nodes.m2Levels.max,'25');nodes.b2bLevels.value='26';ctx.b2bApplyInputs();assert.equal(nodes.b2bLevels.value,'25');ctx.m2OpenCustomizeModal(2);assert.equal(nodes.m2CustomizeLevels.max,'15');ctx.m2OpenCustomizeModal(1);assert.equal(nodes.m2CustomizeLevels.max,'25');
const start=html.indexOf('function b2bVerticalLayout()'),end=html.indexOf('\n      function ',start+10);vm.runInContext(html.slice(start,end),ctx);
for(const position of ['ground','traverse']){nodes.b2bFirstPalletPosition.value=position;const v=ctx.b2bVerticalLayout();assert.equal(v.levels,25);assert.equal(v.traverseLevels,position==='ground'?24:25);assert(v.footHeight>0);}
// Main accessory selectors must offer the upper floors without inventing an
// additional beam under the ground pallet.
const a=html.indexOf('  const levelCount = () => Math.max(1, Math.min(25,'),b=html.indexOf('  const sectionWidth =',a);assert(a>0&&b>a);vm.runInContext(html.slice(a,b)+';window.accessoryLevels=levelValuesV151;',ctx);
nodes.b2bFirstPalletPosition.value='ground';assert.equal(ctx.window.accessoryLevels('hTraverse').at(-1),24);assert.equal(ctx.window.accessoryLevels('hTraverse').length,24);assert.equal(ctx.window.accessoryLevels('palletStop').length,25);
nodes.b2bFirstPalletPosition.value='traverse';assert.equal(ctx.window.accessoryLevels('hTraverse').at(-1),25);assert.equal(ctx.window.accessoryLevels('hTraverse').length,25);
assert(viewer.includes('Math.min(24, Math.round(Number(humanLevel) || 1) - 1)'));
console.log('PASS v378: B2B 1–25; 26 capped; MR remains 15; 3D normalization and upper-floor accessories; ground/elevated semantics; 25-level detail roundtrip; input, custom and inline syntax.');
