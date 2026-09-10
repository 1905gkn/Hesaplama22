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
let customizeOpened=0;
const context={window:{m2OpenCustomizeModal:()=>{customizeOpened+=1},rafexLoadViewerOnDemandV3:()=>new Promise(()=>{})},document:{},console,JSON,Math,Number,String,Array,Object,Promise};
context.window.window=context.window;
context.m2LayoutState={racks:[{id:77,rafexSystem:'b2b',b2b:{levels:4},b2bLayout:{sectionWidth:2730,rowCount:1}}]};
vm.createContext(context);
const collectionRuntime=html.match(/<script data-rafex-customize-collection="v119">([\s\S]*?)<\/script>/)?.[1];
assert(collectionRuntime,'Collection customize runtime missing');
assert(!html.includes('window.RafexB2BViewer.mount(canvas,m2Rack3DOptions(rack))'),'Only the detached viewer may render the Customize canvas');
context.document.querySelector=()=>null;
vm.runInContext(collectionRuntime,context);
vm.runInContext(runtime,context);
context.window.m2OpenCustomizeModal(77);
assert.equal(customizeOpened,1,'B2B Customize modal must open immediately without waiting for the 3D loader');
let detachedCreated=0,detachedUpdated=0;
context.requestAnimationFrame=(callback)=>callback();
context.document.getElementById=(id)=>id==='m2CustomizeModal'?{hidden:false,dataset:{},addEventListener:()=>{}}:id==='m2CustomizeCanvas'?{}:null;
context.window.RafexB2BViewer={createDetached:()=>{detachedCreated+=1;return{setView:()=>{},update:()=>{detachedUpdated+=1},destroy:()=>{}}}};
context.window.m2OpenCustomizeModal(77);
await Promise.resolve();
assert.equal(detachedCreated,1,'B2B Customize must mount an independent 3D viewer');
context.window.rafexMountB2BCustomizeViewerV118(context.m2LayoutState.racks[0]);
assert.equal(detachedCreated,2,'B2B Customize detached viewer must be remountable');
const saved={totalWidth:2880,depthMm:2500,sideUprightHeight:6150,levels:5,palletHeight:1300,footType:75,b2b:{levels:5,palletHeight:1300,rowType:'double',rowGap:300},b2bLayout:{sectionWidth:2730,palletCount:3,palletWidth:800,palletDepth:1200,frameDepth:1100,rowCount:2,rowGap:300},b2bViewerOptions:{sectionWidth:2730,levels:5,footHeight:6150}};
const measure=context.window.rafexB2BDetailMeasureV117(saved);
const options=context.window.rafexB2BDetailOptionsV117(saved);
assert.deepEqual(JSON.parse(JSON.stringify(measure)),{width:2880,depth:2500});
assert.equal(options.sectionWidth,2730);
assert.equal(options.palletDepth,1200);
assert.equal(options.footHeight,6150);
assert.equal(options.levels,5);
assert.equal(options.rowType,'double');
const collection={enabled:true,groundGap:500,floors:[{traverse:'ZS55|1.5',trayWidth:300,trayThickness:.8,height:600},{traverse:'ZS65|2',trayWidth:250,trayThickness:1,height:700}]};
const withCollection={...saved,id:88,b2b:{...saved.b2b,collectionLevels:collection}};
context.window.rafexLoadCustomizeCollectionV119(withCollection);
const draft=context.window.rafexCollectCustomizeCollectionV119(88);
draft.floors[0].height=999;
assert.equal(context.window.rafexCollectCustomizeCollectionV119(88).floors[0].height,600,'Draft reads must be isolated');
assert.equal(collection.floors[0].height,600,'Opening Customize must not change saved collection');
const preview=context.window.rafexB2BDetailOptionsV117(withCollection);
assert.equal(preview.collectionFloors.length,2);
assert.equal(preview.firstFloorGap,1960);
assert.equal(preview.collectionFloors[1].bottom,1175);
context.b2bHeightV109=()=>({automatic:7300});
assert.equal(context.window.rafexCustomizeCollectionOptionsV119({...preview},withCollection).footHeight,7300,'Collection preview must recalculate automatic upright height');
assert.equal(context.window.rafexCustomizeCollectionOptionsV119({...preview},{...withCollection,b2b:{...withCollection.b2b,footHeightMode:'manual'}}).footHeight,6150,'Manual upright height must be preserved');
withCollection.b2b.tunnelHeight=1000;
assert.equal(context.window.rafexB2BDetailOptionsV117(withCollection).collectionFloors.length,0,'Tunnel must remove all collection floors');
const tunnelPreview=context.window.rafexCustomizeCollectionOptionsV119({...preview,tunnelHeight:3600,accessories:[{type:'hTraverse',levels:[5]}]},withCollection);
assert.equal(tunnelPreview.firstFloorGap,3600);
assert.equal(tunnelPreview.footHeight,6150);
assert(tunnelPreview.levels<5);
assert(!tunnelPreview.accessories.some(a=>a.type==='hTraverse'));
assert(tunnelPreview.accessories.some(a=>a.type==='tray'&&a.levels.includes(1)));
const roundTrip=JSON.parse(JSON.stringify(withCollection));
roundTrip.b2b.tunnelHeight=3600;
context.window.rafexSaveTunnelV120(roundTrip);
const restored=context.window.rafexB2BDetailOptionsV117(roundTrip);
assert.equal(restored.levels,tunnelPreview.levels);
assert.equal(restored.firstFloorGap,tunnelPreview.firstFloorGap);
assert.equal(restored.footHeight,tunnelPreview.footHeight);
assert.equal(restored.collectionFloors.length,0);
assert.deepEqual(JSON.parse(JSON.stringify(restored.accessories)),JSON.parse(JSON.stringify(tunnelPreview.accessories)));
assert(html.includes('rack.b2b.collectionLevels=collectionV119'),'Collection must be saved before geometry and type snapshot');
assert(!html.includes('rafexShowSelectedRackDetailV115'),'selected rack detail controller must be removed');
assert(html.indexOf("if(d.b2b?.mr||d.plan?.mr")<html.indexOf("if(explicit==='mr'||explicit==='konsol'||explicit==='drive')"),'structural MR classification must win over stale tags');
assert(html.lastIndexOf('data-rafex-common-system-previews="v115"')>html.lastIndexOf('data-rafex-free-info-modules="v27"'),'v115 must override the older preview controller');
console.log('PASS: saved-type info and Customize previews are system-specific; selected rack detail is removed.');
