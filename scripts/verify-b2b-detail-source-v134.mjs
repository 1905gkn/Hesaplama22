import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {physicalLevels, manualOptions} from './b2b-level-plan-v121.mjs';
import {helpers} from './patch-b2b-collection-behavior-v109.mjs';

const source = fs.readFileSync(process.argv[2] || 'dist/server/index.js', 'utf8');
const html = Buffer.from(source.match(/const\s+HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/)[1], 'base64').toString();
const nodes = {};
let active;
const context = vm.createContext({console, window:{}, document:{getElementById:id=>nodes[id]||null, querySelector:()=>null}, m2LayoutState:{racks:[]}});
context.window.b2bReadInputState=()=>clone(active.b2b);
context.window.b2b3DOptions=()=>({levels:active.levels,palletHeight:active.palletHeight,traverseHeight:60,footHeight:7950,palletCount:3,palletWidth:800,palletDepth:1200,rowType:'single',rowGap:0});
vm.runInContext(helpers, context);
vm.runInContext(html.slice(html.indexOf('function b2bHeightV109(options)'),html.indexOf('function b2bValidateHeightV109(')),context);
context.window.rafexManualOptionsV121 = manualOptions;
for (const name of ['customize-collection="v119"', 'common-system-previews="v115"']) {
  const script = html.match(new RegExp('<script data-rafex-' + name + '>([\\s\\S]*?)<\\/script>'))[1];
  vm.runInContext(script, context);
}
// Evaluate the actual compiled copy-preview function, whose fallback reads live form state.
const start = html.indexOf('function m2Rack3DOptions(rack) {');
const end = html.indexOf('function m2CustomizeLevelData()', start);
vm.runInContext(html.slice(start, end), context);
const clone = x=>JSON.parse(JSON.stringify(x));
const rack = {id:1, levels:4, palletHeight:1200, sideUprightHeight:8200, b2bLayout:{sectionWidth:2700,palletCount:3,palletDepth:1200,rowCount:1}, b2b:{levels:4,footHeightMode:'auto',traverseType:'CC140',lastPalletOverlap:600,firstPalletPosition:'traverse',palletTraverseGap:200,collectionLevels:{enabled:true,groundGap:500,floors:Array.from({length:4},()=>({traverse:'ZS55|1.5',height:500}))},customLevels:Array.from({length:4},()=>({interval:1540,palletHeight:1200}))}};
nodes.m2CustomizePalletCount={value:'3'};
nodes.m2CustomizeLevels={value:'4',closest:()=>null};
nodes.m2CustomizePalletHeight={value:'1200'};
nodes.m2CustomizeRowType={value:'single'};
nodes.m2CustomizeRowGap={value:'0'};
nodes.m2CustomizeManualLevels={checked:false};
const geometry = o => clone({levels:physicalLevels(o),foot:o.footHeight,collection:o.collectionFloors,top:physicalLevels(o).at(-1).bottom+physicalLevels(o).at(-1).beam+(o.palletHeights.at(-1)||o.palletHeight)});
function compare(record) {
  active=record;
  context.window.rafexLoadCustomizeCollectionV119(record);
  const detail=context.window.rafexB2BDetailOptionsV117(record);
  const copy=context.m2Rack3DOptions(clone(record));
  const customize=context.window.rafexB2BCustomizeOptionsV120(record);
  assert.deepEqual(geometry(copy),geometry(detail),'Copied block must use the detail geometry');
  assert.deepEqual(geometry(context.window.b2b3DOptions()),geometry(detail),'Copied upper form must resolve the same saved specification');
  assert.deepEqual(geometry(customize),geometry(detail),'Opening Customize must retain the detail geometry');
  return detail;
}
const before=JSON.stringify(rack);
const automatic=compare(rack);
assert.equal(automatic.traverseHeight,140);
assert.equal(automatic.levelClearances[0],200);
assert.equal(automatic.footHeight,8200);
assert.equal(geometry(automatic).top,8760);
assert.equal(JSON.stringify(rack),before,'Preview must not mutate the saved block');
compare({...clone(rack),b2b:{...clone(rack.b2b),footHeightMode:'manual',footHeight:8300}});
const withoutCollection=clone(rack);withoutCollection.b2b.collectionLevels={enabled:false,floors:[]};compare(withoutCollection);
const changed=clone(rack);changed.b2b.customLevels[0].interval=1640;compare(changed);
const manualLevels=clone(rack);manualLevels.b2b.manualLevelSpecs=[{distance:2800,palletHeight:1200,traverseType:'CC140'},{distance:1540,palletHeight:1200,traverseType:'CC120'},{distance:1520,palletHeight:1200,traverseType:'CC160'},{distance:1560,palletHeight:1200,traverseType:'CC140'}];compare(manualLevels);
console.log('PASS v134: copied block, saved detail and Customize share collection levels, CC height, pallet top and upright height; manual height and record isolation verified.');
