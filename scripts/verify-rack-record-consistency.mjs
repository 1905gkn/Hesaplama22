import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {layoutSnapshot} from '../client/layout-3d-data.mjs';
import {rackParts} from '../client/layout-3d-geometry.mjs';
import {driveStepped} from '../client/drive-stepped.mjs';
import {mekikStepped} from '../client/mekik-stepped.mjs';
import {physicalLevels} from './b2b-level-plan-v121.mjs';
import {detailSignature,readDetail,sealDetail} from './rack-detail-snapshot-v135.mjs';
import {transform} from './rack-record-consistency.mjs';
import {attachCustomerBlockDetails,createCustomerManifest} from '../client/customer-share-capture.entry.js';
import {decodeShareSnapshot530,encodeShareSnapshot530} from '../client/customer-share-payload.mjs';

const input=fs.readFileSync(process.argv[2]||'dist/index.html','utf8'),html=transform(input);
assert.equal(transform(html),html);
const context=vm.createContext({
 window:{rafexReadRackDetailV135:readDetail,rafexRackDetailSignatureV135:detailSignature},document:{querySelector:()=>null},m2SavedRackTypes:[],m2SelectedSavedType:null,
 m2LayoutState:{scale:1,racks:[]},m2ActiveModule:'b2b',$:()=>({}),m2TypeColor:()=>'#247fba',
 m2PushUndo(){},m2RenderLayout(){},setTimeout(){},structuredClone,
 m2B2BRecordV108(){throw Error('Placement rebuilt a saved B2B design');}
});
const start=html.indexOf('function m2AddRack(drawing'),end=html.indexOf('function m2B2BResizeRack',start);
assert(start>=0&&end>start);
vm.runInContext(html.match(/<script data-rack-record-consistency>([\s\S]*?)<\/script>/)[1]+html.slice(start,end),context);
assert.match(html,/const traverses=rafexB2BTraverseProducts\(rack,levelOptions,window\.rafexPhysicalLevelsV121\)/);
assert.match(html,/rafexRestoreMissingRackDetails\(v.racks\|\|\[\],types,rafexCollectionOnlyRack\)/);
assert.ok(!html.includes('var inventoryCustomizeApply'));

const b2bOptions={levels:3,sectionWidth:2700,palletCount:3,palletHeight:1200,footHeight:5100,
 firstPalletPosition:'ground',showPallets:false,tunnelHeight:1300,traverseHeight:140,
 traverseBottoms:[1200,2700],traverseHeights:[140,180],palletHeights:[0,1050,1250]};
const b2b=sealDetail({rafexSystem:'b2b',levels:3,totalWidth:2900,railLength:1200,footType:100,
 b2b:{levels:3,showPallets:false,traverseType:'CC140',manualLevelSpecs:[{traverseType:'CC140'},{traverseType:'CC180'}]},
 b2bLayout:{sectionWidth:2700,palletCount:3,palletWidth:800,palletDepth:1200,rowCount:1},
 plan:{feet:[1100],braces:[]}}, {b2b:b2bOptions});
context.m2AddRack(b2b,'A');
let placed=JSON.parse(JSON.stringify(context.m2LayoutState.racks.pop()));
assert.deepEqual(readDetail(placed,'b2b').traverseBottoms,b2bOptions.traverseBottoms);
const layout=layoutSnapshot({scale:1,racks:[placed]},r=>readDetail(r,'b2b'));
assert.deepEqual(layout.racks[0].beamYs,[null,1.2,2.7]);
assert.deepEqual(layout.racks[0].floors,[0,1.34,2.88]);
const parts=rackParts(layout.racks[0]);
assert(!parts.some(p=>p.kind==='load'||p.kind==='timber'));
const beams=parts.filter(p=>p.kind==='beam');
const products=vm.runInContext('rafexB2BTraverseProducts',context);
const productRows=products(placed,b2bOptions,physicalLevels);
assert.equal(beams.length,productRows.length*2);
assert.equal(productRows[0].profile,'CC180');
assert(Math.abs(beams[0].h-.18)<1e-8);
assert.equal(products(placed,{...b2bOptions,levels:1},physicalLevels).length,0,'Ground-only storage needs no pallet beam');

globalThis.window={rafexB2BDetailOptionsV117(){throw Error('Share recalculated an already prepared rack');}};
const manifest=await attachCustomerBlockDetails(createCustomerManifest(layout,[]),[],[placed]);
const wire=await encodeShareSnapshot530(manifest),reopened=await decodeShareSnapshot530(wire.bytes,wire.encoding);
assert.deepEqual(reopened.blocks[0].detailView.options,layout.racks[0].nativeOptions);
assert.equal(reopened.blocks[0].rack.showPallets,false);
delete globalThis.window;

const hydrate=vm.runInContext('rafexRestoreMissingRackDetails',context);
const normalize=vm.runInContext('rafexCollectionOnlyRack',context);
const collectionFloors=Array.from({length:18},(_,index)=>({bottom:200+index*520,top:720+index*520,height:445,zsHeight:75}));
const collectionLevels={enabled:true,floors:collectionFloors};
const collection=sealDetail({...b2b,levels:0,b2b:{...b2b.b2b,levels:0,manualLevelSpecs:[],collectionLevels}},
 {b2b:{...b2bOptions,levels:0,collectionFloors,collectionLevels,tunnelHeight:0}});
const corruptedCatalog={...collection,b2b:{...collection.b2b,levels:1}};
const corruptedPlacement={...corruptedCatalog,levels:1,x:150,y:500};
assert.equal(normalize(corruptedCatalog).b2b.levels,0);
assert.equal(normalize(corruptedPlacement).levels,0);
const resealed=sealDetail(corruptedPlacement,collection.rackDetail.views);
assert.equal(readDetail(normalize(resealed),'b2b').levels,0);
const edited=sealDetail(corruptedPlacement,{b2b:{...collection.rackDetail.views.b2b,levels:1}});
assert.equal(normalize(edited),edited,'A deliberately saved pallet level stays in the rack');
const changed={...corruptedPlacement,palletHeight:1100};
assert.equal(normalize(changed),changed,'A mismatched saved detail must not overwrite a newer edit');
const placedOnly=structuredClone(corruptedPlacement);
hydrate([placedOnly],[],normalize);
assert.equal(placedOnly.levels,0);
assert.equal(placedOnly.x,150);
assert.equal(placedOnly.y,500);
context.m2AddRack(corruptedCatalog,'N');
const pickingRack=JSON.parse(JSON.stringify(context.m2LayoutState.racks.pop()));
assert.equal(pickingRack.levels,0);
const pickingOptions=readDetail(pickingRack,'b2b');
assert.equal(pickingOptions.collectionFloors.length,18);
assert.equal(products(pickingRack,pickingOptions,physicalLevels).length,0);
const picking3D=layoutSnapshot({scale:1,racks:[pickingRack]},()=>pickingOptions).racks[0];
assert.equal(picking3D.levels,0);
assert.deepEqual(picking3D.floors,[]);
assert.equal(picking3D.collectionFloors.length,18);
const metaStart=html.indexOf('function meta(source,name,sys)'),metaEnd=html.indexOf('function schematic(',metaStart);
Object.assign(context,{b2bMeasure:()=>({width:2900,depth:1200}),label:String,mm:String,esc:String});
vm.runInContext(html.slice(metaStart,metaEnd),context);
assert.match(context.meta({drawing:corruptedPlacement},'N','b2b'),/<small>Kat<\/small><b>0<\/b>/);

for(const [system,key,model] of [
 ['mekik2','mekikCustomizationV514',mekikStepped],['drive','driveCustomizationV521',driveStepped]
]) {
 const d={rafexSystem:system,systemType:system==='drive'?'drive':'fifo',bays:2,levels:2,depth:3,
  palW:1200,palD:800,palletHeight:1200,palletWeight:1000,totalWidth:2900,railLength:2850,footType:90,
  firstRailHeight:450,railHeight:170,sideUprightHeight:4300,firstPalletGap:200,palletGap:50,
  plan:{feet:[1200,900],braces:[750]},palletPositions:[0,1000,1850],palletGaps:[200,50],
  mekikFootColor:'ral5015',mekikTraverseColor:'ral2004',straightProfileLength:4200,showPallets:false,
  [key]:{heightMode:'auto',levelSpecs:[{palletHeight:1000,palletWeight:800},{palletHeight:1150,palletWeight:900}]}};
 const saved=sealDetail(d,{[system]:d});
 context.m2ActiveModule=system;
 context.m2AddRack(saved,'C');
 placed=JSON.parse(JSON.stringify(context.m2LayoutState.racks.pop()));
 assert.equal(placed.straightProfileLength,4200);
 const snap=layoutSnapshot({scale:1,racks:[placed]}).racks[0],stepped=snap.mekikStepped||snap.driveStepped;
 assert.deepEqual(stepped,model(d));
 assert.equal(snap.footColor,'ral5015');
 assert.equal(snap.beamColor,'ral2004');
 assert.deepEqual(snap.palletWeights,[800,900]);
 assert(!rackParts(snap).some(p=>p.kind==='load'));
 const legacy={...placed,rafexCatalogKey:system+':12',mekikFootColor:undefined,straightProfileLength:undefined};
 legacy[key]=structuredClone(legacy[key]);
 legacy[key].levelSpecs[0].palletWeight=777;
 assert.equal(readDetail(legacy,system),null);
 hydrate([legacy],[{id:12,__rafexSystem:system,drawing:{...d,levels:4,mekikFootColor:'ral5010'}}]);
 assert.equal(legacy.levels,2);
 assert.equal(legacy[key].levelSpecs[0].palletWeight,777);
 assert.equal(legacy.mekikFootColor,'ral5015');
 assert.equal(legacy.straightProfileLength,4200);
}
console.log('PASS saved rack placement, B2B CAD/BOM support parity, 18 picking floors with zero pallet levels, customer roundtrip and legacy Mekik/Drive-In data.');
