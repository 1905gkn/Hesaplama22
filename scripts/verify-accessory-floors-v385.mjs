import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {transformViewerSource} from './accessory-floors-v385.mjs';
const source=fs.readFileSync(process.argv[2]||'dist/b2b-viewer.patched.entry.js','utf8');assert.equal(transformViewerSource(source),source);
const env={window:{dispatchEvent(){}},CustomEvent:class{},THREE:{Vector3:class{constructor(x,y,z){Object.assign(this,{x,y,z})}}},console};vm.createContext(env);
vm.runInContext(source.replace(/^import .*;\s*$/gm,'')+'\nwindow.TestModel=B2BViewer;',env);
const model=Object.create(env.window.TestModel.prototype);model.options=model.normalizeOptions({levels:4,firstPalletPosition:'ground',accessories:[{type:'palletStop',levels:[0,2]},{type:'tray',levels:[3]}]});
assert.deepEqual(Array.from(model.options.accessories[0].levels),[0,2]);
model.traverseBottom=i=>1000+i*1300;model.traverseTop=i=>1125+i*1300;
const labels=[];model.addLine=()=>{};model.addPoint=()=>{};model.addDimensionLabel=(_l,_x,_y,height,text)=>labels.push({height,text});model.accessoryLabelledV385=new Set();
model.addVerticalDimension({},0,0,0,1000,'Z+TRAVERS · 1.000 mm',0);
assert(labels.at(-1).text.includes('Palet dayama'),'Ground stop alongside Z+TRAVERS');
model.addVerticalDimension({},0,0,1125,2300,'K1 – K2 · 1.175 mm',0);
model.addUnmeasuredAccessoryLabelsV385({},0,0);
const last=labels.find(l=>l.text==='K3\nTavalı');assert(last);assert.equal(last.height,source.includes('accessory-label-position-v389')?model.loadBottom(3)+model.palletHeightAt(3)/2:3725);assert(!last.text.includes('mm'));
assert(labels.some(l=>l.text==='K2\nPalet dayama'));assert.equal(labels.filter(l=>l.height===0||l.height===500).length,1);
model.options.dimensions.accessories=false;labels.length=0;model.accessoryLabelledV385=new Set();model.addUnmeasuredAccessoryLabelsV385({},0,0);assert.equal(labels.length,0);
model.options.dimensions.accessories=true;model.options.tunnelHeight=2400;model.accessoryLabelledV385=new Set();model.addUnmeasuredAccessoryLabelsV385({},0,0);assert(labels.every(l=>l.height>=2400));assert(labels.some(l=>l.text==='K3\nTavalı'));
model.options=model.normalizeOptions({levels:2,firstPalletPosition:'traverse',accessories:[{type:'hTraverse',levels:[1]}]});model.accessoryLabelledV385=new Set();labels.length=0;model.addVerticalDimension({},0,0,0,1000,'Z+TRAVERS · 1.000 mm',0);assert(labels[0].text.includes('H travers'));
// New captions use the same native sprite and user scaling as level labels.
assert(source.includes("this.addDimensionLabel(layer,x-380,y,floor.height")||source.includes("this.addDimensionLabel(layer,x-380,y,floor.labelHeight??floor.height"));assert(source.includes('const userScale=this.options.dimensionLabelScale||1'));
assert(source.includes('accessories: options.dimensions?.accessories !== false'));
model.options=model.normalizeOptions({levels:4,firstPalletPosition:'ground',accessories:[],collectionFloors:[]});model.accessoryLabelledV385=new Set();labels.length=0;model.addUnmeasuredAccessoryLabelsV385({},0,0);assert.equal(labels.length,0,'No accessory means no extra floor caption');
assert(!source.includes('Aksesuar yok'),'Empty captions are absent from the screen/PDF renderer');
console.log('v385: real normalized ground stop, Z+TRAVERS caption, missing last-floor captions without mm, no duplicate ground label, hide toggle, tunnel filtering and shared text scaling passed');

