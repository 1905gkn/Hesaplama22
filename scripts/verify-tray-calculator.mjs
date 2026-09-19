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

assert.equal(context.window.RafexRackTray.canSave({trayWidth:200,load:500},2700,1050,'HR'),true);
assert.equal(context.window.RafexRackTray.canSave({trayWidth:200,load:100000,trayThickness:2,traySelectionMode:'manual'},2700,1050,'HR'),false);
assert.equal(context.window.RafexRackTray.canSave({trayWidth:200,load:500},2700,1300,'HR'),false);
let saves=0,alerts=0;
const guardContext={window:{RafexRackTray:context.window.RafexRackTray},m2ActiveModule:'b2b',document:{querySelector:()=>null,getElementById:()=>null},b2b3DOptions:()=>({palletWidth:800,palletCount:3}),b2bPalletGeometry:()=>({sectionWidth:2700}),b2bReadInputState:()=>({accessories:[{type:'tray',width:200,load:100000,thickness:2,traySelectionMode:'manual'}]}),m2SaveRackType:()=>{saves++},alert:()=>{alerts++}};
guardContext.window.RafexRackTray.depth=()=>1050;
vm.runInNewContext(fs.readFileSync('client/tray-save-guard.js','utf8'),guardContext);
guardContext.m2SaveRackType();assert.equal(saves,0);assert.equal(alerts,1);
guardContext.b2bReadInputState=()=>({accessories:[{type:'tray',width:200,load:500}]});guardContext.m2SaveRackType();assert.equal(saves,1);
guardContext.b2bReadInputState=()=>({accessories:[],collectionLevels:{enabled:true,floors:[{trayWidth:200,load:500}]}});guardContext.m2SaveRackType();assert.equal(saves,2);
guardContext.b2bReadInputState=()=>({accessories:[],collectionLevels:{enabled:true,floors:[{trayWidth:200,load:100000}]}});guardContext.m2SaveRackType();assert.equal(saves,2);assert.equal(alerts,2);
console.log('PASS: missing recommendation blocks save even with manual thickness; valid recommendation permits save.');

for(const kind of ['MR','HR'])for(const custom of [false,true]){
 const item={trayWidth:200,load:500,traySelectionMode:'auto'};
 const product=()=>context.window.RafexRackTray.fields(item,0,2700,1050,custom,kind).match(/<select[^>]*"trayThickness"[^>]*>[\s\S]*?<\/select>/)[0];
 let control=product();assert.match(control,/ disabled/);assert.equal((control.match(/<option/g)||[]).length,1);assert.match(control,/Önerilen/);
 item.traySelectionMode='manual';control=product();assert.ok(!control.includes('disabled'));assert.equal((control.match(/<option/g)||[]).length,7);
 item.trayThickness=1.5;product();assert.equal(item.trayThickness,1.5);
 item.traySelectionMode='auto';product();assert.equal(item.trayThickness,kind==='HR'?.6:.8);
 item.load=100000;control=product();assert.match(control,/Tabloda öneri yok/);assert.equal((control.match(/<option/g)||[]).length,1);
}
console.log('PASS: automatic shows one locked recommendation; manual opens alternatives; automatic restores recommendation.');
