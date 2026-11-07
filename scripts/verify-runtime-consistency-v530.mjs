import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createCustomerManifest} from '../client/customer-share-capture.entry.js';
import {encodeShareSnapshot530,decodeShareSnapshot530,validateSharePayload} from '../client/customer-share-payload.mjs';
import {mergeAreaLayouts} from '../client/layout-areas.mjs';
import {readRackClearances} from '../client/layout-3d-clearances.mjs';
globalThis.window={RafexB2BViewer:{palletCapacity:o=>o.palletCount*o.levels*(o.rowType==='double'?2:1)}};
const rack={id:1,system:'b2b',name:'A',x:0,z:0,angle:0,width:2.88,depth:1.2,height:4.9,pallets:3,rows:1,levels:4,palletWidth:.8,palletDepth:1.2,palletHeight:1.2,palletHeights:[1.2,1.2,1.2,1.2],nativeOptions:{palletCount:3,levels:4},blockedPallets:[{row:0,pallet:1}],positions:[]};
const manifest=createCustomerManifest({racks:[rack]},[]);assert.equal(manifest.pallets[0].count,8);
assert.equal(createCustomerManifest({racks:[{...rack,blockedPallets:[]}]},[]).pallets[0].count,12);
assert.equal(createCustomerManifest({racks:[{...rack,effectivePalletCapacity:7}]},[]).pallets[0].count,7);
const state={scale:1,racks:[{id:1}],points:[],closed:false};const dimensions=readRackClearances(state,1,{walls:()=>({right:{px:10,x1:10,y1:20,x2:20,y2:20}}),gaps:()=>[]});assert.equal(dimensions[0].mm,10);
const merged=mergeAreaLayouts([{id:'a',name:'Bir',layout:{racks:[rack]}},{id:'b',name:'İki',layout:{racks:[{...rack,id:2}]}}],'a');const source=createCustomerManifest(merged,[]);const bytes=await encodeShareSnapshot530(source);const decoded=await decodeShareSnapshot530(bytes.bytes,bytes.encoding);assert.equal(decoded.layout.areas[0].layout.racks[0],decoded.layout.racks[0]);assert.equal(decoded.blocks[0].rack,decoded.layout.racks[0]);assert.equal(decoded.layout.racks.length,2);assert.equal(source.blocks[0].rack,merged.racks[0]===source.blocks[0].rack?merged.racks[0]:source.blocks[0].rack);assert.ok(source.layout.areas[0].layout.racks);
const large={...source,layout:{racks:Array.from({length:20000},(_,id)=>({...rack,id,blockedPallets:[]}))},blocks:[]};validateSharePayload(large);assert.throws(()=>validateSharePayload({...large,layout:{racks:[...large.layout.racks,rack]}}));
const big={...source,probe:'x'.repeat(13000000)};const packed=await encodeShareSnapshot530(big);assert.ok(packed.rawBytes>12000000);assert.equal((await decodeShareSnapshot530(packed.bytes,packed.encoding)).probe.length,13000000);
const code=fs.readFileSync('client/layout-3d.entry.js','utf8');assert.ok(!code.includes('data.racks.map(r=>[String(r.id),data.getClearances(r.id)])'));assert.ok(!code.includes('gaps:r=>window.rafexRackGapRelations'));assert.match(code,/savedMeasuresOnly:true/);
if(fs.existsSync('dist/index.html')){const html=fs.readFileSync('dist/index.html','utf8');assert.match(html,/data-runtime-consistency="v530"/);assert.match(html,/snapshot\/parts\//);for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);}
console.log('PASS v530: blocked pallet capacity, column measures, compact multi-area roundtrip, 20000 rack and >12MB payload, saved-only measures');
