import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const file=process.argv[2]||'dist/server/index.js';
const source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
assert(match,'HTML_BASE64 missing');
const html=Buffer.from(match[2],'base64').toString('utf8');
const runtime=html.match(/<script data-rafex-common-system-previews="v115">([\s\S]*?)<\/script>/)?.[1];
assert(runtime,'v115 runtime missing');
new vm.Script(runtime,{filename:'common-system-previews-v115.js'});
for(const marker of [
  'data-rafex-common-system-previews="v115"',
  'rafexLoadViewerOnDemandV3(sys)',
  'RafexB2BViewer?.createDetached',
  'RafexMRViewer?.createDetached',
  'RafexKonsolViewer?.createDetached',
  "if(sys==='drive'||sys==='mekik2')",
  'ÖNDEN GÖRÜNÜŞ',
  'YANDAN GÖRÜNÜŞ',
  "front=front||schematic(d,'front')",
  'rafexLaneCustomizeV115',
  '#m2SelectedRackDetailV50{display:none!important}'
])assert(html.includes(marker),'missing '+marker);
assert(!/function b2bOptions\(d\)[\s\S]{0,500}m2Rack3DOptions/.test(html),'Saved B2B detail must not read the active Common-system form');
assert(html.includes('function b2bMeasure(d)'),'Saved B2B detail must derive measurements from its own record');
const context={window:{},document:{},console,JSON,Math,Number,String,Array,Object};
context.window.window=context.window;
vm.createContext(context);
vm.runInContext(runtime,context);
const saved={totalWidth:2880,depthMm:2500,sideUprightHeight:6150,levels:5,palletHeight:1300,footType:75,b2b:{levels:5,palletHeight:1300,rowType:'double',rowGap:300},b2bLayout:{sectionWidth:2730,palletCount:3,palletWidth:800,palletDepth:1200,frameDepth:1100,rowCount:2,rowGap:300},b2bViewerOptions:{sectionWidth:2730,levels:5,footHeight:6150}};
const measure=context.window.rafexB2BDetailMeasureV117(saved);
const options=context.window.rafexB2BDetailOptionsV117(saved);
assert.deepEqual(JSON.parse(JSON.stringify(measure)),{width:2880,depth:2500});
assert.equal(options.sectionWidth,2730);
assert.equal(options.palletDepth,1200);
assert.equal(options.footHeight,6150);
assert.equal(options.levels,5);
assert.equal(options.rowType,'double');
assert(!html.includes('rafexShowSelectedRackDetailV115'),'selected rack detail controller must be removed');
assert(html.indexOf("if(d.b2b?.mr||d.plan?.mr")<html.indexOf("if(explicit==='mr'||explicit==='konsol'||explicit==='drive')"),'structural MR classification must win over stale tags');
assert(html.lastIndexOf('data-rafex-common-system-previews="v115"')>html.lastIndexOf('data-rafex-free-info-modules="v27"'),'v115 must override the older preview controller');
console.log('PASS: saved-type info and Customize previews are system-specific; selected rack detail is removed.');
