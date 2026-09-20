import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {transform} from './patch-layout-budget-v152.mjs';
import {splitRuntimeAssets} from './split-runtime-assets-v152.mjs';

// Build-time checks run without a browser or network.
const file=process.argv[2]||'dist/server/index.js';
const source=fs.readFileSync(file,'utf8');
const encoded=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
const html=encoded?Buffer.from(encoded[1],'base64').toString():source;
const optimized=transform(html),split=splitRuntimeAssets(optimized);
assert.equal(transform(optimized),optimized,'patch must be idempotent');
assert.equal(split.assets.size,3);
for(const body of split.assets.values())new vm.Script(body);
assert(!split.html.includes('<script data-layout-budget="v152">'));
assert(split.html.includes('hiddenV152.forEach(n=>n.classList.add'));
// Pure render cache must invalidate every model/option change and stay bounded.
let renders=0;
const context={window:{rafexRenderPlanV143:(p,o)=>{renders++;return JSON.stringify([p,o])}},
 document:{addEventListener(){}},requestAnimationFrame:()=>1,m2RenderLayout(){}};
vm.runInNewContext(fs.readFileSync(new URL('./layout-budget-runtime-v152.js',import.meta.url),'utf8'),context);
const render=context.window.rafexRenderPlanV143,plan={width:2000,feet:[90,90]},options={x:1,y:2,scale:.1};
assert.equal(render(plan,options),render(structuredClone(plan),{...options}));assert.equal(renders,1);
plan.feet[0]=100;render(plan,options);assert.equal(renders,2);
options.x=3;render(plan,options);assert.equal(renders,3);
for(let i=0;i<300;i++)render(plan,{...options,x:i});
assert.equal(context.window.rafexLayoutBudgetV152.cache.size,256);
console.log('v152 PASS: runtime syntax, idempotency, export restoration, content-addressed scripts, cache invalidation and limit.');
