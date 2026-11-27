import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

export function rackDesign(record) {
 const design=structuredClone(record);
 for(const key of ['id','x','y','w','h','angle','blockName','staged','freePlacement','locked','specLocked',
  'sharedFootWith','sharedFootSide','sharedFootId','joinGroup','independentBlockId','individualSpec','seismicBraces',
  'columnPassageV504','depthSharedSupport','rafexRegionV179','rafexUnassignedGroupNameV196'])delete design[key];
 return design;
}

export function collectionOnlyRack(record,readDetail,signatureFor) {
 const state=record?.b2b,collection=state?.collectionLevels;
 if(!state||state.mr||!collection?.enabled||!collection.floors?.length)return record;
 if(record.levels===0&&state.levels===0)return record;
 const explicitZero=[0,'0'].includes(record.levels??state.levels);
 if(!explicitZero&&(record.levels!==1||state.levels!==1||record.rackDetail?.views?.b2b?.levels!==0))return record;
 const corrected={...record,levels:0,b2b:{...state,levels:0}};
 // The old inventory save hook turned zero into one after sealing the
 // drawing. Some placements later sealed that value with the zero-level view.
 if(readDetail?.(corrected,'b2b')?.levels===0)return corrected;
 if(readDetail?.(record,'b2b')?.levels!==0)return explicitZero?corrected:record;
 return {...corrected,rackDetail:{...record.rackDetail,signature:signatureFor(corrected)}};
}

export function restoreMissingRackDetails(racks,catalog,normalize=r=>r) {
 const byKey=new Map(catalog.map(entry=>[(entry.__rafexSystem||entry.system)+':'+entry.id,entry.drawing||entry.__rafexSnapshot]));
 // These are fields the old placement constructor omitted. Preserve the
 // placed block's measurements and overrides, even if its catalog changed.
 const keys=['mekikFootColor','mekikTraverseColor','mekikUprightMode','mekikManualUprightHeight',
  'mekikAutomaticUprightHeight','mekikMinimumUprightHeight','straightProfileLength'];
 for(const rack of racks) {
  const normalized=normalize(rack);
  if(normalized!==rack)Object.assign(rack,normalized);
  const system=rack.rafexSystem||rack.rackDetail?.system;
  if(system!=='mekik2'&&system!=='drive')continue;
  const view=rack.rackDetail?.views?.[system],saved=byKey.get(rack.rafexCatalogKey);
  for(const key of keys)if(rack[key]===undefined) {
   const value=view?.[key]??saved?.[key];
   if(value!==undefined)rack[key]=value;
  }
 }
}

export function b2bTraverseProducts(rack,options,physicalLevels) {
 const state=rack.b2b||{},manual=state.manualLevelSpecs||[],width=Number(rack.b2bLayout?.sectionWidth||options.sectionWidth||rack.widthMm);
 const fallback=state.traverseType||rack.traverseRecommendation||'CC140';
 // Collection levels lift a ground-start stack and add a first support. The
 // original manual profiles belong to the subsequent supports in that case.
 const originalPosition=manual[0]?.firstPalletPosition||state.firstPalletPosition||'ground';
 const addedFirst=options.firstPalletPosition==='traverse'&&originalPosition!=='traverse'&&
  Boolean(options.collectionLevels?.enabled||options.collectionFloors?.length);
 return physicalLevels(options).filter(level=>!(options.tunnelHeight>0&&level.bottom<options.tunnelHeight))
  .map(level=>({width,profile:manual[level.index-Number(addedFirst)]?.traverseType||fallback}));
}

export function transform(html) {
 if(html.includes('data-rack-record-consistency'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Rack record anchor missing: '+a.slice(0,100));html=html.replace(a,b);};
 replace('window.rafexReadRackDetailV135=readDetail;','window.rafexReadRackDetailV135=readDetail;window.rafexRackDetailSignatureV135=detailSignature;');
 replace('let source = specLocked ? JSON.parse(JSON.stringify(drawing)) : drawing;', 'let source = rafexCollectionOnlyRack(drawing);');
 replace('if (m2ActiveModule === "b2b" && source?.b2b) source =','if (m2ActiveModule === "b2b" && source?.b2b && !(specLocked&&source.b2bLayout)) source =');
 const constructorStart=html.indexOf('const rack = { id, typeName,');
 const constructorEnd=html.indexOf('m2PushUndo("Raf ekleme");',constructorStart);
 if(constructorStart<0||constructorEnd<0)throw Error('Rack placement constructor missing');
 html=html.slice(0,constructorStart)+`const rack = {
          ...rafexRackDesign(source), id, typeName, typeColor:m2TypeColor(typeName),
          x:500-w/2, y:325-h/2, w, h, angle:0, widthMm:source.totalWidth, depthMm:source.railLength,
          firstPalletGap:source.firstPalletGap??200, palletGap:source.palletGap??50,
          footLoadStart:source.footLoadStart||"ground", systemType:source.systemType||"fifo",
          palletPositions:[...(source.palletPositions||[])], palletGaps:[...(source.palletGaps||[])],
          topVBraceBays:[...(source.topVBraceBays||[])],
          staged:true, freePlacement:true, locked:false, specLocked
        };
        `+html.slice(constructorEnd);
 replace('    const types=window.rafexProjectTypesV133||[];\n    for(const rack of exactDraft?', '    const types=window.rafexProjectTypesV133||[];\n    rafexRestoreMissingRackDetails(v.racks||[],types,rafexCollectionOnlyRack);\n    for(const rack of exactDraft?');
 replace('function b2bOptions(d){const storedV135=', 'function b2bOptions(d){d=rafexCollectionOnlyRack(d);const storedV135=');
 replace('function m2B2BRecordV108(drawing){', 'function m2B2BRecordV108(drawing){drawing=rafexCollectionOnlyRack(drawing);');
 replace('function meta(source,name,sys){var d=source.__rafexSnapshot||source.drawing||source,', 'function meta(source,name,sys){var d=rafexCollectionOnlyRack(source.__rafexSnapshot||source.drawing||source),');
 replace("['Kat',Math.round(Number(d.levels||b.levels||k.levels)||0)]","['Kat',Math.round(Number(d.levels??b.levels??k.levels)||0)]");
 replace('function rafexPalletCapacityBaseV504(drawing){','function rafexPalletCapacityBaseV504(drawing){drawing=rafexCollectionOnlyRack(drawing);if(drawing?.b2b&&!drawing.b2b.mr&&drawing.levels===0)return 0;');
 replace('drawing.b2b={...(b2bReadInputState()||{}),...(rack.b2b||{}),','drawing.b2b={...(rack.b2b||{}),');
 replace('levels:Number(rack.levels)||1,palletHeight:Number(rack.palletHeight)||1200,rowType:', 'levels:rafexB2BLevels584(rack.levels,rack),palletHeight:Number(rack.palletHeight)||1200,rowType:');

 // The customization action already persists the same draft used to render
 // the preview. An old inventory hook wrote a second, independent draft.
 const hookStart=html.indexOf('  function savedTypes(){try{return typeof m2SavedRackTypes');
 const hookEnd=html.indexOf('  var previousList=null;',hookStart);
 if(hookStart<0||hookEnd<0||!html.slice(hookStart,hookEnd).includes('inventoryCustomizeApply'))throw Error('Inventory customization hook missing');
 html=html.slice(0,hookStart)+html.slice(hookEnd);

 const from=html.indexOf('        var levelCount=Math.max(1,n(rack.levels));');
 const to=html.indexOf("        add('Emniyet pimi',traverseQty*2,'');",from);
 if(from<0||to<0)throw Error('B2B traverse inventory missing');
 html=html.slice(0,from)+`        const levelOptions=window.rafexB2BDetailOptionsV117(rack);
        const traverses=rafexB2BTraverseProducts(rack,levelOptions,window.rafexPhysicalLevelsV121);
        for(const {width,profile} of traverses)add('Travers',2*rowCount,(width?textNumber(width)+' mm · ':'')+profile);
        var traverseQty=traverses.length*2*rowCount;
`+html.slice(to);
 replace('  function b2bAccessoryRows(rack){','  function b2bAccessoryRows(rack){rack=rafexCollectionOnlyRack(rack);');
 replace('(Array.isArray(state.accessories)?state.accessories:[]).forEach(function(item){','(rack.levels!==0&&Array.isArray(state.accessories)?state.accessories:[]).forEach(function(item){');
 replace('state.levels,state.tunnelHeight,JSON.stringify(state.accessories||[])','state.levels,state.tunnelHeight,state.firstPalletPosition,state.firstFloorGap,state.palletTraverseGap,state.traverseType,JSON.stringify(state.manualLevelSpecs||[]),JSON.stringify(state.accessories||[])');
 replace('d={...(d.rackDetail?.views?.[system]||d.rackDetail?.views?.mekik2||{}),...d};','d={...d};rafexRestoreMissingRackDetails([d],[]);');

 const at=html.indexOf('<script');
 const runtime='<script data-rack-record-consistency>const rafexRackDesign='+rackDesign.toString()+
  ',rafexCollectionOnlyRack=record=>('+collectionOnlyRack.toString()+')(record,window.rafexReadRackDetailV135,window.rafexRackDetailSignatureV135)'+
  ',rafexRestoreMissingRackDetails='+restoreMissingRackDetails.toString()+
  ',rafexB2BTraverseProducts='+b2bTraverseProducts.toString()+';</script>';
 return (html.slice(0,at)+runtime+html.slice(at)).replace(/\/(layout-3d|drive-in-viewer|customer-view|customer-share-capture)\.js\?v=[\w.-]+/g,'/$1.js?v=record-622');
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url) {
 for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)) {
  let source=fs.readFileSync(file,'utf8');
  if(file.endsWith('.html'))source=transform(source);
  else {
   const match=source.match(/const\s+HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)["']/);
   if(!match)throw Error('Server HTML missing');
   source=source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64'));
  }
  fs.writeFileSync(file,source);
 }
}
