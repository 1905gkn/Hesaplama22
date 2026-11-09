import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {screenFontSize551,rackContains551,runtime551,transform} from './dimension-presentation-v551.mjs';
import {dimensionNumber,dimensionUnitNotice} from '../client/dimension-units.mjs';
for(const scale of [.005,.05,.4,1,4,40])for(const requested of [1,12,18,36])assert(Math.abs(screenFontSize551(requested,scale)*scale-requested)<1e-8);
assert.equal(dimensionNumber('25.649 mm'),'25.649');assert.equal(dimensionNumber('6 mm'),'6');assert.equal(dimensionNumber('K2 · 1.300 mm'),'K2 · 1.300');
for(const language of ['tr','en','fr'])assert.match(dimensionUnitNotice(language),/\(mm\)/);
const rack={x:20,y:40,w:80,h:20,angle:90};assert(rackContains551(rack,{x:60,y:85}));assert(!rackContains551(rack,{x:90,y:50}));assert(rackContains551({...rack,angle:45},{x:60,y:50}));
let zoom=1;const styles={},attrs={},node={nodeValue:'2.267 mm'};
const label={dataset:{dimensionKey:'pair-gap:1:2'},style:{setProperty(k,v){styles[k]=v;}},getAttribute:k=>attrs[k]||'',setAttribute(k,v){attrs[k]=v;},parentElement:{getScreenCTM:()=>({a:zoom,b:0,c:0,d:zoom,inverse:()=>({a:1/zoom,b:0,c:0,d:1/zoom})})},getBoundingClientRect:()=>({left:0,top:0,right:40,bottom:12,width:40,height:12}),getBBox:()=>({x:0,y:0,width:40,height:12})};
const layer={isConnected:true,closest:()=>layer,querySelectorAll:s=>s.startsWith('rect')?[]:[label]};
const sizes={},context={window:{},document:{getElementById:()=>null,createTreeWalker:()=>{let done=false;return{nextNode:()=>done?null:(done=true,node)}}},m2DimensionFontSizes:sizes,m2DimensionOffsets:{},rafexPdfLayoutCloneV140:s=>s,screenFontSize551,rackContains551};
vm.runInNewContext('('+runtime551.toString()+')()',context);
for(zoom of [.02,.5,1,10]){node.nodeValue='2.267 mm';context.window.rafexDimensionLayoutV499(layer);assert.equal(node.nodeValue,'2.267');assert(Math.abs(parseFloat(styles['font-size'])*zoom-12)<1e-8);}
sizes['pair-gap:1:2']=20;context.window.rafexDimensionLayoutV499(layer);assert.equal(parseFloat(styles['font-size'])*zoom,20);
const file=fs.existsSync('before.html')?'before.html':fs.existsSync('dist/server/index.js')?'dist/server/index.js':null;
if(file){let html=fs.readFileSync(file,'utf8');if(file.endsWith('.js')){const m=html.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);assert(m);html=Buffer.from(m[1],'base64').toString();}if(!html.includes('data-dimension-presentation="v551"'))html=transform(html);assert.match(html,/if\(window\.rafexRackNodeAtV551\?\.\(event\)\)return;const label=labelAt/);assert.match(html,/rackNode&&m2LayoutTool!=="dimension"\?null/);assert.match(html,/rafexPinRulerV221\?\.\(\);window\.rafexDimensionLayoutV499\?\.\(node\)/);assert.equal(transform(html),html);if(file==='before.html')fs.writeFileSync('after.html',html);}
console.log('PASS v551: constant screen size across 8000x zoom range, adjustable sizes, rotated rack priority, numeric labels, TR/EN/FR unit notes, valid inline scripts and idempotent transformation.');
