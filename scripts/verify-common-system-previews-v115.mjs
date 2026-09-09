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
  "schematic(rack,'side')",
  'rafexLaneCustomizeV115',
  'rafexShowSelectedRackDetailV115'
])assert(html.includes(marker),'missing '+marker);
assert(html.indexOf("if(d.b2b?.mr||d.plan?.mr")<html.indexOf("if(explicit==='mr'||explicit==='konsol'||explicit==='drive')"),'structural MR classification must win over stale tags');
assert(html.lastIndexOf('data-rafex-common-system-previews="v115"')>html.lastIndexOf('data-rafex-free-info-modules="v27"'),'v115 must override the older preview controller');
console.log('PASS: common Inspect/Customize/Detail previews use 3D for HR-MR-Konsol and front/side for Drive-In-Mekik.');
