import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import path from 'node:path';import {createRequire} from 'node:module';import {pathToFileURL} from 'node:url';
import {katWirePlan,transform,transformViewerSource,tunnelCoverItems} from './kat-wire-v392.mjs';
import {nodeDraco} from './kat-wire-test-decoder-v392.mjs';
const html=fs.readFileSync(process.argv[2]||'dist/index.html','utf8'),source=fs.readFileSync(process.argv[3]||'dist/b2b-viewer.patched.entry.js','utf8'),asset=process.argv[4]||'assets/kat-teli.glb';
assert.equal(transform(html),html);assert.equal(transformViewerSource(source),source);
const rulesMarker=html.indexOf('root.rafexProductCodeRulesV322=Object.freeze'),rulesStart=html.lastIndexOf('(function(root){',rulesMarker),rulesEnd=html.indexOf('})(typeof window===',rulesMarker),rulesEnv={};vm.createContext(rulesEnv);vm.runInContext(html.slice(rulesStart,rulesEnd)+'})(globalThis);',rulesEnv);
const rules=rulesEnv.rafexProductCodeRulesV322;
for(const [spec,code] of [['890 × 1.100 mm','KT1100089030D'],['1.100 × 1.100 mm','KT1100110030D'],['1.133 × 1.100 mm · Özel ölçü','KT1100113330D'],['890 × 900 mm','KT0900089030D']]){assert.equal(rules.codeFor('Kat Teli',spec),code);assert.equal(rules.split(code+' · '+spec).code,code);assert.equal(rules.split(code+' · '+spec).description,spec);}
for(const [span,width,count,gap] of [[2700,890,3,30],[2200,1100,2,0],[1800,890,2,20],[3600,890,4,40],[2720,890,3,50]]){const p=katWirePlan(span);assert(p.valid);assert.equal(p.width,width);assert.equal(p.count,count);assert.equal(p.gap,gap);}
for(const span of [3400,2000,2721,500])assert(!katWirePlan(span).valid);
assert.equal(katWirePlan(3400).covered,3300);assert.equal(katWirePlan(3400).gap,100);
assert(katWirePlan(3400,1133).valid);assert.equal(katWirePlan(3400,1133).count,3);assert.equal(katWirePlan(3400,1133).gap,1);
for(const width of [1201,0,-1,NaN,1100,1200])assert(!katWirePlan(3400,width).valid);
assert.equal(katWirePlan(2700,1000).width,890,'Standards take priority when they fit');assert.equal(katWirePlan(97900).width,890);
let scripts=0;for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim()){new vm.Script(m[1]);scripts++;}
const runtime=html.match(/<script data-kat-wire="v392">([\s\S]*?)<\/script>/)?.[1];assert(runtime);
const env={window:{dispatchEvent(){}},document:{},CustomEvent:class{}};vm.createContext(env);vm.runInContext(runtime,env);
const api=env.window.rafexKatWireV392;assert(api.controls(3400,{customWidth:null},'noop()').includes('max="1200"'));assert(!api.controls(2700,{},'noop()').includes('<input'));
// Native serializers preserve custom dimensions across save/reopen and customization.
const cloneMain=html.match(/const cloneState = \(\) => accessories\.map\(([\s\S]*?)\n  \}\)\);/)?.[0];assert(cloneMain);
const item={type:'katWire',levels:[1,2],customWidth:1133};env.accessories=[item];vm.runInContext(cloneMain+'\nmainSaved=cloneState();',env);assert.equal(env.mainSaved[0].customWidth,1133);
const cloneCustom=html.match(/const clone=\(items\)=>[^\n]+;/)?.[0];assert(cloneCustom);vm.runInContext("const TYPES={katWire:'Kat Teli',tray:'Tava',palletStop:'Palet Dayama',hTraverse:'H Travers'};"+cloneCustom+'\ncustomSaved=clone(JSON.parse(JSON.stringify(mainSaved)));',env);assert.equal(env.customSaved[0].customWidth,1133);
const require=createRequire(path.resolve(fs.existsSync('node_modules/three')?'package.json':'Hesaplama22/package.json'));
const THREE=await import(pathToFileURL(require.resolve('three')).href);const {GLTFLoader}=await import(pathToFileURL(require.resolve('three/examples/jsm/loaders/GLTFLoader.js')).href);
const {MeshoptDecoder}=await import(pathToFileURL(require.resolve('three/examples/jsm/libs/meshopt_decoder.module.js')).href);
const loader=new GLTFLoader();loader.setDRACOLoader(await nodeDraco(require,THREE));loader.setMeshoptDecoder(MeshoptDecoder);
const buffer=fs.readFileSync(asset),gltf=await loader.parseAsync(buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),'');
assert.equal(gltf.scene.children.length,4,'Original mesh and three supports retained');
env.THREE=THREE;vm.runInContext(source.replace(/^import .*;\s*$/gm,'')+'\nwindow.Model=B2BViewer;',env);
assert(env.katWireNeededV392({moduleOptions:[{accessories:[]},{accessories:[{type:'katWire',levels:[1]}]}]}),'Joined mixed modules load the wire asset');
const model=Object.create(env.window.Model.prototype);model.models={katWire:gltf.scene};
model.options=model.normalizeOptions({levels:4,firstPalletPosition:'traverse',palletDepth:1200,frontPalletGap:50,rearPalletGap:50,sectionWidth:2700,palletWidth:800,palletCount:3,accessories:[{type:'katWire',levels:[1]}]});
let section=new THREE.Group();model.addAccessories(section,1,1);assert.equal(section.children.length,3);
for(const wire of section.children){wire.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(wire),size=box.getSize(new THREE.Vector3());assert(Math.abs(size.x-890)<.01,JSON.stringify(size));assert(Math.abs(size.y-(1167.1944580078125-116.41129302978516))<.01);assert(Math.abs(size.z-48.2)<.01);assert(box.min.y>0);const mesh=new THREE.Box3().setFromObject(wire.children[0].children[0].children[0].children[0]),support=new THREE.Box3().setFromObject(wire.children[0].children[0].children[0].children[1]);assert(mesh.min.z<support.min.z,'Wire surface above supports in negative-Z CAD coordinates');}
// Use actual structural upright bounds, including a non-zero source origin.
const seated=new THREE.Group();for(const x of [0,2800]){const foot=new THREE.Mesh(new THREE.BoxGeometry(90,80,5000));foot.name='UPRIGHT';foot.position.set(x,190,-2500);seated.add(foot);const rear=foot.clone();rear.position.y=1210;seated.add(rear);}model.addAccessories(seated,1,1);for(const wire of seated.children.filter(o=>o.name.startsWith('Kat Teli'))){const box=new THREE.Box3().setFromObject(wire);assert(Math.abs(box.min.y-150)<.01);assert(Math.abs(box.max.y-1250)<.01);}
// Main-screen legacy placement override must preserve the new native GLB path.
const patchStart=html.indexOf('  function patchViewerAccessoryPlacement(viewer)'),patchEnd=html.indexOf('  function installViewerAccessoryPlacementFix()',patchStart);assert(patchStart>=0);vm.runInContext('const TRAVERSE_FRONT_OFFSET=81.59595,TRAVERSE_BACK_OFFSET=1077.32687;'+html.slice(patchStart,patchEnd),env);env.patchViewerAccessoryPlacement(model);section=new THREE.Group();model.addAccessories(section,1,1);assert.equal(section.children.length,3);
model.options={...model.options,sectionWidth:3400,accessories:[{type:'katWire',levels:[1],customWidth:1133}]};section=new THREE.Group();model.addAccessories(section,1,1);assert.equal(section.children.length,3);assert(model.options.accessories[0].customWidth===1133);
model.options={...model.options,accessories:[{type:'katWire',levels:[1]}]};section=new THREE.Group();model.addAccessories(section,1,1);assert.equal(section.children.length,0,'No invalid standard or filler model');
env.window.rafexB2BDetailOptionsV117=r=>({levels:r.levels,firstPalletPosition:r.b2b.firstPalletPosition,tunnelHeight:r.b2b.tunnelHeight||0});env.window.rafexPhysicalLevelsV121=o=>Array.from({length:o.levels},(_,i)=>({level:i+1,bottom:200+i*1300}));
const rack={levels:4,b2b:{firstPalletPosition:'traverse'},b2bLayout:{sectionWidth:2700,frameDepth:1100,rowCount:2}};
assert.equal(api.inventory(rack,{type:'katWire',levels:[1,2]})[0].qty,12);assert.equal(api.inventory({...rack,b2b:{...rack.b2b,tunnelHeight:500}},{type:'katWire',levels:[1,2]})[0].qty,6);
assert.equal(api.inventory({...rack,b2bLayout:{...rack.b2bLayout,sectionWidth:3400}},{type:'katWire',levels:[1]}).length,0);
assert.equal(api.inventory({...rack,b2bLayout:{...rack.b2bLayout,sectionWidth:3400}},{type:'katWire',levels:[1],customWidth:1133})[0].qty,6);
const inventoryMarker=html.indexOf('window.rafexLayoutInventoryRowsV44=rows;'),inventoryStart=html.lastIndexOf('<script',inventoryMarker),inventoryEnd=html.indexOf('</script>',inventoryMarker);let inventory=html.slice(html.indexOf('>',inventoryStart)+1,inventoryEnd);inventory=inventory.slice(0,inventory.indexOf('  function inventoryPdfPages'))+'window.rafexLayoutInventoryRowsV44=rows;})();';
const inventoryRack={...rack,id:1,b2b:{...rack.b2b,accessories:[{type:'katWire',levels:[1,2]}]}},inv={window:{rafexKatWireV392:api,rafexProductCodeRulesV322:{codeFor:()=>null},rafexSharedFramesV255:{stations:()=>new Map([[1,[{product:{profile:'HR90',height:5000,depth:1100}},{product:{profile:'HR90',height:5000,depth:1100}}]]])}},m2LayoutState:{racks:[inventoryRack]},m2LayoutSymbols:[],sharedRows:()=>0,m2B2BVisibleTraverseLevels:()=>4,console};vm.createContext(inv);vm.runInContext(inventory,inv);const product=inv.window.rafexLayoutInventoryRowsV44().find(row=>row.name==='Kat Teli');assert(product);assert.equal(product.qty,12);assert.equal(product.unit,'adet');assert(product.spec.includes('1.100'));
console.log('v392: 890/1100 uniform planning, 50 mm bounds, no mixed/filler widths, custom ≤1200, native saved serializers, real GLB depth/width, legacy live placement and tunnel-aware single/double inventory; '+scripts+' inline scripts parse');
// Tunnel coverings are separate from ordinary accessories and replace cleanly.
const ordinary=[{type:'palletStop',levels:[2,3]},{type:'tray',levels:[3]}];
let covered=tunnelCoverItems(ordinary,null,2);assert(covered.some(a=>a.tunnelCover&&a.type==='tray'&&a.levels[0]===2));
covered=tunnelCoverItems(covered,{type:'katWire',customWidth:1133},2);assert(!covered.some(a=>a.tunnelCover&&a.type==='tray'));assert.equal(covered.find(a=>a.tunnelCover).customWidth,1133);assert.deepEqual(covered.find(a=>a.type==='tray').levels,[3]);
covered=tunnelCoverItems(covered,{type:'katWire'},3);assert.deepEqual(covered.find(a=>a.tunnelCover).levels,[3]);assert.equal(tunnelCoverItems(covered,null,null).length,ordinary.length);
assert.equal(tunnelCoverItems([{type:'katWire',levels:[2]}],{type:'katWire'},2).length,1,'Do not double-count an ordinary wire on the same floor');
const physicalStart=html.indexOf(' const physicalLevels=function physicalLevels(o)'),planEnd=html.indexOf(' let boundsV120=null,lastPlanV120=null;',physicalStart);assert(physicalStart>0&&planEnd>physicalStart);
const tctx={window:{rafexKatWireV392:{tunnelItems:tunnelCoverItems}}};vm.createContext(tctx);vm.runInContext(html.slice(physicalStart,planEnd)+'\nglobalThis.plan=tunnelPlanV120;',tctx);
const to={levels:4,firstPalletPosition:'traverse',firstFloorGap:200,palletHeight:1200,palletTraverseGap:100,traverseHeight:125,tunnelHeight:1000,accessories:[],collectionFloors:[]};
let tp=tctx.plan(to);assert.equal(tp.accessories[0].type,'tray');tp=tctx.plan({...to,tunnelCover:{type:'katWire',customWidth:1133}});assert.equal(tp.accessories.length,1);assert.equal(tp.accessories[0].type,'katWire');assert.equal(tp.accessories[0].customWidth,1133);assert.equal(tp.accessories[0].levels[0],tp.visibleAccessoryLevels[0]);assert.equal(tp.collectionFloors.length,0);
const saveStart=html.indexOf(' window.rafexSaveTunnelV120=function(rack)'),saveEnd=html.indexOf('\n };',saveStart)+4;const savedRack={id:7,b2b:{}};Object.assign(tctx,{lastPlanV120:tp,rackId:7,clone:v=>JSON.parse(JSON.stringify(v)),savedRack});vm.runInContext(html.slice(saveStart,saveEnd)+'\nwindow.rafexSaveTunnelV120(savedRack);',tctx);assert.equal(savedRack.b2b.tunnelCover.type,'katWire');assert.equal(savedRack.b2b.accessories[0].customWidth,1133);assert.equal(JSON.parse(JSON.stringify(savedRack)).b2b.tunnelCover.type,'katWire');
// Execute the actual tunnel-only identity wrapper for both edit sources.
const identityStart=html.indexOf(' const commit=window.rafexCommitCustomTypeV184;',html.indexOf('/* tunnel-only-edits-v308 */')),identityEnd=html.indexOf('\n})();',identityStart);assert(identityStart>0);
for(const nonTunnelEdited of [false,true]){const original={id:7,typeName:'A',rafexCatalogKey:'b2b:1',b2b:{tunnelHeight:1000}},r={...original,typeName:'B',b2b:{tunnelHeight:1000,tunnelCover:{type:'katWire'}}},context={window:{rafexCommitCustomTypeV184:()=>context.committed++},session:{rackId:7,original,saved:[{name:'A'}],nonTunnelEdited,tunnelEdited:true},m2SavedRackTypes:[],committed:0,r};vm.createContext(context);vm.runInContext(html.slice(identityStart,identityEnd)+'\nwindow.rafexCommitCustomTypeV184(r,{},{});',context);assert.equal(context.committed,nonTunnelEdited?1:0);assert.equal(r.typeName,nonTunnelEdited?'B':'A');}
assert(html.includes('id="m2CustomizeTunnelCover"'));assert(html.includes('rack.b2b?.tunnelCover?.type'));assert(!html.includes("tray.levels=[visible[0].level]"));
console.log('Tunnel cover: default tray, wire alternative/custom width, no stale/duplicate tray, visible level alignment, saved reload and tunnel-only identity versus ordinary accessory type changes passed.');

