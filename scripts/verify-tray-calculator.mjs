import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {calculateTray} from '../client/tray-calculation.mjs';
const data=JSON.parse(fs.readFileSync('client/tray-capacities.json','utf8'));
for(const kind of ['MR','HR']){
  assert.equal(data.tables[kind].length,18);
  const result=calculateTray(data,kind,200,1050,500,2700);
  assert.equal(result.count,13);assert.equal(result.remainder,100);assert.equal(result.perTray,500/13);
  assert.equal(result.recommended.thickness,kind==='MR'?.8:.6);
  for(const row of data.tables[kind])for(let i=0;i<data.depths.length;i++){
    const r=calculateTray(data,kind,row.width,data.depths[i],row.capacities[i]*10,row.width*10);
    assert(r.recommended);assert(r.recommended.thickness<=row.thickness);
  }
}
assert.equal(calculateTray(data,'MR',200,1020,500,2700).tableDepth,1050);
for(const depth of [0,399,1201,Infinity])assert(calculateTray(data,'MR',200,depth,500,2700).error);
assert(calculateTray(data,'MR',200,1050,500,199).error);
assert(calculateTray(data,'MR',200,1050,0,2700).error);
assert.equal(calculateTray(data,'MR',200,1050,100000,2700).recommended,null);
assert.equal(calculateTray(data,'MR',200,1050,35*13,2700).recommended.thickness,.6);
assert.equal(calculateTray(data,'MR',200,1050,35*13+.01,2700).recommended.thickness,.8);
const js=fs.readFileSync('client/tray-calculator.js','utf8').replace('__TRAY_DATA__',JSON.stringify(data)).replace('__TRAY_CALCULATE__',calculateTray.toString());
new vm.Script(js);
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync('client/rack-tray-selection.js','utf8').replace('__TRAY_DATA__',JSON.stringify(data)).replace('__TRAY_CALCULATE__',calculateTray.toString()),context);
const floor={trayWidth:200,load:500,traySelectionMode:'auto'};
context.window.RafexRackTray.update(floor,2700,1050);assert.equal(floor.trayThickness,.8);
floor.trayThickness=1.2;floor.traySelectionMode='manual';floor.load=700;
context.window.RafexRackTray.update(floor,2700,1050);assert.equal(floor.trayThickness,1.2);
floor.traySelectionMode='auto';context.window.RafexRackTray.update(floor,2700,1050);assert.equal(floor.trayThickness,.8);
floor.load=100000;context.window.RafexRackTray.update(floor,2700,1050);assert.equal(floor.trayThickness,0);
new vm.Script(fs.readFileSync('client/mr-tray-selection.js','utf8'));
console.log('PASS: 360 source capacities, MR/HR example, exact threshold, rounded depth, invalid inputs and overload.');

const accessory={trayWidth:200,load:500,traySelectionMode:'auto'};
const hrHtml=context.window.RafexRackTray.fields(accessory,0,2700,1050,false,'HR');
assert.equal(accessory.trayThickness,.6);
assert.ok(hrHtml.includes('HR tava seçimi'));
accessory.traySelectionMode='manual';accessory.trayThickness=1.2;
context.window.RafexRackTray.update(accessory,2700,1050,'HR');
assert.equal(accessory.trayThickness,1.2);
const mrFloor={trayWidth:200,load:500,traySelectionMode:'auto'};
assert.ok(context.window.RafexRackTray.fields(mrFloor,0,2700,1050,false).includes('MR tava seçimi'));
assert.equal(mrFloor.trayThickness,.8);
assert.ok(fs.readFileSync('client/b2b-accessories.js','utf8').includes("fields(f,index,clear,window.RafexRackTray.depth(),false,'HR')"));
console.log('Accessory HR and collection MR selection verified.');
